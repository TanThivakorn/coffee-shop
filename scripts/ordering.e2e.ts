import { test, expect } from "@playwright/test";
test("real backend: duplicate ingredients, two drinks, receipt and reset", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByText("Large", { exact: true }).click();
  await expect(page.getByRole("radio", { name: /^Large/ })).toBeChecked();
  await page
    .getByRole("button", { name: "Add Vanilla", exact: true })
    .click({ clickCount: 2 });
  await page
    .getByRole("button", { name: "Add Whipped Cream", exact: true })
    .click();
  const preview = page.getByLabel("Current drink");
  await expect(preview).toContainText("Vanilla ×2");
  await expect(preview).toContainText("THB 150.00");
  await page.getByRole("button", { name: "Add to order" }).click();
  await page.getByText("Tea", { exact: true }).click();
  await expect(page.getByRole("radio", { name: /^Tea/ })).toBeChecked();
  await page.getByText("Medium", { exact: true }).click();
  await expect(page.getByRole("radio", { name: /^Medium/ })).toBeChecked();
  await page.getByRole("button", { name: "Add Cinnamon", exact: true }).click();
  await expect(preview).toContainText("THB 80.00");
  await page.getByRole("button", { name: "Add to order" }).click();
  const order = page.getByRole("region", { name: "Your order" });
  await expect(order).toContainText(
    "Large Coffee, Vanilla, Vanilla, Whipped Cream",
  );
  await expect(order).toContainText("Medium Tea, Cinnamon");
  await expect(order).toContainText("THB 230.00");
  await page.getByRole("button", { name: /Place order/ }).click();
  const receipt = page.getByRole("region", { name: "Order confirmed" });
  await expect(receipt).toContainText(
    "Large Coffee, Vanilla, Vanilla, Whipped Cream",
  );
  await expect(receipt).toContainText("Medium Tea, Cinnamon");
  for (const price of ["THB 150.00", "THB 80.00", "THB 230.00"])
    await expect(receipt).toContainText(price);
  await expect(order).toContainText("0 drinks");
});
test("network error preserves cart and retry completes", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Add to order" }).click();
  await page.route("**/api/orders", (route) => route.abort());
  await page.getByRole("button", { name: /Place order/ }).click();
  await expect(
    page.getByRole("region", { name: "Your order" }).getByRole("alert"),
  ).toContainText("Cannot reach the coffee shop");
  await expect(page.getByRole("region", { name: "Your order" })).toContainText(
    "1 drink",
  );
  await page.unroute("**/api/orders");
  await page.getByRole("button", { name: /Place order/ }).click();
  await expect(
    page.getByRole("heading", { name: "Order confirmed" }),
  ).toBeVisible();
});
for (const [name, width, height] of [
  ["mobile", 375, 812],
  ["tablet", 768, 1024],
  ["desktop", 1440, 1000],
] as const) {
  test(`${name} layout has no overflow and supports customization`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await page
      .getByRole("button", { name: "Add Vanilla", exact: true })
      .click();
    await expect(page.getByLabel("Current drink")).toContainText("Vanilla ×1");
    await expect(
      page.getByRole("button", { name: "Add to order" }),
    ).toBeEnabled();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
    await page.getByRole("button", { name: "Add to order" }).click();
    await page.getByRole("button", { name: /Place order/ }).click();
    await expect(
      page.getByRole("heading", { name: "Order confirmed" }),
    ).toBeVisible();
  });
}
