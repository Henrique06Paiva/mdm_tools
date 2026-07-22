import React, { useState, useEffect, useRef } from "react";
import { HelpCircle, ChevronRight, ChevronLeft, X, Check } from "lucide-react";
import { Button } from "./ui/button";

export interface TourStep {
  selector?: string;
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
  tabToActivate?:
    | "checker"
    | "deleter"
    | "apk"
    | "forcer"
    | "fetcher"
    | "cloner";
}

interface SystemTourProps {
  isOpen: boolean;
  onClose: () => void;
  onActivateTab: (
    tab: "checker" | "deleter" | "apk" | "forcer" | "fetcher" | "cloner",
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
      title: "Bem-vindo ao MDM Hub Tools! 👋",
      content:
        "Este é o seu portal de utilitários para gerenciamento, validação e diagnóstico em massa de dispositivos. Preparamos este tour rápido para você conhecer detalhadamente cada uma das nossas ferramentas e como utilizá-las.",
      position: "center",
    },
    {
      selector: '[data-tour="tab-list"]',
      title: "Menu de Ferramentas 🛠️",
      content:
        "Aqui você encontra todos os utilitários disponíveis. Cada aba oferece uma funcionalidade específica para facilitar seu dia a dia.",
      position: "right",
    },
    {
      selector: '[data-tour="tab-checker"]',
      title: "Versões 📱",
      content:
        "Consulte e compare se as versões de firmware, pacotes e do agente instaladas nos dispositivos estão corretas e em conformidade.\n\nComo usar:\n1. Selecione a corporação/empresa e defina os pacotes de apps (ex: com.mdmservice).\n2. Insira ou envie uma lista de números de série dos terminais.\n3. O sistema fará a varredura automática, destacando em vermelho as versões desatualizadas e em verde as corretas.",
      position: "right",
      tabToActivate: "checker",
    },
    {
      selector: '[data-tour="tab-apk"]',
      title: "Busca de APKs 📦",
      content:
        "Localize e baixe os arquivos de instalação (.apk) e versões de aplicativos cadastrados em uma determinada corporação no MDM.\n\nComo usar:\n1. Insira o ID da Corporação (campo obrigatório).\n2. Opcionalmente, especifique o Package Name e a versão que deseja encontrar.\n3. Clique em Buscar APK para listar as correspondências e obter os links diretos para download.",
      position: "right",
      tabToActivate: "apk",
    },
    {
      selector: '[data-tour="tab-deleter"]',
      title: "Deleção em Massa 🗑️",
      content:
        "Exclua múltiplos terminais inativos, obsoletos ou duplicados do MDM de uma única vez.\n\nComo usar:\n1. Insira os IDs dos aparelhos diretamente ou faça o upload de uma planilha Excel (.xlsx).\n2. Revise a lista de exclusão carregada na tabela.\n3. Confirme a ação no modal para iniciar a deleção em lote, acompanhando o progresso e os logs em tempo real.",
      position: "right",
      tabToActivate: "deleter",
    },
    {
      selector: '[data-tour="tab-forcer"]',
      title: "Forçar Sincronização 🔄",
      content:
        "Envie comandos em lote para forçar a atualização imediata dos dados dos aparelhos com o servidor de MDM.\n\nComo usar:\n1. Digite ou faça o upload da lista de identificadores dos terminais.\n2. Clique em iniciar para enviar o comando de sincronismo forçado.\n3. Acompanhe a taxa de sucesso no painel estatístico e nos logs de processamento.",
      position: "right",
      tabToActivate: "forcer",
    },
    {
      selector: '[data-tour="tab-fetcher"]',
      title: "Exportador de Terminais 📋",
      content:
        "Gere relatórios completos de todos os terminais registrados sob determinadas corporações, empresas ou filiais.\n\nComo usar:\n1. Filtre informando o ID da Corporação (e opcionalmente Empresa/Filial).\n2. Clique em Iniciar Busca para carregar os dados de forma paginada.\n3. Ao terminar, clique em Baixar Relatório para exportar todos os dados em uma planilha Excel (.xlsx) contendo seriais, grupos e status.",
      position: "right",
      tabToActivate: "fetcher",
    },
    {
      selector: '[data-tour="tab-cloner"]',
      title: "Clonar Usuário 👥",
      content:
        "Resolva problemas de permissões ou ACLs corrompidas de um usuário copiando suas credenciais de forma limpa.\n\nComo usar:\n1. Busque o usuário por e-mail/nome ou insira diretamente seu ID.\n2. Revise os detalhes carregados na tela.\n3. Clique em Iniciar Clonagem. O sistema fará backup, inativará e excluirá a conta antiga e, em seguida, recriará uma idêntica e ativa.",
      position: "right",
      tabToActivate: "cloner",
    },
    {
      selector: '[data-tour="header-controls"]',
      title: "Configurações e Tema ⚙️",
      content:
        "Acompanhe seu status de conexão com os serviços do MDM, alterne entre tema claro e escuro para maior conforto visual, ou finalize sua sessão com segurança.",
      position: "right",
    },
    {
      selector: '[data-tour="feedback-button"]',
      title: "Feedback e Reporte de Erros 💡",
      content:
        "Encontrou algum problema ou tem sugestões de melhoria para o portal? Clique aqui a qualquer momento para abrir o formulário e enviar uma mensagem direta para a equipe de desenvolvimento.",
      position: "top",
    },
    {
      title: "Tudo pronto! 🚀",
      content:
        "O tour terminou. Caso queira rever estas orientações futuramente, basta clicar no botão de ajuda (?) no canto superior direito do cabeçalho a qualquer momento.",
      position: "center",
    },
  ];

  // Reset to first step when tour is opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  // Activate appropriate tab programmatically if specified
  useEffect(() => {
    if (!isOpen) return;
    const currentStepData = steps[currentStep];
    if (currentStepData && currentStepData.tabToActivate) {
      onActivateTab(currentStepData.tabToActivate);
    }
  }, [currentStep, isOpen]);

  // Listen to window size and scroll, and dynamically compute target positioning rect
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
        // Smoothly scroll the element into view if not fully visible
        element.scrollIntoView({ behavior: "smooth", block: "nearest" });

        // Wait briefly for scroll transition before calculating bounding rect
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

  // Calculate Tooltip position based on targetRect and current step configuration
  useEffect(() => {
    if (!isOpen) return;
    const step = steps[currentStep];
    const tooltip = tooltipRef.current;

    // Use a fixed width of 360px for positioning calculations (matches the CSS w-[360px])
    const tooltipWidth = 360;

    if (!targetRect || !step.selector || !tooltip) {
      // Center placement when there is no target element
      setTooltipStyle({
        position: "fixed",
        top: "50%",
        left: "50%",
        width: "360px",
        transform: "translate(-50%, -50%)",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      });
      return;
    }

    const tooltipHeight = tooltip.offsetHeight || 190;
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
      // Fallback center
      top = (window.innerHeight - tooltipHeight) / 2;
      left = (window.innerWidth - tooltipWidth) / 2;
    }

    // Edge constraint checks (ensure tooltip stays inside viewport)
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
      transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
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
      {/* Highlighter Element - custom cutout using box-shadow */}
      {targetRect && (
        <div
          className="fixed border-2 border-primary/60 rounded-xl shadow-[0_0_0_9999px_rgba(9,9,11,0.65)] dark:shadow-[0_0_0_9999px_rgba(9,9,11,0.75)] pointer-events-none z-[9010] transition-all duration-300 ease-out"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}

      {/* Center spotlight element when no target element is present */}
      {!targetRect && (
        <div
          className="fixed inset-0 bg-black/60 dark:bg-black/75 z-[9010]"
          onClick={onClose}
        />
      )}

      {/* Tooltip Card */}
      <div
        ref={tooltipRef}
        style={tooltipStyle}
        className="fixed bg-card text-card-foreground border border-border shadow-2xl rounded-2xl p-4 w-[360px] max-w-[90vw] z-[9020] select-none flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-1.5 text-primary">
            <HelpCircle size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">
              Tour do MDM Hub
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-md transition-colors cursor-pointer"
            title="Pular Tour"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-1">
          <h3 className="text-base font-bold tracking-tight text-foreground">
            {currentStepData.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {currentStepData.content}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-2 pt-3 border-t border-border/55">
          {/* Progress Indicators */}
          <div className="flex items-center gap-[3px]">
            {steps.map((_, index) => (
              <span
                key={index}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? "w-3.5 bg-primary"
                    : "w-1 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {!isFirstStep && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="h-8 px-2.5 rounded-lg text-xs font-semibold cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft size={14} className="mr-0.5" />
                Anterior
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleNext}
              className="h-8 px-3 rounded-lg text-xs font-semibold cursor-pointer gap-1"
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
