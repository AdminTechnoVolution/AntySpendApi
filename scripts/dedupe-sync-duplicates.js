"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const mongoose_1 = __importDefault(require("mongoose"));
const COLLECTIONS = [
    'user_settings',
    'wallets',
    'categories',
    'merchants',
    'transactions',
    'budgets',
    'recurring_expenses',
    'savings_plans',
    'savings_movements',
    'investments',
    'investment_movements',
];
function loadMongoUri() {
    const fromEnv = process.env.MONGODB_URI?.trim();
    if (fromEnv)
        return fromEnv;
    const envPath = (0, path_1.resolve)(__dirname, '../.env');
    const content = (0, fs_1.readFileSync)(envPath, 'utf8');
    for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed.startsWith('MONGODB_URI=')) {
            return trimmed.slice('MONGODB_URI='.length).trim();
        }
    }
    throw new Error('MONGODB_URI not found in environment or .env');
}
function str(doc, key) {
    const value = doc[key];
    return value == null ? '' : String(value);
}
function num(doc, key) {
    const value = doc[key];
    return value == null ? '' : String(value);
}
function fingerprint(collection, doc) {
    switch (collection) {
        case 'user_settings':
            return 'settings:singleton';
        case 'categories': {
            const key = str(doc, 'key');
            return key
                ? `categories:key:${key}`
                : `categories:custom:${str(doc, 'customName')}:${str(doc, 'type')}`;
        }
        case 'wallets':
            return `wallets:${str(doc, 'name')}:${str(doc, 'currencyCode')}`;
        case 'merchants':
            return `merchants:${str(doc, 'normalizedName') || str(doc, 'name')}`;
        case 'transactions':
            return [
                num(doc, 'occurredAtMillis'),
                num(doc, 'primaryAmountMinor'),
                str(doc, 'title'),
                str(doc, 'walletId'),
                str(doc, 'type'),
            ].join('|');
        case 'budgets':
            return [
                str(doc, 'name'),
                num(doc, 'periodStart'),
                str(doc, 'categoryId'),
                str(doc, 'walletId'),
            ].join('|');
        case 'recurring_expenses':
            return [
                str(doc, 'title'),
                num(doc, 'amountMinor'),
                str(doc, 'frequency'),
                str(doc, 'currencyCode'),
                num(doc, 'dueDayOfMonth'),
            ].join('|');
        case 'savings_plans':
            return `savings_plans:${str(doc, 'name')}:${str(doc, 'currencyCode')}`;
        case 'savings_movements':
            return [
                str(doc, 'savingsPlanId'),
                str(doc, 'type'),
                num(doc, 'originalAmountMinor'),
                num(doc, 'date'),
            ].join('|');
        case 'investments':
            return `investments:${str(doc, 'name')}:${str(doc, 'institution')}`;
        case 'investment_movements':
            return [
                str(doc, 'investmentId'),
                str(doc, 'type'),
                num(doc, 'amountMinor'),
                num(doc, 'date'),
            ].join('|');
        default:
            return `${collection}:id:${doc.id}`;
    }
}
function pickWinner(group) {
    return group.reduce((best, current) => current.updatedAtMillis > best.updatedAtMillis ? current : best);
}
function buildDedupePlan(docs, collection) {
    const groups = new Map();
    for (const doc of docs) {
        const fp = fingerprint(collection, doc);
        groups.set(fp, [...(groups.get(fp) ?? []), doc]);
    }
    const idMap = new Map();
    const deleteIds = [];
    let duplicateGroups = 0;
    for (const group of groups.values()) {
        if (group.length <= 1)
            continue;
        duplicateGroups += 1;
        const winner = pickWinner(group);
        for (const doc of group) {
            if (doc.id !== winner.id) {
                idMap.set(doc.id, winner.id);
                deleteIds.push(doc._id);
            }
        }
    }
    return { idMap, deleteIds, duplicateGroups };
}
function resolveId(id, idMap) {
    if (!id)
        return id;
    let current = id;
    const seen = new Set();
    while (idMap.has(current) && !seen.has(current)) {
        seen.add(current);
        current = idMap.get(current);
    }
    return current;
}
const FK_FIELDS = {
    user_settings: ['defaultWalletId'],
    transactions: ['categoryId', 'walletId', 'merchantId'],
    budgets: ['categoryId', 'walletId'],
    recurring_expenses: ['categoryId', 'walletId', 'merchantId'],
    savings_movements: ['savingsPlanId', 'walletId'],
    investment_movements: ['investmentId', 'walletId'],
    savings_plans: ['walletId'],
    investments: ['defaultWalletId'],
};
async function main() {
    const args = process.argv.slice(2);
    const apply = args.includes('--apply');
    const dryRun = !apply || args.includes('--dry-run');
    const emailArg = args.find((arg) => arg.startsWith('--email='))?.split('=')[1];
    const uri = loadMongoUri();
    await mongoose_1.default.connect(uri);
    const db = mongoose_1.default.connection.db;
    if (!db)
        throw new Error('Mongo connection failed');
    let userIds = [];
    if (emailArg) {
        const user = await db.collection('users').findOne({ email: emailArg });
        if (!user)
            throw new Error(`No user found for email ${emailArg}`);
        userIds = [String(user._id)];
    }
    else {
        const ids = await db.collection('wallets').distinct('userId');
        userIds = ids.map(String);
    }
    console.log(`Mode: ${dryRun ? 'DRY RUN' : 'APPLY'}`);
    console.log(`Users to process: ${userIds.length}`);
    let totalDeleted = 0;
    for (const userId of userIds) {
        const globalIdMap = new Map();
        const deletesByCollection = new Map();
        const summary = {};
        for (const collection of COLLECTIONS) {
            const docs = (await db
                .collection(collection)
                .find({ userId })
                .toArray());
            const plan = buildDedupePlan(docs, collection);
            summary[collection] = {
                before: docs.length,
                delete: plan.deleteIds.length,
                groups: plan.duplicateGroups,
            };
            for (const [from, to] of plan.idMap) {
                globalIdMap.set(from, to);
            }
            if (plan.deleteIds.length > 0) {
                deletesByCollection.set(collection, plan.deleteIds);
            }
        }
        const fkUpdates = [];
        for (const collection of COLLECTIONS) {
            const fields = FK_FIELDS[collection] ?? [];
            if (fields.length === 0)
                continue;
            const docs = (await db.collection(collection).find({ userId }).toArray());
            for (const doc of docs) {
                const set = {};
                for (const field of fields) {
                    const raw = doc[field];
                    if (typeof raw !== 'string' || !raw)
                        continue;
                    const resolved = resolveId(raw, globalIdMap);
                    if (resolved && resolved !== raw) {
                        set[field] = resolved;
                    }
                }
                if (Object.keys(set).length > 0) {
                    fkUpdates.push({ collection, id: doc.id, set });
                }
            }
        }
        const userDeleted = [...deletesByCollection.values()].reduce((sum, ids) => sum + ids.length, 0);
        totalDeleted += userDeleted;
        console.log(`\nuserId=${userId}`);
        for (const [collection, stats] of Object.entries(summary)) {
            if (stats.delete > 0 || stats.before > 0) {
                console.log(`  ${collection}: ${stats.before} docs, ${stats.delete} to delete (${stats.groups} duplicate groups)`);
            }
        }
        console.log(`  FK updates: ${fkUpdates.length}`);
        if (!dryRun && (userDeleted > 0 || fkUpdates.length > 0)) {
            for (const update of fkUpdates) {
                await db.collection(update.collection).updateOne({ userId, id: update.id }, { $set: update.set });
            }
            for (const [collection, deleteIds] of deletesByCollection) {
                await db.collection(collection).deleteMany({ _id: { $in: deleteIds } });
            }
            await db.collection('sync_metadata').updateOne({ userId }, {
                $inc: { serverVersion: 1 },
                $set: { lastUpdatedAtMillis: Date.now() },
            }, { upsert: true });
            console.log('  Applied dedupe + bumped sync_metadata.serverVersion');
        }
    }
    console.log(`\nTotal documents marked for deletion: ${totalDeleted}`);
    await mongoose_1.default.disconnect();
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
