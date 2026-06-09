"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingNotificationsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const households_module_1 = require("../households/households.module");
const pubsub_push_auth_guard_1 = require("./application/pubsub-push-auth.guard");
const rtdn_decoder_service_1 = require("./application/rtdn-decoder.service");
const rtdn_handler_service_1 = require("./application/rtdn-handler.service");
const billing_notification_event_schema_1 = require("./infrastructure/billing-notification-event.schema");
const google_play_rtdn_controller_1 = require("./presentation/google-play-rtdn.controller");
let BillingNotificationsModule = class BillingNotificationsModule {
};
exports.BillingNotificationsModule = BillingNotificationsModule;
exports.BillingNotificationsModule = BillingNotificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            households_module_1.HouseholdsModule,
            mongoose_1.MongooseModule.forFeature([
                {
                    name: billing_notification_event_schema_1.BillingNotificationEvent.name,
                    schema: billing_notification_event_schema_1.BillingNotificationEventSchema,
                },
            ]),
        ],
        controllers: [google_play_rtdn_controller_1.GooglePlayRtdnController],
        providers: [
            pubsub_push_auth_guard_1.PubSubPushAuthGuard,
            rtdn_decoder_service_1.RtdnDecoderService,
            rtdn_handler_service_1.RtdnHandlerService,
        ],
    })
], BillingNotificationsModule);
