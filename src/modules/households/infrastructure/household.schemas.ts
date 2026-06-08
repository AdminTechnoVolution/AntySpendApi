import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export const HOUSEHOLD_PLAN_TYPE = 'FAMILY' as const;
export const MEMBER_ROLE = { OWNER: 'OWNER', MEMBER: 'MEMBER' } as const;
export const MEMBER_STATUS = { PENDING: 'PENDING', ACTIVE: 'ACTIVE' } as const;
export const INVITE_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REVOKED: 'REVOKED',
} as const;
export const PLAN_TYPE = { PERSONAL: 'PERSONAL', FAMILY: 'FAMILY' } as const;
export const ENTITLEMENT_STATUS = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  CANCELED: 'CANCELED',
  NONE: 'NONE',
} as const;
export const ENTITLEMENT_SOURCE = {
  PLAY_STORE: 'PLAY_STORE',
} as const;
export const PLAY_PRODUCT_PERSONAL = 'antyspend_personal_monthly';
export const PLAY_PRODUCT_FAMILY = 'antyspend_family_monthly';

export interface MemberPrivacySettings {
  shareWallets: boolean;
  shareTransactions: boolean;
  shareInvestments: boolean;
  shareCategories: boolean;
}

export const DEFAULT_PRIVACY_SETTINGS: MemberPrivacySettings = {
  shareWallets: false,
  shareTransactions: false,
  shareInvestments: false,
  shareCategories: false,
};

@Schema({ collection: 'households', strict: true })
export class Household {
  @Prop({ required: true, unique: true })
  id!: string;

  @Prop({ required: true, index: true })
  ownerUserId!: string;

  @Prop()
  name?: string;

  @Prop({ required: true, default: HOUSEHOLD_PLAN_TYPE })
  planType!: string;

  @Prop({ required: true, default: 5 })
  maxMembers!: number;

  @Prop({ required: true })
  createdAtMillis!: number;

  @Prop({ required: true })
  updatedAtMillis!: number;
}

export type HouseholdDocument = HydratedDocument<Household>;
export const HouseholdSchema = SchemaFactory.createForClass(Household);

@Schema({ collection: 'household_members', strict: true })
export class HouseholdMember {
  @Prop({ required: true, unique: true })
  id!: string;

  @Prop({ required: true, index: true })
  householdId!: string;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  role!: string;

  @Prop({ required: true })
  status!: string;

  @Prop({
    type: {
      shareWallets: { type: Boolean, default: false },
      shareTransactions: { type: Boolean, default: false },
      shareInvestments: { type: Boolean, default: false },
      shareCategories: { type: Boolean, default: false },
    },
    default: DEFAULT_PRIVACY_SETTINGS,
  })
  privacySettings!: MemberPrivacySettings;

  @Prop()
  displayName?: string;

  @Prop()
  email?: string;

  @Prop({ required: true })
  createdAtMillis!: number;

  @Prop({ required: true })
  updatedAtMillis!: number;
}

export type HouseholdMemberDocument = HydratedDocument<HouseholdMember>;
export const HouseholdMemberSchema =
  SchemaFactory.createForClass(HouseholdMember);
HouseholdMemberSchema.index({ householdId: 1, userId: 1 }, { unique: true });
HouseholdMemberSchema.index(
  { userId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: MEMBER_STATUS.ACTIVE } },
);

@Schema({ collection: 'household_invites', strict: true })
export class HouseholdInvite {
  @Prop({ required: true, unique: true })
  id!: string;

  @Prop({ required: true, index: true })
  householdId!: string;

  @Prop({ required: true, unique: true })
  token!: string;

  @Prop()
  email?: string;

  @Prop({ required: true })
  invitedByUserId!: string;

  @Prop({ required: true })
  expiresAtMillis!: number;

  @Prop({ required: true })
  status!: string;

  @Prop({ required: true })
  createdAtMillis!: number;

  @Prop({ required: true })
  updatedAtMillis!: number;
}

export type HouseholdInviteDocument = HydratedDocument<HouseholdInvite>;
export const HouseholdInviteSchema =
  SchemaFactory.createForClass(HouseholdInvite);
HouseholdInviteSchema.index({ householdId: 1, status: 1 });

@Schema({ collection: 'user_entitlements', strict: true })
export class UserEntitlement {
  @Prop({ required: true, unique: true })
  userId!: string;

  @Prop({ required: true, default: PLAN_TYPE.PERSONAL })
  planType!: string;

  @Prop({ required: true, default: ENTITLEMENT_STATUS.NONE })
  status!: string;

  @Prop({ required: true, default: ENTITLEMENT_SOURCE.PLAY_STORE })
  source!: string;

  @Prop()
  expiresAtMillis?: number;

  @Prop()
  googlePlayProductId?: string;

  @Prop()
  googlePlayPurchaseToken?: string;

  @Prop()
  googlePlayOrderId?: string;

  @Prop()
  packageName?: string;

  @Prop()
  autoRenewing?: boolean;

  @Prop({ required: true })
  createdAtMillis!: number;

  @Prop({ required: true })
  updatedAtMillis!: number;
}

export type UserEntitlementDocument = HydratedDocument<UserEntitlement>;
export const UserEntitlementSchema =
  SchemaFactory.createForClass(UserEntitlement);
