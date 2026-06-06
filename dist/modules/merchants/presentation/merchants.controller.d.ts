import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import { Merchant } from '../../../shared/database/entity.schemas';
import { MerchantService } from '../application/merchants.service';
export declare class MerchantController {
    private readonly service;
    constructor(service: MerchantService);
    findAll(user: AuthenticatedUser): Promise<any[]>;
    findOne(user: AuthenticatedUser, id: string): Promise<any>;
    create(user: AuthenticatedUser, body: Partial<Merchant>, idempotencyKey?: string): Promise<any>;
    update(user: AuthenticatedUser, id: string, body: Partial<Merchant>): Promise<any>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
