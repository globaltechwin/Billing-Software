<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Billora Project — Agent Working Notes

## DB + Server
- DB: `mysql://root:Root@12345!@localhost:3306/billora`
- Auth cookie: `billora_token` (userId 23 superadmin, companyId 6)
- Token file: `/tmp/billora_token.txt`
- Dev server: `nohup npm run dev > /tmp/nextdev.log` (single instance)
- Restart server when Prisma schema **or `next.config.ts`** changes (next.config changes do NOT hot-reload)
- Migration flow: DDL to MySQL → write `migration.sql` → `npx prisma generate` → `npx prisma migrate resolve --applied <name>`

## Phone / LAN Access (IMPORTANT)
- Next.js 16 dev server BLOCKS the HMR websocket (`/_next/webpack-hmr`) for non-localhost hosts → `ERR_INVALID_HTTP_RESPONSE` → HMR client reloads the page in a loop → login "bounces back to `/`". Fixed via `allowedDevOrigins` in `next.config.ts` (private ranges `192.168.*.*` / `10.*.*.*` / `172.16–31.*.*` / `*.local` / `*.lan`).
- Wildcard matcher pops right-to-left: `**` only valid as LEFTMOST segment (`**.local`); use per-segment `*` for IPs (`192.168.*.*`). Verify new patterns with the matcher logic before relying on them.
- Cookie `Secure` flag: `src/lib/auth.ts` `setAuthCookie(token, secure)` + `shouldSecureCookie(request)` — only `Secure` over HTTPS, so login works over `http://<lan-ip>` (phones/tablets reject Secure cookies on plain HTTP). `removeAuthCookie()` deletes without Secure.
- Login uses full-page `window.location.href = "/dashboard"` (not `router.push`) so the fresh httpOnly cookie is always attached.

## ESLint
- Active: `react-hooks/set-state-in-effect` — use inline `.then()` inside `useEffect`, not useCallback that synchronously sets state
- `@typescript-eslint/no-explicit-any` — avoid `any` types

## Middleware Context
- Injects: `x-user-id`, `x-user-role` (actual `username`), `x-company-id`
- Context helpers: `src/lib/company-context.ts` — `getCurrentCompanyId`, `getCurrentUserId`

## Branches
- Company 6 has one branch: id 7, code BR-0001, name "Head Office"
- openingTime 07:00:00, closingTime 15:00:00, graceHours 08:00:00, isDefault=1, isActive=1

## Completed Modules
| Module | Status | Migration |
|--------|--------|-----------|
| GST Rates / HSN/SAC / GST Settings | Complete | — |
| Admin → Expenses | Complete | `20260731200000_expense` |
| Admin → Vendor Payment | Complete | `20260731210000_vendor_payment_transaction` |
| Admin → Day Closing | Complete | `20260731220000_day_closing` |
| Admin → Advance Order | Complete | `20260731230000_advance_order` |
| Admin → Lock Items | Complete | `20260731240000_product_lock` |
| Admin → QR Code Generator | Complete | (client-side, no migration) |
| QR Payment System V1 | Complete | `20260731250000_payment_settings` |
| Reports → Sales Report (live) | Complete | `20260731260000_kitchen_order_column_fix` |
| Reports → Employee Bill Report | Complete | (no migration) |
| Reports → Cashier Report | Complete | (no migration) |
| Reports → Items Wise Sales | Complete | (no migration) |
| Reports → Stock Report | Complete | (no migration) |
| Reports → Day Wise Stock Report | Complete | (no migration) |
| Reports → Vendor Payments | Complete | (no migration) |
| Reports → Expense Report | Complete | (no migration) |
| Reports → Tally XML | Complete | (no migration) |
| Reports → GST Filing | Complete | (no migration) |
| Reports → Login History | Complete | `20260731270000_login_history` |
| Reports → Cancelled Bills | Complete | (no migration) |
| Reports → Cancelled KOT | Complete | (no migration) |
| Reports → Compliment Bill | Complete | (no migration) |
| Reports → Bill Coupon | Complete | (no migration) |
| Reports → Profit and Loss | Complete | (no migration) |
| Reports → MIS Report | Complete | (no migration) |
| Reports → Profit Report (Retail) | Complete | (no migration) |
| Reports → Purchases | Complete | (no migration) |
| Reports → Stock Audit | Complete | (no migration) |
| Reports → Wallet Top Up | Complete | (no migration) |
| Production → Planning + Planning List | Complete | `20260731280000_production_plan` |
| Production → Production-In + Production-In List | Complete | `20260731290000_production_in` |
| Production → Production Out + Production Out List | Complete | `20260731295000_production_out` |
| Production → Wastage + Wastage List | Complete | `20260731300000_wastage` |
| WhatsApp → Balance & Analytics | Complete | `20260731303000_whatsapp` |
| WhatsApp → Template Manager | Complete | `20260731310000_whatsapp_template` |
| Admin → Company Branding + Theme Tokens | Complete | `20260802000000_company_branding_theme` |
| Admin → Backup & Restore + Cloud Backup | Complete | `20260802020000_backup_restore`, `20260802030000_backup_extend` |

