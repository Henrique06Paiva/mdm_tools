import React, { useState, useMemo } from "react";
import {
  releaseNotesData,
  type ReleaseNote,
  type ChangeType,
} from "../data/releaseNotes";
import {
  Sparkles,
  Bug,
  Zap,
  Tag,
  Calendar,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "./ui/button";

const ChangeTypeBadge = ({ type }: { type: ChangeType }) => {
  switch (type) {
    case "feat":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
          <Sparkles size={11} />
          Feat
        </span>
      );
    case "fix":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
          <Bug size={11} />
          Fix
        </span>
      );
    case "improvement":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 shrink-0">
          <Zap size={11} />
          Melhoria
        </span>
      );
    default:
      return null;
  }
};

interface ReleaseNotesProps {
  limit?: number;
  showTitle?: boolean;
}

export default function ReleaseNotes({
  limit,
  showTitle = true,
}: ReleaseNotesProps) {
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "feat" | "fix" | "improvement"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedVersions, setExpandedVersions] = useState<Record<string, boolean>>({
    "v1.4.0": true,
  });

  const toggleExpand = (version: string) => {
    setExpandedVersions((prev) => ({
      ...prev,
      [version]: !prev[version],
    }));
  };

  const filteredNotes = useMemo(() => {
    let result = releaseNotesData;

    // Filter by type if not 'all'
    if (selectedFilter !== "all") {
      result = result
        .map((note) => ({
          ...note,
          changes: note.changes.filter((c) => c.type === selectedFilter),
        }))
        .filter((note) => note.changes.length > 0);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (note) =>
          note.version.toLowerCase().includes(q) ||
          note.title.toLowerCase().includes(q) ||
          (note.summary && note.summary.toLowerCase().includes(q)) ||
          note.changes.some((c) => c.description.toLowerCase().includes(q))
      );
    }

    if (limit) {
      return result.slice(0, limit);
    }

    return result;
  }, [selectedFilter, searchQuery, limit]);

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Tag size={20} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Release Notes & Novidades
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Acompanhe o histórico de lançamentos, novas funcionalidades, correções e melhorias do MDM Hub.
            </p>
          </div>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-xl border border-border/40 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              selectedFilter === "all"
                ? "bg-card text-foreground shadow-sm border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setSelectedFilter("feat")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              selectedFilter === "feat"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles size={13} />
            Features
          </button>
          <button
            onClick={() => setSelectedFilter("fix")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              selectedFilter === "fix"
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bug size={13} />
            Correções
          </button>
          <button
            onClick={() => setSelectedFilter("improvement")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              selectedFilter === "improvement"
                ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Zap size={13} />
            Melhorias
          </button>
        </div>

        {/* Search */}
        {!limit && (
          <div className="relative min-w-[200px] sm:w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Buscar nas notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-card border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        )}
      </div>

      {/* Release Notes List */}
      {filteredNotes.length === 0 ? (
        <div className="p-8 text-center bg-card rounded-2xl border border-border/40">
          <p className="text-sm text-muted-foreground">
            Nenhuma nota de atualização encontrada para os filtros aplicados.
          </p>
        </div>
      ) : (
        <div className="relative space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-border/60">
          {filteredNotes.map((note) => {
            const isExpanded = expandedVersions[note.version] ?? note.isLatest ?? false;
            return (
              <div
                key={note.version}
                className={`relative pl-8 sm:pl-10 transition-all ${
                  note.isLatest ? "scale-[1.01]" : ""
                }`}
              >
                {/* Timeline Dot */}
                <div
                  className={`absolute left-0 top-3 -translate-x-[2px] w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    note.isLatest
                      ? "bg-primary border-background text-primary-foreground shadow-md shadow-primary/30"
                      : "bg-card border-border/80 text-muted-foreground"
                  }`}
                >
                  <Tag size={10} />
                </div>

                {/* Card Container */}
                <div
                  className={`rounded-2xl border transition-all ${
                    note.isLatest
                      ? "bg-card border-primary/40 shadow-sm"
                      : "bg-card/70 border-border/40 hover:border-border/80"
                  }`}
                >
                  {/* Card Header */}
                  <div
                    onClick={() => toggleExpand(note.version)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-muted/10 transition-colors rounded-2xl"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-sm sm:text-base text-primary">
                          {note.version}
                        </span>
                        {note.isLatest && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                            Mais Recente
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                          <Calendar size={12} />
                          {note.date}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-foreground">
                        {note.title}
                      </h3>
                      {note.summary && (
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                          {note.summary}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-muted-foreground hover:text-foreground"
                      >
                        {isExpanded ? (
                          <>
                            Ocultar <ChevronUp size={14} className="ml-1" />
                          </>
                        ) : (
                          <>
                            Ver detalhes ({note.changes.length}){" "}
                            <ChevronDown size={14} className="ml-1" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Card Body - Changes list */}
                  {isExpanded && (
                    <div className="px-4 pb-5 pt-0 sm:px-5 border-t border-border/30 mt-1">
                      <div className="pt-4 space-y-2.5">
                        {note.changes.map((change, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90 bg-muted/20 p-2.5 rounded-xl border border-border/20"
                          >
                            <ChangeTypeBadge type={change.type} />
                            <span className="leading-relaxed flex-1">
                              {change.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
