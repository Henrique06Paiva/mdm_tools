interface Log {
  id: number;
  message: string;
  type: string;
  time: string;
}

export function LogPanel({ logs }: { logs: Log[] }) {
  const getColorClass = (type: string) => {
    if (type === 'err') return 'var(--red)';
    if (type === 'ok') return 'var(--green)';
    if (type === 'warn') return 'var(--amber)';
    return 'var(--text2)';
  };

  return (
    <div className="panel">
      <div className="panel-head"><span className="panel-title">Log de Eventos do Sistema</span></div>
      <div className="panel-body" style={{ padding: '16px' }}>
        <div style={{ maxHeight: '200px', overflowY: 'auto', background: 'var(--bg)', padding: '16px', fontSize: '12px', fontFamily: 'var(--font-mono)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          {logs.map(log => (
            <div key={log.id} style={{ color: getColorClass(log.type), marginBottom: '6px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
              [{log.time}] {log.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
