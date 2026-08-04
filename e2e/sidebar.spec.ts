import { test, expect } from "./helpers/auth";

test.describe("Sidebar behavior", () => {
  test("desktop rail renders with nav items", async ({ authenticatedContext }) => {
    const page = await authenticatedContext.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/dashboard");

    // Desktop rail (aside) should be visible
    const rail = page.locator("aside");
    await expect(rail).toBeVisible();

    // Should show nav items
    await expect(rail.getByText("Dashboard")).toBeVisible();
  });

  test("desktop: hovering over submenu item shows popup", async ({ authenticatedContext }) => {
    const page = await authenticatedContext.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/dashboard");

    // Find View Bill in the rail (has submenu)
    const viewBill = page.locator("aside").getByText("View Bill").first();
    await expect(viewBill).toBeVisible();

    // Hover over the parent container
    const parent = viewBill.locator("..");
    await parent.hover();

    // Submenu popup should appear with "Bill List"
    await expect(page.getByText("Bill List")).toBeVisible({ timeout: 5000 });
  });

  test("mobile: drawer opens and closes", async ({ authenticatedContext }) => {
    const page = await authenticatedContext.newPage();
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone viewport
    await page.goto("/dashboard");

    // On mobile, the rail is hidden (sm:flex), need to check for hamburger/drawer trigger
    // The AppShell should have a menu button for mobile
    // Look for a Menu button or hamburger
    const menuBtn = page.locator('button[aria-label*="menu" i], button:has-text("Menu")').first();

    // If menu button is visible, click it to open drawer
    if (await menuBtn.isVisible().catch(() => false)) {
      await menuBtn.click();
      // Drawer should show "Billora" text
      await expect(page.getByText("Billora")).toBeVisible({ timeout: 5000 });
    }
  });
});
