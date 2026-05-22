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
    isProcessing,
    isPaused,
    logs,
    addLog,
    results,
    startSearch,
    resumeSearch,
    pauseSearch,
    stopSearch,
  } = useApkSearch();

  return (
    <>
      <ManualViewer
        title="APK Finder"
        content={
          <div>
            <p style={{ marginBottom: "8px" }}>
              <strong>Objetivo:</strong> Procurar ativamente quais equipamentos
              possuem uma (ou mais) versão(ões) específica(s) de um aplicativo
              instalada, iterando sobre todo o inventário do MDM.
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
                Insira o <strong>ID da Corporação</strong> (opcional). Se
                deixado em branco, a busca irá iterar sobre os equipamentos
                acessíveis na raiz da sua conta.
              </li>
              <li>
                Defina os <strong>Package Names</strong> e as{" "}
                <strong>Versões</strong> exatas que você deseja encontrar (ex:{" "}
                <code>com.mdmservice</code> e <code>2.0.1</code>).
              </li>
              <li>
                Você pode adicionar múltiplos pacotes e versões se quiser buscar
                equipamentos que possuam a combinação específica.
              </li>
              <li>
                Clique em <strong>Iniciar Busca</strong>. A ferramenta paginará
                através da API buscando equipamentos ativos que reportem a
                versão solicitada do aplicativo.
              </li>
              <li>
                Acompanhe o painel de resultados e o log de execução. A tabela
                listará todos os equipamentos compatíveis encontrados.
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
        isProcessing={isProcessing}
        isPaused={isPaused}
        startSearch={startSearch}
        resumeSearch={resumeSearch}
        pauseSearch={pauseSearch}
        stopSearch={stopSearch}
        results={results}
        addLog={addLog}
      />

      <ResultsTable results={results} />

      <LogPanel logs={logs} />
    </>
  );
}
