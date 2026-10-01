"use client";
import { useEffect, useState } from "react";
import type { Catalog, DrinkInput, ReceiptItem } from "@coffee/shared";
import { Coffee, Plus } from "lucide-react";
import { api, money } from "@/lib/api";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ChoiceGroup, IngredientGroup } from "./customization";
export interface CartItem {
  id: number;
  drink: DrinkInput;
  quote: ReceiptItem;
}
const initialDrink: DrinkInput = {
  base: "coffee",
  size: "small",
  syrups: [],
  toppings: [],
};
export function DrinkBuilder({
  catalog,
  onAdd,
  disabled,
}: {
  catalog: Catalog;
  onAdd: (drink: DrinkInput, quote: ReceiptItem) => void;
  disabled: boolean;
}) {
  const [drink, setDrink] = useState<DrinkInput>(initialDrink);
  const [quote, setQuote] = useState<ReceiptItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setQuote(null);
    setError(null);
    api
      .quote(drink)
      .then((result) => {
        if (active) setQuote(result);
      })
      .catch((error: unknown) => {
        if (active)
          setError(
            error instanceof Error ? error.message : "Unable to quote drink.",
          );
      });
    // A previous request should not replace the current drink's quote.
    return () => {
      active = false;
    };
  }, [drink]);
  const additions = [
    ...catalog.syrups.map((entry) => ({
      name: entry.name,
      count: drink.syrups.filter((id) => id === entry.id).length,
    })),
    ...catalog.toppings.map((entry) => ({
      name: entry.name,
      count: drink.toppings.filter((id) => id === entry.id).length,
    })),
  ].filter((item) => item.count > 0);
  return (
    <Card aria-labelledby="builder-title">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm">
          01
        </span>
        <div>
          <h2 id="builder-title" className="text-xl font-semibold">
            Make it yours
          </h2>
          <p className="mt-1 text-sm text-foreground/60">
            A little of this. An extra of that.
          </p>
        </div>
      </div>
      <fieldset disabled={disabled} className="space-y-6">
        <legend className="sr-only">Customize your drink</legend>
        <ChoiceGroup
          title="Base drink"
          entries={catalog.bases}
          value={drink.base}
          onChange={(base) => setDrink({ ...drink, base })}
        />
        <ChoiceGroup
          title="Size"
          entries={catalog.sizes}
          value={drink.size}
          onChange={(size) => setDrink({ ...drink, size })}
        />
        <div className="border-t border-border" />
        <IngredientGroup
          title="Syrups"
          entries={catalog.syrups}
          selected={drink.syrups}
          onChange={(syrups) => setDrink({ ...drink, syrups })}
        />
        <IngredientGroup
          title="Toppings"
          entries={catalog.toppings}
          selected={drink.toppings}
          onChange={(toppings) => setDrink({ ...drink, toppings })}
        />
      </fieldset>
      <div
        className="mt-6 rounded-xl bg-secondary/65 p-4"
        aria-label="Current drink"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-2">
            <Coffee size={19} className="mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold">
                {catalog.sizes.find((entry) => entry.id === drink.size)?.name}{" "}
                {catalog.bases.find((entry) => entry.id === drink.base)?.name}
              </h3>
              <p className="mt-1 text-xs text-foreground/60">
                {additions.length
                  ? additions
                      .map((item) => `${item.name} ×${item.count}`)
                      .join(" · ")
                  : "Simply delicious, just as it is."}
              </p>
            </div>
          </div>
          <div className="shrink-0 text-sm font-semibold" aria-live="polite">
            {quote ? money(quote.price) : error ? "—" : "Calculating…"}
          </div>
        </div>
        {error && (
          <div role="alert" className="mt-3 text-sm text-red-800">
            {error}{" "}
            <Button variant="ghost" onClick={() => setDrink({ ...drink })}>
              Retry quote
            </Button>
          </div>
        )}
        <Button
          className="mt-4 w-full"
          disabled={disabled || !quote || !!error}
          onClick={() => {
            if (quote) {
              onAdd(drink, quote);
              setDrink(initialDrink);
            }
          }}
        >
          <Plus size={17} />
          Add to order
        </Button>
        <p className="mt-2 text-center text-xs text-foreground/55">
          Priced by our shop. Final total confirmed at checkout.
        </p>
      </div>
    </Card>
  );
}
