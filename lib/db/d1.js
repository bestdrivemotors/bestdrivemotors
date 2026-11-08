export class D1Error extends Error {
  constructor(message, { status, code, cause } = {}) {
    super(message, { cause });
    this.name = 'D1Error';
    this.status = status;
    this.code = code;
  }
}

function getD1Config() {
  return {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    databaseId: process.env.CLOUDFLARE_D1_DATABASE_ID,
    apiToken: process.env.CLOUDFLARE_D1_API_TOKEN,
  };
}

export function isD1Configured() {
  return Object.values(getD1Config()).every(Boolean);
}

export async function d1Execute(sql, params = []) {
  const { accountId, databaseId, apiToken } = getD1Config();
  if (!accountId || !databaseId || !apiToken) {
    throw new D1Error('Cloudflare D1 is not configured.', { code: 'D1_NOT_CONFIGURED' });
  }

  let response;
  try {
    response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql, params }),
      },
    );
  } catch (cause) {
    throw new D1Error('Cloudflare D1 request failed.', { cause });
  }

  let payload;
  try {
    payload = await response.json();
  } catch (cause) {
    throw new D1Error('Cloudflare D1 returned an invalid response.', {
      status: response.status,
      cause,
    });
  }

  if (!response.ok || payload.success === false) {
    const message = payload.errors?.[0]?.message || response.statusText || 'Query failed';
    throw new D1Error(`Cloudflare D1 query failed: ${message}`, { status: response.status });
  }

  const result = payload.result?.[0] ?? {};
  return {
    rows: result.results ?? [],
    numAffectedRows: result.meta?.changes,
    insertId: result.meta?.last_row_id,
  };
}

export async function d1Query(sql, params = []) {
  const result = await d1Execute(sql, params);
  return result.rows;
}

export async function d1Batch(statements) {
  const results = [];
  for (const { sql, params = [] } of statements) {
    results.push(await d1Query(sql, params));
  }
  return results;
}