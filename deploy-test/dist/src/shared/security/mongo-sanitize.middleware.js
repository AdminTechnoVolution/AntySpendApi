"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoSanitizeMiddleware = mongoSanitizeMiddleware;
const strip_mongo_keys_1 = require("./strip-mongo-keys");
function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function mongoSanitizeMiddleware(req, _res, next) {
    if (isPlainObject(req.body)) {
        req.body = (0, strip_mongo_keys_1.sanitizeDocumentForStorage)(req.body);
    }
    next();
}
