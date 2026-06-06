import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import { SavingsPlan } from '../../../shared/database/entity.schemas';
import { SavingsPlanService } from '../application/savingsPlans.service';
export declare class SavingsPlanController {
    private readonly service;
    constructor(service: SavingsPlanService);
    findAll(user: AuthenticatedUser): Promise<any[]>;
    findOne(user: AuthenticatedUser, id: string): Promise<any>;
    create(user: AuthenticatedUser, body: Partial<SavingsPlan>, idempotencyKey?: string): Promise<any>;
    update(user: AuthenticatedUser, id: string, body: Partial<SavingsPlan>): Promise<any>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
