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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamilyViewService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const entity_schemas_1 = require("../../../shared/database/entity.schemas");
const household_schemas_1 = require("../infrastructure/household.schemas");
const household_authz_service_1 = require("./household-authz.service");
function toPlainList(docs) {
    return docs.map((doc) => {
        const { _id, __v, ...rest } = doc;
        return rest;
    });
}
let FamilyViewService = class FamilyViewService {
    memberModel;
    walletModel;
    transactionModel;
    investmentModel;
    investmentMovementModel;
    categoryModel;
    budgetModel;
    savingsPlanModel;
    savingsMovementModel;
    authzService;
    constructor(memberModel, walletModel, transactionModel, investmentModel, investmentMovementModel, categoryModel, budgetModel, savingsPlanModel, savingsMovementModel, authzService) {
        this.memberModel = memberModel;
        this.walletModel = walletModel;
        this.transactionModel = transactionModel;
        this.investmentModel = investmentModel;
        this.investmentMovementModel = investmentMovementModel;
        this.categoryModel = categoryModel;
        this.budgetModel = budgetModel;
        this.savingsPlanModel = savingsPlanModel;
        this.savingsMovementModel = savingsMovementModel;
        this.authzService = authzService;
    }
    async getFamilyView(householdId, requestingUserId) {
        await this.authzService.assertActiveMember(requestingUserId, householdId);
        const members = await this.memberModel
            .find({ householdId, status: household_schemas_1.MEMBER_STATUS.ACTIVE })
            .lean();
        const memberViews = await Promise.all(members.map(async (member) => {
            const privacy = member.privacySettings;
            const privateFilter = {
                userId: member.userId,
                $or: [{ householdId: { $exists: false } }, { householdId: null }],
                deletedAtMillis: { $exists: false },
            };
            const [wallets, transactions, investments, investmentMovements, categories] = await Promise.all([
                privacy.shareWallets
                    ? this.walletModel.find(privateFilter).lean()
                    : Promise.resolve([]),
                privacy.shareTransactions
                    ? this.transactionModel.find(privateFilter).lean()
                    : Promise.resolve([]),
                privacy.shareInvestments
                    ? this.investmentModel.find(privateFilter).lean()
                    : Promise.resolve([]),
                privacy.shareInvestments
                    ? this.investmentMovementModel
                        .find({
                        userId: member.userId,
                        $or: [
                            { householdId: { $exists: false } },
                            { householdId: null },
                        ],
                        deletedAtMillis: { $exists: false },
                    })
                        .lean()
                    : Promise.resolve([]),
                privacy.shareCategories
                    ? this.categoryModel.find(privateFilter).lean()
                    : Promise.resolve([]),
            ]);
            return {
                userId: member.userId,
                displayName: member.displayName,
                email: member.email,
                role: member.role,
                privacySettings: privacy,
                sharedData: {
                    wallets: toPlainList(wallets),
                    transactions: toPlainList(transactions),
                    investments: toPlainList(investments),
                    investmentMovements: toPlainList(investmentMovements),
                    categories: toPlainList(categories),
                },
            };
        }));
        const sharedFilter = {
            householdId,
            deletedAtMillis: { $exists: false },
        };
        const [sharedWallets, sharedTransactions, sharedInvestments, sharedInvestmentMovements, sharedCategories, sharedBudgets, sharedSavingsPlans, sharedSavingsMovements] = await Promise.all([
            this.walletModel.find(sharedFilter).lean(),
            this.transactionModel.find(sharedFilter).lean(),
            this.investmentModel.find(sharedFilter).lean(),
            this.investmentMovementModel.find(sharedFilter).lean(),
            this.categoryModel.find(sharedFilter).lean(),
            this.budgetModel.find(sharedFilter).lean(),
            this.savingsPlanModel.find(sharedFilter).lean(),
            this.savingsMovementModel.find(sharedFilter).lean(),
        ]);
        return {
            householdId,
            members: memberViews,
            householdShared: {
                wallets: toPlainList(sharedWallets),
                transactions: toPlainList(sharedTransactions),
                investments: toPlainList(sharedInvestments),
                investmentMovements: toPlainList(sharedInvestmentMovements),
                categories: toPlainList(sharedCategories),
                budgets: toPlainList(sharedBudgets),
                savingsPlans: toPlainList(sharedSavingsPlans),
                savingsMovements: toPlainList(sharedSavingsMovements),
            },
            generatedAtMillis: Date.now(),
        };
    }
};
exports.FamilyViewService = FamilyViewService;
exports.FamilyViewService = FamilyViewService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(household_schemas_1.HouseholdMember.name)),
    __param(1, (0, mongoose_1.InjectModel)(entity_schemas_1.Wallet.name)),
    __param(2, (0, mongoose_1.InjectModel)(entity_schemas_1.Transaction.name)),
    __param(3, (0, mongoose_1.InjectModel)(entity_schemas_1.Investment.name)),
    __param(4, (0, mongoose_1.InjectModel)(entity_schemas_1.InvestmentMovement.name)),
    __param(5, (0, mongoose_1.InjectModel)(entity_schemas_1.Category.name)),
    __param(6, (0, mongoose_1.InjectModel)(entity_schemas_1.Budget.name)),
    __param(7, (0, mongoose_1.InjectModel)(entity_schemas_1.SavingsPlan.name)),
    __param(8, (0, mongoose_1.InjectModel)(entity_schemas_1.SavingsMovement.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        household_authz_service_1.HouseholdAuthzService])
], FamilyViewService);
