import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { normalizeReceiptImageMimeType, OpenRouterClient } from '../../../shared/openrouter/openrouter.client';
import {
  EXPENSE_EXTRACTION_JSON_SCHEMA,
  LEAK_ANALYSIS_JSON_SCHEMA,
} from '../../../shared/openrouter/openrouter.schemas';
import {
  EXPENSE_EXTRACTION_SYSTEM_PROMPT,
  LEAK_ANALYSIS_SYSTEM_PROMPT,
  RECEIPT_EXTRACTION_SYSTEM_PROMPT,
} from '../../../shared/prompts/ai.prompts';
import { PAYMENT_METHOD_CATALOG } from '../../../shared/constants/catalog.constants';
import {
  Category,
  CategoryDocument,
  Currency,
  CurrencyDocument,
  RecurringExpense,
  RecurringExpenseDocument,
  Transaction,
  TransactionDocument,
  UserSettings,
  UserSettingsDocument,
} from '../../../shared/database/entity.schemas';
import { ExpenseExtractionRequestDto, LeakAnalysisRequestDto, ReceiptExtractionRequestDto } from '../dto/ai.dto';

interface ExpenseExtractionNetworkResult {
  expenses: Array<Record<string, unknown>>;
}

const MAX_RECEIPT_IMAGE_BYTES = 4 * 1024 * 1024;

interface LeakAnalysisNetworkResult {
  leakScore: number;
  leakSummary: string;
  detectedLeaks: Array<{
    title: string;
    explanation: string;
    savingTip: string;
    frequency: string;
    aggregateAmount: number;
    currencyCode: string;
    severity: string;
    associatedTransactionIds: number[];
  }>;
}

@Injectable()
export class AiService {
  constructor(
    private readonly openRouter: OpenRouterClient,
    @InjectModel(Currency.name)
    private readonly currencyModel: Model<CurrencyDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(UserSettings.name)
    private readonly settingsModel: Model<UserSettingsDocument>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(RecurringExpense.name)
    private readonly recurringModel: Model<RecurringExpenseDocument>,
  ) {}

  async extractExpenses(userId: string, dto: ExpenseExtractionRequestDto): Promise<{
    expenses: Array<Record<string, unknown>>;
  }> {
    if (!dto.text.trim()) {
      throw new BadRequestException('Text is empty');
    }

    const [currencies, categories, settings] = await Promise.all([
      this.currencyModel.find().lean(),
      this.categoryModel
        .find({ userId, deletedAtMillis: { $exists: false } })
        .lean(),
      this.settingsModel.findOne({ userId }).lean(),
    ]);

    const defaultCurrencyCode =
      dto.defaultCurrencyCode ?? settings?.primaryCurrencyCode ?? 'USD';
    const defaultCurrency = currencies.find((c) => c.code === defaultCurrencyCode);

    const currencyCatalog = currencies.map((c) => ({
      id: c.code,
      code: c.code,
      name: c.displayLabel,
      aliases: [c.code.toLowerCase(), c.displayLabel.toLowerCase()],
    }));

    const categoryCatalog = categories.map((c) => ({
      id: c.id,
      name: c.customName ?? c.key ?? 'Category',
      aliases: c.key ? [c.key.replace('category_', '')] : [],
    }));

    const input = {
      text: dto.text,
      defaultCurrencyId: defaultCurrency?.code ?? null,
      catalogs: {
        currencies: currencyCatalog,
        categories: categoryCatalog,
        paymentMethods: PAYMENT_METHOD_CATALOG,
      },
      userLanguage: dto.userLanguage ?? settings?.appLanguage ?? null,
    };

    let systemPrompt = EXPENSE_EXTRACTION_SYSTEM_PROMPT;
    if (input.userLanguage) {
      systemPrompt += `\n\n### LANGUAGE REQUIREMENT:\nThe user's phone language is '${input.userLanguage}'. You MUST translate or generate all user-facing text fields (like \`title\` and explanation descriptions inside \`reviewReasons\`) in this language ('${input.userLanguage}').`;
    }

    const result = await this.openRouter.chatCompletionJson<ExpenseExtractionNetworkResult>(
      systemPrompt,
      JSON.stringify(input),
      'expense_extraction_response',
      EXPENSE_EXTRACTION_JSON_SCHEMA as unknown as Record<string, unknown>,
    );

    if (!result.expenses) {
      throw new BadRequestException('Invalid AI response');
    }
    return result;
  }

