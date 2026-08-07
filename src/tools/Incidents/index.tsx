import { useIncidents } from "./useIncidents";
import { NewIncidentForm } from "./NewIncidentForm";

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
    </div>
  );
}
