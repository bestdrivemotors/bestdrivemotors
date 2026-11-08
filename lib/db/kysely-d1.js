import { SqliteAdapter, SqliteIntrospector, SqliteQueryCompiler } from 'kysely';
import { d1Execute } from './d1.js';

class D1HttpConnection {
  async executeQuery(compiledQuery) {
    const result = await d1Execute(compiledQuery.sql, compiledQuery.parameters);
    return {
      rows: result.rows,
      ...(result.numAffectedRows == null ? {} : { numAffectedRows: BigInt(result.numAffectedRows) }),
      ...(result.insertId == null ? {} : { insertId: BigInt(result.insertId) }),
    };
  }

  async *streamQuery() {
    throw new Error('D1 HTTP does not support streaming queries.');
  }
}

class D1HttpDriver {
  #connection = new D1HttpConnection();

  async init() {}
  async acquireConnection() { return this.#connection; }
  async releaseConnection() {}
  async destroy() {}
  async beginTransaction() { throw new Error('D1 HTTP does not support interactive transactions.'); }
  async commitTransaction() { throw new Error('D1 HTTP does not support interactive transactions.'); }
  async rollbackTransaction() { throw new Error('D1 HTTP does not support interactive transactions.'); }
}

export class D1HttpDialect {
  createDriver() { return new D1HttpDriver(); }
  createQueryCompiler() { return new SqliteQueryCompiler(); }
  createAdapter() { return new SqliteAdapter(); }
  createIntrospector(db) { return new SqliteIntrospector(db); }
}