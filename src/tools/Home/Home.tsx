import {
  Smartphone,
  Package,
  Trash2,
  RefreshCw,
  List,
  UserCheck,
  History as HistoryIcon,
  ArrowRight,
  HelpCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import ReleaseNotes from "../../components/ReleaseNotes";

export type ToolTabType =
  | "home"
  | "checker"
  | "deleter"
  | "apk"
  | "forcer"
  | "fetcher"
  | "cloner"
  | "history"
  | "incidents";

interface HomeProps {
  username: string | null;
  onNavigate: (tab: ToolTabType) => void;
  onStartTour: () => void;
  isRootUser?: boolean;
}

interface ToolItem {
  id: ToolTabType;
  title: string;
  description: string;
  icon: React.ElementType;
}

function ToolCard({
  tool,
  onNavigate,
}: {
  tool: ToolItem;
  onNavigate: (tab: ToolTabType) => void;
}) {
  const Icon = tool.icon;

  return (
    <div
      onClick={() => onNavigate(tool.id)}
      className="group relative rounded-xl border border-border/50 bg-card p-4.5 cursor-pointer transition-all duration-150 hover:border-primary/50 hover:bg-muted/10 hover:shadow-xs flex flex-col justify-between"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Icon size={18} />
        </div>
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
              {tool.title}
            </h3>
            <ArrowRight
              size={14}
              className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0"
            />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {tool.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home({
  username,
  onNavigate,
  onStartTour,
  isRootUser = false,
}: HomeProps) {
  const supportTools: ToolItem[] = [
    {
      id: "incidents",
      title: "Gestao de Chamados",
      description:
        "Abertura padronizada de chamados operacionais e vinculacao a falhas sistemicas.",
      icon: AlertCircle,
    },
  ];

  const automationTools: ToolItem[] = [
    {
      id: "checker",
      title: "Inspecionar Versoes",
      description:
        "Consulta e comparacao de versoes de aplicativos e status de conexao em lote.",
      icon: Smartphone,
    },
    {
      id: "apk",
      title: "Busca de APKs",
      description:
        "Localizacao de versoes de aplicativos cadastradas com links diretos de download.",
      icon: Package,
    },
    {
      id: "deleter",
      title: "Delecao em Massa",
      description:
        "Inativacao e remocao permanente de terminais a partir de lista de seriais.",
      icon: Trash2,
    },
    {
      id: "forcer",
      title: "Force Data em Massa",
      description:
        "Envio de comandos em lote para forcar atualizacao imediata dos dispositivos.",
      icon: RefreshCw,
    },
    {
      id: "fetcher",
      title: "Exportador de Terminais",
      description:
        "Extracao estruturada e exportacao para planilha de todos os terminais por corporacao.",
      icon: List,
    },
    {
      id: "cloner",
      title: "Clonar Usuario",
      description:
        "Recriacao limpa de contas de usuario para resolucao de falhas de permissoes.",
      icon: UserCheck,
    },
    {
      id: "history",
      title: "Historico e Auditoria",
      description:
        "Rastreabilidade completa de todas as execucoes e acoes realizadas no sistema.",
      icon: HistoryIcon,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Direto */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Central de Ferramentas
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {username ? `Conectado como ${username}` : "Painel operacional MDM"} {isRootUser && "• Perfil Root"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onStartTour}
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 cursor-pointer"
          >
            <HelpCircle size={13} />
            Tour do Sistema
          </Button>
          <a href="#release-notes">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <FileText size={13} />
              Notas de Versao
            </Button>
          </a>
        </div>
      </div>

      {/* Seção Chamados (Root) */}
      {isRootUser && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Modulo de Chamados
            </h2>
            <span className="text-[9px] font-bold uppercase bg-primary/10 text-primary px-1.5 py-px rounded border border-primary/20">
              Root
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {supportTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}

      {/* Seção Automações */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Automacoes e Utilitarios MDM
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {automationTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onNavigate={onNavigate} />
          ))}
        </div>
      </div>

      {/* Release Notes */}
      <section id="release-notes" className="pt-4 border-t border-border/40">
        <ReleaseNotes />
      </section>
    </div>
  );
}