## Company Branding / Theme — Details
- **DB**: `Company` model new fields `shortCode` + `themePrimary/PrimaryDark/Accent/Warm/BgDark/BgDarker/CardDark/NavBg` (all `String?`). Migration `20260802000000_company_branding_theme`. Seed (company 6): shortCode `AHS`, theme colors mirror the default coral + sidebar navy.
- **Theme mapping** (Company → CSS vars on `<html>`): themePrimary→`--billora-primary`, themePrimaryDark→`--billora-primary-dark`, themeAccent→`--billora-accent`, themeWarm→`--billora-warm`, themeBgDark/BgDarker/CardDark→`--billora-bg-dark/-darker/-card-dark`, themeNavBg→`--billora-nav-bg` (sidebar navy, added in globals.css `@theme inline`).
- **Provider**: `src/components/branding/CompanyBrandingProvider.tsx` — mounted in `AppShell.tsx`; fetches `/api/company/settings` on mount, applies CSS vars via `setProperty`, exposes context `{ companyName, shortCode, logo, isOwner, isAdmin }`. No localStorage; per-login hard navigation guarantees the active session's company. Listens for `billora:branding-updated` (dispatched after save) to re-fetch and re-apply live.
- **API**: `/api/company/settings` GET now returns `role` (from `userCompany.role.name`); PATCH role-guards Owner/Admin (403) and blocks `logo` for non-Owner (403 "Only the company owner can update the logo"). Login response `user.role` added.
- **Branded chrome**: `Header.tsx` (logo tile from shortCode/logo, company name in user dropdown), `Sidebar.tsx` `Logo()` (brand tile) + nav bg now `bg-billora-nav-bg`, `CompanyInformation.tsx` (logo/shortCode/companyName; removed hardcoded AHS/AccountsHubSoft SVG).
- **Token sweep**: primary CTA buttons/gradients in BillingToolbar, BillingHeader (KOT), POSRightPanel, expenses print, billing GST/amount accents, production totals → `bg-billora-primary`/`text-billora-primary`/`from-billora-primary to-billora-accent`. globals.css `.btn-signin/.new-badge/.brand-icon/.input-field:focus` now use vars + `color-mix`. Semantic colors (orange-600 status, red-500 delete, green-500 success, empty-state warnings, category colors) stay hardcoded.
- **Page**: `src/app/admin/company-branding/page.tsx` (sidebar item under Admin) — short code, logo URL (Owner-only, disabled + lock for non-owner), 8 color pickers + hex inputs, live chrome preview, save → PATCH → dispatch `billora:branding-updated`.
- **Note**: pre-auth pages (login) use default `:root` vars (no session → no company context). Dark-surface tokens (`--billora-bg-dark/-darker/-card-dark`, `--billora-warm`) are reserved — not yet consumed by components.

## Sales Report — Details
- **API**: `/api/reports/sales` GET — params fromDate/fromTime/toDate/toTime, user, attender, customerType (With GST/Without GST), orderType, branchId, search, fetchAll, page (default 1), limit (default 25, max 100), sortField (invoiceDate/invoiceNumber/grandTotal/createdAt), sortDirection, format=csv
- **Totals**: bills, subTotal, tax, discount, grandTotal, paidAmount, amountDue, expenses (Expense model), profitLoss, returnAmt (deleted invoices), lastWkSales, prevDayPay, compliment, cancelled, runningOrder, creditBills, delivery
- **Page**: `src/app/reports/sales/page.tsx` — fetches API (fetchAll), client-side search/entries pagination preserved, UI unchanged
- **Note**: `kitchen_order`/`kitchen_order_item` tables had hand-written snake_case columns that did not match the Prisma schema (broke ALL Prisma reads/writes silently). Fixed via migration `20260731260000_kitchen_order_column_fix` (empty tables, non-destructive renames to camelCase).

