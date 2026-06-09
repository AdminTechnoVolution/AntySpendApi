"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const openrouter_module_1 = require("../../shared/openrouter/openrouter.module");
const entity_schemas_1 = require("../../shared/database/entity.schemas");
const ai_service_1 = require("./application/ai.service");
const ai_controller_1 = require("./presentation/ai.controller");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            openrouter_module_1.OpenRouterModule,
            mongoose_1.MongooseModule.forFeature([
                { name: entity_schemas_1.Currency.name, schema: entity_schemas_1.CurrencySchema },
                { name: entity_schemas_1.Category.name, schema: entity_schemas_1.CategorySchema },
                { name: entity_schemas_1.UserSettings.name, schema: entity_schemas_1.UserSettingsSchema },
                { name: entity_schemas_1.Transaction.name, schema: entity_schemas_1.TransactionSchema },
                { name: entity_schemas_1.RecurringExpense.name, schema: entity_schemas_1.RecurringExpenseSchema },
            ]),
        ],
        controllers: [ai_controller_1.AiController],
        providers: [ai_service_1.AiService],
    })
], AiModule);
