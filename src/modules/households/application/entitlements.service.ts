import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ENTITLEMENT_SOURCE,
  ENTITLEMENT_STATUS,
  PLAN_TYPE,
  UserEntitlement,
  UserEntitlementDocument,
} from '../infrastructure/household.schemas';
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
  constructor(
    @InjectModel(UserEntitlement.name)
    private readonly entitlementModel: Model<UserEntitlementDocument>,
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

  async requireFamilyPlan(userId: string): Promise<void> {
    const planType = await this.getPlanType(userId);
    if (planType !== PLAN_TYPE.FAMILY) {
      throw new ForbiddenException('FAMILY_PLAN_REQUIRED');
    }
  }

  async getMyEntitlement(userId: string) {
    const doc = await this.entitlementModel.findOne({ userId }).lean();
    if (!doc) {
      return this.emptyEntitlement(userId);
    }
    return this.toEntitlementResponse(doc);
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
