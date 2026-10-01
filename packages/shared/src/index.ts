import { z } from "zod";
export const baseIds = ["coffee", "tea", "milk"] as const;
export const sizeIds = ["small", "medium", "large"] as const;
export const syrupIds = ["vanilla", "caramel", "chocolate"] as const;
export const toppingIds = [
  "whipped_cream",
  "cinnamon",
  "marshmallows",
] as const;
export const drinkSchema = z
  .object({
    base: z.enum(baseIds),
    size: z.enum(sizeIds),
    syrups: z.array(z.enum(syrupIds)),
    toppings: z.array(z.enum(toppingIds)),
  })
  .strict();
export const orderSchema = z
  .object({ drinks: z.array(drinkSchema).min(1) })
  .strict();
export type DrinkInput = z.infer<typeof drinkSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export interface CatalogEntry<Id extends string = string> {
  id: Id;
  name: string;
  price: number;
}
export interface Catalog {
  currency: "THB";
  bases: CatalogEntry<DrinkInput["base"]>[];
  sizes: CatalogEntry<DrinkInput["size"]>[];
  syrups: CatalogEntry<DrinkInput["syrups"][number]>[];
  toppings: CatalogEntry<DrinkInput["toppings"][number]>[];
}
export interface ReceiptItem {
  description: string;
  price: number;
}
export interface Receipt {
  currency: "THB";
  items: ReceiptItem[];
  grandTotal: number;
}
