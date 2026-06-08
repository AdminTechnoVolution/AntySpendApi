import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomBytes } from 'crypto';
import { newEntityId } from '../../../shared/crud/syncable-crud.service';
import {
  DEFAULT_PRIVACY_SETTINGS,
  Household,
  HouseholdDocument,
  HouseholdInvite,
  HouseholdInviteDocument,
  HouseholdMember,
  HouseholdMemberDocument,
  HOUSEHOLD_PLAN_TYPE,
  INVITE_STATUS,
  MEMBER_ROLE,
  MEMBER_STATUS,
} from '../infrastructure/household.schemas';
import { EntitlementsService } from './entitlements.service';
import { MAX_HOUSEHOLD_MEMBERS, INVITE_EXPIRY_MS } from './household.constants';
import { UpdatePrivacyDto } from '../dto/household.dto';
import { User, UserDocument } from '../../auth/infrastructure/user.schema';

function toPlain(doc: object) {
  const { _id, __v, ...rest } = doc as Record<string, unknown>;
  return rest;
}

@Injectable()
export class HouseholdService {
  constructor(
    @InjectModel(Household.name)
    private readonly householdModel: Model<HouseholdDocument>,
    @InjectModel(HouseholdMember.name)
    private readonly memberModel: Model<HouseholdMemberDocument>,
    @InjectModel(HouseholdInvite.name)
    private readonly inviteModel: Model<HouseholdInviteDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly entitlementsService: EntitlementsService,
  ) {}

  async getMyHousehold(userId: string) {
    const planType = await this.entitlementsService.getPlanType(userId);

    const membership = await this.memberModel
      .findOne({ userId, status: MEMBER_STATUS.ACTIVE })
      .lean();

    if (!membership) {
      return {
        household: null,
        membership: null,
        members: [],
        pendingInvites: [],
        planType,
      };
    }

    const household = await this.householdModel
      .findOne({ id: membership.householdId })
      .lean();

    if (!household) {
      return {
        household: null,
        membership: null,
        members: [],
        pendingInvites: [],
        planType,
      };
    }

    const members = await this.memberModel
      .find({ householdId: membership.householdId, status: MEMBER_STATUS.ACTIVE })
      .lean();

    const pendingInvites =
      membership.role === MEMBER_ROLE.OWNER
        ? await this.inviteModel
            .find({
              householdId: membership.householdId,
              status: INVITE_STATUS.PENDING,
              expiresAtMillis: { $gt: Date.now() },
            })
            .lean()
        : [];

    return {
      household: toPlain(household),
      membership: toPlain(membership),
      members: members.map((m) => toPlain(m)),
      pendingInvites: pendingInvites.map((i) => toPlain(i)),
      planType,
    };
  }

  async createHousehold(userId: string, name?: string) {
    await this.entitlementsService.requireFamilyPlan(userId);

    const existing = await this.memberModel
      .findOne({ userId, status: MEMBER_STATUS.ACTIVE })
      .lean();
    if (existing) {
      throw new ConflictException('ALREADY_IN_HOUSEHOLD');
    }

    const user = await this.userModel.findById(userId).lean();
    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    const now = Date.now();
    const householdId = newEntityId();
    const memberId = newEntityId();

    const household = await this.householdModel.create({
      id: householdId,
      ownerUserId: userId,
      name,
      planType: HOUSEHOLD_PLAN_TYPE,
      maxMembers: MAX_HOUSEHOLD_MEMBERS,
      createdAtMillis: now,
      updatedAtMillis: now,
    });

    const member = await this.memberModel.create({
      id: memberId,
      householdId,
      userId,
      role: MEMBER_ROLE.OWNER,
      status: MEMBER_STATUS.ACTIVE,
      privacySettings: { ...DEFAULT_PRIVACY_SETTINGS },
      displayName: user.name,
      email: user.email,
      createdAtMillis: now,
      updatedAtMillis: now,
    });

    return {
      household: toPlain(household.toObject()),
      membership: toPlain(member.toObject()),
    };
  }

  async createInvite(householdId: string, userId: string, email?: string) {
    await this.assertOwnerAccess(householdId, userId);
    await this.assertMemberCapacity(householdId);

    const now = Date.now();
    const token = randomBytes(16).toString('hex');
    const invite = await this.inviteModel.create({
      id: newEntityId(),
      householdId,
      token,
      email: email?.toLowerCase(),
      invitedByUserId: userId,
      expiresAtMillis: now + INVITE_EXPIRY_MS,
      status: INVITE_STATUS.PENDING,
      createdAtMillis: now,
      updatedAtMillis: now,
    });

    return toPlain(invite.toObject());
  }

