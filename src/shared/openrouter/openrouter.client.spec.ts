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
      },
      { timeout: number; signal: AbortSignal },
    ];
    expect(body.model).toBe('google/gemini-2.5-flash');
    expect(body.max_tokens).toBe(900);
    expect(body.temperature).toBe(0);
    expect(body.plugins).toBeUndefined();
    expect(options.timeout).toBe(15000);
    expect(options.signal).toBe(signal);
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
