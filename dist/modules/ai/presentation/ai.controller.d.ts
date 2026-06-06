import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import { AiService } from '../application/ai.service';
import { ExpenseExtractionRequestDto, LeakAnalysisRequestDto } from '../dto/ai.dto';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    extractExpenses(user: AuthenticatedUser, dto: ExpenseExtractionRequestDto): Promise<{
        expenses: Array<Record<string, unknown>>;
    }>;
    analyzeLeaks(user: AuthenticatedUser, dto: LeakAnalysisRequestDto): Promise<{
        detectedLeaks: Array<Record<string, unknown>>;
        totalEstimatedMonthlyLeakImpact: number;
        auditSummary: string;
        leakScore: number;
    }>;
}
