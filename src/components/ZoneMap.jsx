import React,{useEffect,useState} from 'react';
import {MapContainer,GeoJSON,useMap} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {number} from '../lib/format';
const colors=['#204454','#2B706F','#399B94','#5AD1C4'];
function ResetView(){const map=useMap();return <button className="map-reset" onClick={()=>map.fitBounds([[40.49,-74.27],[40.93,-73.68]])}>Ver todas las zonas</button>;}
export function ZoneMap({rows=[],selected,onSelect,ready}) {
 const [geometry,setGeometry]=useState(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 useEffect(()=>{const controller=new AbortController();fetch('/data/taxi-zones.geojson',{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error('No se pudo cargar la geometría.');return r.json();}).then(setGeometry).catch(e=>{if(e.name!=='AbortError')setError(e.message);});return()=>controller.abort();},[retry]);
 if(error)return <p role="alert">{error} <button onClick={()=>{setError('');setRetry(retry+1);}}>Reintentar mapa</button></p>;
 if(!geometry)return <div className="empty">Cargando zonas…</div>;
 const byId=new Map(rows.map(row=>[Number(row.id),row.trips]));
 const ids=new Set(geometry.features.map(f=>Number(f.properties.LocationID)));
 const unmapped=rows.reduce((n,row)=>n+(ids.has(Number(row.id))?0:row.trips),0);
 const max=Math.max(1,...rows.filter(row=>ids.has(Number(row.id))).map(row=>row.trips));
 const color=value=>value==null?'#435064':value===0?'#132432':colors[Math.min(3,Math.ceil(value/max*4)-1)];
 return <>
  <div className="zone-map" aria-label="Mapa de recogidas por zona. También se puede seleccionar una zona con el filtro superior.">
   <MapContainer bounds={[[40.49,-74.27],[40.93,-73.68]]} scrollWheelZoom={false} style={{height:'100%',width:'100%'}} attributionControl={true}>
    <GeoJSON key={JSON.stringify([rows,selected,ready])} data={geometry} attribution="Zonas: NYC TLC" style={feature=>({fillColor:color(ready?byId.get(Number(feature.properties.LocationID)):null),fillOpacity:.9,color:String(feature.properties.LocationID)===selected?'#F2B544':'#AAB8CC',weight:String(feature.properties.LocationID)===selected?3:.6})} onEachFeature={(feature,layer)=>{
     const id=Number(feature.properties.LocationID),value=byId.get(id);
     const tip=document.createElement('span');tip.textContent=`${feature.properties.zone}: ${ready&&value!=null?number(value)+' viajes':'sin registros disponibles'}`;
     layer.bindTooltip(tip);layer.on('click',()=>onSelect(String(id)));
    }}/><ResetView/>
   </MapContainer>
  </div>
  <div className="map-legend">{colors.map((color,i)=><span key={color}><i style={{background:color}}/>{number(max*i/4)}–{number(max*(i+1)/4)}</span>)}<span><i style={{background:'#435064'}}/>Sin registros disponibles</span><span><i style={{background:'#132432'}}/>0 viajes</span></div>
  <p className="caption">Conteos por zona, no densidad por superficie. Escala relativa a los filtros. Sin geometría: {ready?number(unmapped):'—'} viajes. Selecciona una zona en el mapa o en el filtro superior.</p>
 </>;
}
