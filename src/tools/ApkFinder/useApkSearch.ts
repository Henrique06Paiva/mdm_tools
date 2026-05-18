import { useState, useRef } from 'react';
import { api, CONFIG } from '../../api';

export function useApkSearch() {
  const [corpId, setCorpId] = useState('');
  const [packages, setPackages] = useState<string[]>(['com.br.octostore']);
  const [versions, setVersions] = useState<string[]>(['1.5.1']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<{ id: number, message: string, type: string, time: string }[]>([]);
  const [results, setResults] = useState<any[]>([]);
  
  const logIdRef = useRef(0);

  const addLog = (message: string, type: 'info' | 'warn' | 'err' | 'ok' = 'info') => {
    setLogs(prev => [{
      id: logIdRef.current++,
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
      const listData = await api.fetch(`${CONFIG.BASE_URL}/api-application/application?page=1&limit=500&corporationId=${cId}`);
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
        // Retiramos o filtro prévio de `v.name` porque o version real pode estar
        // escondido dentro de `applicationVersionApks` (ex: "Aplicativo Frentista")
        // que só vem na API de detalhes.
        return true;
      });

      if (matchingApps.length === 0) {
        addLog(`Nenhum aplicativo correspondente encontrado (filtro de package).`, 'warn');
        setIsProcessing(false);
        return;
      }

      addLog(`${matchingApps.length} aplicativo(s) possível(eis) encontrado(s). Buscando links...`, 'info');
      let foundApks = 0;
      const newResults: any[] = [];

      for (const app of matchingApps) {
        try {
          const detailData = await api.fetch(`${CONFIG.BASE_URL}/api-application/application/${app.id}`);
          const appVersions = detailData.applicationVersions || [];

          for (const v of appVersions) {
            const apks = v.applicationVersionApks || [];
            
            for (const apk of apks) {
              const apkVersion = apk.versionName;
              
              // Verifica se a versão desejada bate com apk.versionName OU com v.name
              if (targetVersions.includes(apkVersion) || targetVersions.includes(v.name)) {
                const matchedVer = targetVersions.includes(apkVersion) ? apkVersion : v.name;
                
                newResults.push({
                  id: app.id,
                  name: app.name,
                  packageName: app.packageName,
                  version: matchedVer,
                  fileSize: apk.fileSize || "-",
                  link: apk.apkPath
                });
                foundApks++;
              }
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

  return {
    corpId, setCorpId,
    packages, setPackages,
    versions, setVersions,
    isProcessing,
    logs, addLog,
    results,
    startSearch
  };
}
