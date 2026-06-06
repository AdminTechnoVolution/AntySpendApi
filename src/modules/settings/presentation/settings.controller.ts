import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { CurrentUser } from '../../../shared/auth/current-user.decorator';
import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import {
  UpdateUserSettingsDto,
  UserSettingsDto,
} from '../../../shared/swagger/entity.dto';
import { ApiStandardAuthResponses } from '../../../shared/swagger/common-responses.decorator';
import { BEARER_AUTH_SCHEME } from '../../../shared/swagger/swagger.constants';
import { UserSettings } from '../../../shared/database/entity.schemas';
import { SettingsService } from '../application/settings.service';

@ApiTags('settings')
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user settings' })
  @ApiOkResponse({ type: UserSettingsDto })
  @ApiStandardAuthResponses()
  get(@CurrentUser() user: AuthenticatedUser) {
    return this.settingsService.get(user.userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update user settings' })
  @ApiBody({ type: UpdateUserSettingsDto })
  @ApiOkResponse({ type: UserSettingsDto })
  @ApiStandardAuthResponses()
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: Partial<UserSettings>,
  ) {
    return this.settingsService.update(user.userId, body);
  }
}
