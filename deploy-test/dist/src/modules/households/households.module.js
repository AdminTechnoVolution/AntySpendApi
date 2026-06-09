"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HouseholdsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const household_schemas_1 = require("./infrastructure/household.schemas");
const entity_schemas_1 = require("../../shared/database/entity.schemas");
const user_schema_1 = require("../auth/infrastructure/user.schema");
const household_service_1 = require("./application/household.service");
const household_authz_service_1 = require("./application/household-authz.service");
const family_view_service_1 = require("./application/family-view.service");
const entitlements_service_1 = require("./application/entitlements.service");
const play_billing_verification_service_1 = require("./application/play-billing-verification.service");
const households_controller_1 = require("./presentation/households.controller");
const entitlements_controller_1 = require("./presentation/entitlements.controller");
let HouseholdsModule = class HouseholdsModule {
};
exports.HouseholdsModule = HouseholdsModule;
exports.HouseholdsModule = HouseholdsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: household_schemas_1.Household.name, schema: household_schemas_1.HouseholdSchema },
                { name: household_schemas_1.HouseholdMember.name, schema: household_schemas_1.HouseholdMemberSchema },
                { name: household_schemas_1.HouseholdInvite.name, schema: household_schemas_1.HouseholdInviteSchema },
                { name: household_schemas_1.UserEntitlement.name, schema: household_schemas_1.UserEntitlementSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: entity_schemas_1.Wallet.name, schema: entity_schemas_1.WalletSchema },
                { name: entity_schemas_1.Transaction.name, schema: entity_schemas_1.TransactionSchema },
                { name: entity_schemas_1.Investment.name, schema: entity_schemas_1.InvestmentSchema },
                { name: entity_schemas_1.InvestmentMovement.name, schema: entity_schemas_1.InvestmentMovementSchema },
                { name: entity_schemas_1.Category.name, schema: entity_schemas_1.CategorySchema },
                { name: entity_schemas_1.Budget.name, schema: entity_schemas_1.BudgetSchema },
                { name: entity_schemas_1.SavingsPlan.name, schema: entity_schemas_1.SavingsPlanSchema },
                { name: entity_schemas_1.SavingsMovement.name, schema: entity_schemas_1.SavingsMovementSchema },
            ]),
        ],
        controllers: [households_controller_1.HouseholdsController, entitlements_controller_1.EntitlementsController],
        providers: [
            household_service_1.HouseholdService,
            household_authz_service_1.HouseholdAuthzService,
            family_view_service_1.FamilyViewService,
            play_billing_verification_service_1.PlayBillingVerificationService,
            entitlements_service_1.EntitlementsService,
        ],
        exports: [household_authz_service_1.HouseholdAuthzService, entitlements_service_1.EntitlementsService],
    })
], HouseholdsModule);
