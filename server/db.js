import pg from 'pg';
let pool;
export function getPool() {
  if (!process.env.DATABASE_URL) { const e = new Error('Configura DATABASE_URL en el servidor.'); e.code='DB_NOT_CONFIGURED'; throw e; }
  return pool ??= new pg.Pool({connectionString:process.env.DATABASE_URL,max:5,connectionTimeoutMillis:10000,statement_timeout:30000});
}
