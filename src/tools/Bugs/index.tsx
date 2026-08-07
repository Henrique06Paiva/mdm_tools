import { useBugs } from "./useBugs";
import { NewBugForm } from "./NewBugForm";
import { BugListTable } from "./BugListTable";

export default function BugsHub() {
  const { bugs, isLoading, createBug } = useBugs();

  return (
    <div className="space-y-6">
      <NewBugForm onSubmit={createBug} isLoading={isLoading} />

      <div className="space-y-3">
        <h4 className="text-lg font-semibold tracking-tight">
          Bugs Conhecidos Cadastrados ({bugs.length})
        </h4>
        <BugListTable bugs={bugs} />
      </div>
    </div>
  );
}
