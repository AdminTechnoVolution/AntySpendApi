import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  HttpStatus,
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

type OpenRouterMultimodalContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

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
        throw new HttpException('OpenRouter rate limited', HttpStatus.TOO_MANY_REQUESTS);
      }
      if (status && status >= 500) {
        throw new BadGatewayException('OpenRouter server error');
      }
      throw new BadGatewayException('OpenRouter request failed');
    }
  }

  async chatCompletionJsonWithImage<T>(
    systemPrompt: string,
    userTextContent: string,
    imageBase64: string,
    mimeType: string,
    schemaName: string,
    schema: Record<string, unknown>,
  ): Promise<T> {
    const apiKey = this.config.get<string>('openRouter.apiKey')?.trim() ?? '';
    if (!apiKey) {
      throw new ServiceUnavailableException('OpenRouter API key not configured');
    }
    const model =
      this.config.get<string>('openRouter.visionModel') ??
      'google/gemini-2.5-flash';
    const normalizedMime = normalizeReceiptImageMimeType(mimeType);
    const dataUrl = `data:${normalizedMime};base64,${imageBase64}`;

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
              {
                role: 'user',
                content: [
                  { type: 'text', text: userTextContent },
                  { type: 'image_url', image_url: { url: dataUrl } },
                ] satisfies OpenRouterMultimodalContentPart[],
              },
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
        throw new HttpException('OpenRouter rate limited', HttpStatus.TOO_MANY_REQUESTS);
      }
      if (status && status >= 500) {
        throw new BadGatewayException('OpenRouter server error');
      }
      throw new BadGatewayException('OpenRouter request failed');
    }
  }
}

const RECEIPT_IMAGE_MIME_TYPES = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
} as const;

export function normalizeReceiptImageMimeType(mimeType: string): string {
  const normalized = mimeType.trim().toLowerCase();
  if (normalized in RECEIPT_IMAGE_MIME_TYPES) {
    return RECEIPT_IMAGE_MIME_TYPES[
      normalized as keyof typeof RECEIPT_IMAGE_MIME_TYPES
    ];
  }
  if (
    normalized === 'image/jpeg' ||
    normalized === 'image/png' ||
    normalized === 'image/webp'
  ) {
    return normalized;
  }
  throw new BadRequestException(
    'mimeType must be jpeg, png, webp, image/jpeg, image/png, or image/webp',
  );
}
