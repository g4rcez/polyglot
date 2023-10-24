import { describe, expect, it } from "vitest";
import { createPolyglot } from "~/polyglot/polyglot.core";

const config = createPolyglot({
  language: "pt-BR",
  map: () =>
    ({
      temperature: "Temperatura {{temp|celsius}}. Apenas um {{teste}}",
      today: "Hoje é dia {{day|date}}",
      time: "São {{time|time}} horas",
      datetime: "{{datetime|datetime}}",
    }) as const,
});

describe("Should test polyglot parser", () => {
  it("should test simple parse string", () => {
    const result = config.get("temperature", { variables: { temp: 32, teste: "teste" } });
    expect(result).toBe("Temperatura 32 °C. Apenas um teste");
  });

  it("should parse with date", () => {
    const result = config.get("today", { variables: { day: new Date(1970, 0, 1) } });
    expect(result).toBe("Hoje é dia 01/01/1970");
  });

  it("should parse with time", () => {
    const result = config.get("time", { variables: { time: new Date(1970, 0, 0, 15, 0, 0, 0) } });
    expect(result).toBe("São 15:00 horas");
  });

  it("should parse with datetime", () => {
    const result = config.get("datetime", { variables: { datetime: new Date(1970, 0, 1, 15, 0, 0, 0) } });
    expect(result).toBe("01/01/1970, 15:00");
  });
});
