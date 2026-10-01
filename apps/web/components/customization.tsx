import type { CatalogEntry } from "@coffee/shared";
import { Minus, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { money } from "@/lib/api";

export function ChoiceGroup<T extends string>({
  title,
  entries,
  value,
  onChange,
}: {
  title: string;
  entries: CatalogEntry<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold">{title}</legend>
      <div className="grid grid-cols-3 gap-2">
        {entries.map((entry) => (
          <label
            key={entry.id}
            className={`cursor-pointer rounded-xl border p-3 text-center transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 ${value === entry.id ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/50"}`}
          >
            <input
              type="radio"
              className="sr-only"
              name={title}
              checked={value === entry.id}
              onChange={() => onChange(entry.id)}
            />
            <span className="block text-sm font-semibold">{entry.name}</span>
            <span className="mt-1 block text-xs text-foreground/65">
              {title === "Size" && entry.price === 0
                ? "Included"
                : `${title === "Size" ? "+ " : ""}${money(entry.price)}`}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function IngredientGroup<T extends string>({
  title,
  entries,
  selected,
  onChange,
}: {
  title: string;
  entries: CatalogEntry<T>[];
  selected: T[];
  onChange: (values: T[]) => void;
}) {
  function remove(id: T) {
    const index = selected.lastIndexOf(id);
    onChange(selected.filter((_, i) => i !== index));
  }
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-semibold">
        {title}{" "}
        <span className="font-normal text-foreground/55">· optional</span>
      </legend>
      {entries.map((entry) => {
        const count = selected.filter((id) => id === entry.id).length;
        return (
          <div
            key={entry.id}
            className="flex items-center justify-between gap-2 border-b border-border/60 py-3 last:border-0"
          >
            <div>
              <span className="text-sm">{entry.name}</span>
              <span className="ml-2 text-xs text-foreground/55">
                + {money(entry.price)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label={`Remove ${entry.name}`}
                disabled={count === 0}
                onClick={() => remove(entry.id)}
              >
                <Minus size={14} />
              </Button>
              <output
                className="w-5 text-center text-sm tabular-nums"
                aria-label={`${entry.name} quantity`}
              >
                {count}
              </output>
              <Button
                variant="outline"
                size="icon"
                aria-label={`Add ${entry.name}`}
                onClick={() => onChange([...selected, entry.id])}
              >
                <Plus size={14} />
              </Button>
            </div>
          </div>
        );
      })}
    </fieldset>
  );
}
