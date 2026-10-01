"use client";
import { useEffect, useRef, useState } from "react";
import type { Catalog, DrinkInput, Receipt, ReceiptItem } from "@coffee/shared";
import { Coffee } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "./ui/button";
import { DrinkBuilder, type CartItem } from "./drink-builder";
import { OrderSummary, ReceiptCard } from "./order-summary";
export function CoffeeShop() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [notice, setNotice] = useState("");
  const nextId = useRef(1);
  async function loadCatalog() {
    setCatalogError(null);
    try {
      setCatalog(await api.catalog());
    } catch (error) {
      setCatalogError(
        error instanceof Error ? error.message : "Unable to load menu.",
      );
    }
  }
  useEffect(() => {
    void loadCatalog();
  }, []);
  function add(drink: DrinkInput, quote: ReceiptItem) {
    const item = { id: nextId.current++, drink, quote };
    setItems((previous) => [...previous, item]);
    setReceipt(null);
    setError(null);
    setNotice("Drink added to your order.");
  }
  async function submit() {
    if (pending || !items.length) return;
    setPending(true);
    setError(null);
    try {
      const result = await api.order({
        drinks: items.map((item) => item.drink),
      });
      setReceipt(result);
      setItems([]);
      setNotice("Order confirmed. Your receipt is ready.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to place order. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="Daily Ritual home"
          >
            <span className="rounded-xl bg-primary p-2 text-white">
              <Coffee size={23} />
            </span>
            <span className="font-serif text-2xl tracking-tight">
              daily ritual<span className="text-primary/50">.</span>
            </span>
          </Link>
          <span className="text-xs tracking-widest text-foreground/55">
            BREWED FOR YOU
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-primary/65">
            YOUR DAILY MOMENT OF JOY
          </p>
          <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
            Your cup. Your way.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-foreground/65">
            Start with a favorite, add a little personality. Craft your perfect
            coffee, tea, or milk — extra vanilla always welcome.
          </p>
        </div>
        <p role="status" className="sr-only">
          {notice}
        </p>
        {!catalog ? (
          <div className="rounded-2xl border border-border bg-card p-10">
            {catalogError ? (
              <div role="alert">
                <p>{catalogError}</p>
                <Button className="mt-4" onClick={() => void loadCatalog()}>
                  Try again
                </Button>
              </div>
            ) : (
              <p role="status" className="animate-pulse">
                Opening the menu…
              </p>
            )}
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[1.35fr_1fr]">
            <DrinkBuilder catalog={catalog} onAdd={add} disabled={pending} />
            <aside className="space-y-6 lg:sticky lg:top-6">
              <OrderSummary
                items={items}
                pending={pending}
                error={error}
                onRemove={(id) => {
                  setItems((previous) =>
                    previous.filter((item) => item.id !== id),
                  );
                  setError(null);
                  setNotice("Drink removed from your order.");
                }}
                onSubmit={() => void submit()}
              />
              {receipt && <ReceiptCard receipt={receipt} />}
              <p className="px-4 text-center text-xs leading-5 text-foreground/50">
                Thoughtfully made. Endlessly yours.
                <br />
                Every extra is a little more you.
              </p>
            </aside>
          </div>
        )}
      </main>
      <footer className="mx-auto max-w-6xl px-5 pb-8 text-xs text-foreground/45 sm:px-8">
        DAILY RITUAL &nbsp; / &nbsp; A customizable coffee shop
      </footer>
    </>
  );
}
