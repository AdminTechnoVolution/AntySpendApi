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
exports.HouseholdsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../shared/auth/jwt-auth.guard");
const current_user_decorator_1 = require("../../../shared/auth/current-user.decorator");
const common_responses_decorator_1 = require("../../../shared/swagger/common-responses.decorator");
const swagger_constants_1 = require("../../../shared/swagger/swagger.constants");
const parse_entity_id_pipe_1 = require("../../../shared/security/parse-entity-id.pipe");
const household_dto_1 = require("../dto/household.dto");
const household_service_1 = require("../application/household.service");
const family_view_service_1 = require("../application/family-view.service");
let HouseholdsController = class HouseholdsController {
    householdService;
    familyViewService;
    constructor(householdService, familyViewService) {
        this.householdService = householdService;
        this.familyViewService = familyViewService;
    }
    getMe(user) {
        return this.householdService.getMyHousehold(user.userId);
    }
    acceptInvite(user, token) {
        return this.householdService.acceptInvite(token, user.userId, user.email);
    }
    createInvite(user, id, body) {
        return this.householdService.createInvite(id, user.userId, body.email);
    }
    create(user, body) {
        return this.householdService.createHousehold(user.userId, body.name);
    }
    revokeInvite(user, id, inviteId) {
        return this.householdService.revokeInvite(id, inviteId, user.userId);
    }
    removeMember(user, id, targetUserId) {
        return this.householdService.removeMember(id, targetUserId, user.userId);
    }
    leave(user, id) {
        return this.householdService.leaveHousehold(id, user.userId);
    }
    updatePrivacy(user, body) {
        return this.householdService.updatePrivacy(user.userId, body);
    }
    familyView(user, id) {
        return this.familyViewService.getFamilyView(id, user.userId);
    }
};
exports.HouseholdsController = HouseholdsController;
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active household, members, and pending invites' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Current household snapshot' }),
    (0, common_responses_decorator_1.ApiStandardAuthResponses)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HouseholdsController.prototype, "getMe", null);
__decorate([
    (0, common_1.Post)('invites/:token/accept'),
    (0, swagger_1.ApiOperation)({ summary: 'Accept a household invite by token' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Accepted household membership' }),
    (0, common_responses_decorator_1.ApiStandardAuthResponses)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], HouseholdsController.prototype, "acceptInvite", null);
__decorate([
    (0, common_1.Post)(':id/invites'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a household invite (owner only)' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Created invite with token' }),
    (0, common_responses_decorator_1.ApiStandardAuthResponses)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', parse_entity_id_pipe_1.ParseEntityIdPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, household_dto_1.CreateInviteDto]),
    __metadata("design:returntype", void 0)
], HouseholdsController.prototype, "createInvite", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a family household (requires FAMILY entitlement)' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Created household' }),
    (0, common_responses_decorator_1.ApiStandardAuthResponses)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, household_dto_1.CreateHouseholdDto]),
    __metadata("design:returntype", void 0)
], HouseholdsController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id/invites/:inviteId'),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke a pending invite (owner only)' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Revoked invite' }),
    (0, common_responses_decorator_1.ApiStandardAuthResponses)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', parse_entity_id_pipe_1.ParseEntityIdPipe)),
    __param(2, (0, common_1.Param)('inviteId', parse_entity_id_pipe_1.ParseEntityIdPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], HouseholdsController.prototype, "revokeInvite", null);
__decorate([
    (0, common_1.Delete)(':id/members/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a member from the household (owner only)' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Removed member' }),
    (0, common_responses_decorator_1.ApiStandardAuthResponses)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', parse_entity_id_pipe_1.ParseEntityIdPipe)),
    __param(2, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], HouseholdsController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Post)(':id/leave'),
    (0, swagger_1.ApiOperation)({ summary: 'Leave the household (members only)' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Left household' }),
    (0, common_responses_decorator_1.ApiStandardAuthResponses)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', parse_entity_id_pipe_1.ParseEntityIdPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], HouseholdsController.prototype, "leave", null);
__decorate([
    (0, common_1.Patch)('members/me/privacy'),
    (0, swagger_1.ApiOperation)({ summary: 'Update privacy toggles for voluntary data sharing' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Updated membership with privacy settings' }),
    (0, common_responses_decorator_1.ApiStandardAuthResponses)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, household_dto_1.UpdatePrivacyDto]),
    __metadata("design:returntype", void 0)
], HouseholdsController.prototype, "updatePrivacy", null);
__decorate([
    (0, common_1.Get)(':id/family-view'),
    (0, swagger_1.ApiOperation)({
        summary: 'Read-only snapshot of voluntary member data and household shared resources',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Family view snapshot' }),
    (0, common_responses_decorator_1.ApiStandardAuthResponses)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', parse_entity_id_pipe_1.ParseEntityIdPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], HouseholdsController.prototype, "familyView", null);
exports.HouseholdsController = HouseholdsController = __decorate([
    (0, swagger_1.ApiTags)('households'),
    (0, swagger_1.ApiBearerAuth)(swagger_constants_1.BEARER_AUTH_SCHEME),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('households'),
    __metadata("design:paramtypes", [household_service_1.HouseholdService,
        family_view_service_1.FamilyViewService])
], HouseholdsController);
