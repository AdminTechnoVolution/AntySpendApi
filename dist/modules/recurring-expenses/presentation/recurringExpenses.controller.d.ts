import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import { RecurringExpense } from '../../../shared/database/entity.schemas';
import { RecurringExpenseService } from '../application/recurringExpenses.service';
export declare class RecurringExpenseController {
    private readonly service;
    constructor(service: RecurringExpenseService);
    findAll(user: AuthenticatedUser): Promise<any[]>;
    findOne(user: AuthenticatedUser, id: string): Promise<any>;
    create(user: AuthenticatedUser, body: Partial<RecurringExpense>, idempotencyKey?: string): Promise<any>;
    update(user: AuthenticatedUser, id: string, body: Partial<RecurringExpense>): Promise<any>;
    markPaid(user: AuthenticatedUser, id: string): Promise<any>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
