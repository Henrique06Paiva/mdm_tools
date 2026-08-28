import React, { useState, useEffect, useRef } from "react";
import type {
  BugIncident,
  IncidentStatus,
  IncidentComment,
  IncidentAttachment,
} from "../../types/incidents";
import {
  formatIncidentStatus,
  getIncidentStatusBadge,
} from "../../types/incidents";
import type { KnownBug } from "../../types/bugs";
import {
  X,
  Calendar,
  Building,
  User,
  AlertTriangle,
  Image as ImageIcon,
  Link as LinkIcon,
  Video,
  AtSign,
  Send,
  Smartphone,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronDown,
  Info,
} from "lucide-react";
import { Button } from "../../components/ui/button";

interface IncidentDetailModalProps {
  incident: BugIncident | null;
  knownBugs: KnownBug[];
  onClose: () => void;
  onChangeStatus?: (
    id: string,
    newStatus: IncidentStatus,
    author: string,
    currentComments: IncidentComment[],
    oldStatus?: IncidentStatus
  ) => Promise<BugIncident | void>;
  onAddComment?: (
    id: string,
    comment: Omit<IncidentComment, "id" | "created_at">,
    currentComments: IncidentComment[]
  ) => Promise<BugIncident | void>;
  currentUsername?: string | null;
}

