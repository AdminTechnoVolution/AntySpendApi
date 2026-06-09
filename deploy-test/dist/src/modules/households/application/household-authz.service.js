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
exports.HouseholdAuthzService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const household_constants_1 = require("./household.constants");
const household_schemas_1 = require("../infrastructure/household.schemas");
let HouseholdAuthzService = class HouseholdAuthzService {
    memberModel;
    constructor(memberModel) {
        this.memberModel = memberModel;
    }
    async getActiveMembership(userId) {
        return this.memberModel
            .findOne({ userId, status: household_schemas_1.MEMBER_STATUS.ACTIVE })
            .lean();
    }
    async getActiveHouseholdId(userId) {
        const membership = await this.getActiveMembership(userId);
        return membership?.householdId ?? null;
    }
    async getActiveMemberUserIds(householdId) {
        const members = await this.memberModel
            .find({ householdId, status: household_schemas_1.MEMBER_STATUS.ACTIVE })
            .lean();
        return members.map((m) => m.userId);
    }
    async assertActiveMember(userId, householdId) {
        const membership = await this.memberModel
            .findOne({ userId, householdId, status: household_schemas_1.MEMBER_STATUS.ACTIVE })
            .lean();
        if (!membership) {
            throw new common_1.ForbiddenException('NOT_HOUSEHOLD_MEMBER');
        }
        return membership;
    }
    async assertOwner(userId, householdId) {
        const membership = await this.assertActiveMember(userId, householdId);
        if (membership.role !== household_schemas_1.MEMBER_ROLE.OWNER) {
            throw new common_1.ForbiddenException('OWNER_ONLY');
        }
        return membership;
    }
    resolveHouseholdId(change, existing) {
        const payloadHouseholdId = change.payload.householdId;
        const existingHouseholdId = existing?.householdId;
        return payloadHouseholdId ?? existingHouseholdId;
    }
    async authorizeSyncChange(userId, change, existing) {
        const householdId = this.resolveHouseholdId(change, existing);
        if (!householdId) {
            return { allowed: true, isOwner: false };
        }
        if (!household_constants_1.HOUSEHOLD_SHAREABLE_ENTITY_TYPES.has(change.entityType)) {
            return { allowed: false, reason: 'ENTITY_NOT_SHAREABLE' };
        }
        const membership = await this.memberModel
            .findOne({ userId, householdId, status: household_schemas_1.MEMBER_STATUS.ACTIVE })
            .lean();
        if (!membership) {
            return { allowed: false, reason: 'NOT_HOUSEHOLD_MEMBER' };
        }
        const isOwner = membership.role === household_schemas_1.MEMBER_ROLE.OWNER;
        const isDelete = change.deletedAtMillis !== undefined;
        const isNew = existing === null;
        if (household_constants_1.OWNER_ONLY_SHARED_ENTITY_TYPES.has(change.entityType)) {
            if (isNew || isDelete) {
                if (!isOwner) {
                    return { allowed: false, reason: 'OWNER_ONLY' };
                }
            }
            else if (!isOwner) {
                return { allowed: false, reason: 'OWNER_ONLY' };
            }
        }
        if (household_constants_1.MEMBER_CONTRIBUTION_ENTITY_TYPES.has(change.entityType)) {
            if (isNew || !isDelete) {
                return { allowed: true, householdId, isOwner };
            }
        }
        return { allowed: true, householdId, isOwner };
    }
    buildEntityFilter(userId, change, householdId) {
        if (change.entityType === 'settings') {
            return { userId };
        }
        if (householdId) {
            return { householdId, id: change.entityId };
        }
        return { userId, id: change.entityId, householdId: { $exists: false } };
    }
    buildPrivatePullFilter(userId) {
        return {
            userId,
            $or: [{ householdId: { $exists: false } }, { householdId: null }],
        };
    }
    buildSharedPullFilter(householdId) {
        return { householdId };
    }
    isShareableEntityType(entityType) {
        return household_constants_1.HOUSEHOLD_SHAREABLE_ENTITY_TYPES.has(entityType);
    }
};
exports.HouseholdAuthzService = HouseholdAuthzService;
exports.HouseholdAuthzService = HouseholdAuthzService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(household_schemas_1.HouseholdMember.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], HouseholdAuthzService);
