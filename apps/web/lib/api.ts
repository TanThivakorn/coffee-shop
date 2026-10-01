import type {
  Catalog,
  DrinkInput,
  OrderInput,
  Receipt,
  ReceiptItem,
} from "@coffee/shared";
async function request<T>(path: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/${path}`, {
      method: body ? "POST" : "GET",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the coffee shop. Please try again.");
  }
  if (!response.ok) {
    if (response.status === 400)
      throw new Error("Please check your drink selections.");
    throw new Error(
      "The coffee shop is temporarily unavailable. Please try again.",
    );
  }
  return response.json() as Promise<T>;
}
export const api = {
  catalog: () => request<Catalog>("catalog"),
  quote: (drink: DrinkInput) => request<ReceiptItem>("quotes", drink),
  order: (order: OrderInput) => request<Receipt>("orders", order),
};
export const money = (satang: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "THB",
    currencyDisplay: "code",
  }).format(satang / 100);
