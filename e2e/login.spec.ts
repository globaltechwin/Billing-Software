import { test, expect } from "./helpers/auth";

test.describe("Login flow", () => {
  test("login page renders with form fields", async ({ page }) => {
    await page.goto("/login");
    // Should see username and password inputs
    await expect(page.locator('input[type="text"], input[placeholder*="username" i]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.locator('button:has-text("Sign In"), button[type="submit"]').first()).toBeVisible();
  });

  test("login with valid credentials redirects to welcome", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[placeholder*="Username" i], input[type="text"]', "superadmin");
    await page.fill('input[placeholder*="Password" i], input[type="password"]', "admin123");
    await page.click('button[type="submit"], button:has-text("Sign In")');
    await page.waitForURL("**/welcome", { timeout: 15000 });
    expect(page.url()).toContain("/welcome");
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[placeholder*="Username" i], input[type="text"]', "wronguser");
    await page.fill('input[placeholder*="Password" i], input[type="password"]', "wrongpass");
    await page.click('button[type="submit"], button:has-text("Sign In")');
    // Should show error message (red text or error div)
    const errorEl = page.locator('[class*="text-red"], [class*="error"], [role="alert"]').first();
    await expect(errorEl).toBeVisible({ timeout: 10000 });
  });
});
