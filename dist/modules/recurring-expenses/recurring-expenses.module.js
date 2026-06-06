"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecurringExpenseModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const entity_schemas_1 = require("../../shared/database/entity.schemas");
const recurringExpenses_service_1 = require("./application/recurringExpenses.service");
const recurringExpenses_controller_1 = require("./presentation/recurringExpenses.controller");
let RecurringExpenseModule = class RecurringExpenseModule {
};
exports.RecurringExpenseModule = RecurringExpenseModule;
exports.RecurringExpenseModule = RecurringExpenseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: entity_schemas_1.RecurringExpense.name, schema: entity_schemas_1.RecurringExpenseSchema }]),
        ],
        controllers: [recurringExpenses_controller_1.RecurringExpenseController],
        providers: [recurringExpenses_service_1.RecurringExpenseService],
        exports: [recurringExpenses_service_1.RecurringExpenseService],
    })
], RecurringExpenseModule);
//# sourceMappingURL=recurring-expenses.module.js.map