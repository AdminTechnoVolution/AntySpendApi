import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import { UserSettings } from '../../../shared/database/entity.schemas';
import { SettingsService } from '../application/settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    get(user: AuthenticatedUser): Promise<import("mongoose").Document<unknown, {}, UserSettings, {}, import("mongoose").DefaultSchemaOptions> & UserSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    update(user: AuthenticatedUser, body: Partial<UserSettings>): Promise<import("mongoose").Document<unknown, {}, UserSettings, {}, import("mongoose").DefaultSchemaOptions> & UserSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
}
