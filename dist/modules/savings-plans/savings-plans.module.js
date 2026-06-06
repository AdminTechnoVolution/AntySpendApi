"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavingsPlanModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const entity_schemas_1 = require("../../shared/database/entity.schemas");
const savingsPlans_service_1 = require("./application/savingsPlans.service");
const savingsPlans_controller_1 = require("./presentation/savingsPlans.controller");
let SavingsPlanModule = class SavingsPlanModule {
};
exports.SavingsPlanModule = SavingsPlanModule;
exports.SavingsPlanModule = SavingsPlanModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: entity_schemas_1.SavingsPlan.name, schema: entity_schemas_1.SavingsPlanSchema }]),
        ],
        controllers: [savingsPlans_controller_1.SavingsPlanController],
        providers: [savingsPlans_service_1.SavingsPlanService],
        exports: [savingsPlans_service_1.SavingsPlanService],
    })
], SavingsPlanModule);
//# sourceMappingURL=savings-plans.module.js.map