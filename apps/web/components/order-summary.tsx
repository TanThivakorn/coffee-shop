import type { Receipt } from "@coffee/shared";
import { Check, ShoppingBag, Trash2 } from "lucide-react";
import { money } from "@/lib/api";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import type { CartItem } from "./drink-builder";
export function OrderSummary({
  items,
  pending,
  error,
  onRemove,
  onSubmit,
}: {
  items: CartItem[];
  pending: boolean;
  error: string | null;
  onRemove: (id: number) => void;
  onSubmit: () => void;
}) {
  return (
    <Card aria-labelledby="order-title">
      <div className="flex items-center justify-between">
        <h2 id="order-title" className="text-xl font-semibold">
          Your order
        </h2>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs">
          {items.length} {items.length === 1 ? "drink" : "drinks"}
        </span>
      </div>
      {items.length === 0 ? (
        <div className="py-12 text-center text-foreground/55">
          <ShoppingBag className="mx-auto mb-3" size={30} />
          <p className="text-sm">Good things start with a cup.</p>
          <p className="mt-1 text-xs">Build your first drink to get started.</p>
        </div>
      ) : (
        <ol className="my-5 divide-y divide-border">
          {items.map((item, index) => (
            <li key={item.id} className="py-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm leading-6">{item.quote.description}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  disabled={pending}
                  onClick={() => onRemove(item.id)}
                  aria-label={`Remove drink ${index + 1}`}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              <p className="mt-1 text-sm font-semibold">
                {money(item.quote.price)}
              </p>
            </li>
          ))}
        </ol>
      )}
      <div className="flex justify-between border-t border-border pt-5 font-semibold">
        <span>Estimated total</span>
        <span>
          {money(items.reduce((sum, item) => sum + item.quote.price, 0))}
        </span>
      </div>
      <p className="mt-2 text-xs text-foreground/55">
        THB · All listed prices are inclusive.
      </p>
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-800">
          {error}
        </p>
      )}
      <Button
        className="mt-5 w-full"
        disabled={pending || !items.length}
        onClick={onSubmit}
      >
        {pending ? "Placing order…" : "Place order"}
        {!pending && <span aria-hidden="true">→</span>}
      </Button>
    </Card>
  );
}
export function ReceiptCard({ receipt }: { receipt: Receipt }) {
  return (
    <Card aria-labelledby="receipt-title" className="border-primary/30">
      <div className="mb-4 flex items-center gap-2">
        <Check size={20} />
        <h2 id="receipt-title" className="text-xl font-semibold">
          Order confirmed
        </h2>
      </div>
      <p className="mb-4 text-sm text-foreground/60">
        Your ritual, made just right. Here’s your receipt.
      </p>
      <ol className="divide-y divide-border">
        {receipt.items.map((item, index) => (
          <li key={index} className="flex justify-between gap-4 py-3 text-sm">
            <span>{item.description}</span>
            <span className="whitespace-nowrap font-semibold">
              {money(item.price)}
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex justify-between border-t border-border pt-4 font-semibold">
        <span>Grand total</span>
        <span>{money(receipt.grandTotal)}</span>
      </div>
    </Card>
  );
}
