"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdempotencyKey = void 0;
const common_1 = require("@nestjs/common");
exports.IdempotencyKey = (0, common_1.createParamDecorator)((_data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['idempotency-key'];
});
