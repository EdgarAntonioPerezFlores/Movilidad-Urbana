import React from 'react';
import {initialFilters} from '../lib/format';
export function Filters({filters,setFilters,zones}) {
 const change=event=>setFilters({...filters,[event.target.name]:event.target.value});
 return <section className="filters" aria-label="Filtros globales">
  <label>Desde<input name="start" type="date" min="2018-01-01" max="2018-04-30" value={filters.start} onChange={change}/></label>
  <label>Hasta<input name="end" type="date" min="2018-01-01" max="2018-04-30" value={filters.end} onChange={change}/></label>
  <label>Tipo de día<select name="day" value={filters.day} onChange={change}><option value="all">Todos los días</option><option value="weekday">Entre semana</option><option value="weekend">Fin de semana</option></select></label>
  <label>Zona de origen<select name="zone" value={filters.zone} onChange={change}><option value="">Todas las zonas</option>{zones.map(zone=><option key={zone.id} value={zone.id}>{zone.label}</option>)}</select></label>
  <label>Agrupar serie<select name="grain" value={filters.grain} onChange={change}><option value="month">Mes</option><option value="day">Día</option><option value="hour">Hora del día</option></select></label>
  <button className="reset" onClick={()=>setFilters({...initialFilters})}>Restablecer filtros</button>
 </section>;
}
