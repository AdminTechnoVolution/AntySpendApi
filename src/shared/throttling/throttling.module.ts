import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthSharedModule } from '../auth/auth-shared.module';
import { ClientThrottlerGuard } from './client-throttler.guard';

@Module({
  imports: [
    AuthSharedModule,
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('rateLimit.ttlMs') ?? 60_000,
            limit: config.get<number>('rateLimit.max') ?? 50,
          },
        ],
      }),
    }),
  ],
  providers: [
    ClientThrottlerGuard,
    {
      provide: APP_GUARD,
      useExisting: ClientThrottlerGuard,
    },
  ],
})
export class AppThrottlingModule {}
