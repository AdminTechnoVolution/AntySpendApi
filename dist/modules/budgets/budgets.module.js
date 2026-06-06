"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const entity_schemas_1 = require("../../shared/database/entity.schemas");
const budgets_service_1 = require("./application/budgets.service");
const budgets_controller_1 = require("./presentation/budgets.controller");
let BudgetModule = class BudgetModule {
};
exports.BudgetModule = BudgetModule;
exports.BudgetModule = BudgetModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: entity_schemas_1.Budget.name, schema: entity_schemas_1.BudgetSchema }]),
        ],
        controllers: [budgets_controller_1.BudgetController],
        providers: [budgets_service_1.BudgetService],
        exports: [budgets_service_1.BudgetService],
    })
], BudgetModule);
//# sourceMappingURL=budgets.module.js.map