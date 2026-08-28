import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { IncidentListTable } from "../IncidentListTable";
import type { BugIncident } from "../../../types/incidents";

describe("IncidentListTable Component", () => {
  const mockIncidents: BugIncident[] = [
    {
      id: "inc-1",
      bug_id: null,
      ticket_number: "INC-1001",
      title: "Falha de Conexão no Wifi",
      environment: "PRODUCTION",
      status: "OPEN",
      corporation_id: "corp-1",
      corporation_name: "Cliente Alpha",
      reporter_contact: "reporter@alpha.com",
      reported_at: "2026-08-28T14:00:00Z",
      observed_behavior: "Dispositivo desconecta sozinho",
      expected_behavior: "Permanecer conectado",
      evidence_urls: [],
      affected_devices_count: 10,
      affected_serials: ["S123", "S456"],
      is_notified: false,
      created_by: "Analista de Suporte",
      updated_by: "Analista de Suporte",
      created_at: "2026-08-28T14:00:00Z",
      updated_at: "2026-08-28T14:00:00Z",
    },
  ];

  it("should render fallback text when incidents list is empty", () => {
    render(<IncidentListTable incidents={[]} knownBugs={[]} />);
    expect(
      screen.getByText("Nenhum chamado encontrado com os filtros aplicados.")
    ).toBeInTheDocument();
  });

  it("should render the list of incidents correctly", () => {
    render(
      <IncidentListTable
        incidents={mockIncidents}
        knownBugs={[]}
        onViewIncident={vi.fn()}
      />
    );

    // Check header columns
    expect(screen.getByText("Ticket")).toBeInTheDocument();
    expect(screen.getByText("Título do Chamado")).toBeInTheDocument();

    // Check row values
    expect(screen.getByText("INC-1001")).toBeInTheDocument();
    expect(screen.getByText("Falha de Conexão no Wifi")).toBeInTheDocument();
    expect(screen.getByText("PRODUCTION")).toBeInTheDocument();
    expect(screen.getByText("Cliente Alpha")).toBeInTheDocument();
    expect(screen.getByText("Aberto")).toBeInTheDocument();
    expect(screen.getByText("Sem Vínculo")).toBeInTheDocument();
  });
});