## Employee Bill Report — Details
- **API**: `/api/reports/employee-bill` GET — params startDate, endDate, session (All/Morning/Afternoon/Evening)
- **Definition**: an "employee bill" = invoice whose customer is a wallet card holder (customer has ≥1 `walletTransaction`); employeeId/cardNumber from the customer's latest wallet transaction (fallback customerCode); department has no DB source → "" (matches wired wallet report); session derived from invoice hour (<12 Morning, <16 Afternoon, else Evening); search is client-side (billNo/employeeName/employeeId/mobile); Excel export client-side
- **Page**: `src/app/reports/employee-bill/page.tsx` — fetches API, UI unchanged

## Cashier Report — Details
- **API**: `/api/reports/cashier` GET — returns ALL non-deleted invoices (no date UI); optional params fromDate/fromTime/toDate/toTime, payment (Cash/Card/UPI), tax (GST/Non-GST), orderType (Dine In/Take Away/Delivery), format=csv
- **Rows**: same shape as sales report minus createdBy; paidAmount via invoicePayment groupBy
- **Totals**: bills, subTotal, tax (grandTotal−subTotal, matches client calc), discount, grandTotal, paidAmount, amountDue, expenses (Expense model), complimentBills, cancelledBills, runningOrder, creditBills, deliveryCharge — client computes 6 of these as 0 by design (frontend hardcodes them)
- **Page**: `src/app/reports/cashier/page.tsx` — no View button, so fetch-on-mount via `useEffect` (inline `.then()` per eslint rule), UI unchanged

## Shared Report Utils
- `src/lib/report-utils.ts` — shared: `formatDate`, `formatDateTime`, `formatDateTimeSeconds`, `payModeLabel`, `orderTypeLabel`, `buildDateRange`, `getSession` (used by sales/employee-bill/cashier routes)

## Items Wise Sales — Details
- **API**: `/api/reports/items-wise-sales` GET — params fromDate/fromTime/toDate/toTime, orderType (Dine In/Take Away/Delivery), product, attender, user, search, sortField (count/totalPrice/productName/category), sortDirection, format=csv
- **Logic**: aggregates `invoice_item` (SUM quantity, SUM totalAmount) grouped by productId for non-deleted, non-CANCELLED invoices in date range; category from Product; default sort count desc
- **Page**: `src/app/reports/items-wise-sales/page.tsx` — handleView fetches API with all filter state (date/orderType/product/attender/user), client-side search/pagination preserved, UI unchanged

## Stock Report — Details
- **API**: `/api/reports/stock` GET — params startDate, endDate, category, product
- **Source**: `inventory_ledger` (movementDate, quantityIn, quantityOut, balance, referenceType). opening = last balance strictly before startDate; stockIn = SUM quantityIn in range; billed = SUM quantityOut where referenceType=SALE; stockOut = SUM quantityOut non-SALE; closing = last balance ≤ endDate (verified = opening+in−totalOut); stockUnitPrice = product.purchasePrice; totalPrice = closing×price; branchName from first branch; stockDate = endDate
- **Page**: `src/app/reports/stock/page.tsx` — handleViewReport fetches API, client-side search/pagination/totals preserved, UI unchanged

## Day Wise Stock Report — Details
- **API**: `/api/reports/day-wise-stock` GET — params startDate, endDate, product
- **Logic**: one row per product per day across the range, chained from `inventory_ledger`: opening = prev day closing (first day = last balance before startDate), stockIn/stockOut = SUM quantityIn/quantityOut for that day, closing = opening+in−out, totalStockValue = closing × product.purchasePrice
- **Page**: `src/app/reports/day-wise-stock/page.tsx` — handleViewReport fetches API, client-side search/pagination/totals preserved, UI unchanged

## Vendor Payments Report — Details
- **API**: `/api/reports/vendor-payments` GET — params startDate, endDate
- **Logic**: groups `vendor_payment` rows in date range by vendorId; credit = SUM amount where transactionType=CREDIT; cash/card/upi/wallet = SUM amount by paymentMethod where transactionType=PAYMENT (BANK/CHEQUE excluded from method columns); curBalance = credit − total payments; balanceDesc = Paid (≤0) / Partial (payments exist, balance>0) / Due (no payments); date = latest transaction in range
- **Page**: `src/app/reports/vendor-payments/page.tsx` — handleViewReport fetches API, client-side search/pagination/totals preserved, UI unchanged; Deleted Payments checkbox has no DB source (no soft-delete on VendorPayment)

