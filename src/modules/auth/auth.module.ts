import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthSharedModule } from '../../shared/auth/auth-shared.module';
import {
  RefreshToken,
  RefreshTokenSchema,
  User,
  UserSchema,
} from './infrastructure/user.schema';
import { AuthService } from './application/auth.service';
import { AuthController } from './presentation/auth.controller';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    AuthSharedModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    forwardRef(() => SettingsModule),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
