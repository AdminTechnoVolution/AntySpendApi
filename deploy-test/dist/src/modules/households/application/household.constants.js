"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HOUSEHOLD_SHAREABLE_ENTITY_TYPES = exports.MEMBER_CONTRIBUTION_ENTITY_TYPES = exports.OWNER_ONLY_SHARED_ENTITY_TYPES = exports.INVITE_EXPIRY_MS = exports.MAX_HOUSEHOLD_MEMBERS = void 0;
exports.MAX_HOUSEHOLD_MEMBERS = 5;
exports.INVITE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;
exports.OWNER_ONLY_SHARED_ENTITY_TYPES = new Set([
    'wallets',
    'categories',
    'budgets',
    'savings_plans',
    'investments',
]);
exports.MEMBER_CONTRIBUTION_ENTITY_TYPES = new Set([
    'transactions',
    'savings_movements',
    'investment_movements',
]);
exports.HOUSEHOLD_SHAREABLE_ENTITY_TYPES = new Set([
    ...exports.OWNER_ONLY_SHARED_ENTITY_TYPES,
    ...exports.MEMBER_CONTRIBUTION_ENTITY_TYPES,
]);
