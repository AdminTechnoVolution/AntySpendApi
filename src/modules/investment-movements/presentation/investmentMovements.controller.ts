import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { CurrentUser } from '../../../shared/auth/current-user.decorator';
import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import { IdempotencyKey } from '../../../shared/crud/idempotency-key.decorator';
import { InvestmentMovement } from '../../../shared/database/entity.schemas';
import {
  ApiCrudCreate,
  ApiCrudDelete,
  ApiCrudGet,
  ApiCrudList,
  ApiCrudUpdate,
} from '../../../shared/swagger/crud-swagger.decorator';
import {
  CreateInvestmentMovementDto,
  InvestmentMovementDto,
  UpdateInvestmentMovementDto,
} from '../../../shared/swagger/entity.dto';
import { BEARER_AUTH_SCHEME } from '../../../shared/swagger/swagger.constants';
import { InvestmentMovementService } from '../application/investmentMovements.service';

@ApiTags('investment-movements')
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@UseGuards(JwtAuthGuard)
@Controller('investment-movements')
export class InvestmentMovementController {
  constructor(private readonly service: InvestmentMovementService) {}

  @Get()
  @ApiCrudList('investment movements', InvestmentMovementDto)
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findAll(user.userId);
  }

  @Get(':id')
  @ApiCrudGet('investment movement', InvestmentMovementDto)
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.service.findOne(user.userId, id);
  }

  @Post()
  @ApiCrudCreate('investment movement', CreateInvestmentMovementDto, InvestmentMovementDto)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: Partial<InvestmentMovement>,
    @IdempotencyKey() idempotencyKey?: string,
  ) {
    return this.service.create(user.userId, body, { idempotencyKey });
  }

  @Patch(':id')
  @ApiCrudUpdate('investment movement', UpdateInvestmentMovementDto, InvestmentMovementDto)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: Partial<InvestmentMovement>,
  ) {
    return this.service.update(user.userId, id, body);
  }

  @Delete(':id')
  @ApiCrudDelete('investment movement', InvestmentMovementDto)
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.service.softDelete(user.userId, id);
  }
}