## Expense Report — Details
- **API**: `/api/reports/expense` GET — params startDate, endDate, vendor
- **Logic**: `expense` rows in date range (optional vendorName contains); receiptNo=expenseNumber, vendorName, expenseAmount=amount, expenseDescription=description, categoryName from expense_category, cancelledAmount=0 + expensesStatus="Approved" (no cancel/status fields on Expense), expenseDate formatted, comments
- **Page**: `src/app/reports/expense/page.tsx` — handleViewReport fetches API; vendor dropdown values updated to real vendor names (Fresh Foods Suppliers/Metro Wholesale/Green Valley Traders/Yuvanth); search/pagination/totals preserved, UI otherwise unchanged

## Tally XML — Details
- **API**: `/api/reports/tally-xml` GET — params type (billing/vendor/purchase), startDate, endDate
- **Logic**: generates Tally import XML (ENVELOPE → TALLYMESSAGE). billing = one Sales VOUCHER per non-deleted invoice (Dr paymentMode ledger, Cr Sales, DATE ddmmyyyy, VOUCHERNUMBER); vendor = one LEDGER master per active vendor (PARENT Sundry Creditors); purchase = one Purchase VOUCHER per purchase_invoice (Dr Purchases, Cr vendor). Returns `{ xml, filename }`
- **Page**: `src/app/reports/tally-xml/page.tsx` — buttons fetch API then client-side download; removed fake generator + 1s artificial delay

## GST Filing — Details
- **API**: `/api/reports/gst-filing` GET — params startDate, endDate
- **Logic**: one row per non-deleted invoice in range; taxableValue/totalTax = Σ item subtotal/taxAmount; cgst/sgst/igst amounts = Σ item amounts; rates + hsnCode from the item with largest subtotal (product.hsnCode); customerName/gstin from customer (customerName, gstNumber); invoiceTotal = grandTotal
- **Page**: `src/app/reports/gst-filing/page.tsx` — handleViewReport fetches API; radio buttons (Item Wise/Summary/Template 1) unwired, table/search/pagination/totals preserved

## Login History — Details
- **Table**: `LoginHistory` (Prisma model has NO `@@map`, so table name is `LoginHistory`, NOT `login_history`). Table pre-existed with real login records; login API (`/api/auth/login`) already writes via `prisma.loginHistory.create`. Migration `20260731270000_login_history` is a no-op record. **WARNING**: do NOT create a `login_history` table — it's a duplicate; use `LoginHistory`.
- **API**: `/api/reports/login-history` GET — params startDate, endDate, status (all/success/failed), search (username/name). Filters by `user.defaultCompanyId = companyId` (LoginHistory has no companyId). Returns `{ rows, totals: { total, successful, failed, uniqueUsers } }`
- **Rows**: username, userName, loginTime (formatDateTime), ipAddress, device (userAgent), status (Success/Failed badge)
- **Page**: `src/app/reports/login-history/page.tsx` — newly designed UI: 4 summary cards (Total Logins/Successful/Failed/Unique Users), status dropdown filter, search, table with truncating device column

## Cancelled Bills — Details
- **API**: `/api/reports/cancelled-bills` GET — params startDate, endDate
- **Logic**: invoices where `deletedAt` NOT NULL and within range (filter on deletedAt); billNo=invoiceNumber, billDate=invoiceDate, grandTotal, payMode=paymentMode, name/mobile from customer (customerName/phone), remarks=deleteReason, cancelledBy=deletedByUser name/username, cancelledDate=deletedAt
- **Page**: `src/app/reports/cancelled-bills/page.tsx` — handleViewReport fetches API, search/pagination/totals preserved, UI unchanged; Bill/Item radio — only Bill view exists (Item view has no DB source/UI)

## Cancelled KOT — Details
- **API**: `/api/reports/cancelled-kot` GET — params startDate, endDate
- **Logic**: iterates `kitchen_order` + `kitchen_order_item` in range, emits items where orderStatus/itemStatus = "CANCELLED". **No cancellation tracking exists yet** (OrderStatus enum: NEW/ACCEPTED/PREPARING/READY/SERVED; no cancelledAt/reason fields; tables empty) → report always returns 0 rows until KOT cancellation is implemented. Fields: billNo=invoiceNumber, kotNo=kotNumber, billDate=orderTime, productName=productNameSnapshot, quantity, cancelledBy=createdByUser, cancelledDate=updatedAt; category/billAmount/remarks have no source
- **Page**: `src/app/reports/cancelled-kot/page.tsx` — handleViewReport fetches API, search/pagination/totals preserved, UI unchanged

