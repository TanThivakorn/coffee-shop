import type {
  Catalog,
  DrinkInput,
  OrderInput,
  Receipt,
  ReceiptItem,
} from "@coffee/shared";
async function request<T>(
  path: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/${path}`, {
      method: body ? "POST" : "GET",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "AbortError"
    )
      throw error;
    throw new Error("Cannot reach the coffee shop. Please try again.");
  }
  if (!response.ok) {
    if (response.status === 400)
      throw new Error(
        "Please check your drink selections. Use up to 20 syrups and 20 toppings per drink, and 50 drinks per order.",
      );
    throw new Error(
      "The coffee shop is temporarily unavailable. Please try again.",
    );
  }
  return response.json() as Promise<T>;
}
export const api = {
  catalog: () => request<Catalog>("catalog"),
  quote: (drink: DrinkInput, signal?: AbortSignal) =>
    request<ReceiptItem>("quotes", drink, signal),
  order: (order: OrderInput) => request<Receipt>("orders", order),
};
export const money = (satang: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "THB",
    currencyDisplay: "code",
  }).format(satang / 100);
