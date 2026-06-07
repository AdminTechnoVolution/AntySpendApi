"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const auth_shared_module_1 = require("../../shared/auth/auth-shared.module");
const sync_metadata_schema_1 = require("../../shared/sync/sync-metadata.schema");
const entity_schemas_1 = require("../../shared/database/entity.schemas");
const user_schema_1 = require("./infrastructure/user.schema");
const account_deletion_service_1 = require("./application/account-deletion.service");
const auth_service_1 = require("./application/auth.service");
const auth_controller_1 = require("./presentation/auth.controller");
const settings_module_1 = require("../settings/settings.module");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_shared_module_1.AuthSharedModule,
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: user_schema_1.RefreshToken.name, schema: user_schema_1.RefreshTokenSchema },
                { name: sync_metadata_schema_1.SyncMetadata.name, schema: sync_metadata_schema_1.SyncMetadataSchema },
                { name: entity_schemas_1.UserSettings.name, schema: entity_schemas_1.UserSettingsSchema },
                { name: entity_schemas_1.Wallet.name, schema: entity_schemas_1.WalletSchema },
                { name: entity_schemas_1.Category.name, schema: entity_schemas_1.CategorySchema },
                { name: entity_schemas_1.Merchant.name, schema: entity_schemas_1.MerchantSchema },
                { name: entity_schemas_1.Transaction.name, schema: entity_schemas_1.TransactionSchema },
                { name: entity_schemas_1.Budget.name, schema: entity_schemas_1.BudgetSchema },
                { name: entity_schemas_1.RecurringExpense.name, schema: entity_schemas_1.RecurringExpenseSchema },
                { name: entity_schemas_1.SavingsPlan.name, schema: entity_schemas_1.SavingsPlanSchema },
                { name: entity_schemas_1.SavingsMovement.name, schema: entity_schemas_1.SavingsMovementSchema },
                { name: entity_schemas_1.Investment.name, schema: entity_schemas_1.InvestmentSchema },
                { name: entity_schemas_1.InvestmentMovement.name, schema: entity_schemas_1.InvestmentMovementSchema },
            ]),
            (0, common_1.forwardRef)(() => settings_module_1.SettingsModule),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, account_deletion_service_1.AccountDeletionService],
        exports: [auth_service_1.AuthService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map