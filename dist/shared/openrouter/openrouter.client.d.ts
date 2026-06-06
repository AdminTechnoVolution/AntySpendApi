import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
export interface OpenRouterMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export declare class OpenRouterClient {
    private readonly http;
    private readonly config;
    private readonly baseUrl;
    constructor(http: HttpService, config: ConfigService);
    chatCompletionJson<T>(systemPrompt: string, userContent: string, schemaName: string, schema: Record<string, unknown>): Promise<T>;
}
