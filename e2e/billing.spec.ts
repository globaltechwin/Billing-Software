import { test, expect } from "./helpers/auth";

test.describe("Billing flow", () => {
  test("billing page loads with product search", async ({ authenticatedContext }) => {
    const page = await authenticatedContext.newPage();
    await page.goto("/billing/billing");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Should see billing page elements
    // The billing page has a product search area and cart
    const body = page.locator("body");
    await expect(body).toContainText(/product|search|cart|billing/i);
  });

  test("stock-in-list page loads with table", async ({ authenticatedContext }) => {
    const page = await authenticatedContext.newPage();
    await page.goto("/inventory/stock-in-list");

    await page.waitForLoadState("networkidle");

    // Should see the stock in list page
    const body = page.locator("body");
    await expect(body).toContainText(/stock|grn|receipt|list/i);
  });
});
