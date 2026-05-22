import { useState, useEffect, useRef } from "react";
import { RefreshCw } from "lucide-react";
import { useForcer } from "./useForcer";
import { ConfigPanel } from "./ConfigPanel";
import { ProgressPanel } from "./ProgressPanel";
import { LogPanel } from "./LogPanel";
import { ManualViewer } from "../../components/ManualViewer";
import { Button } from "../../components/ui/button";

export default function Forcer() {
  const {
    serials,
    isProcessing,
    isPaused,
    logs,
    stats,
    tableRows,
    fileInputRef,
    handleFile,
    startProcess,
    resumeProcess,
    pauseProcess,
    stopProcess,
  } = useForcer();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isConfirmOpen) {
        setIsConfirmOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isConfirmOpen]);

  // Focus the cancel button when the modal opens for safety
  useEffect(() => {
    if (isConfirmOpen) {
      setTimeout(() => {
        cancelBtnRef.current?.focus();
      }, 50);
    }
  }, [isConfirmOpen]);

  return (
    <>
      <ManualViewer
        title="Force Data em Massa"
        content={
          <div>
            <p style={{ marginBottom: "8px" }}>
              <strong>Objetivo:</strong> Forçar o envio de comandos de sincronização e atualização de dados (Force Data) para múltiplos equipamentos cadastrados no MDM.
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
                Clique na área pontilhada para fazer o upload de uma planilha (
                <strong>.xlsx</strong> ou <strong>.csv</strong>).
              </li>
              <li>
                A planilha deve conter os seriais dos equipamentos na{" "}
                <strong>primeira coluna</strong>. A leitura inicia a partir da
                segunda linha (assumindo que a primeira linha é o cabeçalho).
              </li>
              <li>
                Verifique a quantidade de seriais carregados que será exibida na
                tela.
              </li>
              <li>
                Clique em <strong>Iniciar Processo</strong> e confirme.
              </li>
              <li>
                Acompanhe o progresso na tabela em tempo real para verificar se os envios foram realizados com sucesso ou se apresentaram falhas.
              </li>
            </ol>
          </div>
        }
      />

      <ConfigPanel
        fileInputRef={fileInputRef}
        handleFile={handleFile}
        serials={serials}
      />

      <ProgressPanel
        startProcess={() => setIsConfirmOpen(true)}
        resumeProcess={resumeProcess}
        pauseProcess={pauseProcess}
        stopProcess={stopProcess}
        isProcessing={isProcessing}
        isPaused={isPaused}
        serials={serials}
        stats={stats}
        tableRows={tableRows}
      />

      <LogPanel logs={logs} />

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="forcer-modal-title"
          aria-describedby="forcer-modal-desc"
        >
          <div className="bg-card text-card-foreground border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden scale-in duration-200">
            <div className="p-6">
              <h3
                id="forcer-modal-title"
                className="text-lg font-bold text-foreground mb-2 flex items-center gap-2"
              >
                <span className="p-1.5 bg-primary/10 text-primary rounded-lg">
                  <RefreshCw size={18} className="text-primary" />
                </span>
                Confirmar Force Data em Massa
              </h3>
              <p
                id="forcer-modal-desc"
                className="text-sm text-muted-foreground mb-4"
              >
                Você está prestes a forçar a atualização de{" "}
                <strong>{serials.length}</strong> terminal(is).
              </p>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3.5 mb-6 text-sm text-primary font-medium leading-relaxed">
                <p className="font-semibold mb-1">Ação:</p>
                O sistema fará requisições de atualização para cada terminal na lista em lotes paralelos.
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
                  variant="default"
                  onClick={() => {
                    setIsConfirmOpen(false);
                    startProcess();
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Confirmar Envio
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
