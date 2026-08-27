import React, { useState, useEffect, useRef } from "react";
import { Compass, ChevronRight, ChevronLeft, X, Check } from "lucide-react";
import { Button } from "./ui/button";

export interface TourStep {
  selector?: string;
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
  tabToActivate?:
    | "home"
    | "checker"
    | "deleter"
    | "apk"
    | "forcer"
    | "fetcher"
    | "cloner"
    | "history"
    | "incidents";
}

interface SystemTourProps {
  isOpen: boolean;
  onClose: () => void;
  onActivateTab: (
    tab:
      | "home"
      | "checker"
      | "deleter"
      | "apk"
      | "forcer"
      | "fetcher"
      | "cloner"
      | "history"
      | "incidents",
  ) => void;
}

export default function SystemTour({
  isOpen,
  onClose,
  onActivateTab,
}: SystemTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  const tooltipRef = useRef<HTMLDivElement>(null);

  const steps: TourStep[] = [
    {
      title: "Guia Rápido do MDM Hub",
      content:
        "Bem-vindo ao MDM Hub Tools. Este assistente apresenta de forma direta os principais módulos de automação e utilitários disponíveis na plataforma.",
      position: "center",
    },
    {
      selector: '[data-tour="tab-list"]',
      title: "Menu de Ferramentas",
      content:
        "Menu lateral unificado para alternar entre os utilitários de diagnóstico, operações em lote, auditoria e módulos operacionais.",
      position: "right",
    },
    {
      selector: '[data-tour="tab-checker"]',
      title: "Inspecionar Versões",
      content:
        "Auditoria de conformidade em lote. Carregue os apps da corporação via API Report e consulte em tempo real a versão instalada, energia e status de conexão dos terminais.",
      position: "right",
      tabToActivate: "checker",
    },
    {
      selector: '[data-tour="tab-apk"]',
      title: "Busca de APKs",
      content:
        "Localização rápida de versões cadastradas de aplicativos por corporação, com fornecimento de links diretos para download do instalador (.apk).",
      position: "right",
      tabToActivate: "apk",
    },
    {
      selector: '[data-tour="tab-deleter"]',
      title: "Deleção em Massa",
      content:
        "Inativação e remoção permanente de múltiplos equipamentos a partir de uma lista ou planilha Excel (.xlsx), com monitoramento de progresso e logs em tempo real.",
      position: "right",
      tabToActivate: "deleter",
    },
    {
      selector: '[data-tour="tab-forcer"]',
      title: "Force Data em Massa",
      content:
        "Envio de comandos em lote para forçar os dispositivos a sincronizarem imediatamente seus dados de inventário com o servidor MDM.",
      position: "right",
      tabToActivate: "forcer",
    },
    {
      selector: '[data-tour="tab-fetcher"]',
      title: "Exportador de Terminais",
      content:
        "Consulta paginada e extração de todos os terminais registrados por corporação, empresa ou filial, com exportação estruturada para planilha Excel.",
      position: "right",
      tabToActivate: "fetcher",
    },
    {
      selector: '[data-tour="tab-cloner"]',
      title: "Clonar Usuário",
      content:
        "Duplicação e recriação limpa de contas de usuários para correção de inconsistências de permissões e políticas de acesso no MDM.",
      position: "right",
      tabToActivate: "cloner",
    },
    {
      selector: '[data-tour="header-controls"]',
      title: "Controles e Tema",
      content:
        "Status de conexão da API, alternância instantânea entre tema Claro e Escuro e encerramento seguro da sessão.",
      position: "right",
    },
    {
      selector: '[data-tour="feedback-button"]',
      title: "Canal de Feedback",
      content:
        "Botão de acesso rápido para reportar inconsistências técnicas ou enviar sugestões diretamente para a equipe de desenvolvimento.",
      position: "top",
    },
    {
      title: "Pronto para Iniciar",
      content:
        "Você pode consultar o manual detalhado no rodapé de cada ferramenta ou reiniciar este tour a qualquer momento pelo cabeçalho.",
      position: "center",
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const currentStepData = steps[currentStep];
    if (currentStepData && currentStepData.tabToActivate) {
      onActivateTab(currentStepData.tabToActivate);
    }
  }, [currentStep, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const step = steps[currentStep];

    const updateRect = () => {
      if (!step.selector) {
        setTargetRect(null);
        return;
      }

      const element = Array.from(document.querySelectorAll(step.selector)).find(
        (el) => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        },
      );
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest" });

        const timeoutId = setTimeout(() => {
          const rect = element.getBoundingClientRect();
          setTargetRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          });
        }, 100);
        return () => clearTimeout(timeoutId);
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, { passive: true });

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
    };
  }, [currentStep, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const step = steps[currentStep];
    const tooltip = tooltipRef.current;

    const tooltipWidth = 360;

    if (!targetRect || !step.selector || !tooltip) {
      setTooltipStyle({
        position: "fixed",
        top: "50%",
        left: "50%",
        width: "360px",
        transform: "translate(-50%, -50%)",
        transition: "all 0.2s ease-out",
      });
      return;
    }

    const tooltipHeight = tooltip.offsetHeight || 180;
    const margin = 12;
    const screenPadding = 16;

    let top = 0;
    let left = 0;

    const isMobile = window.innerWidth < 768;
    let pos = step.position || "bottom";
    if (isMobile && pos === "right") {
      pos = "bottom";
    }

    if (pos === "bottom") {
      top = targetRect.top + targetRect.height + margin;
      left = targetRect.left + (targetRect.width - tooltipWidth) / 2;
    } else if (pos === "top") {
      top = targetRect.top - tooltipHeight - margin;
      left = targetRect.left + (targetRect.width - tooltipWidth) / 2;
    } else if (pos === "left") {
      top = targetRect.top + (targetRect.height - tooltipHeight) / 2;
      left = targetRect.left - tooltipWidth - margin;
    } else if (pos === "right") {
      top = targetRect.top + (targetRect.height - tooltipHeight) / 2;
      left = targetRect.left + targetRect.width + margin;
    } else {
      top = (window.innerHeight - tooltipHeight) / 2;
      left = (window.innerWidth - tooltipWidth) / 2;
    }

    if (left < screenPadding) {
      left = screenPadding;
    } else if (left + tooltipWidth > window.innerWidth - screenPadding) {
      left = window.innerWidth - tooltipWidth - screenPadding;
    }

    if (top < screenPadding) {
      top = screenPadding;
    } else if (top + tooltipHeight > window.innerHeight - screenPadding) {
      top = window.innerHeight - tooltipHeight - screenPadding;
    }

    setTooltipStyle({
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      width: "360px",
      transition: "all 0.2s ease-out",
    });
  }, [targetRect, currentStep, isOpen]);

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <>
      {/* Elemento de Destaque com Cutout */}
      {targetRect && (
        <div
          className="fixed border-2 border-primary/80 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] pointer-events-none z-[9010] transition-all duration-200 ease-out"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}

      {/* Overlay central quando sem elemento alvo */}
      {!targetRect && (
        <div
          className="fixed inset-0 bg-black/60 z-[9010] backdrop-blur-2xs"
          onClick={onClose}
        />
      )}

      {/* Card do Tour */}
      <div
        ref={tooltipRef}
        style={tooltipStyle}
        className="fixed bg-card text-card-foreground border border-border/70 shadow-2xl rounded-xl p-5 w-[360px] max-w-[92vw] z-[9020] select-none flex flex-col gap-3.5 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-border/40">
          <div className="flex items-center gap-1.5 text-primary">
            <Compass size={15} />
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
              Guia MDM Hub
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            {currentStep + 1} de {steps.length}
          </span>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-md transition-colors cursor-pointer ml-1"
            title="Fechar Tour"
          >
            <X size={13} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="space-y-1">
          <h3 className="text-sm font-bold tracking-tight text-foreground">
            {currentStepData.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {currentStepData.content}
          </p>
        </div>

        {/* Rodapé com navegação e progresso */}
        <div className="flex justify-between items-center pt-2 border-t border-border/40 mt-1">
          {/* Indicadores de Passo */}
          <div className="flex items-center gap-1">
            {steps.map((_, index) => (
              <span
                key={index}
                className={`h-1 rounded-full transition-all duration-200 ${
                  index === currentStep
                    ? "w-4 bg-primary"
                    : "w-1 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-1.5 shrink-0">
            {!isFirstStep && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="h-8 px-2.5 rounded-lg text-xs font-semibold cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft size={13} className="mr-0.5" />
                Anterior
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleNext}
              className="h-8 px-3.5 rounded-lg text-xs font-semibold cursor-pointer gap-1"
            >
              {isLastStep ? (
                <>
                  Concluir
                  <Check size={13} />
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight size={13} />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
