import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { CurrentUser } from '../../../shared/auth/current-user.decorator';
import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import { IdempotencyKey } from '../../../shared/crud/idempotency-key.decorator';
import { SavingsMovement } from '../../../shared/database/entity.schemas';
import {
  ApiCrudCreate,
  ApiCrudDelete,
  ApiCrudGet,
  ApiCrudList,
  ApiCrudUpdate,
} from '../../../shared/swagger/crud-swagger.decorator';
import {
  CreateSavingsMovementDto,
  SavingsMovementDto,
  UpdateSavingsMovementDto,
} from '../../../shared/swagger/entity.dto';
import { BEARER_AUTH_SCHEME } from '../../../shared/swagger/swagger.constants';
import { SavingsMovementService } from '../application/savingsMovements.service';

@ApiTags('savings-movements')
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@UseGuards(JwtAuthGuard)
@Controller('savings-movements')
export class SavingsMovementController {
  constructor(private readonly service: SavingsMovementService) {}

  @Get()
  @ApiCrudList('savings movements', SavingsMovementDto)
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findAll(user.userId);
  }

  @Get(':id')
  @ApiCrudGet('savings movement', SavingsMovementDto)
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.service.findOne(user.userId, id);
  }

  @Post()
  @ApiCrudCreate('savings movement', CreateSavingsMovementDto, SavingsMovementDto)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: Partial<SavingsMovement>,
    @IdempotencyKey() idempotencyKey?: string,
  ) {
    return this.service.create(user.userId, body, { idempotencyKey });
  }

  @Patch(':id')
  @ApiCrudUpdate('savings movement', UpdateSavingsMovementDto, SavingsMovementDto)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: Partial<SavingsMovement>,
  ) {
    return this.service.update(user.userId, id, body);
  }

  @Delete(':id')
  @ApiCrudDelete('savings movement', SavingsMovementDto)
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.service.softDelete(user.userId, id);
  }
}
