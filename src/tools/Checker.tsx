import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { api } from '../api';
import { Download, Play, Upload, Plus, X } from 'lucide-react';

export default function Checker() {
  const [packages, setPackages] = useState<string[]>(['com.mdmservice']);
  const [rawData, setRawData] = useState<any[]>([]);
  const [serials, setSerials] = useState<string[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedCol, setSelectedCol] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<{ id: number, message: string, type: string, time: string }[]>([]);
  
  const [stats, setStats] = useState({ total: 0, done: 0, fail: 0 });
  const [results, setResults] = useState<any[]>([]);
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
        const json = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        
        if (json.length < 2) {
          addLog('Planilha vazia ou sem dados.', 'err');
          return;
        }

        const headers = (json[0] as any[]).map(String);
        setRawData(json);
        setColumns(headers);
        applyColumn(json, 0);
      }
    };
    reader.readAsBinaryString(file);
  };

  const applyColumn = (data: any[], colIdx: number) => {
    const parsedSerials = data.slice(1)
      .map(row => String(row[colIdx] ?? '').trim())
      .filter(Boolean);
    
    setSerials(parsedSerials);
    setStats(s => ({ ...s, total: parsedSerials.length }));
    setSelectedCol(colIdx);
    addLog(`${parsedSerials.length} seriais encontrados na coluna selecionada.`, 'ok');
  };

  const startProcess = async () => {
    if (!api.hasToken()) {
      addLog('Autenticação necessária antes de prosseguir.', 'err');
      return;
    }
    
    const validPackages = packages.filter(p => p.trim() !== '');
    if (validPackages.length === 0) {
      addLog('Defina pelo menos um Package Name.', 'err');
      return;
    }

    setIsProcessing(true);
    setStats({ total: serials.length, done: 0, fail: 0 });
    setResults([]);
    setTableRows([]);
    addLog(`Iniciando consulta para ${serials.length} seriais.`, 'info');

    let done = 0;
    let fail = 0;
    const concurrency = 5;
    
    const processBatch = async (batch: string[]) => {
      const promises = batch.map(async (serial) => {
        let status = 'error';
        let eqName = 'N/A';
        let online = 'N/A';
        let eqId = null;
        let versionStr = 'N/E';
        
        try {
          // 1. Get Equipment Info
          const searchData = await api.fetch(`${import.meta.env.VITE_API_BASE_URL}/api-eqp/equipment?page=1&limit=10&key=${encodeURIComponent(serial)}`);
          const items = searchData.data ?? searchData.items ?? (Array.isArray(searchData) ? searchData : []);
          
          let eq = null;
          const serialFields = ["serialNumber", "serial", "serialnumber", "imei"];
          for (const item of items) {
            if (serialFields.some(field => String(item[field] || "").trim() === serial)) {
              eq = item;
              break;
            }
          }
          if (!eq && items.length === 1) eq = items[0];

          if (eq) {
            eqId = eq.id;
            eqName = eq.name || 'N/A';
            status = eq.status === 1 ? 'ok' : 'err';
            
            const isPowerOn = eq.powerOn === true;
            const lastUpdate = eq.lastUpdate ? new Date(eq.lastUpdate) : new Date(0);
            const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
            
            if (!isPowerOn) {
              online = "err";
            } else if (lastUpdate < tenMinsAgo) {
              online = "err";
            } else {
              online = "ok";
            }

            // 2. Get App Versions
            const foundVersions: Record<string, string> = {};
            for (const boSystem of [false, true]) {
              let page = 1;
              while (true) {
                const appsData = await api.fetch(`${import.meta.env.VITE_API_BASE_URL}/api-eqp/equipment-application-historic/${eqId}?page=${page}&limit=50&boSystem=${boSystem}`);
                const appItems = appsData?.data ?? appsData?.items ?? (Array.isArray(appsData) ? appsData : []);
                
                appItems.forEach((item: any) => {
                  if (validPackages.includes(item.packageName)) {
                    foundVersions[item.packageName] = item.version || "S/V";
                  }
                });
                
                if (validPackages.every(pkg => foundVersions[pkg])) break;
                
                const total = typeof appsData?.total === 'number' ? appsData.total : 0;
                if (!appItems.length || page * 50 >= total) break;
                page++;
              }
              if (validPackages.every(pkg => foundVersions[pkg])) break;
            }

            let allFound = true;
            const eqVersions = validPackages.map(pkg => {
              const v = foundVersions[pkg];
              if (!v) allFound = false;
              return v || 'Erro';
            });
            versionStr = eqVersions.join(' | ');
            
            if (allFound) {
              done++;
            } else {
              fail++;
            }
          } else {
            fail++;
            versionStr = 'Serial N/E';
          }
        } catch (error: any) {
          fail++;
          versionStr = 'Falha API';
        }

        const row = {
          serial, eqName, versionStr, 
          statusBadge: status === 'ok' ? 'badge-done' : 'badge-err',
          statusText: status === 'ok' ? 'Ativo' : 'Inativo',
          onlineBadge: online === 'ok' ? 'badge-done' : 'badge-err',
          onlineText: online === 'ok' ? 'Online' : 'Offline'
        };

        setTableRows(prev => [...prev, row]);
        
        const resultObj: any = {
          "Serial Number": serial,
          "Nome do Equipamento": eqName,
          "Status": row.statusText,
          "Conexão": row.onlineText,
        };
        const vSplit = versionStr.split(' | ');
        validPackages.forEach((pkg, idx) => {
          resultObj[pkg] = vSplit[idx] || versionStr;
        });
        
        setResults(prev => [...prev, resultObj]);
        setStats(s => ({ ...s, done, fail }));
      });

      await Promise.all(promises);
    };

    for (let i = 0; i < serials.length; i += concurrency) {
      const batch = serials.slice(i, i + concurrency);
      await processBatch(batch);
    }

    setIsProcessing(false);
    addLog('Consulta finalizada com sucesso.', 'ok');
  };

  const exportExcel = () => {
    if (results.length === 0) return;
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(results);
    XLSX.utils.book_append_sheet(wb, ws, 'Versões');
    XLSX.writeFile(wb, `MDM_Versoes_${new Date().getTime()}.xlsx`);
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
        <div className="panel-head"><span className="panel-title">Configurações e Fonte de Dados</span></div>
        <div className="panel-body">
          <div className="form-group">
            <label>Package Names dos Apps</label>
            <div className="pkg-container">
              {packages.map((pkg, idx) => (
                <div className="pkg-row" style={{ display: 'flex', gap: '8px', marginBottom: '8px' }} key={idx}>
                  <input 
                    type="text" 
                    value={pkg}
                    onChange={(e) => {
                      const newPkgs = [...packages];
                      newPkgs[idx] = e.target.value;
                      setPackages(newPkgs);
                    }}
                    placeholder="Ex: com.mdmservice" 
                  />
                  <button className="btn-remove" onClick={() => {
                    if (packages.length > 1) {
                      setPackages(packages.filter((_, i) => i !== idx));
                    } else {
                      addLog('É necessário pelo menos um package name.', 'warn');
                    }
                  }}><X size={14} /></button>
                </div>
              ))}
            </div>
            <button className="btn btn-add" style={{ marginTop: '8px', fontSize: '12px', padding: '6px 12px' }} onClick={() => setPackages([...packages, ''])}>
              <Plus size={14} /> Adicionar Pacote
            </button>
          </div>
          
          <div className="dropzone" onClick={() => fileInputRef.current?.click()} style={{ border: '1px dashed var(--border)', background: 'var(--bg2)', padding: '32px 24px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', marginTop: '16px', transition: 'background 0.2s' }}>
            <Upload size={24} style={{ color: 'var(--text3)', marginBottom: '12px' }} />
            <input type="file" ref={fileInputRef} hidden onChange={handleFile} accept=".xlsx,.xls,.csv" />
            <p style={{ fontWeight: 500, fontSize: '13px', color: 'var(--text)' }}>Selecione a planilha de seriais</p>
            <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>Formatos: .xlsx, .csv</div>
            {serials.length > 0 && <div style={{ marginTop: '16px', color: 'var(--text)', fontWeight: 500, fontSize: '12px', background: 'var(--bg)', display: 'inline-block', padding: '4px 12px', borderRadius: '4px', border: '1px solid var(--border)' }}>{serials.length} seriais prontos.</div>}
          </div>

          {columns.length > 0 && (
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label>Selecione a coluna dos Seriais:</label>
              <select value={selectedCol} onChange={(e) => applyColumn(rawData, parseInt(e.target.value))}>
                {columns.map((col, idx) => (
                  <option key={idx} value={idx}>{col || `Coluna ${idx + 1}`}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">Progresso da Consulta</span>
          <div style={{ display: 'flex', gap: '12px' }}>
            {results.length > 0 && (
              <button className="btn" onClick={exportExcel}>
                <Download size={16} /> Baixar Relatório
              </button>
            )}
            <button className="btn btn-brand" onClick={startProcess} disabled={isProcessing || serials.length === 0 || !api.hasToken()}>
              <Play size={16} /> Iniciar Consulta
            </button>
          </div>
        </div>
        <div className="panel-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ padding: '24px', background: 'var(--bg)', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{stats.total}</div>
              <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>Total Seriais</div>
            </div>
            <div style={{ padding: '24px', background: 'var(--bg)', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>{stats.done}</div>
              <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>Sucesso</div>
            </div>
            <div style={{ padding: '24px', background: 'var(--bg)', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>{stats.fail}</div>
              <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>Erros / N.E.</div>
            </div>
            <div style={{ padding: '24px', background: 'var(--bg)', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>
                {stats.total > 0 ? Math.round(((stats.done + stats.fail) / stats.total) * 100) : 0}%
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>Concluído</div>
            </div>
          </div>

          <div style={{ height: '6px', background: 'var(--bg)', borderRadius: '99px', overflow: 'hidden', marginBottom: '24px', border: '1px solid var(--border)' }}>
            <div style={{ height: '100%', background: 'var(--brand)', width: `${stats.total > 0 ? ((stats.done + stats.fail) / stats.total) * 100 : 0}%`, transition: 'width 0.3s' }}></div>
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--bg)' }}>
            <table>
              <thead>
                <tr>
                  <th>Serial Number</th>
                  <th>Nome do Eqp.</th>
                  <th>Versões</th>
                  <th>Status</th>
                  <th>Conexão</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.serial}</td>
                    <td>{row.eqName}</td>
                    <td>{row.versionStr}</td>
                    <td><span className={`badge ${row.statusBadge}`}>{row.statusText}</span></td>
                    <td><span className={`badge ${row.onlineBadge}`}>{row.onlineText}</span></td>
                  </tr>
                ))}
                {tableRows.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text3)' }}>Nenhum dado processado ainda.</td>
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
