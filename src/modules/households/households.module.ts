import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Household,
  HouseholdInvite,
  HouseholdInviteSchema,
  HouseholdMember,
  HouseholdMemberSchema,
  HouseholdSchema,
  UserEntitlement,
  UserEntitlementSchema,
} from './infrastructure/household.schemas';
import {
  Budget,
  BudgetSchema,
  BudgetMemberQuota,
  BudgetMemberQuotaSchema,
  Category,
  CategorySchema,
  ExpenseSplit,
  ExpenseSplitSchema,
  ExpenseSplitLine,
  ExpenseSplitLineSchema,
  Investment,
  InvestmentMovement,
  InvestmentMovementSchema,
  InvestmentSchema,
  Settlement,
  SettlementSchema,
  Transaction,
  TransactionSchema,
  SavingsMovement,
  SavingsMovementSchema,
  SavingsPlan,
  SavingsPlanSchema,
  Wallet,
  WalletSchema,
} from '../../shared/database/entity.schemas';
import { User, UserSchema } from '../auth/infrastructure/user.schema';
import { HouseholdService } from './application/household.service';
import { HouseholdAuthzService } from './application/household-authz.service';
import { FamilyViewService } from './application/family-view.service';
import { EntitlementsService } from './application/entitlements.service';
import { PlayBillingVerificationService } from './application/play-billing-verification.service';
import { HouseholdFamilyService } from './application/household-family.service';
import { HouseholdsController } from './presentation/households.controller';
import { EntitlementsController } from './presentation/entitlements.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Household.name, schema: HouseholdSchema },
      { name: HouseholdMember.name, schema: HouseholdMemberSchema },
      { name: HouseholdInvite.name, schema: HouseholdInviteSchema },
      { name: UserEntitlement.name, schema: UserEntitlementSchema },
      { name: User.name, schema: UserSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Investment.name, schema: InvestmentSchema },
      { name: InvestmentMovement.name, schema: InvestmentMovementSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Budget.name, schema: BudgetSchema },
      { name: ExpenseSplit.name, schema: ExpenseSplitSchema },
      { name: ExpenseSplitLine.name, schema: ExpenseSplitLineSchema },
      { name: Settlement.name, schema: SettlementSchema },
      { name: BudgetMemberQuota.name, schema: BudgetMemberQuotaSchema },
      { name: SavingsPlan.name, schema: SavingsPlanSchema },
      { name: SavingsMovement.name, schema: SavingsMovementSchema },
    ]),
  ],
  controllers: [HouseholdsController, EntitlementsController],
  providers: [
    HouseholdService,
    HouseholdAuthzService,
    FamilyViewService,
    HouseholdFamilyService,
    PlayBillingVerificationService,
    EntitlementsService,
  ],
  exports: [HouseholdAuthzService, EntitlementsService],
})
export class HouseholdsModule {}
