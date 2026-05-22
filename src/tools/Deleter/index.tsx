import { useState, useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import { useDeleter } from "./useDeleter";
import { ConfigPanel } from "./ConfigPanel";
import { ProgressPanel } from "./ProgressPanel";
import { LogPanel } from "./LogPanel";
import { ManualViewer } from "../../components/ManualViewer";
import { Button } from "../../components/ui/button";

export default function Deleter() {
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
    resetProcess,
    clearLogs,
  } = useDeleter();

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
        title="Deleção em Massa"
        content={
          <div>
            <p style={{ marginBottom: "8px" }}>
              <strong>Objetivo:</strong> Inativar e deletar definitivamente
              múltiplos equipamentos do MDM a partir de uma lista de seriais.
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
                Clique em <strong>Iniciar Processo</strong>.{" "}
                <span style={{ color: "var(--red)", fontWeight: 600 }}>
                  CUIDADO:
                </span>{" "}
                Esta ação inativará e excluirá permanentemente os dispositivos.
                A ação é irreversível.
              </li>
              <li>
                Acompanhe o progresso na tabela e o log de eventos para
                verificar falhas ou seriais não encontrados (N/E).
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
        resetProcess={resetProcess}
        isProcessing={isProcessing}
        isPaused={isPaused}
        serials={serials}
        stats={stats}
        tableRows={tableRows}
      />

      <LogPanel logs={logs} onClear={clearLogs} />

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          aria-describedby="delete-modal-desc"
        >
          <div className="bg-card text-card-foreground border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden scale-in duration-200">
            <div className="p-6">
              <h3
                id="delete-modal-title"
                className="text-lg font-bold text-foreground mb-2 flex items-center gap-2"
              >
                <span className="p-1.5 bg-destructive/10 text-destructive rounded-lg">
                  <Trash2 size={18} />
                </span>
                Confirmar Deleção em Massa
              </h3>
              <p
                id="delete-modal-desc"
                className="text-sm text-muted-foreground mb-4"
              >
                Você está prestes a deletar permanentemente{" "}
                <strong>{serials.length}</strong> terminal(is).
              </p>

              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3.5 mb-6 text-sm text-destructive font-medium leading-relaxed">
                <p className="font-semibold mb-1">Atenção:</p>
                Esta ação é irreversível. Após deletado, não é possível
                restaurar o terminal, apenas cadastrá-lo novamente.
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
                  variant="destructive"
                  onClick={() => {
                    setIsConfirmOpen(false);
                    startProcess();
                  }}
                >
                  Sim, Deletar Tudo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
