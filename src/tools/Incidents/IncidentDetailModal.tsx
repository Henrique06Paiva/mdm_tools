import React from "react";
import type { BugIncident } from "../../types/incidents";
import type { KnownBug } from "../../types/bugs";
import { X, Calendar, Building, User, AlertTriangle, Image as ImageIcon, Link as LinkIcon, Smartphone } from "lucide-react";

interface IncidentDetailModalProps {
  incident: BugIncident | null;
  knownBugs: KnownBug[];
  onClose: () => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  knownBugs,
  onClose,
}) => {
  if (!incident) return null;

  const linkedBug = knownBugs.find((b) => b.id === incident.bug_id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground border border-border/40 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/40 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono font-bold text-xs bg-primary/15 text-primary px-2.5 py-1 rounded-md border border-primary/20">
                {incident.ticket_number}
              </span>
              <span className="text-xs font-medium bg-muted px-2.5 py-1 rounded-md text-muted-foreground">
                {incident.environment}
              </span>
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {incident.title || "Chamado Sem Título"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Metadados Básicos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/20 p-4 rounded-xl border border-border/30 text-xs">
          <div className="flex items-center gap-2">
            <Building size={16} className="text-primary shrink-0" />
            <div>
              <span className="text-muted-foreground block">Corporação / Cliente</span>
              <span className="font-semibold text-foreground">{incident.corporation_name}</span>
              <span className="text-[10px] text-muted-foreground block font-mono">ID: {incident.corporation_id}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <User size={16} className="text-primary shrink-0" />
            <div>
              <span className="text-muted-foreground block">Solicitante</span>
              <span className="font-semibold text-foreground">{incident.reporter_contact || "Não informado"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-primary shrink-0" />
            <div>
              <span className="text-muted-foreground block">Data do Report</span>
              <span className="font-semibold text-foreground">
                {new Date(incident.reported_at).toLocaleString("pt-BR")}
              </span>
            </div>
          </div>
        </div>

        {/* Bug Vinculado */}
        {linkedBug && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
              <AlertTriangle size={16} />
              <span>Corpo Único do Bug Vinculado: [{linkedBug.bug_code}] {linkedBug.title}</span>
            </div>
            <p className="text-muted-foreground">{linkedBug.description}</p>
          </div>
        )}

        {/* Detalhes: Observado vs Esperado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-background border border-border/40 p-4 rounded-xl space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500">
              Comportamento Observado (Erro)
            </h4>
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {incident.observed_behavior}
            </p>
          </div>

          <div className="bg-background border border-border/40 p-4 rounded-xl space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500">
              Comportamento Esperado
            </h4>
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {incident.expected_behavior}
            </p>
          </div>
        </div>

        {/* Evidências */}
        {incident.evidence_urls && incident.evidence_urls.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ImageIcon size={14} /> Evidências Anexadas ({incident.evidence_urls.length})
            </h4>
            <div className="flex flex-wrap gap-3 p-3 bg-muted/10 border border-border/40 rounded-xl">
              {incident.evidence_urls.map((url, index) => {
                const isImage =
                  url.startsWith("data:image/") ||
                  /\.(png|jpe?g|gif|webp|svg)($|\?)/i.test(url);

                return (
                  <div key={index} className="space-y-1">
                    {isImage ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="block group relative w-32 h-32 rounded-lg overflow-hidden border border-border/60 shadow-xs"
                      >
                        <img
                          src={url}
                          alt={`Evidência ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </a>
                    ) : (
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-background border border-border/50 rounded-lg text-xs font-medium text-primary hover:underline"
                      >
                        <LinkIcon size={14} />
                        <span className="truncate max-w-[200px]">{url}</span>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Seriais dos Aparelhos */}
        {incident.affected_serials && incident.affected_serials.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Smartphone size={14} /> Aparelhos Afetados ({incident.affected_serials.length})
            </h4>
            <div className="bg-background border border-border/40 rounded-xl p-3 max-h-32 overflow-y-auto">
              <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                {incident.affected_serials.map((serial, idx) => (
                  <span
                    key={idx}
                    className="bg-muted px-2 py-1 rounded text-muted-foreground"
                  >
                    {serial}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Rodapé */}
        <div className="flex justify-end border-t border-border/40 pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-secondary text-secondary-foreground font-semibold text-xs rounded-xl hover:bg-secondary/80 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
