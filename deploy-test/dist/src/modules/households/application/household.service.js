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
exports.HouseholdService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const crypto_1 = require("crypto");
const syncable_crud_service_1 = require("../../../shared/crud/syncable-crud.service");
const household_schemas_1 = require("../infrastructure/household.schemas");
const entitlements_service_1 = require("./entitlements.service");
const household_constants_1 = require("./household.constants");
const user_schema_1 = require("../../auth/infrastructure/user.schema");
function toPlain(doc) {
    const { _id, __v, ...rest } = doc;
    return rest;
}
let HouseholdService = class HouseholdService {
    householdModel;
    memberModel;
    inviteModel;
    userModel;
    entitlementsService;
    constructor(householdModel, memberModel, inviteModel, userModel, entitlementsService) {
        this.householdModel = householdModel;
        this.memberModel = memberModel;
        this.inviteModel = inviteModel;
        this.userModel = userModel;
        this.entitlementsService = entitlementsService;
    }
    async getMyHousehold(userId) {
        const planType = await this.entitlementsService.getPlanType(userId);
        const membership = await this.memberModel
            .findOne({ userId, status: household_schemas_1.MEMBER_STATUS.ACTIVE })
            .lean();
        if (!membership) {
            return {
                household: null,
                membership: null,
                members: [],
                pendingInvites: [],
                planType,
            };
        }
        const household = await this.householdModel
            .findOne({ id: membership.householdId })
            .lean();
        if (!household) {
            return {
                household: null,
                membership: null,
                members: [],
                pendingInvites: [],
                planType,
            };
        }
        const members = await this.memberModel
            .find({ householdId: membership.householdId, status: household_schemas_1.MEMBER_STATUS.ACTIVE })
            .lean();
        const pendingInvites = membership.role === household_schemas_1.MEMBER_ROLE.OWNER
            ? await this.inviteModel
                .find({
                householdId: membership.householdId,
                status: household_schemas_1.INVITE_STATUS.PENDING,
                expiresAtMillis: { $gt: Date.now() },
            })
                .lean()
            : [];
        return {
            household: toPlain(household),
            membership: toPlain(membership),
            members: members.map((m) => toPlain(m)),
            pendingInvites: pendingInvites.map((i) => toPlain(i)),
            planType,
        };
    }
    async createHousehold(userId, name) {
        await this.entitlementsService.requireFamilyPlan(userId);
        const existing = await this.memberModel
            .findOne({ userId, status: household_schemas_1.MEMBER_STATUS.ACTIVE })
            .lean();
        if (existing) {
            throw new common_1.ConflictException('ALREADY_IN_HOUSEHOLD');
        }
        const user = await this.userModel.findById(userId).lean();
        if (!user) {
            throw new common_1.NotFoundException('USER_NOT_FOUND');
        }
        const now = Date.now();
        const householdId = (0, syncable_crud_service_1.newEntityId)();
        const memberId = (0, syncable_crud_service_1.newEntityId)();
        const household = await this.householdModel.create({
            id: householdId,
            ownerUserId: userId,
            name,
            planType: household_schemas_1.HOUSEHOLD_PLAN_TYPE,
            maxMembers: household_constants_1.MAX_HOUSEHOLD_MEMBERS,
            createdAtMillis: now,
            updatedAtMillis: now,
        });
        const member = await this.memberModel.create({
            id: memberId,
            householdId,
            userId,
            role: household_schemas_1.MEMBER_ROLE.OWNER,
            status: household_schemas_1.MEMBER_STATUS.ACTIVE,
            privacySettings: { ...household_schemas_1.DEFAULT_PRIVACY_SETTINGS },
            displayName: user.name,
            email: user.email,
            createdAtMillis: now,
            updatedAtMillis: now,
        });
        return {
            household: toPlain(household.toObject()),
            membership: toPlain(member.toObject()),
        };
    }
    async createInvite(householdId, userId, email) {
        await this.assertOwnerAccess(householdId, userId);
        await this.assertMemberCapacity(householdId);
        const now = Date.now();
        const token = (0, crypto_1.randomBytes)(16).toString('hex');
        const invite = await this.inviteModel.create({
            id: (0, syncable_crud_service_1.newEntityId)(),
            householdId,
            token,
            email: email?.toLowerCase(),
            invitedByUserId: userId,
            expiresAtMillis: now + household_constants_1.INVITE_EXPIRY_MS,
            status: household_schemas_1.INVITE_STATUS.PENDING,
            createdAtMillis: now,
            updatedAtMillis: now,
        });
        return toPlain(invite.toObject());
    }
    async acceptInvite(token, userId, userEmail) {
        const invite = await this.inviteModel.findOne({ token }).lean();
        if (!invite) {
            throw new common_1.NotFoundException('INVITE_NOT_FOUND');
        }
        if (invite.status !== household_schemas_1.INVITE_STATUS.PENDING) {
            throw new common_1.BadRequestException('INVITE_NOT_PENDING');
        }
        if (invite.expiresAtMillis <= Date.now()) {
            throw new common_1.BadRequestException('INVITE_EXPIRED');
        }
        if (invite.email && invite.email.toLowerCase() !== userEmail.toLowerCase()) {
            throw new common_1.ForbiddenException('INVITE_EMAIL_MISMATCH');
        }
        const existingMembership = await this.memberModel
            .findOne({ userId, status: household_schemas_1.MEMBER_STATUS.ACTIVE })
            .lean();
        if (existingMembership) {
            throw new common_1.ConflictException('ALREADY_IN_HOUSEHOLD');
        }
        await this.assertMemberCapacity(invite.householdId);
        const user = await this.userModel.findById(userId).lean();
        if (!user) {
            throw new common_1.NotFoundException('USER_NOT_FOUND');
        }
        const now = Date.now();
        const member = await this.memberModel.create({
            id: (0, syncable_crud_service_1.newEntityId)(),
            householdId: invite.householdId,
            userId,
            role: household_schemas_1.MEMBER_ROLE.MEMBER,
            status: household_schemas_1.MEMBER_STATUS.ACTIVE,
            privacySettings: { ...household_schemas_1.DEFAULT_PRIVACY_SETTINGS },
            displayName: user.name,
            email: user.email,
            createdAtMillis: now,
            updatedAtMillis: now,
        });
        await this.inviteModel.updateOne({ id: invite.id }, { $set: { status: household_schemas_1.INVITE_STATUS.ACCEPTED, updatedAtMillis: now } });
        const household = await this.householdModel
            .findOne({ id: invite.householdId })
            .lean();
        return {
            household: household ? toPlain(household) : null,
            membership: toPlain(member.toObject()),
        };
    }
    async revokeInvite(householdId, inviteId, userId) {
        await this.assertOwnerAccess(householdId, userId);
        const invite = await this.inviteModel
            .findOne({ id: inviteId, householdId })
            .lean();
        if (!invite) {
            throw new common_1.NotFoundException('INVITE_NOT_FOUND');
        }
        if (invite.status !== household_schemas_1.INVITE_STATUS.PENDING) {
            throw new common_1.BadRequestException('INVITE_NOT_PENDING');
        }
        const now = Date.now();
        await this.inviteModel.updateOne({ id: inviteId }, { $set: { status: household_schemas_1.INVITE_STATUS.REVOKED, updatedAtMillis: now } });
        return { id: inviteId, revoked: true };
    }
    async removeMember(householdId, targetUserId, userId) {
        await this.assertOwnerAccess(householdId, userId);
        if (targetUserId === userId) {
            throw new common_1.BadRequestException('CANNOT_REMOVE_SELF');
        }
        const target = await this.memberModel
            .findOne({
            householdId,
            userId: targetUserId,
            status: household_schemas_1.MEMBER_STATUS.ACTIVE,
        })
            .lean();
        if (!target) {
            throw new common_1.NotFoundException('MEMBER_NOT_FOUND');
        }
        if (target.role === household_schemas_1.MEMBER_ROLE.OWNER) {
            throw new common_1.ForbiddenException('CANNOT_REMOVE_OWNER');
        }
        await this.memberModel.deleteOne({ id: target.id });
        return { userId: targetUserId, removed: true };
    }
    async leaveHousehold(householdId, userId) {
        const membership = await this.memberModel
            .findOne({ householdId, userId, status: household_schemas_1.MEMBER_STATUS.ACTIVE })
            .lean();
        if (!membership) {
            throw new common_1.NotFoundException('MEMBER_NOT_FOUND');
        }
        if (membership.role === household_schemas_1.MEMBER_ROLE.OWNER) {
            throw new common_1.ForbiddenException('OWNER_CANNOT_LEAVE');
        }
        await this.memberModel.deleteOne({ id: membership.id });
        return { left: true };
    }
    async updatePrivacy(userId, dto) {
        const membership = await this.memberModel
            .findOne({ userId, status: household_schemas_1.MEMBER_STATUS.ACTIVE })
            .lean();
        if (!membership) {
            throw new common_1.NotFoundException('NOT_IN_HOUSEHOLD');
        }
        const privacySettings = {
            ...membership.privacySettings,
            ...(dto.shareWallets !== undefined
                ? { shareWallets: dto.shareWallets }
                : {}),
            ...(dto.shareTransactions !== undefined
                ? { shareTransactions: dto.shareTransactions }
                : {}),
            ...(dto.shareInvestments !== undefined
                ? { shareInvestments: dto.shareInvestments }
                : {}),
            ...(dto.shareCategories !== undefined
                ? { shareCategories: dto.shareCategories }
                : {}),
        };
        const now = Date.now();
        const updated = await this.memberModel
            .findOneAndUpdate({ id: membership.id }, { $set: { privacySettings, updatedAtMillis: now } }, { returnDocument: 'after' })
            .lean();
        return toPlain(updated);
    }
    async assertOwnerAccess(householdId, userId) {
        const membership = await this.memberModel
            .findOne({ householdId, userId, status: household_schemas_1.MEMBER_STATUS.ACTIVE })
            .lean();
        if (!membership) {
            throw new common_1.ForbiddenException('NOT_HOUSEHOLD_MEMBER');
        }
        if (membership.role !== household_schemas_1.MEMBER_ROLE.OWNER) {
            throw new common_1.ForbiddenException('OWNER_ONLY');
        }
        return membership;
    }
    async assertMemberCapacity(householdId) {
        const activeCount = await this.memberModel.countDocuments({
            householdId,
            status: household_schemas_1.MEMBER_STATUS.ACTIVE,
        });
        const pendingCount = await this.inviteModel.countDocuments({
            householdId,
            status: household_schemas_1.INVITE_STATUS.PENDING,
            expiresAtMillis: { $gt: Date.now() },
        });
        if (activeCount + pendingCount >= household_constants_1.MAX_HOUSEHOLD_MEMBERS) {
            throw new common_1.ConflictException('HOUSEHOLD_MEMBER_LIMIT');
        }
    }
};
exports.HouseholdService = HouseholdService;
exports.HouseholdService = HouseholdService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(household_schemas_1.Household.name)),
    __param(1, (0, mongoose_1.InjectModel)(household_schemas_1.HouseholdMember.name)),
    __param(2, (0, mongoose_1.InjectModel)(household_schemas_1.HouseholdInvite.name)),
    __param(3, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        entitlements_service_1.EntitlementsService])
], HouseholdService);
