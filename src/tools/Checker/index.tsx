import { useChecker } from "./useChecker";
import { ConfigPanel } from "./ConfigPanel";
import { ProgressPanel } from "./ProgressPanel";
import { LogPanel } from "./LogPanel";
import { ManualViewer } from "../../components/ManualViewer";

export default function Checker() {
  const {
    packages,
    setPackages,
    fetchAllApps,
    setFetchAllApps,
    includeSystemApps,
    setIncludeSystemApps,
    rawData,
    serials,
    columns,
    selectedCol,
    searchSource,
    setSearchSource,
    corporationId,
    setCorporationId,
    companyId,
    setCompanyId,
    subsidiaryId,
    setSubsidiaryId,
    availableCorpApps,
    isLoadingCorpApps,
    loadCorpApps,
    onlyWithApp,
    setOnlyWithApp,
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
    resetProcess,
    clearLogs,
    restrictions,
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
              conectividade (Energia, Conexão e Última Atualização).
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
                Escolha o <strong>Aplicativo da Corporação</strong> via seletor (carregado automaticamente via API Report) ou digite o <strong>Package Name</strong> manualmente.
              </li>
              <li>
                Escolha a fonte de dados na aba de seleção:
                <ul style={{ marginLeft: "15px", listStyleType: "disc", marginTop: "4px" }}>
                  <li>
                    <strong>Filtros de Corporação:</strong> Insira o ID da Corporação (obrigatório). Os aplicativos disponíveis serão carregados instantaneamente via API Report.
                  </li>
                  <li>
                    <strong>Importar Planilha:</strong> Clique para fazer o upload de uma planilha (<strong>.xlsx</strong> ou <strong>.csv</strong>) e selecione a coluna com os números de série.
                  </li>
                </ul>
              </li>
              <li>
                Clique em <strong>Iniciar Consulta</strong>. A ferramenta trará os terminais e as versões instaladas.
              </li>
            </ol>
          </div>
        }
      />

      <ConfigPanel
        packages={packages}
        setPackages={setPackages}
        fetchAllApps={fetchAllApps}
        setFetchAllApps={setFetchAllApps}
        includeSystemApps={includeSystemApps}
        setIncludeSystemApps={setIncludeSystemApps}
        addLog={addLog}
        fileInputRef={fileInputRef}
        handleFile={handleFile}
        serials={serials}
        columns={columns}
        selectedCol={selectedCol}
        applyColumn={applyColumn}
        rawData={rawData}
        searchSource={searchSource}
        setSearchSource={setSearchSource}
        corporationId={corporationId}
        setCorporationId={setCorporationId}
        companyId={companyId}
        setCompanyId={setCompanyId}
        subsidiaryId={subsidiaryId}
        setSubsidiaryId={setSubsidiaryId}
        availableCorpApps={availableCorpApps}
        isLoadingCorpApps={isLoadingCorpApps}
        loadCorpApps={loadCorpApps}
        onlyWithApp={onlyWithApp}
        setOnlyWithApp={setOnlyWithApp}
        isProcessing={isProcessing}
        restrictions={restrictions}
      />

      <ProgressPanel
        results={results}
        exportExcel={exportExcel}
        startProcess={startProcess}
        resumeProcess={resumeProcess}
        pauseProcess={pauseProcess}
        stopProcess={stopProcess}
        resetProcess={resetProcess}
        isProcessing={isProcessing}
        isPaused={isPaused}
        serials={serials}
        searchSource={searchSource}
        corporationId={corporationId}
        stats={stats}
        tableRows={tableRows}
      />

      <LogPanel logs={logs} onClear={clearLogs} />
    </>
  );
}
