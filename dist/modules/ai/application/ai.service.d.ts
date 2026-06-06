import { Model } from 'mongoose';
import { OpenRouterClient } from '../../../shared/openrouter/openrouter.client';
import { CategoryDocument, CurrencyDocument, RecurringExpenseDocument, TransactionDocument, UserSettingsDocument } from '../../../shared/database/entity.schemas';
import { ExpenseExtractionRequestDto, LeakAnalysisRequestDto } from '../dto/ai.dto';
export declare class AiService {
    private readonly openRouter;
    private readonly currencyModel;
    private readonly categoryModel;
    private readonly settingsModel;
    private readonly transactionModel;
    private readonly recurringModel;
    constructor(openRouter: OpenRouterClient, currencyModel: Model<CurrencyDocument>, categoryModel: Model<CategoryDocument>, settingsModel: Model<UserSettingsDocument>, transactionModel: Model<TransactionDocument>, recurringModel: Model<RecurringExpenseDocument>);
    extractExpenses(userId: string, dto: ExpenseExtractionRequestDto): Promise<{
        expenses: Array<Record<string, unknown>>;
    }>;
    analyzeLeaks(userId: string, dto: LeakAnalysisRequestDto): Promise<{
        detectedLeaks: Array<Record<string, unknown>>;
        totalEstimatedMonthlyLeakImpact: number;
        auditSummary: string;
        leakScore: number;
    }>;
    private resolveMonthRange;
}
