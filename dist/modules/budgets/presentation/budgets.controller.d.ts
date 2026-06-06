import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import { Budget } from '../../../shared/database/entity.schemas';
import { BudgetService } from '../application/budgets.service';
export declare class BudgetController {
    private readonly service;
    constructor(service: BudgetService);
    findAll(user: AuthenticatedUser): Promise<any[]>;
    findOne(user: AuthenticatedUser, id: string): Promise<any>;
    create(user: AuthenticatedUser, body: Partial<Budget>, idempotencyKey?: string): Promise<any>;
    update(user: AuthenticatedUser, id: string, body: Partial<Budget>): Promise<any>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
