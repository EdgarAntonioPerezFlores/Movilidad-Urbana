export const initialFilters = {start:'2018-01-01',end:'2018-04-30',day:'all',zone:'',grain:'month'};
export const number = (value,digits=0) => value == null ? '—' : new Intl.NumberFormat('es-MX',{maximumFractionDigits:digits}).format(value);
export const money = value => value == null ? '—' : new Intl.NumberFormat('es-MX',{style:'currency',currency:'USD',minimumFractionDigits:2}).format(value);
export function eligibleDays({start,end,day}) {
 let count=0;
 for(let d=new Date(start+'T00:00:00Z');d<=new Date(end+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+1)) {
  const weekend=[0,6].includes(d.getUTCDay());
  if(day==='all'||(day==='weekend')===weekend) count++;
 }
 return count;
}
