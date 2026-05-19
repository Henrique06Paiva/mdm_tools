import { useDeleter } from './useDeleter';
import { ConfigPanel } from './ConfigPanel';
import { ProgressPanel } from './ProgressPanel';
import { LogPanel } from './LogPanel';
import { ManualViewer } from '../../components/ManualViewer';

export default function Deleter() {
  const {
    serials,
    isProcessing,
    logs,
    stats,
    tableRows,
    fileInputRef,
    handleFile,
    startProcess
  } = useDeleter();

  return (
    <>
      <ManualViewer 
        title="Deleção em Massa" 
        content={
          <div>
            <p style={{ marginBottom: '8px' }}><strong>Objetivo:</strong> Inativar e deletar definitivamente múltiplos equipamentos do MDM a partir de uma lista de seriais.</p>
            <p style={{ marginBottom: '8px' }}><strong>Como utilizar:</strong></p>
            <ol style={{ marginLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Clique na área pontilhada para fazer o upload de uma planilha (<strong>.xlsx</strong> ou <strong>.csv</strong>).</li>
              <li>A planilha deve conter os seriais dos equipamentos na <strong>primeira coluna</strong>. A leitura inicia a partir da segunda linha (assumindo que a primeira linha é o cabeçalho).</li>
              <li>Verifique a quantidade de seriais carregados que será exibida na tela.</li>
              <li>Clique em <strong>Iniciar Processo</strong>. <span style={{ color: 'var(--red)', fontWeight: 600 }}>CUIDADO:</span> Esta ação inativará e excluirá permanentemente os dispositivos. A ação é irreversível.</li>
              <li>Acompanhe o progresso na tabela e o log de eventos para verificar falhas ou seriais não encontrados (N/E).</li>
            </ol>
          </div>
        } 
      />

      <ConfigPanel 
        fileInputRef={fileInputRef}
        handleFile={handleFile}
        serials={serials}
      />

      <ProgressPanel 
        startProcess={startProcess}
        isProcessing={isProcessing}
        serials={serials}
        stats={stats}
        tableRows={tableRows}
      />

      <LogPanel logs={logs} />
    </>
  );
}
