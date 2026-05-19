import { type RefObject, type ChangeEvent } from 'react';
import { Plus, X, Upload } from 'lucide-react';

interface ConfigPanelProps {
  packages: string[];
  setPackages: (packages: string[]) => void;
  addLog: (msg: string, type: 'info'|'warn'|'err'|'ok') => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleFile: (e: ChangeEvent<HTMLInputElement>) => void;
  serials: string[];
  columns: string[];
  selectedCol: number;
  applyColumn: (data: any[], colIdx: number) => void;
  rawData: any[];
}

export function ConfigPanel({
  packages,
  setPackages,
  addLog,
  fileInputRef,
  handleFile,
  serials,
  columns,
  selectedCol,
  applyColumn,
  rawData
}: ConfigPanelProps) {
  return (
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
  );
}
