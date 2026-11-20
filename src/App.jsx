import React,{useEffect,useState} from 'react';
import {Filters} from './components/Filters';
import {KpiCards} from './components/KpiCards';
import {ChartPanel,Plot} from './components/ChartPanel';
import {ZoneMap} from './components/ZoneMap';
import {Coverage} from './components/Coverage';
import {useDashboard} from './hooks/useDashboard';
import {initialFilters,number,money} from './lib/format';
export default function App(){
 const [filters,setFilters]=useState({...initialFilters}),[retry,setRetry]=useState(0),[zones,setZones]=useState([]),[zoneError,setZoneError]=useState('');
 const {data,loading,error}=useDashboard(filters,retry);
 useEffect(()=>{const controller=new AbortController();setZoneError('');fetch('/data/zones.json',{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error('Catálogo de zonas no disponible.');return r.json();}).then(setZones).catch(e=>{if(e.name!=='AbortError')setZoneError(e.message);});return()=>controller.abort();},[retry]);
 const selectZone=id=>setFilters(current=>({...current,zone:id}));
 const period=`${filters.start} a ${filters.end}`;
 return <div className="with-index"><aside className="section-index"><nav aria-label="Índice del dashboard"><strong>Movilidad urbana</strong>{[
    ['inicio','Resumen general'],['tiempo','Evolución de los viajes'],['mapa','Mapa de recogidas'],['comparacion','Comparaciones'],['detalle','Datos por zona'],['contexto','Cobertura y fuente']
  ].map(([id,label]) => <a key={id} href={'#'+id} onClick={() => {if(id==='detalle') document.getElementById(id).open=true;}}>{label}</a>)}</nav></aside><div className="shell"><main id="inicio">
  <header><div><div className="eyebrow">CHICKEN BROTHERS / PROYECTO 04</div><h1>Movilidad urbana<span>.</span></h1><p>Dashboard táctico · Analistas y planificadores de movilidad</p></div><div className="dataset">NYC · YELLOW TAXI<strong>2018</strong><span>Enero–abril</span></div></header>
  <Filters filters={filters} setFilters={setFilters} zones={zones}/>
  <div aria-live="polite" className={`status ${error?'error':''}`}>{loading?'Consultando indicadores…':error?<>{error} <button onClick={()=>setRetry(retry+1)}>Reintentar</button></>:data?.status==='empty'?'Conexión disponible · Sin agregados publicados.':data?.kpis?.trips===0?'Sin viajes para los filtros seleccionados.':'Indicadores disponibles · Enero–abril de 2018.'}</div>
  {zoneError&&<p role="alert">{zoneError} <button onClick={()=>setRetry(retry+1)}>Reintentar</button></p>}
  {filters.zone&&<p className="selection">Zona seleccionada: {zones.find(z=>String(z.id)===filters.zone)?.label??`Zona ${filters.zone}`} <button onClick={()=>selectZone('')}>Quitar selección</button></p>}
  {filters.day!=='all'&&<p className="caption">Las comparaciones muestran solo el tipo de día seleccionado. Elige «Todos los días» para comparar ambas categorías.</p>}
  <KpiCards kpis={data?.kpis} period={period}/>
  <section className="dashboard-grid" aria-label="Visualizaciones">
   <ChartPanel id="tiempo" title="Evolución de los viajes" index="01 / PATRONES TEMPORALES" className="span-8"><Plot rows={data?.series}/><p className="caption">{filters.grain==='hour'?'Suma por hora local de NYC (00–23) dentro del periodo.':'Viajes por intervalo temporal.'}</p></ChartPanel>
   <ChartPanel id="mapa" title="Recogidas por zona de origen" index="02 / DISTRIBUCIÓN ESPACIAL" className="span-4"><ZoneMap rows={data?.map} ready={data?.status==='ready'} selected={filters.zone} onSelect={selectZone}/></ChartPanel>
   <ChartPanel id="comparacion" title="Duración media por tipo de día" index="03 / TIEMPO DE VIAJE" className="span-4"><Plot rows={data?.days} field="duration" bar/><p className="caption">Minutos · Solo duraciones positivas</p></ChartPanel>
   <ChartPanel title="Distancia media por tipo de día" index="04 / RECORRIDOS" className="span-4"><Plot rows={data?.days} field="distance" bar/><p className="caption">Millas · Solo distancias positivas</p></ChartPanel>
   <ChartPanel title="Tarifa por milla por zona" index="05 / COSTO UNITARIO" className="span-4"><Plot rows={data?.fares} field="fare_per_mile" bar/><p className="caption">7 zonas con mayor tarifa/milla. Consulta N y millas acumuladas en la tabla; pocos viajes pueden producir valores inestables.</p></ChartPanel>
   <ChartPanel title="Propina registrada por tipo de día" index="06 / PROPINA REGISTRADA" className="span-6"><Plot rows={data?.days} field="tip" bar/><p className="caption">USD · Tarjeta · Incluye ceros válidos</p></ChartPanel>
   <ChartPanel id="contexto" title="Cobertura y lectura" index="07 / CONTEXTO" className="span-6 coverage"><Coverage data={data} filters={filters}/></ChartPanel>
  </section>
  <details id="detalle" className="panel table-panel"><summary>Detalle adicional · 7 zonas con más viajes</summary><div className="table-scroll"><table><thead><tr><th>Zona</th><th>Viajes</th><th>Duración · min</th><th>Distancia · mi</th><th>Tarifa · USD/mi</th><th>Propina · USD</th></tr></thead><tbody>{data?.zones?.map(z=><tr key={z.id??'unknown'}><td>{z.label}</td><td>{number(z.trips)}</td><td>{number(z.duration,2)}</td><td>{number(z.distance,2)}</td><td>{money(z.fare_per_mile)}</td><td>{money(z.tip)}</td></tr>)}</tbody></table></div></details>
  <footer><p>Chicken Brothers · Edgar Antonio Perez Flores · Julio Cesar Paredes Arceo</p><a href="https://github.com/EdgarAntonioPerezFlores/Movilidad-Urbana">Código y documentación ↗</a></footer>
 </main></div></div>;
}
