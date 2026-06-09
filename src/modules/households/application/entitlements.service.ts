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
import { PlayBillingVerificationService } from './play-billing-verification.service';

type EntitlementLean = {
  userId: string;
  planType: string;
  status?: string;
  source: string;
  expiresAtMillis?: number;
  googlePlayProductId?: string;
  autoRenewing?: boolean;
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
    const doc = await this.entitlementModel.findOne({ userId }).lean();
    const base = !doc
      ? this.emptyEntitlement(userId)
      : this.toEntitlementResponse(doc);
    const premiumFlags = await this.resolvePremiumAccess(userId, base.active);
    return { ...base, ...premiumFlags };
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
    const status =
      expiresAtMillis > now
        ? ENTITLEMENT_STATUS.ACTIVE
        : ENTITLEMENT_STATUS.EXPIRED;

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
    if (!existing) {
      this.logger.log(
        `No entitlement for purchaseToken; skipping RTDN sync (await verify-purchase)`,
      );
      return;
    }

    const verified = await this.playBilling.verifySubscriptionV2(purchaseToken);
    const resolvedProductId = verified.productId || productId;
    const planType = this.playBilling.productIdToPlanType(resolvedProductId);
    const now = Date.now();
    const expiresAtMillis = verified.expiryTimeMillis;
    const status = this.resolveStatusFromRtdn(
      notificationType,
      expiresAtMillis,
      verified.subscriptionState,
      now,
    );

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
        return notExpired
          ? ENTITLEMENT_STATUS.ACTIVE
          : ENTITLEMENT_STATUS.EXPIRED;
      case RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_IN_GRACE_PERIOD:
      case RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_ON_HOLD:
      case RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_PAUSED:
        return this.statusFromPlaySubscriptionState(
          subscriptionState,
          expiresAtMillis,
          now,
        );
      default:
        return this.statusFromPlaySubscriptionState(
          subscriptionState,
          expiresAtMillis,
          now,
        );
    }
  }

  private statusFromPlaySubscriptionState(
    subscriptionState: string,
    expiresAtMillis: number,
    now: number,
  ): string {
    const notExpired = expiresAtMillis > now;

    switch (subscriptionState) {
      case 'SUBSCRIPTION_STATE_ACTIVE':
        return notExpired ? ENTITLEMENT_STATUS.ACTIVE : ENTITLEMENT_STATUS.EXPIRED;
      case 'SUBSCRIPTION_STATE_CANCELED':
        return notExpired
          ? ENTITLEMENT_STATUS.CANCELED
          : ENTITLEMENT_STATUS.EXPIRED;
      case 'SUBSCRIPTION_STATE_EXPIRED':
        return ENTITLEMENT_STATUS.EXPIRED;
      case 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD':
      case 'SUBSCRIPTION_STATE_ON_HOLD':
      case 'SUBSCRIPTION_STATE_PAUSED':
        return notExpired ? ENTITLEMENT_STATUS.ACTIVE : ENTITLEMENT_STATUS.EXPIRED;
      default:
        return notExpired ? ENTITLEMENT_STATUS.ACTIVE : ENTITLEMENT_STATUS.EXPIRED;
    }
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
    };
  }

  private toEntitlementResponse(doc: EntitlementLean) {
    const active = this.isActive(doc);
    return {
      userId: doc.userId,
      planType: active ? doc.planType : null,
      status: doc.status ?? ENTITLEMENT_STATUS.NONE,
      expiresAtMillis: doc.expiresAtMillis ?? null,
      productId: doc.googlePlayProductId ?? null,
      source: doc.source ?? null,
      active,
      autoRenewing: doc.autoRenewing ?? null,
    };
  }
}
