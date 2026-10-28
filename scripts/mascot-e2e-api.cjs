/** Isolated local API with disposable MongoDB and a synthetic authenticated user.
 * No production data or production Mongo connection is used. Credentials stay in tmp.
 * Run after npm run build. Stop with Ctrl+C to destroy the database.
 */
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { JwtService } = require('@nestjs/jwt');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
(async () => {
  const mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri('anty_mascot_e2e');
  const db = await mongoose.createConnection(uri).asPromise();
  const restoreIndex = process.argv.indexOf('--restore-fixture');
  const recovered = restoreIndex < 0 ? null : mongoose.mongo.BSON.EJSON.parse(fs.readFileSync(process.argv[restoreIndex + 1], 'utf8'));
  if (recovered && recovered.user?.email !== 'mascot-e2e@example.invalid') throw new Error('Only synthetic fixtures may be restored');
  const id = recovered?.user?._id ?? new mongoose.Types.ObjectId();
  const email = 'mascot-e2e@example.invalid';
  const now = Date.now();
  await db.collection('users').insertOne(recovered?.user ?? { _id: id, email, name: 'Anty E2E', createdAtMillis: now, updatedAtMillis: now });
  const allowedCollections = new Set(['user_settings', 'wallets', 'categories', 'merchants', 'transactions', 'budgets', 'recurring_expenses', 'savings_plans', 'savings_movements', 'investments', 'investment_movements', 'debt_accounts', 'debt_movements', 'personal_loans', 'personal_loan_repayments', 'sync_metadata']);
  for (const entity of recovered?.entities ?? []) {
    if (!allowedCollections.has(entity.collection) || entity.documents.some(doc => doc.userId !== id.toHexString())) throw new Error('Invalid synthetic backup');
    if (entity.documents.length) await db.collection(entity.collection).insertMany(entity.documents);
  }
  const secret = crypto.randomBytes(48).toString('hex');
  const jwt = new JwtService({ secret });
  const token = jwt.sign({ sub: id.toHexString(), email, type: 'access' }, { expiresIn: process.env.MASCOT_E2E_ACCESS_EXPIRES ?? '15m' });
  const refreshToken = jwt.sign({ sub: id.toHexString(), email, type: 'refresh', jti: crypto.randomUUID() }, { expiresIn: '180d' });
  await db.collection('refresh_tokens').insertOne({ userId: id.toHexString(), tokenHash: crypto.createHash('sha256').update(refreshToken).digest('hex'), expiresAt: new Date(now + 180 * 86400000), revoked: false });
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'anty-mascot-e2e-'));
  fs.chmodSync(directory, 0o700);
  fs.writeFileSync(path.join(directory, 'fixture.json'), JSON.stringify({ userId: id.toHexString(), email, accessToken: token, refreshToken }), { mode: 0o600 });
  await db.close();
  const child = spawn(process.execPath, ['dist/src/main.js'], { cwd: path.join(__dirname, '..'), stdio: 'inherit', env: {
    ...process.env, NODE_ENV: 'development', PORT: '3100', MONGODB_URI: uri, JWT_SECRET: secret,
    GOOGLE_CLIENT_ID: 'mascot-e2e.apps.googleusercontent.com', DEV_UNLOCK_PREMIUM: 'true',
    RATE_LIMIT_MAX: '1000', ENABLE_SWAGGER: 'false', RTDN_ENABLED: 'false',
    GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: '', GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_BASE64: '',
  } });
  console.log(`Synthetic fixture (private file): ${path.join(directory, 'fixture.json')}`);
  console.log('Android: adb reverse tcp:3100 tcp:3100; use http://127.0.0.1:3100/');
  let shutdown;
  const stop = () => shutdown ??= (async () => {
    child.kill('SIGTERM');
    await mongo.stop();
    fs.rmSync(directory, { recursive: true, force: true });
  })();
  process.on('SIGINT', () => stop().then(() => process.exit(0)));
  process.on('SIGTERM', () => stop().then(() => process.exit(0)));
  child.on('exit', (code) => stop().then(() => process.exit(code ?? 1)));
})().catch(error => { console.error(error.message); process.exit(1); });
