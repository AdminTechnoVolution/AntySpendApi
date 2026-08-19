import {
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ENTITLEMENT_SOURCE,
  ENTITLEMENT_STATUS,
  Household,
  HouseholdDocument,
  HouseholdMember,
  HouseholdMemberDocument,
  MEMBER_STATUS,
  PLAN_TYPE,
  UserEntitlement,
  UserEntitlementDocument,
} from '../infrastructure/household.schemas';
import { RTDN_NOTIFICATION_TYPE } from '../../../shared/billing/rtdn.constants';
import {
  AI_FREE_MONTHLY_QUOTA,
  currentUtcMonthKey,
  startOfNextUtcMonthMillis,
} from '../../../shared/billing/ai-quota.util';
import { PlayBillingVerificationService } from './play-billing-verification.service';

type EntitlementLean = {
  userId: string;
  planType: string;
  status?: string;
  source: string;
  expiresAtMillis?: number;
  googlePlayProductId?: string;
  autoRenewing?: boolean;
  aiFreeUsageCount?: number;
  aiFreeUsageMonthKey?: string;
};

@Injectable()
export class EntitlementsService {
  private readonly logger = new Logger(EntitlementsService.name);

  constructor(
    @InjectModel(UserEntitlement.name)
    private readonly entitlementModel: Model<UserEntitlementDocument>,
    @InjectModel(HouseholdMember.name)
    private readonly memberModel: Model<HouseholdMemberDocument>,
    @InjectModel(Household.name)
    private readonly householdModel: Model<HouseholdDocument>,
    private readonly playBilling: PlayBillingVerificationService,
    private readonly config: ConfigService,
  ) {}

  isActive(doc: EntitlementLean): boolean {
    if (doc.status !== ENTITLEMENT_STATUS.ACTIVE) {
      return false;
    }
    if (
      doc.expiresAtMillis != null &&
      doc.expiresAtMillis <= Date.now()
    ) {
      return false;
    }
    return true;
  }

  async getPlanType(userId: string): Promise<string | null> {
    const doc = await this.entitlementModel.findOne({ userId }).lean();
    if (!doc || !this.isActive(doc)) {
      return null;
    }
    return doc.planType;
  }

  async hasActiveFamilyPlan(userId: string): Promise<boolean> {
    const doc = await this.entitlementModel.findOne({ userId }).lean();
    if (!doc || !this.isActive(doc)) {
      return false;
    }
    return doc.planType === PLAN_TYPE.FAMILY;
  }

  async requireFamilyPlan(userId: string): Promise<void> {
    const planType = await this.getPlanType(userId);
    if (planType !== PLAN_TYPE.FAMILY) {
      throw new ForbiddenException('FAMILY_PLAN_REQUIRED');
    }
  }

  async getMyEntitlement(userId: string) {
    if (this.isDevUnlockEnabled()) {
      return this.devUnlockedEntitlement(userId);
    }
    const doc = await this.entitlementModel.findOne({ userId }).lean();
    const base = !doc
      ? this.emptyEntitlement(userId)
      : this.toEntitlementResponse(doc);
    const premiumFlags = await this.resolvePremiumAccess(userId, base.active);
    return { ...base, ...premiumFlags };
  }

  /**
   * Local-testing escape hatch: with DEV_UNLOCK_PREMIUM=true on a non-production instance,
   * every authenticated user gets a synthetic active Family entitlement so premium features
   * (cloud sync, household/family) can be exercised against localhost without a real Play
   * purchase. Never persisted, never honored when NODE_ENV=production.
   */
  private isDevUnlockEnabled(): boolean {
    const nodeEnv = this.config.get<string>('NODE_ENV');
    return nodeEnv !== 'production' && this.config.get<boolean>('devUnlockPremium') === true;
  }

