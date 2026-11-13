import {readFile} from 'node:fs/promises';
import {getPool} from '../server/db.js';
const pool=getPool();try { await pool.query(await readFile(new URL('../db/001_initial.sql',import.meta.url),'utf8'));console.log('Esquema preparado.'); } finally { await pool.end(); }
