import { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import { api, CONFIG } from "../../api";

export function useChecker() {
  const [packages, setPackages] = useState<string[]>(["com.mdmservice"]);
  const [fetchAllApps, setFetchAllApps] = useState(false);
  const [includeSystemApps, setIncludeSystemApps] = useState(false);
  const [rawData, setRawData] = useState<any[]>([]);
  const [serials, setSerials] = useState<string[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedCol, setSelectedCol] = useState(0);

  // New Filters and Search Source
  const [searchSource, setSearchSource] = useState<"filters" | "file">("filters");
  const [corporationId, setCorporationId] = useState<string>("");
  const [companyId, setCompanyId] = useState<string>("");
  const [subsidiaryId, setSubsidiaryId] = useState<string>("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const isPausedRef = useRef(false);
  const isProcessingRef = useRef(false);
  const currentIndexRef = useRef(0);
  const currentPageRef = useRef(1);
  const logIdRef = useRef(0);

  const [logs, setLogs] = useState<
    { id: number; message: string; type: string; time: string }[]
  >([]);

  const [stats, setStats] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 0,
    processedItems: 0,
  });

  const [results, setResults] = useState<any[]>([]);
  const [tableRows, setTableRows] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const applyColumn = useCallback(
    (data: any[], colIdx: number) => {
      const parsedSerials = data
        .slice(1)
        .map((row) => String(row[colIdx] ?? "").trim())
        .filter(Boolean);

      const totalParsed = parsedSerials.length;
      const wasTruncated = totalParsed > 10000;
      const finalSerials = wasTruncated ? parsedSerials.slice(0, 10000) : parsedSerials;

      setSerials(finalSerials);
      setStats((s) => ({
        ...s,
        totalItems: finalSerials.length,
        totalPages: Math.ceil(finalSerials.length / 50),
      }));
      setSelectedCol(colIdx);

      if (wasTruncated) {
        addLog(
          `Aviso: A coluna selecionada contém ${totalParsed} seriais. Apenas os primeiros 10.000 serão processados por limitação técnica.`,
          "warn",
        );
      } else {
        addLog(
          `${finalSerials.length} seriais encontrados na coluna selecionada.`,
          "ok",
        );
      }
    },
    [addLog],
  );

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const data = ev.target?.result;
        if (data) {
          const wb = XLSX.read(data, { type: "binary" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

          if (json.length < 2) {
            addLog("Planilha vazia ou sem dados.", "err");
            return;
          }

          const headers = (json[0] as any[]).map(String);
          setRawData(json);
          setColumns(headers);
          applyColumn(json, 0);
        }
      };
      reader.readAsBinaryString(file);
    },
    [addLog, applyColumn],
  );

  const runLoop = async (validPackages: string[]) => {
    const limit = 50;

    const fetchAppVersions = async (eqId: any, pkgs: string[]) => {
      const foundVersions: Record<string, string> = {};
      try {
        const boSystemOptions = fetchAllApps
          ? (includeSystemApps ? [false, true] : [false])
          : [false, true];

        for (const boSystem of boSystemOptions) {
          let page = 1;
          while (true) {
            if (!isProcessingRef.current) break;
            const appsData: any = await api.fetch(
              `${CONFIG.BASE_URL}/api-eqp/equipment-application-historic/${eqId}?page=${page}&limit=50&boSystem=${boSystem}`,
            );
            
            if (!isProcessingRef.current) break;

            const appItems =
              appsData?.data ??
              appsData?.items ??
              (Array.isArray(appsData) ? appsData : []);

            appItems.forEach((item: any) => {
              if (fetchAllApps) {
                foundVersions[item.packageName] =
                  item.version || "Sem informação";
              } else {
                if (pkgs.includes(item.packageName)) {
                  foundVersions[item.packageName] =
                    item.version || "Sem informação";
                }
              }
            });

            if (!fetchAllApps && pkgs.every((pkg) => foundVersions[pkg])) break;

            const total =
              typeof appsData?.total === "number" ? appsData.total : 0;
            if (!appItems.length || page * 50 >= total) break;
            page++;
          }
          if (!fetchAllApps && pkgs.every((pkg) => foundVersions[pkg])) break;
        }
      } catch (e) {
        // Ignorar erros de rede individuais, retornar "Sem informação" por fallback
      }

      if (fetchAllApps) {
        const entries = Object.entries(foundVersions);
        if (entries.length === 0) return "Nenhum aplicativo encontrado";
        return entries
          .map(([pkg, ver]) => `${pkg} (${ver})`)
          .join(" | ");
      }

      return pkgs.map((pkg) => foundVersions[pkg] || "Sem informação").join(" | ");
    };

    if (searchSource === "filters") {
      let page = currentPageRef.current;

      while (true) {
        if (!isProcessingRef.current) {
          break;
        }
        if (isPausedRef.current) {
          break;
        }

        addLog(`Consultando página ${page}...`, "info");

        try {
          let url = `${CONFIG.BASE_URL}/api-eqp/equipment?page=${page}&limit=${limit}&corporationId=${corporationId}`;
          if (companyId) url += `&companyId=${companyId}`;
          if (subsidiaryId) url += `&subsidiaryId=${subsidiaryId}`;

          const response: any = await api.fetch(url);

          if (!isProcessingRef.current) {
            break;
          }

          const items =
            response.data ??
            response.items ??
            (Array.isArray(response) ? response : []);

          if (!items || items.length === 0) {
            addLog("Nenhum terminal retornado nesta página. Consulta encerrada.", "ok");
            setIsProcessing(false);
            isProcessingRef.current = false;
            setIsPaused(false);
            break;
          }

          // Initialize total counts on page 1
          if (page === 1) {
            const total =
              typeof response?.total === "number"
                ? response.total
                : typeof response?.meta?.totalItems === "number"
                ? response.meta.totalItems
                : typeof response?.meta?.total === "number"
                ? response.meta.total
                : items.length;

            const pages =
              typeof response?.totalPages === "number"
                ? response.totalPages
                : typeof response?.meta?.totalPages === "number"
                ? response.meta.totalPages
                : Math.ceil(total / limit) || 1;

            setStats((s) => ({
              ...s,
              totalItems: total,
              totalPages: pages,
            }));

            addLog(
              `Encontrados no total ${total} terminais distribuídos em ${pages} páginas.`,
              "ok"
            );
          }

          const newRows: any[] = [];
          const newResults: any[] = [];
          const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);

          const promises = items.map(async (item: any) => {
            const id = item.id;
            const name = item.name || "Sem informação";
            const serial =
              String(item.serial || item.serialNumber || item.imei || "").trim() ||
              "Sem informação";

            const eqGroup =
              item.equipmentGroup?.name ||
              item.group?.name ||
              item.equipmentGroupName ||
              item.groupName ||
              item.grupo?.name ||
              (typeof item.equipmentGroup === "string" ? item.equipmentGroup : "") ||
              (typeof item.group === "string" ? item.group : "") ||
              "Sem informação";

            const isPowerOn = item.powerOn === true;
            const powerText = isPowerOn ? "Ligado" : "Desligado";

            const lastUpdate = item.lastUpdate ? new Date(item.lastUpdate) : null;
            const lastUpdateText = lastUpdate
              ? lastUpdate.toLocaleString("pt-BR")
              : "Sem informação";

            let onlineText = "Offline";
            if (isPowerOn && lastUpdate && lastUpdate >= tenMinsAgo) {
              onlineText = "Online";
            }

            const versionStr = await fetchAppVersions(id, validPackages);

            newRows.push({
              serial,
              eqName: name,
              eqGroup,
              powerText,
              onlineText,
              lastUpdateText,
              versionStr,
            });

            const resultObj: any = {
              "Nome do Equipamento": name,
              "Número de Série": serial,
              "Grupo de Equipamento": eqGroup,
              "Status de Energia": powerText,
              "Conexão": onlineText,
              "Última Atualização": lastUpdateText,
            };

            if (fetchAllApps) {
              if (versionStr && versionStr !== "Nenhum aplicativo encontrado" && versionStr !== "Sem informação") {
                const apps = versionStr.split(" | ");
                apps.forEach((app) => {
                  const match = app.match(/^(.*?)\s*\((.*?)\)$/);
                  if (match) {
                    const pkgName = match[1].trim();
                    const version = match[2].trim();
                    resultObj[pkgName] = version;
                  } else {
                    resultObj[app] = "Instalado";
                  }
                });
              }
            } else {
              const vSplit = versionStr.split(" | ");
              validPackages.forEach((pkg, idx) => {
                resultObj[pkg] = vSplit[idx] || versionStr;
              });
            }

            newResults.push(resultObj);
          });

          await Promise.all(promises);

          setTableRows((prev) => [...prev, ...newRows]);
          setResults((prev) => [...prev, ...newResults]);

          setStats((s) => {
            const nextProcessed = s.processedItems + items.length;
            return {
              ...s,
              currentPage: page,
              processedItems: nextProcessed,
            };
          });

          addLog(`Página ${page} processada com sucesso (${items.length} terminais obtidos).`, "ok");

          const totalPages =
            typeof response?.totalPages === "number"
              ? response.totalPages
              : typeof response?.meta?.totalPages === "number"
              ? response.meta.totalPages
              : Math.ceil(
                  (response.total ?? response.meta?.totalItems ?? items.length) / limit
                ) || 1;

          if (page >= totalPages || items.length < limit) {
            addLog("Busca completa finalizada com sucesso.", "ok");
            setIsProcessing(false);
            isProcessingRef.current = false;
            setIsPaused(false);
            break;
          }

          await new Promise((resolve) => setTimeout(resolve, 150));
          page++;
          currentPageRef.current = page;
        } catch (err: any) {
          addLog(`Erro ao buscar página ${page}: ${err.message || err}`, "err");
          setIsProcessing(false);
          isProcessingRef.current = false;
          setIsPaused(false);
          break;
        }
      }
    } else {
      const totalSerials = serials.length;

      while (currentIndexRef.current < totalSerials) {
        if (!isProcessingRef.current) {
          break;
        }
        if (isPausedRef.current) {
          break;
        }

        const nextIndex = Math.min(currentIndexRef.current + limit, totalSerials);
        const batch = serials.slice(currentIndexRef.current, nextIndex);
        const currentBatchPage = Math.ceil(nextIndex / limit);

        addLog(`Consultando lote ${currentBatchPage} (${batch.length} seriais)...`, "info");

        const newRows: any[] = [];
        const newResults: any[] = [];
        const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);

        const promises = batch.map(async (serial) => {
          let eqName = "Sem informação";
          let eqGroup = "Sem informação";
          let powerText = "Desligado";
          let onlineText = "Offline";
          let lastUpdateText = "Sem informação";
          let versionStr = "";
          if (fetchAllApps) {
            versionStr = "Sem informação";
          } else {
            validPackages.forEach(() => {
              versionStr += (versionStr ? " | " : "") + "Sem informação";
            });
          }

          try {
            const searchData: any = await api.fetch(
              `${CONFIG.BASE_URL}/api-eqp/equipment?page=1&limit=10&key=${encodeURIComponent(serial)}`,
            );
            const items =
              searchData.data ??
              searchData.items ??
              (Array.isArray(searchData) ? searchData : []);

            let eq = null;
            const serialFields = ["serialNumber", "serial", "serialnumber", "imei"];
            for (const item of items) {
              if (
                serialFields.some(
                  (field) => String(item[field] || "").trim() === serial,
                )
              ) {
                eq = item;
                break;
              }
            }
            if (!eq && items.length === 1) eq = items[0];

            if (eq) {
              const eqId = eq.id;
              eqName = eq.name || "Sem informação";
              eqGroup =
                eq.equipmentGroup?.name ||
                eq.group?.name ||
                eq.equipmentGroupName ||
                eq.groupName ||
                eq.grupo?.name ||
                (typeof eq.equipmentGroup === "string" ? eq.equipmentGroup : "") ||
                (typeof eq.group === "string" ? eq.group : "") ||
                "Sem informação";

              const isPowerOn = eq.powerOn === true;
              powerText = isPowerOn ? "Ligado" : "Desligado";

              const lastUpdate = eq.lastUpdate ? new Date(eq.lastUpdate) : null;
              lastUpdateText = lastUpdate
                ? lastUpdate.toLocaleString("pt-BR")
                : "Sem informação";

              if (isPowerOn && lastUpdate && lastUpdate >= tenMinsAgo) {
                onlineText = "Online";
              }

              versionStr = await fetchAppVersions(eqId, validPackages);
            }
          } catch (error) {
            // Ignorar erros individuais
          }

          newRows.push({
            serial,
            eqName,
            eqGroup,
            powerText,
            onlineText,
            lastUpdateText,
            versionStr,
          });

          const resultObj: any = {
            "Nome do Equipamento": eqName,
            "Número de Série": serial,
            "Grupo de Equipamento": eqGroup,
            "Status de Energia": powerText,
            "Conexão": onlineText,
            "Última Atualização": lastUpdateText,
          };

          if (fetchAllApps) {
            if (versionStr && versionStr !== "Nenhum aplicativo encontrado" && versionStr !== "Sem informação") {
              const apps = versionStr.split(" | ");
              apps.forEach((app) => {
                const match = app.match(/^(.*?)\s*\((.*?)\)$/);
                if (match) {
                  const pkgName = match[1].trim();
                  const version = match[2].trim();
                  resultObj[pkgName] = version;
                } else {
                  resultObj[app] = "Instalado";
                }
              });
            }
          } else {
            const vSplit = versionStr.split(" | ");
            validPackages.forEach((pkg, idx) => {
              resultObj[pkg] = vSplit[idx] || versionStr;
            });
          }

          newResults.push(resultObj);
        });

        await Promise.all(promises);

        setTableRows((prev) => [...prev, ...newRows]);
        setResults((prev) => [...prev, ...newResults]);

        currentIndexRef.current = nextIndex;

        setStats((s) => ({
          ...s,
          currentPage: currentBatchPage,
          processedItems: nextIndex,
        }));

        addLog(`Lote ${currentBatchPage} processado com sucesso.`, "ok");

        await new Promise((resolve) => setTimeout(resolve, 150));
      }

      if (currentIndexRef.current >= totalSerials) {
        setIsProcessing(false);
        isProcessingRef.current = false;
        setIsPaused(false);
        addLog("Consulta finalizada com sucesso.", "ok");
      }
    }
  };

  const startProcess = useCallback(async () => {
    if (!api.hasToken()) {
      addLog("Autenticação necessária antes de prosseguir.", "err");
      return;
    }

    const validPackages = fetchAllApps ? [] : packages.filter((p) => p.trim() !== "");
    if (!fetchAllApps && validPackages.length === 0) {
      addLog("Defina pelo menos um Package Name.", "err");
      return;
    }

    if (searchSource === "filters" && !corporationId.trim()) {
      addLog("ID da Corporação é obrigatório.", "err");
      return;
    }

    if (searchSource === "file" && serials.length === 0) {
      addLog("Carregue uma planilha com números de série.", "err");
      return;
    }

    setIsProcessing(true);
    isProcessingRef.current = true;
    setIsPaused(false);
    isPausedRef.current = false;
    currentIndexRef.current = 0;
    currentPageRef.current = 1;

    const totalItems = searchSource === "file" ? serials.length : 0;
    const totalPages = searchSource === "file" ? Math.ceil(serials.length / 50) : 0;

    setStats({
      totalItems,
      totalPages,
      currentPage: 0,
      processedItems: 0,
    });
    setResults([]);
    setTableRows([]);

    if (searchSource === "file") {
      addLog(`Iniciando consulta para ${serials.length} seriais via planilha.`, "info");
    } else {
      addLog(`Iniciando consulta completa para corporação ID ${corporationId}.`, "info");
    }

    await runLoop(validPackages);
  }, [searchSource, serials, packages, corporationId, companyId, subsidiaryId, fetchAllApps, includeSystemApps, addLog]);

  const resumeProcess = useCallback(async () => {
    if (!api.hasToken()) {
      addLog("Autenticação necessária antes de prosseguir.", "err");
      return;
    }

    const validPackages = fetchAllApps ? [] : packages.filter((p) => p.trim() !== "");
    if (!fetchAllApps && validPackages.length === 0) {
      addLog("Defina pelo menos um Package Name.", "err");
      return;
    }

    setIsProcessing(true);
    isProcessingRef.current = true;
    setIsPaused(false);
    isPausedRef.current = false;

    if (searchSource === "file") {
      addLog(`Retomando consulta a partir do serial ${currentIndexRef.current + 1}...`, "info");
    } else {
      addLog(`Retomando busca a partir da página ${currentPageRef.current}...`, "info");
    }
    await runLoop(validPackages);
  }, [searchSource, serials, packages, corporationId, companyId, subsidiaryId, fetchAllApps, includeSystemApps, addLog]);

  const pauseProcess = useCallback(() => {
    setIsPaused(true);
    isPausedRef.current = true;
    addLog("Processo pausado pelo usuário.", "warn");
  }, [addLog]);

  const stopProcess = useCallback(() => {
    setIsProcessing(false);
    isProcessingRef.current = false;
    setIsPaused(false);
    isPausedRef.current = false;
    currentIndexRef.current = 0;
    currentPageRef.current = 1;
    addLog("Processo interrompido pelo usuário.", "warn");
  }, [addLog]);

  const exportExcel = useCallback(() => {
    if (results.length === 0) return;

    // Detect all unique keys
    const allKeys = new Set<string>();
    results.forEach((row) => {
      Object.keys(row).forEach((key) => {
        allKeys.add(key);
      });
    });

    const metadataKeys = [
      "Nome do Equipamento",
      "Número de Série",
      "Grupo de Equipamento",
      "Status de Energia",
      "Conexão",
      "Última Atualização",
    ];

    // Other keys (app package names) sorted alphabetically
    const appKeys = Array.from(allKeys)
      .filter((k) => !metadataKeys.includes(k))
      .sort((a, b) => a.localeCompare(b));

    const header = [...metadataKeys, ...appKeys];

    // Preenche chaves de aplicativos ausentes com "Não instalado"
    const formattedResults = results.map((row) => {
      const newRow = { ...row };
      appKeys.forEach((key) => {
        if (newRow[key] === undefined || newRow[key] === null || newRow[key] === "") {
          newRow[key] = "Não instalado";
        }
      });
      return newRow;
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(formattedResults, { header });
    XLSX.utils.book_append_sheet(wb, ws, "Versões");
    XLSX.writeFile(wb, `MDM_Versoes_${new Date().getTime()}.xlsx`);
  }, [results]);

  const resetProcess = useCallback(() => {
    setResults([]);
    setTableRows([]);
    setStats({
      totalItems: searchSource === "file" ? serials.length : 0,
      totalPages: searchSource === "file" ? Math.ceil(serials.length / 50) : 0,
      currentPage: 0,
      processedItems: 0,
    });
    setLogs([]);
    currentIndexRef.current = 0;
    currentPageRef.current = 1;
    logIdRef.current = 0;
  }, [searchSource, serials.length]);

  const clearLogs = useCallback(() => {
    setLogs([]);
    logIdRef.current = 0;
  }, []);

  return {
    packages,
    setPackages,
    fetchAllApps,
    setFetchAllApps,
    includeSystemApps,
    setIncludeSystemApps,
    rawData,
    setRawData,
    serials,
    setSerials,
    columns,
    setColumns,
    selectedCol,
    setSelectedCol,
    searchSource,
    setSearchSource,
    corporationId,
    setCorporationId,
    companyId,
    setCompanyId,
    subsidiaryId,
    setSubsidiaryId,
    isProcessing,
    isPaused,
    logs,
    addLog,
    stats,
    setStats,
    results,
    setResults,
    tableRows,
    setTableRows,
    fileInputRef,
    handleFile,
    applyColumn,
    startProcess,
    resumeProcess,
    pauseProcess,
    stopProcess,
    exportExcel,
    resetProcess,
    clearLogs,
  };
}
