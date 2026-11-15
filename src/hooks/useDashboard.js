import {useEffect,useState} from 'react';
export function useDashboard(filters,retry) {
 const [state,setState]=useState({data:null,loading:true,error:''});
 useEffect(()=>{
  const controller=new AbortController();
  setState({data:null,loading:true,error:''});
  async function load() {
   try {
    const response=await fetch(`/api/dashboard?${new URLSearchParams(filters)}`,{signal:controller.signal});
    const data=await response.json();
    if(!response.ok) throw new Error(data.message||'No se pudo consultar la API.');
    if(!controller.signal.aborted) setState({data,loading:false,error:''});
   } catch(error) {
    if(!controller.signal.aborted) setState({data:null,loading:false,error:error.message});
   }
  }
  load();return()=>controller.abort();
 },[filters,retry]);
 return state;
}
