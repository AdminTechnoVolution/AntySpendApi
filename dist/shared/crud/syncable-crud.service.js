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
exports.SyncableCrudService = void 0;
exports.newEntityId = newEntityId;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const lww_service_1 = require("../sync/lww.service");
const strip_mongo_keys_1 = require("../security/strip-mongo-keys");
function newEntityId() {
    return (0, crypto_1.randomBytes)(16).toString('hex');
}
function idFromIdempotencyKey(userId, idempotencyKey) {
    return (0, crypto_1.createHash)('sha256')
        .update(`${userId}:${idempotencyKey}`)
        .digest('hex')
        .slice(0, 32);
}
let SyncableCrudService = class SyncableCrudService {
    model;
    entityName;
    constructor(model, entityName) {
        this.model = model;
        this.entityName = entityName;
    }
    async findAll(userId, includeDeleted = false) {
        const filter = { userId };
        if (!includeDeleted) {
            filter.deletedAtMillis = { $exists: false };
        }
        return this.model.find(filter).lean();
    }
    async findOne(userId, id) {
        const doc = await this.model.findOne({ userId, id }).lean();
        if (!doc || doc.deletedAtMillis) {
            throw new common_1.NotFoundException(`${this.entityName} not found`);
        }
        return doc;
    }
    async create(userId, data, options = {}) {
        const id = data.id ??
            (options.idempotencyKey
                ? idFromIdempotencyKey(userId, options.idempotencyKey)
                : newEntityId());
        const now = Date.now();
        const safeData = (0, strip_mongo_keys_1.sanitizeDocumentForStorage)(data);
        const doc = await this.model
            .findOneAndUpdate({ userId, id }, {
            $setOnInsert: {
                ...safeData,
                id,
                userId,
                createdAtMillis: now,
                updatedAtMillis: now,
                deviceId: options.deviceId,
            },
        }, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true })
            .lean();
        return doc;
    }
    async update(userId, id, data, options = {}) {
        const existing = await this.model.findOne({ userId, id }).lean();
        const clientUpdatedAtMillis = data.updatedAtMillis;
        if (existing?.deletedAtMillis) {
            throw new common_1.NotFoundException(`${this.entityName} not found`);
        }
        if (existing && clientUpdatedAtMillis !== undefined) {
            const decision = (0, lww_service_1.decideLww)({
                updatedAtMillis: clientUpdatedAtMillis,
                deviceId: options.deviceId ?? data.deviceId,
            }, existing.updatedAtMillis, existing.deviceId);
            if (decision.outcome === 'noop') {
                return existing;
            }
            if (decision.outcome === 'reject') {
                return existing;
            }
        }
        const now = Date.now();
        const { id: _ignoredId, userId: _ignoredUserId, ...fields } = data;
        const safeFields = (0, strip_mongo_keys_1.sanitizeDocumentForStorage)(fields);
        const updatedAtMillis = clientUpdatedAtMillis ??
            existing?.updatedAtMillis ??
            now;
        const doc = await this.model
            .findOneAndUpdate({ userId, id }, {
            $set: (0, strip_mongo_keys_1.sanitizeDocumentForStorage)({
                ...safeFields,
                id,
                userId,
                updatedAtMillis,
                deviceId: options.deviceId ??
                    data.deviceId ??
                    existing?.deviceId,
            }),
            $setOnInsert: {
                createdAtMillis: existing?.createdAtMillis ?? now,
            },
        }, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true })
            .lean();
        return doc;
    }
    async softDelete(userId, id, deviceId) {
        const existing = await this.model.findOne({ userId, id });
        if (!existing || existing.deletedAtMillis) {
            throw new common_1.NotFoundException(`${this.entityName} not found`);
        }
        const now = Date.now();
        existing.deletedAtMillis = now;
        existing.updatedAtMillis = now;
        if (deviceId)
            existing.deviceId = deviceId;
        await existing.save();
        return { id, deleted: true };
    }
    getModel() {
        return this.model;
    }
};
exports.SyncableCrudService = SyncableCrudService;
exports.SyncableCrudService = SyncableCrudService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object, String])
], SyncableCrudService);
//# sourceMappingURL=syncable-crud.service.js.map