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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GooglePlayRtdnController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const pubsub_push_auth_guard_1 = require("../application/pubsub-push-auth.guard");
const rtdn_handler_service_1 = require("../application/rtdn-handler.service");
let GooglePlayRtdnController = class GooglePlayRtdnController {
    rtdnHandler;
    constructor(rtdnHandler) {
        this.rtdnHandler = rtdnHandler;
    }
    async receiveRtdn(body) {
        await this.rtdnHandler.handlePush(body);
        return { ok: true };
    }
};
exports.GooglePlayRtdnController = GooglePlayRtdnController;
__decorate([
    (0, common_1.Post)('rtdn'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(pubsub_push_auth_guard_1.PubSubPushAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Google Play RTDN Pub/Sub push endpoint (no user JWT)',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GooglePlayRtdnController.prototype, "receiveRtdn", null);
exports.GooglePlayRtdnController = GooglePlayRtdnController = __decorate([
    (0, swagger_1.ApiTags)('webhooks'),
    (0, common_1.Controller)('webhooks/google-play'),
    __metadata("design:paramtypes", [rtdn_handler_service_1.RtdnHandlerService])
], GooglePlayRtdnController);
