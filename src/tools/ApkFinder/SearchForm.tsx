import * as XLSX from 'xlsx';
import { Download, Search, Plus, X } from 'lucide-react';
import { api } from '../../api';

interface SearchFormProps {
  corpId: string;
  setCorpId: (id: string) => void;
  packages: string[];
  setPackages: (pkgs: string[]) => void;
  versions: string[];
  setVersions: (vers: string[]) => void;
  isProcessing: boolean;
  startSearch: () => void;
  results: any[];
  addLog: (message: string, type?: 'info' | 'warn' | 'err' | 'ok') => void;
}

export function SearchForm({
  corpId,
  setCorpId,
  packages,
  setPackages,
  versions,
  setVersions,
  isProcessing,
  startSearch,
  results,
  addLog
}: SearchFormProps) {

  const exportExcel = () => {
    if (results.length === 0) return;
    const exportData = results.map(r => ({
      "ID do App": r.id,
      "Nome do App": r.name,
      "Package Name": r.packageName,
      "Versão": r.version,
      "Tamanho (Bytes)": r.fileSize,
      "Link de Download": r.link
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, 'APKs Encontrados');
    XLSX.writeFile(wb, `MDM_APKs_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="panel">
      <div className="panel-head"><span className="panel-title">Parâmetros de Busca</span></div>
      <div className="panel-body">
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
            <label>ID da Corporação *</label>
            <input type="number" value={corpId} onChange={e => setCorpId(e.target.value)} placeholder="Ex: 10" required />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
            <label>Package Names dos Apps (Opcional)</label>
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
                    placeholder="Ex: com.br.octostore" 
                  />
                  <button className="btn-remove" onClick={() => setPackages(packages.filter((_, i) => i !== idx))}><X size={14} /></button>
                </div>
              ))}
            </div>
            <button className="btn btn-add" style={{ marginTop: '8px', fontSize: '12px', padding: '6px 12px' }} onClick={() => setPackages([...packages, ''])}>
              <Plus size={14} /> Adicionar Pacote
            </button>
          </div>
          
          <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
            <label>Versões Procuradas *</label>
            <div className="pkg-container">
              {versions.map((ver, idx) => (
                <div className="pkg-row" style={{ display: 'flex', gap: '8px', marginBottom: '8px' }} key={idx}>
                  <input 
                    type="text" 
                    value={ver}
                    onChange={(e) => {
                      const newVers = [...versions];
                      newVers[idx] = e.target.value;
                      setVersions(newVers);
                    }}
                    placeholder="Ex: 1.5.1" 
                  />
                  <button className="btn-remove" onClick={() => {
                    if (versions.length > 1) {
                      setVersions(versions.filter((_, i) => i !== idx));
                    } else {
                      addLog('É necessário pelo menos uma versão procurada.', 'warn');
                    }
                  }}><X size={14} /></button>
                </div>
              ))}
            </div>
            <button className="btn btn-add" style={{ marginTop: '8px', fontSize: '12px', padding: '6px 12px' }} onClick={() => setVersions([...versions, ''])}>
              <Plus size={14} /> Adicionar Versão
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
          {results.length > 0 && (
            <button className="btn" onClick={exportExcel}>
              <Download size={16} /> Baixar Planilha
            </button>
          )}
          <button className="btn btn-brand" onClick={startSearch} disabled={isProcessing || !api.hasToken() || !corpId.trim()}>
            <Search size={16} /> Buscar APK
          </button>
        </div>
      </div>
    </div>
  );
}
