import { useBugs } from "./useBugs";
import { NewBugForm } from "./NewBugForm";
import { BugListTable } from "./BugListTable";
import { ManualViewer } from "../../components/ManualViewer";

export default function BugsHub() {
  const { bugs, isLoading, createBug } = useBugs();

  return (
    <div className="space-y-6">
      <NewBugForm onSubmit={createBug} isLoading={isLoading} />

      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Bugs Conhecidos Cadastrados ({bugs.length})
        </h4>
        <BugListTable bugs={bugs} />
      </div>

      <ManualViewer
        title="Catálogo de Bugs Conhecidos"
        content={
          <div className="space-y-2">
            <p>
              <strong>Objetivo:</strong> Catalogar falhas sistêmicas mapeadas para permitir a centralização e agrupamento de múltiplos chamados em uma única causa raiz.
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-1">
              <li>Cadastre o código e a severidade da falha identificada.</li>
              <li>Insira instruções de contorno (workaround) para orientar o time de atendimento.</li>
              <li>Acompanhe o status do bug conforme a equipe de engenharia realiza os deploys de correção.</li>
            </ol>
          </div>
        }
      />
    </div>
  );
}
