import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { CurrentUser } from '../../../shared/auth/current-user.decorator';
import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import { ApiStandardAuthResponses } from '../../../shared/swagger/common-responses.decorator';
import { BEARER_AUTH_SCHEME } from '../../../shared/swagger/swagger.constants';
import { ParseEntityIdPipe } from '../../../shared/security/parse-entity-id.pipe';
import {
  CreateHouseholdDto,
  CreateInviteDto,
  UpdatePrivacyDto,
} from '../dto/household.dto';
import { HouseholdService } from '../application/household.service';
import { FamilyViewService } from '../application/family-view.service';

@ApiTags('households')
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@UseGuards(JwtAuthGuard)
@Controller('households')
export class HouseholdsController {
  constructor(
    private readonly householdService: HouseholdService,
    private readonly familyViewService: FamilyViewService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get active household, members, and pending invites' })
  @ApiOkResponse({ description: 'Current household snapshot' })
  @ApiStandardAuthResponses()
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.householdService.getMyHousehold(user.userId);
  }

  @Post('invites/:token/accept')
  @ApiOperation({ summary: 'Accept a household invite by token' })
  @ApiOkResponse({ description: 'Accepted household membership' })
  @ApiStandardAuthResponses()
  acceptInvite(
    @CurrentUser() user: AuthenticatedUser,
    @Param('token') token: string,
  ) {
    return this.householdService.acceptInvite(
      token,
      user.userId,
      user.email,
    );
  }

  @Post(':id/invites')
  @ApiOperation({ summary: 'Create a household invite (owner only)' })
  @ApiOkResponse({ description: 'Created invite with token' })
  @ApiStandardAuthResponses()
  createInvite(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseEntityIdPipe) id: string,
    @Body() body: CreateInviteDto,
  ) {
    return this.householdService.createInvite(id, user.userId, body.email);
  }

  @Post()
  @ApiOperation({ summary: 'Create a family household (requires FAMILY entitlement)' })
  @ApiOkResponse({ description: 'Created household' })
  @ApiStandardAuthResponses()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateHouseholdDto,
  ) {
    return this.householdService.createHousehold(user.userId, body.name);
  }

  @Delete(':id/invites/:inviteId')
  @ApiOperation({ summary: 'Revoke a pending invite (owner only)' })
  @ApiOkResponse({ description: 'Revoked invite' })
  @ApiStandardAuthResponses()
  revokeInvite(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseEntityIdPipe) id: string,
    @Param('inviteId', ParseEntityIdPipe) inviteId: string,
  ) {
    return this.householdService.revokeInvite(id, inviteId, user.userId);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove a member from the household (owner only)' })
  @ApiOkResponse({ description: 'Removed member' })
  @ApiStandardAuthResponses()
  removeMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseEntityIdPipe) id: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.householdService.removeMember(id, targetUserId, user.userId);
  }

  @Post(':id/leave')
  @ApiOperation({ summary: 'Leave the household (members only)' })
  @ApiOkResponse({ description: 'Left household' })
  @ApiStandardAuthResponses()
  leave(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseEntityIdPipe) id: string,
  ) {
    return this.householdService.leaveHousehold(id, user.userId);
  }

  @Patch('members/me/privacy')
  @ApiOperation({ summary: 'Update privacy toggles for voluntary data sharing' })
  @ApiOkResponse({ description: 'Updated membership with privacy settings' })
  @ApiStandardAuthResponses()
  updatePrivacy(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdatePrivacyDto,
  ) {
    return this.householdService.updatePrivacy(user.userId, body);
  }

  @Get(':id/family-view')
  @ApiOperation({
    summary: 'Read-only snapshot of voluntary member data and household shared resources',
  })
  @ApiOkResponse({ description: 'Family view snapshot' })
  @ApiStandardAuthResponses()
  familyView(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseEntityIdPipe) id: string,
  ) {
    return this.familyViewService.getFamilyView(id, user.userId);
  }
}
