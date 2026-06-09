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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncPullQueryDto = exports.SyncPullResponseDto = exports.SyncPushResponseDto = exports.SyncRejectedChangeDto = exports.SyncPushRequestDto = exports.SyncChangeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const reject_mongo_operators_decorator_1 = require("../security/reject-mongo-operators.decorator");
const sync_types_1 = require("../sync/sync.types");
class SyncChangeDto {
    entityType;
    entityId;
    updatedAtMillis;
    deletedAtMillis;
    clientUpdatedAtMillis;
    deviceId;
    payload;
}
exports.SyncChangeDto = SyncChangeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: sync_types_1.SYNC_ENTITY_TYPES }),
    (0, class_validator_1.IsIn)(sync_types_1.SYNC_ENTITY_TYPES),
    __metadata("design:type", Object)
], SyncChangeDto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '32-char hex entity id' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[a-f0-9]{32}$/),
    __metadata("design:type", String)
], SyncChangeDto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SyncChangeDto.prototype, "updatedAtMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SyncChangeDto.prototype, "deletedAtMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SyncChangeDto.prototype, "clientUpdatedAtMillis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SyncChangeDto.prototype, "deviceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'object', additionalProperties: true }),
    (0, class_validator_1.IsObject)(),
    (0, reject_mongo_operators_decorator_1.RejectMongoOperators)(),
    __metadata("design:type", Object)
], SyncChangeDto.prototype, "payload", void 0);
class SyncPushRequestDto {
    changes;
    lastKnownServerVersion;
    deviceId;
}
exports.SyncPushRequestDto = SyncPushRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [SyncChangeDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SyncChangeDto),
    __metadata("design:type", Array)
], SyncPushRequestDto.prototype, "changes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Last serverVersion from a previous pull/push' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SyncPushRequestDto.prototype, "lastKnownServerVersion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SyncPushRequestDto.prototype, "deviceId", void 0);
class SyncRejectedChangeDto {
    entityId;
    reason;
}
exports.SyncRejectedChangeDto = SyncRejectedChangeDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SyncRejectedChangeDto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SyncRejectedChangeDto.prototype, "reason", void 0);
class SyncPushResponseDto {
    accepted;
    rejected;
    noop;
    serverVersion;
}
exports.SyncPushResponseDto = SyncPushResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], description: 'Entity ids accepted by server' }),
    __metadata("design:type", Array)
], SyncPushResponseDto.prototype, "accepted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [SyncRejectedChangeDto] }),
    __metadata("design:type", Array)
], SyncPushResponseDto.prototype, "rejected", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], description: 'Entity ids with no change (noop)' }),
    __metadata("design:type", Array)
], SyncPushResponseDto.prototype, "noop", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SyncPushResponseDto.prototype, "serverVersion", void 0);
class SyncPullResponseDto {
    entities;
    newServerVersion;
}
exports.SyncPullResponseDto = SyncPullResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [SyncChangeDto] }),
    __metadata("design:type", Array)
], SyncPullResponseDto.prototype, "entities", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SyncPullResponseDto.prototype, "newServerVersion", void 0);
class SyncPullQueryDto {
    since;
}
exports.SyncPullQueryDto = SyncPullQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Pull changes since this serverVersion' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SyncPullQueryDto.prototype, "since", void 0);
