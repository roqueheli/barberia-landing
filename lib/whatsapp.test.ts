import { describe, expect, it } from "vitest";
import { toWhatsAppNumber } from "./whatsapp";

describe("toWhatsAppNumber", () => {
  it("antepone 56 a un número local chileno sin código de país (formato real de Klipper)", () => {
    expect(toWhatsAppNumber("9 8336 5087")).toBe("56983365087");
    expect(toWhatsAppNumber("229503088")).toBe("56229503088");
  });

  it("no duplica el 56 si ya viene incluido", () => {
    expect(toWhatsAppNumber("+56 9 8336 5087")).toBe("56983365087");
    expect(toWhatsAppNumber("56983365087")).toBe("56983365087");
  });

  it("devuelve undefined para valores vacíos o nulos", () => {
    expect(toWhatsAppNumber(null)).toBeUndefined();
    expect(toWhatsAppNumber(undefined)).toBeUndefined();
    expect(toWhatsAppNumber("")).toBeUndefined();
  });
});
