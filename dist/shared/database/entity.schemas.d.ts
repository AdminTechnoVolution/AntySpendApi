import { HydratedDocument } from 'mongoose';
import { SyncableEntity } from '../../shared/sync/syncable.schema';
export declare class UserSettings extends SyncableEntity {
    primaryCurrencyCode: string;
    hasCompletedOnboarding: boolean;
    themeMode: string;
    defaultWalletId?: string;
    voiceInputEnabled: boolean;
    usdConversionEnabled: boolean;
    preferredSecondaryCurrencyCode?: string;
    exchangeRateMode: string;
    manualUsdPerPrimaryUnit?: string;
    microExpenseThresholdPrimaryMinor: number;
    appLanguage?: string;
    textSize: string;
    googleUserName?: string;
    googleUserEmail?: string;
    googleUserProfilePictureUrl?: string;
    displayNameUserEdited?: boolean;
}
export type UserSettingsDocument = HydratedDocument<UserSettings>;
export declare const UserSettingsSchema: import("mongoose").Schema<UserSettings, import("mongoose").Model<UserSettings, any, any, any, any, any, UserSettings>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, UserSettings, import("mongoose").Document<unknown, {}, UserSettings, {}, import("mongoose").DefaultSchemaOptions> & UserSettings & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, {
    primaryCurrencyCode?: import("mongoose").SchemaDefinitionProperty<string, UserSettings, import("mongoose").Document<unknown, {}, UserSettings, {}, import("mongoose").DefaultSchemaOptions> & UserSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    hasCompletedOnboarding?: import("mongoose").SchemaDefinitionProperty<boolean, UserSettings, import("mongoose").Document<unknown, {}, UserSettings, {}, import("mongoose").DefaultSchemaOptions> & UserSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    themeMode?: import("mongoose").SchemaDefinitionProperty<string, UserSettings, import("mongoose").Document<unknown, {}, UserSettings, {}, import("mongoose").DefaultSchemaOptions> & UserSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    defaultWalletId?: import("mongoose").SchemaDefinitionProperty<string | undefined, UserSettings, import("mongoose").Document<unknown, {}, UserSettings, {}, import("mongoose").DefaultSchemaOptions> & UserSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    voiceInputEnabled?: import("mongoose").SchemaDefinitionProperty<boolean, UserSettings, import("mongoose").Document<unknown, {}, UserSettings, {}, import("mongoose").DefaultSchemaOptions> & UserSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    usdConversionEnabled?: import("mongoose").SchemaDefinitionProperty<boolean, UserSettings, import("mongoose").Document<unknown, {}, UserSettings, {}, import("mongoose").DefaultSchemaOptions> & UserSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    preferredSecondaryCurrencyCode?: import("mongoose").SchemaDefinitionProperty<string | undefined, UserSettings, import("mongoose").Document<unknown, {}, UserSettings, {}, import("mongoose").DefaultSchemaOptions> & UserSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    exchangeRateMode?: import("mongoose").SchemaDefinitionProperty<string, UserSettings, import("mongoose").Document<unknown, {}, UserSettings, {}, import("mongoose").DefaultSchemaOptions> & UserSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    manualUsdPerPrimaryUnit?: import("mongoose").SchemaDefinitionProperty<string | undefined, UserSettings, import("mongoose").Document<unknown, {}, UserSettings, {}, import("mongoose").DefaultSchemaOptions> & UserSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    microExpenseThresholdPrimaryMinor?: import("mongoose").SchemaDefinitionProperty<number, UserSettings, import("mongoose").Document<unknown, {}, UserSettings, {}, import("mongoose").DefaultSchemaOptions> & UserSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    appLanguage?: import("mongoose").SchemaDefinitionProperty<string | undefined, UserSettings, import("mongoose").Document<unknown, {}, UserSettings, {}, import("mongoose").DefaultSchemaOptions> & UserSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    textSize?: import("mongoose").SchemaDefinitionProperty<string, UserSettings, import("mongoose").Document<unknown, {}, UserSettings, {}, import("mongoose").DefaultSchemaOptions> & UserSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    googleUserName?: import("mongoose").SchemaDefinitionProperty<string | undefined, UserSettings, import("mongoose").Document<unknown, {}, UserSettings, {}, import("mongoose").DefaultSchemaOptions> & UserSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    googleUserEmail?: import("mongoose").SchemaDefinitionProperty<string | undefined, UserSettings, import("mongoose").Document<unknown, {}, UserSettings, {}, import("mongoose").DefaultSchemaOptions> & UserSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    googleUserProfilePictureUrl?: import("mongoose").SchemaDefinitionProperty<string | undefined, UserSettings, import("mongoose").Document<unknown, {}, UserSettings, {}, import("mongoose").DefaultSchemaOptions> & UserSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    displayNameUserEdited?: import("mongoose").SchemaDefinitionProperty<boolean | undefined, UserSettings, import("mongoose").Document<unknown, {}, UserSettings, {}, import("mongoose").DefaultSchemaOptions> & UserSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    id?: import("mongoose").SchemaDefinitionProperty<string, UserSettings, import("mongoose").Document<unknown, {}, UserSettings, {}, import("mongoose").DefaultSchemaOptions> & UserSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<string, UserSettings, import("mongoose").Document<unknown, {}, UserSettings, {}, import("mongoose").DefaultSchemaOptions> & UserSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    createdAtMillis?: import("mongoose").SchemaDefinitionProperty<number, UserSettings, import("mongoose").Document<unknown, {}, UserSettings, {}, import("mongoose").DefaultSchemaOptions> & UserSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    updatedAtMillis?: import("mongoose").SchemaDefinitionProperty<number, UserSettings, import("mongoose").Document<unknown, {}, UserSettings, {}, import("mongoose").DefaultSchemaOptions> & UserSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    deletedAtMillis?: import("mongoose").SchemaDefinitionProperty<number | undefined, UserSettings, import("mongoose").Document<unknown, {}, UserSettings, {}, import("mongoose").DefaultSchemaOptions> & UserSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    clientUpdatedAtMillis?: import("mongoose").SchemaDefinitionProperty<number | undefined, UserSettings, import("mongoose").Document<unknown, {}, UserSettings, {}, import("mongoose").DefaultSchemaOptions> & UserSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    deviceId?: import("mongoose").SchemaDefinitionProperty<string | undefined, UserSettings, import("mongoose").Document<unknown, {}, UserSettings, {}, import("mongoose").DefaultSchemaOptions> & UserSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
}, UserSettings>;
export declare class Wallet extends SyncableEntity {
    name: string;
    currencyCode: string;
    walletType: string;
    initialBalanceMinor: number;
    isDefault: boolean;
}
export type WalletDocument = HydratedDocument<Wallet>;
export declare const WalletSchema: import("mongoose").Schema<Wallet, import("mongoose").Model<Wallet, any, any, any, any, any, Wallet>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Wallet, import("mongoose").Document<unknown, {}, Wallet, {}, import("mongoose").DefaultSchemaOptions> & Wallet & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Wallet, import("mongoose").Document<unknown, {}, Wallet, {}, import("mongoose").DefaultSchemaOptions> & Wallet & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    currencyCode?: import("mongoose").SchemaDefinitionProperty<string, Wallet, import("mongoose").Document<unknown, {}, Wallet, {}, import("mongoose").DefaultSchemaOptions> & Wallet & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    walletType?: import("mongoose").SchemaDefinitionProperty<string, Wallet, import("mongoose").Document<unknown, {}, Wallet, {}, import("mongoose").DefaultSchemaOptions> & Wallet & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    initialBalanceMinor?: import("mongoose").SchemaDefinitionProperty<number, Wallet, import("mongoose").Document<unknown, {}, Wallet, {}, import("mongoose").DefaultSchemaOptions> & Wallet & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    isDefault?: import("mongoose").SchemaDefinitionProperty<boolean, Wallet, import("mongoose").Document<unknown, {}, Wallet, {}, import("mongoose").DefaultSchemaOptions> & Wallet & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    id?: import("mongoose").SchemaDefinitionProperty<string, Wallet, import("mongoose").Document<unknown, {}, Wallet, {}, import("mongoose").DefaultSchemaOptions> & Wallet & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<string, Wallet, import("mongoose").Document<unknown, {}, Wallet, {}, import("mongoose").DefaultSchemaOptions> & Wallet & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    createdAtMillis?: import("mongoose").SchemaDefinitionProperty<number, Wallet, import("mongoose").Document<unknown, {}, Wallet, {}, import("mongoose").DefaultSchemaOptions> & Wallet & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    updatedAtMillis?: import("mongoose").SchemaDefinitionProperty<number, Wallet, import("mongoose").Document<unknown, {}, Wallet, {}, import("mongoose").DefaultSchemaOptions> & Wallet & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    deletedAtMillis?: import("mongoose").SchemaDefinitionProperty<number | undefined, Wallet, import("mongoose").Document<unknown, {}, Wallet, {}, import("mongoose").DefaultSchemaOptions> & Wallet & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    clientUpdatedAtMillis?: import("mongoose").SchemaDefinitionProperty<number | undefined, Wallet, import("mongoose").Document<unknown, {}, Wallet, {}, import("mongoose").DefaultSchemaOptions> & Wallet & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    deviceId?: import("mongoose").SchemaDefinitionProperty<string | undefined, Wallet, import("mongoose").Document<unknown, {}, Wallet, {}, import("mongoose").DefaultSchemaOptions> & Wallet & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
}, Wallet>;
export declare class Category extends SyncableEntity {
    key?: string;
    customName?: string;
    type: string;
    iconName?: string;
    colorHex?: string;
    isDefault: boolean;
}
export type CategoryDocument = HydratedDocument<Category>;
export declare const CategorySchema: import("mongoose").Schema<Category, import("mongoose").Model<Category, any, any, any, any, any, Category>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Category, import("mongoose").Document<unknown, {}, Category, {}, import("mongoose").DefaultSchemaOptions> & Category & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, {
    key?: import("mongoose").SchemaDefinitionProperty<string | undefined, Category, import("mongoose").Document<unknown, {}, Category, {}, import("mongoose").DefaultSchemaOptions> & Category & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    customName?: import("mongoose").SchemaDefinitionProperty<string | undefined, Category, import("mongoose").Document<unknown, {}, Category, {}, import("mongoose").DefaultSchemaOptions> & Category & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<string, Category, import("mongoose").Document<unknown, {}, Category, {}, import("mongoose").DefaultSchemaOptions> & Category & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    iconName?: import("mongoose").SchemaDefinitionProperty<string | undefined, Category, import("mongoose").Document<unknown, {}, Category, {}, import("mongoose").DefaultSchemaOptions> & Category & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    colorHex?: import("mongoose").SchemaDefinitionProperty<string | undefined, Category, import("mongoose").Document<unknown, {}, Category, {}, import("mongoose").DefaultSchemaOptions> & Category & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    isDefault?: import("mongoose").SchemaDefinitionProperty<boolean, Category, import("mongoose").Document<unknown, {}, Category, {}, import("mongoose").DefaultSchemaOptions> & Category & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    id?: import("mongoose").SchemaDefinitionProperty<string, Category, import("mongoose").Document<unknown, {}, Category, {}, import("mongoose").DefaultSchemaOptions> & Category & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<string, Category, import("mongoose").Document<unknown, {}, Category, {}, import("mongoose").DefaultSchemaOptions> & Category & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    createdAtMillis?: import("mongoose").SchemaDefinitionProperty<number, Category, import("mongoose").Document<unknown, {}, Category, {}, import("mongoose").DefaultSchemaOptions> & Category & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    updatedAtMillis?: import("mongoose").SchemaDefinitionProperty<number, Category, import("mongoose").Document<unknown, {}, Category, {}, import("mongoose").DefaultSchemaOptions> & Category & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    deletedAtMillis?: import("mongoose").SchemaDefinitionProperty<number | undefined, Category, import("mongoose").Document<unknown, {}, Category, {}, import("mongoose").DefaultSchemaOptions> & Category & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    clientUpdatedAtMillis?: import("mongoose").SchemaDefinitionProperty<number | undefined, Category, import("mongoose").Document<unknown, {}, Category, {}, import("mongoose").DefaultSchemaOptions> & Category & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    deviceId?: import("mongoose").SchemaDefinitionProperty<string | undefined, Category, import("mongoose").Document<unknown, {}, Category, {}, import("mongoose").DefaultSchemaOptions> & Category & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
}, Category>;
export declare class Merchant extends SyncableEntity {
    name: string;
    normalizedName?: string;
}
export type MerchantDocument = HydratedDocument<Merchant>;
export declare const MerchantSchema: import("mongoose").Schema<Merchant, import("mongoose").Model<Merchant, any, any, any, any, any, Merchant>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Merchant, import("mongoose").Document<unknown, {}, Merchant, {}, import("mongoose").DefaultSchemaOptions> & Merchant & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Merchant, import("mongoose").Document<unknown, {}, Merchant, {}, import("mongoose").DefaultSchemaOptions> & Merchant & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    normalizedName?: import("mongoose").SchemaDefinitionProperty<string | undefined, Merchant, import("mongoose").Document<unknown, {}, Merchant, {}, import("mongoose").DefaultSchemaOptions> & Merchant & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    id?: import("mongoose").SchemaDefinitionProperty<string, Merchant, import("mongoose").Document<unknown, {}, Merchant, {}, import("mongoose").DefaultSchemaOptions> & Merchant & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<string, Merchant, import("mongoose").Document<unknown, {}, Merchant, {}, import("mongoose").DefaultSchemaOptions> & Merchant & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    createdAtMillis?: import("mongoose").SchemaDefinitionProperty<number, Merchant, import("mongoose").Document<unknown, {}, Merchant, {}, import("mongoose").DefaultSchemaOptions> & Merchant & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    updatedAtMillis?: import("mongoose").SchemaDefinitionProperty<number, Merchant, import("mongoose").Document<unknown, {}, Merchant, {}, import("mongoose").DefaultSchemaOptions> & Merchant & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    deletedAtMillis?: import("mongoose").SchemaDefinitionProperty<number | undefined, Merchant, import("mongoose").Document<unknown, {}, Merchant, {}, import("mongoose").DefaultSchemaOptions> & Merchant & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    clientUpdatedAtMillis?: import("mongoose").SchemaDefinitionProperty<number | undefined, Merchant, import("mongoose").Document<unknown, {}, Merchant, {}, import("mongoose").DefaultSchemaOptions> & Merchant & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    deviceId?: import("mongoose").SchemaDefinitionProperty<string | undefined, Merchant, import("mongoose").Document<unknown, {}, Merchant, {}, import("mongoose").DefaultSchemaOptions> & Merchant & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
}, Merchant>;
export declare class Transaction extends SyncableEntity {
    type: string;
    originalAmountMinor: number;
    originalCurrencyCode: string;
    primaryAmountMinor: number;
    primaryCurrencyCode: string;
    usdAmountMinor?: number;
    usdCurrencyCode?: string;
    exchangeRate?: string;
    exchangeRateFromCurrencyCode?: string;
    exchangeRateToCurrencyCode?: string;
    exchangeRateSource?: string;
    exchangeRateTimestampMillis?: number;
    categoryId?: string;
    walletId?: string;
    paymentMethodId?: string;
    paymentMethodKey?: string;
    merchantId?: string;
    title?: string;
    note?: string;
    occurredAtMillis: number;
    source: string;
    rawInput?: string;
    confidence?: number;
}
export type TransactionDocument = HydratedDocument<Transaction>;
export declare const TransactionSchema: import("mongoose").Schema<Transaction, import("mongoose").Model<Transaction, any, any, any, any, any, Transaction>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, {
    type?: import("mongoose").SchemaDefinitionProperty<string, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    originalAmountMinor?: import("mongoose").SchemaDefinitionProperty<number, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    originalCurrencyCode?: import("mongoose").SchemaDefinitionProperty<string, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    primaryAmountMinor?: import("mongoose").SchemaDefinitionProperty<number, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    primaryCurrencyCode?: import("mongoose").SchemaDefinitionProperty<string, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    usdAmountMinor?: import("mongoose").SchemaDefinitionProperty<number | undefined, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    usdCurrencyCode?: import("mongoose").SchemaDefinitionProperty<string | undefined, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    exchangeRate?: import("mongoose").SchemaDefinitionProperty<string | undefined, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    exchangeRateFromCurrencyCode?: import("mongoose").SchemaDefinitionProperty<string | undefined, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    exchangeRateToCurrencyCode?: import("mongoose").SchemaDefinitionProperty<string | undefined, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    exchangeRateSource?: import("mongoose").SchemaDefinitionProperty<string | undefined, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    exchangeRateTimestampMillis?: import("mongoose").SchemaDefinitionProperty<number | undefined, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    categoryId?: import("mongoose").SchemaDefinitionProperty<string | undefined, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    walletId?: import("mongoose").SchemaDefinitionProperty<string | undefined, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    paymentMethodId?: import("mongoose").SchemaDefinitionProperty<string | undefined, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    paymentMethodKey?: import("mongoose").SchemaDefinitionProperty<string | undefined, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    merchantId?: import("mongoose").SchemaDefinitionProperty<string | undefined, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    title?: import("mongoose").SchemaDefinitionProperty<string | undefined, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    note?: import("mongoose").SchemaDefinitionProperty<string | undefined, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    occurredAtMillis?: import("mongoose").SchemaDefinitionProperty<number, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    source?: import("mongoose").SchemaDefinitionProperty<string, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    rawInput?: import("mongoose").SchemaDefinitionProperty<string | undefined, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    confidence?: import("mongoose").SchemaDefinitionProperty<number | undefined, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    id?: import("mongoose").SchemaDefinitionProperty<string, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<string, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    createdAtMillis?: import("mongoose").SchemaDefinitionProperty<number, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    updatedAtMillis?: import("mongoose").SchemaDefinitionProperty<number, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    deletedAtMillis?: import("mongoose").SchemaDefinitionProperty<number | undefined, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    clientUpdatedAtMillis?: import("mongoose").SchemaDefinitionProperty<number | undefined, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    deviceId?: import("mongoose").SchemaDefinitionProperty<string | undefined, Transaction, import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
}, Transaction>;
export declare class Budget extends SyncableEntity {
    name?: string;
    categoryId?: string;
    walletId?: string;
    limitAmountMinor: number;
    currencyCode: string;
    periodType: string;
    periodStartUtcMillis: number;
    periodEndExclusiveUtcMillis?: number;
    alertThresholdPercent: number;
    isActive: boolean;
}
export type BudgetDocument = HydratedDocument<Budget>;
export declare const BudgetSchema: import("mongoose").Schema<Budget, import("mongoose").Model<Budget, any, any, any, any, any, Budget>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Budget, import("mongoose").Document<unknown, {}, Budget, {}, import("mongoose").DefaultSchemaOptions> & Budget & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string | undefined, Budget, import("mongoose").Document<unknown, {}, Budget, {}, import("mongoose").DefaultSchemaOptions> & Budget & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    categoryId?: import("mongoose").SchemaDefinitionProperty<string | undefined, Budget, import("mongoose").Document<unknown, {}, Budget, {}, import("mongoose").DefaultSchemaOptions> & Budget & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    walletId?: import("mongoose").SchemaDefinitionProperty<string | undefined, Budget, import("mongoose").Document<unknown, {}, Budget, {}, import("mongoose").DefaultSchemaOptions> & Budget & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    limitAmountMinor?: import("mongoose").SchemaDefinitionProperty<number, Budget, import("mongoose").Document<unknown, {}, Budget, {}, import("mongoose").DefaultSchemaOptions> & Budget & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    currencyCode?: import("mongoose").SchemaDefinitionProperty<string, Budget, import("mongoose").Document<unknown, {}, Budget, {}, import("mongoose").DefaultSchemaOptions> & Budget & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    periodType?: import("mongoose").SchemaDefinitionProperty<string, Budget, import("mongoose").Document<unknown, {}, Budget, {}, import("mongoose").DefaultSchemaOptions> & Budget & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    periodStartUtcMillis?: import("mongoose").SchemaDefinitionProperty<number, Budget, import("mongoose").Document<unknown, {}, Budget, {}, import("mongoose").DefaultSchemaOptions> & Budget & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    periodEndExclusiveUtcMillis?: import("mongoose").SchemaDefinitionProperty<number | undefined, Budget, import("mongoose").Document<unknown, {}, Budget, {}, import("mongoose").DefaultSchemaOptions> & Budget & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    alertThresholdPercent?: import("mongoose").SchemaDefinitionProperty<number, Budget, import("mongoose").Document<unknown, {}, Budget, {}, import("mongoose").DefaultSchemaOptions> & Budget & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, Budget, import("mongoose").Document<unknown, {}, Budget, {}, import("mongoose").DefaultSchemaOptions> & Budget & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    id?: import("mongoose").SchemaDefinitionProperty<string, Budget, import("mongoose").Document<unknown, {}, Budget, {}, import("mongoose").DefaultSchemaOptions> & Budget & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<string, Budget, import("mongoose").Document<unknown, {}, Budget, {}, import("mongoose").DefaultSchemaOptions> & Budget & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    createdAtMillis?: import("mongoose").SchemaDefinitionProperty<number, Budget, import("mongoose").Document<unknown, {}, Budget, {}, import("mongoose").DefaultSchemaOptions> & Budget & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    updatedAtMillis?: import("mongoose").SchemaDefinitionProperty<number, Budget, import("mongoose").Document<unknown, {}, Budget, {}, import("mongoose").DefaultSchemaOptions> & Budget & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    deletedAtMillis?: import("mongoose").SchemaDefinitionProperty<number | undefined, Budget, import("mongoose").Document<unknown, {}, Budget, {}, import("mongoose").DefaultSchemaOptions> & Budget & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    clientUpdatedAtMillis?: import("mongoose").SchemaDefinitionProperty<number | undefined, Budget, import("mongoose").Document<unknown, {}, Budget, {}, import("mongoose").DefaultSchemaOptions> & Budget & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    deviceId?: import("mongoose").SchemaDefinitionProperty<string | undefined, Budget, import("mongoose").Document<unknown, {}, Budget, {}, import("mongoose").DefaultSchemaOptions> & Budget & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
}, Budget>;
export declare class RecurringExpense extends SyncableEntity {
    title: string;
    transactionType: string;
    amountMinor: number;
    currencyCode: string;
    categoryId?: string;
    walletId?: string;
    merchantId?: string;
    frequency: string;
    dueDayOfMonth: number;
    recurrenceDays?: string;
    nextDueAtMillis: number;
    paymentMethodKey?: string;
    isActive: boolean;
}
export type RecurringExpenseDocument = HydratedDocument<RecurringExpense>;
export declare const RecurringExpenseSchema: import("mongoose").Schema<RecurringExpense, import("mongoose").Model<RecurringExpense, any, any, any, any, any, RecurringExpense>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, RecurringExpense, import("mongoose").Document<unknown, {}, RecurringExpense, {}, import("mongoose").DefaultSchemaOptions> & RecurringExpense & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, {
    title?: import("mongoose").SchemaDefinitionProperty<string, RecurringExpense, import("mongoose").Document<unknown, {}, RecurringExpense, {}, import("mongoose").DefaultSchemaOptions> & RecurringExpense & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    transactionType?: import("mongoose").SchemaDefinitionProperty<string, RecurringExpense, import("mongoose").Document<unknown, {}, RecurringExpense, {}, import("mongoose").DefaultSchemaOptions> & RecurringExpense & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    amountMinor?: import("mongoose").SchemaDefinitionProperty<number, RecurringExpense, import("mongoose").Document<unknown, {}, RecurringExpense, {}, import("mongoose").DefaultSchemaOptions> & RecurringExpense & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    currencyCode?: import("mongoose").SchemaDefinitionProperty<string, RecurringExpense, import("mongoose").Document<unknown, {}, RecurringExpense, {}, import("mongoose").DefaultSchemaOptions> & RecurringExpense & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    categoryId?: import("mongoose").SchemaDefinitionProperty<string | undefined, RecurringExpense, import("mongoose").Document<unknown, {}, RecurringExpense, {}, import("mongoose").DefaultSchemaOptions> & RecurringExpense & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    walletId?: import("mongoose").SchemaDefinitionProperty<string | undefined, RecurringExpense, import("mongoose").Document<unknown, {}, RecurringExpense, {}, import("mongoose").DefaultSchemaOptions> & RecurringExpense & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    merchantId?: import("mongoose").SchemaDefinitionProperty<string | undefined, RecurringExpense, import("mongoose").Document<unknown, {}, RecurringExpense, {}, import("mongoose").DefaultSchemaOptions> & RecurringExpense & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    frequency?: import("mongoose").SchemaDefinitionProperty<string, RecurringExpense, import("mongoose").Document<unknown, {}, RecurringExpense, {}, import("mongoose").DefaultSchemaOptions> & RecurringExpense & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    dueDayOfMonth?: import("mongoose").SchemaDefinitionProperty<number, RecurringExpense, import("mongoose").Document<unknown, {}, RecurringExpense, {}, import("mongoose").DefaultSchemaOptions> & RecurringExpense & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    recurrenceDays?: import("mongoose").SchemaDefinitionProperty<string | undefined, RecurringExpense, import("mongoose").Document<unknown, {}, RecurringExpense, {}, import("mongoose").DefaultSchemaOptions> & RecurringExpense & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    nextDueAtMillis?: import("mongoose").SchemaDefinitionProperty<number, RecurringExpense, import("mongoose").Document<unknown, {}, RecurringExpense, {}, import("mongoose").DefaultSchemaOptions> & RecurringExpense & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    paymentMethodKey?: import("mongoose").SchemaDefinitionProperty<string | undefined, RecurringExpense, import("mongoose").Document<unknown, {}, RecurringExpense, {}, import("mongoose").DefaultSchemaOptions> & RecurringExpense & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, RecurringExpense, import("mongoose").Document<unknown, {}, RecurringExpense, {}, import("mongoose").DefaultSchemaOptions> & RecurringExpense & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    id?: import("mongoose").SchemaDefinitionProperty<string, RecurringExpense, import("mongoose").Document<unknown, {}, RecurringExpense, {}, import("mongoose").DefaultSchemaOptions> & RecurringExpense & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<string, RecurringExpense, import("mongoose").Document<unknown, {}, RecurringExpense, {}, import("mongoose").DefaultSchemaOptions> & RecurringExpense & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    createdAtMillis?: import("mongoose").SchemaDefinitionProperty<number, RecurringExpense, import("mongoose").Document<unknown, {}, RecurringExpense, {}, import("mongoose").DefaultSchemaOptions> & RecurringExpense & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    updatedAtMillis?: import("mongoose").SchemaDefinitionProperty<number, RecurringExpense, import("mongoose").Document<unknown, {}, RecurringExpense, {}, import("mongoose").DefaultSchemaOptions> & RecurringExpense & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    deletedAtMillis?: import("mongoose").SchemaDefinitionProperty<number | undefined, RecurringExpense, import("mongoose").Document<unknown, {}, RecurringExpense, {}, import("mongoose").DefaultSchemaOptions> & RecurringExpense & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    clientUpdatedAtMillis?: import("mongoose").SchemaDefinitionProperty<number | undefined, RecurringExpense, import("mongoose").Document<unknown, {}, RecurringExpense, {}, import("mongoose").DefaultSchemaOptions> & RecurringExpense & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    deviceId?: import("mongoose").SchemaDefinitionProperty<string | undefined, RecurringExpense, import("mongoose").Document<unknown, {}, RecurringExpense, {}, import("mongoose").DefaultSchemaOptions> & RecurringExpense & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
}, RecurringExpense>;
export declare class SavingsPlan extends SyncableEntity {
    name: string;
    purpose?: string;
    goalAmountMinor: number;
    currencyCode: string;
    plannedContributionAmountMinor: number;
    frequency: string;
    walletId?: string;
    startDateUtcMillis: number;
    targetDateUtcMillis?: number;
    iconName?: string;
    colorHex?: string;
    notes?: string;
    isActive: boolean;
}
export type SavingsPlanDocument = HydratedDocument<SavingsPlan>;
export declare const SavingsPlanSchema: import("mongoose").Schema<SavingsPlan, import("mongoose").Model<SavingsPlan, any, any, any, any, any, SavingsPlan>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SavingsPlan, import("mongoose").Document<unknown, {}, SavingsPlan, {}, import("mongoose").DefaultSchemaOptions> & SavingsPlan & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, SavingsPlan, import("mongoose").Document<unknown, {}, SavingsPlan, {}, import("mongoose").DefaultSchemaOptions> & SavingsPlan & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    purpose?: import("mongoose").SchemaDefinitionProperty<string | undefined, SavingsPlan, import("mongoose").Document<unknown, {}, SavingsPlan, {}, import("mongoose").DefaultSchemaOptions> & SavingsPlan & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    goalAmountMinor?: import("mongoose").SchemaDefinitionProperty<number, SavingsPlan, import("mongoose").Document<unknown, {}, SavingsPlan, {}, import("mongoose").DefaultSchemaOptions> & SavingsPlan & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    currencyCode?: import("mongoose").SchemaDefinitionProperty<string, SavingsPlan, import("mongoose").Document<unknown, {}, SavingsPlan, {}, import("mongoose").DefaultSchemaOptions> & SavingsPlan & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    plannedContributionAmountMinor?: import("mongoose").SchemaDefinitionProperty<number, SavingsPlan, import("mongoose").Document<unknown, {}, SavingsPlan, {}, import("mongoose").DefaultSchemaOptions> & SavingsPlan & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    frequency?: import("mongoose").SchemaDefinitionProperty<string, SavingsPlan, import("mongoose").Document<unknown, {}, SavingsPlan, {}, import("mongoose").DefaultSchemaOptions> & SavingsPlan & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    walletId?: import("mongoose").SchemaDefinitionProperty<string | undefined, SavingsPlan, import("mongoose").Document<unknown, {}, SavingsPlan, {}, import("mongoose").DefaultSchemaOptions> & SavingsPlan & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    startDateUtcMillis?: import("mongoose").SchemaDefinitionProperty<number, SavingsPlan, import("mongoose").Document<unknown, {}, SavingsPlan, {}, import("mongoose").DefaultSchemaOptions> & SavingsPlan & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    targetDateUtcMillis?: import("mongoose").SchemaDefinitionProperty<number | undefined, SavingsPlan, import("mongoose").Document<unknown, {}, SavingsPlan, {}, import("mongoose").DefaultSchemaOptions> & SavingsPlan & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    iconName?: import("mongoose").SchemaDefinitionProperty<string | undefined, SavingsPlan, import("mongoose").Document<unknown, {}, SavingsPlan, {}, import("mongoose").DefaultSchemaOptions> & SavingsPlan & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    colorHex?: import("mongoose").SchemaDefinitionProperty<string | undefined, SavingsPlan, import("mongoose").Document<unknown, {}, SavingsPlan, {}, import("mongoose").DefaultSchemaOptions> & SavingsPlan & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    notes?: import("mongoose").SchemaDefinitionProperty<string | undefined, SavingsPlan, import("mongoose").Document<unknown, {}, SavingsPlan, {}, import("mongoose").DefaultSchemaOptions> & SavingsPlan & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, SavingsPlan, import("mongoose").Document<unknown, {}, SavingsPlan, {}, import("mongoose").DefaultSchemaOptions> & SavingsPlan & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    id?: import("mongoose").SchemaDefinitionProperty<string, SavingsPlan, import("mongoose").Document<unknown, {}, SavingsPlan, {}, import("mongoose").DefaultSchemaOptions> & SavingsPlan & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<string, SavingsPlan, import("mongoose").Document<unknown, {}, SavingsPlan, {}, import("mongoose").DefaultSchemaOptions> & SavingsPlan & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    createdAtMillis?: import("mongoose").SchemaDefinitionProperty<number, SavingsPlan, import("mongoose").Document<unknown, {}, SavingsPlan, {}, import("mongoose").DefaultSchemaOptions> & SavingsPlan & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    updatedAtMillis?: import("mongoose").SchemaDefinitionProperty<number, SavingsPlan, import("mongoose").Document<unknown, {}, SavingsPlan, {}, import("mongoose").DefaultSchemaOptions> & SavingsPlan & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    deletedAtMillis?: import("mongoose").SchemaDefinitionProperty<number | undefined, SavingsPlan, import("mongoose").Document<unknown, {}, SavingsPlan, {}, import("mongoose").DefaultSchemaOptions> & SavingsPlan & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    clientUpdatedAtMillis?: import("mongoose").SchemaDefinitionProperty<number | undefined, SavingsPlan, import("mongoose").Document<unknown, {}, SavingsPlan, {}, import("mongoose").DefaultSchemaOptions> & SavingsPlan & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    deviceId?: import("mongoose").SchemaDefinitionProperty<string | undefined, SavingsPlan, import("mongoose").Document<unknown, {}, SavingsPlan, {}, import("mongoose").DefaultSchemaOptions> & SavingsPlan & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
}, SavingsPlan>;
export declare class SavingsMovement extends SyncableEntity {
    savingsPlanId: string;
    type: string;
    originalAmountMinor: number;
    originalCurrencyCode: string;
    convertedAmountMinor: number;
    convertedCurrencyCode: string;
    exchangeRate?: string;
    exchangeRateSource?: string;
    exchangeRateTimestampMillis?: number;
    walletId?: string;
    dateUtcMillis: number;
    reason?: string;
    note?: string;
}
export type SavingsMovementDocument = HydratedDocument<SavingsMovement>;
export declare const SavingsMovementSchema: import("mongoose").Schema<SavingsMovement, import("mongoose").Model<SavingsMovement, any, any, any, any, any, SavingsMovement>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SavingsMovement, import("mongoose").Document<unknown, {}, SavingsMovement, {}, import("mongoose").DefaultSchemaOptions> & SavingsMovement & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, {
    savingsPlanId?: import("mongoose").SchemaDefinitionProperty<string, SavingsMovement, import("mongoose").Document<unknown, {}, SavingsMovement, {}, import("mongoose").DefaultSchemaOptions> & SavingsMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<string, SavingsMovement, import("mongoose").Document<unknown, {}, SavingsMovement, {}, import("mongoose").DefaultSchemaOptions> & SavingsMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    originalAmountMinor?: import("mongoose").SchemaDefinitionProperty<number, SavingsMovement, import("mongoose").Document<unknown, {}, SavingsMovement, {}, import("mongoose").DefaultSchemaOptions> & SavingsMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    originalCurrencyCode?: import("mongoose").SchemaDefinitionProperty<string, SavingsMovement, import("mongoose").Document<unknown, {}, SavingsMovement, {}, import("mongoose").DefaultSchemaOptions> & SavingsMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    convertedAmountMinor?: import("mongoose").SchemaDefinitionProperty<number, SavingsMovement, import("mongoose").Document<unknown, {}, SavingsMovement, {}, import("mongoose").DefaultSchemaOptions> & SavingsMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    convertedCurrencyCode?: import("mongoose").SchemaDefinitionProperty<string, SavingsMovement, import("mongoose").Document<unknown, {}, SavingsMovement, {}, import("mongoose").DefaultSchemaOptions> & SavingsMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    exchangeRate?: import("mongoose").SchemaDefinitionProperty<string | undefined, SavingsMovement, import("mongoose").Document<unknown, {}, SavingsMovement, {}, import("mongoose").DefaultSchemaOptions> & SavingsMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    exchangeRateSource?: import("mongoose").SchemaDefinitionProperty<string | undefined, SavingsMovement, import("mongoose").Document<unknown, {}, SavingsMovement, {}, import("mongoose").DefaultSchemaOptions> & SavingsMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    exchangeRateTimestampMillis?: import("mongoose").SchemaDefinitionProperty<number | undefined, SavingsMovement, import("mongoose").Document<unknown, {}, SavingsMovement, {}, import("mongoose").DefaultSchemaOptions> & SavingsMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    walletId?: import("mongoose").SchemaDefinitionProperty<string | undefined, SavingsMovement, import("mongoose").Document<unknown, {}, SavingsMovement, {}, import("mongoose").DefaultSchemaOptions> & SavingsMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    dateUtcMillis?: import("mongoose").SchemaDefinitionProperty<number, SavingsMovement, import("mongoose").Document<unknown, {}, SavingsMovement, {}, import("mongoose").DefaultSchemaOptions> & SavingsMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    reason?: import("mongoose").SchemaDefinitionProperty<string | undefined, SavingsMovement, import("mongoose").Document<unknown, {}, SavingsMovement, {}, import("mongoose").DefaultSchemaOptions> & SavingsMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    note?: import("mongoose").SchemaDefinitionProperty<string | undefined, SavingsMovement, import("mongoose").Document<unknown, {}, SavingsMovement, {}, import("mongoose").DefaultSchemaOptions> & SavingsMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    id?: import("mongoose").SchemaDefinitionProperty<string, SavingsMovement, import("mongoose").Document<unknown, {}, SavingsMovement, {}, import("mongoose").DefaultSchemaOptions> & SavingsMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<string, SavingsMovement, import("mongoose").Document<unknown, {}, SavingsMovement, {}, import("mongoose").DefaultSchemaOptions> & SavingsMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    createdAtMillis?: import("mongoose").SchemaDefinitionProperty<number, SavingsMovement, import("mongoose").Document<unknown, {}, SavingsMovement, {}, import("mongoose").DefaultSchemaOptions> & SavingsMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    updatedAtMillis?: import("mongoose").SchemaDefinitionProperty<number, SavingsMovement, import("mongoose").Document<unknown, {}, SavingsMovement, {}, import("mongoose").DefaultSchemaOptions> & SavingsMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    deletedAtMillis?: import("mongoose").SchemaDefinitionProperty<number | undefined, SavingsMovement, import("mongoose").Document<unknown, {}, SavingsMovement, {}, import("mongoose").DefaultSchemaOptions> & SavingsMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    clientUpdatedAtMillis?: import("mongoose").SchemaDefinitionProperty<number | undefined, SavingsMovement, import("mongoose").Document<unknown, {}, SavingsMovement, {}, import("mongoose").DefaultSchemaOptions> & SavingsMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    deviceId?: import("mongoose").SchemaDefinitionProperty<string | undefined, SavingsMovement, import("mongoose").Document<unknown, {}, SavingsMovement, {}, import("mongoose").DefaultSchemaOptions> & SavingsMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
}, SavingsMovement>;
export declare class Investment extends SyncableEntity {
    name: string;
    institution: string;
    type: string;
    currencyCode: string;
    defaultWalletId?: string;
    notes?: string;
    isActive: boolean;
}
export type InvestmentDocument = HydratedDocument<Investment>;
export declare const InvestmentSchema: import("mongoose").Schema<Investment, import("mongoose").Model<Investment, any, any, any, any, any, Investment>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Investment, import("mongoose").Document<unknown, {}, Investment, {}, import("mongoose").DefaultSchemaOptions> & Investment & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Investment, import("mongoose").Document<unknown, {}, Investment, {}, import("mongoose").DefaultSchemaOptions> & Investment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    institution?: import("mongoose").SchemaDefinitionProperty<string, Investment, import("mongoose").Document<unknown, {}, Investment, {}, import("mongoose").DefaultSchemaOptions> & Investment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<string, Investment, import("mongoose").Document<unknown, {}, Investment, {}, import("mongoose").DefaultSchemaOptions> & Investment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    currencyCode?: import("mongoose").SchemaDefinitionProperty<string, Investment, import("mongoose").Document<unknown, {}, Investment, {}, import("mongoose").DefaultSchemaOptions> & Investment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    defaultWalletId?: import("mongoose").SchemaDefinitionProperty<string | undefined, Investment, import("mongoose").Document<unknown, {}, Investment, {}, import("mongoose").DefaultSchemaOptions> & Investment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    notes?: import("mongoose").SchemaDefinitionProperty<string | undefined, Investment, import("mongoose").Document<unknown, {}, Investment, {}, import("mongoose").DefaultSchemaOptions> & Investment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, Investment, import("mongoose").Document<unknown, {}, Investment, {}, import("mongoose").DefaultSchemaOptions> & Investment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    id?: import("mongoose").SchemaDefinitionProperty<string, Investment, import("mongoose").Document<unknown, {}, Investment, {}, import("mongoose").DefaultSchemaOptions> & Investment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<string, Investment, import("mongoose").Document<unknown, {}, Investment, {}, import("mongoose").DefaultSchemaOptions> & Investment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    createdAtMillis?: import("mongoose").SchemaDefinitionProperty<number, Investment, import("mongoose").Document<unknown, {}, Investment, {}, import("mongoose").DefaultSchemaOptions> & Investment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    updatedAtMillis?: import("mongoose").SchemaDefinitionProperty<number, Investment, import("mongoose").Document<unknown, {}, Investment, {}, import("mongoose").DefaultSchemaOptions> & Investment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    deletedAtMillis?: import("mongoose").SchemaDefinitionProperty<number | undefined, Investment, import("mongoose").Document<unknown, {}, Investment, {}, import("mongoose").DefaultSchemaOptions> & Investment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    clientUpdatedAtMillis?: import("mongoose").SchemaDefinitionProperty<number | undefined, Investment, import("mongoose").Document<unknown, {}, Investment, {}, import("mongoose").DefaultSchemaOptions> & Investment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    deviceId?: import("mongoose").SchemaDefinitionProperty<string | undefined, Investment, import("mongoose").Document<unknown, {}, Investment, {}, import("mongoose").DefaultSchemaOptions> & Investment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
}, Investment>;
export declare class InvestmentMovement extends SyncableEntity {
    investmentId: string;
    type: string;
    amountMinor: number;
    currencyCode: string;
    walletId?: string;
    dateUtcMillis: number;
    note?: string;
}
export type InvestmentMovementDocument = HydratedDocument<InvestmentMovement>;
export declare const InvestmentMovementSchema: import("mongoose").Schema<InvestmentMovement, import("mongoose").Model<InvestmentMovement, any, any, any, any, any, InvestmentMovement>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, InvestmentMovement, import("mongoose").Document<unknown, {}, InvestmentMovement, {}, import("mongoose").DefaultSchemaOptions> & InvestmentMovement & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, {
    investmentId?: import("mongoose").SchemaDefinitionProperty<string, InvestmentMovement, import("mongoose").Document<unknown, {}, InvestmentMovement, {}, import("mongoose").DefaultSchemaOptions> & InvestmentMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<string, InvestmentMovement, import("mongoose").Document<unknown, {}, InvestmentMovement, {}, import("mongoose").DefaultSchemaOptions> & InvestmentMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    amountMinor?: import("mongoose").SchemaDefinitionProperty<number, InvestmentMovement, import("mongoose").Document<unknown, {}, InvestmentMovement, {}, import("mongoose").DefaultSchemaOptions> & InvestmentMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    currencyCode?: import("mongoose").SchemaDefinitionProperty<string, InvestmentMovement, import("mongoose").Document<unknown, {}, InvestmentMovement, {}, import("mongoose").DefaultSchemaOptions> & InvestmentMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    walletId?: import("mongoose").SchemaDefinitionProperty<string | undefined, InvestmentMovement, import("mongoose").Document<unknown, {}, InvestmentMovement, {}, import("mongoose").DefaultSchemaOptions> & InvestmentMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    dateUtcMillis?: import("mongoose").SchemaDefinitionProperty<number, InvestmentMovement, import("mongoose").Document<unknown, {}, InvestmentMovement, {}, import("mongoose").DefaultSchemaOptions> & InvestmentMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    note?: import("mongoose").SchemaDefinitionProperty<string | undefined, InvestmentMovement, import("mongoose").Document<unknown, {}, InvestmentMovement, {}, import("mongoose").DefaultSchemaOptions> & InvestmentMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    id?: import("mongoose").SchemaDefinitionProperty<string, InvestmentMovement, import("mongoose").Document<unknown, {}, InvestmentMovement, {}, import("mongoose").DefaultSchemaOptions> & InvestmentMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<string, InvestmentMovement, import("mongoose").Document<unknown, {}, InvestmentMovement, {}, import("mongoose").DefaultSchemaOptions> & InvestmentMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    createdAtMillis?: import("mongoose").SchemaDefinitionProperty<number, InvestmentMovement, import("mongoose").Document<unknown, {}, InvestmentMovement, {}, import("mongoose").DefaultSchemaOptions> & InvestmentMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    updatedAtMillis?: import("mongoose").SchemaDefinitionProperty<number, InvestmentMovement, import("mongoose").Document<unknown, {}, InvestmentMovement, {}, import("mongoose").DefaultSchemaOptions> & InvestmentMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    deletedAtMillis?: import("mongoose").SchemaDefinitionProperty<number | undefined, InvestmentMovement, import("mongoose").Document<unknown, {}, InvestmentMovement, {}, import("mongoose").DefaultSchemaOptions> & InvestmentMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    clientUpdatedAtMillis?: import("mongoose").SchemaDefinitionProperty<number | undefined, InvestmentMovement, import("mongoose").Document<unknown, {}, InvestmentMovement, {}, import("mongoose").DefaultSchemaOptions> & InvestmentMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
    deviceId?: import("mongoose").SchemaDefinitionProperty<string | undefined, InvestmentMovement, import("mongoose").Document<unknown, {}, InvestmentMovement, {}, import("mongoose").DefaultSchemaOptions> & InvestmentMovement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> | undefined;
}, InvestmentMovement>;
export declare class Currency {
    code: string;
    minorUnits: number;
    displayLabel: string;
    createdAtMillis: number;
    updatedAtMillis: number;
}
export type CurrencyDocument = HydratedDocument<Currency>;
export declare const CurrencySchema: import("mongoose").Schema<Currency, import("mongoose").Model<Currency, any, any, any, any, any, Currency>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Currency, import("mongoose").Document<unknown, {}, Currency, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Currency & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    code?: import("mongoose").SchemaDefinitionProperty<string, Currency, import("mongoose").Document<unknown, {}, Currency, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Currency & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    minorUnits?: import("mongoose").SchemaDefinitionProperty<number, Currency, import("mongoose").Document<unknown, {}, Currency, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Currency & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    displayLabel?: import("mongoose").SchemaDefinitionProperty<string, Currency, import("mongoose").Document<unknown, {}, Currency, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Currency & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAtMillis?: import("mongoose").SchemaDefinitionProperty<number, Currency, import("mongoose").Document<unknown, {}, Currency, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Currency & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    updatedAtMillis?: import("mongoose").SchemaDefinitionProperty<number, Currency, import("mongoose").Document<unknown, {}, Currency, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Currency & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Currency>;
export declare class ExchangeRateSnapshot {
    baseCurrency: string;
    snapshotDate: string;
    rates: Record<string, number>;
    fetchedAtMillis: number;
    expiresAtMillis: number;
}
export type ExchangeRateSnapshotDocument = HydratedDocument<ExchangeRateSnapshot>;
export declare const ExchangeRateSnapshotSchema: import("mongoose").Schema<ExchangeRateSnapshot, import("mongoose").Model<ExchangeRateSnapshot, any, any, any, any, any, ExchangeRateSnapshot>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ExchangeRateSnapshot, import("mongoose").Document<unknown, {}, ExchangeRateSnapshot, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ExchangeRateSnapshot & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    baseCurrency?: import("mongoose").SchemaDefinitionProperty<string, ExchangeRateSnapshot, import("mongoose").Document<unknown, {}, ExchangeRateSnapshot, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExchangeRateSnapshot & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    snapshotDate?: import("mongoose").SchemaDefinitionProperty<string, ExchangeRateSnapshot, import("mongoose").Document<unknown, {}, ExchangeRateSnapshot, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExchangeRateSnapshot & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    rates?: import("mongoose").SchemaDefinitionProperty<Record<string, number>, ExchangeRateSnapshot, import("mongoose").Document<unknown, {}, ExchangeRateSnapshot, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExchangeRateSnapshot & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    fetchedAtMillis?: import("mongoose").SchemaDefinitionProperty<number, ExchangeRateSnapshot, import("mongoose").Document<unknown, {}, ExchangeRateSnapshot, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExchangeRateSnapshot & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    expiresAtMillis?: import("mongoose").SchemaDefinitionProperty<number, ExchangeRateSnapshot, import("mongoose").Document<unknown, {}, ExchangeRateSnapshot, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExchangeRateSnapshot & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, ExchangeRateSnapshot>;
