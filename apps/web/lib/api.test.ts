import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "./api";
afterEach(() => vi.unstubAllGlobals());
describe("API boundary", () => {
  it("sends complete configuration without removing duplicates", async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [], grandTotal: 0 }),
    });
    vi.stubGlobal("fetch", fetch);
    const order = {
      drinks: [
        {
          base: "coffee" as const,
          size: "large" as const,
          syrups: ["vanilla", "vanilla"] as const,
          toppings: [],
        },
      ],
    };
    await api.order({
      drinks: order.drinks.map((drink) => ({
        ...drink,
        syrups: [...drink.syrups],
      })),
    });
    expect(fetch).toHaveBeenCalledWith(
      "/api/orders",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(order),
        headers: { "Content-Type": "application/json" },
      }),
    );
  });
  it.each([
    [400, "Please check your drink selections"],
    [500, "temporarily unavailable"],
  ])("explains HTTP %i errors", async (status, message) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status }));
    await expect(api.catalog()).rejects.toThrow(String(message));
  });
  it("explains network errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    await expect(api.catalog()).rejects.toThrow("Cannot reach the coffee shop");
  });
  it("preserves abort cancellation", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new DOMException("Aborted", "AbortError")),
    );
    await expect(
      api.quote({ base: "coffee", size: "small", syrups: [], toppings: [] }),
    ).rejects.toMatchObject({ name: "AbortError" });
  });
});
