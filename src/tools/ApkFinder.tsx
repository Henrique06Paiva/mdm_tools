import { useState } from 'react';
import * as XLSX from 'xlsx';
import { api } from '../api';
import { Download, Search, Plus, X } from 'lucide-react';

export default function ApkFinder() {
  const [corpId, setCorpId] = useState('');
  const [packages, setPackages] = useState<string[]>(['com.br.octostore']);
  const [versions, setVersions] = useState<string[]>(['1.5.1']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<{ id: number, message: string, type: string, time: string }[]>([]);
  const [results, setResults] = useState<any[]>([]);

  let logId = 0;

  const addLog = (message: string, type: 'info' | 'warn' | 'err' | 'ok' = 'info') => {
    setLogs(prev => [{
      id: logId++,
      message,
      type,
      time: new Date().toLocaleTimeString()
    }, ...prev]);
  };

  const startSearch = async () => {
    if (!api.hasToken()) {
      addLog('Autenticação necessária antes de prosseguir.', 'err');
      return;
    }

    const cId = corpId.trim();
    const targetPackages = packages.filter(p => p.trim() !== '');
    const targetVersions = versions.filter(v => v.trim() !== '');

    if (!cId || targetVersions.length === 0) {
      alert("Por favor, preencha o ID da Corporação e pelo menos uma Versão Procurada.");
      return;
    }

    setIsProcessing(true);
    setResults([]);
    addLog(`Buscando aplicativos para a corporação ID ${cId}...`, 'info');

    try {
      const listData = await api.fetch(`${import.meta.env.VITE_API_BASE_URL}/api-application/application?page=1&limit=500&corporationId=${cId}`);
      const apps = listData?.data ?? listData?.items ?? (Array.isArray(listData) ? listData : []);

      if (apps.length === 0) {
        addLog('Nenhum aplicativo encontrado.', 'warn');
        setIsProcessing(false);
        return;
      }

      const matchingApps = apps.filter((app: any) => {
        if (targetPackages.length > 0 && !targetPackages.includes(app.packageName)) {
          return false;
        }
        const appVersions = app.applicationVersions || [];
        return appVersions.some((v: any) => targetVersions.includes(v.name));
      });

      if (matchingApps.length === 0) {
        addLog(`Nenhuma versão correspondente encontrada nos aplicativos filtrados.`, 'warn');
        setIsProcessing(false);
        return;
      }

      addLog(`${matchingApps.length} aplicativo(s) possível(eis) encontrado(s). Buscando links...`, 'info');
      let foundApks = 0;
      const newResults: any[] = [];

      for (const app of matchingApps) {
        try {
          const detailData = await api.fetch(`${import.meta.env.VITE_API_BASE_URL}/api-application/application/${app.id}`);
          const appVersions = detailData.applicationVersions || [];

          for (const targetVer of targetVersions) {
            const targetVerData = appVersions.find((v: any) => v.name === targetVer);
            
            if (targetVerData?.applicationVersionApks?.length > 0) {
              targetVerData.applicationVersionApks.forEach((apk: any) => {
                newResults.push({
                  id: app.id,
                  name: app.name,
                  packageName: app.packageName,
                  version: targetVerData.name,
                  fileSize: apk.fileSize || "-",
                  link: apk.apkPath
                });
                foundApks++;
              });
            }
          }
        } catch (e: any) {
          addLog(`Erro ao buscar detalhes do app ${app.id}: ${e.message}`, 'err');
        }
      }

      setResults(newResults);
      if (foundApks === 0) {
        addLog('Nenhum link de APK encontrado nos detalhes.', 'err');
      } else {
        addLog(`Busca concluída. ${foundApks} link(s) encontrado(s).`, 'ok');
      }
    } catch (error: any) {
      addLog(`Erro na busca: ${error.message}`, 'err');
    }

    setIsProcessing(false);
  };

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

  const getColorClass = (type: string) => {
    if (type === 'err') return 'var(--red)';
    if (type === 'ok') return 'var(--green)';
    if (type === 'warn') return 'var(--amber)';
    return 'var(--text2)';
  };

  return (
    <>
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

      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">Resultados da Busca</span>
        </div>
        <div className="panel-body">
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--bg)' }}>
            <table>
              <thead>
                <tr>
                  <th>ID App</th>
                  <th>Nome do App</th>
                  <th>Package Name</th>
                  <th>Versão</th>
                  <th>Link de Download</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, idx) => (
                  <tr key={idx}>
                    <td>{r.id}</td>
                    <td>{r.name}</td>
                    <td>{r.packageName}</td>
                    <td><span className="badge badge-done">{r.version}</span></td>
                    <td><a href={r.link} target="_blank" rel="noreferrer" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>🔗 Baixar APK</a></td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text3)' }}>Nenhum resultado ainda. Preencha os dados e clique em Buscar.</td>
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
