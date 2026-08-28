import { describe, it, expect } from "vitest";
import { formatBugSeverity, formatBugStatus } from "../bugs";

describe("bugs helper functions", () => {
  describe("formatBugSeverity", () => {
    it("should translate CRITICAL to Crítica", () => {
      expect(formatBugSeverity("CRITICAL")).toBe("Crítica");
    });

    it("should translate HIGH to Alta", () => {
      expect(formatBugSeverity("HIGH")).toBe("Alta");
    });

    it("should translate MEDIUM to Média", () => {
      expect(formatBugSeverity("MEDIUM")).toBe("Média");
    });

    it("should translate LOW to Baixa", () => {
      expect(formatBugSeverity("LOW")).toBe("Baixa");
    });

    it("should fallback to raw value if not found", () => {
      expect(formatBugSeverity("UNKNOWN" as any)).toBe("UNKNOWN");
    });

    it("should default to empty string if value is falsy", () => {
      expect(formatBugSeverity(null)).toBe("");
      expect(formatBugSeverity(undefined)).toBe("");
    });
  });

  describe("formatBugStatus", () => {
    it("should translate INVESTIGATING to Em Análise", () => {
      expect(formatBugStatus("INVESTIGATING")).toBe("Em Análise");
    });

    it("should translate WORKAROUND_READY to Contorno Pronto", () => {
      expect(formatBugStatus("WORKAROUND_READY")).toBe("Contorno Pronto");
    });

    it("should translate IN_DEVELOPMENT to Em Correção", () => {
      expect(formatBugStatus("IN_DEVELOPMENT")).toBe("Em Correção");
    });

    it("should translate AWAITING_RELEASE to Aguardando Deploy", () => {
      expect(formatBugStatus("AWAITING_RELEASE")).toBe("Aguardando Deploy");
    });

    it("should translate RESOLVED to Resolvido", () => {
      expect(formatBugStatus("RESOLVED")).toBe("Resolvido");
    });

    it("should translate CLOSED to Encerrado", () => {
      expect(formatBugStatus("CLOSED")).toBe("Encerrado");
    });

    it("should fallback to raw value if not found", () => {
      expect(formatBugStatus("UNKNOWN" as any)).toBe("UNKNOWN");
    });

    it("should default to empty string if value is falsy", () => {
      expect(formatBugStatus(null)).toBe("");
      expect(formatBugStatus(undefined)).toBe("");
    });
  });
});
