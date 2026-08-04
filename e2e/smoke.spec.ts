import { test, expect } from "./helpers/auth";

test.describe("Smoke tests — authenticated pages", () => {
  const PAGES = [
    { path: "/dashboard", name: "Dashboard" },
    { path: "/billing/billing", name: "Billing" },
    { path: "/inventory/stock-in-list", name: "Stock In List" },
    { path: "/reports/sales", name: "Sales Report" },
    { path: "/admin/company-branding", name: "Company Branding" },
    { path: "/whatsapp/template-manager", name: "Template Manager" },
  ];

  for (const { path, name } of PAGES) {
    test(`${name} (${path}) loads successfully`, async ({ authenticatedContext }) => {
      const page = await authenticatedContext.newPage();
      const response = await page.goto(path);
      expect(response?.status()).toBeLessThan(400);
      // Page should have visible content
      await expect(page.locator("body")).not.toBeEmpty();
    });
  }
});
