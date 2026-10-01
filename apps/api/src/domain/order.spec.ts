import { drinkSchema, orderSchema, type DrinkInput } from "@coffee/shared";
import { catalog } from "./catalog";
import { Drink } from "./drink";
import { Order } from "./order";
const plain: DrinkInput = {
  base: "coffee",
  size: "small",
  syrups: [],
  toppings: [],
};
const item = (patch: Partial<DrinkInput> = {}) =>
  new Drink({ ...plain, ...patch }, catalog).toReceiptItem();
describe("Drink composition", () => {
  test.each([
    ["coffee", 7000],
    ["tea", 6000],
    ["milk", 5000],
  ] as const)("%s base costs %i satang", (base, price) =>
    expect(item({ base }).price).toBe(price),
  );
  test.each([
    ["small", 7000],
    ["medium", 8500],
    ["large", 10000],
  ] as const)("%s coffee has correct size upgrade", (size, price) =>
    expect(item({ size }).price).toBe(price),
  );
  test.each([
    ["vanilla", 8500],
    ["caramel", 8500],
    ["chocolate", 9000],
  ] as const)("%s syrup is charged", (syrup, price) =>
    expect(item({ syrups: [syrup] }).price).toBe(price),
  );
  test.each([
    ["whipped_cream", 9000],
    ["cinnamon", 7500],
    ["marshmallows", 8500],
  ] as const)("%s topping is charged", (topping, price) =>
    expect(item({ toppings: [topping] }).price).toBe(price),
  );
  test("combines multiple ingredients", () =>
    expect(
      item({
        size: "large",
        syrups: ["vanilla", "caramel"],
        toppings: ["whipped_cream"],
      }),
    ).toEqual({
      description: "Large Coffee, Vanilla, Caramel, Whipped Cream",
      price: 15000,
    }));
  test("preserves and charges both vanilla additions", () =>
    expect(
      item({
        size: "large",
        syrups: ["vanilla", "vanilla"],
        toppings: ["whipped_cream"],
      }),
    ).toEqual({
      description: "Large Coffee, Vanilla, Vanilla, Whipped Cream",
      price: 15000,
    }));
  test("preserves duplicate toppings", () =>
    expect(item({ toppings: ["cinnamon", "cinnamon"] })).toEqual({
      description: "Small Coffee, Cinnamon, Cinnamon",
      price: 8000,
    }));
  test("describes a drink without extras without trailing commas", () =>
    expect(item({ base: "milk", size: "medium" }).description).toBe(
      "Medium Milk",
    ));
  test("snapshots configuration so caller mutation cannot change a drink", () => {
    const config = structuredClone(catalog);
    const input = { ...plain, syrups: ["vanilla"] as DrinkInput["syrups"] };
    const drink = new Drink(input, config);
    input.syrups.push("caramel");
    config.bases[0].price = 1;
    expect(drink.toReceiptItem().price).toBe(8500);
  });
  test("rejects an incomplete catalog", () =>
    expect(() => new Drink(plain, { ...catalog, bases: [] })).toThrow(
      "Catalog entry missing",
    ));
  test("rejects fractional configured money", () =>
    expect(
      () =>
        new Drink(plain, {
          ...catalog,
          bases: [{ id: "coffee", name: "Coffee", price: 1.5 }],
        }),
    ).toThrow("Invalid catalog price"));
});
describe("Order receipts", () => {
  test("single drink receipt includes individual price and total", () =>
    expect(new Order({ drinks: [plain] }, catalog).receipt()).toEqual({
      currency: "THB",
      items: [{ description: "Small Coffee", price: 7000 }],
      grandTotal: 7000,
    }));
  test("multiple different drinks have independent prices and correct grand total", () =>
    expect(
      new Order(
        {
          drinks: [
            {
              ...plain,
              size: "large",
              syrups: ["vanilla", "vanilla"],
              toppings: ["whipped_cream"],
            },
            { ...plain, base: "tea", size: "medium", toppings: ["cinnamon"] },
          ],
        },
        catalog,
      ).receipt(),
    ).toEqual({
      currency: "THB",
      items: [
        {
          description: "Large Coffee, Vanilla, Vanilla, Whipped Cream",
          price: 15000,
        },
        { description: "Medium Tea, Cinnamon", price: 8000 },
      ],
      grandTotal: 23000,
    }));
  test("identical drinks remain separate receipt items", () =>
    expect(
      new Order({ drinks: [plain, plain] }, catalog).receipt().items,
    ).toHaveLength(2));
  test("returned receipts cannot mutate future receipts", () => {
    const order = new Order({ drinks: [plain] }, catalog);
    order.receipt().items[0].price = 0;
    expect(order.receipt().grandTotal).toBe(7000);
  });
});
describe("Request validation", () => {
  test.each([
    { ...plain, base: "juice" },
    { ...plain, size: "huge" },
    { ...plain, syrups: ["unknown"] },
    { ...plain, toppings: ["nuts"] },
    { base: "coffee" },
    { ...plain, syrups: "vanilla" },
    { ...plain, toppings: null },
    { ...plain, price: 0 },
    { ...plain, syrups: Array(21).fill("vanilla") },
  ])("rejects invalid drink %j", (input) =>
    expect(drinkSchema.safeParse(input).success).toBe(false),
  );
  test.each([
    {},
    { drinks: [] },
    { drinks: "coffee" },
    { drinks: Array(51).fill(plain) },
  ])("rejects invalid order %j", (input) =>
    expect(orderSchema.safeParse(input).success).toBe(false),
  );
  test("accepts duplicates without modifying the arrays", () => {
    const input = {
      ...plain,
      syrups: ["vanilla", "vanilla"],
      toppings: ["cinnamon", "cinnamon"],
    };
    expect(drinkSchema.parse(input)).toEqual(input);
  });
  test("validates domain input even outside HTTP", () =>
    expect(() => new Order({ drinks: [] }, catalog)).toThrow());
});
