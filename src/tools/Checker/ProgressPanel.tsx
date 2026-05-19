import { Download, Play } from 'lucide-react';
import { api } from '../../api';

interface ProgressPanelProps {
  results: any[];
  exportExcel: () => void;
  startProcess: () => void;
  isProcessing: boolean;
  serials: string[];
  stats: { total: number; done: number; fail: number };
  tableRows: any[];
}

export function ProgressPanel({
  results,
  exportExcel,
  startProcess,
  isProcessing,
  serials,
  stats,
  tableRows
}: ProgressPanelProps) {
  return (
    <div className="panel">
      <div className="panel-head">
        <span className="panel-title">Progresso da Consulta</span>
        <div style={{ display: 'flex', gap: '12px' }}>
          {results.length > 0 && (
            <button className="btn" onClick={exportExcel}>
              <Download size={16} /> Baixar Relatório
            </button>
          )}
          <button className="btn btn-brand" onClick={startProcess} disabled={isProcessing || serials.length === 0 || !api.hasToken()}>
            <Play size={16} /> Iniciar Consulta
          </button>
        </div>
      </div>
      <div className="panel-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ padding: '24px', background: 'var(--bg)', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{stats.total}</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>Total Seriais</div>
          </div>
          <div style={{ padding: '24px', background: 'var(--bg)', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>{stats.done}</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>Sucesso</div>
          </div>
          <div style={{ padding: '24px', background: 'var(--bg)', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>{stats.fail}</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>Erros / N.E.</div>
          </div>
          <div style={{ padding: '24px', background: 'var(--bg)', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>
              {stats.total > 0 ? Math.round(((stats.done + stats.fail) / stats.total) * 100) : 0}%
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>Concluído</div>
          </div>
        </div>

        <div style={{ height: '6px', background: 'var(--bg)', borderRadius: '99px', overflow: 'hidden', marginBottom: '24px', border: '1px solid var(--border)' }}>
          <div style={{ height: '100%', background: 'var(--brand)', width: `${stats.total > 0 ? ((stats.done + stats.fail) / stats.total) * 100 : 0}%`, transition: 'width 0.3s' }}></div>
        </div>

        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--bg)' }}>
          <table>
            <thead>
              <tr>
                <th>Serial Number</th>
                <th>Nome do Eqp.</th>
                <th>Versões</th>
                <th>Status</th>
                <th>Conexão</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.serial}</td>
                  <td>{row.eqName}</td>
                  <td>{row.versionStr}</td>
                  <td><span className={`badge ${row.statusBadge}`}>{row.statusText}</span></td>
                  <td><span className={`badge ${row.onlineBadge}`}>{row.onlineText}</span></td>
                </tr>
              ))}
              {tableRows.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text3)' }}>Nenhum dado processado ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
