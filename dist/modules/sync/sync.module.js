"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const lww_service_1 = require("../../shared/sync/lww.service");
const sync_metadata_schema_1 = require("../../shared/sync/sync-metadata.schema");
const entity_schemas_1 = require("../../shared/database/entity.schemas");
const sync_service_1 = require("./application/sync.service");
const sync_controller_1 = require("./presentation/sync.controller");
let SyncModule = class SyncModule {
};
exports.SyncModule = SyncModule;
exports.SyncModule = SyncModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
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
        ],
        controllers: [sync_controller_1.SyncController],
        providers: [sync_service_1.SyncService, lww_service_1.LwwService],
    })
], SyncModule);
//# sourceMappingURL=sync.module.js.map