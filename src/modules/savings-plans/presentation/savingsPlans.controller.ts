import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { CurrentUser } from '../../../shared/auth/current-user.decorator';
import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import { IdempotencyKey } from '../../../shared/crud/idempotency-key.decorator';
import { SavingsPlan } from '../../../shared/database/entity.schemas';
import {
  ApiCrudCreate,
  ApiCrudDelete,
  ApiCrudGet,
  ApiCrudList,
  ApiCrudUpdate,
} from '../../../shared/swagger/crud-swagger.decorator';
import {
  CreateSavingsPlanDto,
  SavingsPlanDto,
  UpdateSavingsPlanDto,
} from '../../../shared/swagger/entity.dto';
import { BEARER_AUTH_SCHEME } from '../../../shared/swagger/swagger.constants';
import { SavingsPlanService } from '../application/savingsPlans.service';

@ApiTags('savings-plans')
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@UseGuards(JwtAuthGuard)
@Controller('savings-plans')
export class SavingsPlanController {
  constructor(private readonly service: SavingsPlanService) {}

  @Get()
  @ApiCrudList('savings plans', SavingsPlanDto)
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findAll(user.userId);
  }

  @Get(':id')
  @ApiCrudGet('savings plan', SavingsPlanDto)
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.service.findOne(user.userId, id);
  }

  @Post()
  @ApiCrudCreate('savings plan', CreateSavingsPlanDto, SavingsPlanDto)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: Partial<SavingsPlan>,
    @IdempotencyKey() idempotencyKey?: string,
  ) {
    return this.service.create(user.userId, body, { idempotencyKey });
  }

  @Patch(':id')
  @ApiCrudUpdate('savings plan', UpdateSavingsPlanDto, SavingsPlanDto)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: Partial<SavingsPlan>,
  ) {
    return this.service.update(user.userId, id, body);
  }

  @Delete(':id')
  @ApiCrudDelete('savings plan', SavingsPlanDto)
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.service.softDelete(user.userId, id);
  }
}
