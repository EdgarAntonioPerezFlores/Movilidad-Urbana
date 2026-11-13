export function numeric(value) {
 if(value==null||String(value).trim()==='') return null;
 const n=Number(value);return Number.isFinite(n)?n:null;
}
export function timestamp(value) {
 if(!value)return null;
 let s=String(value).trim();
 if(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(s))s=s.replace('T',' ');
 else {
  const m=s.match(/^(\d{4}) ([A-Za-z]{3}) (\d{2}) (\d{1,2}):(\d{2}):(\d{2}) (AM|PM)$/);
  if(m){const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];const month=months.indexOf(m[2])+1;let h=Number(m[4]);if(!month||h<1||h>12)return null;h=h%12+(m[7]==='PM'?12:0);s=`${m[1]}-${String(month).padStart(2,'0')}-${m[3]} ${String(h).padStart(2,'0')}:${m[5]}:${m[6]}`;}
 }
 if(!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/.test(s))return null;
 const d=new Date(s.replace(' ','T')+'Z');
 return !isNaN(d)&&d.toISOString().slice(0,19)===s.slice(0,19).replace(' ','T')?s:null;
}
export function normalize(row,index){
 const r=Object.fromEntries(Object.entries(row).map(([k,v])=>[k.toLowerCase(),v]));
 const integer=v=>{const n=numeric(v);return Number.isInteger(n)&&n>=-2147483648&&n<=2147483647?n:null;};
 return {source_row:index,pickup_at:timestamp(r.tpep_pickup_datetime),dropoff_at:timestamp(r.tpep_dropoff_datetime),pickup_zone:integer(r.pulocationid),dropoff_zone:integer(r.dolocationid),distance:numeric(r.trip_distance),fare:numeric(r.fare_amount),tip:numeric(r.tip_amount),payment_type:integer(r.payment_type)};
}
