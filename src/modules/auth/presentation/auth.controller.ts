import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { CurrentUser } from '../../../shared/auth/current-user.decorator';
import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import { BEARER_AUTH_SCHEME } from '../../../shared/swagger/swagger.constants';
import { AuthService } from '../application/auth.service';
import {
  AuthTokensResponseDto,
  AuthUserDto,
  GoogleAuthDto,
  LogoutResponseDto,
  RefreshTokenDto,
  UpdateProfileDto,
} from '../dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  @ApiOperation({ summary: 'Login or register with Google idToken' })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  async google(@Body() dto: GoogleAuthDto): Promise<AuthTokensResponseDto> {
    return this.authService.loginWithGoogle(dto.idToken);
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh access token (idempotent within 5 minutes)' })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokensResponseDto> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Invalidate refresh token' })
  @ApiOkResponse({ type: LogoutResponseDto })
  async logout(@Body() dto: RefreshTokenDto): Promise<LogoutResponseDto> {
    return this.authService.logout(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(BEARER_AUTH_SCHEME)
  @ApiOperation({ summary: 'Get authenticated user profile' })
  @ApiOkResponse({ type: AuthUserDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  async me(@CurrentUser() user: AuthenticatedUser): Promise<AuthUserDto> {
    return this.authService.getMe(user.userId);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(BEARER_AUTH_SCHEME)
  @ApiOperation({ summary: 'Update authenticated user display name' })
  @ApiOkResponse({ type: AuthUserDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<AuthUserDto> {
    return this.authService.updateProfile(user.userId, dto.name);
  }
}
