import { type RefObject, type ChangeEvent } from 'react';
import { Trash2 } from 'lucide-react';

interface ConfigPanelProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleFile: (e: ChangeEvent<HTMLInputElement>) => void;
  serials: string[];
}

export function ConfigPanel({
  fileInputRef,
  handleFile,
  serials
}: ConfigPanelProps) {
  return (
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
  );
}
