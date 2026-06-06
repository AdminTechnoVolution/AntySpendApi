import { Model } from 'mongoose';
import { GoogleProfile } from '../../../shared/auth/google-token.verifier';
import { UserSettings, UserSettingsDocument } from '../../../shared/database/entity.schemas';
export declare class SettingsService {
    private readonly settingsModel;
    constructor(settingsModel: Model<UserSettingsDocument>);
    ensureForUser(userId: string, profile: GoogleProfile): Promise<void>;
    createDefaultForUser(userId: string, profile: GoogleProfile): Promise<void>;
    get(userId: string): Promise<import("mongoose").Document<unknown, {}, UserSettings, {}, import("mongoose").DefaultSchemaOptions> & UserSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    findByUserId(userId: string): Promise<(import("mongoose").Document<unknown, {}, UserSettings, {}, import("mongoose").DefaultSchemaOptions> & UserSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | null>;
    update(userId: string, data: Partial<UserSettings>): Promise<import("mongoose").Document<unknown, {}, UserSettings, {}, import("mongoose").DefaultSchemaOptions> & UserSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    getModel(): Model<UserSettingsDocument>;
}
