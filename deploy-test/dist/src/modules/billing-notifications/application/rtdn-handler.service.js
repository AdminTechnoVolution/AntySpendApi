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
var RtdnHandlerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RtdnHandlerService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const entitlements_service_1 = require("../../households/application/entitlements.service");
const billing_notification_event_schema_1 = require("../infrastructure/billing-notification-event.schema");
const rtdn_decoder_service_1 = require("./rtdn-decoder.service");
let RtdnHandlerService = RtdnHandlerService_1 = class RtdnHandlerService {
    decoder;
    entitlementsService;
    eventModel;
    logger = new common_1.Logger(RtdnHandlerService_1.name);
    constructor(decoder, entitlementsService, eventModel) {
        this.decoder = decoder;
        this.entitlementsService = entitlementsService;
        this.eventModel = eventModel;
    }
    async handlePush(body) {
        const { messageId, notification } = this.decoder.decodePushBody(body);
        const inserted = await this.tryRecordEvent({
            messageId,
            purchaseToken: notification.subscriptionNotification?.purchaseToken,
            notificationType: notification.subscriptionNotification?.notificationType,
            rawPayload: body,
        });
        if (!inserted) {
            this.logger.log(`Duplicate RTDN message ${messageId}, skipping`);
            return;
        }
        const subNotification = notification.subscriptionNotification;
        if (!subNotification?.purchaseToken || !subNotification.subscriptionId) {
            this.logger.log(`RTDN message ${messageId} has no subscriptionNotification; recorded only`);
            return;
        }
        await this.entitlementsService.syncEntitlementFromPlayByToken(subNotification.purchaseToken, subNotification.subscriptionId, subNotification.notificationType);
    }
    async tryRecordEvent(params) {
        try {
            await this.eventModel.create({
                messageId: params.messageId,
                purchaseToken: params.purchaseToken,
                notificationType: params.notificationType,
                processedAtMillis: Date.now(),
                rawPayload: params.rawPayload,
            });
            return true;
        }
        catch (error) {
            if (this.isDuplicateKeyError(error)) {
                return false;
            }
            throw error;
        }
    }
    isDuplicateKeyError(error) {
        return (typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 11000);
    }
};
exports.RtdnHandlerService = RtdnHandlerService;
exports.RtdnHandlerService = RtdnHandlerService = RtdnHandlerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, mongoose_1.InjectModel)(billing_notification_event_schema_1.BillingNotificationEvent.name)),
    __metadata("design:paramtypes", [rtdn_decoder_service_1.RtdnDecoderService,
        entitlements_service_1.EntitlementsService,
        mongoose_2.Model])
], RtdnHandlerService);
