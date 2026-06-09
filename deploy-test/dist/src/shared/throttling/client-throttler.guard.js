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
exports.ClientThrottlerGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const throttler_1 = require("@nestjs/throttler");
const resolve_client_ip_1 = require("./resolve-client-ip");
let ClientThrottlerGuard = class ClientThrottlerGuard extends throttler_1.ThrottlerGuard {
    jwtService;
    constructor(options, storageService, reflector, jwtService) {
        super(options, storageService, reflector);
        this.jwtService = jwtService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const path = request.path ?? request.url?.split('?')[0] ?? '';
        if (path.startsWith('/docs') || path === '/openapi.json') {
            return true;
        }
        return super.canActivate(context);
    }
    async getTracker(req) {
        const request = req;
        const authHeader = request.headers?.authorization;
        if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
            const token = authHeader.slice('Bearer '.length);
            try {
                const payload = await this.jwtService.verifyAsync(token);
                if (payload.type === 'access' && payload.sub) {
                    return `user:${payload.sub}`;
                }
            }
            catch {
            }
        }
        return `ip:${(0, resolve_client_ip_1.resolveClientIp)(request)}`;
    }
};
exports.ClientThrottlerGuard = ClientThrottlerGuard;
exports.ClientThrottlerGuard = ClientThrottlerGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, throttler_1.InjectThrottlerOptions)()),
    __param(1, (0, throttler_1.InjectThrottlerStorage)()),
    __metadata("design:paramtypes", [Object, Object, core_1.Reflector,
        jwt_1.JwtService])
], ClientThrottlerGuard);
