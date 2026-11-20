import React from 'react';
import {ResponsiveContainer,LineChart,Line,CartesianGrid,XAxis,YAxis,Tooltip,BarChart,Bar} from 'recharts';
import {number} from '../lib/format';
const labels={trips:'Viajes',duration:'Duración · min',distance:'Distancia · mi',tip:'Propina · USD',fare_per_mile:'Tarifa · USD/mi'};
export function Plot({rows=[],field='trips',bar=false}) {
 if(!rows.length||rows.every(row=>row[field]==null)) return <div className="empty">Sin datos válidos para esta selección</div>;
 const Chart=bar?BarChart:LineChart;
 return <>
  <div className="chart" style={field==='fare_per_mile'?{height:320}:undefined} role="img" aria-label={`${labels[field]}. Valores disponibles en la tabla desplegable.`}>
   <ResponsiveContainer width="100%" height="100%"><Chart data={rows} layout={bar?'vertical':'horizontal'} margin={{left:8,right:20,top:12,bottom:12}}>
    <CartesianGrid stroke="#34445B" strokeDasharray="3 5" horizontal={!bar} vertical={bar}/>
    {bar?<><XAxis type="number" stroke="#AAB8CC" tickFormatter={v=>number(v,1)}/><YAxis type="category" dataKey="label" width={field==='fare_per_mile'?125:100} stroke="#AAB8CC" tick={{fontSize:12}}/></>:<><XAxis dataKey="label" stroke="#AAB8CC" minTickGap={22} tick={{fontSize:12}}/><YAxis stroke="#AAB8CC" width={80} tick={{fontSize:12}} tickFormatter={v=>Math.abs(v)>=1000000?`${number(v/1000000,1)} M`:number(v)}/></>}
    <Tooltip cursor={bar?{fill:'#5AD1C4',fillOpacity:.07}:{stroke:'#AAB8CC'}} contentStyle={{background:'#172337',border:'1px solid #34445B',borderRadius:8,color:'#E6EDF5'}} formatter={v=>[number(v,field==='trips'?0:2),labels[field]]}/>
    {bar?<Bar dataKey={field} fill="#5AD1C4" maxBarSize={26} radius={[0,4,4,0]}/>:<Line type="linear" dataKey={field} stroke="#5AD1C4" strokeWidth={2} dot={rows.length<13} connectNulls={false}/>}
   </Chart></ResponsiveContainer>
  </div>
  {!bar&&<p className="caption">Eje vertical: viajes. M = millones; valores exactos en la tabla y al señalar cada punto.</p>}
  <details><summary>Ver valores del gráfico</summary><div className="table-scroll"><table><thead><tr><th>Categoría</th><th>{labels[field]}</th>{field==='fare_per_mile'&&<><th>N válido</th><th>Millas acumuladas</th></>}</tr></thead><tbody>{rows.map(row=><tr key={row.label}><td>{row.label}</td><td>{number(row[field],2)}</td>{field==='fare_per_mile'&&<><td>{number(row.fare_n)}</td><td>{number(row.fare_distance_sum,2)}</td></>}</tr>)}</tbody></table></div></details>
 </>;
}
export function ChartPanel({id,title,index,children,className=''}) {
 return <article id={id} className={`panel ${className}`}><div className="eyebrow">{index}</div><h2>{title}</h2>{children}</article>;
}
