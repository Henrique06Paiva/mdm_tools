import { useApkSearch } from "./useApkSearch";
import { SearchForm } from "./SearchForm";
import { ResultsTable } from "./ResultsTable";
import { LogPanel } from "./LogPanel";
import { ManualViewer } from "../../components/ManualViewer";

export default function ApkFinder() {
  const {
    corpId,
    setCorpId,
    packages,
    setPackages,
    versions,
    setVersions,
    availableApps,
    isLoadingApps,
    availableVersions,
    isLoadingVersions,
    isProcessing,
    isPaused,
    logs,
    results,
    startSearch,
    resumeSearch,
    pauseSearch,
    stopSearch,
    resetSearch,
    clearLogs,
    clearFilters,
    restrictions,
  } = useApkSearch();

  return (
    <>
      <SearchForm
        corpId={corpId}
        setCorpId={setCorpId}
        packages={packages}
        setPackages={setPackages}
        versions={versions}
        setVersions={setVersions}
        availableApps={availableApps}
        isLoadingApps={isLoadingApps}
        availableVersions={availableVersions}
        isLoadingVersions={isLoadingVersions}
        isProcessing={isProcessing}
        isPaused={isPaused}
        startSearch={startSearch}
        resumeSearch={resumeSearch}
        pauseSearch={pauseSearch}
        stopSearch={stopSearch}
        resetSearch={resetSearch}
        clearFilters={clearFilters}
        results={results}
        restrictions={restrictions}
      />

      <ResultsTable results={results} />

      <LogPanel logs={logs} onClear={clearLogs} />

      <ManualViewer
        title="Busca de APKs"
        content={
          <div className="space-y-2">
            <p>
              <strong>Objetivo:</strong> Localizar pacotes e versões de aplicativos cadastrados em uma corporação no MDM com links diretos de download.
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-1">
              <li>Insira o <strong>ID da Corporação</strong>.</li>
              <li>(Opcional) Filtre por <strong>Package Name</strong> ou <strong>Versão</strong> específica.</li>
              <li>Clique em <strong>Buscar APK</strong> para visualizar e baixar os arquivos.</li>
            </ol>
          </div>
        }
      />
    </>
  );
}
