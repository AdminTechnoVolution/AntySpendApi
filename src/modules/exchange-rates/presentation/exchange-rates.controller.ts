import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { ExchangeRatesResponseDto } from '../../../shared/swagger/exchange-rates.dto';
import { ApiStandardAuthResponses } from '../../../shared/swagger/common-responses.decorator';
import { BEARER_AUTH_SCHEME } from '../../../shared/swagger/swagger.constants';
import { ExchangeRatesService } from '../application/exchange-rates.service';

@ApiTags('exchange-rates')
@Controller('exchange-rates')
export class ExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  @Get('latest')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(BEARER_AUTH_SCHEME)
  @ApiOperation({
    summary: 'Get latest USD-based exchange rates (Mongo cache, 1 snapshot/día UTC)',
  })
  @ApiOkResponse({ type: ExchangeRatesResponseDto })
  @ApiStandardAuthResponses()
  getLatest() {
    return this.exchangeRatesService.getLatest();
  }
}