  async acceptInvite(token: string, userId: string, userEmail: string) {
    const invite = await this.inviteModel.findOne({ token }).lean();
    if (!invite) {
      throw new NotFoundException('INVITE_NOT_FOUND');
    }
    if (invite.status !== INVITE_STATUS.PENDING) {
      throw new BadRequestException('INVITE_NOT_PENDING');
    }
    if (invite.expiresAtMillis <= Date.now()) {
      throw new BadRequestException('INVITE_EXPIRED');
    }

    if (invite.email && invite.email.toLowerCase() !== userEmail.toLowerCase()) {
      throw new ForbiddenException('INVITE_EMAIL_MISMATCH');
    }

    const existingMembership = await this.memberModel
      .findOne({ userId, status: MEMBER_STATUS.ACTIVE })
      .lean();
    if (existingMembership) {
      throw new ConflictException('ALREADY_IN_HOUSEHOLD');
    }

    await this.assertMemberCapacity(invite.householdId);

    const user = await this.userModel.findById(userId).lean();
    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    const now = Date.now();
    const member = await this.memberModel.create({
      id: newEntityId(),
      householdId: invite.householdId,
      userId,
      role: MEMBER_ROLE.MEMBER,
      status: MEMBER_STATUS.ACTIVE,
      privacySettings: { ...DEFAULT_PRIVACY_SETTINGS },
      displayName: user.name,
      email: user.email,
      createdAtMillis: now,
      updatedAtMillis: now,
    });

    await this.inviteModel.updateOne(
      { id: invite.id },
      { $set: { status: INVITE_STATUS.ACCEPTED, updatedAtMillis: now } },
    );

    const household = await this.householdModel
      .findOne({ id: invite.householdId })
      .lean();

    return {
      household: household ? toPlain(household) : null,
      membership: toPlain(member.toObject()),
    };
  }

  async revokeInvite(householdId: string, inviteId: string, userId: string) {
    await this.assertOwnerAccess(householdId, userId);

    const invite = await this.inviteModel
      .findOne({ id: inviteId, householdId })
      .lean();
    if (!invite) {
      throw new NotFoundException('INVITE_NOT_FOUND');
    }
    if (invite.status !== INVITE_STATUS.PENDING) {
      throw new BadRequestException('INVITE_NOT_PENDING');
    }

    const now = Date.now();
    await this.inviteModel.updateOne(
      { id: inviteId },
      { $set: { status: INVITE_STATUS.REVOKED, updatedAtMillis: now } },
    );

    return { id: inviteId, revoked: true };
  }

  async removeMember(householdId: string, targetUserId: string, userId: string) {
    await this.assertOwnerAccess(householdId, userId);

    if (targetUserId === userId) {
      throw new BadRequestException('CANNOT_REMOVE_SELF');
    }

    const target = await this.memberModel
      .findOne({
        householdId,
        userId: targetUserId,
        status: MEMBER_STATUS.ACTIVE,
      })
      .lean();
    if (!target) {
      throw new NotFoundException('MEMBER_NOT_FOUND');
    }
    if (target.role === MEMBER_ROLE.OWNER) {
      throw new ForbiddenException('CANNOT_REMOVE_OWNER');
    }

    await this.memberModel.deleteOne({ id: target.id });
    return { userId: targetUserId, removed: true };
  }

  async leaveHousehold(householdId: string, userId: string) {
    const membership = await this.memberModel
      .findOne({ householdId, userId, status: MEMBER_STATUS.ACTIVE })
      .lean();
    if (!membership) {
      throw new NotFoundException('MEMBER_NOT_FOUND');
    }
    if (membership.role === MEMBER_ROLE.OWNER) {
      throw new ForbiddenException('OWNER_CANNOT_LEAVE');
    }

    await this.memberModel.deleteOne({ id: membership.id });
    return { left: true };
  }

  async updatePrivacy(userId: string, dto: UpdatePrivacyDto) {
    const membership = await this.memberModel
      .findOne({ userId, status: MEMBER_STATUS.ACTIVE })
      .lean();
    if (!membership) {
      throw new NotFoundException('NOT_IN_HOUSEHOLD');
    }

    const privacySettings = {
      ...membership.privacySettings,
      ...(dto.shareWallets !== undefined
        ? { shareWallets: dto.shareWallets }
        : {}),
      ...(dto.shareTransactions !== undefined
        ? { shareTransactions: dto.shareTransactions }
        : {}),
      ...(dto.shareInvestments !== undefined
        ? { shareInvestments: dto.shareInvestments }
        : {}),
      ...(dto.shareCategories !== undefined
        ? { shareCategories: dto.shareCategories }
        : {}),
    };

    const now = Date.now();
    const updated = await this.memberModel
      .findOneAndUpdate(
        { id: membership.id },
        { $set: { privacySettings, updatedAtMillis: now } },
        { returnDocument: 'after' },
      )
      .lean();

    return toPlain(updated!);
  }

  private async assertOwnerAccess(householdId: string, userId: string) {
    const membership = await this.memberModel
      .findOne({ householdId, userId, status: MEMBER_STATUS.ACTIVE })
      .lean();
    if (!membership) {
      throw new ForbiddenException('NOT_HOUSEHOLD_MEMBER');
    }
    if (membership.role !== MEMBER_ROLE.OWNER) {
      throw new ForbiddenException('OWNER_ONLY');
    }
    return membership;
  }

  private async assertMemberCapacity(householdId: string) {
    const activeCount = await this.memberModel.countDocuments({
      householdId,
      status: MEMBER_STATUS.ACTIVE,
    });
    const pendingCount = await this.inviteModel.countDocuments({
      householdId,
      status: INVITE_STATUS.PENDING,
      expiresAtMillis: { $gt: Date.now() },
    });

    if (activeCount + pendingCount >= MAX_HOUSEHOLD_MEMBERS) {
      throw new ConflictException('HOUSEHOLD_MEMBER_LIMIT');
    }
  }
}
