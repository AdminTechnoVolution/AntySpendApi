import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { CurrentUser } from '../../../shared/auth/current-user.decorator';
import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import {
  ExpenseExtractionResponseDto,
  LeakAnalysisResponseDto,
} from '../../../shared/swagger/ai-response.dto';
import { ApiStandardAuthResponses } from '../../../shared/swagger/common-responses.decorator';
import { BEARER_AUTH_SCHEME } from '../../../shared/swagger/swagger.constants';
import { AiService } from '../application/ai.service';
import {
  ExpenseExtractionRequestDto,
  LeakAnalysisRequestDto,
} from '../dto/ai.dto';

@ApiTags('ai')
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('expense-extraction')
  @ApiOperation({ summary: 'Extract expenses from voice/text transcription' })
  @ApiOkResponse({ type: ExpenseExtractionResponseDto })
  @ApiStandardAuthResponses()
  extractExpenses(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ExpenseExtractionRequestDto,
  ) {
    return this.aiService.extractExpenses(user.userId, dto);
  }

  @Post('leak-analysis')
  @ApiOperation({ summary: 'Analyze leak spending for current or specified month' })
  @ApiOkResponse({ type: LeakAnalysisResponseDto })
  @ApiStandardAuthResponses()
  analyzeLeaks(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: LeakAnalysisRequestDto,
  ) {
    return this.aiService.analyzeLeaks(user.userId, dto);
  }
}
