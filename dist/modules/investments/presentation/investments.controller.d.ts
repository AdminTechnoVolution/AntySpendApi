import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import { Investment } from '../../../shared/database/entity.schemas';
import { InvestmentService } from '../application/investments.service';
export declare class InvestmentController {
    private readonly service;
    constructor(service: InvestmentService);
    findAll(user: AuthenticatedUser): Promise<any[]>;
    findOne(user: AuthenticatedUser, id: string): Promise<any>;
    create(user: AuthenticatedUser, body: Partial<Investment>, idempotencyKey?: string): Promise<any>;
    update(user: AuthenticatedUser, id: string, body: Partial<Investment>): Promise<any>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
