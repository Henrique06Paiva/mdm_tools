import { useState, useMemo } from "react";
import { releaseNotesData, type ChangeType } from "../data/releaseNotes";
import { Search } from "lucide-react";

// Mapa de tipo → cor e label
const TYPE_META: Record<ChangeType, { dot: string; label: string }> = {
  feat:        { dot: "bg-emerald-500",  label: "feat"     },
  fix:         { dot: "bg-amber-500",    label: "fix"      },
  improvement: { dot: "bg-blue-400",     label: "melhoria" },
};

const ChangeRow = ({ type, description }: { type: ChangeType; description: string }) => {
  const meta = TYPE_META[type];
  return (
    <li className="flex items-baseline gap-2.5 text-sm text-foreground/80 leading-snug">
      <span className={`mt-[6px] w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
      <span>
        <span className="text-[11px] font-mono font-medium text-muted-foreground mr-1.5 uppercase tracking-wide">
          {meta.label}
        </span>
        {description}
      </span>
    </li>
  );
};

interface ReleaseNotesProps {
  limit?: number;
  showTitle?: boolean;
}

export default function ReleaseNotes({ limit, showTitle = true }: ReleaseNotesProps) {
  const [selectedFilter, setSelectedFilter] = useState<"all" | ChangeType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCollapse = (version: string) =>
    setCollapsed((prev) => ({ ...prev, [version]: !prev[version] }));

  const filteredNotes = useMemo(() => {
    let result = releaseNotesData;

    if (selectedFilter !== "all") {
      result = result
        .map((n) => ({ ...n, changes: n.changes.filter((c) => c.type === selectedFilter) }))
        .filter((n) => n.changes.length > 0);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.version.toLowerCase().includes(q) ||
          n.title.toLowerCase().includes(q) ||
          (n.summary && n.summary.toLowerCase().includes(q)) ||
          n.changes.some((c) => c.description.toLowerCase().includes(q))
      );
    }

    return limit ? result.slice(0, limit) : result;
  }, [selectedFilter, searchQuery, limit]);

  const filters: { key: "all" | ChangeType; label: string }[] = [
    { key: "all",         label: "Todas"     },
    { key: "feat",        label: "Features"  },
    { key: "fix",         label: "Correções" },
    { key: "improvement", label: "Melhorias" },
  ];

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      {showTitle && (
        <div className="pb-4 border-b border-border/40">
          <h2 className="text-base font-semibold text-foreground">Changelog</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Histórico de versões, correções e funcionalidades.
          </p>
        </div>
      )}

      {/* Toolbar: filtros + busca */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filtros como texto */}
        <div className="flex items-center gap-4">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSelectedFilter(key)}
              className={`text-xs font-medium transition-colors cursor-pointer pb-0.5 ${
                selectedFilter === key
                  ? "text-foreground border-b border-foreground"
                  : "text-muted-foreground hover:text-foreground/80"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Busca */}
        {!limit && (
          <div className="relative sm:w-56">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg bg-muted/40 border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>
        )}
      </div>

      {/* Lista */}
      {filteredNotes.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          Nenhum resultado encontrado.
        </p>
      ) : (
        <div className="space-y-0 divide-y divide-border/30">
          {filteredNotes.map((note) => {
            const isOpen = collapsed[note.version] !== true;
            return (
              <div key={note.version} className="py-5 first:pt-0">
                {/* Linha de metadados */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-semibold text-primary">
                      {note.version}
                    </span>
                    {note.isLatest && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                        atual
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground">{note.date}</span>
                  </div>

                  <button
                    onClick={() => toggleCollapse(note.version)}
                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {isOpen ? "ocultar" : `ver ${note.changes.length}`}
                  </button>
                </div>

                {/* Título */}
                <h3 className="text-sm font-semibold text-foreground mb-1">{note.title}</h3>

                {/* Resumo */}
                {note.summary && !isOpen && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{note.summary}</p>
                )}

                {/* Itens expandidos */}
                {isOpen && (
                  <ul className="mt-3 space-y-2">
                    {note.changes.map((change, idx) => (
                      <ChangeRow key={idx} type={change.type} description={change.description} />
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
