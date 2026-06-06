import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { CurrentUser } from '../../../shared/auth/current-user.decorator';
import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import { IdempotencyKey } from '../../../shared/crud/idempotency-key.decorator';
import { Transaction } from '../../../shared/database/entity.schemas';
import {
  ApiCrudCreate,
  ApiCrudDelete,
  ApiCrudGet,
  ApiCrudList,
  ApiCrudUpdate,
} from '../../../shared/swagger/crud-swagger.decorator';
import {
  CreateTransactionDto,
  TransactionDto,
  TransactionQueryDto,
  UpdateTransactionDto,
} from '../../../shared/swagger/entity.dto';
import { ApiStandardAuthResponses } from '../../../shared/swagger/common-responses.decorator';
import { BEARER_AUTH_SCHEME } from '../../../shared/swagger/swagger.constants';
import { TransactionService } from '../application/transactions.service';

@ApiTags('transactions')
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionController {
  constructor(private readonly service: TransactionService) {}

  @Get()
  @ApiOperation({ summary: 'List transactions (optional date/category filters)' })
  @ApiOkResponse({ type: TransactionDto, isArray: true })
  @ApiStandardAuthResponses()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: TransactionQueryDto,
  ) {
    if (query.fromMillis || query.toMillis || query.categoryId) {
      return this.service.findFiltered(user.userId, query);
    }
    return this.service.findAll(user.userId);
  }

  @Get(':id')
  @ApiCrudGet('transaction', TransactionDto)
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.service.findOne(user.userId, id);
  }

  @Post()
  @ApiCrudCreate('transaction', CreateTransactionDto, TransactionDto)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: Partial<Transaction>,
    @IdempotencyKey() idempotencyKey?: string,
  ) {
    return this.service.create(user.userId, body, { idempotencyKey });
  }

  @Patch(':id')
  @ApiCrudUpdate('transaction', UpdateTransactionDto, TransactionDto)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: Partial<Transaction>,
  ) {
    return this.service.update(user.userId, id, body);
  }

  @Delete(':id')
  @ApiCrudDelete('transaction', TransactionDto)
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.service.softDelete(user.userId, id);
  }
}
