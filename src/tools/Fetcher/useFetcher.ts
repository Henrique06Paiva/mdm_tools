import { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import { api, CONFIG } from "../../api";

export function useFetcher() {
  const [corporationId, setCorporationId] = useState<string>("");
  const [companyId, setCompanyId] = useState<string>("");
  const [subsidiaryId, setSubsidiaryId] = useState<string>("");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const isPausedRef = useRef(false);
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

  const runLoop = async (corpId: string, compId?: string, subId?: string) => {
    const limit = 50;

    while (true) {
      if (isPausedRef.current) {
        break;
      }

      const page = currentPageRef.current;
      addLog(`Consultando página ${page}...`, "info");

      try {
        let url = `${CONFIG.BASE_URL}/api-eqp/equipment?page=${page}&limit=${limit}&corporationId=${corpId}`;
        if (compId) url += `&companyId=${compId}`;
        if (subId) url += `&subsidiaryId=${subId}`;

        const response: any = await api.fetch(url);

        const items =
          response.data ??
          response.items ??
          (Array.isArray(response) ? response : []);

        if (!items || items.length === 0) {
          addLog("Nenhum terminal retornado nesta página. Busca encerrada.", "ok");
          setIsProcessing(false);
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

        items.forEach((item: any) => {
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

          const statusText = item.status === 1 ? "Ativo" : "Inativo";

          newRows.push({
            id,
            name,
            serial,
            eqGroup,
            powerText,
            onlineText,
            statusText,
            lastUpdateText,
          });

          newResults.push({
            "ID do Terminal": id,
            "Nome do Equipamento": name,
            "Número de Série": serial,
            "Grupo de Equipamento": eqGroup,
            "Status de Energia": powerText,
            "Conexão": onlineText,
            "Status de Atividade": statusText,
            "Última Atualização": lastUpdateText,
          });
        });

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
          setIsPaused(false);
          break;
        }

        // Wait to avoid aggressive rate limits
        await new Promise((resolve) => setTimeout(resolve, 150));
        currentPageRef.current = page + 1;
      } catch (err: any) {
        addLog(`Erro ao buscar página ${page}: ${err.message || err}`, "err");
        setIsProcessing(false);
        setIsPaused(false);
        break;
      }
    }
  };

  const startProcess = useCallback(async () => {
    if (!api.hasToken()) {
      addLog("Autenticação necessária antes de prosseguir.", "err");
      return;
    }

    if (!corporationId.trim()) {
      addLog("ID da Corporação é obrigatório.", "err");
      return;
    }

    setIsProcessing(true);
    setIsPaused(false);
    isPausedRef.current = false;
    currentPageRef.current = 1;

    setStats({
      totalItems: 0,
      totalPages: 0,
      currentPage: 0,
      processedItems: 0,
    });
    setResults([]);
    setTableRows([]);

    addLog(
      `Iniciando busca completa de terminais para a corporação ID ${corporationId}.`,
      "info"
    );

    await runLoop(corporationId, companyId, subsidiaryId);
  }, [corporationId, companyId, subsidiaryId, addLog]);

  const resumeProcess = useCallback(async () => {
    if (!api.hasToken()) {
      addLog("Autenticação necessária antes de prosseguir.", "err");
      return;
    }

    setIsProcessing(true);
    setIsPaused(false);
    isPausedRef.current = false;

    addLog(`Retomando busca a partir da página ${currentPageRef.current}...`, "info");
    await runLoop(corporationId, companyId, subsidiaryId);
  }, [corporationId, companyId, subsidiaryId, addLog]);

  const pauseProcess = useCallback(() => {
    setIsPaused(true);
    isPausedRef.current = true;
    addLog("Processo pausado pelo usuário.", "warn");
  }, [addLog]);

  const stopProcess = useCallback(() => {
    setIsProcessing(false);
    setIsPaused(false);
    isPausedRef.current = false;
    currentPageRef.current = 1;
    addLog("Processo interrompido pelo usuário.", "warn");
  }, [addLog]);

  const exportExcel = useCallback(() => {
    if (results.length === 0) return;
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(results);
    XLSX.utils.book_append_sheet(wb, ws, "Terminais");
    XLSX.writeFile(wb, `MDM_Terminais_Corp_${corporationId}_${new Date().getTime()}.xlsx`);
  }, [results, corporationId]);

  return {
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
    results,
    tableRows,
    startProcess,
    resumeProcess,
    pauseProcess,
    stopProcess,
    exportExcel,
  };
}
