import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import { Wallet } from '../../../shared/database/entity.schemas';
import { WalletService } from '../application/wallets.service';
export declare class WalletController {
    private readonly service;
    constructor(service: WalletService);
    findAll(user: AuthenticatedUser): Promise<any[]>;
    findOne(user: AuthenticatedUser, id: string): Promise<any>;
    create(user: AuthenticatedUser, body: Partial<Wallet>, idempotencyKey?: string): Promise<any>;
    update(user: AuthenticatedUser, id: string, body: Partial<Wallet>): Promise<any>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
