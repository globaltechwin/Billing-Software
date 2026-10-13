# Billora QA correction patch notes

This patch preserves the existing visual design and changes behavior only.

## Applied in this source patch

1. Added the missing `/billing/kot` Next.js route. It reuses the existing billing/KOT page component, so the Table View navigation no longer lands on a missing route. The current component is a recent-bills view; a true table-status/seat-management workflow requires the corresponding database model and business rules, which are not present in the supplied code.
2. Added Payment and Tax selectors to Sales Report and passed those filters through the report API. The API now filters by payment mode and GST mode.
3. Wired Sales Report controls: Print/Day PDF/Sales PDF open the browser print dialog; Excel and Bill XLS export the currently loaded rows as CSV; Bills scrolls to the bill list; Hourly shows a per-hour summary; Denomination displays a basic totals summary. These browser-based actions are functional placeholders, not XLSX/PDF file generation or cash denomination breakdown.
4. Connected Cashier Report Payment and Tax selections to the displayed rows. Tax filtering uses the report's available subtotal/grand-total values as a fallback; exact tax filtering should use `gstMode` from the API for reliable results.

## Important QA status

The provided QA report contains 30 items. This patch does **not** certify all 30 as fixed. Authentication/session security, Touch POS persistence into invoices, tax calculations/rounding, stock transaction synchronization, CRUD and role enforcement, tenant/branch isolation, WhatsApp provider operations, and real PDF/XLSX exports must be tested against the configured database and integrations. Do not deploy as production-ready until these are retested.

## Run locally (Windows PowerShell)

1. Extract this ZIP into a new folder and keep a backup of the original source.
2. Copy `.env.example` to `.env` if supplied, then configure the database URL and required secrets. Never commit `.env`.
3. Install dependencies: `npm ci`
4. Generate Prisma client: `npx prisma generate`
5. Apply database migrations if this is a development database: `npx prisma migrate deploy` (use your normal migration process; back up production first).
6. Run checks: `npm test` and `npm run build`.
7. Start development: `npm run dev`
8. Open `/billing/kot`, `/reports/sales`, and `/reports/cashier`; test with real seeded/test data.
9. Confirm the browser console and server terminal show no errors. Test print previews and exports using a known bill with tax.

## Next QA pass

Fix the remaining issues in order: (1) Touch POS save/print through the invoice API, (2) verify invoice PDF rendering with a default BILL print template, (3) inventory stock synchronization, (4) GST cases and rounding, (5) event edit/update end-to-end, (6) remaining report exports and filters, then (7) WhatsApp integrations and role/company isolation.
