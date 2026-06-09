"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RtdnDecoderService = void 0;
const common_1 = require("@nestjs/common");
let RtdnDecoderService = class RtdnDecoderService {
    decodePushBody(body) {
        const messageId = body.message?.messageId;
        const data = body.message?.data;
        if (!messageId) {
            throw new common_1.BadRequestException('PUBSUB_MESSAGE_ID_MISSING');
        }
        if (!data) {
            throw new common_1.BadRequestException('PUBSUB_MESSAGE_DATA_MISSING');
        }
        let notification;
        try {
            const json = Buffer.from(data, 'base64').toString('utf8');
            notification = JSON.parse(json);
        }
        catch {
            throw new common_1.BadRequestException('RTDN_PAYLOAD_DECODE_FAILED');
        }
        return { messageId, notification };
    }
};
exports.RtdnDecoderService = RtdnDecoderService;
exports.RtdnDecoderService = RtdnDecoderService = __decorate([
    (0, common_1.Injectable)()
], RtdnDecoderService);
