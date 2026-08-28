import { describe, it, expect } from "vitest";
import { formatIncidentStatus, getIncidentStatusBadge } from "../incidents";

describe("incidents helper functions", () => {
  describe("formatIncidentStatus", () => {
    it("should translate OPEN to Aberto", () => {
      expect(formatIncidentStatus("OPEN")).toBe("Aberto");
    });

    it("should translate IN_ANALYSIS to Em Análise", () => {
      expect(formatIncidentStatus("IN_ANALYSIS")).toBe("Em Análise");
    });

    it("should translate DEV_TEAM to Time de Desenvolvimento", () => {
      expect(formatIncidentStatus("DEV_TEAM")).toBe("Time de Desenvolvimento");
    });

    it("should translate RESOLVED to Resolvido", () => {
      expect(formatIncidentStatus("RESOLVED")).toBe("Resolvido");
    });

    it("should translate CANCELLED to Cancelado", () => {
      expect(formatIncidentStatus("CANCELLED")).toBe("Cancelado");
    });

    it("should fallback to raw value if not found", () => {
      expect(formatIncidentStatus("UNKNOWN" as any)).toBe("UNKNOWN");
    });

    it("should default to Aberto if value is falsy", () => {
      expect(formatIncidentStatus(null)).toBe("Aberto");
      expect(formatIncidentStatus(undefined)).toBe("Aberto");
    });
  });

  describe("getIncidentStatusBadge", () => {
    it("should return correct classes for OPEN", () => {
      const cls = getIncidentStatusBadge("OPEN");
      expect(cls).toContain("text-sky-600");
    });

    it("should return correct classes for IN_ANALYSIS", () => {
      const cls = getIncidentStatusBadge("IN_ANALYSIS");
      expect(cls).toContain("text-amber-600");
    });

    it("should return correct classes for DEV_TEAM", () => {
      const cls = getIncidentStatusBadge("DEV_TEAM");
      expect(cls).toContain("text-violet-600");
    });

    it("should return correct classes for RESOLVED", () => {
      const cls = getIncidentStatusBadge("RESOLVED");
      expect(cls).toContain("text-emerald-600");
    });

    it("should return correct classes for CANCELLED", () => {
      const cls = getIncidentStatusBadge("CANCELLED");
      expect(cls).toContain("bg-muted");
    });
  });
});
