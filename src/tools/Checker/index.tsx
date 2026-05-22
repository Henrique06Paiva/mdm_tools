import { useChecker } from "./useChecker";
import { ConfigPanel } from "./ConfigPanel";
import { ProgressPanel } from "./ProgressPanel";
import { LogPanel } from "./LogPanel";
import { ManualViewer } from "../../components/ManualViewer";

export default function Checker() {
  const {
    packages,
    setPackages,
    rawData,
    serials,
    columns,
    selectedCol,
    isProcessing,
    isPaused,
    logs,
    addLog,
    stats,
    results,
    tableRows,
    fileInputRef,
    handleFile,
    applyColumn,
    startProcess,
    resumeProcess,
    pauseProcess,
    stopProcess,
    exportExcel,
  } = useChecker();

  return (
    <>
      <ManualViewer
        title="Version Checker"
        content={
          <div>
            <p style={{ marginBottom: "8px" }}>
              <strong>Objetivo:</strong> Consultar em lote a versão de
              aplicativos instalados em diversos equipamentos e o seu status de
              conectividade (Online/Offline e Ativo/Inativo).
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
                Insira os <strong>Package Names</strong> dos aplicativos que
                deseja buscar (ex: <code>com.mdmservice</code>). Use o botão
                "Adicionar Pacote" para incluir mais de um.
              </li>
              <li>
                Clique na área pontilhada para selecionar uma planilha (
                <strong>.xlsx</strong> ou <strong>.csv</strong>) contendo os
                números de série dos equipamentos.
              </li>
              <li>
                Selecione qual coluna da planilha contém os seriais (caso não
                seja a primeira). A leitura dos seriais se inicia a partir da
                segunda linha da planilha.
              </li>
              <li>
                Clique em <strong>Iniciar Consulta</strong>. A ferramenta
                consultará os dados na API em lotes e exibirá o progresso no
                painel.
              </li>
              <li>
                Após finalizar, você pode visualizar os resultados na tabela e
                exportá-los clicando em <strong>Baixar Relatório</strong>.
              </li>
            </ol>
          </div>
        }
      />

      <ConfigPanel
        packages={packages}
        setPackages={setPackages}
        addLog={addLog}
        fileInputRef={fileInputRef}
        handleFile={handleFile}
        serials={serials}
        columns={columns}
        selectedCol={selectedCol}
        applyColumn={applyColumn}
        rawData={rawData}
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
        serials={serials}
        stats={stats}
        tableRows={tableRows}
      />

      <LogPanel logs={logs} />
    </>
  );
}
