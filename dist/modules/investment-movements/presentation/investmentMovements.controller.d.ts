import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import { InvestmentMovement } from '../../../shared/database/entity.schemas';
import { InvestmentMovementService } from '../application/investmentMovements.service';
export declare class InvestmentMovementController {
    private readonly service;
    constructor(service: InvestmentMovementService);
    findAll(user: AuthenticatedUser): Promise<any[]>;
    findOne(user: AuthenticatedUser, id: string): Promise<any>;
    create(user: AuthenticatedUser, body: Partial<InvestmentMovement>, idempotencyKey?: string): Promise<any>;
    update(user: AuthenticatedUser, id: string, body: Partial<InvestmentMovement>): Promise<any>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