## Compliment Bill — Details
- **API**: `/api/reports/compliment-bill` GET — params startDate, endDate
- **Logic**: non-deleted invoices where `paymentMode = "COMPLIMENT"` in date range; billNo=billId1=invoiceNumber, billDate=invoiceDate, subTotal=subtotal, name/mobile from customer, createdByBy=createdByUser name/username, createdDate=createdAt, remarks=remarks
- **Page**: `src/app/reports/compliment-bill/page.tsx` — handleViewReport fetches API, search/pagination/totals preserved, UI unchanged; Bill/Item radio — only Bill view exists

## Bill Coupon — Details
- **API**: `/api/reports/bill-coupon` GET — params startDate, endDate
- **Logic**: **No coupon tracking exists in the DB** (no Coupon model/table; invoice has no coupon column; company settings `couponPercent`/`couponValidity` only) → API always returns empty rows. Fields (billNo, billDate, grandTotal, billCoupon, custName, custMobile, couponStatus) have no source until coupon usage is implemented
- **Page**: `src/app/reports/bill-coupon/page.tsx` — handleViewReport fetches API, search/pagination preserved, UI unchanged

## Profit and Loss — Details
- **API**: `/api/reports/profit-and-loss` GET — params startDate, endDate
- **Logic**: 4 rows. Total Sales = Σ grandTotal (non-deleted invoices in range); Stock IN = Σ (inventory_ledger.quantityIn × product.purchasePrice); Total Expenses = Σ expense.amount; Stock Out = Σ (inventory_ledger.quantityOut × product.purchasePrice). Page total = income − expense (net), computed from row `type`
- **Page**: `src/app/reports/profit-and-loss/page.tsx` — handleView fetches API; totalAmount now nets expenses; sampleData removed, UI otherwise unchanged

## MIS Report — Details
- **API**: `/api/reports/mis` GET — params startDate, endDate
- **Logic**: returns `{ rows, itemWise }`. rows: Total Sales (Σ grandTotal non-deleted invoices), Total Purchases (Σ purchase_invoice grandTotal), Total Expenses (Σ expense.amount), Gross Profit (sales−purchases), Net Profit (gross−expenses), Total Bills (invoice count), Total Customers (distinct customerId), Stock Value (last inventory_ledger balance per product × product.purchasePrice as of endDate). itemWise: Σ per invoice_item (category=product.category string, quantity, totalAmount) ordered by quantity desc
- **Page**: `src/app/reports/mis/page.tsx` — Excel/ItemWise/PDF buttons fetch API then client-side download; removed hardcoded zeros + 800ms fake delays

## Profit Report (Retail) — Details
- **API**: `/api/reports/profit-retail` GET — params startDate, endDate
- **Logic**: one row per product per day from `invoice_item` (non-deleted invoices in range); billDate = invoiceDate, category = product.category, quantity = SUM, billValue = SUM totalAmount, costValue = quantity × product.purchasePrice, profitValue = billValue − costValue, profitPercent = profitValue / billValue × 100; sorted by date desc
- **Page**: `src/app/reports/profit-retail/page.tsx` — handleViewReport fetches API, search/pagination/totals/Excel preserved, sampleData removed, UI unchanged

## Purchases — Details
- **API**: `/api/reports/purchases` GET — params startDate, endDate, branch, vendor, category, product
- **Logic**: one row per `purchase_order_item` for POs in date range; poDate=orderDate, poNo=poNumber, branchName via branchId map (PO has no branch relation — branchId is plain Int), vendorName from vendor, itemCode/productName/category from product, uom=item.unit, price=purchasePrice, reqQuantity=quantity, appQuantity=grnQuantity=receivedQty, amounts=received×price, requestStatus derived: 0→Pending, received≥qty→Approved, else Partial. Returns `{ rows, vendors, products, categories, branches }` for dropdowns
- **Page**: `src/app/reports/purchases/page.tsx` — dropdowns (branch/vendor/category/product) now populated from API options fetched on mount via useEffect (inline .then); handleViewReport passes filters to API; search/pagination/totals/Excel preserved, UI otherwise unchanged

## Stock Audit — Details
- **API**: `/api/reports/stock-audit` GET — params startDate, endDate, category, product
- **Logic**: one row per `stock_audit_item` for audits in date range; auditDate=auditDate, productName/code/category/unit/purchasePrice from product, systemQty=systemStock, physicalQty=physicalStock, difference=difference, stockValue=physicalQty×purchasePrice, status derived: diff>0→Excess, <0→Shortage, else Match. Returns `{ rows, categories, products }` for dropdowns
- **Page**: `src/app/reports/stock-audit/page.tsx` — dropdowns (category/product) now populated from API options fetched on mount via useEffect (inline .then); handleViewReport passes filters; search/pagination/totals/Excel preserved, UI otherwise unchanged

