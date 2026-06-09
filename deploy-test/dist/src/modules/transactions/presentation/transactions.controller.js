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
exports.TransactionController = void 0;
const common_1 = require("@nestjs/common");
const parse_entity_id_pipe_1 = require("../../../shared/security/parse-entity-id.pipe");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../shared/auth/jwt-auth.guard");
const current_user_decorator_1 = require("../../../shared/auth/current-user.decorator");
const idempotency_key_decorator_1 = require("../../../shared/crud/idempotency-key.decorator");
const crud_swagger_decorator_1 = require("../../../shared/swagger/crud-swagger.decorator");
const entity_dto_1 = require("../../../shared/swagger/entity.dto");
const common_responses_decorator_1 = require("../../../shared/swagger/common-responses.decorator");
const swagger_constants_1 = require("../../../shared/swagger/swagger.constants");
const transactions_service_1 = require("../application/transactions.service");
let TransactionController = class TransactionController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll(user, query) {
        if (query.fromMillis || query.toMillis || query.categoryId) {
            return this.service.findFiltered(user.userId, query);
        }
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
exports.TransactionController = TransactionController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List transactions (optional date/category filters)' }),
    (0, swagger_1.ApiOkResponse)({ type: entity_dto_1.TransactionDto, isArray: true }),
    (0, common_responses_decorator_1.ApiStandardAuthResponses)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, entity_dto_1.TransactionQueryDto]),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, crud_swagger_decorator_1.ApiCrudGet)('transaction', entity_dto_1.TransactionDto),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', parse_entity_id_pipe_1.ParseEntityIdPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, crud_swagger_decorator_1.ApiCrudCreate)('transaction', entity_dto_1.CreateTransactionDto, entity_dto_1.TransactionDto),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, idempotency_key_decorator_1.IdempotencyKey)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, crud_swagger_decorator_1.ApiCrudUpdate)('transaction', entity_dto_1.UpdateTransactionDto, entity_dto_1.TransactionDto),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', parse_entity_id_pipe_1.ParseEntityIdPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, crud_swagger_decorator_1.ApiCrudDelete)('transaction', entity_dto_1.TransactionDto),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', parse_entity_id_pipe_1.ParseEntityIdPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "remove", null);
exports.TransactionController = TransactionController = __decorate([
    (0, swagger_1.ApiTags)('transactions'),
    (0, swagger_1.ApiBearerAuth)(swagger_constants_1.BEARER_AUTH_SCHEME),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('transactions'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionService])
], TransactionController);