  async extractFromReceipt(
    userId: string,
    dto: ReceiptExtractionRequestDto,
  ): Promise<{
    expenses: Array<Record<string, unknown>>;
  }> {
    const imageBase64 = dto.imageBase64.trim();
    if (!imageBase64) {
      throw new BadRequestException('Image is empty');
    }
    if (imageBase64.startsWith('data:')) {
      throw new BadRequestException(
        'imageBase64 must not include a data: URL prefix',
      );
    }

    let imageBytes: Buffer;
    try {
      imageBytes = Buffer.from(imageBase64, 'base64');
    } catch {
      throw new BadRequestException('imageBase64 is not valid base64');
    }
    if (imageBytes.length === 0) {
      throw new BadRequestException('Image is empty');
    }
    if (imageBytes.length > MAX_RECEIPT_IMAGE_BYTES) {
      throw new BadRequestException(
        `Image exceeds maximum size of ${MAX_RECEIPT_IMAGE_BYTES} bytes`,
      );
    }

    const mimeType = normalizeReceiptImageMimeType(dto.mimeType);

    const [currencies, categories, settings] = await Promise.all([
      this.currencyModel.find().lean(),
      this.categoryModel
        .find({ userId, deletedAtMillis: { $exists: false } })
        .lean(),
      this.settingsModel.findOne({ userId }).lean(),
    ]);

    const defaultCurrencyCode =
      dto.defaultCurrencyCode ?? settings?.primaryCurrencyCode ?? 'USD';
    const defaultCurrency = currencies.find((c) => c.code === defaultCurrencyCode);

    const currencyCatalog = currencies.map((c) => ({
      id: c.code,
      code: c.code,
      name: c.displayLabel,
      aliases: [c.code.toLowerCase(), c.displayLabel.toLowerCase()],
    }));

    const categoryCatalog = categories.map((c) => ({
      id: c.id,
      name: c.customName ?? c.key ?? 'Category',
      aliases: c.key ? [c.key.replace('category_', '')] : [],
    }));

    const input = {
      ocrText: dto.ocrText?.trim() ? dto.ocrText.trim() : null,
      defaultCurrencyId: defaultCurrency?.code ?? null,
      catalogs: {
        currencies: currencyCatalog,
        categories: categoryCatalog,
        paymentMethods: PAYMENT_METHOD_CATALOG,
      },
      userLanguage: dto.userLanguage ?? settings?.appLanguage ?? null,
    };

    let systemPrompt = RECEIPT_EXTRACTION_SYSTEM_PROMPT;
    if (input.userLanguage) {
      systemPrompt += `\n\n### LANGUAGE REQUIREMENT:\nThe user's phone language is '${input.userLanguage}'. You MUST translate or generate all user-facing text fields (like \`title\` and explanation descriptions inside \`reviewReasons\`) in this language ('${input.userLanguage}').`;
    }

    const result =
      await this.openRouter.chatCompletionJsonWithImage<ExpenseExtractionNetworkResult>(
        systemPrompt,
        JSON.stringify(input),
        imageBase64,
        mimeType,
        'expense_extraction_response',
        EXPENSE_EXTRACTION_JSON_SCHEMA as unknown as Record<string, unknown>,
      );

    if (!result.expenses) {
      throw new BadRequestException('Invalid AI response');
    }
    return result;
  }

