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
var PubSubPushAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSubPushAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const google_auth_library_1 = require("google-auth-library");
let PubSubPushAuthGuard = PubSubPushAuthGuard_1 = class PubSubPushAuthGuard {
    config;
    logger = new common_1.Logger(PubSubPushAuthGuard_1.name);
    oauthClient = new google_auth_library_1.OAuth2Client();
    constructor(config) {
        this.config = config;
    }
    async canActivate(context) {
        if (this.shouldSkipAuth()) {
            this.logger.warn('Pub/Sub push auth skipped (RTDN_SKIP_AUTH, RTDN_ENABLED=false, or missing audience in dev)');
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('PUBSUB_PUSH_AUTH_MISSING');
        }
        const token = authHeader.slice('Bearer '.length);
        const audience = this.config.get('rtdn.pubsubPushAudience');
        const expectedEmail = this.config.get('rtdn.pubsubPushServiceAccountEmail');
        try {
            const ticket = await this.oauthClient.verifyIdToken({
                idToken: token,
                audience,
            });
            const payload = ticket.getPayload();
            if (!payload?.email) {
                throw new common_1.UnauthorizedException('PUBSUB_PUSH_AUTH_INVALID');
            }
            if (expectedEmail && payload.email !== expectedEmail) {
                throw new common_1.UnauthorizedException('PUBSUB_PUSH_AUTH_EMAIL_MISMATCH');
            }
            if (payload.email_verified === false) {
                throw new common_1.UnauthorizedException('PUBSUB_PUSH_AUTH_EMAIL_UNVERIFIED');
            }
            return true;
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            this.logger.warn('Pub/Sub push JWT verification failed', error);
            throw new common_1.UnauthorizedException('PUBSUB_PUSH_AUTH_INVALID');
        }
    }
    shouldSkipAuth() {
        if (this.config.get('rtdn.skipAuth')) {
            return true;
        }
        if (!this.config.get('rtdn.enabled')) {
            return true;
        }
        const audience = this.config.get('rtdn.pubsubPushAudience');
        if (!audience) {
            const nodeEnv = this.config.get('NODE_ENV') ?? process.env.NODE_ENV;
            return nodeEnv === 'development' || nodeEnv === 'test';
        }
        return false;
    }
};
exports.PubSubPushAuthGuard = PubSubPushAuthGuard;
exports.PubSubPushAuthGuard = PubSubPushAuthGuard = PubSubPushAuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PubSubPushAuthGuard);
