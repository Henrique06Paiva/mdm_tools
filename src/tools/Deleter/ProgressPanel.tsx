import { Play } from 'lucide-react';
import { api } from '../../api';

interface ProgressPanelProps {
  startProcess: () => void;
  isProcessing: boolean;
  serials: string[];
  stats: { total: number; done: number; fail: number; skip: number; retries: number };
  tableRows: any[];
}

export function ProgressPanel({
  startProcess,
  isProcessing,
  serials,
  stats,
  tableRows
}: ProgressPanelProps) {
  return (
    <div className="panel">
      <div className="panel-head">
        <span className="panel-title">Progresso da Deleção</span>
        <button className="btn btn-brand" onClick={startProcess} disabled={isProcessing || serials.length === 0 || !api.hasToken()}>
          <Play size={16} /> Iniciar Processo
        </button>
      </div>
      <div className="panel-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
          <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.total}</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Total</div>
          </div>
          <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--green)' }}>{stats.done}</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Sucesso</div>
          </div>
          <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--red)' }}>{stats.fail}</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Falhas</div>
          </div>
          <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.skip}</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>N/E</div>
          </div>
          <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.retries}</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Retries</div>
          </div>
        </div>

        <div style={{ height: '6px', background: 'var(--bg)', borderRadius: '99px', overflow: 'hidden', marginBottom: '24px', border: '1px solid var(--border)' }}>
          <div style={{ height: '100%', background: 'var(--brand)', width: `${stats.total > 0 ? ((stats.done + stats.fail + stats.skip) / stats.total) * 100 : 0}%`, transition: 'width 0.3s' }}></div>
        </div>

        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--bg)' }}>
          <table>
            <thead>
              <tr>
                <th>Serial</th>
                <th>ID do Eqp.</th>
                <th>Status</th>
                <th>Detalhe</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.serial}</td>
                  <td>{row.eqId}</td>
                  <td><span className={`badge ${row.statusBadge}`}>{row.statusBadge === 'badge-done' ? 'OK' : row.statusBadge === 'badge-warn' ? 'N/E' : 'Erro'}</span></td>
                  <td>{row.detailText}</td>
                </tr>
              ))}
              {tableRows.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text3)' }}>Nenhum dado processado ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
