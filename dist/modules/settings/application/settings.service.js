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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const syncable_crud_service_1 = require("../../../shared/crud/syncable-crud.service");
const entity_schemas_1 = require("../../../shared/database/entity.schemas");
let SettingsService = class SettingsService {
    settingsModel;
    constructor(settingsModel) {
        this.settingsModel = settingsModel;
    }
    async ensureForUser(userId, profile) {
        const now = Date.now();
        await this.settingsModel.findOneAndUpdate({ userId }, {
            $setOnInsert: {
                id: (0, syncable_crud_service_1.newEntityId)(),
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
            },
        }, { upsert: true, setDefaultsOnInsert: true });
    }
    async createDefaultForUser(userId, profile) {
        return this.ensureForUser(userId, profile);
    }
    async get(userId) {
        const settings = await this.settingsModel.findOne({ userId }).lean();
        if (!settings) {
            throw new Error('Settings not found');
        }
        return settings;
    }
    async findByUserId(userId) {
        return this.settingsModel.findOne({ userId }).lean();
    }
    async update(userId, data) {
        const now = Date.now();
        const updated = await this.settingsModel
            .findOneAndUpdate({ userId }, {
            $set: { ...data, updatedAtMillis: now },
            $setOnInsert: {
                id: (0, syncable_crud_service_1.newEntityId)(),
                userId,
                createdAtMillis: now,
            },
        }, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true })
            .lean();
        return updated;
    }
    getModel() {
        return this.settingsModel;
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(entity_schemas_1.UserSettings.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], SettingsService);
//# sourceMappingURL=settings.service.js.map