## Wallet Top Up — Details
- **API**: `/api/wallet` GET — params startDate, endDate, payMode, search, limit
- **Logic**: wallet_transaction rows of type TOP_UP in range; employeeName/employeeId/cardNumber/mobile from customer, paymode, amount, date, createdBy; page maps API `transactions` into rows
- **Page**: `src/app/reports/wallet-top-up/page.tsx` — handleViewReport (useCallback) already fetches `/api/wallet`, client-side payMode/search filtering + total + Excel preserved

## Production → Planning + Planning List — Details
- **Models**: `ProductionPlan` (planNo unique per company, productionCategory, requestDate, remarks?, numberOfProducts, createdByUserId/updatedByUserId) + `ProductionPlanItem` (productionPlanId, productId, quantity DECIMAL(12,3), price/totalPrice DECIMAL(12,2), companyId). Both have companyId; item cascades on plan delete. Migration `20260731280000_production_plan`.
- **API**: `/api/production-plans` GET (params search/fromDate/toDate/page/limit — where on `requestDate`; returns plans[] with serialized items incl. productName/uom and pagination) / POST (validates category+requestDate+items, resolves products in company, planNo via `generateProductionPlanNumber` → `PP` + 6 digits, numberOfProducts = items.length, creates plan+items in transaction) / PATCH (update category/requestDate/remarks; if items array sent: deleteMany + recreate, recompute numberOfProducts) / DELETE (hard delete, cascades items)
- **Page**: `src/app/production/planning/page.tsx` — product dropdown now fetches `/api/products` (active only) via useEffect inline `.then()`; save POSTs to `/api/production-plans`; item ids via useRef counter (Date.now() banned by react-hooks/purity). UI unchanged
- **Page**: `src/app/production/planning-list/page.tsx` — View Report fetches `/api/production-plans` with fromDate/toDate, maps entryDate/requestDate dd/mm/yyyy client-side, client-side search/pagination preserved. UI unchanged
- **Note**: `planning-list` Bill/Item radio, Edit/Download buttons, PDF/Excel buttons remain unwired (no separate per-item view yet)

## Production → Production-In + Production-In List — Details
- **Models**: `ProductionIn` (prodNo unique per company, productionCategory, productionTransferNo?, planningNo?, indentNo?, remarks?, numberOfProducts, grandTotal DECIMAL(12,2), createdByUserId/updatedByUserId) + `ProductionInItem` (productionInId, productId, quantity DECIMAL(12,3), price/totalPrice DECIMAL(12,2), companyId). Item cascades on record delete. Migration `20260731290000_production_in`.
- **API**: `/api/production-in` GET (params search/fromDate/toDate/page/limit — where on `createdAt`, toDate end-of-day inclusive; returns records[] with serialized items incl. productName/uom and pagination) / POST (validates category+items, resolves products, prodNo via `generateProductionInNumber` → `PIN` + 6 digits, numberOfProducts = items.length, grandTotal = Σ totalPrice, creates record+items in transaction) / PATCH (update category/refNos/remarks; if items array sent: deleteMany + recreate, recompute numberOfProducts + grandTotal) / DELETE (hard delete, cascades items)
- **Page**: `src/app/production/production-in/page.tsx` — product dropdown fetches `/api/products` (active only) via useEffect inline `.then()`; `currentStock` column now shows real product stock (was Math.random()); save POSTs to `/api/production-in`; item ids via useRef counter. UI unchanged
- **Page**: `src/app/production/production-in-list/page.tsx` — View Report fetches `/api/production-in` with fromDate/toDate, maps productionDate/createdDate dd/mm/yyyy client-side, grandTotal footer sum from filtered rows, search/pagination preserved. UI unchanged
- **Note**: no stock/`inventory_ledger` mutation on production-in (consistent with planning); Edit button remains unwired. `productionDate` = createdAt (form has no date field)

