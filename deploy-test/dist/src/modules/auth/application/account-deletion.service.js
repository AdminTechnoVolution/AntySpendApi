"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AccountDeletionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountDeletionService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const entity_schemas_1 = require("../../../shared/database/entity.schemas");
const sync_metadata_schema_1 = require("../../../shared/sync/sync-metadata.schema");
const user_schema_1 = require("../infrastructure/user.schema");
let AccountDeletionService = AccountDeletionService_1 = class AccountDeletionService {
    refreshTokenModel;
    syncMetadataModel;
    userModel;
    logger = new common_1.Logger(AccountDeletionService_1.name);
    syncEntityModels;
    constructor(settingsModel, walletModel, categoryModel, merchantModel, transactionModel, budgetModel, recurringModel, savingsPlanModel, savingsMovementModel, investmentModel, investmentMovementModel, refreshTokenModel, syncMetadataModel, userModel) {
        this.refreshTokenModel = refreshTokenModel;
        this.syncMetadataModel = syncMetadataModel;
        this.userModel = userModel;
        this.syncEntityModels = [
            settingsModel,
            walletModel,
            categoryModel,
            merchantModel,
            transactionModel,
            budgetModel,
            recurringModel,
            savingsPlanModel,
            savingsMovementModel,
            investmentModel,
            investmentMovementModel,
        ];
    }
    async deleteUserAccount(userId) {
        for (const model of this.syncEntityModels) {
            await model.deleteMany({ userId });
        }
        await this.refreshTokenModel.deleteMany({ userId });
        await this.syncMetadataModel.deleteMany({ userId });
        await this.userModel.findByIdAndDelete(userId);
        this.logger.log(`Deleted account and all data for user ${userId}`);
        return { success: true };
    }
};
exports.AccountDeletionService = AccountDeletionService;
exports.AccountDeletionService = AccountDeletionService = AccountDeletionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(entity_schemas_1.UserSettings.name)),
    __param(1, (0, mongoose_1.InjectModel)(entity_schemas_1.Wallet.name)),
    __param(2, (0, mongoose_1.InjectModel)(entity_schemas_1.Category.name)),
    __param(3, (0, mongoose_1.InjectModel)(entity_schemas_1.Merchant.name)),
    __param(4, (0, mongoose_1.InjectModel)(entity_schemas_1.Transaction.name)),
    __param(5, (0, mongoose_1.InjectModel)(entity_schemas_1.Budget.name)),
    __param(6, (0, mongoose_1.InjectModel)(entity_schemas_1.RecurringExpense.name)),
    __param(7, (0, mongoose_1.InjectModel)(entity_schemas_1.SavingsPlan.name)),
    __param(8, (0, mongoose_1.InjectModel)(entity_schemas_1.SavingsMovement.name)),
    __param(9, (0, mongoose_1.InjectModel)(entity_schemas_1.Investment.name)),
    __param(10, (0, mongoose_1.InjectModel)(entity_schemas_1.InvestmentMovement.name)),
    __param(11, (0, mongoose_1.InjectModel)(user_schema_1.RefreshToken.name)),
    __param(12, (0, mongoose_1.InjectModel)(sync_metadata_schema_1.SyncMetadata.name)),
    __param(13, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], AccountDeletionService);
