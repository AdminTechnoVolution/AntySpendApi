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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const openrouter_client_1 = require("../../../shared/openrouter/openrouter.client");
const openrouter_schemas_1 = require("../../../shared/openrouter/openrouter.schemas");
const ai_prompts_1 = require("../../../shared/prompts/ai.prompts");
const catalog_constants_1 = require("../../../shared/constants/catalog.constants");
const entity_schemas_1 = require("../../../shared/database/entity.schemas");
let AiService = class AiService {
    openRouter;
    currencyModel;
    categoryModel;
    settingsModel;
    transactionModel;
    recurringModel;
    constructor(openRouter, currencyModel, categoryModel, settingsModel, transactionModel, recurringModel) {
        this.openRouter = openRouter;
        this.currencyModel = currencyModel;
        this.categoryModel = categoryModel;
        this.settingsModel = settingsModel;
        this.transactionModel = transactionModel;
        this.recurringModel = recurringModel;
    }
    async extractExpenses(userId, dto) {
        if (!dto.text.trim()) {
            throw new common_1.BadRequestException('Text is empty');
        }
        const [currencies, categories, settings] = await Promise.all([
            this.currencyModel.find().lean(),
            this.categoryModel
                .find({ userId, deletedAtMillis: { $exists: false } })
                .lean(),
            this.settingsModel.findOne({ userId }).lean(),
        ]);
        const defaultCurrencyCode = dto.defaultCurrencyCode ?? settings?.primaryCurrencyCode ?? 'USD';
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
                paymentMethods: catalog_constants_1.PAYMENT_METHOD_CATALOG,
            },
            userLanguage: dto.userLanguage ?? settings?.appLanguage ?? null,
        };
        let systemPrompt = ai_prompts_1.EXPENSE_EXTRACTION_SYSTEM_PROMPT;
        if (input.userLanguage) {
            systemPrompt += `\n\n### LANGUAGE REQUIREMENT:\nThe user's phone language is '${input.userLanguage}'. You MUST translate or generate all user-facing text fields (like \`title\` and explanation descriptions inside \`reviewReasons\`) in this language ('${input.userLanguage}').`;
        }
        const result = await this.openRouter.chatCompletionJson(systemPrompt, JSON.stringify(input), 'expense_extraction_response', openrouter_schemas_1.EXPENSE_EXTRACTION_JSON_SCHEMA);
        if (!result.expenses) {
            throw new common_1.BadRequestException('Invalid AI response');
        }
        return result;
    }
    async analyzeLeaks(userId, dto) {
        const settings = await this.settingsModel.findOne({ userId }).lean();
        const primaryCurrencyCode = dto.primaryCurrencyCode ?? settings?.primaryCurrencyCode ?? 'USD';
        const microThreshold = dto.microExpenseThresholdPrimaryMinor ??
            settings?.microExpenseThresholdPrimaryMinor ??
            0;
        const { startMillis, endMillis } = this.resolveMonthRange(dto.month);
        let minimalTransactions;
        let minimalRecurring;
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
        }
        else {
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
                throw new common_1.BadRequestException('No transactions for analysis period');
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
            throw new common_1.BadRequestException('No transactions for analysis period');
        }
        const input = {
            transactions: minimalTransactions,
            recurringExpenses: minimalRecurring,
            primaryCurrencyCode,
            microExpenseThresholdPrimaryMinor: microThreshold,
            userLanguage: dto.userLanguage ?? settings?.appLanguage ?? null,
        };
        let systemPrompt = ai_prompts_1.LEAK_ANALYSIS_SYSTEM_PROMPT;
        if (input.userLanguage) {
            systemPrompt += `\n\n### LANGUAGE REQUIREMENT:\nThe user's preferred language is '${input.userLanguage}'. You MUST generate all user-facing text fields in this language.`;
        }
        const network = await this.openRouter.chatCompletionJson(systemPrompt, JSON.stringify(input), 'leak_analysis_response', openrouter_schemas_1.LEAK_ANALYSIS_JSON_SCHEMA);
        const detectedLeaks = (network.detectedLeaks ?? []).map((dto) => ({
            title: dto.title,
            description: dto.explanation,
            severity: dto.severity,
            categoryName: 'Gastos Hormiga',
            estimatedMonthlyImpact: dto.aggregateAmount,
            transactionIds: dto.associatedTransactionIds,
            recurringExpenseIds: [],
            suggestedAction: dto.savingTip,
        }));
        return {
            detectedLeaks,
            totalEstimatedMonthlyLeakImpact: detectedLeaks.reduce((sum, l) => sum + l.estimatedMonthlyImpact, 0),
            auditSummary: network.leakSummary,
            leakScore: network.leakScore,
        };
    }
    resolveMonthRange(month) {
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
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectModel)(entity_schemas_1.Currency.name)),
    __param(2, (0, mongoose_1.InjectModel)(entity_schemas_1.Category.name)),
    __param(3, (0, mongoose_1.InjectModel)(entity_schemas_1.UserSettings.name)),
    __param(4, (0, mongoose_1.InjectModel)(entity_schemas_1.Transaction.name)),
    __param(5, (0, mongoose_1.InjectModel)(entity_schemas_1.RecurringExpense.name)),
    __metadata("design:paramtypes", [openrouter_client_1.OpenRouterClient,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], AiService);
//# sourceMappingURL=ai.service.js.map