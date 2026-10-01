import {
  drinkSchema,
  type Catalog,
  type CatalogEntry,
  type ReceiptItem,
} from "@coffee/shared";
export class Drink {
  private readonly base: CatalogEntry;
  private readonly size: CatalogEntry;
  private readonly ingredients: CatalogEntry[];
  constructor(input: unknown, catalog: Catalog) {
    const data = drinkSchema.parse(input);
    const find = (entries: CatalogEntry[], id: string): CatalogEntry => {
      const entry = entries.find((item) => item.id === id);
      if (!entry) throw new Error(`Catalog entry missing: ${id}`);
      if (!Number.isSafeInteger(entry.price) || entry.price < 0)
        throw new Error("Invalid catalog price");
      return { ...entry };
    };
    this.base = find(catalog.bases, data.base);
    this.size = find(catalog.sizes, data.size);
    this.ingredients = [
      ...data.syrups.map((id) => find(catalog.syrups, id)),
      ...data.toppings.map((id) => find(catalog.toppings, id)),
    ];
  }
  toReceiptItem(): ReceiptItem {
    return {
      description: [
        `${this.size.name} ${this.base.name}`,
        ...this.ingredients.map((item) => item.name),
      ].join(", "),
      price: this.ingredients.reduce(
        (total, item) => total + item.price,
        this.base.price + this.size.price,
      ),
    };
  }
}
