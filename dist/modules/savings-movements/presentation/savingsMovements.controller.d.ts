import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import { SavingsMovement } from '../../../shared/database/entity.schemas';
import { SavingsMovementService } from '../application/savingsMovements.service';
export declare class SavingsMovementController {
    private readonly service;
    constructor(service: SavingsMovementService);
    findAll(user: AuthenticatedUser): Promise<any[]>;
    findOne(user: AuthenticatedUser, id: string): Promise<any>;
    create(user: AuthenticatedUser, body: Partial<SavingsMovement>, idempotencyKey?: string): Promise<any>;
    update(user: AuthenticatedUser, id: string, body: Partial<SavingsMovement>): Promise<any>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
