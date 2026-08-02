import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  normalizeReceiptImageMimeType,
  OpenRouterClient,
} from '../../../shared/openrouter/openrouter.client';
import {
  EXPENSE_EXTRACTION_JSON_SCHEMA,
  LEAK_ANALYSIS_JSON_SCHEMA,
  MONTHLY_REPORT_JSON_SCHEMA,
} from '../../../shared/openrouter/openrouter.schemas';
import {
  EXPENSE_EXTRACTION_SYSTEM_PROMPT,
  LEAK_ANALYSIS_SYSTEM_PROMPT,
  MONTHLY_REPORT_SYSTEM_PROMPT,
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
import {
  ExpenseExtractionRequestDto,
  LeakAnalysisRequestDto,
  MonthlyReportRequestDto,
  ReceiptExtractionRequestDto,
} from '../dto/ai.dto';

interface ExpenseExtractionNetworkResult {
  expenses: Array<Record<string, unknown>>;
}

const MAX_RECEIPT_IMAGE_BYTES = 4 * 1024 * 1024;
const RECOMMENDED_RECEIPT_IMAGE_BYTES = 250 * 1024;
const CURRENCY_CACHE_TTL_MS = 5 * 60 * 1000;
const USER_RECEIPT_CONTEXT_CACHE_TTL_MS = 15 * 1000;
const MAX_RECEIPT_OCR_LINES = 60;

type ReceiptCatalogCurrency = {
  code: string;
  displayLabel: string;
};

type ReceiptUserContext = {
  categories: Array<{ id: string; customName?: string; key?: string }>;
  primaryCurrencyCode?: string;
  appLanguage?: string;
};

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

interface MonthlyReportNetworkResult {
  reportSummary: string;
  monthComparisonSummary: string;
  spendingChangePercent: number;
  topLeaks: Array<{
    title: string;
    amountMajor: number;
    currencyCode: string;
    explanation: string;
    suggestedAction: string;
  }>;
  budgetRecommendation: {
    categoryName: string;
    suggestedLimitMajor: number;
    currencyCode: string;
    rationale: string;
    createBudgetPrompt: string;
  };
  highlights: string[];
}

const RECEIPT_RELEVANT_LINE_PATTERN =
  /(?:total|subtotal|tax|vat|iva|impuesto|tip|propina|change|cambio|cash|efectivo|tender|card|tarjeta|visa|mastercard|amex|amount|importe|pagar|balance|\b\d{1,4}[.,]\d{2}\b|\b\d{1,4}[/-]\d{1,2}[/-]\d{1,4}\b)/i;

function selectRelevantReceiptOcrLines(
  lines: Array<Record<string, unknown>>,
): Array<Record<string, unknown>> {
  if (lines.length <= MAX_RECEIPT_OCR_LINES) return lines;

  const indexed = lines.map((line, index) => ({ line, index }));
  const tops = indexed
    .map(({ line }) => Number(line.top))
    .filter(Number.isFinite);
  const bottoms = indexed
    .map(({ line }) => Number(line.bottom))
    .filter(Number.isFinite);
  const minTop = tops.length ? Math.min(...tops) : 0;
  const maxBottom = bottoms.length ? Math.max(...bottoms) : 0;
  const headerBoundary = minTop + (maxBottom - minTop) * 0.3;

  const selected = indexed.filter(({ line, index }) => {
    const text = typeof line.text === 'string' ? line.text : '';
    const top = Number(line.top);
    return (
      index < 12 ||
      (Number.isFinite(top) && top <= headerBoundary) ||
      RECEIPT_RELEVANT_LINE_PATTERN.test(text)
    );
  });

  return selected
    .slice(0, MAX_RECEIPT_OCR_LINES)
    .sort((a, b) => a.index - b.index)
    .map(({ line }) => line);
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private currencyCache?: {
    expiresAt: number;
    value: ReceiptCatalogCurrency[];
  };
  private readonly receiptContextCache = new Map<
    string,
    { expiresAt: number; value: ReceiptUserContext }
  >();
  private readonly receiptLatencyWindow: number[] = [];
  private readonly receiptTimeoutWindow: boolean[] = [];

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

  async extractExpenses(
    userId: string,
    dto: ExpenseExtractionRequestDto,
  ): Promise<{
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
    const defaultCurrency = currencies.find(
      (c) => c.code === defaultCurrencyCode,
    );

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

    const result =
      await this.openRouter.chatCompletionJson<ExpenseExtractionNetworkResult>(
        systemPrompt,
        JSON.stringify(input),
        'expense_extraction_response',
        EXPENSE_EXTRACTION_JSON_SCHEMA,
      );

    if (!result.expenses) {
      throw new BadRequestException('Invalid AI response');
    }
    return result;
  }

  async extractFromReceipt(
    userId: string,
    dto: ReceiptExtractionRequestDto,
    abortSignal?: AbortSignal,
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

    const totalStartedAt = Date.now();
    const contextStartedAt = Date.now();
    const [currencies, userContext] = await Promise.all([
      this.getReceiptCurrencies(),
      this.getReceiptUserContext(userId),
    ]);
    const contextMillis = Date.now() - contextStartedAt;

    const defaultCurrencyCode =
      dto.defaultCurrencyCode ?? userContext.primaryCurrencyCode ?? 'USD';
    const defaultCurrency = currencies.find(
      (c) => c.code === defaultCurrencyCode,
    );

    const currencyCatalog = currencies.map((c) => ({
      id: c.code,
      code: c.code,
      name: c.displayLabel,
      aliases: [c.code.toLowerCase(), c.displayLabel.toLowerCase()],
    }));

    const categoryCatalog = userContext.categories.map((c) => ({
      id: c.id,
      name: c.customName ?? c.key ?? 'Category',
      aliases: c.key ? [c.key.replace('category_', '')] : [],
    }));

    const preparationStartedAt = Date.now();
    const relevantOcrLines = selectRelevantReceiptOcrLines(dto.ocrLines ?? []);
    const input = {
      ocrText: dto.ocrText?.trim() ? dto.ocrText.trim().slice(0, 5000) : null,
      ocrLines: relevantOcrLines,
      preliminaryResult: dto.preliminaryResult ?? null,
      defaultCurrencyId: defaultCurrency?.code ?? null,
      catalogs: {
        currencies: currencyCatalog,
        categories: categoryCatalog,
        paymentMethods: PAYMENT_METHOD_CATALOG,
      },
      userLanguage: dto.userLanguage ?? userContext.appLanguage ?? null,
    };
    const preparationMillis = Date.now() - preparationStartedAt;

    let systemPrompt = RECEIPT_EXTRACTION_SYSTEM_PROMPT;
    if (input.userLanguage) {
      systemPrompt += `\n\n### LANGUAGE REQUIREMENT:\nThe user's phone language is '${input.userLanguage}'. You MUST translate or generate all user-facing text fields (like \`title\` and explanation descriptions inside \`reviewReasons\`) in this language ('${input.userLanguage}').`;
    }

    const providerStartedAt = Date.now();
    let result: ExpenseExtractionNetworkResult;
    try {
      result =
        await this.openRouter.chatCompletionJsonWithImage<ExpenseExtractionNetworkResult>(
          systemPrompt,
          JSON.stringify(input),
          imageBase64,
          mimeType,
          'expense_extraction_response',
          EXPENSE_EXTRACTION_JSON_SCHEMA,
          abortSignal,
        );
    } catch (error: unknown) {
      const totalMillis = Date.now() - totalStartedAt;
      const status =
        typeof (error as { getStatus?: unknown })?.getStatus === 'function'
          ? (error as { getStatus: () => number }).getStatus()
          : null;
      const timedOut = status === 504;
      const latencyMetrics = this.recordReceiptLatency(totalMillis, timedOut);
      this.logger.warn({
        event: 'receipt_extraction_failed',
        totalMillis,
        contextMillis,
        preparationMillis,
        providerMillis: Date.now() - providerStartedAt,
        imageBytes: imageBytes.length,
        sentOcrLineCount: input.ocrLines.length,
        status,
        timedOut,
        ...latencyMetrics,
      });
      throw error;
    }
    const providerMillis = Date.now() - providerStartedAt;

    const validationStartedAt = Date.now();
    if (!result.expenses || result.expenses.length !== 1) {
      throw new BadRequestException('Invalid AI response');
    }
    const validationMillis = Date.now() - validationStartedAt;

    const latencyMetrics = this.recordReceiptLatency(
      Date.now() - totalStartedAt,
      false,
    );
    this.logger.log({
      event: 'receipt_extraction_completed',
      totalMillis: Date.now() - totalStartedAt,
      contextMillis,
      preparationMillis,
      providerMillis,
      validationMillis,
      imageBytes: imageBytes.length,
      imageAboveRecommendedSize:
        imageBytes.length > RECOMMENDED_RECEIPT_IMAGE_BYTES,
      hasOcrHint: Boolean(input.ocrText),
      receivedOcrLineCount: dto.ocrLines?.length ?? 0,
      sentOcrLineCount: input.ocrLines.length,
      hasPreliminaryResult: Boolean(input.preliminaryResult),
      resultCount: result.expenses?.length ?? 0,
      ...latencyMetrics,
    });

    return { expenses: result.expenses.map(normalizeReceiptDate) };
  }

  invalidateReceiptContext(userId: string): void {
    this.receiptContextCache.delete(userId);
  }

  private async getReceiptCurrencies(): Promise<ReceiptCatalogCurrency[]> {
    const now = Date.now();
    if (this.currencyCache && this.currencyCache.expiresAt > now) {
      return this.currencyCache.value;
    }
    const value = (await this.currencyModel
      .find({}, { code: 1, displayLabel: 1, _id: 0 })
      .lean()) as ReceiptCatalogCurrency[];
    this.currencyCache = {
      value,
      expiresAt: now + CURRENCY_CACHE_TTL_MS,
    };
    return value;
  }

  private async getReceiptUserContext(
    userId: string,
  ): Promise<ReceiptUserContext> {
    const now = Date.now();
    const cached = this.receiptContextCache.get(userId);
    if (cached && cached.expiresAt > now) return cached.value;

    const [categories, settings] = await Promise.all([
      this.categoryModel
        .find(
          { userId, deletedAtMillis: { $exists: false } },
          { id: 1, customName: 1, key: 1, _id: 0 },
        )
        .lean(),
      this.settingsModel
        .findOne({ userId }, { primaryCurrencyCode: 1, appLanguage: 1, _id: 0 })
        .lean(),
    ]);
    const value: ReceiptUserContext = {
      categories,
      primaryCurrencyCode: settings?.primaryCurrencyCode,
      appLanguage: settings?.appLanguage,
    };
    this.receiptContextCache.set(userId, {
      value,
      expiresAt: now + USER_RECEIPT_CONTEXT_CACHE_TTL_MS,
    });
    return value;
  }

  private recordReceiptLatency(totalMillis: number, timedOut: boolean) {
    this.receiptLatencyWindow.push(totalMillis);
    this.receiptTimeoutWindow.push(timedOut);
    if (this.receiptLatencyWindow.length > 100) {
      this.receiptLatencyWindow.shift();
      this.receiptTimeoutWindow.shift();
    }
    const sorted = [...this.receiptLatencyWindow].sort((a, b) => a - b);
    const percentile = (value: number) =>
      sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * value) - 1)];
    return {
      latencySampleSize: sorted.length,
      latencyP50Millis: percentile(0.5),
      latencyP95Millis: percentile(0.95),
      timeoutCount: this.receiptTimeoutWindow.filter(Boolean).length,
    };
  }

  async analyzeLeaks(
    userId: string,
    dto: LeakAnalysisRequestDto,
  ): Promise<{
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
        const daysAgo = Math.floor(
          (now - t.occurredAtMillis) / (24 * 60 * 60 * 1000),
        );
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

    const network =
      await this.openRouter.chatCompletionJson<LeakAnalysisNetworkResult>(
        systemPrompt,
        JSON.stringify(input),
        'leak_analysis_response',
        LEAK_ANALYSIS_JSON_SCHEMA,
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

  async generateMonthlyReport(
    userId: string,
    dto: MonthlyReportRequestDto,
  ): Promise<{
    month: string;
    previousMonth: string;
    reportSummary: string;
    monthComparisonSummary: string;
    spendingChangePercent: number;
    topLeaks: Array<Record<string, unknown>>;
    budgetRecommendation: Record<string, unknown>;
    highlights: string[];
  }> {
    const settings = await this.settingsModel.findOne({ userId }).lean();
    const primaryCurrencyCode =
      dto.primaryCurrencyCode ?? settings?.primaryCurrencyCode ?? 'USD';
    const { month, previousMonth, startMillis, endMillis } =
      this.resolveReportMonths(dto.month);

    let currentSummary = dto.currentMonthSummary;
    let previousSummary = dto.previousMonthSummary;
    let minimalTransactions = dto.transactions ?? [];
    let minimalRecurring = dto.recurringExpenses ?? [];
    let budgets = dto.budgets ?? [];

    if (!currentSummary || minimalTransactions.length === 0) {
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
        throw new BadRequestException('No transactions for report month');
      }

      const categoryMap = new Map(categories.map((c) => [c.id, c]));
      const now = Date.now();
      minimalTransactions = transactions.map((t) => {
        const cat = t.categoryId ? categoryMap.get(t.categoryId) : undefined;
        const daysAgo = Math.floor(
          (now - t.occurredAtMillis) / (24 * 60 * 60 * 1000),
        );
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
      currentSummary = this.buildMonthSummaryFromTransactions(
        transactions,
        categoryMap,
        primaryCurrencyCode,
      );
      const prevRange = this.monthRangeFor(previousMonth);
      const prevTransactions = await this.transactionModel
        .find({
          userId,
          deletedAtMillis: { $exists: false },
          occurredAtMillis: {
            $gte: prevRange.startMillis,
            $lt: prevRange.endMillis,
          },
        })
        .lean();
      previousSummary = this.buildMonthSummaryFromTransactions(
        prevTransactions,
        categoryMap,
        primaryCurrencyCode,
      );
      if (budgets.length === 0) {
        budgets = [];
      }
    }

    const input = {
      month,
      previousMonth,
      primaryCurrencyCode,
      currentMonthSummary: currentSummary,
      previousMonthSummary: previousSummary,
      transactions: minimalTransactions,
      recurringExpenses: minimalRecurring,
      budgets,
      userLanguage: dto.userLanguage ?? settings?.appLanguage ?? null,
    };

    let systemPrompt = MONTHLY_REPORT_SYSTEM_PROMPT;
    if (input.userLanguage) {
      systemPrompt += `\n\n### LANGUAGE REQUIREMENT:\nThe user's preferred language is '${input.userLanguage}'. You MUST generate all user-facing text fields in this language.`;
    }

    const network =
      await this.openRouter.chatCompletionJson<MonthlyReportNetworkResult>(
        systemPrompt,
        JSON.stringify(input),
        'monthly_report_response',
        MONTHLY_REPORT_JSON_SCHEMA,
      );

    return {
      month,
      previousMonth,
      reportSummary: network.reportSummary,
      monthComparisonSummary: network.monthComparisonSummary,
      spendingChangePercent: network.spendingChangePercent,
      topLeaks: (network.topLeaks ?? []).slice(0, 3).map((leak) => ({
        title: leak.title,
        amountMajor: leak.amountMajor,
        currencyCode: leak.currencyCode,
        explanation: leak.explanation,
        suggestedAction: leak.suggestedAction,
      })),
      budgetRecommendation: network.budgetRecommendation,
      highlights: network.highlights ?? [],
    };
  }

  private buildMonthSummaryFromTransactions(
    transactions: Array<{
      type?: string;
      primaryAmountMinor: number;
      categoryId?: string;
    }>,
    categoryMap: Map<string, { customName?: string; key?: string }>,
    currencyCode: string,
  ) {
    let totalExpense = 0;
    let totalIncome = 0;
    const byCategory = new Map<string, number>();
    for (const t of transactions) {
      const amount = t.primaryAmountMinor / 100;
      const txType = (t.type ?? 'EXPENSE').toUpperCase();
      if (txType === 'INCOME') {
        totalIncome += amount;
      } else if (txType === 'EXPENSE') {
        totalExpense += amount;
        const cat = t.categoryId ? categoryMap.get(t.categoryId) : undefined;
        const name = cat?.customName ?? cat?.key ?? 'Other';
        byCategory.set(name, (byCategory.get(name) ?? 0) + amount);
      }
    }
    const topCategories = [...byCategory.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([categoryName, amountMajor]) => ({ categoryName, amountMajor }));
    return {
      totalExpenseMajor: totalExpense,
      totalIncomeMajor: totalIncome,
      currencyCode,
      topCategories,
    };
  }

  private resolveReportMonths(month?: string) {
    const now = new Date();
    let year = now.getUTCFullYear();
    let mon = now.getUTCMonth();
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [y, m] = month.split('-').map(Number);
      year = y;
      mon = m - 1;
    } else {
      // Default: previous calendar month
      const prev = new Date(Date.UTC(year, mon, 1));
      prev.setUTCMonth(prev.getUTCMonth() - 1);
      year = prev.getUTCFullYear();
      mon = prev.getUTCMonth();
    }
    const monthStr = `${year}-${String(mon + 1).padStart(2, '0')}`;
    const prevDate = new Date(Date.UTC(year, mon, 1));
    prevDate.setUTCMonth(prevDate.getUTCMonth() - 1);
    const previousMonth = `${prevDate.getUTCFullYear()}-${String(prevDate.getUTCMonth() + 1).padStart(2, '0')}`;
    const range = this.monthRangeFor(monthStr);
    return {
      month: monthStr,
      previousMonth,
      startMillis: range.startMillis,
      endMillis: range.endMillis,
    };
  }

  private monthRangeFor(month: string) {
    const [y, m] = month.split('-').map(Number);
    const start = Date.UTC(y, m - 1, 1);
    const end = Date.UTC(y, m, 1);
    return { startMillis: start, endMillis: end };
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

function normalizeReceiptDate(
  expense: Record<string, unknown>,
): Record<string, unknown> {
  const fieldEvidence = expense.fieldEvidence as
    | Record<string, Record<string, unknown>>
    | undefined;
  const evidence = fieldEvidence?.occurredAtMillis;
  const sourceText =
    typeof evidence?.sourceText === 'string' ? evidence.sourceText : '';
  const parsedDate = parseUnambiguousReceiptDate(sourceText);
  if (!parsedDate) return expense;

  // Noon UTC preserves the receipt's calendar date across the common device
  // time zones while avoiding unreliable date arithmetic from the model.
  const occurredAtMillis = Date.UTC(
    parsedDate.year,
    parsedDate.month - 1,
    parsedDate.day,
    12,
  );
  return {
    ...expense,
    occurredAtMillis,
    fieldEvidence: fieldEvidence
      ? {
          ...fieldEvidence,
          occurredAtMillis: evidence
            ? { ...evidence, value: String(occurredAtMillis) }
            : evidence,
        }
      : fieldEvidence,
  };
}

function parseUnambiguousReceiptDate(
  sourceText: string,
): { year: number; month: number; day: number } | null {
  const iso = sourceText.match(/\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/);
  if (iso) {
    return validReceiptDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  }

  const regional = sourceText.match(/\b(\d{1,2})[/-](\d{1,2})[/-](20\d{2})\b/);
  if (!regional) return null;
  const first = Number(regional[1]);
  const second = Number(regional[2]);
  const year = Number(regional[3]);
  if (second > 12) return validReceiptDate(year, first, second);
  if (first > 12) return validReceiptDate(year, second, first);
  return null;
}

function validReceiptDate(
  year: number,
  month: number,
  day: number,
): { year: number; month: number; day: number } | null {
  const value = new Date(Date.UTC(year, month - 1, day));
  return value.getUTCFullYear() === year &&
    value.getUTCMonth() === month - 1 &&
    value.getUTCDate() === day
    ? { year, month, day }
    : null;
}
