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

      <ManualViewer
        title="Version Checker"
        content={
          <div className="space-y-2">
            <p>
              <strong>Objetivo:</strong> Consultar em lote a versão de aplicativos instalados nos terminais e o status de conectividade (Energia, Conexão e Última Atualização).
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-1">
              <li>Selecione o <strong>Aplicativo da Corporação</strong> via lista ou digite o <strong>Package Name</strong>.</li>
              <li>Escolha se deseja buscar por <strong>Filtros de Corporação</strong> ou <strong>Importar Planilha</strong>.</li>
              <li>Clique em <strong>Iniciar Consulta</strong> para acompanhar o progresso em tempo real.</li>
            </ol>
          </div>
        }
      />
    </>
  );
}
