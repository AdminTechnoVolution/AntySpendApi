import { BadRequestException } from '@nestjs/common';
import { EXPENSE_EXTRACTION_JSON_SCHEMA } from '../../../shared/openrouter/openrouter.schemas';
import { RECEIPT_EXTRACTION_SYSTEM_PROMPT } from '../../../shared/prompts/ai.prompts';
import { AiService } from './ai.service';

describe('AiService.extractFromReceipt', () => {
  const chatCompletionJsonWithImage = jest.fn();
  const openRouter = { chatCompletionJsonWithImage };

  const currencyFind = jest.fn();
  const categoryFind = jest.fn();
  const settingsFindOne = jest.fn();

  const currencyModel = { find: currencyFind };
  const categoryModel = { find: categoryFind };
  const settingsModel = { findOne: settingsFindOne };
  const transactionModel = { find: jest.fn() };
  const recurringModel = { find: jest.fn() };

  let service: AiService;

  const tinyPngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

  beforeEach(() => {
    jest.clearAllMocks();
    currencyFind.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { code: 'USD', displayLabel: 'US Dollar' },
        { code: 'MXN', displayLabel: 'Mexican Peso' },
      ]),
    });
    categoryFind.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { id: 'cat-1', customName: 'Food & Drinks', key: 'category_food' },
      ]),
    });
    settingsFindOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        primaryCurrencyCode: 'USD',
        appLanguage: 'en',
      }),
    });
    chatCompletionJsonWithImage.mockResolvedValue({
      expenses: [
        {
          title: 'Coffee Shop',
          amount: 12.5,
          confidence: 0.92,
          requiresReview: false,
          reviewReasons: [],
        },
      ],
    });

    service = new AiService(
      openRouter as never,
      currencyModel as never,
      categoryModel as never,
      settingsModel as never,
      transactionModel as never,
      recurringModel as never,
    );
  });

  it('calls OpenRouter vision with receipt prompt, catalogs, and image', async () => {
    const result = await service.extractFromReceipt('user-1', {
      imageBase64: tinyPngBase64,
      mimeType: 'png',
      ocrText: 'TOTAL 12.50 USD',
      userLanguage: 'es',
    });

    expect(chatCompletionJsonWithImage).toHaveBeenCalledTimes(1);
    const [systemPrompt, userContent, imageBase64, mimeType, schemaName, schema] =
      chatCompletionJsonWithImage.mock.calls[0];

    expect(systemPrompt).toContain(RECEIPT_EXTRACTION_SYSTEM_PROMPT);
    expect(systemPrompt).toContain("user's phone language is 'es'");

    const parsedInput = JSON.parse(userContent) as {
      ocrText: string;
      defaultCurrencyId: string;
      userLanguage: string;
      catalogs: {
        currencies: unknown[];
        categories: unknown[];
        paymentMethods: unknown[];
      };
    };
    expect(parsedInput.ocrText).toBe('TOTAL 12.50 USD');
    expect(parsedInput.defaultCurrencyId).toBe('USD');
    expect(parsedInput.userLanguage).toBe('es');
    expect(parsedInput.catalogs.currencies).toHaveLength(2);
    expect(parsedInput.catalogs.categories).toHaveLength(1);
    expect(parsedInput.catalogs.paymentMethods.length).toBeGreaterThan(0);

    expect(imageBase64).toBe(tinyPngBase64);
    expect(mimeType).toBe('image/png');
    expect(schemaName).toBe('expense_extraction_response');
    expect(schema).toEqual(
      EXPENSE_EXTRACTION_JSON_SCHEMA as unknown as Record<string, unknown>,
    );
    expect(result.expenses).toHaveLength(1);
  });

  it('rejects images larger than 4 MB decoded', async () => {
    const oversizedBase64 = Buffer.alloc(4 * 1024 * 1024 + 1, 1).toString(
      'base64',
    );

    await expect(
      service.extractFromReceipt('user-1', {
        imageBase64: oversizedBase64,
        mimeType: 'jpeg',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(chatCompletionJsonWithImage).not.toHaveBeenCalled();
  });

  it('rejects data URL prefixed base64', async () => {
    await expect(
      service.extractFromReceipt('user-1', {
        imageBase64: `data:image/png;base64,${tinyPngBase64}`,
        mimeType: 'png',
      }),
    ).rejects.toThrow('imageBase64 must not include a data: URL prefix');

    expect(chatCompletionJsonWithImage).not.toHaveBeenCalled();
  });

  it('rejects invalid AI responses without expenses', async () => {
    chatCompletionJsonWithImage.mockResolvedValue({});

    await expect(
      service.extractFromReceipt('user-1', {
        imageBase64: tinyPngBase64,
        mimeType: 'webp',
      }),
    ).rejects.toThrow('Invalid AI response');
  });
});
