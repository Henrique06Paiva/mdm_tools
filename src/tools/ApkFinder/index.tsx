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
      <ManualViewer
        title="APK Finder"
        content={
          <div>
            <p style={{ marginBottom: "8px" }}>
              <strong>Objetivo:</strong> Procurar os APKs e versões de aplicativos cadastrados em uma determinada corporação no MDM, permitindo obter informações e links diretos para download dos arquivos.
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
                Insira o <strong>ID da Corporação</strong> (obrigatório).
              </li>
              <li>
                (Opcional) Defina os <strong>Package Names</strong> e as{" "}
                <strong>Versões</strong> exatas que você deseja encontrar (ex:{" "}
                <code>com.br.octostore</code> e <code>1.5.1</code>). Se deixados em branco, todos os aplicativos e versões da corporação serão listados.
              </li>
              <li>
                Você pode adicionar múltiplos pacotes e versões se quiser buscar
                combinações específicas.
              </li>
              <li>
                Clique em <strong>Buscar APK</strong>. A ferramenta irá listar as correspondências com os links diretos para download.
              </li>
              <li>
                Acompanhe o painel de resultados e o log de execução. A tabela
                listará todos os APKs encontrados.
              </li>
            </ol>
          </div>
        }
      />

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
    </>
  );
}
