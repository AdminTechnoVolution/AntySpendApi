import { Controller, Get, Post } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  CurrencyDto,
  CurrencySeedResponseDto,
} from '../../../shared/swagger/entity.dto';
import { CurrenciesService } from '../application/currencies.service';

@ApiTags('currencies')
@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get()
  @ApiOperation({ summary: 'List global currency catalog' })
  @ApiOkResponse({ type: CurrencyDto, isArray: true })
  findAll() {
    return this.currenciesService.findAll();
  }

  @Post('seed')
  @ApiOperation({ summary: 'Re-run currency seed (idempotent)' })
  @ApiOkResponse({ type: CurrencySeedResponseDto })
  seed() {
    return this.currenciesService.seed().then(() => ({ seeded: true }));
  }
}
