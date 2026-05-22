import { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import { api, CONFIG } from "../../api";

export function useChecker() {
  const [packages, setPackages] = useState<string[]>(["com.mdmservice"]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [serials, setSerials] = useState<string[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedCol, setSelectedCol] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const currentIndexRef = useRef(0);
  const doneRef = useRef(0);
  const failRef = useRef(0);
  const [logs, setLogs] = useState<
    { id: number; message: string; type: string; time: string }[]
  >([]);

  const [stats, setStats] = useState({ total: 0, done: 0, fail: 0 });
  const [results, setResults] = useState<any[]>([]);
  const [tableRows, setTableRows] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const applyColumn = useCallback(
    (data: any[], colIdx: number) => {
      const parsedSerials = data
        .slice(1)
        .map((row) => String(row[colIdx] ?? "").trim())
        .filter(Boolean);

      setSerials(parsedSerials);
      setStats((s) => ({ ...s, total: parsedSerials.length }));
      setSelectedCol(colIdx);
      addLog(
        `${parsedSerials.length} seriais encontrados na coluna selecionada.`,
        "ok",
      );
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
    const concurrency = 5;

    const processBatch = async (batch: string[]) => {
      const promises = batch.map(async (serial) => {
        let status = "error";
        let eqName = "Sem informação";
        let online = "Sem informação";
        let eqId = null;
        let versionStr = "Sem informação";
        let eqGroup = "Sem informação";
        let eqPolicy = "Sem informação";
        const queryTime = new Date().toLocaleTimeString();

        try {
          // 1. Get Equipment Info
          const searchData: any = await api.fetch(
            `${CONFIG.BASE_URL}/api-eqp/equipment?page=1&limit=10&key=${encodeURIComponent(serial)}`,
          );
          const items =
            searchData.data ??
            searchData.items ??
            (Array.isArray(searchData) ? searchData : []);

          let eq = null;
          const serialFields = [
            "serialNumber",
            "serial",
            "serialnumber",
            "imei",
          ];
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
            eqId = eq.id;
            eqName = eq.name || "Sem informação";
            status = eq.status === 1 ? "ok" : "err";

            // Get group and policy details safely from various potential property paths
            eqGroup =
              eq.equipmentGroup?.name ||
              eq.group?.name ||
              eq.equipmentGroupName ||
              eq.groupName ||
              eq.grupo?.name ||
              (typeof eq.equipmentGroup === "string"
                ? eq.equipmentGroup
                : "") ||
              (typeof eq.group === "string" ? eq.group : "") ||
              "Sem informação";
            eqPolicy =
              eq.usePolicy?.name ||
              eq.policy?.name ||
              eq.usePolicyName ||
              eq.policyName ||
              eq.politica?.name ||
              (typeof eq.usePolicy === "string" ? eq.usePolicy : "") ||
              (typeof eq.policy === "string" ? eq.policy : "") ||
              "Sem informação";

            const isPowerOn = eq.powerOn === true;
            const lastUpdate = eq.lastUpdate
              ? new Date(eq.lastUpdate)
              : new Date(0);
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
                const appsData: any = await api.fetch(
                  `${CONFIG.BASE_URL}/api-eqp/equipment-application-historic/${eqId}?page=${page}&limit=50&boSystem=${boSystem}`,
                );
                const appItems =
                  appsData?.data ??
                  appsData?.items ??
                  (Array.isArray(appsData) ? appsData : []);

                appItems.forEach((item: any) => {
                  if (validPackages.includes(item.packageName)) {
                    foundVersions[item.packageName] =
                      item.version || "Sem informação";
                  }
                });

                if (validPackages.every((pkg) => foundVersions[pkg])) break;

                const total =
                  typeof appsData?.total === "number" ? appsData.total : 0;
                if (!appItems.length || page * 50 >= total) break;
                page++;
              }
              if (validPackages.every((pkg) => foundVersions[pkg])) break;
            }

            let allFound = true;
            const eqVersions = validPackages.map((pkg) => {
              const v = foundVersions[pkg];
              if (!v) allFound = false;
              return v || "Sem informação";
            });
            versionStr = eqVersions.join(" | ");

            if (allFound) {
              doneRef.current++;
            } else {
              failRef.current++;
            }
          } else {
            failRef.current++;
            status = "Sem informação";
            online = "Sem informação";
            versionStr = "Sem informação";
          }
        } catch (error: any) {
          failRef.current++;
          status = "Sem informação";
          online = "Sem informação";
          versionStr = "Sem informação";
        }

        const row = {
          serial,
          eqName,
          eqGroup,
          eqPolicy,
          versionStr,
          statusBadge:
            status === "ok"
              ? "badge-done"
              : status === "Sem informação"
                ? "badge-neutral"
                : "badge-err",
          statusText:
            status === "ok"
              ? "Ativo"
              : status === "Sem informação"
                ? "Sem informação"
                : "Inativo",
          onlineBadge:
            online === "ok"
              ? "badge-done"
              : online === "Sem informação"
                ? "badge-neutral"
                : "badge-err",
          onlineText:
            online === "ok"
              ? "Online"
              : online === "Sem informação"
                ? "Sem informação"
                : "Offline",
          queryTime,
        };

        setTableRows((prev) => [...prev, row]);

        const resultObj: any = {
          "Serial Number": serial,
          "Nome do Equipamento": eqName,
          "Grupo de Equipamento": eqGroup,
          "Política de Uso": eqPolicy,
          Status: row.statusText,
          Conexão: row.onlineText,
          "Horário da Consulta": queryTime,
        };
        const vSplit = versionStr.split(" | ");
        validPackages.forEach((pkg, idx) => {
          resultObj[pkg] = vSplit[idx] || versionStr;
        });

        setResults((prev) => [...prev, resultObj]);
        setStats((s) => ({ ...s, done: doneRef.current, fail: failRef.current }));
      });

      await Promise.all(promises);
    };

    while (currentIndexRef.current < serials.length) {
      if (isPausedRef.current) {
        break;
      }
      const nextIndex = Math.min(currentIndexRef.current + concurrency, serials.length);
      const batch = serials.slice(currentIndexRef.current, nextIndex);
      currentIndexRef.current = nextIndex;
      await processBatch(batch);
    }

    if (currentIndexRef.current >= serials.length) {
      setIsProcessing(false);
      setIsPaused(false);
      addLog("Consulta finalizada com sucesso.", "ok");
    }
  };

  const startProcess = useCallback(async () => {
    if (!api.hasToken()) {
      addLog("Autenticação necessária antes de prosseguir.", "err");
      return;
    }

    const validPackages = packages.filter((p) => p.trim() !== "");
    if (validPackages.length === 0) {
      addLog("Defina pelo menos um Package Name.", "err");
      return;
    }

    setIsProcessing(true);
    setIsPaused(false);
    isPausedRef.current = false;
    currentIndexRef.current = 0;
    doneRef.current = 0;
    failRef.current = 0;

    setStats({ total: serials.length, done: 0, fail: 0 });
    setResults([]);
    setTableRows([]);
    addLog(`Iniciando consulta para ${serials.length} seriais.`, "info");

    await runLoop(validPackages);
  }, [serials, packages, addLog]);

  const resumeProcess = useCallback(async () => {
    if (!api.hasToken()) {
      addLog("Autenticação necessária antes de prosseguir.", "err");
      return;
    }

    const validPackages = packages.filter((p) => p.trim() !== "");
    if (validPackages.length === 0) {
      addLog("Defina pelo menos um Package Name.", "err");
      return;
    }

    setIsProcessing(true);
    setIsPaused(false);
    isPausedRef.current = false;
    addLog("Retomando consulta...", "info");

    await runLoop(validPackages);
  }, [serials, packages, addLog]);

  const pauseProcess = useCallback(() => {
    setIsPaused(true);
    isPausedRef.current = true;
    addLog("Processo pausado pelo usuário.", "warn");
  }, [addLog]);

  const stopProcess = useCallback(() => {
    setIsProcessing(false);
    setIsPaused(false);
    isPausedRef.current = false;
    currentIndexRef.current = 0;
    doneRef.current = 0;
    failRef.current = 0;
    addLog("Processo interrompido pelo usuário.", "warn");
  }, [addLog]);

  const exportExcel = useCallback(() => {
    if (results.length === 0) return;
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(results);
    XLSX.utils.book_append_sheet(wb, ws, "Versões");
    XLSX.writeFile(wb, `MDM_Versoes_${new Date().getTime()}.xlsx`);
  }, [results]);

  const resetProcess = useCallback(() => {
    setResults([]);
    setTableRows([]);
    setStats({ total: serials.length, done: 0, fail: 0 });
    setLogs([]);
    currentIndexRef.current = 0;
    doneRef.current = 0;
    failRef.current = 0;
    logIdRef.current = 0;
  }, [serials.length]);

  const clearLogs = useCallback(() => {
    setLogs([]);
    logIdRef.current = 0;
  }, []);

  return {
    packages,
    setPackages,
    rawData,
    setRawData,
    serials,
    setSerials,
    columns,
    setColumns,
    selectedCol,
    setSelectedCol,
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