  private devUnlockedEntitlement(userId: string) {
    this.logger.warn(
      `DEV_UNLOCK_PREMIUM active — returning synthetic Family entitlement for userId=${userId}. Never enable in production.`,
    );
    return {
      userId,
      planType: PLAN_TYPE.FAMILY,
      status: ENTITLEMENT_STATUS.ACTIVE,
      expiresAtMillis: Date.now() + 365 * 24 * 60 * 60 * 1000,
      productId: 'antyspend_family_monthly',
      source: 'DEV_LOCAL',
      active: true,
      autoRenewing: true,
      premiumAccessActive: true,
      familyPlanBeneficiary: false,
      aiFreeUsageUsed: 0,
      aiFreeUsageLimit: AI_FREE_MONTHLY_QUOTA,
      aiFreeUsageResetsAtMillis: startOfNextUtcMonthMillis(),
    };
  }

  /**
   * Normalizes the caller's free-AI-usage counter to the current UTC calendar month, writing a
   * reset only when the stored month doesn't match (idempotent — concurrent resets write the
   * same values, no lost updates). Does NOT increment; see recordFreeAiUsage.
   */
  async getOrResetMonthlyAiUsage(
    userId: string,
  ): Promise<{ count: number; monthKey: string }> {
    const monthKey = currentUtcMonthKey();

    await this.entitlementModel.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: {
          userId,
          planType: PLAN_TYPE.PERSONAL,
          status: ENTITLEMENT_STATUS.NONE,
          source: ENTITLEMENT_SOURCE.PLAY_STORE,
          createdAtMillis: Date.now(),
          updatedAtMillis: Date.now(),
        },
      },
      { upsert: true, setDefaultsOnInsert: true },
    );

    const reset = await this.entitlementModel.findOneAndUpdate(
      { userId, aiFreeUsageMonthKey: { $ne: monthKey } },
      {
        $set: {
          aiFreeUsageMonthKey: monthKey,
          aiFreeUsageCount: 0,
          updatedAtMillis: Date.now(),
        },
      },
      { new: true },
    );
    if (reset) {
      return { count: 0, monthKey };
    }

    const doc = await this.entitlementModel.findOne({ userId }).lean();
    return { count: doc?.aiFreeUsageCount ?? 0, monthKey };
  }

  /**
   * Records one free AI use for the given month. Callers must pass the monthKey captured at the
   * start of the request (from getOrResetMonthlyAiUsage) so a month rollover mid-request can't
   * silently credit the new month's quota instead of the one that was actually checked.
   */
  async recordFreeAiUsage(userId: string, monthKey: string): Promise<void> {
    await this.entitlementModel.updateOne(
      { userId, aiFreeUsageMonthKey: monthKey },
      { $inc: { aiFreeUsageCount: 1 }, $set: { updatedAtMillis: Date.now() } },
    );
  }

  private async resolvePremiumAccess(
    userId: string,
    ownActive: boolean,
  ): Promise<{
    premiumAccessActive: boolean;
    familyPlanBeneficiary: boolean;
  }> {
    if (ownActive) {
      return { premiumAccessActive: true, familyPlanBeneficiary: false };
    }

    const membership = await this.memberModel
      .findOne({ userId, status: MEMBER_STATUS.ACTIVE })
      .lean();
    if (!membership) {
      return { premiumAccessActive: false, familyPlanBeneficiary: false };
    }

    const household = await this.householdModel
      .findOne({ id: membership.householdId })
      .lean();
    if (!household) {
      return { premiumAccessActive: false, familyPlanBeneficiary: false };
    }

    const ownerActive = await this.hasActiveFamilyPlan(household.ownerUserId);
    return {
      premiumAccessActive: ownerActive,
      familyPlanBeneficiary: ownerActive,
    };
  }

  async verifyPurchase(
    userId: string,
    productId: string,
    purchaseToken: string,
    packageName?: string,
  ) {
    const verified = await this.playBilling.verifySubscription(
      purchaseToken,
      productId,
    );
    const planType = this.playBilling.productIdToPlanType(productId);
    const resolvedPackageName =
      packageName ?? this.config.get<string>('googlePlay.packageName') ?? '';

    const now = Date.now();
    const expiresAtMillis = verified.expiryTimeMillis;
    const status = this.statusFromExpiryAndRenewal(
      expiresAtMillis,
      verified.autoRenewing,
      now,
    );

    const doc = await this.entitlementModel
      .findOneAndUpdate(
        { userId },
        {
          $set: {
            planType,
            source: ENTITLEMENT_SOURCE.PLAY_STORE,
            status,
            googlePlayProductId: productId,
            googlePlayPurchaseToken: purchaseToken,
            googlePlayOrderId: verified.orderId,
            packageName: resolvedPackageName,
            autoRenewing: verified.autoRenewing,
            expiresAtMillis,
            updatedAtMillis: now,
          },
          $setOnInsert: {
            userId,
            createdAtMillis: now,
          },
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
      )
      .lean();

    return this.toEntitlementResponse(doc!);
  }

  async syncEntitlementFromPlayByToken(
    purchaseToken: string,
    productId: string,
    notificationType?: number,
  ): Promise<void> {
    const existing = await this.entitlementModel
      .findOne({ googlePlayPurchaseToken: purchaseToken })
      .lean();

    const verified = await this.playBilling.verifySubscriptionV2(purchaseToken);
    const resolvedProductId = verified.productId || productId;
    const planType = this.playBilling.productIdToPlanType(resolvedProductId);
    const now = Date.now();
    const expiresAtMillis = verified.expiryTimeMillis;
    const status = this.resolveStatusFromRtdn(
      notificationType,
      expiresAtMillis,
      verified.subscriptionState,
      verified.autoRenewing,
      now,
    );

    if (!existing) {
      // No entitlement yet for this purchase token — this is the case where the client never
      // completed verify-purchase (app closed/crashed right after buying, offline, etc). Without
      // an obfuscatedAccountId set at purchase time we still can't attribute this purchase to a
      // user, so there is nothing safe to create; verify-purchase (or its background retry) is
      // still the path that resolves it. When the account id IS present, RTDN becomes a genuine
      // fallback and creates the entitlement itself.
      const userId = verified.obfuscatedExternalAccountId;
      if (!userId) {
        this.logger.log(
          'No entitlement for purchaseToken and no obfuscatedAccountId on the purchase; skipping RTDN sync (await verify-purchase)',
        );
        return;
      }
      await this.entitlementModel.updateOne(
        { userId },
        {
          $set: {
            planType,
            source: ENTITLEMENT_SOURCE.PLAY_STORE,
            status,
            googlePlayProductId: resolvedProductId,
            googlePlayPurchaseToken: purchaseToken,
            googlePlayOrderId: verified.orderId,
            autoRenewing: verified.autoRenewing,
            expiresAtMillis,
            updatedAtMillis: now,
          },
          $setOnInsert: {
            userId,
            createdAtMillis: now,
          },
        },
        { upsert: true },
      );
      return;
    }

    await this.entitlementModel.updateOne(
      { googlePlayPurchaseToken: purchaseToken },
      {
        $set: {
          planType,
          status,
          googlePlayProductId: resolvedProductId,
          googlePlayOrderId: verified.orderId,
          autoRenewing: verified.autoRenewing,
          expiresAtMillis,
          updatedAtMillis: now,
        },
      },
    );
  }

  private resolveStatusFromRtdn(
    notificationType: number | undefined,
    expiresAtMillis: number,
    subscriptionState: string,
    autoRenewing: boolean,
    now: number,
  ): string {
    const notExpired = expiresAtMillis > now;

    switch (notificationType) {
      case RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_CANCELED:
        return notExpired
          ? ENTITLEMENT_STATUS.CANCELED
          : ENTITLEMENT_STATUS.EXPIRED;
      case RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_EXPIRED:
      case RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_REVOKED:
        return ENTITLEMENT_STATUS.EXPIRED;
      case RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_PURCHASED:
      case RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_RENEWED:
      case RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_RECOVERED:
      case RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_RESTARTED:
        return this.statusFromExpiryAndRenewal(
          expiresAtMillis,
          autoRenewing,
          now,
        );
      case RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_IN_GRACE_PERIOD:
      case RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_ON_HOLD:
      case RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_PAUSED:
        return this.statusFromPlaySubscriptionState(
          subscriptionState,
          expiresAtMillis,
          autoRenewing,
          now,
        );
      default:
        return this.statusFromPlaySubscriptionState(
          subscriptionState,
          expiresAtMillis,
          autoRenewing,
          now,
        );
    }
  }

  private statusFromPlaySubscriptionState(
    subscriptionState: string,
    expiresAtMillis: number,
    autoRenewing: boolean,
    now: number,
  ): string {
    const notExpired = expiresAtMillis > now;

    switch (subscriptionState) {
      case 'SUBSCRIPTION_STATE_ACTIVE':
        return this.statusFromExpiryAndRenewal(
          expiresAtMillis,
          autoRenewing,
          now,
        );
      case 'SUBSCRIPTION_STATE_CANCELED':
        return notExpired
          ? ENTITLEMENT_STATUS.CANCELED
          : ENTITLEMENT_STATUS.EXPIRED;
      case 'SUBSCRIPTION_STATE_EXPIRED':
        return ENTITLEMENT_STATUS.EXPIRED;
      case 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD':
      case 'SUBSCRIPTION_STATE_ON_HOLD':
      case 'SUBSCRIPTION_STATE_PAUSED':
        return this.statusFromExpiryAndRenewal(
          expiresAtMillis,
          autoRenewing,
          now,
        );
      default:
        return this.statusFromExpiryAndRenewal(
          expiresAtMillis,
          autoRenewing,
          now,
        );
    }
  }

  private statusFromExpiryAndRenewal(
    expiresAtMillis: number,
    autoRenewing: boolean,
    now: number,
  ): string {
    if (expiresAtMillis <= now) {
      return ENTITLEMENT_STATUS.EXPIRED;
    }
    return autoRenewing
      ? ENTITLEMENT_STATUS.ACTIVE
      : ENTITLEMENT_STATUS.CANCELED;
  }

  private emptyEntitlement(userId: string) {
    return {
      userId,
      planType: null,
      status: ENTITLEMENT_STATUS.NONE,
      expiresAtMillis: null,
      productId: null,
      source: null,
      active: false,
      autoRenewing: null,
      premiumAccessActive: false,
      familyPlanBeneficiary: false,
      aiFreeUsageUsed: 0,
      aiFreeUsageLimit: AI_FREE_MONTHLY_QUOTA,
      aiFreeUsageResetsAtMillis: startOfNextUtcMonthMillis(),
    };
  }

  private toEntitlementResponse(doc: EntitlementLean) {
    const active = this.isActive(doc);
    return {
      userId: doc.userId,
      planType:
        active || doc.status === ENTITLEMENT_STATUS.CANCELED
          ? doc.planType
          : null,
      status: doc.status ?? ENTITLEMENT_STATUS.NONE,
      expiresAtMillis: doc.expiresAtMillis ?? null,
      productId: doc.googlePlayProductId ?? null,
      source: doc.source ?? null,
      active,
      autoRenewing: doc.autoRenewing ?? null,
      // Read-only projection — never writes the reset here, this runs on every GET /entitlements/me.
      aiFreeUsageUsed:
        doc.aiFreeUsageMonthKey === currentUtcMonthKey()
          ? (doc.aiFreeUsageCount ?? 0)
          : 0,
      aiFreeUsageLimit: AI_FREE_MONTHLY_QUOTA,
      aiFreeUsageResetsAtMillis: startOfNextUtcMonthMillis(),
    };
  }
}
