import { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import { api, CONFIG } from "../../api";
import { logAudit } from "../../utils/audit";
import { uploadReport } from "../../utils/reports";

export interface ColumnConfig {
  id: string;
  label: string;
  enabled: boolean;
}

export interface TerminalRow {
  id: string | number;
  name: string;
  serial: string;
  eqGroup: string;
  powerText: string;
  onlineText: string;
  statusText: string;
  blockedText: string;
  lastUpdateText: string;
  [key: string]: string | number;
}

export interface EquipmentItem {
  id: string | number;
  name?: string;
  serial?: string;
  serialNumber?: string;
  imei?: string;
  equipmentGroup?: unknown;
  group?: unknown;
  equipmentGroupName?: string;
  groupName?: string;
  grupo?: { name?: string };
  powerOn?: boolean;
  lastUpdate?: string | number | Date;
  status?: number;
  blocked?: boolean;
  isBlocked?: boolean;
}

export interface FetchResponse {
  data?: EquipmentItem[];
  items?: EquipmentItem[];
  total?: number;
  totalPages?: number;
  meta?: {
    totalItems?: number;
    total?: number;
    totalPages?: number;
  };
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: "id", label: "ID do Terminal", enabled: true },
  { id: "name", label: "Nome do Equipamento", enabled: true },
  { id: "serial", label: "Número de Série", enabled: true },
  { id: "eqGroup", label: "Grupo de Equipamento", enabled: true },
  { id: "powerText", label: "Status de Energia", enabled: true },
  { id: "onlineText", label: "Conexão", enabled: true },
  { id: "statusText", label: "Status de Atividade", enabled: true },
  { id: "blockedText", label: "Bloqueio", enabled: true },
  { id: "lastUpdateText", label: "Última Atualização", enabled: true },
];

