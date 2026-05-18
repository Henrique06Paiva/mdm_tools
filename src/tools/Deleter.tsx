import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { api } from '../api';
import { Play, Trash2 } from 'lucide-react';

export default function Deleter() {
  const [serials, setSerials] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<{ id: number, message: string, type: string, time: string }[]>([]);
  
  const [stats, setStats] = useState({ total: 0, done: 0, fail: 0, skip: 0, retries: 0 });
  const [tableRows, setTableRows] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  let logId = 0;

  const addLog = (message: string, type: 'info' | 'warn' | 'err' | 'ok' = 'info') => {
    setLogs(prev => [{
      id: logId++,
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
          const search = await api.fetch(`${import.meta.env.VITE_API_BASE_URL}/api-eqp/equipment?key=${encodeURIComponent(serial)}`);
          
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
              await api.fetch(`${import.meta.env.VITE_API_BASE_URL}/api-eqp/equipment/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 0, companyId, subsidiaryId, equipmentTypeId, corporationId, name })
              });
            }
            
            // Delete
            const delRes = await api.fetch(`${import.meta.env.VITE_API_BASE_URL}/api-eqp/equipment/${eq.id}`, { method: 'DELETE' });
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

  const getColorClass = (type: string) => {
    if (type === 'err') return 'var(--red)';
    if (type === 'ok') return 'var(--green)';
    if (type === 'warn') return 'var(--amber)';
    return 'var(--text2)';
  };

  return (
    <>
      <div className="panel">
        <div className="panel-head"><span className="panel-title">Fonte de Dados</span></div>
        <div className="panel-body">
          <div className="dropzone" onClick={() => fileInputRef.current?.click()} style={{ border: '2px dashed var(--border2)', padding: '2rem', textAlign: 'center', borderRadius: '8px', cursor: 'pointer' }}>
            <Trash2 size={32} style={{ color: 'var(--brand)', marginBottom: '8px' }} />
            <input type="file" ref={fileInputRef} hidden onChange={handleFile} accept=".xlsx,.xls,.csv" />
            <p style={{ fontWeight: 500 }}>Clique para selecionar a planilha de seriais a serem deletados</p>
            <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Formatos suportados: .xlsx, .csv</div>
            {serials.length > 0 && <div style={{ marginTop: '12px', color: 'var(--brand)', fontWeight: 600 }}>{serials.length} seriais carregados.</div>}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">Progresso da Deleção</span>
          <button className="btn btn-brand" onClick={startProcess} disabled={isProcessing || serials.length === 0 || !api.hasToken()}>
            <Play size={16} /> Iniciar Processo
          </button>
        </div>
        <div className="panel-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
            <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.total}</div>
              <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Total</div>
            </div>
            <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--green)' }}>{stats.done}</div>
              <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Sucesso</div>
            </div>
            <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--red)' }}>{stats.fail}</div>
              <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Falhas</div>
            </div>
            <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.skip}</div>
              <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>N/E</div>
            </div>
            <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.retries}</div>
              <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Retries</div>
            </div>
          </div>

          <div style={{ height: '6px', background: 'var(--bg)', borderRadius: '99px', overflow: 'hidden', marginBottom: '24px', border: '1px solid var(--border)' }}>
            <div style={{ height: '100%', background: 'var(--brand)', width: `${stats.total > 0 ? ((stats.done + stats.fail + stats.skip) / stats.total) * 100 : 0}%`, transition: 'width 0.3s' }}></div>
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--bg)' }}>
            <table>
              <thead>
                <tr>
                  <th>Serial</th>
                  <th>ID do Eqp.</th>
                  <th>Status</th>
                  <th>Detalhe</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.serial}</td>
                    <td>{row.eqId}</td>
                    <td><span className={`badge ${row.statusBadge}`}>{row.statusBadge === 'badge-done' ? 'OK' : row.statusBadge === 'badge-warn' ? 'N/E' : 'Erro'}</span></td>
                    <td>{row.detailText}</td>
                  </tr>
                ))}
                {tableRows.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text3)' }}>Nenhum dado processado ainda.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><span className="panel-title">Log de Eventos do Sistema</span></div>
        <div className="panel-body" style={{ padding: '16px' }}>
          <div style={{ maxHeight: '200px', overflowY: 'auto', background: 'var(--bg)', padding: '16px', fontSize: '12px', fontFamily: 'var(--font-mono)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            {logs.map(log => (
              <div key={log.id} style={{ color: getColorClass(log.type), marginBottom: '6px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                [{log.time}] {log.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
