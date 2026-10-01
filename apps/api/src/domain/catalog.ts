import type { Catalog } from "@coffee/shared";
// All prices are integer satang. Size prices are additive upgrades.
export const catalog: Catalog = {
  currency: "THB",
  bases: [
    { id: "coffee", name: "Coffee", price: 7000 },
    { id: "tea", name: "Tea", price: 6000 },
    { id: "milk", name: "Milk", price: 5000 },
  ],
  sizes: [
    { id: "small", name: "Small", price: 0 },
    { id: "medium", name: "Medium", price: 1500 },
    { id: "large", name: "Large", price: 3000 },
  ],
  syrups: [
    { id: "vanilla", name: "Vanilla", price: 1500 },
    { id: "caramel", name: "Caramel", price: 1500 },
    { id: "chocolate", name: "Chocolate", price: 2000 },
  ],
  toppings: [
    { id: "whipped_cream", name: "Whipped Cream", price: 2000 },
    { id: "cinnamon", name: "Cinnamon", price: 500 },
    { id: "marshmallows", name: "Marshmallows", price: 1500 },
  ],
};
