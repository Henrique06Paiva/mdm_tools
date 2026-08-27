import { useFetcher } from "./useFetcher";
import { ConfigPanel } from "./ConfigPanel";
import { ProgressPanel } from "./ProgressPanel";
import { LogPanel } from "./LogPanel";
import { ManualViewer } from "../../components/ManualViewer";

export default function Fetcher() {
  const {
    corporationId,
    setCorporationId,
    companyId,
    setCompanyId,
    subsidiaryId,
    setSubsidiaryId,
    isProcessing,
    isPaused,
    logs,
    stats,
    columns,
    toggleColumn,
    moveColumn,
    tableRows,
    startProcess,
    resumeProcess,
    pauseProcess,
    stopProcess,
    resetProcess,
    clearLogs,
    exportExcel,
    restrictions,
  } = useFetcher();

  return (
    <>
      <ConfigPanel
        corporationId={corporationId}
        setCorporationId={setCorporationId}
        companyId={companyId}
        setCompanyId={setCompanyId}
        subsidiaryId={subsidiaryId}
        setSubsidiaryId={setSubsidiaryId}
        isProcessing={isProcessing}
        restrictions={restrictions}
        columns={columns}
        toggleColumn={toggleColumn}
        moveColumn={moveColumn}
      />

      <ProgressPanel
        columns={columns}
        exportExcel={exportExcel}
        startProcess={startProcess}
        resumeProcess={resumeProcess}
        pauseProcess={pauseProcess}
        stopProcess={stopProcess}
        resetProcess={resetProcess}
        isProcessing={isProcessing}
        isPaused={isPaused}
        corporationId={corporationId}
        stats={stats}
        tableRows={tableRows}
      />

      <LogPanel logs={logs} onClear={clearLogs} />

      <ManualViewer
        title="Exportador de Terminais"
        content={
          <div className="space-y-2">
            <p>
              <strong>Objetivo:</strong> Obter a lista completa de terminais registrados por Corporação, Empresa e Filial, exportando para Excel (.xlsx).
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-1">
              <li>Informe o <strong>ID da Corporação</strong> (e opcionalmente Empresa/Filial).</li>
              <li>Personalize as colunas visíveis no painel lateral à direita.</li>
              <li>Clique em <strong>Iniciar Busca</strong> e, ao concluir, exporte a planilha.</li>
            </ol>
          </div>
        }
      />
    </>
  );
}
