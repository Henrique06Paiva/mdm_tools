import { useState, useCallback, useRef } from "react";
import { api, CONFIG } from "../../api";

export interface Log {
  id: number;
  message: string;
  type: "info" | "warn" | "err" | "ok";
  time: string;
}

export interface UserSummary {
  id: number;
  username: string;
  fullName: string;
  email: string;
  status: number;
}

export function useCloner() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSummary[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  
  // Estado para guardar os dados de backup em formato de texto caso o POST final falhe
  const [backupJson, setBackupJson] = useState<string | null>(null);
  
  const [logs, setLogs] = useState<Log[]>([]);
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
    []
  );

  const clearLogs = useCallback(() => {
    setLogs([]);
    logIdRef.current = 0;
  }, []);

  // Busca lista de usuários com base no termo
  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      addLog("Digite um nome ou e-mail para buscar.", "warn");
      return;
    }
    setIsSearching(true);
    addLog(`Buscando usuários com o termo: "${query}"...`, "info");
    try {
      // Fazemos a chamada de GET para a lista de usuários
      const url = `${CONFIG.BASE_URL}/api-acl/user?page=1&limit=20&search=${encodeURIComponent(query)}`;
      const response: any = await api.fetch(url);
      
      const items = response?.data ?? response?.items ?? (Array.isArray(response) ? response : []);
      setSearchResults(items);
      addLog(`Encontrado(s) ${items.length} usuário(s).`, "ok");
    } catch (error: any) {
      console.error(error);
      addLog(`Erro ao buscar usuários: ${error.message || error}`, "err");
    } finally {
      setIsSearching(false);
    }
  }, [addLog]);

  // Busca detalhes do usuário pelo ID
  const fetchUserDetails = useCallback(async (userId: string | number) => {
    if (!userId) return;
    setIsFetchingDetails(true);
    addLog(`Buscando detalhes do usuário ID ${userId}...`, "info");
    try {
      const url = `${CONFIG.BASE_URL}/api-acl/user/${userId}`;
      const response: any = await api.fetch(url);
      
      setSelectedUser(response);
      console.log("[useCloner] Dados brutos do usuário carregados:", response);
      setBackupJson(null); // Limpa o backup anterior
      addLog(`Detalhes do usuário "${response.fullName || response.username}" carregados com sucesso.`, "ok");
    } catch (error: any) {
      console.error(error);
      addLog(`Erro ao obter detalhes do usuário: ${error.message || error}`, "err");
    } finally {
      setIsFetchingDetails(false);
    }
  }, [addLog]);

  // Executa o fluxo de clonagem (Inativar -> Deletar -> Recriar)
  const executeClone = useCallback(async (user: any) => {
    if (!user) {
      addLog("Nenhum usuário selecionado para clonar.", "err");
      return;
    }

    setIsCloning(true);
    setBackupJson(null);
    clearLogs();
    
    const userFullName = user.profile?.fullName ?? user.fullName ?? "";
    const userDocument = user.profile?.document ?? user.document ?? null;
    const userPhone = user.profile?.phone ?? user.phone ?? "";
    const userEmail = user.email ?? user.profile?.email ?? "";

    addLog(`Iniciando processo de clonagem para o usuário: ${userFullName} (${user.username})`, "info");
    
    const getRoleIds = (u: any) => {
      if (u.role && typeof u.role === "object" && u.role.id) return [u.role.id];
      if (u.profile?.role && typeof u.profile.role === "object" && u.profile.role.id) return [u.profile.role.id];
      if (u.roleIds && Array.isArray(u.roleIds)) return u.roleIds;
      if (u.profile?.roleIds && Array.isArray(u.profile?.roleIds)) return u.profile.roleIds;
      
      const rolesList = u.roles ?? u.profile?.roles ?? u.userRoles ?? u.profile?.userRoles;
      if (Array.isArray(rolesList)) {
        return rolesList.map((r: any) => typeof r === "object" ? (r.id ?? r.roleId ?? r.role?.id) : r);
      }
      return [];
    };
    
    const mappedRoles = getRoleIds(user);
    const getAccesses = (u: any) => {
      const list = u.corporationAccesses ?? u.profile?.corporationAccesses ?? u.accesses ?? u.profile?.accesses ?? u.userAccesses ?? u.profile?.userAccesses;
      if (Array.isArray(list) && list.length > 0) {
        return list.map((acc: any) => {
          // Extrair a corporationId, suportando objetos aninhados como acc.corporation.id
          let corpId = acc.corporationId;
          if (corpId === undefined || corpId === null) {
            corpId = acc.corporation?.id ?? acc.corporation?.corporationId ?? acc.corporation;
          }
          if (!corpId) {
            corpId = u.corporationId ?? u.profile?.corporationId;
          }
          
          // Extrair a companyId, suportando objetos aninhados como acc.company.id
          let compId = acc.companyId;
          if (compId === undefined || compId === null) {
            compId = acc.company?.id ?? acc.company?.companyId ?? acc.company;
          }
          
          // Extrair a subsidiaryId, suportando objetos aninhados como acc.subsidiary.id
          let subId = acc.subsidiaryId;
          if (subId === undefined || subId === null) {
            subId = acc.subsidiary?.id ?? acc.subsidiary?.subsidiaryId ?? acc.subsidiary;
          }

          return {
            corporationId: corpId && !isNaN(Number(corpId)) ? Number(corpId) : null,
            companyId: compId && !isNaN(Number(compId)) ? Number(compId) : null,
            subsidiaryId: subId && !isNaN(Number(subId)) ? Number(subId) : null
          };
        }).filter((acc: any) => acc.corporationId !== null);
      }
      
      const corpId = u.corporationId ?? u.profile?.corporationId;
      const compId = u.companyId ?? u.profile?.companyId;
      const subId = u.subsidiaryId ?? u.profile?.subsidiaryId;
      if (corpId) {
        return [
          {
            corporationId: Number(corpId),
            companyId: compId ? Number(compId) : null,
            subsidiaryId: subId ? Number(subId) : null
          }
        ];
      }
      return [];
    };
    
    const mappedAccesses = getAccesses(user);

    // 1. Criar o payload para Inativação (PATCH)
    const patchPayload = {
      status: 0,
      isTwoFactorEnabled: user.isTwoFactorEnabled ?? false,
      fullName: userFullName,
      phone: userPhone,
      email: userEmail,
      corporationId: user.corporationId ?? null,
      companyId: user.companyId ?? null,
      subsidiaryId: user.subsidiaryId ?? null,
      roleIds: mappedRoles,
      corporationAccesses: mappedAccesses
    };

    // 2. Criar o payload para Recriação (POST)
    const postPayload = {
      status: 1,
      isTwoFactorEnabled: user.isTwoFactorEnabled ?? false,
      fullName: userFullName,
      username: user.username ?? "",
      document: userDocument,
      phone: userPhone,
      email: userEmail,
      corporationId: user.corporationId ?? null,
      companyId: user.companyId ?? null,
      subsidiaryId: user.subsidiaryId ?? null,
      roleIds: mappedRoles,
      corporationAccesses: mappedAccesses
    };

    // Backup de emergência (em string JSON organizada) para o caso de falha no POST final
    const backupString = JSON.stringify(postPayload, null, 2);
    let isDeleted = false;

    try {
      const userId = user.id;

      // PASSO A: INATIVAR (Se o usuário não estiver inativo com status === 0)
      if (user.status !== 0) {
        addLog("Passo 1/3: Usuário está ativo. Solicitando inativação (PATCH)...", "info");
        await api.fetch(`${CONFIG.BASE_URL}/api-acl/user/${userId}`, {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(patchPayload),
        });
        addLog("Usuário inativado com sucesso.", "ok");
        
        // Aguarda 1.5s para o banco persistir a inativação
        addLog("Aguardando 1.5 segundos para o banco de dados processar o status...", "info");
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } else {
        addLog("Passo 1/3: Usuário já está inativo. Pulando etapa de inativação.", "ok");
      }

      // PASSO B: EXCLUIR (DELETE)
      addLog("Passo 2/3: Deletando cadastro antigo (DELETE)...", "info");
      await api.fetch(`${CONFIG.BASE_URL}/api-acl/user/${userId}`, {
        method: "DELETE",
      });
      isDeleted = true;
      addLog("Cadastro antigo removido com sucesso (e-mail e nome de usuário liberados).", "ok");

      // PASSO C: REAUTENTICAR / RECONECTAR SE NECESSÁRIO (feito por debaixo dos panos pelo ApiService)
      // PASSO D: RECRIAR (POST)
      addLog("Passo 3/3: Criando novo cadastro idêntico e ativo (POST)...", "info");
      const createResponse: any = await api.fetch(`${CONFIG.BASE_URL}/api-acl/user`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(postPayload),
      });

      const newUserId = createResponse?.id ?? "Criado";
      addLog(`Usuário recriado com sucesso! Novo ID gerado: ${newUserId}`, "ok");
      addLog("Clonagem concluída com sucesso absoluto!", "ok");
      
      // Limpa os estados pós-sucesso
      setSelectedUser(null);
      setSearchResults([]);
    } catch (error: any) {
      const innerMessage = error.cause instanceof Error ? error.cause.message : (error.cause ? String(error.cause) : "");
      const fullErrorMsg = innerMessage ? `${error.message} - Motivo: ${innerMessage}` : (error.message || String(error));
      addLog(`FALHA NO PROCESSO: ${fullErrorMsg}`, "err");
      
      if (isDeleted) {
        // Salva o JSON de backup no estado para que a UI exiba-o para resgate
        setBackupJson(backupString);
        addLog("O usuário original foi deletado! Por favor, utilize o JSON abaixo para recuperá-lo manualmente se necessário.", "warn");
      } else {
        addLog("O usuário original NÃO foi excluído pois a falha ocorreu antes da remoção definitiva.", "info");
      }
    } finally {
      setIsCloning(false);
    }
  }, [addLog, clearLogs]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    selectedUser,
    setSelectedUser,
    isSearching,
    isFetchingDetails,
    isCloning,
    backupJson,
    logs,
    searchUsers,
    fetchUserDetails,
    executeClone,
    clearLogs,
  };
}
