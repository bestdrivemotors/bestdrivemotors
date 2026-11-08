import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import nextEnv from '@next/env';
import { d1Batch, isD1Configured } from './d1.js';

const { loadEnvConfig } = nextEnv;

export async function migrate() {
  if (!isD1Configured()) loadEnvConfig(process.cwd());
  if (!isD1Configured()) {
    throw new Error('Cloudflare D1 is not configured. Set all CLOUDFLARE_D1_* variables.');
  }

  const schema = await readFile(new URL('./schema.sql', import.meta.url), 'utf8');
  const statements = schema.split(';').map((sql) => sql.trim()).filter(Boolean);
  await d1Batch(statements.map((sql) => ({ sql })));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  migrate()
    .then(() => process.stdout.write('Cloudflare D1 schema applied.\n'))
    .catch((error) => {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 1;
    });
}