import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';

mongoose.set('strictQuery', true);
// Do not enable global sanitizeFilter: it breaks legitimate server-side
// query operators ($gt, $gte, $exists, etc.). User input is sanitized via
// middleware, DTO validation, and stripMongoKeys before writes.

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('mongodbUri'),
      }),
    }),
  ],
})
export class DatabaseModule {}
