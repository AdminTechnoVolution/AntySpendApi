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
exports.UserEntitlementSchema = exports.UserEntitlement = exports.HouseholdInviteSchema = exports.HouseholdInvite = exports.HouseholdMemberSchema = exports.HouseholdMember = exports.HouseholdSchema = exports.Household = exports.DEFAULT_PRIVACY_SETTINGS = exports.PLAY_PRODUCT_FAMILY = exports.PLAY_PRODUCT_PERSONAL = exports.ENTITLEMENT_SOURCE = exports.ENTITLEMENT_STATUS = exports.PLAN_TYPE = exports.INVITE_STATUS = exports.MEMBER_STATUS = exports.MEMBER_ROLE = exports.HOUSEHOLD_PLAN_TYPE = void 0;
const mongoose_1 = require("@nestjs/mongoose");
exports.HOUSEHOLD_PLAN_TYPE = 'FAMILY';
exports.MEMBER_ROLE = { OWNER: 'OWNER', MEMBER: 'MEMBER' };
exports.MEMBER_STATUS = { PENDING: 'PENDING', ACTIVE: 'ACTIVE' };
exports.INVITE_STATUS = {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    REVOKED: 'REVOKED',
};
exports.PLAN_TYPE = { PERSONAL: 'PERSONAL', FAMILY: 'FAMILY' };
exports.ENTITLEMENT_STATUS = {
    ACTIVE: 'ACTIVE',
    EXPIRED: 'EXPIRED',
    CANCELED: 'CANCELED',
    NONE: 'NONE',
};
exports.ENTITLEMENT_SOURCE = {
    PLAY_STORE: 'PLAY_STORE',
};
exports.PLAY_PRODUCT_PERSONAL = 'antyspend_personal_monthly';
exports.PLAY_PRODUCT_FAMILY = 'antyspend_family_monthly';
exports.DEFAULT_PRIVACY_SETTINGS = {
    shareWallets: false,
    shareTransactions: false,
    shareInvestments: false,
    shareCategories: false,
};
let Household = class Household {
    id;
    ownerUserId;
    name;
    planType;
    maxMembers;
    createdAtMillis;
    updatedAtMillis;
};
exports.Household = Household;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Household.prototype, "id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], Household.prototype, "ownerUserId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Household.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: exports.HOUSEHOLD_PLAN_TYPE }),
    __metadata("design:type", String)
], Household.prototype, "planType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 5 }),
    __metadata("design:type", Number)
], Household.prototype, "maxMembers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Household.prototype, "createdAtMillis", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Household.prototype, "updatedAtMillis", void 0);
exports.Household = Household = __decorate([
    (0, mongoose_1.Schema)({ collection: 'households', strict: true })
], Household);
exports.HouseholdSchema = mongoose_1.SchemaFactory.createForClass(Household);
let HouseholdMember = class HouseholdMember {
    id;
    householdId;
    userId;
    role;
    status;
    privacySettings;
    displayName;
    email;
    createdAtMillis;
    updatedAtMillis;
};
exports.HouseholdMember = HouseholdMember;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], HouseholdMember.prototype, "id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], HouseholdMember.prototype, "householdId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], HouseholdMember.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], HouseholdMember.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], HouseholdMember.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            shareWallets: { type: Boolean, default: false },
            shareTransactions: { type: Boolean, default: false },
            shareInvestments: { type: Boolean, default: false },
            shareCategories: { type: Boolean, default: false },
        },
        default: exports.DEFAULT_PRIVACY_SETTINGS,
    }),
    __metadata("design:type", Object)
], HouseholdMember.prototype, "privacySettings", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], HouseholdMember.prototype, "displayName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], HouseholdMember.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], HouseholdMember.prototype, "createdAtMillis", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], HouseholdMember.prototype, "updatedAtMillis", void 0);
exports.HouseholdMember = HouseholdMember = __decorate([
    (0, mongoose_1.Schema)({ collection: 'household_members', strict: true })
], HouseholdMember);
exports.HouseholdMemberSchema = mongoose_1.SchemaFactory.createForClass(HouseholdMember);
exports.HouseholdMemberSchema.index({ householdId: 1, userId: 1 }, { unique: true });
exports.HouseholdMemberSchema.index({ userId: 1, status: 1 }, { unique: true, partialFilterExpression: { status: exports.MEMBER_STATUS.ACTIVE } });
let HouseholdInvite = class HouseholdInvite {
    id;
    householdId;
    token;
    email;
    invitedByUserId;
    expiresAtMillis;
    status;
    createdAtMillis;
    updatedAtMillis;
};
exports.HouseholdInvite = HouseholdInvite;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], HouseholdInvite.prototype, "id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], HouseholdInvite.prototype, "householdId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], HouseholdInvite.prototype, "token", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], HouseholdInvite.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], HouseholdInvite.prototype, "invitedByUserId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], HouseholdInvite.prototype, "expiresAtMillis", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], HouseholdInvite.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], HouseholdInvite.prototype, "createdAtMillis", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], HouseholdInvite.prototype, "updatedAtMillis", void 0);
exports.HouseholdInvite = HouseholdInvite = __decorate([
    (0, mongoose_1.Schema)({ collection: 'household_invites', strict: true })
], HouseholdInvite);
exports.HouseholdInviteSchema = mongoose_1.SchemaFactory.createForClass(HouseholdInvite);
exports.HouseholdInviteSchema.index({ householdId: 1, status: 1 });
let UserEntitlement = class UserEntitlement {
    userId;
    planType;
    status;
    source;
    expiresAtMillis;
    googlePlayProductId;
    googlePlayPurchaseToken;
    googlePlayOrderId;
    packageName;
    autoRenewing;
    createdAtMillis;
    updatedAtMillis;
};
exports.UserEntitlement = UserEntitlement;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], UserEntitlement.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: exports.PLAN_TYPE.PERSONAL }),
    __metadata("design:type", String)
], UserEntitlement.prototype, "planType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: exports.ENTITLEMENT_STATUS.NONE }),
    __metadata("design:type", String)
], UserEntitlement.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: exports.ENTITLEMENT_SOURCE.PLAY_STORE }),
    __metadata("design:type", String)
], UserEntitlement.prototype, "source", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], UserEntitlement.prototype, "expiresAtMillis", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], UserEntitlement.prototype, "googlePlayProductId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], UserEntitlement.prototype, "googlePlayPurchaseToken", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], UserEntitlement.prototype, "googlePlayOrderId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], UserEntitlement.prototype, "packageName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Boolean)
], UserEntitlement.prototype, "autoRenewing", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], UserEntitlement.prototype, "createdAtMillis", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], UserEntitlement.prototype, "updatedAtMillis", void 0);
exports.UserEntitlement = UserEntitlement = __decorate([
    (0, mongoose_1.Schema)({ collection: 'user_entitlements', strict: true })
], UserEntitlement);
exports.UserEntitlementSchema = mongoose_1.SchemaFactory.createForClass(UserEntitlement);
exports.UserEntitlementSchema.index({ googlePlayPurchaseToken: 1 }, { sparse: true, unique: true });
