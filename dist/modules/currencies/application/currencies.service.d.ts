import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { Currency, CurrencyDocument } from '../../../shared/database/entity.schemas';
export declare class CurrenciesService implements OnModuleInit {
    private readonly currencyModel;
    constructor(currencyModel: Model<CurrencyDocument>);
    onModuleInit(): Promise<void>;
    seed(): Promise<void>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, Currency, {}, import("mongoose").DefaultSchemaOptions> & Currency & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
}
