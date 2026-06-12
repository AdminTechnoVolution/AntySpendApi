import { Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/auth/current-user.decorator';
import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import { SkipSubscriptionCheck } from '../../../shared/auth/jwt-auth.guard';
import { ApiStandardAuthResponses } from '../../../shared/swagger/common-responses.decorator';
import { BEARER_AUTH_SCHEME } from '../../../shared/swagger/swagger.constants';
import {
  CurrencyDto,
  CurrencySeedResponseDto,
} from '../../../shared/swagger/entity.dto';
import { CurrenciesService } from '../application/currencies.service';

@ApiTags('currencies')
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get()
  @ApiOperation({ summary: 'List currencies available to the current user' })
  @ApiOkResponse({ type: CurrencyDto, isArray: true })
  @ApiStandardAuthResponses()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.currenciesService.findVisibleForUser(user.userId);
  }

  @Post('seed')
  @SkipSubscriptionCheck()
  @ApiOperation({ summary: 'Re-run currency seed (idempotent)' })
  @ApiOkResponse({ type: CurrencySeedResponseDto })
  @ApiStandardAuthResponses()
  seed() {
    return this.currenciesService.seed().then(() => ({ seeded: true }));
  }
}
