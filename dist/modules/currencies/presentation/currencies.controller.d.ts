import { CurrenciesService } from '../application/currencies.service';
export declare class CurrenciesController {
    private readonly currenciesService;
    constructor(currenciesService: CurrenciesService);
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("../../../shared/database/entity.schemas").Currency, {}, import("mongoose").DefaultSchemaOptions> & import("../../../shared/database/entity.schemas").Currency & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    seed(): Promise<{
        seeded: boolean;
    }>;
}
