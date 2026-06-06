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
import { ParseEntityIdPipe } from '../../../shared/security/parse-entity-id.pipe';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { CurrentUser } from '../../../shared/auth/current-user.decorator';
import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import { IdempotencyKey } from '../../../shared/crud/idempotency-key.decorator';
import { RecurringExpense } from '../../../shared/database/entity.schemas';
import {
  ApiCrudCreate,
  ApiCrudDelete,
  ApiCrudGet,
  ApiCrudList,
  ApiCrudUpdate,
} from '../../../shared/swagger/crud-swagger.decorator';
import {
  CreateRecurringExpenseDto,
  RecurringExpenseDto,
  UpdateRecurringExpenseDto,
} from '../../../shared/swagger/entity.dto';
import { ApiStandardCrudResponses } from '../../../shared/swagger/common-responses.decorator';
import { BEARER_AUTH_SCHEME } from '../../../shared/swagger/swagger.constants';
import { RecurringExpenseService } from '../application/recurringExpenses.service';

@ApiTags('recurring-expenses')
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@UseGuards(JwtAuthGuard)
@Controller('recurring-expenses')
export class RecurringExpenseController {
  constructor(private readonly service: RecurringExpenseService) {}

  @Get()
  @ApiCrudList('recurring expenses', RecurringExpenseDto)
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findAll(user.userId);
  }

  @Get(':id')
  @ApiCrudGet('recurring expense', RecurringExpenseDto)
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseEntityIdPipe) id: string) {
    return this.service.findOne(user.userId, id);
  }

  @Post()
  @ApiCrudCreate('recurring expense', CreateRecurringExpenseDto, RecurringExpenseDto)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: Partial<RecurringExpense>,
    @IdempotencyKey() idempotencyKey?: string,
  ) {
    return this.service.create(user.userId, body, { idempotencyKey });
  }

  @Patch(':id')
  @ApiCrudUpdate('recurring expense', UpdateRecurringExpenseDto, RecurringExpenseDto)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseEntityIdPipe) id: string,
    @Body() body: Partial<RecurringExpense>,
  ) {
    return this.service.update(user.userId, id, body);
  }

  @Post(':id/mark-paid')
  @ApiOperation({ summary: 'Mark recurring expense as paid and advance next due date' })
  @ApiParam({ name: 'id', description: 'Recurring expense id' })
  @ApiOkResponse({ type: RecurringExpenseDto })
  @ApiStandardCrudResponses()
  markPaid(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseEntityIdPipe) id: string) {
    return this.service.markPaid(user.userId, id);
  }

  @Delete(':id')
  @ApiCrudDelete('recurring expense', RecurringExpenseDto)
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseEntityIdPipe) id: string) {
    return this.service.softDelete(user.userId, id);
  }
}
