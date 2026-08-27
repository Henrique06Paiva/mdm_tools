import { useIncidents } from "./useIncidents";
import { NewIncidentForm } from "./NewIncidentForm";
import { ManualViewer } from "../../components/ManualViewer";

interface IncidentsProps {
  onGoToBugsHub?: () => void;
}

export default function Incidents({ onGoToBugsHub }: IncidentsProps) {
  const { knownBugs, isLoading, createIncident } = useIncidents();

  return (
    <div className="space-y-6">
      <NewIncidentForm
        knownBugs={knownBugs}
        onSubmit={createIncident}
        isLoading={isLoading}
        onGoToBugsHub={onGoToBugsHub}
      />

      <ManualViewer
        title="Gestão e Registro de Chamados"
        content={
          <div className="space-y-2">
            <p>
              <strong>Objetivo:</strong> Registrar chamados operacionais de forma padronizada para análise de N3 e deduplicação de falhas sistêmicas.
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-1">
              <li>Preencha os <strong>6 campos obrigatórios</strong>: Título, Ambiente, Data, ID Corp, Erro Observado e Comportamento Esperado.</li>
              <li>Vincule a um <strong>Bug Conhecido</strong> caso a falha já seja catalogada para agrupamento automático.</li>
              <li>Anexe prints ou cole imagens via <strong>Ctrl+V</strong> no campo de evidências.</li>
            </ol>
          </div>
        }
      />
    </div>
  );
}
