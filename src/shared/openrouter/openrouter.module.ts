import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OpenRouterClient } from './openrouter.client';

@Module({
  imports: [HttpModule],
  providers: [OpenRouterClient],
  exports: [OpenRouterClient],
})
export class OpenRouterModule {}
