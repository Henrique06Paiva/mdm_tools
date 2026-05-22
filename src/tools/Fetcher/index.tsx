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
    results,
    tableRows,
    startProcess,
    resumeProcess,
    pauseProcess,
    stopProcess,
    exportExcel,
  } = useFetcher();

  return (
    <>
      <ManualViewer
        title="Exportador de Terminais"
        content={
          <div>
            <p style={{ marginBottom: "8px" }}>
              <strong>Objetivo:</strong> Obter em lote a lista completa de todos os terminais registrados sob uma determinada Corporação, Empresa e/ou Filial, listando seus seriais, grupos de equipamento e status de ligado/desligado.
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
                Insira o <strong>ID da Corporação</strong> no filtro correspondente (campo obrigatório).
              </li>
              <li>
                Se desejar restringir a busca, insira opcionalmente o <strong>ID da Empresa</strong> e/ou o <strong>ID da Filial</strong>.
              </li>
              <li>
                Clique em <strong>Iniciar Busca</strong>. A ferramenta irá paginar automaticamente pela API obtendo os terminais e montando a visualização.
              </li>
              <li>
                Você pode acompanhar o progresso das páginas e o total de terminais encontrados nos cartões de status.
              </li>
              <li>
                Você pode utilizar os botões de <strong>Pausar</strong> e <strong>Retomar</strong> a qualquer momento do processo.
              </li>
              <li>
                Assim que finalizar (ou quando preferir), clique em <strong>Baixar Relatório</strong> para exportar todos os dados carregados até o momento em uma planilha <strong>.xlsx</strong>.
              </li>
            </ol>
          </div>
        }
      />

      <ConfigPanel
        corporationId={corporationId}
        setCorporationId={setCorporationId}
        companyId={companyId}
        setCompanyId={setCompanyId}
        subsidiaryId={subsidiaryId}
        setSubsidiaryId={setSubsidiaryId}
        isProcessing={isProcessing}
      />

      <ProgressPanel
        results={results}
        exportExcel={exportExcel}
        startProcess={startProcess}
        resumeProcess={resumeProcess}
        pauseProcess={pauseProcess}
        stopProcess={stopProcess}
        isProcessing={isProcessing}
        isPaused={isPaused}
        corporationId={corporationId}
        stats={stats}
        tableRows={tableRows}
      />

      <LogPanel logs={logs} />
    </>
  );
}
