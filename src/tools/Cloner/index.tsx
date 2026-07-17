import { useState, useRef, useEffect } from "react";
import {
  Copy,
  Search,
  User,
  ShieldAlert,
  Trash2,
  RefreshCw,
  FileCode2,
  Lock,
} from "lucide-react";
import { useCloner } from "./useCloner";
import { Button } from "../../components/ui/button";
import { Input, Label } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { ManualViewer } from "../../components/ManualViewer";

export default function Cloner() {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    selectedUser,
    isSearching,
    isFetchingDetails,
    isCloning,
    backupJson,
    logs,
    searchUsers,
    fetchUserDetails,
    executeClone,
    clearLogs,
  } = useCloner();

  const getFullName = (u: any) => u.profile?.fullName ?? u.fullName ?? "";
  const getDocument = (u: any) => u.profile?.document ?? u.document ?? "";
  const getPhone = (u: any) => u.profile?.phone ?? u.phone ?? "";
  const getRolesNames = (u: any) => {
    if (u.role && typeof u.role === "object") {
      return [u.role];
    }
    if (u.profile?.role && typeof u.profile.role === "object") {
      return [u.profile.role];
    }
    const rolesList =
      u.roles ?? u.profile?.roles ?? u.userRoles ?? u.profile?.userRoles;
    if (Array.isArray(rolesList)) return rolesList;
    return [];
  };

  const [directId, setDirectId] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  // Fecha o modal ao pressionar Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isConfirmOpen) {
        setIsConfirmOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isConfirmOpen]);

  // Dá foco no botão cancelar para segurança quando o modal abre
  useEffect(() => {
    if (isConfirmOpen) {
      setTimeout(() => {
        cancelBtnRef.current?.focus();
      }, 50);
    }
  }, [isConfirmOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchUsers(searchQuery);
  };

  const handleDirectLoadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directId.trim()) return;
    fetchUserDetails(directId.trim());
  };

  const handleCopyJson = () => {
    if (!backupJson) return;
    navigator.clipboard.writeText(backupJson);
    alert("JSON de backup copiado para a área de transferência!");
  };

  const getLogColorClass = (type: string) => {
    if (type === "err") return "text-destructive font-semibold";
    if (type === "ok")
      return "text-green-600 dark:text-green-500 font-semibold";
    if (type === "warn")
      return "text-amber-600 dark:text-amber-500 font-semibold";
    return "text-muted-foreground";
  };

  return (
    <>
      <ManualViewer
        title="Clonagem e Recriação de Usuários"
        content={
          <div>
            <p style={{ marginBottom: "8px" }}>
              <strong>Objetivo:</strong> Resolver problemas de ACL ou permissões
              corrompidas de um usuário copiando suas configurações, inativando
              e excluindo o cadastro antigo e criando imediatamente um novo
              idêntico e ativo.
            </p>
            <p style={{ marginBottom: "8px" }}>
              <strong>Como utilizar:</strong>
            </p>
            <ol
              style={{
                marginLeft: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <li>
                Pesquise o usuário digitando o nome/e-mail ou insira diretamente
                o <strong>ID do Usuário</strong>.
              </li>
              <li>
                Revise os detalhes carregados no painel para ter certeza de que
                selecionou a conta correta.
              </li>
              <li>
                Clique em <strong>Iniciar Clonagem</strong>.
              </li>
              <li>
                Confirme a ação no modal.{" "}
                <span style={{ color: "var(--red)", fontWeight: 600 }}>
                  CUIDADO:
                </span>{" "}
                O usuário antigo será inativado e excluído do sistema
                permanentemente antes de ser recriado.
              </li>
              <li>
                Acompanhe o log. Caso ocorra erro na etapa final de criação,
                copie o JSON de emergência gerado para poder cadastrá-lo
                manualmente.
              </li>
            </ol>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Painel de Busca */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="bg-muted/10 pb-4">
            <CardTitle className="text-foreground">Buscar Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Opção 1: Pesquisa por texto */}
            <form onSubmit={handleSearchSubmit} className="space-y-2">
              <Label htmlFor="searchQuery">
                Pesquisar por Nome, Username ou E-mail
              </Label>
              <div className="flex gap-2">
                <Input
                  id="searchQuery"
                  placeholder="Ex: Lucas Bernardes"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                  type="submit"
                  disabled={isSearching || isCloning}
                  className="cursor-pointer"
                  aria-label="Pesquisar"
                >
                  {isSearching ? (
                    <RefreshCw className="animate-spin sm:mr-1" size={16} />
                  ) : (
                    <Search className="sm:mr-1" size={16} />
                  )}
                  <span className="hidden sm:inline">Pesquisar</span>
                </Button>
              </div>
            </form>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-border/60"></div>
              <span className="flex-shrink mx-4 text-xs text-muted-foreground uppercase font-semibold">
                Ou
              </span>
              <div className="flex-grow border-t border-border/60"></div>
            </div>

            {/* Opção 2: Carregar ID Direto */}
            <form onSubmit={handleDirectLoadSubmit} className="space-y-2">
              <Label htmlFor="directId">
                Carregar ID do Usuário Diretamente
              </Label>
              <div className="flex gap-2">
                <Input
                  id="directId"
                  placeholder="Ex: 734"
                  type="number"
                  value={directId}
                  onChange={(e) => setDirectId(e.target.value)}
                />
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={isFetchingDetails || isCloning}
                  className="cursor-pointer"
                  aria-label="Carregar"
                >
                  {isFetchingDetails ? (
                    <RefreshCw className="animate-spin sm:mr-1" size={16} />
                  ) : (
                    <User className="sm:mr-1" size={16} />
                  )}
                  <span className="hidden sm:inline">Carregar</span>
                </Button>
              </div>
            </form>

            {/* Lista de Resultados da Busca */}
            {searchResults.length > 0 && (
              <div className="border border-border/40 rounded-lg overflow-hidden max-h-[220px] overflow-y-auto">
                <table className="w-full text-sm text-left font-sans">
                  <thead className="bg-muted/30 text-xs text-muted-foreground border-b border-border/40 uppercase">
                    <tr>
                      <th className="px-4 py-2">ID</th>
                      <th className="px-4 py-2">Nome / Username</th>
                      <th className="px-4 py-2">E-mail</th>
                      <th className="px-4 py-2 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {searchResults.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/10">
                        <td className="px-4 py-2 font-mono text-xs">{u.id}</td>
                        <td className="px-4 py-2">
                          <div className="font-semibold text-foreground">
                            {getFullName(u)}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {u.username}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-xs text-muted-foreground max-w-[150px] truncate">
                          {u.email}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => fetchUserDetails(u.id)}
                            disabled={isFetchingDetails || isCloning}
                            className="h-8 text-xs cursor-pointer"
                          >
                            Selecionar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detalhes do Usuário Selecionado */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="bg-muted/10 pb-4">
            <CardTitle className="text-foreground">
              Dados do Usuário Selecionado
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {selectedUser ? (
              <div className="space-y-4 font-sans">
                <div className="flex justify-between items-start border-b border-border/40 pb-3">
                  <div>
                    <h4 className="text-lg font-bold text-foreground">
                      {getFullName(selectedUser)}
                    </h4>
                    <p className="text-xs text-muted-foreground font-mono">
                      Username: {selectedUser.username} | ID: {selectedUser.id}
                    </p>
                  </div>
                  <Badge
                    variant={selectedUser.status === 1 ? "success" : "warning"}
                  >
                    {selectedUser.status === 1 ? "Ativo" : "Inativo"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      E-mail
                    </span>
                    <span className="font-medium text-foreground break-all">
                      {selectedUser.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Documento (CPF/CNPJ)
                    </span>
                    <span className="font-medium font-mono text-foreground">
                      {getDocument(selectedUser) || "Não cadastrado"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Telefone
                    </span>
                    <span className="font-medium text-foreground">
                      {getPhone(selectedUser) || "Não cadastrado"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Duplo Fator (2FA)
                    </span>
                    <span className="font-medium text-foreground">
                      {selectedUser.isTwoFactorEnabled
                        ? "Ativado"
                        : "Desativado"}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border/40 pt-3">
                  <span className="text-xs text-muted-foreground block mb-1">
                    Estrutura MDM
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      Corp ID: {selectedUser.corporationId ?? "N/A"}
                    </Badge>
                    <Badge variant="secondary">
                      Empresa ID: {selectedUser.companyId ?? "N/A"}
                    </Badge>
                    <Badge variant="secondary">
                      Filial ID: {selectedUser.subsidiaryId ?? "N/A"}
                    </Badge>
                  </div>
                </div>

                 <div className="border-t border-border/40 pt-3">
                  <span className="text-xs text-muted-foreground block mb-1">
                    Cargos / Perfis Associados
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {getRolesNames(selectedUser).length > 0 ? (
                      getRolesNames(selectedUser).map((r: any) => (
                        <Badge
                          key={r.id || r}
                          variant="outline"
                          className="font-mono text-xs"
                        >
                          {r.name ?? r.role?.name ?? `Role ${r.id ?? r}`}
                        </Badge>
                      ))
                    ) : selectedUser.roleIds &&
                      selectedUser.roleIds.length > 0 ? (
                      selectedUser.roleIds.map((rId: any) => (
                        <Badge
                          key={rId}
                          variant="outline"
                          className="font-mono text-xs"
                        >
                          ID Cargo: {rId}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Nenhum cargo associado
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t border-border/40 pt-4 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowRawJson(!showRawJson)}
                      className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                      type="button"
                    >
                      {showRawJson
                        ? "Ocultar JSON Bruto"
                        : "Inspecionar JSON Bruto"}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setIsConfirmOpen(true)}
                      disabled={isCloning}
                      className="w-full sm:w-auto font-semibold cursor-pointer"
                      aria-label="Iniciar Clonagem"
                    >
                      <Copy size={16} className="sm:mr-2" />
                      <span className="hidden sm:inline">Iniciar Clonagem</span>
                    </Button>
                  </div>
                  {showRawJson && (
                    <pre className="p-3 bg-muted/20 border border-border/40 rounded-lg text-xs font-mono overflow-x-auto max-h-[200px] text-foreground">
                      {JSON.stringify(selectedUser, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-[250px] flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed border-border/40 rounded-lg p-6">
                <User size={32} className="opacity-40 mb-3" />
                <p className="font-semibold text-sm">
                  Nenhum usuário carregado
                </p>
                <p className="text-xs max-w-xs mt-1">
                  Pesquise acima por nome/e-mail ou informe o ID para carregar
                  as permissões e dados.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Painel de Recuperação de Emergência (Backup JSON) */}
      {backupJson && (
        <Card className="border-destructive/40 bg-destructive/5 shadow-md mb-6 animate-in fade-in duration-200">
          <CardHeader className="bg-destructive/10 pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-destructive flex items-center gap-2">
              <ShieldAlert size={18} />
              Backup de Emergência (Falha na Recriação)
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyJson}
              className="h-8 border-destructive/20 text-destructive hover:bg-destructive/10 cursor-pointer"
            >
              <FileCode2 size={13} className="mr-1.5" /> Copiar JSON
            </Button>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="text-sm text-destructive font-medium leading-relaxed">
              <strong>ATENÇÃO:</strong> O usuário original foi excluído, mas
              houve um erro ao recriá-lo automaticamente. Copie o JSON abaixo
              com todas as permissões e e-mail e utilize a tela de criação
              manual do sistema para restabelecer a conta.
            </div>
            <pre className="p-4 bg-background border border-border/60 rounded-lg text-xs font-mono overflow-x-auto max-h-[180px] text-foreground">
              {backupJson}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Painel de Logs */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="bg-muted/10 pb-4 border-b border-border/40 flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">
            Log do Processo de Clonagem
          </CardTitle>
          {logs.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearLogs}
              className="h-8 px-2.5 text-muted-foreground hover:text-foreground hover:bg-muted font-sans cursor-pointer"
            >
              <Trash2 size={13} className="mr-1.5" /> Limpar Logs
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[220px] overflow-y-auto bg-muted/5 p-4 font-mono text-xs">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`mb-1.5 pb-1.5 border-b border-border/40 last:border-0 last:mb-0 last:pb-0 ${getLogColorClass(log.type)}`}
                >
                  <span className="opacity-70 mr-2">[{log.time}]</span>
                  <span>{log.message}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground italic">
                Nenhum evento registrado.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Confirmação Crítica */}
      {isConfirmOpen && selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clone-modal-title"
          aria-describedby="clone-modal-desc"
        >
          <div className="bg-card text-card-foreground border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden scale-in duration-200">
            <div className="p-6">
              <h3
                id="clone-modal-title"
                className="text-lg font-bold text-foreground mb-2 flex items-center gap-2"
              >
                <span className="p-1.5 bg-destructive/10 text-destructive rounded-lg">
                  <ShieldAlert size={18} />
                </span>
                Confirmar Clonagem de Usuário
              </h3>
              <p
                id="clone-modal-desc"
                className="text-sm text-muted-foreground mb-4"
              >
                Você está prestes a clonar a conta de{" "}
                <strong>{selectedUser.fullName}</strong> (
                {selectedUser.username}).
              </p>

              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3.5 mb-6 text-xs text-destructive font-medium leading-relaxed space-y-2">
                <p className="font-semibold flex items-center gap-1.5">
                  <Lock size={13} />
                  Entenda os passos destrutivos:
                </p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Inativar o cadastro atual (PATCH status = 0).</li>
                  <li>
                    <strong>Excluir permanentemente</strong> o cadastro atual.
                  </li>
                  <li>
                    Criar um novo cadastro limpo e ativo com as mesmas
                    permissões.
                  </li>
                </ol>
                <p className="text-xs font-semibold text-destructive/80 mt-2">
                  Essa operação não pode ser desfeita. Deseja prosseguir?
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  ref={cancelBtnRef}
                  variant="secondary"
                  onClick={() => setIsConfirmOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsConfirmOpen(false);
                    executeClone(selectedUser);
                  }}
                  className="font-semibold"
                >
                  Sim, Clonar Usuário
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
