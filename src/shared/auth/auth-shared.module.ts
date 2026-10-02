import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { User, UserSchema } from '../../modules/auth/infrastructure/user.schema';
import { GoogleTokenVerifier } from './google-token.verifier';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('jwt.secret'),
      }),
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [GoogleTokenVerifier, JwtStrategy, JwtAuthGuard],
  exports: [JwtModule, PassportModule, GoogleTokenVerifier, JwtAuthGuard],
})
export class AuthSharedModule {}