export function useFetcher() {
  const restrictions = api.getRestrictions();

  const [corporationId, setCorporationId] = useState<string>(restrictions.defaultCorpId);
  const [companyId, setCompanyId] = useState<string>(restrictions.defaultCompanyId);
  const [subsidiaryId, setSubsidiaryId] = useState<string>(restrictions.defaultSubsidiaryId);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const isPausedRef = useRef(false);
  const isProcessingRef = useRef(false);
  const currentPageRef = useRef(1);
  const logIdRef = useRef(0);

  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    const saved = localStorage.getItem("mdm_fetcher_columns");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === DEFAULT_COLUMNS.length) {
          const parsedIds = parsed.map(c => c.id);
          const hasAllIds = DEFAULT_COLUMNS.every(dc => parsedIds.includes(dc.id));
          if (hasAllIds) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return DEFAULT_COLUMNS;
  });

  const toggleColumn = useCallback((id: string) => {
    setColumns(prev => {
      const updated = prev.map(col => col.id === id ? { ...col, enabled: !col.enabled } : col);
      localStorage.setItem("mdm_fetcher_columns", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const moveColumn = useCallback((index: number, direction: "up" | "down") => {
    setColumns(prev => {
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[nextIndex];
      updated[nextIndex] = temp;
      
      localStorage.setItem("mdm_fetcher_columns", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const [logs, setLogs] = useState<
    { id: number; message: string; type: string; time: string }[]
  >([]);

  const [stats, setStats] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 0,
    processedItems: 0,
  });

  const [tableRows, setTableRows] = useState<TerminalRow[]>([]);

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

  const runLoop = useCallback(async (corpId: string, compId?: string, subId?: string) => {
    const limit = 50;

    while (true) {
      if (!isProcessingRef.current) {
        break;
      }
      if (isPausedRef.current) {
        break;
      }

      const page = currentPageRef.current;
      addLog(`Consultando página ${page}...`, "info");

      try {
        let url = `${CONFIG.BASE_URL}/api-eqp/equipment?page=${page}&limit=${limit}&corporationId=${corpId}`;
        if (compId) url += `&companyId=${compId}`;
        if (subId) url += `&subsidiaryId=${subId}`;

        const response = (await api.fetch(url)) as FetchResponse;

        if (!isProcessingRef.current) {
          break;
        }

        const items = (response.data ??
          response.items ??
          (Array.isArray(response) ? response : [])) as EquipmentItem[];

        if (!items || items.length === 0) {
          addLog("Nenhum terminal retornado nesta página. Busca encerrada.", "ok");
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

        const newRows: TerminalRow[] = [];
        const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);

        items.forEach((item) => {
          const id = item.id;
          const name = item.name || "Sem informação";
          const serial =
            String(item.serial || item.serialNumber || item.imei || "").trim() ||
            "Sem informação";

          const eqGroup =
            (item.equipmentGroup && typeof item.equipmentGroup === "object" ? (item.equipmentGroup as { name?: string }).name : null) ||
            (item.group && typeof item.group === "object" ? (item.group as { name?: string }).name : null) ||
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

          const isBlocked = item.blocked === true || item.isBlocked === true;
          const blockedText = isBlocked ? "Bloqueado" : "Desbloqueado";

          newRows.push({
            id,
            name,
            serial,
            eqGroup,
            powerText,
            onlineText,
            statusText,
            blockedText,
            lastUpdateText,
          });
        });

        setTableRows((prev) => [...prev, ...newRows]);

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

          logAudit("FETCHER_FINISH", corporationId, {
            companyId,
            subsidiaryId,
            totalItems: tableRows.length + items.length
          });
          break;
        }

        // Wait to avoid aggressive rate limits
        await new Promise((resolve) => setTimeout(resolve, 150));
        currentPageRef.current = page + 1;
      } catch (err) {
        addLog(`Erro ao buscar página ${page}: ${(err as Error).message || String(err)}`, "err");
        setIsProcessing(false);
        isProcessingRef.current = false;
        setIsPaused(false);
        break;
      }
    }
  }, [addLog]);

  const startProcess = useCallback(async () => {
    if (!api.hasToken()) {
      addLog("Autenticação necessária antes de prosseguir.", "err");
      return;
    }

    if (!corporationId.trim()) {
      addLog("ID da Corporação é obrigatório.", "err");
      return;
    }

    const r = api.getRestrictions();
    if (r.allowedCorps.length > 0 && !r.allowedCorps.includes(Number(corporationId))) {
      addLog("Corporação não permitida para o seu usuário.", "err");
      return;
    }
    if (companyId.trim() && r.allowedCompanies.length > 0 && !r.allowedCompanies.includes(Number(companyId))) {
      addLog("Empresa não permitida para o seu usuário.", "err");
      return;
    }
    if (subsidiaryId.trim() && r.allowedSubsidiaries.length > 0 && !r.allowedSubsidiaries.includes(Number(subsidiaryId))) {
      addLog("Filial não permitida para o seu usuário.", "err");
      return;
    }

    setIsProcessing(true);
    isProcessingRef.current = true;
    setIsPaused(false);
    isPausedRef.current = false;
    currentPageRef.current = 1;

    setStats({
      totalItems: 0,
      totalPages: 0,
      currentPage: 0,
      processedItems: 0,
    });
    setTableRows([]);

    addLog(
      `Iniciando busca completa de terminais para a corporação ID ${corporationId}.`,
      "info"
    );

    logAudit("FETCHER_START", corporationId, {
      companyId,
      subsidiaryId
    });

    await runLoop(corporationId, companyId, subsidiaryId);
  }, [corporationId, companyId, subsidiaryId, addLog, runLoop]);

  const resumeProcess = useCallback(async () => {
    if (!api.hasToken()) {
      addLog("Autenticação necessária antes de prosseguir.", "err");
      return;
    }

    setIsProcessing(true);
    isProcessingRef.current = true;
    setIsPaused(false);
    isPausedRef.current = false;

    addLog(`Retomando busca a partir da página ${currentPageRef.current}...`, "info");

    logAudit("FETCHER_RESUME", corporationId, {
      companyId,
      subsidiaryId,
      currentPage: currentPageRef.current
    });

    await runLoop(corporationId, companyId, subsidiaryId);
  }, [corporationId, companyId, subsidiaryId, addLog, runLoop]);

  const pauseProcess = useCallback(() => {
    setIsPaused(true);
    isPausedRef.current = true;
    addLog("Processo pausado pelo usuário.", "warn");

    logAudit("FETCHER_PAUSE", corporationId, {
      companyId,
      subsidiaryId,
      currentPage: currentPageRef.current
    });
  }, [addLog, corporationId, companyId, subsidiaryId]);

  const stopProcess = useCallback(() => {
    setIsProcessing(false);
    isProcessingRef.current = false;
    setIsPaused(false);
    isPausedRef.current = false;

    logAudit("FETCHER_STOP", corporationId, {
      companyId,
      subsidiaryId,
      currentPage: currentPageRef.current,
      processedCount: tableRows.length
    });

    currentPageRef.current = 1;
    addLog("Processo interrompido pelo usuário.", "warn");
  }, [addLog, corporationId, companyId, subsidiaryId, tableRows.length]);

  const resetProcess = useCallback(() => {
    setTableRows([]);
    setStats({
      totalItems: 0,
      totalPages: 0,
      currentPage: 0,
      processedItems: 0,
    });
    setLogs([]);
    currentPageRef.current = 1;
    logIdRef.current = 0;
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    logIdRef.current = 0;
  }, []);

  const exportExcel = useCallback(async () => {
    if (tableRows.length === 0) return;

    const enabledColumns = columns.filter((c) => c.enabled);
    const dataToExport = tableRows.map((row) => {
      const exportedRow: Record<string, string | number> = {};
      enabledColumns.forEach((col) => {
        exportedRow[col.label] = row[col.id];
      });
      return exportedRow;
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(wb, ws, "Terminais");

    // Gera arquivo array buffer
    try {
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], { type: "application/octet-stream" });
      uploadReport(
        "FETCHER",
        corporationId,
        { companyId, subsidiaryId, columns: enabledColumns.map(c => c.id) },
        tableRows.length,
        blob
      );
    } catch (err) {
      console.warn("Erro ao preparar e fazer upload do excel para o Supabase:", err);
    }

    XLSX.writeFile(wb, `MDM_Terminais_Corp_${corporationId}_${new Date().getTime()}.xlsx`);
  }, [tableRows, columns, corporationId, companyId, subsidiaryId]);

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
    columns,
    toggleColumn,
    moveColumn,
    tableRows,
    startProcess,
    resumeProcess,
    pauseProcess,
    stopProcess,
    resetProcess,
    clearLogs,
    exportExcel,
    restrictions,
  };
}
