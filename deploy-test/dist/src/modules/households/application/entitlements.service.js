"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EntitlementsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntitlementsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const household_schemas_1 = require("../infrastructure/household.schemas");
const rtdn_constants_1 = require("../../../shared/billing/rtdn.constants");
const play_billing_verification_service_1 = require("./play-billing-verification.service");
let EntitlementsService = EntitlementsService_1 = class EntitlementsService {
    entitlementModel;
    playBilling;
    config;
    logger = new common_1.Logger(EntitlementsService_1.name);
    constructor(entitlementModel, playBilling, config) {
        this.entitlementModel = entitlementModel;
        this.playBilling = playBilling;
        this.config = config;
    }
    isActive(doc) {
        if (doc.status !== household_schemas_1.ENTITLEMENT_STATUS.ACTIVE) {
            return false;
        }
        if (doc.expiresAtMillis != null &&
            doc.expiresAtMillis <= Date.now()) {
            return false;
        }
        return true;
    }
    async getPlanType(userId) {
        const doc = await this.entitlementModel.findOne({ userId }).lean();
        if (!doc || !this.isActive(doc)) {
            return null;
        }
        return doc.planType;
    }
    async requireFamilyPlan(userId) {
        const planType = await this.getPlanType(userId);
        if (planType !== household_schemas_1.PLAN_TYPE.FAMILY) {
            throw new common_1.ForbiddenException('FAMILY_PLAN_REQUIRED');
        }
    }
    async getMyEntitlement(userId) {
        const doc = await this.entitlementModel.findOne({ userId }).lean();
        if (!doc) {
            return this.emptyEntitlement(userId);
        }
        return this.toEntitlementResponse(doc);
    }
    async verifyPurchase(userId, productId, purchaseToken, packageName) {
        const verified = await this.playBilling.verifySubscription(purchaseToken, productId);
        const planType = this.playBilling.productIdToPlanType(productId);
        const resolvedPackageName = packageName ?? this.config.get('googlePlay.packageName') ?? '';
        const now = Date.now();
        const expiresAtMillis = verified.expiryTimeMillis;
        const status = expiresAtMillis > now
            ? household_schemas_1.ENTITLEMENT_STATUS.ACTIVE
            : household_schemas_1.ENTITLEMENT_STATUS.EXPIRED;
        const doc = await this.entitlementModel
            .findOneAndUpdate({ userId }, {
            $set: {
                planType,
                source: household_schemas_1.ENTITLEMENT_SOURCE.PLAY_STORE,
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
        }, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true })
            .lean();
        return this.toEntitlementResponse(doc);
    }
    async syncEntitlementFromPlayByToken(purchaseToken, productId, notificationType) {
        const existing = await this.entitlementModel
            .findOne({ googlePlayPurchaseToken: purchaseToken })
            .lean();
        if (!existing) {
            this.logger.log(`No entitlement for purchaseToken; skipping RTDN sync (await verify-purchase)`);
            return;
        }
        const verified = await this.playBilling.verifySubscriptionV2(purchaseToken);
        const resolvedProductId = verified.productId || productId;
        const planType = this.playBilling.productIdToPlanType(resolvedProductId);
        const now = Date.now();
        const expiresAtMillis = verified.expiryTimeMillis;
        const status = this.resolveStatusFromRtdn(notificationType, expiresAtMillis, verified.subscriptionState, now);
        await this.entitlementModel.updateOne({ googlePlayPurchaseToken: purchaseToken }, {
            $set: {
                planType,
                status,
                googlePlayProductId: resolvedProductId,
                googlePlayOrderId: verified.orderId,
                autoRenewing: verified.autoRenewing,
                expiresAtMillis,
                updatedAtMillis: now,
            },
        });
    }
    resolveStatusFromRtdn(notificationType, expiresAtMillis, subscriptionState, now) {
        const notExpired = expiresAtMillis > now;
        switch (notificationType) {
            case rtdn_constants_1.RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_CANCELED:
                return notExpired
                    ? household_schemas_1.ENTITLEMENT_STATUS.CANCELED
                    : household_schemas_1.ENTITLEMENT_STATUS.EXPIRED;
            case rtdn_constants_1.RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_EXPIRED:
            case rtdn_constants_1.RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_REVOKED:
                return household_schemas_1.ENTITLEMENT_STATUS.EXPIRED;
            case rtdn_constants_1.RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_PURCHASED:
            case rtdn_constants_1.RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_RENEWED:
            case rtdn_constants_1.RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_RECOVERED:
            case rtdn_constants_1.RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_RESTARTED:
                return notExpired
                    ? household_schemas_1.ENTITLEMENT_STATUS.ACTIVE
                    : household_schemas_1.ENTITLEMENT_STATUS.EXPIRED;
            case rtdn_constants_1.RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_IN_GRACE_PERIOD:
            case rtdn_constants_1.RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_ON_HOLD:
            case rtdn_constants_1.RTDN_NOTIFICATION_TYPE.SUBSCRIPTION_PAUSED:
                return this.statusFromPlaySubscriptionState(subscriptionState, expiresAtMillis, now);
            default:
                return this.statusFromPlaySubscriptionState(subscriptionState, expiresAtMillis, now);
        }
    }
    statusFromPlaySubscriptionState(subscriptionState, expiresAtMillis, now) {
        const notExpired = expiresAtMillis > now;
        switch (subscriptionState) {
            case 'SUBSCRIPTION_STATE_ACTIVE':
                return notExpired ? household_schemas_1.ENTITLEMENT_STATUS.ACTIVE : household_schemas_1.ENTITLEMENT_STATUS.EXPIRED;
            case 'SUBSCRIPTION_STATE_CANCELED':
                return notExpired
                    ? household_schemas_1.ENTITLEMENT_STATUS.CANCELED
                    : household_schemas_1.ENTITLEMENT_STATUS.EXPIRED;
            case 'SUBSCRIPTION_STATE_EXPIRED':
                return household_schemas_1.ENTITLEMENT_STATUS.EXPIRED;
            case 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD':
            case 'SUBSCRIPTION_STATE_ON_HOLD':
            case 'SUBSCRIPTION_STATE_PAUSED':
                return notExpired ? household_schemas_1.ENTITLEMENT_STATUS.ACTIVE : household_schemas_1.ENTITLEMENT_STATUS.EXPIRED;
            default:
                return notExpired ? household_schemas_1.ENTITLEMENT_STATUS.ACTIVE : household_schemas_1.ENTITLEMENT_STATUS.EXPIRED;
        }
    }
    emptyEntitlement(userId) {
        return {
            userId,
            planType: null,
            status: household_schemas_1.ENTITLEMENT_STATUS.NONE,
            expiresAtMillis: null,
            productId: null,
            source: null,
            active: false,
            autoRenewing: null,
        };
    }
    toEntitlementResponse(doc) {
        const active = this.isActive(doc);
        return {
            userId: doc.userId,
            planType: active ? doc.planType : null,
            status: doc.status ?? household_schemas_1.ENTITLEMENT_STATUS.NONE,
            expiresAtMillis: doc.expiresAtMillis ?? null,
            productId: doc.googlePlayProductId ?? null,
            source: doc.source ?? null,
            active,
            autoRenewing: doc.autoRenewing ?? null,
        };
    }
};
exports.EntitlementsService = EntitlementsService;
exports.EntitlementsService = EntitlementsService = EntitlementsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(household_schemas_1.UserEntitlement.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        play_billing_verification_service_1.PlayBillingVerificationService,
        config_1.ConfigService])
], EntitlementsService);
