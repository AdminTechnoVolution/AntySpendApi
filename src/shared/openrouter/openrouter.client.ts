import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

@Injectable()
export class OpenRouterClient {
  private readonly baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async chatCompletionJson<T>(
    systemPrompt: string,
    userContent: string,
    schemaName: string,
    schema: Record<string, unknown>,
  ): Promise<T> {
    const apiKey = this.config.get<string>('openRouter.apiKey')?.trim() ?? '';
    if (!apiKey) {
      throw new ServiceUnavailableException('OpenRouter API key not configured');
    }
    const model =
      this.config.get<string>('openRouter.model') ??
      'google/gemini-2.5-flash-lite';

    try {
      const response = await firstValueFrom(
        this.http.post(
          this.baseUrl,
          {
            model,
            temperature: 0,
            max_tokens: 1800,
            stream: false,
            provider: {
              require_parameters: true,
              data_collection: 'deny',
              zdr: true,
            },
            plugins: [{ id: 'response-healing' }],
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userContent },
            ],
            response_format: {
              type: 'json_schema',
              json_schema: {
                name: schemaName,
                strict: true,
                schema,
              },
            },
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 60000,
          },
        ),
      );

      const content: string | undefined =
        response.data?.choices?.[0]?.message?.content;
      if (!content?.trim()) {
        throw new BadGatewayException('Empty OpenRouter response');
      }

      const clean = content
        .trim()
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      return JSON.parse(clean) as T;
    } catch (error: unknown) {
      if (error instanceof BadGatewayException) throw error;
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401) {
        throw new ServiceUnavailableException('OpenRouter unauthorized');
      }
      if (status === 402) {
        throw new BadRequestException('OpenRouter insufficient funds');
      }
      if (status === 429) {
        throw new ServiceUnavailableException('OpenRouter rate limited');
      }
      if (status && status >= 500) {
        throw new BadGatewayException('OpenRouter server error');
      }
      throw new BadGatewayException('OpenRouter request failed');
    }
  }
}
