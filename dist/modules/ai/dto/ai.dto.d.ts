export declare class ExpenseExtractionRequestDto {
    text: string;
    defaultCurrencyCode?: string;
    userLanguage?: string;
}
export declare class LeakAnalysisTransactionDto {
    id: number;
    title: string;
    amount: number;
    currencyCode: string;
    categoryName: string;
    daysAgo: number;
    occurredAtMillis: number;
}
export declare class LeakAnalysisRecurringDto {
    id: number;
    title: string;
    amount: number;
    currencyCode: string;
    categoryName: string;
    frequency: string;
    isActive: boolean;
}
export declare class LeakAnalysisRequestDto {
    month?: string;
    userLanguage?: string;
    transactions?: LeakAnalysisTransactionDto[];
    recurringExpenses?: LeakAnalysisRecurringDto[];
    primaryCurrencyCode?: string;
    microExpenseThresholdPrimaryMinor?: number;
}
