import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { CurrentUser } from '../../../shared/auth/current-user.decorator';
import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import { IdempotencyKey } from '../../../shared/crud/idempotency-key.decorator';
import { Budget } from '../../../shared/database/entity.schemas';
import {
  ApiCrudCreate,
  ApiCrudDelete,
  ApiCrudGet,
  ApiCrudList,
  ApiCrudUpdate,
} from '../../../shared/swagger/crud-swagger.decorator';
import {
  BudgetDto,
  CreateBudgetDto,
  UpdateBudgetDto,
} from '../../../shared/swagger/entity.dto';
import { BEARER_AUTH_SCHEME } from '../../../shared/swagger/swagger.constants';
import { BudgetService } from '../application/budgets.service';

@ApiTags('budgets')
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@UseGuards(JwtAuthGuard)
@Controller('budgets')
export class BudgetController {
  constructor(private readonly service: BudgetService) {}

  @Get()
  @ApiCrudList('budgets', BudgetDto)
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findAll(user.userId);
  }

  @Get(':id')
  @ApiCrudGet('budget', BudgetDto)
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.service.findOne(user.userId, id);
  }

  @Post()
  @ApiCrudCreate('budget', CreateBudgetDto, BudgetDto)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: Partial<Budget>,
    @IdempotencyKey() idempotencyKey?: string,
  ) {
    return this.service.create(user.userId, body, { idempotencyKey });
  }

  @Patch(':id')
  @ApiCrudUpdate('budget', UpdateBudgetDto, BudgetDto)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: Partial<Budget>,
  ) {
    return this.service.update(user.userId, id, body);
  }

  @Delete(':id')
  @ApiCrudDelete('budget', BudgetDto)
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.service.softDelete(user.userId, id);
  }
}
