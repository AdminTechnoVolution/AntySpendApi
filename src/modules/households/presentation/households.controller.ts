import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
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
  UpdateHouseholdDto,
  UpdatePrivacyDto,
} from '../dto/household.dto';
import { HouseholdService } from '../application/household.service';
import { FamilyViewService } from '../application/family-view.service';
import { HouseholdFamilyService } from '../application/household-family.service';
import { IdempotencyKey } from '../../../shared/crud/idempotency-key.decorator';
import {
  CreateExpenseSplitDto,
  CreateSettlementDto,
  ReplaceBudgetQuotasDto,
  UpdateExpenseSplitDto,
} from '../dto/household-family.dto';

@ApiTags('households')
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@UseGuards(JwtAuthGuard)
@Controller('households')
export class HouseholdsController {
  constructor(
    private readonly householdService: HouseholdService,
    private readonly familyViewService: FamilyViewService,
    private readonly householdFamilyService: HouseholdFamilyService,
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

  @Patch(':id')
  @ApiOperation({ summary: 'Update household metadata (owner only)' })
  @ApiOkResponse({ description: 'Updated household' })
  @ApiStandardAuthResponses()
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseEntityIdPipe) id: string,
    @Body() body: UpdateHouseholdDto,
  ) {
    return this.householdService.updateHousehold(id, user.userId, body.name);
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

  @Get(':id/splits')
  @ApiOperation({ summary: 'List household expense splits' })
  @ApiOkResponse({ description: 'Expense splits with lines' })
  @ApiStandardAuthResponses()
  listSplits(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseEntityIdPipe) id: string,
    @Query('status') status?: string,
  ) {
    return this.householdFamilyService.listSplits(user.userId, id, status);
  }

  @Post(':id/splits')
  @ApiOperation({ summary: 'Create an expense split with lines' })
  @ApiOkResponse({ description: 'Created split' })
  @ApiStandardAuthResponses()
  createSplit(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseEntityIdPipe) id: string,
    @Body() body: CreateExpenseSplitDto,
    @IdempotencyKey() idempotencyKey?: string,
  ) {
    return this.householdFamilyService.createSplit(user.userId, id, body, idempotencyKey);
  }

  @Patch(':id/splits/:splitId')
  @ApiOperation({ summary: 'Update split status or note' })
  @ApiOkResponse({ description: 'Updated split' })
  @ApiStandardAuthResponses()
  updateSplit(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseEntityIdPipe) id: string,
    @Param('splitId', ParseEntityIdPipe) splitId: string,
    @Body() body: UpdateExpenseSplitDto,
  ) {
    return this.householdFamilyService.updateSplit(user.userId, id, splitId, body);
  }

  @Post(':id/settlements')
  @ApiOperation({ summary: 'Record a settlement between members' })
  @ApiOkResponse({ description: 'Created settlement' })
  @ApiStandardAuthResponses()
  createSettlement(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseEntityIdPipe) id: string,
    @Body() body: CreateSettlementDto,
    @IdempotencyKey() idempotencyKey?: string,
  ) {
    return this.householdFamilyService.createSettlement(user.userId, id, body, idempotencyKey);
  }

  @Get(':id/settlements')
  @ApiOperation({ summary: 'List household settlements' })
  @ApiOkResponse({ description: 'Settlement history' })
  @ApiStandardAuthResponses()
  listSettlements(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseEntityIdPipe) id: string,
  ) {
    return this.householdFamilyService.listSettlements(user.userId, id);
  }

  @Get(':id/balances')
  @ApiOperation({ summary: 'Net balances between household members' })
  @ApiOkResponse({ description: 'Member net balances' })
  @ApiStandardAuthResponses()
  getBalances(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseEntityIdPipe) id: string,
  ) {
    return this.householdFamilyService.getBalances(user.userId, id);
  }

  @Put(':id/budgets/:budgetId/quotas')
  @ApiOperation({ summary: 'Replace member quotas for a household budget (owner only)' })
  @ApiOkResponse({ description: 'Updated quotas' })
  @ApiStandardAuthResponses()
  replaceBudgetQuotas(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseEntityIdPipe) id: string,
    @Param('budgetId', ParseEntityIdPipe) budgetId: string,
    @Body() body: ReplaceBudgetQuotasDto,
  ) {
    return this.householdFamilyService.replaceBudgetQuotas(user.userId, id, budgetId, body);
  }

  @Get(':id/budgets/:budgetId/quotas')
  @ApiOperation({ summary: 'Read member quotas for a household budget' })
  @ApiOkResponse({ description: 'Budget member quotas' })
  @ApiStandardAuthResponses()
  listBudgetQuotas(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseEntityIdPipe) id: string,
    @Param('budgetId', ParseEntityIdPipe) budgetId: string,
  ) {
    return this.householdFamilyService.listBudgetQuotas(user.userId, id, budgetId);
  }
}
