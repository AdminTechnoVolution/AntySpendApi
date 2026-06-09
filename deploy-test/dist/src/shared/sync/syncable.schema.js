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
exports.SyncableEntity = void 0;
exports.syncableIndexes = syncableIndexes;
exports.householdShareableIndexes = householdShareableIndexes;
exports.toPlainSyncable = toPlainSyncable;
const mongoose_1 = require("@nestjs/mongoose");
function syncableIndexes(schema) {
    schema.index({ userId: 1, id: 1 }, { unique: true });
    schema.index({ userId: 1, updatedAtMillis: 1 });
}
function householdShareableIndexes(schema) {
    schema.index({ householdId: 1, updatedAtMillis: 1 });
}
let SyncableEntity = class SyncableEntity {
    id;
    userId;
    createdAtMillis;
    updatedAtMillis;
    deletedAtMillis;
    clientUpdatedAtMillis;
    deviceId;
    householdId;
    createdByUserId;
};
exports.SyncableEntity = SyncableEntity;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], SyncableEntity.prototype, "id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], SyncableEntity.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], SyncableEntity.prototype, "createdAtMillis", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], SyncableEntity.prototype, "updatedAtMillis", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], SyncableEntity.prototype, "deletedAtMillis", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], SyncableEntity.prototype, "clientUpdatedAtMillis", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SyncableEntity.prototype, "deviceId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SyncableEntity.prototype, "householdId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SyncableEntity.prototype, "createdByUserId", void 0);
exports.SyncableEntity = SyncableEntity = __decorate([
    (0, mongoose_1.Schema)({ strict: true })
], SyncableEntity);
function toPlainSyncable(doc) {
    const { _id, __v, ...rest } = doc;
    return rest;
}
