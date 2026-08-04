import { test as base, chromium, type BrowserContext } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const STATE_PATH = path.join(__dirname, ".auth/state.json");

export async function loginAndGetState() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to login page
  await page.goto("/login");

  // Fill in credentials
  await page.fill('input[placeholder*="Username" i], input[type="text"]', "superadmin");
  await page.fill('input[placeholder*="Password" i], input[type="password"]', "admin123");

  // Submit
  await page.click('button[type="submit"], button:has-text("Sign In")');

  // Wait for navigation (login redirects to /welcome)
  await page.waitForURL("**/welcome", { timeout: 15000 });

  // Save storage state
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  await context.storageState({ path: STATE_PATH });

  await browser.close();
  return STATE_PATH;
}

// Custom test fixture that provides authenticated context
export const test = base.extend<{ authenticatedContext: BrowserContext }>({
  authenticatedContext: async ({ browser }, use) => {
    // Reuse state if it exists and is recent (< 1 hour)
    let statePath = STATE_PATH;
    let needsLogin = true;

    if (fs.existsSync(STATE_PATH)) {
      const stat = fs.statSync(STATE_PATH);
      const ageMs = Date.now() - stat.mtimeMs;
      if (ageMs < 3600_000) {
        needsLogin = false;
      }
    }

    if (needsLogin) {
      statePath = await loginAndGetState();
    }

    const context = await browser.newContext({
      storageState: statePath,
    });

    await use(context);
    await context.close();
  },
});

export { expect } from "@playwright/test";