  async analyzeLeaks(userId: string, dto: LeakAnalysisRequestDto): Promise<{
    detectedLeaks: Array<Record<string, unknown>>;
    totalEstimatedMonthlyLeakImpact: number;
    auditSummary: string;
    leakScore: number;
  }> {
    const settings = await this.settingsModel.findOne({ userId }).lean();
    const primaryCurrencyCode =
      dto.primaryCurrencyCode ?? settings?.primaryCurrencyCode ?? 'USD';
    const microThreshold =
      dto.microExpenseThresholdPrimaryMinor ??
      settings?.microExpenseThresholdPrimaryMinor ??
      0;

    const { startMillis, endMillis } = this.resolveMonthRange(dto.month);

    let minimalTransactions: Array<{
      id: number;
      title: string;
      amount: number;
      currencyCode: string;
      categoryName: string;
      daysAgo: number;
      occurredAtMillis: number;
    }>;
    let minimalRecurring: Array<{
      id: number;
      title: string;
      amount: number;
      currencyCode: string;
      categoryName: string;
      frequency: string;
      isActive: boolean;
    }>;

    if (dto.transactions && dto.transactions.length > 0) {
      minimalTransactions = dto.transactions.map((t) => ({
        id: t.id,
        title: t.title,
        amount: t.amount,
        currencyCode: t.currencyCode,
        categoryName: t.categoryName,
        daysAgo: t.daysAgo,
        occurredAtMillis: t.occurredAtMillis,
      }));
      minimalRecurring = (dto.recurringExpenses ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        amount: r.amount,
        currencyCode: r.currencyCode,
        categoryName: r.categoryName,
        frequency: r.frequency,
        isActive: r.isActive,
      }));
    } else {
      const [transactions, recurringExpenses, categories] = await Promise.all([
        this.transactionModel
          .find({
            userId,
            deletedAtMillis: { $exists: false },
            occurredAtMillis: { $gte: startMillis, $lt: endMillis },
          })
          .lean(),
        this.recurringModel
          .find({ userId, deletedAtMillis: { $exists: false }, isActive: true })
          .lean(),
        this.categoryModel
          .find({ userId, deletedAtMillis: { $exists: false } })
          .lean(),
      ]);

      if (transactions.length === 0) {
        throw new BadRequestException('No transactions for analysis period');
      }

      const categoryMap = new Map(categories.map((c) => [c.id, c]));
      const now = Date.now();

      minimalTransactions = transactions.map((t) => {
        const cat = t.categoryId ? categoryMap.get(t.categoryId) : undefined;
        const daysAgo = Math.floor((now - t.occurredAtMillis) / (24 * 60 * 60 * 1000));
        return {
          id: parseInt(t.id.slice(0, 8), 16) % 1000000,
          title: t.title ?? 'Transaction',
          amount: t.primaryAmountMinor / 100,
          currencyCode: t.primaryCurrencyCode,
          categoryName: cat?.customName ?? cat?.key ?? 'Other',
          daysAgo,
          occurredAtMillis: t.occurredAtMillis,
        };
      });

      minimalRecurring = recurringExpenses.map((r) => {
        const cat = r.categoryId ? categoryMap.get(r.categoryId) : undefined;
        return {
          id: parseInt(r.id.slice(0, 8), 16) % 1000000,
          title: r.title,
          amount: r.amountMinor / 100,
          currencyCode: r.currencyCode,
          categoryName: cat?.customName ?? cat?.key ?? 'Other',
          frequency: r.frequency,
          isActive: r.isActive,
        };
      });
    }

    if (minimalTransactions.length === 0) {
      throw new BadRequestException('No transactions for analysis period');
    }

    const input = {
      transactions: minimalTransactions,
      recurringExpenses: minimalRecurring,
      primaryCurrencyCode,
      microExpenseThresholdPrimaryMinor: microThreshold,
      userLanguage: dto.userLanguage ?? settings?.appLanguage ?? null,
    };

    let systemPrompt = LEAK_ANALYSIS_SYSTEM_PROMPT;
    if (input.userLanguage) {
      systemPrompt += `\n\n### LANGUAGE REQUIREMENT:\nThe user's preferred language is '${input.userLanguage}'. You MUST generate all user-facing text fields in this language.`;
    }

    const network = await this.openRouter.chatCompletionJson<LeakAnalysisNetworkResult>(
      systemPrompt,
      JSON.stringify(input),
      'leak_analysis_response',
      LEAK_ANALYSIS_JSON_SCHEMA as unknown as Record<string, unknown>,
    );

    const detectedLeaks = (network.detectedLeaks ?? []).map((dto) => ({
      title: dto.title,
      description: dto.explanation,
      severity: dto.severity,
      categoryName: 'Gastos Hormiga',
      estimatedMonthlyImpact: dto.aggregateAmount,
      transactionIds: dto.associatedTransactionIds,
      recurringExpenseIds: [] as number[],
      suggestedAction: dto.savingTip,
    }));

    return {
      detectedLeaks,
      totalEstimatedMonthlyLeakImpact: detectedLeaks.reduce(
        (sum, l) => sum + l.estimatedMonthlyImpact,
        0,
      ),
      auditSummary: network.leakSummary,
      leakScore: network.leakScore,
    };
  }

  private resolveMonthRange(month?: string) {
    const now = new Date();
    let year = now.getUTCFullYear();
    let mon = now.getUTCMonth();
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [y, m] = month.split('-').map(Number);
      year = y;
      mon = m - 1;
    }
    const start = Date.UTC(year, mon, 1);
    const end = Date.UTC(year, mon + 1, 1);
    return { startMillis: start, endMillis: end };
  }
}
