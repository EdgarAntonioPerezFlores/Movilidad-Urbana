import {statfsSync} from 'node:fs';
import {getPool} from '../server/db.js';

const EXPECTED = 35991011;
const pool = getPool();
let client;
let locked = false;

try {
  const disk = statfsSync('/var/lib/postgresql/15/main');
  const free = Number(disk.bavail) * Number(disk.bsize);

  console.log('Espacio libre:', (free / 1024**3).toFixed(2), 'GiB');

  if (free < 8 * 1024**3) {
    throw new Error('Espacio insuficiente para actualizar estadísticas.');
  }

  client = await pool.connect();

  await client.query('SET statement_timeout = 0');

  locked = (await client.query(
    'SELECT pg_try_advisory_lock(20180430) AS ok'
  )).rows[0].ok;

  if (!locked) {
    throw new Error('Ya existe otra actualización activa.');
  }

  const state = await client.query(`
    SELECT
      count(*)::integer AS meses,
      coalesce(sum(last_row), 0)::bigint AS viajes
    FROM import_month_progress
    WHERE month BETWEEN 1 AND 4
      AND completed = true
  `);

  const meses = Number(state.rows[0].meses);
  const viajes = Number(state.rows[0].viajes);

  if (meses !== 4 || viajes !== EXPECTED) {
    throw new Error('Los cuatro meses no están completos.');
  }

  console.log('=== ACTUALIZANDO INDICADORES ===');
  console.log('Meses verificados:', meses);
  console.log('Viajes esperados:', viajes);

  await client.query('BEGIN');

  try {
    await client.query(
      'REFRESH MATERIALIZED VIEW hourly_metrics'
    );

    await client.query(`
      INSERT INTO import_state (
        id, source_revision, last_row, completed,
        aggregates_at, aggregates_rows, aggregates_complete
      )
      VALUES (
        1, 'nyc-tlc-parquet-2018-enero-abril',
        $1, false, now(), $1, true
      )
      ON CONFLICT (id) DO UPDATE SET
        source_revision = EXCLUDED.source_revision,
        last_row = EXCLUDED.last_row,
        completed = false,
        aggregates_at = EXCLUDED.aggregates_at,
        aggregates_rows = EXCLUDED.aggregates_rows,
        aggregates_complete = true,
        updated_at = now()
    `, [viajes]);

    await client.query('COMMIT');
    console.log('Indicadores publicados correctamente.');

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }

  const result = await client.query(`
    SELECT
      ispopulated
    FROM pg_matviews
    WHERE matviewname = 'hourly_metrics'
  `);

  console.table(result.rows);

} catch (error) {
  console.error('ERROR:', error.message);
  process.exitCode = 1;
} finally {
  if (client) {
    if (locked) {
      await client.query(
        'SELECT pg_advisory_unlock(20180430)'
      ).catch(() => {});
    }
    client.release();
  }
  await pool.end();
}
