import { useState, useRef, useCallback, useEffect } from "react";
import { api, CONFIG } from "../../api";

export function useApkSearch() {
  const [corpId, setCorpId] = useState("");
  const [packages, setPackages] = useState<string[]>([]);
  const [versions, setVersions] = useState<string[]>([]);
  const [availableApps, setAvailableApps] = useState<any[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);

  useEffect(() => {
    setPackages([]);
    const cId = corpId.trim();
    if (!cId) {
      setAvailableApps([]);
      return;
    }

    if (!api.hasToken()) {
      return;
    }

    setIsLoadingApps(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const listData: any = await api.fetch(
          `${CONFIG.BASE_URL}/api-application/application?page=1&limit=500&corporationId=${cId}`,
        );
        const apps =
          listData?.data ??
          listData?.items ??
          (Array.isArray(listData) ? listData : []);
        setAvailableApps(apps);
      } catch (error) {
        console.error("Erro ao carregar aplicativos:", error);
        setAvailableApps([]);
      } finally {
        setIsLoadingApps(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [corpId]);

  const [availableVersions, setAvailableVersions] = useState<string[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);

  useEffect(() => {
    const selectedApps = availableApps.filter((app) =>
      packages.includes(app.packageName),
    );

    if (selectedApps.length === 0) {
      setAvailableVersions([]);
      setVersions([]);
      return;
    }

    if (!api.hasToken()) {
      return;
    }

    setIsLoadingVersions(true);
    const fetchVersions = async () => {
      try {
        const versionsSet = new Set<string>();
        await Promise.all(
          selectedApps.map(async (app) => {
            try {
              const detailData: any = await api.fetch(
                `${CONFIG.BASE_URL}/api-application/application/${app.id}`,
              );
              const appVersions = detailData.applicationVersions || [];
              for (const v of appVersions) {
                if (v.name) {
                  versionsSet.add(v.name);
                }
                const apks = v.applicationVersionApks || [];
                for (const apk of apks) {
                  if (apk.versionName) {
                    versionsSet.add(apk.versionName);
                  }
                }
              }
            } catch (e) {
              console.error(`Erro ao carregar versões do app ${app.name}:`, e);
            }
          }),
        );
        const sortedVersions = Array.from(versionsSet).sort();
        setAvailableVersions(sortedVersions);
        setVersions((prev) => prev.filter((v) => sortedVersions.includes(v)));
      } catch (error) {
        console.error("Erro ao carregar versões:", error);
        setAvailableVersions([]);
      } finally {
        setIsLoadingVersions(false);
      }
    };

    fetchVersions();
  }, [packages, availableApps]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const currentIndexRef = useRef(0);
  const matchingAppsRef = useRef<any[]>([]);
  const targetVersionsRef = useRef<string[]>([]);
  const targetPackagesRef = useRef<string[]>([]);
  const [logs, setLogs] = useState<
    { id: number; message: string; type: string; time: string }[]
  >([]);
  const [results, setResults] = useState<any[]>([]);

  const logIdRef = useRef(0);

  const addLog = useCallback(
    (message: string, type: "info" | "warn" | "err" | "ok" = "info") => {
      setLogs((prev) => [
        {
          id: logIdRef.current++,
          message,
          type,
          time: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    },
    [],
  );

  const runLoop = async () => {
    const apps = matchingAppsRef.current;
    const targetVersions = targetVersionsRef.current;

    while (currentIndexRef.current < apps.length) {
      if (isPausedRef.current) {
        break;
      }

      const app = apps[currentIndexRef.current];
      addLog(`Buscando detalhes do app ${app.name || app.packageName} (${currentIndexRef.current + 1}/${apps.length})...`, "info");

      try {
        const detailData: any = await api.fetch(
          `${CONFIG.BASE_URL}/api-application/application/${app.id}`,
        );
        const appVersions = detailData.applicationVersions || [];
        const appResults: any[] = [];

        for (const v of appVersions) {
          const apks = v.applicationVersionApks || [];

          for (const apk of apks) {
            const apkVersion = apk.versionName;

            // Verifica se a versão desejada bate com apk.versionName OU com v.name, ou se não foi especificada nenhuma versão
            const isVersionMatched =
              targetVersions.length === 0 ||
              targetVersions.includes(apkVersion) ||
              targetVersions.includes(v.name);

            if (isVersionMatched) {
              const matchedVer = targetVersions.length > 0
                ? (targetVersions.includes(apkVersion) ? apkVersion : v.name)
                : (apkVersion || v.name || "-");

              appResults.push({
                id: app.id,
                name: app.name,
                packageName: app.packageName,
                version: matchedVer,
                fileSize: apk.fileSize || "-",
                link: apk.apkPath,
              });
            }
          }
        }

        if (appResults.length > 0) {
          setResults((prev) => {
            // Evitar duplicados se já estiver nos resultados
            const filtered = appResults.filter(
              (r) => !prev.some((p) => p.link === r.link && p.version === r.version)
            );
            if (filtered.length > 0) {
              addLog(`Encontrado(s) ${filtered.length} APK(s) para o app ${app.name || app.packageName}.`, "ok");
              return [...prev, ...filtered];
            }
            return prev;
          });
        }
      } catch (e: any) {
        addLog(
          `Erro ao buscar detalhes do app ${app.name || app.id}: ${e.message}`,
          "err",
        );
      }

      currentIndexRef.current++;
    }

    if (currentIndexRef.current >= apps.length) {
      setIsProcessing(false);
      setIsPaused(false);
      addLog("Busca de APKs finalizada.", "ok");
    }
  };

  const startSearch = useCallback(async () => {
    if (!api.hasToken()) {
      addLog("Autenticação necessária antes de prosseguir.", "err");
      return;
    }

    const cId = corpId.trim();
    const targetPackages = packages.filter((p) => p.trim() !== "");
    const targetVersions = versions.filter((v) => v.trim() !== "");

    if (!cId) {
      alert(
        "Por favor, preencha o ID da Corporação.",
      );
      return;
    }

    setIsProcessing(true);
    setIsPaused(false);
    isPausedRef.current = false;
    currentIndexRef.current = 0;
    matchingAppsRef.current = [];
    targetVersionsRef.current = targetVersions;
    targetPackagesRef.current = targetPackages;
    setResults([]);
    addLog(`Buscando aplicativos para a corporação ID ${cId}...`, "info");

    // Limpeza automática dos filtros de busca pós-início
    setCorpId("");
    setPackages([]);
    setVersions([]);

    try {
      const listData: any = await api.fetch(
        `${CONFIG.BASE_URL}/api-application/application?page=1&limit=500&corporationId=${cId}`,
      );
      const apps =
        listData?.data ??
        listData?.items ??
        (Array.isArray(listData) ? listData : []);

      if (apps.length === 0) {
        addLog("Nenhum aplicativo encontrado.", "warn");
        setIsProcessing(false);
        return;
      }

      const matchingApps = apps.filter((app: any) => {
        if (
          targetPackages.length > 0 &&
          !targetPackages.includes(app.packageName)
        ) {
          return false;
        }
        return true;
      });

      if (matchingApps.length === 0) {
        addLog(
          `Nenhum aplicativo correspondente encontrado (filtro de package).`,
          "warn",
        );
        setIsProcessing(false);
        return;
      }

      matchingAppsRef.current = matchingApps;
      addLog(
        `${matchingApps.length} aplicativo(s) correspondente(s) encontrado(s). Verificando versões...`,
        "info",
      );

      await runLoop();
    } catch (error: any) {
      addLog(`Erro na busca: ${error.message}`, "err");
      setIsProcessing(false);
    }
  }, [corpId, packages, versions, addLog]);

  const resumeSearch = useCallback(async () => {
    if (!api.hasToken()) {
      addLog("Autenticação necessária antes de prosseguir.", "err");
      return;
    }

    setIsProcessing(true);
    setIsPaused(false);
    isPausedRef.current = false;
    addLog("Retomando busca de APKs...", "info");

    await runLoop();
  }, [addLog]);

  const pauseSearch = useCallback(() => {
    setIsPaused(true);
    isPausedRef.current = true;
    addLog("Busca pausada pelo usuário.", "warn");
  }, [addLog]);

  const stopSearch = useCallback(() => {
    setIsProcessing(false);
    setIsPaused(false);
    isPausedRef.current = false;
    currentIndexRef.current = 0;
    matchingAppsRef.current = [];
    addLog("Busca interrompida pelo usuário.", "warn");
  }, [addLog]);

  const resetSearch = useCallback(() => {
    setResults([]);
    setLogs([]);
    currentIndexRef.current = 0;
    matchingAppsRef.current = [];
    logIdRef.current = 0;
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    logIdRef.current = 0;
  }, []);

  const clearFilters = useCallback(() => {
    setCorpId("");
    setPackages([]);
    setVersions([]);
  }, []);

  return {
    corpId,
    setCorpId,
    packages,
    setPackages,
    versions,
    setVersions,
    availableApps,
    isLoadingApps,
    availableVersions,
    isLoadingVersions,
    isProcessing,
    isPaused,
    logs,
    addLog,
    results,
    startSearch,
    resumeSearch,
    pauseSearch,
    stopSearch,
    resetSearch,
    clearLogs,
    clearFilters,
  };
}
