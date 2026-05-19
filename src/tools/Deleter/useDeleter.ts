import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { api, CONFIG } from '../../api';

export function useDeleter() {
  const [serials, setSerials] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<{ id: number, message: string, type: string, time: string }[]>([]);
  
  const [stats, setStats] = useState({ total: 0, done: 0, fail: 0, skip: 0, retries: 0 });
  const [tableRows, setTableRows] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logIdRef = useRef(0);

  const addLog = (message: string, type: 'info' | 'warn' | 'err' | 'ok' = 'info') => {
    setLogs(prev => [{
      id: logIdRef.current++,
      message,
      type,
      time: new Date().toLocaleTimeString()
    }, ...prev]);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result;
      if (data) {
        const wb = XLSX.read(data, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        const parsedSerials = json.slice(1)
          .map((row: any) => String(row[0]).trim())
          .filter(serial => serial && serial !== 'undefined');

        setSerials(parsedSerials);
        setStats(s => ({ ...s, total: parsedSerials.length }));
        addLog(`${parsedSerials.length} seriais carregados para deleção.`, 'ok');
      }
    };
    reader.readAsBinaryString(file);
  };

  const startProcess = async () => {
    if (!api.hasToken()) {
      addLog('Autenticação necessária antes de prosseguir.', 'err');
      return;
    }

    setIsProcessing(true);
    setStats(s => ({ ...s, done: 0, fail: 0, skip: 0, retries: 0 }));
    setTableRows([]);
    addLog(`Iniciando processo de deleção para ${serials.length} seriais.`, 'info');

    let done = 0;
    let fail = 0;
    let skip = 0;
    const concurrency = 5;
    
    const processBatch = async (batch: string[]) => {
      const promises = batch.map(async (serial) => {
        let statusBadge = 'badge-err';
        let detailText = 'Erro desconhecido';
        let eqId = 'N/A';

        try {
          const search = await api.fetch(`${CONFIG.BASE_URL}/api-eqp/equipment?key=${encodeURIComponent(serial)}`);
          
          const eq = search.items?.find((item: any) => 
            String(item.serial) === serial || 
            String(item.serialNumber) === serial || 
            String(item.imei) === serial
          );

          if (!eq) {
            statusBadge = 'badge-warn';
            detailText = 'N/E';
            skip++;
          } else {
            eqId = eq.id;
            
            // Inactivate if active
            if (eq.status === 1) {
              const { id, companyId, subsidiaryId, equipmentTypeId, corporationId, name } = eq;
              await api.fetch(`${CONFIG.BASE_URL}/api-eqp/equipment/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 0, companyId, subsidiaryId, equipmentTypeId, corporationId, name })
              });
            }
            
            // Delete
            const delRes = await api.fetch(`${CONFIG.BASE_URL}/api-eqp/equipment/${eq.id}`, { method: 'DELETE' });
            if (delRes && delRes.ok !== false) {
              statusBadge = 'badge-done';
              detailText = 'Deletado com sucesso';
              done++;
            } else {
              throw new Error('Falha na resposta de deleção');
            }
          }
        } catch (error: any) {
          statusBadge = 'badge-err';
          detailText = `Erro: ${error.message}`;
          fail++;
        }

        const row = { serial, eqId, statusBadge, detailText };
        setTableRows(prev => [...prev, row]);
        setStats(s => ({ ...s, done, fail, skip }));
      });

      await Promise.all(promises);
    };

    for (let i = 0; i < serials.length; i += concurrency) {
      const batch = serials.slice(i, i + concurrency);
      await processBatch(batch);
    }

    setIsProcessing(false);
    addLog('Processo de deleção em massa finalizado.', 'ok');
  };

  return {
    serials,
    isProcessing,
    logs,
    stats,
    tableRows,
    fileInputRef,
    handleFile,
    startProcess
  };
}
