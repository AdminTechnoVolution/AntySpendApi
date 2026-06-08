#!/usr/bin/env node
'use strict';

const { readFileSync } = require('fs');
const { resolve } = require('path');

const inputPath = process.argv[2];
if (!inputPath) {
  console.error(
    'Usage: npm run billing:encode-sa -- /path/to/play-service-account.json',
  );
  process.exit(1);
}

let raw;
try {
  raw = readFileSync(resolve(inputPath), 'utf8');
} catch (error) {
  console.error(`Failed to read file: ${inputPath}`);
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

let parsed;
try {
  parsed = JSON.parse(raw);
} catch {
  console.error('File is not valid JSON.');
  process.exit(1);
}

if (
  parsed?.type !== 'service_account' ||
  typeof parsed.client_email !== 'string' ||
  typeof parsed.private_key !== 'string'
) {
  console.error(
    'JSON must be a Google service account with type, client_email, and private_key.',
  );
  process.exit(1);
}

process.stdout.write(Buffer.from(raw, 'utf8').toString('base64'));
