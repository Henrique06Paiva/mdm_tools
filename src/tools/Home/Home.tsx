import {
  Smartphone,
  Package,
  Trash2,
  RefreshCw,
  List,
  UserCheck,
  History as HistoryIcon,
  ArrowRight,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  FileSpreadsheet,
  Zap,
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
  | "history";

interface HomeProps {
  username: string | null;
  onNavigate: (tab: ToolTabType) => void;
  onStartTour: () => void;
}

export default function Home({ username, onNavigate, onStartTour }: HomeProps) {
  // Determine time-based greeting in Portuguese
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Bom dia";
    if (hour >= 12 && hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const tools = [
    {
      id: "checker" as ToolTabType,
      title: "Inspecionar Versões",
      shortName: "Versões",
      icon: Smartphone,
      category: "Diagnóstico & Conformidade",
      description:
        "Valide e compare em tempo real as versões de firmware, pacotes e do agente instaladas nos dispositivos da corporação.",
      tags: ["Firmware", "Agente", "Comparador"],
      color:
        "from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-500",
    },
    {
      id: "apk" as ToolTabType,
      title: "Busca de APKs",
      shortName: "Busca APKs",
      icon: Package,
      category: "Instaladores & Pacotes",
      description:
        "Localize e baixe diretamente os arquivos de instalação (.apk) cadastrados nas corporações cadastradas no MDM.",
      tags: ["Downloads", "MDM", "Package Name"],
      color:
        "from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-500",
    },
    {
      id: "deleter" as ToolTabType,
      title: "Deleção em Massa",
      shortName: "Deleção em Lote",
      icon: Trash2,
      category: "Gestão & Limpeza",
      description:
        "Remova múltiplos terminais inativos, duplicados ou obsoletos importando planilhas Excel (.xlsx) com acompanhamento em tempo real.",
      tags: ["Lote", "Excel", "Limpeza"],
      color:
        "from-rose-500/10 to-orange-500/10 border-rose-500/20 text-rose-500",
    },
    {
      id: "forcer" as ToolTabType,
      title: "Force Data em Massa",
      shortName: "Force Data",
      icon: RefreshCw,
      category: "Sincronização & Comandos",
      description:
        "Envie comandos em lote para forçar a atualização imediata dos dados dos dispositivos cadastrados com o servidor.",
      tags: ["Sincronia", "Comandos", "Painel"],
      color:
        "from-amber-500/10 to-yellow-500/10 border-amber-500/20 text-amber-500",
    },
    {
      id: "fetcher" as ToolTabType,
      title: "Exportador de Terminais",
      shortName: "Exportador",
      icon: List,
      category: "Relatórios & Planilhas",
      description:
        "Gere relatórios completos de terminais registrados por corporação ou empresa e exporte dados estruturados em Excel (.xlsx).",
      tags: ["Relatórios", "Exportar", "Excel"],
      color:
        "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-500",
    },
    {
      id: "cloner" as ToolTabType,
      title: "Clonar Usuário",
      shortName: "Clonagem",
      icon: UserCheck,
      category: "Permissões & Acessos",
      description:
        "Duplique perfis de acesso, visibilidade e permissões entre contas de usuários de forma automatizada e rápida.",
      tags: ["Usuários", "Permissões", "Automação"],
      color: "from-cyan-500/10 to-blue-500/10 border-cyan-500/20 text-cyan-500",
    },
    {
      id: "history" as ToolTabType,
      title: "Histórico & Auditoria",
      shortName: "Auditoria",
      icon: HistoryIcon,
      category: "Rastreabilidade & Logs",
      description:
        "Consulte o histórico detalhado de operações executadas na plataforma com filtros avançados e logs de auditoria.",
      tags: ["Auditoria", "Logs", "Rastreabilidade"],
      color:
        "from-slate-500/10 to-gray-500/10 border-slate-500/20 text-slate-500",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Hero Welcome Banner */}
      <section className="rounded-2xl bg-card border border-border/40 p-6 sm:p-8">
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
            <Sparkles size={14} />
            <span>Plataforma Unificada MDM Hub</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {getGreeting()}
            {username ? `, ${username}!` : "!"}
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Bem-vindo ao seu portal de utilitários para diagnóstico,
            gerenciamento em massa, relatórios e auditoria de dispositivos MDM.
            Selecione uma ferramenta abaixo para começar.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={onStartTour}
              variant="outline"
              className="rounded-xl gap-2 cursor-pointer border-border/60 hover:bg-muted"
            >
              <HelpCircle size={16} />
              Iniciar Tour Guiado
            </Button>
            <a href="#release-notes">
              <Button
                variant="ghost"
                className="rounded-xl gap-2 cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <Sparkles size={16} className="text-primary" />
                Ver Lançamentos & Release Notes
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Quick Overview Highlights */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border/40 flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">
              7 Ferramentas Ativas
            </div>
            <div className="text-xs text-muted-foreground">
              Diagnósticos e ações em lote
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/40 flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">
              Suporte a Excel (.xlsx)
            </div>
            <div className="text-xs text-muted-foreground">
              Importação e exportação ágil
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/40 flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
            <Zap size={22} />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">
              Logs em Tempo Real
            </div>
            <div className="text-xs text-muted-foreground">
              Acompanhamento e auditoria
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section Grid (Caminhos para Ferramentas) */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Ferramentas Disponíveis
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Acesse rapidamente os utilitários de gerenciamento e automação do
              MDM Hub.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={() => onNavigate(tool.id)}
                className="group relative rounded-2xl border border-border/50 bg-card p-5 sm:p-6 transition-all duration-200 hover:border-primary/50 hover:shadow-md hover:scale-[1.01] cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-2xl bg-gradient-to-br border ${tool.color}`}
                      >
                        <Icon size={22} />
                      </div>
                      <div>
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                          {tool.category}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                          {tool.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="pt-4 mt-2 border-t border-border/30 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {tool.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform shrink-0">
                    Acessar
                    <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Release Notes Section */}
      <section id="release-notes" className="pt-6 border-t border-border/40">
        <ReleaseNotes />
      </section>
    </div>
  );
}
