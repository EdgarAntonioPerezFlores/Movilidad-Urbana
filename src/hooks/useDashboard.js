import {useEffect, useState} from 'react';

export function useDashboard(filters, retry) {
  const [state, setState] = useState({data: null, loading: true, error: ''});
  const [worker, setWorker] = useState(null);

  useEffect(() => {
    const instance = new Worker(new URL('../lib/dashboard.worker.js', import.meta.url), {type: 'module'});
    setWorker(instance);
    return () => instance.terminate();
  }, [retry]);

  useEffect(() => {
    if (!worker) return;
    const id = crypto.randomUUID();
    setState({data: null, loading: true, error: ''});
    const receive = ({data: response}) => {
      if (response.id === id) setState({data: response.result, loading: false, error: response.error || ''});
    };
    const fail = () => setState({data: null, loading: false, error: 'No se pudieron calcular los indicadores.'});
    worker.addEventListener('message', receive);
    worker.addEventListener('error', fail);
    worker.postMessage({id, filters});
    return () => {
      worker.removeEventListener('message', receive);
      worker.removeEventListener('error', fail);
    };
  }, [worker, filters]);
  return state;
}
