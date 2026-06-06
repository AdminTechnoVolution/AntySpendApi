import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import { Category } from '../../../shared/database/entity.schemas';
import { CategoryService } from '../application/categories.service';
export declare class CategoryController {
    private readonly service;
    constructor(service: CategoryService);
    findAll(user: AuthenticatedUser): Promise<any[]>;
    findOne(user: AuthenticatedUser, id: string): Promise<any>;
    create(user: AuthenticatedUser, body: Partial<Category>, idempotencyKey?: string): Promise<any>;
    update(user: AuthenticatedUser, id: string, body: Partial<Category>): Promise<any>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
