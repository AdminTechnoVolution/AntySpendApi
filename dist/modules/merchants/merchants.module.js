"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const entity_schemas_1 = require("../../shared/database/entity.schemas");
const merchants_service_1 = require("./application/merchants.service");
const merchants_controller_1 = require("./presentation/merchants.controller");
let MerchantModule = class MerchantModule {
};
exports.MerchantModule = MerchantModule;
exports.MerchantModule = MerchantModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: entity_schemas_1.Merchant.name, schema: entity_schemas_1.MerchantSchema }]),
        ],
        controllers: [merchants_controller_1.MerchantController],
        providers: [merchants_service_1.MerchantService],
        exports: [merchants_service_1.MerchantService],
    })
], MerchantModule);
//# sourceMappingURL=merchants.module.js.map