const COMMON_MENTIONS = [
  "Analista de Suporte",
  "Engenharia",
  "Dev Team",
  "Líder Técnico",
  "N3 Especialista",
];

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  knownBugs,
  onClose,
  onChangeStatus,
  onAddComment,
  currentUsername = "Analista de Suporte",
}) => {
  const [commentText, setCommentText] = useState("");
  const [attachments, setAttachments] = useState<IncidentAttachment[]>([]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "comments">("details");
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // Anexo prompts
  const [showUrlModal, setShowUrlModal] = useState<"image" | "video" | "link" | null>(null);
  const [inputUrl, setInputUrl] = useState("");
  const [inputName, setInputName] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const statusMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && incident && !showUrlModal) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [incident, showUrlModal, onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        statusMenuRef.current &&
        !statusMenuRef.current.contains(e.target as Node)
      ) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!incident) return null;

  const linkedBug = knownBugs.find((b) => b.id === incident.bug_id);
  const currentStatus: IncidentStatus = incident.status || "OPEN";
  const commentsList: IncidentComment[] = incident.comments || [];

  const handleStatusSelect = async (newStatus: IncidentStatus) => {
    if (newStatus === currentStatus || !onChangeStatus) {
      setIsStatusDropdownOpen(false);
      return;
    }

    setIsChangingStatus(true);
    setIsStatusDropdownOpen(false);
    try {
      await onChangeStatus(
        incident.id,
        newStatus,
        currentUsername || "Analista de Suporte",
        commentsList,
        currentStatus
      );
      setStatusFeedback(`Status alterado para ${formatIncidentStatus(newStatus)}`);
      setTimeout(() => setStatusFeedback(null), 2500);
    } catch {
      // Handled in hook
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleInsertMention = (mentionName: string) => {
    const textToInsert = `@${mentionName} `;
    setCommentText((prev) => prev + textToInsert);
    setShowMentionSuggestions(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleAddAttachment = () => {
    if (!inputUrl.trim() || !showUrlModal) return;

    const newAtt: IncidentAttachment = {
      id: `att-${Date.now()}`,
      type: showUrlModal,
      url: inputUrl.trim(),
      name: inputName.trim() || undefined,
    };

    setAttachments((prev) => [...prev, newAtt]);
    setInputUrl("");
    setInputName("");
    setShowUrlModal(null);
  };

  const handleRemoveAttachment = (attId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attId));
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!commentText.trim() && attachments.length === 0) || !onAddComment) return;

    setIsSubmittingComment(true);
    try {
      // Extrair menções do texto
      const mentionMatches = commentText.match(/@([\w\sÀ-ÿ]+)/g) || [];
      const mentions = mentionMatches.map((m) => m.substring(1).trim());

      await onAddComment(
        incident.id,
        {
          author: currentUsername || "Analista de Suporte",
          content: commentText.trim(),
          attachments: attachments.length > 0 ? attachments : undefined,
          mentions: mentions.length > 0 ? mentions : undefined,
        },
        commentsList
      );

      setCommentText("");
      setAttachments([]);
    } catch {
      // Handled in hook
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const renderCommentContent = (content: string) => {
    // Highlight @mentions in cobalt badge
    const parts = content.split(/(@[\w\sÀ-ÿ]+(?:\b|\s))/g);
    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        return (
          <span
            key={index}
            className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-semibold bg-primary/15 text-primary border border-primary/25"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="incident-detail-title"
    >
      <div className="bg-card text-card-foreground border border-border/40 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header no estilo Jira */}
        <div className="p-5 border-b border-border/40 bg-muted/15 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-xs bg-primary/15 text-primary px-2.5 py-1 rounded-md border border-primary/20">
                {incident.ticket_number}
              </span>

              {/* Seletor Interativo de Status */}
              <div className="relative" ref={statusMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
                  disabled={isChangingStatus}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer shadow-2xs hover:opacity-90 ${getIncidentStatusBadge(
                    currentStatus
                  )}`}
                  title="Clique para alterar status"
                >
                  <span>{formatIncidentStatus(currentStatus)}</span>
                  <ChevronDown size={13} />
                </button>

                {isStatusDropdownOpen && (
                  <div className="absolute left-0 top-8 z-50 min-w-[200px] bg-popover text-popover-foreground rounded-xl border border-border/70 shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground px-2 py-1 block">
                      Alterar Status do Chamado
                    </span>
                    {(
                      [
                        "OPEN",
                        "IN_ANALYSIS",
                        "DEV_TEAM",
                        "RESOLVED",
                        "CANCELLED",
                      ] as IncidentStatus[]
                    ).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStatusSelect(st)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer text-left ${
                          st === currentStatus
                            ? "bg-primary/15 text-primary font-bold"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              st === "OPEN"
                                ? "bg-sky-500"
                                : st === "IN_ANALYSIS"
                                ? "bg-amber-500"
                                : st === "DEV_TEAM"
                                ? "bg-violet-500"
                                : st === "RESOLVED"
                                ? "bg-emerald-500"
                                : "bg-muted-foreground"
                            }`}
                          />
                          {formatIncidentStatus(st)}
                        </span>
                        {st === currentStatus && <CheckCircle2 size={13} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="text-xs font-medium bg-muted px-2.5 py-1 rounded-md text-muted-foreground border border-border/40">
                {incident.environment}
              </span>

              {statusFeedback && (
                <span className="text-xs text-emerald-500 font-medium animate-in fade-in">
                  ✓ {statusFeedback}
                </span>
              )}
            </div>

            <h2
              id="incident-detail-title"
              className="text-lg font-bold text-foreground truncate"
            >
              {incident.title || "Chamado Sem Título"}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Navegação de Abas no Modal */}
            <div className="flex bg-muted/40 p-1 rounded-xl border border-border/40 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === "details"
                    ? "bg-background text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Detalhes Técnicos
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("comments")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "comments"
                    ? "bg-background text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Atividades & Jira
                {commentsList.length > 0 && (
                  <span className="bg-primary/15 text-primary px-1.5 py-0.2 rounded-full font-mono text-[10px]">
                    {commentsList.length}
                  </span>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              title="Fechar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Conteúdo com Scroll Interno */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === "details" ? (
            /* Aba: Detalhes Técnicos */
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Metadados Básicos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-muted/20 p-4 rounded-xl border border-border/30 text-xs">
                <div className="flex items-center gap-2.5">
                  <Building size={16} className="text-primary shrink-0" />
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Corporação / Cliente
                    </span>
                    <span className="font-semibold text-foreground">
                      {incident.corporation_name}
                    </span>
                    <span className="text-[10px] text-muted-foreground block font-mono">
                      ID: {incident.corporation_id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <User size={16} className="text-primary shrink-0" />
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Solicitante
                    </span>
                    <span className="font-semibold text-foreground">
                      {incident.reporter_contact || "Não informado"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Calendar size={16} className="text-primary shrink-0" />
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Data do Report
                    </span>
                    <span className="font-semibold text-foreground">
                      {new Date(incident.reported_at).toLocaleString("pt-BR")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bug Vinculado */}
              {linkedBug && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                    <AlertTriangle size={15} />
                    <span>
                      Bug Conhecido Vinculado: [{linkedBug.bug_code}] {linkedBug.title}
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {linkedBug.description}
                  </p>
                </div>
              )}

              {/* Detalhes: Observado vs Esperado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/30 border border-border/40 p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                    <AlertTriangle size={13} />
                    Comportamento Observado (Erro)
                  </h4>
                  <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed font-sans select-text">
                    {incident.observed_behavior}
                  </p>
                </div>

                <div className="bg-muted/30 border border-border/40 p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    Comportamento Esperado
                  </h4>
                  <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed font-sans select-text">
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
                              className="block group relative w-28 h-28 rounded-lg overflow-hidden border border-border/60 shadow-2xs hover:border-primary transition-all"
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
                          className="bg-muted px-2 py-1 rounded text-muted-foreground border border-border/30"
                        >
                          {serial}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Aba: Atividades & Comentários (Jira Style) */
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Caixa de Novo Comentário */}
              <form
                onSubmit={handleSendComment}
                className="bg-muted/20 border border-border/50 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <AtSign size={13} className="text-primary" />
                    Adicionar Comentário / Atualização
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Autor: <strong>{currentUsername || "Analista de Suporte"}</strong>
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    rows={3}
                    placeholder="Escreva atualizações, diagnósticos ou use @ para mencionar a equipe..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full bg-input border border-border rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring resize-none font-sans"
                  />

                  {/* Sugestões de Menção */}
                  {showMentionSuggestions && (
                    <div className="absolute left-2 bottom-3 z-20 bg-popover text-popover-foreground border border-border rounded-xl shadow-xl p-1 text-xs space-y-0.5">
                      <span className="text-[10px] text-muted-foreground px-2 py-0.5 block font-bold">
                        Mencionar equipe:
                      </span>
                      {COMMON_MENTIONS.map((name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => handleInsertMention(name)}
                          className="w-full text-left px-2.5 py-1 rounded-lg hover:bg-muted text-xs cursor-pointer font-medium"
                        >
                          @{name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Lista de Anexos Pendentes */}
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="inline-flex items-center gap-1.5 bg-background border border-border px-2.5 py-1 rounded-lg text-xs"
                      >
                        {att.type === "image" && <ImageIcon size={12} className="text-primary" />}
                        {att.type === "video" && <Video size={12} className="text-purple-500" />}
                        {att.type === "link" && <LinkIcon size={12} className="text-emerald-500" />}
                        <span className="max-w-[150px] truncate">{att.name || att.url}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="text-muted-foreground hover:text-destructive p-0.5 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Barra de Ferramentas de Anexos & Envio */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowUrlModal("image")}
                      className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Adicionar Foto"
                    >
                      <ImageIcon size={13} />
                      <span className="hidden sm:inline">Foto</span>
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowUrlModal("video")}
                      className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Adicionar Vídeo (Loom / Drive / Link)"
                    >
                      <Video size={13} />
                      <span className="hidden sm:inline">Vídeo</span>
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowUrlModal("link")}
                      className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Adicionar Link Externo"
                    >
                      <LinkIcon size={13} />
                      <span className="hidden sm:inline">Link</span>
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMentionSuggestions((prev) => !prev)}
                      className="h-7 px-2 text-xs gap-1 text-primary hover:text-primary cursor-pointer font-medium"
                      title="Mencionar pessoa (@)"
                    >
                      <AtSign size={13} />
                      <span className="hidden sm:inline">Mencionar</span>
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmittingComment || (!commentText.trim() && attachments.length === 0)}
                    className="h-8 px-4 text-xs gap-1.5 font-semibold cursor-pointer"
                  >
                    <Send size={13} />
                    {isSubmittingComment ? "Enviando..." : "Comentar"}
                  </Button>
                </div>
              </form>

              {/* Feed de Comentários e Histórico */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Clock size={14} /> Histórico de Atividades ({commentsList.length})
                  </h4>
                </div>

                {commentsList.length === 0 ? (
                  <div className="bg-muted/15 border border-border/30 rounded-xl p-8 text-center text-xs text-muted-foreground space-y-1">
                    <Info size={18} className="mx-auto text-muted-foreground" />
                    <p>Nenhum comentário ou atividade registrada ainda.</p>
                    <p className="text-[11px]">Adicione a primeira atualização acima para registrar no card.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {commentsList.map((comm) => (
                      <div
                        key={comm.id}
                        className={`p-4 rounded-xl border transition-all ${
                          comm.is_system
                            ? "bg-muted/20 border-border/30 text-xs text-muted-foreground"
                            : "bg-card border-border/50 text-foreground shadow-2xs"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold text-[10px] flex items-center justify-center shrink-0 font-mono">
                              {comm.author.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-semibold text-xs text-foreground">
                              {comm.author}
                            </span>
                            {comm.is_system && (
                              <span className="text-[10px] bg-muted px-1.5 py-0.2 rounded font-mono text-muted-foreground">
                                Sistema
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {new Date(comm.created_at).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {/* Texto do Comentário */}
                        <div className="text-xs leading-relaxed font-sans select-text whitespace-pre-wrap">
                          {renderCommentContent(comm.content)}
                        </div>

                        {/* Anexos do Comentário */}
                        {comm.attachments && comm.attachments.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2.5 pt-2 border-t border-border/30">
                            {comm.attachments.map((att) => (
                              <div key={att.id}>
                                {att.type === "image" ? (
                                  <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block group w-24 h-24 rounded-lg overflow-hidden border border-border shadow-2xs hover:border-primary transition-all"
                                  >
                                    <img
                                      src={att.url}
                                      alt={att.name || "Imagem Anexada"}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                  </a>
                                ) : att.type === "video" ? (
                                  <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-semibold hover:bg-purple-500/20"
                                  >
                                    <Video size={13} />
                                    <span>{att.name || "Assistir Vídeo"}</span>
                                    <ExternalLink size={11} />
                                  </a>
                                ) : (
                                  <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-lg text-xs font-semibold hover:bg-primary/20"
                                  >
                                    <LinkIcon size={13} />
                                    <span>{att.name || att.url}</span>
                                    <ExternalLink size={11} />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Secundário para Inserir Anexo (URL) */}
        {showUrlModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs">
            <div className="bg-card text-card-foreground border border-border rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  {showUrlModal === "image" && <ImageIcon size={14} className="text-primary" />}
                  {showUrlModal === "video" && <Video size={14} className="text-purple-500" />}
                  {showUrlModal === "link" && <LinkIcon size={14} className="text-emerald-500" />}
                  Inserir {showUrlModal === "image" ? "Foto / Imagem" : showUrlModal === "video" ? "Vídeo" : "Link Externo"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowUrlModal(null)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground block">
                    URL / Link *
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="w-full bg-input border border-border rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring font-sans"
                    autoFocus
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground block">
                    Título / Descrição (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Gravação do erro Loom, Log Sentry, PR"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    className="w-full bg-input border border-border rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring font-sans"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUrlModal(null)}
                  className="h-8 text-xs cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddAttachment}
                  disabled={!inputUrl.trim()}
                  className="h-8 text-xs cursor-pointer font-semibold"
                >
                  Adicionar Anexo
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Rodapé do Modal Principal */}
        <div className="p-4 border-t border-border/40 bg-muted/15 flex justify-between items-center shrink-0">
          <div className="text-[11px] text-muted-foreground">
            Ticket cadastrado por <strong>{incident.created_by || "Analista de Suporte"}</strong>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="h-8 text-xs px-5 font-semibold cursor-pointer"
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};
