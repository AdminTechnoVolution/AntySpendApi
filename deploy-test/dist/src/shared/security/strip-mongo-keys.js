"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeDocumentForStorage = sanitizeDocumentForStorage;
exports.sanitizeRecordInPlace = sanitizeRecordInPlace;
exports.containsMongoOperatorKeys = containsMongoOperatorKeys;
function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function hasDangerousKey(key) {
    return key.startsWith('$') || key.includes('.');
}
function sanitizeValue(value) {
    if (Array.isArray(value)) {
        return value.map((item) => isPlainObject(item) ? sanitizeDocumentForStorage(item) : item);
    }
    if (isPlainObject(value)) {
        return sanitizeDocumentForStorage(value);
    }
    return value;
}
function sanitizeDocumentForStorage(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        if (hasDangerousKey(key)) {
            continue;
        }
        result[key] = sanitizeValue(value);
    }
    return result;
}
function sanitizeRecordInPlace(record) {
    for (const key of Object.keys(record)) {
        if (hasDangerousKey(key)) {
            delete record[key];
            continue;
        }
        const value = record[key];
        if (Array.isArray(value)) {
            for (const item of value) {
                if (isPlainObject(item)) {
                    sanitizeRecordInPlace(item);
                }
            }
        }
        else if (isPlainObject(value)) {
            sanitizeRecordInPlace(value);
        }
    }
}
function containsMongoOperatorKeys(value) {
    if (Array.isArray(value)) {
        return value.some(containsMongoOperatorKeys);
    }
    if (isPlainObject(value)) {
        for (const [key, nested] of Object.entries(value)) {
            if (hasDangerousKey(key) || containsMongoOperatorKeys(nested)) {
                return true;
            }
        }
    }
    return false;
}
