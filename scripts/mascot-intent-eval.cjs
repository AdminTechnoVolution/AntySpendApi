/** Measures how well the planner understands free-form requests.
 * Sends each phrase of scripts/mascot-intents.json (synthetic, no user data) to the real model
 * with the Android capability catalog and checks the first planning step.
 * Run after `npm run build`: node scripts/mascot-intent-eval.cjs [minimumAccuracy=0.95]
 */
const path = require('node:path');
const axios = require('axios');
const { HttpService } = require('@nestjs/axios');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
const configuration = require('../dist/src/shared/config/configuration').default;
const { OpenRouterClient } = require('../dist/src/shared/openrouter/openrouter.client');
const { MascotChatService } = require('../dist/src/modules/ai/application/mascot-chat.service');

(async () => {
  const config = configuration();
  const get = (key) => key.split('.').reduce((value, part) => value?.[part], config);
  const service = new MascotChatService(new OpenRouterClient(new HttpService(axios.create()), { get }));
  const context = require('./mascot-eval-context.json');
  const cases = require('./mascot-intents.json');
  const minimum = Number(process.argv[2] ?? 0.95);
  let passed = 0;
  for (const [index, expected] of cases.entries()) {
    let outcome;
    try {
      const result = await service.processTurnV2({ message: expected.message, conversationId: 'eval', turnId: `eval-${index}`, userLanguage: 'es', history: [], financialContext: context });
      const step = result.decision === 'QUERY' ? result.queries[0] : result.actions[0];
      const fields = Object.fromEntries((step?.fields ?? []).map((f) => [f.name, f.value]));
      const problems = [
        result.decision !== expected.decision && `decision ${result.decision}`,
        expected.entity && step?.entity !== expected.entity && `entity ${step?.entity}`,
        expected.operation && step?.operation !== expected.operation && `operation ${step?.operation}`,
        expected.amount && fields.amount !== expected.amount && `amount ${fields.amount}`,
        // Asking is correct; inventing the missing value is not.
        expected.missing && fields[expected.missing] !== undefined && `invented ${expected.missing} ${fields[expected.missing]}`,
      ].filter(Boolean);
      outcome = problems.length ? `FAIL ${problems.join(', ')} | reply: ${result.reply}` : 'ok';
    } catch (error) {
      outcome = `ERROR ${error.message}`;
    }
    if (outcome === 'ok') passed++;
    console.log(`${outcome === 'ok' ? '✓' : '✗'} ${expected.message}${outcome === 'ok' ? '' : `  → ${outcome}`}`);
  }
  const accuracy = passed / cases.length;
  console.log(`\n${passed}/${cases.length} (${(accuracy * 100).toFixed(1)}%) with model ${get('openRouter.assistantModel')}`);
  process.exit(accuracy >= minimum ? 0 : 1);
})().catch((error) => { console.error(error); process.exit(1); });
