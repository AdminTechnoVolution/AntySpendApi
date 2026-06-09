"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenRouterClient = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let OpenRouterClient = class OpenRouterClient {
    http;
    config;
    baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
    constructor(http, config) {
        this.http = http;
        this.config = config;
    }
    async chatCompletionJson(systemPrompt, userContent, schemaName, schema) {
        const apiKey = this.config.get('openRouter.apiKey')?.trim() ?? '';
        if (!apiKey) {
            throw new common_1.ServiceUnavailableException('OpenRouter API key not configured');
        }
        const model = this.config.get('openRouter.model') ??
            'google/gemini-2.5-flash-lite';
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.http.post(this.baseUrl, {
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
            }, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 60000,
            }));
            const content = response.data?.choices?.[0]?.message?.content;
            if (!content?.trim()) {
                throw new common_1.BadGatewayException('Empty OpenRouter response');
            }
            const clean = content
                .trim()
                .replace(/^```json\s*/i, '')
                .replace(/^```\s*/i, '')
                .replace(/\s*```$/i, '')
                .trim();
            return JSON.parse(clean);
        }
        catch (error) {
            if (error instanceof common_1.BadGatewayException)
                throw error;
            const status = error?.response
                ?.status;
            if (status === 401) {
                throw new common_1.ServiceUnavailableException('OpenRouter unauthorized');
            }
            if (status === 402) {
                throw new common_1.BadRequestException('OpenRouter insufficient funds');
            }
            if (status === 429) {
                throw new common_1.ServiceUnavailableException('OpenRouter rate limited');
            }
            if (status && status >= 500) {
                throw new common_1.BadGatewayException('OpenRouter server error');
            }
            throw new common_1.BadGatewayException('OpenRouter request failed');
        }
    }
};
exports.OpenRouterClient = OpenRouterClient;
exports.OpenRouterClient = OpenRouterClient = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], OpenRouterClient);
