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
exports.EntitlementsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../shared/auth/jwt-auth.guard");
const current_user_decorator_1 = require("../../../shared/auth/current-user.decorator");
const common_responses_decorator_1 = require("../../../shared/swagger/common-responses.decorator");
const swagger_constants_1 = require("../../../shared/swagger/swagger.constants");
const entitlements_service_1 = require("../application/entitlements.service");
const entitlements_dto_1 = require("../dto/entitlements.dto");
let EntitlementsController = class EntitlementsController {
    entitlementsService;
    constructor(entitlementsService) {
        this.entitlementsService = entitlementsService;
    }
    getMe(user) {
        return this.entitlementsService.getMyEntitlement(user.userId);
    }
    verifyPurchase(user, dto) {
        return this.entitlementsService.verifyPurchase(user.userId, dto.productId, dto.purchaseToken, dto.packageName);
    }
};
exports.EntitlementsController = EntitlementsController;
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current subscription entitlement' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Entitlement snapshot' }),
    (0, common_responses_decorator_1.ApiStandardAuthResponses)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EntitlementsController.prototype, "getMe", null);
__decorate([
    (0, common_1.Post)('verify-purchase'),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify Google Play purchase and upsert entitlement',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Verified entitlement' }),
    (0, common_responses_decorator_1.ApiStandardAuthResponses)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, entitlements_dto_1.VerifyPurchaseDto]),
    __metadata("design:returntype", void 0)
], EntitlementsController.prototype, "verifyPurchase", null);
exports.EntitlementsController = EntitlementsController = __decorate([
    (0, swagger_1.ApiTags)('entitlements'),
    (0, swagger_1.ApiBearerAuth)(swagger_constants_1.BEARER_AUTH_SCHEME),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('entitlements'),
    __metadata("design:paramtypes", [entitlements_service_1.EntitlementsService])
], EntitlementsController);
