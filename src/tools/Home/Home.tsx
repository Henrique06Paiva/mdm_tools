import { useState, useMemo } from "react";
import {
  Smartphone,
  Package,
  Trash2,
  RefreshCw,
  List,
  UserCheck,
  History as HistoryIcon,
  HelpCircle,
  AlertCircle,
  Bug,
  ListFilter,
  Search,
  ArrowUpRight,
  Shield,
  Activity,
  X,
  PlusCircle,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { CONFIG } from "../../api";

export type ToolTabType =
  | "home"
  | "checker"
  | "deleter"
  | "apk"
  | "forcer"
  | "fetcher"
  | "cloner"
  | "history"
  | "incidents"
  | "incidents_list"
  | "bugs_hub"
  | "bugs_list";

interface HomeProps {
  username: string | null;
  onNavigate: (tab: ToolTabType) => void;
  onStartTour: () => void;
  isRootUser?: boolean;
}

interface ToolDefinition {
  id: ToolTabType;
  title: string;
  category: "support" | "automation";
  tag: string;
  description: string;
  icon: React.ElementType;
  shortcut?: string;
  service: string;
}

export default function Home({
  username,
  onNavigate,
  onStartTour,
  isRootUser = false,
}: HomeProps) {
  const [search, setSearch] = useState("");

  const allTools: ToolDefinition[] = [
    // Chamados e Incidentes
    {
      id: "incidents",
      title: "Novo Chamado",
      category: "support",
      tag: "Registro",
      service: "Supabase / N1-N3",
      description:
        "Abertura padronizada com validação de campos, evidências e vínculo a bugs.",
      icon: AlertCircle,
      shortcut: "Alt+1",
    },
    {
      id: "incidents_list",
      title: "Lista de Chamados",
      category: "support",
      tag: "Triagem",
      service: "Supabase / N1-N3",
      description:
        "Consulta consolidada com filtros rápidos por corporação, Prioridade e status.",
      icon: ListFilter,
      shortcut: "Alt+2",
    },
    {
      id: "bugs_hub",
      title: "Cadastrar Bug",
      category: "support",
      tag: "Registro",
      service: "Base de Conhecimento",
      description:
        "Cadastro de falhas sistêmicas com código automático e instruções de contorno.",
      icon: PlusCircle,
      shortcut: "Alt+3",
    },
    {
      id: "bugs_list",
      title: "Lista de Bugs Conhecidos",
      category: "support",
      tag: "Catálogo",
      service: "Base de Conhecimento",
      description:
        "Consulta, edição de causas-raiz, acompanhamento e exportação para Excel (.xlsx).",
      icon: Bug,
      shortcut: "Alt+4",
    },
    // Automações MDM
    {
      id: "checker",
      title: "Inspecionar Versões",
      category: "automation",
      tag: "Auditoria",
      service: "api-eqp & api-report",
      description:
        "Comparação em lote de versões de apps instalados, firmware e telemetria.",
      icon: Smartphone,
    },
    {
      id: "apk",
      title: "Busca de APKs",
      category: "automation",
      tag: "Repositório",
      service: "api-application",
      description:
        "Localização de versões cadastradas e geração de links diretos para download.",
      icon: Package,
    },
    {
      id: "deleter",
      title: "Deleção em Massa",
      category: "automation",
      tag: "Batch .xlsx",
      service: "api-eqp",
      description:
        "Inativação e remoção permanente de terminais por planilha ou lista de seriais.",
      icon: Trash2,
    },
    {
      id: "forcer",
      title: "Force Data em Massa",
      category: "automation",
      tag: "Sincronização",
      service: "api-eqp (Force)",
      description:
        "Envio de comandos em lote para forçar sincronização imediata dos aparelhos.",
      icon: RefreshCw,
    },
    {
      id: "fetcher",
      title: "Exportador de Terminais",
      category: "automation",
      tag: "Relatório .xlsx",
      service: "api-report",
      description:
        "Extração estruturada de todo o parque da corporação para arquivo Excel.",
      icon: List,
    },
    {
      id: "cloner",
      title: "Clonar Usuário",
      category: "automation",
      tag: "Gestão ACL",
      service: "api-acl",
      description:
        "Duplicação e recriação de perfis de acesso para resolução de permissões.",
      icon: UserCheck,
    },
    {
      id: "history",
      title: "Histórico & Auditoria",
      category: "automation",
      tag: "Logs & Trilha",
      service: "Supabase Logs",
      description:
        "Rastreabilidade de execuções em lote e consulta de ações executadas.",
      icon: HistoryIcon,
    },
  ];

  // Filtra por permissão (root) e por busca de texto
  const filteredTools = useMemo(() => {
    return allTools.filter((tool) => {
      if (tool.category === "support" && !isRootUser) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        tool.title.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.tag.toLowerCase().includes(q) ||
        tool.service.toLowerCase().includes(q)
      );
    });
  }, [allTools, isRootUser, search]);

  const supportGroup = filteredTools.filter((t) => t.category === "support");
  const automationGroup = filteredTools.filter(
    (t) => t.category === "automation",
  );

  return (
    <div className="space-y-6">
      {/* Barra Superior Minimalista de Status e Sessão */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground font-mono">
              Central Operacional
            </h1>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Gateway Ativo</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-mono">
            <span>
              tenant:{" "}
              <strong className="text-foreground font-medium">
                {CONFIG.TENANT}
              </strong>
            </span>
            <span>•</span>
            <span>
              operador:{" "}
              <strong className="text-foreground font-medium">
                {username || "anônimo"}
              </strong>
            </span>
            {isRootUser && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                  <Shield size={10} />
                  Root
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <Button
            onClick={onStartTour}
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer border border-border/50"
          >
            <HelpCircle size={13} />
            Guia Rápido
          </Button>
        </div>
      </div>

      {/* Campo de Busca Rápida (Estilo Command Palette) */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar ferramenta por nome, serviço ou palavra-chave..."
          className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm rounded-xl bg-card border border-border/70 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Lista de Ferramentas Estruturada */}
      {filteredTools.length === 0 ? (
        <div className="py-12 text-center bg-card rounded-xl border border-border/40">
          <p className="text-xs sm:text-sm text-muted-foreground font-mono">
            Nenhuma ferramenta encontrada para "{search}".
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearch("")}
            className="mt-3 text-xs cursor-pointer text-primary"
          >
            Limpar busca
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Seção Suporte & Incidentes */}
          {supportGroup.length > 0 && isRootUser && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Suporte & Incidentes
                </span>
                <span className="text-[10px] font-mono text-muted-foreground/60">
                  {supportGroup.length} módulos
                </span>
              </div>

              <div className="bg-card rounded-xl border border-border/60 divide-y divide-border/30 overflow-hidden shadow-2xs">
                {supportGroup.map((tool) => (
                  <ToolRow key={tool.id} tool={tool} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          )}

          {/* Seção Automações MDM */}
          {automationGroup.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Automações & Diagnóstico em Massa
                </span>
                <span className="text-[10px] font-mono text-muted-foreground/60">
                  {automationGroup.length} ferramentas
                </span>
              </div>

              <div className="bg-card rounded-xl border border-border/60 divide-y divide-border/30 overflow-hidden shadow-2xs">
                {automationGroup.map((tool) => (
                  <ToolRow key={tool.id} tool={tool} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Micro-rodapé Técnico */}
      <div className="pt-4 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-muted-foreground/70">
        <div className="flex items-center gap-1.5">
          <Activity size={12} className="text-primary/70" />
          <span>
            Microserviços: api-eqp · api-report · api-application · api-acl ·
            supabase
          </span>
        </div>
        <div>
          <span>MDM Support Hub v1.6</span>
        </div>
      </div>
    </div>
  );
}

// Linha de Ferramenta Minimalista e Direta
function ToolRow({
  tool,
  onNavigate,
}: {
  tool: ToolDefinition;
  onNavigate: (tab: ToolTabType) => void;
}) {
  const Icon = tool.icon;

  return (
    <div
      onClick={() => onNavigate(tool.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onNavigate(tool.id);
        }
      }}
      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:px-4 sm:py-3 hover:bg-muted/30 cursor-pointer transition-colors"
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        <div className="text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5 sm:mt-0">
          <Icon size={16} />
        </div>

        <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {tool.title}
            </span>
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-muted/70 text-muted-foreground border border-border/40">
              {tool.tag}
            </span>
          </div>

          <span className="hidden lg:inline text-xs text-muted-foreground truncate flex-1">
            {tool.description}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 self-stretch sm:self-center pl-7 sm:pl-0">
        <span className="text-[11px] font-mono text-muted-foreground/60">
          {tool.service}
        </span>
        <ArrowUpRight
          size={14}
          className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
        />
      </div>
    </div>
  );
}
