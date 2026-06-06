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
exports.LwwService = void 0;
exports.decideLww = decideLww;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const sync_metadata_schema_1 = require("./sync-metadata.schema");
function decideLww(clientChange, serverUpdatedAtMillis, serverDeviceId) {
    if (serverUpdatedAtMillis === undefined) {
        return { outcome: 'accept' };
    }
    if (clientChange.updatedAtMillis > serverUpdatedAtMillis) {
        return { outcome: 'accept' };
    }
    if (clientChange.updatedAtMillis < serverUpdatedAtMillis) {
        return { outcome: 'reject', reason: 'SERVER_NEWER' };
    }
    const clientDevice = clientChange.deviceId ?? '';
    const serverDevice = serverDeviceId ?? '';
    if (clientDevice === serverDevice) {
        return { outcome: 'noop', reason: 'ALREADY_APPLIED' };
    }
    if (clientDevice > serverDevice) {
        return { outcome: 'accept' };
    }
    return { outcome: 'reject', reason: 'SERVER_WINS_TIE' };
}
let LwwService = class LwwService {
    syncMetadataModel;
    constructor(syncMetadataModel) {
        this.syncMetadataModel = syncMetadataModel;
    }
    decide(clientChange, serverUpdatedAtMillis, serverDeviceId) {
        return decideLww(clientChange, serverUpdatedAtMillis, serverDeviceId);
    }
    async bumpServerVersion(userId) {
        const now = Date.now();
        const updated = await this.syncMetadataModel.findOneAndUpdate({ userId }, {
            $set: { lastUpdatedAtMillis: now },
            $inc: { serverVersion: 1 },
        }, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true });
        return String(updated.serverVersion);
    }
    async getServerVersion(userId) {
        const doc = await this.syncMetadataModel.findOne({ userId }).lean();
        return String(doc?.serverVersion ?? 0);
    }
};
exports.LwwService = LwwService;
exports.LwwService = LwwService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(sync_metadata_schema_1.SyncMetadata.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], LwwService);
//# sourceMappingURL=lww.service.js.map