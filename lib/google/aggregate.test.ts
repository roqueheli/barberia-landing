import { describe, expect, it } from "vitest";
import { combineReviews, type BranchPlaceDetails } from "./aggregate";

describe("combineReviews", () => {
  it("devuelve array vacío si no hay sucursales", () => {
    expect(combineReviews([])).toEqual([]);
  });

  it("combina reseñas de todas las sucursales, ordenadas por más reciente, tope de 6", () => {
    const branches: BranchPlaceDetails[] = [
      {
        sucursalNombre: "A",
        details: {
          reviews: [
            { rating: 5, text: { text: "vieja" }, publishTime: "2026-01-01T00:00:00Z" },
            { rating: 4, text: { text: "nueva" }, publishTime: "2026-06-01T00:00:00Z" },
          ],
        },
      },
      {
        sucursalNombre: "B",
        details: {
          reviews: Array.from({ length: 5 }, (_, i) => ({
            rating: 5,
            text: { text: `B-${i}` },
            publishTime: `2026-03-0${i + 1}T00:00:00Z`,
          })),
        },
      },
    ];
    const result = combineReviews(branches);
    expect(result).toHaveLength(6);
    expect(result[0].text).toBe("nueva");
  });

  it("descarta reseñas sin rating o sin texto, sin lanzar", () => {
    const branches: BranchPlaceDetails[] = [
      {
        sucursalNombre: "A",
        details: {
          reviews: [
            { rating: 5, text: { text: "completa" } },
            { rating: 5, text: { text: "" } },
            { text: { text: "sin rating" } },
          ],
        },
      },
    ];
    const result = combineReviews(branches);
    expect(result).toEqual([expect.objectContaining({ text: "completa" })]);
  });

  it("branch sin reviews no aporta nada, sin lanzar", () => {
    const branches: BranchPlaceDetails[] = [{ sucursalNombre: "A", details: {} }];
    expect(combineReviews(branches)).toEqual([]);
  });
});