## Production → Production Out + Production Out List — Details
- **Models**: `ProductionOut` (outNo unique per company, productionCategory, indentNo?, branchId?, remarks?, numberOfProducts, grandTotal DECIMAL(12,2), createdByUserId/updatedByUserId) + `ProductionOutItem` (productionOutId, productId, quantity DECIMAL(12,3), price/totalPrice DECIMAL(12,2), companyId). Item cascades on record delete. Migration `20260731295000_production_out`.
- **API**: `/api/production-out` GET (params search/fromDate/toDate/branch/page/limit — where on `createdAt`, toDate end-of-day inclusive; returns records[] with serialized items incl. productName/uom, branchName and pagination) / POST (validates category+items, resolves products, outNo via `generateProductionOutNumber` → `POUT` + 6 digits, grandTotal = Σ totalPrice, creates record+items in transaction) / PATCH (update category/indentNo/branchId/remarks; if items array sent: deleteMany + recreate, recompute numberOfProducts + grandTotal) / DELETE (hard delete, cascades items)
- **Page**: `src/app/production/production-out/page.tsx` — product dropdown fetches `/api/products` (active only) via useEffect inline `.then()`; branch dropdown fetches `/api/branches`; `currentStock` shows real product stock (was Math.random()); save POSTs to `/api/production-out`; item ids via useRef counter. `AutoStockOut` button remains unwired (no DB source). UI unchanged
- **Page**: `src/app/production/production-out-list/page.tsx` — View Report fetches `/api/production-out` with fromDate/toDate/branch, maps productionDate/entryDate dd/mm/yyyy client-side, grandTotal footer sum from filtered rows, search/pagination preserved. UI unchanged
- **Note**: `production-out-list` Bill/Item radio, Edit/Download buttons remain unwired (no separate per-item view yet)

## Production → Wastage + Wastage List — Details
- **Models**: `Wastage` (wastageNo unique per company, productionCategory, remarks?, numberOfProducts, createdByUserId/updatedByUserId) + `WastageItem` (wastageId, productId, quantity DECIMAL(12,3), companyId). Item cascades on record delete. Migration `20260731300000_wastage`.
- **API**: `/api/wastage` GET (params search/fromDate/toDate/page/limit — where on `createdAt`; returns records[] with serialized items incl. productName/uom/currentStock and pagination) / POST (validates category+items, resolves products in company, wastageNo via `generateWastageNumber` → `WAS` + 6 digits, numberOfProducts = items.length, creates record+items in transaction) / PATCH (update category/remarks; if items array sent: deleteMany + recreate, recompute numberOfProducts) / DELETE (hard delete, cascades items)
- **Page**: `src/app/production/wastage/page.tsx` — product dropdown fetches `/api/products` (active only) via useEffect inline `.then()`; save POSTs to `/api/wastage`; item ids via useRef counter. UI unchanged (simpler form — no price/totalPrice, tracks wastage quantity + currentStock)
- **Page**: `src/app/production/wastage-list/page.tsx` — View Report fetches `/api/wastage` with fromDate/toDate, maps entryDate dd/mm/yyyy client-side, search/pagination preserved. Branch filter dropdown wires to `/api/branches`. UI unchanged (no grandTotal; no Bill/Item per-item view)

## WhatsApp — Balance & Analytics — Details
- **DB Models**: `WAMessage` (companyId, billNo, mobile, customer, status PENDING/SENT/FAILED/cost/sentAt/error/templateName) + `WABalance` (companyId → currentBalance/totalSpent/totalRecharged/costPerMessage) + `WABalanceTransaction` (companyId, type RECHARGE/DEDUCT, amount). Migration `20260731303000_whatsapp`
- **API**: `/api/whatsapp/balance` GET (returns currentBalance, totalSpent, totalRecharged, costPerMessage, messagesRemaining) / POST (recharge — adds amount to currentBalance, creates RECHARGE transaction) + `/api/whatsapp/messages` GET (params search/status/fromDate/toDate/page/limit — filter by status/sentAt date range, search across billNo/mobile/customer/status/error/templateName, order by sentAt desc) / POST (create PENDING message record)
- **Page**: `src/app/whatsapp/balance-analytics/page.tsx` — Message Log tab maps API messages into rows with status badge (SENT green/FAILED red), cost formatted ₹0.5000, sentAt dd/mm/yyyy HH:mm; Recharges tab shows empty state; Balance cards show live stats; Quick recharge ₹100/250/500/1000 buttons + custom amount + Pay & Recharge; pagination preserved; sampleMessageLog and hardcoded balance removed

