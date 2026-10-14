# Live Data Corrections - Billing Software

This patch preserves existing page layouts and visual classes. It changes data sources, not the UI design.

## Corrections included

- Touch POS now loads active products from `/api/products` and active company categories from `/api/product-categories`; it no longer ships demo POS products/categories.
- Touch POS Print Bill and No Print now save invoices through `/api/invoices`; Hold now saves to `/api/held-bills`. Failures preserve the cart and show an error.
- Purchase Order Request now loads category choices from `/api/product-categories`, uses live `/api/products` and `/api/vendors`, and applies the selected category filter.
- Bulk Product Edit now loads category options from `/api/product-categories` instead of the old static category array.
- Product Master now obtains UOM options from `/api/units?activeOnly=true`; category options, vendors, GST rates, and products are loaded through APIs.
- Removed unused demo product, stock-in, stock-out, and purchase-order arrays from data modules where the pages already use live API endpoints.
- Kept existing UI-only values (payment method labels, status labels, visual card colors, layout settings) as static constants; these are not business records.

## Important verification limitation

This is not a certification that every one of the 104 API routes and all UI pages have been fully audited. The current source also contains modules that still use local in-memory data (notably Vendor Branch Price Mapping). The existing schema/API supports vendor-branch mappings but does not define a product-specific vendor price mapping record, so completing that feature safely requires a product decision/schema/API addition rather than pretending the local state is persisted. Other pages/routes still need a full systematic audit. No design changes were intentionally made.

## Test status

The uploaded ZIP did not include `node_modules`, so a full Next.js build/test run was not possible in this environment. Run `npm ci`, `npx prisma generate`, `npm run lint`, `npm test`, and `npm run build` locally before replacing your working folder. Test Touch POS invoice save/hold with a non-production company and verify totals/stock effects before operational use.
