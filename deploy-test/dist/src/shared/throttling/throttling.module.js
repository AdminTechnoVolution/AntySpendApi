"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppThrottlingModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const auth_shared_module_1 = require("../auth/auth-shared.module");
const client_throttler_guard_1 = require("./client-throttler.guard");
let AppThrottlingModule = class AppThrottlingModule {
};
exports.AppThrottlingModule = AppThrottlingModule;
exports.AppThrottlingModule = AppThrottlingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_shared_module_1.AuthSharedModule,
            throttler_1.ThrottlerModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    throttlers: [
                        {
                            ttl: config.get('rateLimit.ttlMs') ?? 60_000,
                            limit: config.get('rateLimit.max') ?? 50,
                        },
                    ],
                }),
            }),
        ],
        providers: [
            client_throttler_guard_1.ClientThrottlerGuard,
            {
                provide: core_1.APP_GUARD,
                useExisting: client_throttler_guard_1.ClientThrottlerGuard,
            },
        ],
    })
], AppThrottlingModule);
