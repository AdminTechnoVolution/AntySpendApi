import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GoogleProfile } from '../../../shared/auth/google-token.verifier';
import { newEntityId } from '../../../shared/crud/syncable-crud.service';
import {
  UserSettings,
  UserSettingsDocument,
} from '../../../shared/database/entity.schemas';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(UserSettings.name)
    private readonly settingsModel: Model<UserSettingsDocument>,
  ) {}

  async ensureForUser(userId: string, profile: GoogleProfile) {
    const now = Date.now();
    await this.settingsModel.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: {
          id: newEntityId(),
          userId,
          primaryCurrencyCode: 'USD',
          hasCompletedOnboarding: false,
          themeMode: 'SYSTEM',
          voiceInputEnabled: true,
          usdConversionEnabled: false,
          exchangeRateMode: 'AUTO',
          microExpenseThresholdPrimaryMinor: 0,
          textSize: 'MEDIUM',
          googleUserName: profile.name,
          googleUserEmail: profile.email,
          googleUserProfilePictureUrl: profile.picture,
          createdAtMillis: now,
          updatedAtMillis: now,
        } as UserSettings,
      },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  /** @deprecated use ensureForUser */
  async createDefaultForUser(userId: string, profile: GoogleProfile) {
    return this.ensureForUser(userId, profile);
  }

  async get(userId: string) {
    const settings = await this.settingsModel.findOne({ userId }).lean();
    if (!settings) {
      throw new Error('Settings not found');
    }
    return settings;
  }

  async findByUserId(userId: string) {
    return this.settingsModel.findOne({ userId }).lean();
  }

  async update(userId: string, data: Partial<UserSettings>) {
    const now = Date.now();
    const updated = await this.settingsModel
      .findOneAndUpdate(
        { userId },
        {
          $set: { ...data, updatedAtMillis: now },
          $setOnInsert: {
            id: newEntityId(),
            userId,
            createdAtMillis: now,
          },
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
      )
      .lean();
    return updated;
  }

  getModel(): Model<UserSettingsDocument> {
    return this.settingsModel;
  }
}
