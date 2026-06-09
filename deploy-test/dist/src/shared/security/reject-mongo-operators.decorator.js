"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RejectMongoOperatorsConstraint = void 0;
exports.RejectMongoOperators = RejectMongoOperators;
const class_validator_1 = require("class-validator");
const strip_mongo_keys_1 = require("./strip-mongo-keys");
let RejectMongoOperatorsConstraint = class RejectMongoOperatorsConstraint {
    validate(value) {
        if (value === null || value === undefined) {
            return true;
        }
        return !(0, strip_mongo_keys_1.containsMongoOperatorKeys)(value);
    }
    defaultMessage(_args) {
        return 'must not contain MongoDB operator keys';
    }
};
exports.RejectMongoOperatorsConstraint = RejectMongoOperatorsConstraint;
exports.RejectMongoOperatorsConstraint = RejectMongoOperatorsConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'rejectMongoOperators', async: false })
], RejectMongoOperatorsConstraint);
function RejectMongoOperators(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: RejectMongoOperatorsConstraint,
        });
    };
}
