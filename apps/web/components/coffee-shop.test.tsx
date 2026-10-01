import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CoffeeShop } from "./coffee-shop";
import { api } from "@/lib/api";
import { catalog, plainQuote, specialQuote } from "../test/fixtures";
vi.mock("@/lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api")>()),
  api: { catalog: vi.fn(), quote: vi.fn(), order: vi.fn() },
}));
const user = () => userEvent.setup();
async function ready() {
  render(<CoffeeShop />);
  await screen.findByRole("heading", { name: "Make it yours" });
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Add to order" })).toBeEnabled(),
  );
}
async function add() {
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Add to order" })).toBeEnabled(),
  );
  await user().click(screen.getByRole("button", { name: "Add to order" }));
}
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(api.catalog).mockResolvedValue(catalog);
  vi.mocked(api.quote).mockResolvedValue(plainQuote);
  vi.mocked(api.order).mockResolvedValue({
    currency: "THB",
    items: [plainQuote],
    grandTotal: 7000,
  });
});
describe("Coffee ordering", () => {
  it.each(["Coffee", "Tea", "Milk"])("selects %s as base", async (name) => {
    await ready();
    await user().click(
      screen.getByRole("radio", { name: new RegExp(`^${name}`) }),
    );
    expect(
      screen.getByRole("radio", { name: new RegExp(`^${name}`) }),
    ).toBeChecked();
    expect(
      within(screen.getByLabelText("Current drink")).getByRole("heading"),
    ).toHaveTextContent(`Small ${name}`);
  });
  it.each(["Small", "Medium", "Large"])("selects %s size", async (name) => {
    await ready();
    await user().click(
      screen.getByRole("radio", { name: new RegExp(`^${name}`) }),
    );
    expect(
      screen.getByRole("radio", { name: new RegExp(`^${name}`) }),
    ).toBeChecked();
    expect(
      within(screen.getByLabelText("Current drink")).getByRole("heading"),
    ).toHaveTextContent(`${name} Coffee`);
  });
  it("adds vanilla and clearly represents duplicate quantities", async () => {
    await ready();
    await user().click(screen.getByRole("button", { name: "Add Vanilla" }));
    expect(screen.getByText("Vanilla ×1")).toBeVisible();
    await user().click(screen.getByRole("button", { name: "Add Vanilla" }));
    expect(screen.getByText("Vanilla ×2")).toBeVisible();
    expect(screen.getByLabelText("Vanilla quantity")).toHaveTextContent("2");
    await waitFor(() =>
      expect(api.quote).toHaveBeenLastCalledWith(
        expect.objectContaining({ syrups: ["vanilla", "vanilla"] }),
        expect.any(AbortSignal),
      ),
    );
  });
  it("decreases and removes an ingredient without going below zero", async () => {
    await ready();
    const u = user();
    await u.click(screen.getByRole("button", { name: "Add Vanilla" }));
    await u.click(screen.getByRole("button", { name: "Add Vanilla" }));
    await u.click(screen.getByRole("button", { name: "Remove Vanilla" }));
    expect(screen.getByText("Vanilla ×1")).toBeVisible();
    await u.click(screen.getByRole("button", { name: "Remove Vanilla" }));
    expect(screen.queryByText("Vanilla ×1")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove Vanilla" }),
    ).toBeDisabled();
  });
  it("adds duplicate toppings", async () => {
    await ready();
    await user().click(
      screen.getByRole("button", { name: "Add Whipped Cream" }),
    );
    await user().click(
      screen.getByRole("button", { name: "Add Whipped Cream" }),
    );
    expect(screen.getByText("Whipped Cream ×2")).toBeVisible();
  });
  it("adds the configured drink and resets the builder", async () => {
    await ready();
    await user().click(screen.getByRole("button", { name: "Add Vanilla" }));
    vi.mocked(api.quote).mockResolvedValue({
      description: "Small Coffee, Vanilla",
      price: 8500,
    });
    await add();
    expect(
      within(screen.getByRole("region", { name: "Your order" })).getByText(
        "Small Coffee, Vanilla",
      ),
    ).toBeVisible();
    expect(screen.getByLabelText("Vanilla quantity")).toHaveTextContent("0");
  });
  it("keeps multiple different drinks and removes only the selected one", async () => {
    await ready();
    await add();
    vi.mocked(api.quote).mockResolvedValue({
      description: "Small Tea",
      price: 6000,
    });
    await user().click(screen.getByRole("radio", { name: /^Tea/ }));
    await add();
    const order = within(screen.getByRole("region", { name: "Your order" }));
    expect(order.getByText("Small Coffee")).toBeVisible();
    expect(order.getByText("Small Tea")).toBeVisible();
    expect(order.getByText("THB 130.00")).toBeVisible();
    await user().click(screen.getByRole("button", { name: "Remove drink 1" }));
    expect(order.queryByText("Small Coffee")).not.toBeInTheDocument();
    expect(order.getByText("Small Tea")).toBeVisible();
  });
  it("displays the server quote instead of calculating a local price", async () => {
    vi.mocked(api.quote).mockResolvedValue({
      description: "Small Coffee",
      price: 12345,
    });
    await ready();
    expect(
      within(screen.getByLabelText("Current drink")).getByText("THB 123.45"),
    ).toBeVisible();
  });
  it("submits duplicate ingredients and renders authoritative receipt totals", async () => {
    await ready();
    const u = user();
    await u.click(screen.getByRole("radio", { name: /^Large/ }));
    await u.click(screen.getByRole("button", { name: "Add Vanilla" }));
    await u.click(screen.getByRole("button", { name: "Add Vanilla" }));
    await u.click(screen.getByRole("button", { name: "Add Whipped Cream" }));
    vi.mocked(api.quote).mockResolvedValue(specialQuote);
    await add();
    vi.mocked(api.quote).mockResolvedValue(plainQuote);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Add to order" }),
      ).toBeEnabled(),
    );
    await add();
    vi.mocked(api.order).mockResolvedValue({
      currency: "THB",
      items: [specialQuote, plainQuote],
      grandTotal: 22000,
    });
    await u.click(screen.getByRole("button", { name: /Place order/ }));
    const receipt = within(
      await screen.findByRole("region", { name: "Order confirmed" }),
    );
    expect(api.order).toHaveBeenCalledWith({
      drinks: [
        {
          base: "coffee",
          size: "large",
          syrups: ["vanilla", "vanilla"],
          toppings: ["whipped_cream"],
        },
        { base: "coffee", size: "small", syrups: [], toppings: [] },
      ],
    });
    expect(receipt.getByText(specialQuote.description)).toBeVisible();
    expect(receipt.getByText("Small Coffee")).toBeVisible();
    for (const price of ["THB 150.00", "THB 70.00", "THB 220.00"])
      expect(receipt.getByText(price)).toBeVisible();
    expect(screen.getByText("0 drinks")).toBeVisible();
  });
  it("disables checkout for an empty order", async () => {
    await ready();
    expect(screen.getByRole("button", { name: /Place order/ })).toBeDisabled();
  });
  it("shows catalog loading", () => {
    vi.mocked(api.catalog).mockReturnValue(new Promise(() => {}));
    render(<CoffeeShop />);
    expect(screen.getByText("Opening the menu…")).toBeVisible();
  });
  it("recovers from a catalog error with retry", async () => {
    vi.mocked(api.catalog).mockRejectedValueOnce(new Error("Menu unavailable"));
    render(<CoffeeShop />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Menu unavailable",
    );
    await user().click(screen.getByRole("button", { name: "Try again" }));
    expect(
      await screen.findByRole("heading", { name: "Make it yours" }),
    ).toBeVisible();
  });
  it("shows pending submission and prevents duplicate submission", async () => {
    vi.mocked(api.order).mockReturnValue(new Promise(() => {}));
    await ready();
    await add();
    await user().click(screen.getByRole("button", { name: /Place order/ }));
    expect(
      screen.getByRole("button", { name: "Placing order…" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Remove drink 1" }),
    ).toBeDisabled();
    expect(screen.getByRole("radio", { name: /^Tea/ })).toBeDisabled();
    expect(api.order).toHaveBeenCalledTimes(1);
  });
  it.each([
    "Cannot reach the coffee shop. Please try again.",
    "Please check your drink selections.",
  ])("preserves cart and shows submission feedback: %s", async (message) => {
    vi.mocked(api.order).mockRejectedValueOnce(new Error(message));
    await ready();
    await add();
    await user().click(screen.getByRole("button", { name: /Place order/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent(message);
    expect(screen.getByText("1 drink")).toBeVisible();
    await user().click(screen.getByRole("button", { name: /Place order/ }));
    expect(
      await screen.findByRole("heading", { name: "Order confirmed" }),
    ).toBeVisible();
  });
  it("shows quote failure and allows retry", async () => {
    vi.mocked(api.quote).mockRejectedValueOnce(new Error("Quote unavailable"));
    render(<CoffeeShop />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Quote unavailable",
    );
    expect(screen.getByRole("button", { name: "Add to order" })).toBeDisabled();
    await user().click(screen.getByRole("button", { name: "Retry quote" }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Add to order" }),
      ).toBeEnabled(),
    );
  });
  it("does not allow a stale quote to be added while updating", async () => {
    await ready();
    vi.mocked(api.quote).mockReturnValue(new Promise(() => {}));
    await user().click(screen.getByRole("radio", { name: /^Large/ }));
    expect(screen.getByRole("button", { name: "Add to order" })).toBeDisabled();
    expect(screen.getByText("Calculating…")).toBeVisible();
  });
  it("ignores a late response for a previous configuration", async () => {
    await ready();
    let resolveOld: ((value: typeof plainQuote) => void) | undefined;
    vi.mocked(api.quote).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveOld = resolve;
        }),
    );
    await user().click(screen.getByRole("radio", { name: /^Medium/ }));
    await waitFor(() => expect(resolveOld).toBeDefined());
    vi.mocked(api.quote).mockResolvedValue(specialQuote);
    await user().click(screen.getByRole("radio", { name: /^Large/ }));
    await waitFor(() => expect(screen.getByText("THB 150.00")).toBeVisible());
    resolveOld?.({ description: "Medium Coffee", price: 8500 });
    await waitFor(() =>
      expect(screen.queryByText("THB 85.00")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("THB 150.00")).toBeVisible();
  });
  it("communicates the customization limit", async () => {
    await ready();
    for (let i = 0; i < 20; i++)
      await user().click(screen.getByRole("button", { name: "Add Vanilla" }));
    expect(screen.getByText("Vanilla ×20")).toBeVisible();
    expect(screen.getByRole("button", { name: "Add Caramel" })).toBeDisabled();
    expect(screen.getByText("Maximum 20 syrups per drink.")).toBeVisible();
  });
});
