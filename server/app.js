import express from 'express';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseFilters,queries} from './queries.js';
export function createApp(getPool) {
 const app=express(); app.disable('x-powered-by');
 app.get('/api/health',async(req,res)=>{try{await getPool().query('SELECT 1');res.json({database:'connected'});}catch(e){res.status(503).json({database:'unavailable',code:e.code==='DB_NOT_CONFIGURED'?e.code:'DB_UNAVAILABLE',message:'La base de datos no está conectada. Configura la conexión del servidor.'});}});
 app.get('/api/dashboard',async(req,res)=>{
  let filters;try{filters=parseFilters(req.query);}catch(e){return res.status(400).json({message:e.message});}
  try{
   const pool=getPool();
   const state=await pool.query('SELECT last_row::text, completed, updated_at, aggregates_at, aggregates_rows::text, aggregates_complete FROM import_state WHERE id=1');
   const coverage=state.rows[0]??{last_row:'0',completed:false,aggregates_at:null};
   if(!coverage.aggregates_at) return res.json({status:'empty',coverage,filters,zones:[],series:[],days:[],kpis:null});
   const q=queries(filters);
   const result=await Promise.all(Object.values(q).map(x=>pool.query(x.text,x.values)));
   res.json({status:'ready',coverage,filters,kpis:result[0].rows[0],series:result[1].rows,zones:result[2].rows,days:result[3].rows});
  }catch(e){console.error('dashboard query failed',e.code??'UNKNOWN');res.status(503).json({message:e.code==='DB_NOT_CONFIGURED'?'Falta configurar PostgreSQL en el servidor.': 'No se pudieron consultar los datos. Comprueba la conexión y las migraciones.'});}
 });
 app.get('/api/zones',async(req,res)=>{try{res.json((await getPool().query('SELECT location_id AS id,zone AS label FROM taxi_zones ORDER BY zone')).rows);}catch{res.status(503).json({message:'Catálogo no disponible.'});}});
 app.use('/api',(_req,res)=>res.status(404).json({message:'Ruta no encontrada.'}));
 const dist=fileURLToPath(new URL('../dist/',import.meta.url));
 app.use(express.static(dist));app.get('/{*path}',(_req,res)=>res.sendFile(path.join(dist,'index.html')));
 return app;
}
