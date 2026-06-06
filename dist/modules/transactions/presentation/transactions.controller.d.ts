import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import { Transaction } from '../../../shared/database/entity.schemas';
import { TransactionQueryDto } from '../../../shared/swagger/entity.dto';
import { TransactionService } from '../application/transactions.service';
export declare class TransactionController {
    private readonly service;
    constructor(service: TransactionService);
    findAll(user: AuthenticatedUser, query: TransactionQueryDto): Promise<any[]>;
    findOne(user: AuthenticatedUser, id: string): Promise<any>;
    create(user: AuthenticatedUser, body: Partial<Transaction>, idempotencyKey?: string): Promise<any>;
    update(user: AuthenticatedUser, id: string, body: Partial<Transaction>): Promise<any>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
