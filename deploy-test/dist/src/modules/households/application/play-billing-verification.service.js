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
var PlayBillingVerificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayBillingVerificationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const googleapis_1 = require("googleapis");
const google_play_credentials_loader_1 = require("../../../shared/billing/google-play-credentials.loader");
const household_schemas_1 = require("../infrastructure/household.schemas");
let PlayBillingVerificationService = PlayBillingVerificationService_1 = class PlayBillingVerificationService {
    config;
    logger = new common_1.Logger(PlayBillingVerificationService_1.name);
    androidPublisher = null;
    constructor(config) {
        this.config = config;
    }
    getClient() {
        if (this.androidPublisher) {
            return this.androidPublisher;
        }
        let credentials;
        try {
            credentials = (0, google_play_credentials_loader_1.loadGooglePlayServiceAccountCredentials)({
                serviceAccountJsonBase64: this.config.get('googlePlay.serviceAccountJsonBase64'),
                serviceAccountJson: this.config.get('googlePlay.serviceAccountJson'),
            });
        }
        catch (error) {
            if (error instanceof google_play_credentials_loader_1.GooglePlayCredentialsError) {
                throw new common_1.InternalServerErrorException(error.code);
            }
            this.logger.error('Failed to load Google Play service account credentials');
            throw new common_1.InternalServerErrorException('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_INVALID');
        }
        const auth = new googleapis_1.google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/androidpublisher'],
        });
        this.androidPublisher = googleapis_1.google.androidpublisher({ version: 'v3', auth });
        return this.androidPublisher;
    }
    async verifySubscriptionV2(purchaseToken) {
        const packageName = this.config.get('googlePlay.packageName');
        if (!packageName) {
            throw new common_1.InternalServerErrorException('GOOGLE_PLAY_PACKAGE_NAME_NOT_CONFIGURED');
        }
        const client = this.getClient();
        const response = await client.purchases.subscriptionsv2.get({
            packageName,
            token: purchaseToken,
        });
        const data = response.data;
        const lineItem = data.lineItems?.[0];
        if (!lineItem?.expiryTime) {
            throw new common_1.BadRequestException('INVALID_PURCHASE');
        }
        const expiryTimeMillis = new Date(lineItem.expiryTime).getTime();
        if (Number.isNaN(expiryTimeMillis)) {
            throw new common_1.BadRequestException('INVALID_PURCHASE');
        }
        return {
            expiryTimeMillis,
            autoRenewing: lineItem.autoRenewingPlan?.autoRenewEnabled ?? false,
            orderId: data.latestOrderId ?? '',
            productId: lineItem.productId ?? '',
            subscriptionState: data.subscriptionState ?? '',
        };
    }
    async verifySubscription(purchaseToken, productId) {
        try {
            const v2 = await this.verifySubscriptionV2(purchaseToken);
            if (v2.productId && v2.productId !== productId) {
                throw new common_1.BadRequestException('PRODUCT_ID_MISMATCH');
            }
            return {
                expiryTimeMillis: v2.expiryTimeMillis,
                autoRenewing: v2.autoRenewing,
                orderId: v2.orderId,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.warn('subscriptionsv2.get failed; falling back to subscriptions.get', error);
        }
        const packageName = this.config.get('googlePlay.packageName');
        if (!packageName) {
            throw new common_1.InternalServerErrorException('GOOGLE_PLAY_PACKAGE_NAME_NOT_CONFIGURED');
        }
        const client = this.getClient();
        const response = await client.purchases.subscriptions.get({
            packageName,
            subscriptionId: productId,
            token: purchaseToken,
        });
        const data = response.data;
        if (!data.expiryTimeMillis) {
            throw new common_1.BadRequestException('INVALID_PURCHASE');
        }
        return {
            expiryTimeMillis: Number(data.expiryTimeMillis),
            autoRenewing: data.autoRenewing ?? false,
            orderId: data.orderId ?? '',
            paymentState: data.paymentState ?? undefined,
        };
    }
    productIdToPlanType(productId) {
        if (productId === household_schemas_1.PLAY_PRODUCT_PERSONAL) {
            return household_schemas_1.PLAN_TYPE.PERSONAL;
        }
        if (productId === household_schemas_1.PLAY_PRODUCT_FAMILY) {
            return household_schemas_1.PLAN_TYPE.FAMILY;
        }
        throw new common_1.BadRequestException('UNKNOWN_PRODUCT_ID');
    }
};
exports.PlayBillingVerificationService = PlayBillingVerificationService;
exports.PlayBillingVerificationService = PlayBillingVerificationService = PlayBillingVerificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PlayBillingVerificationService);
