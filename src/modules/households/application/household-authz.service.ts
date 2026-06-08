import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SyncChange, SyncEntityType } from '../../../shared/sync/sync.types';
import {
  HOUSEHOLD_SHAREABLE_ENTITY_TYPES,
  MEMBER_CONTRIBUTION_ENTITY_TYPES,
  OWNER_ONLY_SHARED_ENTITY_TYPES,
} from './household.constants';
import {
  HouseholdMember,
  HouseholdMemberDocument,
  MEMBER_ROLE,
  MEMBER_STATUS,
} from '../infrastructure/household.schemas';

export type HouseholdAuthzDecision =
  | { allowed: true; householdId?: string; isOwner: boolean }
  | { allowed: false; reason: string };

@Injectable()
export class HouseholdAuthzService {
  constructor(
    @InjectModel(HouseholdMember.name)
    private readonly memberModel: Model<HouseholdMemberDocument>,
  ) {}

  async getActiveMembership(userId: string) {
    return this.memberModel
      .findOne({ userId, status: MEMBER_STATUS.ACTIVE })
      .lean();
  }

  async getActiveHouseholdId(userId: string): Promise<string | null> {
    const membership = await this.getActiveMembership(userId);
    return membership?.householdId ?? null;
  }

  async getActiveMemberUserIds(householdId: string): Promise<string[]> {
    const members = await this.memberModel
      .find({ householdId, status: MEMBER_STATUS.ACTIVE })
      .lean();
    return members.map((m) => m.userId);
  }

  async assertActiveMember(userId: string, householdId: string) {
    const membership = await this.memberModel
      .findOne({ userId, householdId, status: MEMBER_STATUS.ACTIVE })
      .lean();
    if (!membership) {
      throw new ForbiddenException('NOT_HOUSEHOLD_MEMBER');
    }
    return membership;
  }

  async assertOwner(userId: string, householdId: string) {
    const membership = await this.assertActiveMember(userId, householdId);
    if (membership.role !== MEMBER_ROLE.OWNER) {
      throw new ForbiddenException('OWNER_ONLY');
    }
    return membership;
  }

  resolveHouseholdId(
    change: SyncChange,
    existing: Record<string, unknown> | null,
  ): string | undefined {
    const payloadHouseholdId = change.payload.householdId as string | undefined;
    const existingHouseholdId = existing?.householdId as string | undefined;
    return payloadHouseholdId ?? existingHouseholdId;
  }

  async authorizeSyncChange(
    userId: string,
    change: SyncChange,
    existing: Record<string, unknown> | null,
  ): Promise<HouseholdAuthzDecision> {
    const householdId = this.resolveHouseholdId(change, existing);

    if (!householdId) {
      return { allowed: true, isOwner: false };
    }

    if (!HOUSEHOLD_SHAREABLE_ENTITY_TYPES.has(change.entityType)) {
      return { allowed: false, reason: 'ENTITY_NOT_SHAREABLE' };
    }

    const membership = await this.memberModel
      .findOne({ userId, householdId, status: MEMBER_STATUS.ACTIVE })
      .lean();

    if (!membership) {
      return { allowed: false, reason: 'NOT_HOUSEHOLD_MEMBER' };
    }

    const isOwner = membership.role === MEMBER_ROLE.OWNER;
    const isDelete = change.deletedAtMillis !== undefined;
    const isNew = existing === null;

    if (OWNER_ONLY_SHARED_ENTITY_TYPES.has(change.entityType)) {
      if (isNew || isDelete) {
        if (!isOwner) {
          return { allowed: false, reason: 'OWNER_ONLY' };
        }
      } else if (!isOwner) {
        return { allowed: false, reason: 'OWNER_ONLY' };
      }
    }

    if (MEMBER_CONTRIBUTION_ENTITY_TYPES.has(change.entityType)) {
      if (isNew || !isDelete) {
        return { allowed: true, householdId, isOwner };
      }
    }

    return { allowed: true, householdId, isOwner };
  }

  buildEntityFilter(
    userId: string,
    change: SyncChange,
    householdId: string | undefined,
  ): Record<string, unknown> {
    if (change.entityType === 'settings') {
      return { userId };
    }

    if (householdId) {
      return { householdId, id: change.entityId };
    }

    return { userId, id: change.entityId, householdId: { $exists: false } };
  }

  buildPrivatePullFilter(userId: string): Record<string, unknown> {
    return {
      userId,
      $or: [{ householdId: { $exists: false } }, { householdId: null }],
    };
  }

  buildSharedPullFilter(householdId: string): Record<string, unknown> {
    return { householdId };
  }

  isShareableEntityType(entityType: SyncEntityType): boolean {
    return HOUSEHOLD_SHAREABLE_ENTITY_TYPES.has(entityType);
  }
}
