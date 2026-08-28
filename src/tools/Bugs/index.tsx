import { useBugs } from "./useBugs";
import { NewBugForm } from "./NewBugForm";
import { ManualViewer } from "../../components/ManualViewer";
import type { KnownBug } from "../../types/bugs";

interface BugsHubProps {
  onGoToBugsList?: (bug?: KnownBug) => void;
}

export default function BugsHub({ onGoToBugsList }: BugsHubProps) {
  const { bugs, isLoading, createBug } = useBugs();

  return (
    <div className="space-y-6">
      <NewBugForm
        onSubmit={createBug}
        isLoading={isLoading}
        existingBugs={bugs}
        onViewInList={onGoToBugsList}
      />

      <ManualViewer
        title="Cadastro de Bugs Conhecidos"
        content={
          <div className="space-y-2">
            <p>
              <strong>Objetivo:</strong> Catalogar falhas sistêmicas mapeadas
              para permitir a centralização e agrupamento de múltiplos chamados
              em uma única causa raiz.
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-1">
              <li>
                O <strong>Código do Bug</strong> é gerado automaticamente em
                formato sequencial anual (<code>BUG-YYYY-XXX</code>).
              </li>
              <li>
                Insira o título, a descrição técnica e as instruções de contorno
                (workaround) para orientar a equipe de atendimento.
              </li>
              <li>
                Após o cadastro, visualize o bug na{" "}
                <strong>Lista de Bugs Conhecidos</strong> para edições e
                acompanhamento de status.
              </li>
            </ol>
          </div>
        }
      />
    </div>
  );
}
