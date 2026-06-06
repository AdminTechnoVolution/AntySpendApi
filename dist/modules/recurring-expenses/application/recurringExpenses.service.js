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
exports.RecurringExpenseService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const create_entity_module_1 = require("../../../shared/crud/create-entity-module");
const entity_schemas_1 = require("../../../shared/database/entity.schemas");
let RecurringExpenseService = class RecurringExpenseService extends create_entity_module_1.BaseEntityService {
    constructor(model) {
        super(model, 'RecurringExpense');
    }
    async markPaid(userId, id) {
        const expense = await this.getModel().findOne({ userId, id });
        if (!expense || expense.deletedAtMillis) {
            throw new common_1.NotFoundException('Recurring expense not found');
        }
        const now = Date.now();
        let nextDue = expense.nextDueAtMillis;
        switch (expense.frequency) {
            case 'WEEKLY':
                nextDue += 7 * 24 * 60 * 60 * 1000;
                break;
            case 'BIWEEKLY':
                nextDue += 14 * 24 * 60 * 60 * 1000;
                break;
            case 'MONTHLY':
                nextDue = this.addMonths(nextDue, 1);
                break;
            case 'QUARTERLY':
                nextDue = this.addMonths(nextDue, 3);
                break;
            case 'YEARLY':
                nextDue = this.addMonths(nextDue, 12);
                break;
            default:
                nextDue = this.addMonths(nextDue, 1);
        }
        expense.nextDueAtMillis = nextDue;
        expense.updatedAtMillis = now;
        await expense.save();
        return expense.toObject();
    }
    addMonths(millis, months) {
        const date = new Date(millis);
        date.setMonth(date.getMonth() + months);
        return date.getTime();
    }
};
exports.RecurringExpenseService = RecurringExpenseService;
exports.RecurringExpenseService = RecurringExpenseService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(entity_schemas_1.RecurringExpense.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], RecurringExpenseService);
//# sourceMappingURL=recurringExpenses.service.js.map