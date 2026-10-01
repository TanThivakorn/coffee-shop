import { orderSchema, type Catalog, type Receipt } from "@coffee/shared";
import { Drink } from "./drink";
export class Order {
  private readonly drinks: Drink[];
  constructor(
    input: unknown,
    private readonly catalog: Catalog,
  ) {
    this.drinks = orderSchema
      .parse(input)
      .drinks.map((drink) => new Drink(drink, catalog));
  }
  receipt(): Receipt {
    const items = this.drinks.map((drink) => drink.toReceiptItem());
    return {
      currency: this.catalog.currency,
      items,
      grandTotal: items.reduce((sum, item) => sum + item.price, 0),
    };
  }
}
