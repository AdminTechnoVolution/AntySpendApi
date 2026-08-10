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
      lean: jest
        .fn()
        .mockResolvedValue([
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
    const call = chatCompletionJsonWithImage.mock.calls[0] as unknown as [
      string,
      string,
      string,
      string,
      string,
      Record<string, unknown>,
    ];
    const [
      systemPrompt,
      userContent,
      imageBase64,
      mimeType,
      schemaName,
      schema,
    ] = call;

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
    expect(schema).toEqual(EXPENSE_EXTRACTION_JSON_SCHEMA);
    expect(result.expenses).toHaveLength(1);
  });

  it('caches receipt catalogs and user context across nearby scans', async () => {
    await service.extractFromReceipt('user-1', {
      imageBase64: tinyPngBase64,
      mimeType: 'png',
    });
    await service.extractFromReceipt('user-1', {
      imageBase64: tinyPngBase64,
      mimeType: 'png',
    });

    expect(currencyFind).toHaveBeenCalledTimes(1);
    expect(categoryFind).toHaveBeenCalledTimes(1);
    expect(settingsFindOne).toHaveBeenCalledTimes(1);
    expect(chatCompletionJsonWithImage).toHaveBeenCalledTimes(2);
  });

  it('sends only spatially and semantically relevant OCR lines', async () => {
    const ocrLines = Array.from({ length: 100 }, (_, index) => ({
      text: index === 99 ? 'GRAND TOTAL 9.72' : `line ${index}`,
      left: 0,
      top: index * 20,
      right: 100,
      bottom: index * 20 + 10,
    }));

    await service.extractFromReceipt('user-1', {
      imageBase64: tinyPngBase64,
      mimeType: 'png',
      ocrLines,
    });

    const call = chatCompletionJsonWithImage.mock.calls[0] as unknown as [
      string,
      string,
    ];
    const input = JSON.parse(call[1]) as {
      ocrLines: Array<{ text: string }>;
    };
    expect(input.ocrLines.length).toBeLessThanOrEqual(60);
    expect(
      input.ocrLines.some((line) => line.text === 'GRAND TOTAL 9.72'),
    ).toBe(true);
  });

  it('normalizes an unambiguous receipt date instead of trusting model epoch arithmetic', async () => {
    chatCompletionJsonWithImage.mockResolvedValueOnce({
      expenses: [
        {
          title: "McDonald's purchase",
          occurredAtMillis: 1785578280000,
          fieldEvidence: {
            occurredAtMillis: {
              value: '1785578280000',
              sourceText: '07/31/2026 05:18 PM',
              confidence: 0.98,
              reason: 'Visible receipt date',
            },
          },
        },
      ],
    });

    const result = await service.extractFromReceipt('user-1', {
      imageBase64: tinyPngBase64,
      mimeType: 'png',
    });

    expect(result.expenses[0].occurredAtMillis).toBe(Date.UTC(2026, 6, 31, 12));
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

  it('requires lineItems in the receipt JSON schema for itemized products', () => {
    const expenseItemSchema = (
      EXPENSE_EXTRACTION_JSON_SCHEMA.properties.expenses.items as {
        properties: { lineItems: unknown };
        required: string[];
      }
    ).properties.lineItems;

    expect(expenseItemSchema).toBeDefined();
    expect(
      (
        EXPENSE_EXTRACTION_JSON_SCHEMA.properties.expenses
          .items as unknown as { required: string[] }
      ).required,
    ).toContain('lineItems');
  });

  it('passes AI-extracted line items through to the response untouched', async () => {
    chatCompletionJsonWithImage.mockResolvedValueOnce({
      expenses: [
        {
          title: 'Groceries',
          store: 'Fresh Market',
          amount: 18.4,
          confidence: 0.94,
          requiresReview: false,
          reviewReasons: [],
          lineItems: [
            { name: 'Milk', amountMajor: 3.2 },
            { name: 'Bread', amountMajor: 2.1 },
            { name: 'Eggs', amountMajor: 4.5 },
          ],
        },
      ],
    });

    const result = await service.extractFromReceipt('user-1', {
      imageBase64: tinyPngBase64,
      mimeType: 'png',
      userLanguage: 'en',
    });

    expect(result.expenses[0].lineItems).toEqual([
      { name: 'Milk', amountMajor: 3.2 },
      { name: 'Bread', amountMajor: 2.1 },
      { name: 'Eggs', amountMajor: 4.5 },
    ]);
  });
});

describe('AiService.generateMonthlyReport', () => {
  const chatCompletionJson = jest.fn();
  const openRouter = { chatCompletionJson };

  const currencyFind = jest.fn();
  const categoryFind = jest.fn();
  const settingsFindOne = jest.fn();
  const transactionFind = jest.fn();
  const recurringFind = jest.fn();

  const currencyModel = { find: currencyFind };
  const categoryModel = { find: categoryFind };
  const settingsModel = { findOne: settingsFindOne };
  const transactionModel = { find: transactionFind };
  const recurringModel = { find: recurringFind };

  let service: AiService;

  beforeEach(() => {
    jest.clearAllMocks();
    settingsFindOne.mockReturnValue({
      lean: jest
        .fn()
        .mockResolvedValue({ primaryCurrencyCode: 'USD', appLanguage: 'en' }),
    });
    categoryFind.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
    recurringFind.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
    transactionFind.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        {
          id: 'tx-1',
          title: 'Coffee',
          primaryAmountMinor: 500,
          primaryCurrencyCode: 'USD',
          type: 'EXPENSE',
          occurredAtMillis: Date.now(),
        },
      ]),
    });
    chatCompletionJson.mockResolvedValue({
      reportSummary: 'Good month',
      monthComparisonSummary: 'Spent less',
      spendingChangePercent: -5,
      topLeaks: [],
      budgetRecommendation: {
        categoryName: 'Food',
        suggestedLimitMajor: 200,
        currencyCode: 'USD',
        rationale: 'High spend',
        createBudgetPrompt: 'Create a Food budget?',
      },
      highlights: ['Win'],
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

  it('returns structured monthly report for client payload', async () => {
    const result = await service.generateMonthlyReport('user-1', {
      month: '2026-05',
      currentMonthSummary: {
        totalExpenseMajor: 100,
        totalIncomeMajor: 200,
        currencyCode: 'USD',
        topCategories: [{ categoryName: 'Food', amountMajor: 50 }],
      },
      previousMonthSummary: {
        totalExpenseMajor: 120,
        totalIncomeMajor: 200,
        currencyCode: 'USD',
        topCategories: [],
      },
      transactions: [
        {
          id: 1,
          title: 'Coffee',
          amount: 5,
          currencyCode: 'USD',
          categoryName: 'Food',
          daysAgo: 1,
          occurredAtMillis: Date.now(),
        },
      ],
    });

    expect(chatCompletionJson).toHaveBeenCalled();
    expect(result.reportSummary).toBe('Good month');
    expect(result.month).toBe('2026-05');
    expect(result.budgetRecommendation.categoryName).toBe('Food');
  });
});
