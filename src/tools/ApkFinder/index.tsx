import { useApkSearch } from './useApkSearch';
import { SearchForm } from './SearchForm';
import { ResultsTable } from './ResultsTable';
import { LogPanel } from './LogPanel';

export default function ApkFinder() {
  const {
    corpId, setCorpId,
    packages, setPackages,
    versions, setVersions,
    isProcessing,
    logs, addLog,
    results,
    startSearch
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
        isProcessing={isProcessing}
        startSearch={startSearch}
        results={results}
        addLog={addLog}
      />

      <ResultsTable results={results} />

      <LogPanel logs={logs} />
    </>
  );
}