## WhatsApp — Template Manager — Details
- **DB Model**: `WATemplate` (companyId unique per company, name, language, category, header, body, footer, params computed from {{n}} count, status DRAFT/PENDING/REJECTED/APPROVED, lastSyncAt, sampleValues JSON string, paramLabels JSON string, isDefault, createdByUserId/updatedByUserId) + `WABalance` + `WABalanceTransaction`. Migration `20260731310000_whatsapp_template`
- **API**: `/api/whatsapp/templates` GET (params search/status/page/limit — where companyId, orderBy createdAt desc) / POST (validates name uniqueness+required body, auto-counts params from {{n}} patterns, resets isDefault on other templates when new default, creates DRAFT) / PATCH (update any field including status to APPROVED/PENDING/REJECTED, sync lastSyncAt) / DELETE (hard delete)
- **Page**: `src/app/whatsapp/template-manager/page.tsx` — template list maps API results into rows; status badge (APPROVED green/PENDING yellow/REJECTED red/DRAFT gray); lastSync dd/mm/yyyy HH:mm; New Template POSTs to API; Edit PATCHs to API; Delete sends DELETE; Search across name/language/category/status; pagination preserved; Create modal (New Template button → POST), Edit modal with live preview

## QR Payment System V1 — Details
- **PaymentSettings model**: `@@unique([companyId, branchId])`, fields: merchantName, upiId, qrEnabled, isActive, branchId?, audit fields
- **API**: `/api/payment-settings` GET/POST/PATCH/DELETE + UPI ID format validation (`/^[\w.\-]+@[\w]+$/`)
- **UPI QR utility**: `src/lib/upi-qr.ts` — `buildUpiUri`, `generateUpiQrDataUrl`, `isValidUpiId`
- **QR URI format**: `upi://pay?pa=<UPI_ID>&pn=<MERCHANT_NAME>&am=<TOTAL_AMOUNT>&cu=INR&tn=Invoice <BILL_NO>&tr=<BILL_NO>`
- **Print Preview**: QR code renders between Payment and Footer sections, with merchant name + UPI ID
- **Admin QR page**: Payment Settings section + QR Generator (URL/text, size, color, download, copy)

## Backup & Restore — Details
- **Role resolution**: Middleware sets `x-user-role` = actual **username** (e.g. "superadmin"), NOT the role name. Always query `prisma.userCompany.findFirst({ where: { userId, companyId }, include: { role: true } })` to get the role name. Shared helpers: `getUserRole(ctx)`, `isAdmin(ctx)`, `isOwner(ctx)` in `src/lib/company-context.ts`.
- **Storage**: Local backups stored in `storage/backups/{companyId}/`. MySQL dump → gzip compress → AES-256-CBC encrypt pipeline. mysqldump flags: `--single-transaction --routines --triggers --events --set-gtid-purged=OFF`.
- **Cloud provider**: Backblaze B2 via `@aws-sdk/client-s3` (S3-compatible). Env vars: `B2_KEY_ID`, `B2_APPLICATION_KEY`, `B2_BUCKET_NAME`, `B2_ENDPOINT`. Provider abstraction in `src/lib/backup/storage-provider.ts` (StorageProvider interface, swap to R2/S3/etc by changing env vars).
- **Scheduler**: `src/lib/backup/scheduler.ts` — `startScheduler()` called from `src/instrumentation.ts` on server boot. Runs every 60s: processes pending BackupJob records, retries failed cloud uploads. `createDailyScheduleJobs()` creates jobs for companies with `autoBackupEnabled=true`. Also called when settings PUT enables auto backup.
- **Models**: BackupSetting, BackupHistory (with uploadStatus/cloudKey/retryCount), RestoreHistory, BackupLog, BackupJob, CloudBackup. Migrations: `20260802020000_backup_restore`, `20260802030000_backup_extend`.
- **Restore caveat**: mysql import overwrites the entire DB including `restore_history`. The code handles this by creating a new record if the original was lost. Old backups created before `--set-gtid-purged=OFF` fix may fail to restore on GTID-enabled MySQL.
- **B2 bucket**: Must be created manually in Backblaze B2 console before cloud upload works. Bucket name from `.env` `B2_BUCKET_NAME`.
- **Superadmin-only**: Cloud Backup page (`/admin/cloud-backup`) and `GET /api/backup/cloud` require Owner role. Backup & Restore page requires Owner/Admin.

## Key Files
- `prisma/schema.prisma` — all models
- `src/lib/company-context.ts` — company/user context helpers
- `src/lib/number-generators.ts` — number generation (invoices, advance orders)
- `src/components/layout/Sidebar.tsx` — sidebar navigation
- `src/components/billing/InvoicePrintPreview.tsx` — print preview with UPI QR
- `src/components/billing/BillingPage.tsx` — main billing page
- `src/app/admin/qr/page.tsx` — QR generator + payment settings
- `src/app/api/payment-settings/route.ts` — payment settings CRUD API
- `src/lib/upi-qr.ts` — UPI QR generation utility
