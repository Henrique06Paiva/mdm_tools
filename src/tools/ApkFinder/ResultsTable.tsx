interface Result {
  id: number;
  name: string;
  packageName: string;
  version: string;
  fileSize: number | string;
  link: string;
}

export function ResultsTable({ results }: { results: Result[] }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <span className="panel-title">Resultados da Busca</span>
      </div>
      <div className="panel-body">
        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--bg)' }}>
          <table>
            <thead>
              <tr>
                <th>ID App</th>
                <th>Nome do App</th>
                <th>Package Name</th>
                <th>Versão</th>
                <th>Link de Download</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => (
                <tr key={idx}>
                  <td>{r.id}</td>
                  <td>{r.name}</td>
                  <td>{r.packageName}</td>
                  <td><span className="badge badge-done">{r.version}</span></td>
                  <td><a href={r.link} target="_blank" rel="noreferrer" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>🔗 Baixar APK</a></td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text3)' }}>Nenhum resultado ainda. Preencha os dados e clique em Buscar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
