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
var SyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const lww_service_1 = require("../../../shared/sync/lww.service");
const sync_types_1 = require("../../../shared/sync/sync.types");
const strip_mongo_keys_1 = require("../../../shared/security/strip-mongo-keys");
const entity_schemas_1 = require("../../../shared/database/entity.schemas");
const household_authz_service_1 = require("../../households/application/household-authz.service");
let SyncService = SyncService_1 = class SyncService {
    lwwService;
    householdAuthz;
    logger = new common_1.Logger(SyncService_1.name);
    entityMap;
    constructor(settingsModel, walletModel, categoryModel, merchantModel, transactionModel, budgetModel, recurringModel, savingsPlanModel, savingsMovementModel, investmentModel, investmentMovementModel, lwwService, householdAuthz) {
        this.lwwService = lwwService;
        this.householdAuthz = householdAuthz;
        this.entityMap = {
            settings: settingsModel,
            wallets: walletModel,
            categories: categoryModel,
            merchants: merchantModel,
            transactions: transactionModel,
            budgets: budgetModel,
            recurring_expenses: recurringModel,
            savings_plans: savingsPlanModel,
            savings_movements: savingsMovementModel,
            investments: investmentModel,
            investment_movements: investmentMovementModel,
        };
    }
    async push(userId, request) {
        const accepted = [];
        const rejected = [];
        const noop = [];
        let hasMutations = false;
        const fanOutHouseholdIds = new Set();
        for (const change of request.changes ?? []) {
            try {
                if (!sync_types_1.SYNC_ENTITY_TYPES.includes(change.entityType)) {
                    rejected.push({ entityId: change.entityId, reason: 'UNKNOWN_ENTITY' });
                    continue;
                }
                const model = this.entityMap[change.entityType];
                const provisionalHouseholdId = this.householdAuthz.resolveHouseholdId(change, null);
                const provisionalFilter = this.householdAuthz.buildEntityFilter(userId, change, provisionalHouseholdId);
                const existing = (await model.findOne(provisionalFilter).lean());
                const authz = await this.householdAuthz.authorizeSyncChange(userId, change, existing);
                if (!authz.allowed) {
                    rejected.push({ entityId: change.entityId, reason: authz.reason });
                    continue;
                }
                const householdId = authz.householdId || undefined;
                const filter = this.householdAuthz.buildEntityFilter(userId, change, householdId);
                const existingDoc = existing ??
                    (await model.findOne(filter).lean());
                const decision = this.lwwService.decide(change, existingDoc?.updatedAtMillis, existingDoc?.deviceId);
                if (decision.outcome === 'noop') {
                    noop.push(change.entityId);
                    continue;
                }
                if (decision.outcome === 'reject') {
                    rejected.push({
                        entityId: change.entityId,
                        reason: decision.reason ?? 'REJECTED',
                    });
                    continue;
                }
                const now = Date.now();
                const deviceId = change.deviceId ?? request.deviceId;
                const entityPayload = (0, strip_mongo_keys_1.sanitizeDocumentForStorage)({ ...change.payload });
                delete entityPayload.createdAtMillis;
                delete entityPayload.id;
                delete entityPayload.userId;
                delete entityPayload.updatedAtMillis;
                delete entityPayload.deletedAtMillis;
                delete entityPayload.clientUpdatedAtMillis;
                delete entityPayload.deviceId;
                const payload = (0, strip_mongo_keys_1.sanitizeDocumentForStorage)({
                    ...entityPayload,
                    id: change.entityType === 'settings'
                        ? (existingDoc?.id ?? change.entityId)
                        : change.entityId,
                    userId,
                    updatedAtMillis: change.updatedAtMillis,
                    deviceId,
                    ...(householdId ? { householdId } : {}),
                    ...(householdId
                        ? {
                            createdByUserId: change.payload.createdByUserId ??
                                existingDoc?.createdByUserId ??
                                userId,
                        }
                        : {}),
                    ...(change.deletedAtMillis !== undefined
                        ? { deletedAtMillis: change.deletedAtMillis }
                        : {}),
                    ...(change.clientUpdatedAtMillis !== undefined
                        ? { clientUpdatedAtMillis: change.clientUpdatedAtMillis }
                        : {}),
                });
                const createdAtMillis = existingDoc?.createdAtMillis ??
                    change.payload.createdAtMillis ??
                    now;
                await model.findOneAndUpdate(filter, {
                    $set: payload,
                    $setOnInsert: { createdAtMillis },
                }, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true });
                accepted.push(change.entityId);
                hasMutations = true;
                if (householdId) {
                    fanOutHouseholdIds.add(householdId);
                }
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'UPSERT_FAILED';
                this.logger.warn(`Sync push failed for ${change.entityType}/${change.entityId}: ${message}`);
                rejected.push({ entityId: change.entityId, reason: message });
            }
        }
        if (hasMutations) {
            if (fanOutHouseholdIds.size > 0) {
                const memberIds = new Set([userId]);
                for (const householdId of fanOutHouseholdIds) {
                    const ids = await this.householdAuthz.getActiveMemberUserIds(householdId);
                    ids.forEach((id) => memberIds.add(id));
                }
                await this.lwwService.bumpServerVersionForUsers([...memberIds]);
            }
            else {
                await this.lwwService.bumpServerVersion(userId);
            }
        }
        const serverVersion = await this.lwwService.getServerVersion(userId);
        return { accepted, rejected, noop, serverVersion };
    }
    async pull(userId, since) {
        const currentVersion = await this.lwwService.getServerVersion(userId);
        if (since && since === currentVersion) {
            return { entities: [], newServerVersion: currentVersion };
        }
        const householdId = await this.householdAuthz.getActiveHouseholdId(userId);
        const entities = [];
        const seenIds = new Set();
        for (const entityType of sync_types_1.SYNC_ENTITY_TYPES) {
            const model = this.entityMap[entityType];
            const isShareable = this.householdAuthz.isShareableEntityType(entityType);
            const privateDocs = await model
                .find(this.householdAuthz.buildPrivatePullFilter(userId))
                .sort({ updatedAtMillis: 1 })
                .lean();
            for (const doc of privateDocs) {
                this.appendSyncChange(entities, seenIds, entityType, doc);
            }
            if (householdId && isShareable) {
                const sharedDocs = await model
                    .find(this.householdAuthz.buildSharedPullFilter(householdId))
                    .sort({ updatedAtMillis: 1 })
                    .lean();
                for (const doc of sharedDocs) {
                    this.appendSyncChange(entities, seenIds, entityType, doc);
                }
            }
        }
        return {
            entities,
            newServerVersion: currentVersion,
        };
    }
    appendSyncChange(entities, seenIds, entityType, doc) {
        const entityId = doc.id ?? '';
        const dedupeKey = `${entityType}:${entityId}`;
        if (seenIds.has(dedupeKey))
            return;
        seenIds.add(dedupeKey);
        const { _id, __v, ...payload } = doc;
        entities.push({
            entityType,
            entityId: entityId || doc.userId,
            updatedAtMillis: doc.updatedAtMillis,
            deletedAtMillis: doc.deletedAtMillis,
            clientUpdatedAtMillis: doc.clientUpdatedAtMillis,
            deviceId: doc.deviceId,
            payload: payload,
        });
    }
};
exports.SyncService = SyncService;
exports.SyncService = SyncService = SyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(entity_schemas_1.UserSettings.name)),
    __param(1, (0, mongoose_1.InjectModel)(entity_schemas_1.Wallet.name)),
    __param(2, (0, mongoose_1.InjectModel)(entity_schemas_1.Category.name)),
    __param(3, (0, mongoose_1.InjectModel)(entity_schemas_1.Merchant.name)),
    __param(4, (0, mongoose_1.InjectModel)(entity_schemas_1.Transaction.name)),
    __param(5, (0, mongoose_1.InjectModel)(entity_schemas_1.Budget.name)),
    __param(6, (0, mongoose_1.InjectModel)(entity_schemas_1.RecurringExpense.name)),
    __param(7, (0, mongoose_1.InjectModel)(entity_schemas_1.SavingsPlan.name)),
    __param(8, (0, mongoose_1.InjectModel)(entity_schemas_1.SavingsMovement.name)),
    __param(9, (0, mongoose_1.InjectModel)(entity_schemas_1.Investment.name)),
    __param(10, (0, mongoose_1.InjectModel)(entity_schemas_1.InvestmentMovement.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        lww_service_1.LwwService,
        household_authz_service_1.HouseholdAuthzService])
], SyncService);
