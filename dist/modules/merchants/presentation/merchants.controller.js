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
exports.MerchantController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../shared/auth/jwt-auth.guard");
const current_user_decorator_1 = require("../../../shared/auth/current-user.decorator");
const idempotency_key_decorator_1 = require("../../../shared/crud/idempotency-key.decorator");
const crud_swagger_decorator_1 = require("../../../shared/swagger/crud-swagger.decorator");
const entity_dto_1 = require("../../../shared/swagger/entity.dto");
const swagger_constants_1 = require("../../../shared/swagger/swagger.constants");
const merchants_service_1 = require("../application/merchants.service");
let MerchantController = class MerchantController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll(user) {
        return this.service.findAll(user.userId);
    }
    findOne(user, id) {
        return this.service.findOne(user.userId, id);
    }
    create(user, body, idempotencyKey) {
        return this.service.create(user.userId, body, { idempotencyKey });
    }
    update(user, id, body) {
        return this.service.update(user.userId, id, body);
    }
    remove(user, id) {
        return this.service.softDelete(user.userId, id);
    }
};
exports.MerchantController = MerchantController;
__decorate([
    (0, common_1.Get)(),
    (0, crud_swagger_decorator_1.ApiCrudList)('merchants', entity_dto_1.MerchantDto),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MerchantController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, crud_swagger_decorator_1.ApiCrudGet)('merchant', entity_dto_1.MerchantDto),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MerchantController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, crud_swagger_decorator_1.ApiCrudCreate)('merchant', entity_dto_1.CreateMerchantDto, entity_dto_1.MerchantDto),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, idempotency_key_decorator_1.IdempotencyKey)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], MerchantController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, crud_swagger_decorator_1.ApiCrudUpdate)('merchant', entity_dto_1.UpdateMerchantDto, entity_dto_1.MerchantDto),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], MerchantController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, crud_swagger_decorator_1.ApiCrudDelete)('merchant', entity_dto_1.MerchantDto),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MerchantController.prototype, "remove", null);
exports.MerchantController = MerchantController = __decorate([
    (0, swagger_1.ApiTags)('merchants'),
    (0, swagger_1.ApiBearerAuth)(swagger_constants_1.BEARER_AUTH_SCHEME),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('merchants'),
    __metadata("design:paramtypes", [merchants_service_1.MerchantService])
], MerchantController);
//# sourceMappingURL=merchants.controller.js.map