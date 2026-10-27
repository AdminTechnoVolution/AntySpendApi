import { GatewayTimeoutException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { OpenRouterClient } from './openrouter.client';

describe('OpenRouterClient receipt extraction', () => {
  const post = jest.fn();
  const values: Record<string, unknown> = {
    'openRouter.apiKey': 'test-key',
    'openRouter.receiptModel': 'google/gemini-2.5-flash',
    'openRouter.receiptTimeoutMs': 15000,
    'openRouter.receiptMaxTokens': 900,
  };
  const config = { get: jest.fn((key: string) => values[key]) };
  let client: OpenRouterClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new OpenRouterClient({ post } as never, config as never);
  });

  it('uses the dedicated receipt limits without response healing', async () => {
    post.mockReturnValue(
      of({ data: { choices: [{ message: { content: '{"expenses":[]}' } }] } }),
    );
    const signal = new AbortController().signal;

    await client.chatCompletionJsonWithImage(
      'system',
      '{}',
      'aGVsbG8=',
      'jpeg',
      'receipt',
      { type: 'object' },
      signal,
    );

    const [, body, options] = post.mock.calls[0] as unknown as [
      string,
      {
        model: string;
        max_tokens: number;
        temperature: number;
        plugins?: unknown;
        provider: { data_collection: string; zdr?: boolean };
      },
      { timeout: number; signal: AbortSignal },
    ];
    expect(body.model).toBe('google/gemini-2.5-flash');
    expect(body.max_tokens).toBe(900);
    expect(body.temperature).toBe(0);
    expect(body.plugins).toBeUndefined();
    expect(body.provider.data_collection).toBe('deny');
    expect(body.provider.zdr).toBeUndefined();
    expect(options.timeout).toBe(15000);
    expect(options.signal).toBe(signal);
  });

  it('does not require zero data retention for text completions', async () => {
    post.mockReturnValue(
      of({ data: { choices: [{ message: { content: '{"expenses":[]}' } }] } }),
    );

    await client.chatCompletionJson(
      'system',
      '{}',
      'expenses',
      { type: 'object' },
    );

    const [, body] = post.mock.calls[0] as unknown as [
      string,
      { provider: { data_collection: string; zdr?: boolean } },
    ];
    expect(body.provider.data_collection).toBe('deny');
    expect(body.provider.zdr).toBeUndefined();
  });

  it('maps provider timeouts to a gateway timeout', async () => {
    post.mockReturnValue(
      throwError(() =>
        Object.assign(new Error('timeout'), { code: 'ECONNABORTED' }),
      ),
    );

    await expect(
      client.chatCompletionJsonWithImage(
        'system',
        '{}',
        'aGVsbG8=',
        'jpeg',
        'receipt',
        { type: 'object' },
      ),
    ).rejects.toBeInstanceOf(GatewayTimeoutException);
  });
});


describe('OpenRouter model fallback routing', () => {
  it('keeps a structured-output fallback when an environment names a retired model', async () => {
    const post = jest.fn().mockReturnValue(of({ data: { model: 'google/gemini-2.5-flash-lite', choices: [{ message: { content: '{"reply":"ok"}' } }] } }));
    const config = { get: (key: string) => ({ 'openRouter.apiKey': 'test-key', 'openRouter.model': 'qwen/qwen3-vl-32b-instruct' })[key] };
    const client = new OpenRouterClient({ post } as never, config as never);
    await expect(client.chatCompletionJson('system', '{}', 'anty_financial_turn_v2', { type: 'object' })).resolves.toEqual({ reply: 'ok' });
    expect(post.mock.calls[0][1]).toMatchObject({ models: ['qwen/qwen3-vl-32b-instruct', 'qwen/qwen3.7-plus'], max_tokens: 6000, provider: { require_parameters: true, data_collection: 'deny' } });
  });
  it('does not repeat the configured model when it is already the fallback', async () => {
    const post = jest.fn().mockReturnValue(of({ data: { choices: [{ message: { content: '{}' } }] } }));
    const client = new OpenRouterClient({ post } as never, { get: (key: string) => key === 'openRouter.apiKey' ? 'test-key' : key === 'openRouter.model' ? 'qwen/qwen3.7-plus' : undefined } as never);
    await client.chatCompletionJson('system', '{}', 'test', { type: 'object' });
    expect(post.mock.calls[0][1].models).toEqual(['qwen/qwen3.7-plus']);
  });
});
