"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseEntityIdPipe = void 0;
const common_1 = require("@nestjs/common");
const ENTITY_ID_PATTERN = /^[a-f0-9]{32}$/;
let ParseEntityIdPipe = class ParseEntityIdPipe {
    transform(value) {
        if (typeof value !== 'string' || !ENTITY_ID_PATTERN.test(value)) {
            throw new common_1.BadRequestException('Invalid entity id');
        }
        return value;
    }
};
exports.ParseEntityIdPipe = ParseEntityIdPipe;
exports.ParseEntityIdPipe = ParseEntityIdPipe = __decorate([
    (0, common_1.Injectable)()
], ParseEntityIdPipe);
