export interface MenuItem {
  label: string;
  path: string;
  children?: { label: string; path: string }[];
}

export const ALL_MENU_ITEMS: MenuItem[] = [
  { label: "Dashboard", path: "/dashboard" },
  {
    label: "Billing",
    path: "/billing",
    children: [
      { label: "Billing", path: "/billing/billing" },
      { label: "Touch POS", path: "/billing/touch-pos" },
    ],
  },
  {
    label: "View Bill",
    path: "/view-bill",
    children: [
      { label: "Bill List", path: "/view-bill/bill-list" },
      { label: "Quotations", path: "/view-bill/quotations" },
      { label: "Credit Bill Settlement", path: "/view-bill/credit-bill-settlement" },
      { label: "Kitchen Display", path: "/view-bill/kitchen-display" },
      { label: "Delete Bills", path: "/view-bill/delete-bills" },
      { label: "Held Bills", path: "/view-bill/held-bills" },
    ],
  },
  {
    label: "Inventory",
    path: "/inventory",
    children: [
      { label: "Indent Request", path: "/inventory/indent-request" },
      { label: "Dashboard", path: "/inventory/dashboard" },
      { label: "Indent List", path: "/inventory/indent-list" },
      { label: "PO Request", path: "/inventory/po-request" },
      { label: "PO List", path: "/inventory/po-list" },
      { label: "Stock In", path: "/inventory/stock-in" },
      { label: "Stock In List", path: "/inventory/stock-in-list" },
      { label: "Stock Out", path: "/inventory/stock-out" },
      { label: "Stock Out List", path: "/inventory/stock-out-list" },
      { label: "Stock Audit", path: "/inventory/stock-audit" },
      { label: "Stock Audit List", path: "/inventory/stock-audit-list" },
    ],
  },
  {
    label: "Master",
    path: "/master",
    children: [
      { label: "Master Configuration", path: "/master/master-configuration" },
      { label: "Product", path: "/master/product" },
      { label: "Barcode Generation", path: "/master/barcode-generation" },
      { label: "Vendor Branch Mapping", path: "/master/vendor-branch-mapping" },
      { label: "Vendor Branch List", path: "/master/vendor-branch-list" },
      { label: "Bulk Product Edit", path: "/master/bulk-product-edit" },
      { label: "Unit", path: "/master/unit" },
      { label: "Expense Category", path: "/master/expense-category" },
      { label: "Vendor Branch Price Mapping", path: "/master/vendor-branch-price-mapping" },
      { label: "Student", path: "/master/student" },
      { label: "Customer", path: "/master/customer" },
      { label: "Vendor", path: "/master/vendor" },
      { label: "Production Mapping", path: "/master/production-mapping" },
      { label: "Production Conversion", path: "/master/production-conversion" },
      { label: "Branch Master", path: "/master/branch-master" },
      { label: "Wallet Top Up", path: "/master/wallet-top-up" },
    ],
  },
  {
    label: "GST Management",
    path: "/gst-management",
    children: [
      { label: "GST Rates", path: "/gst-management/gst-rates" },
      { label: "HSN/SAC Master", path: "/gst-management/hsn-sac" },
      { label: "GST Settings", path: "/gst-management/gst-settings" },
    ],
  },
  {
    label: "Reports",
    path: "/reports",
    children: [
      { label: "All Reports", path: "/reports" },
      { label: "Employee Bill Report", path: "/reports/employee-bill" },
      { label: "Sales Report", path: "/reports/sales" },
      { label: "Cashier Report", path: "/reports/cashier" },
      { label: "Items Wise Sales", path: "/reports/items-wise-sales" },
      { label: "Stock Report", path: "/reports/stock" },
      { label: "Day Wise Stock Report", path: "/reports/day-wise-stock" },
      { label: "Vendor Payments", path: "/reports/vendor-payments" },
      { label: "Expense Report", path: "/reports/expense" },
      { label: "Tally XML", path: "/reports/tally-xml" },
      { label: "GST Filing", path: "/reports/gst-filing" },
      { label: "Login History", path: "/reports/login-history" },
      { label: "Cancelled Bills", path: "/reports/cancelled-bills" },
      { label: "Cancelled KOT Report", path: "/reports/cancelled-kot" },
      { label: "Compliment Bill Report", path: "/reports/compliment-bill" },
      { label: "Bill Coupon Report", path: "/reports/bill-coupon" },
      { label: "Profit and Loss", path: "/reports/profit-and-loss" },
      { label: "MIS Report", path: "/reports/mis" },
      { label: "Profit Report Retail", path: "/reports/profit-retail" },
      { label: "Purchases Report", path: "/reports/purchases" },
      { label: "Stock Audit Report", path: "/reports/stock-audit" },
      { label: "Wallet Top Up Report", path: "/reports/wallet-top-up" },
    ],
  },
  {
    label: "Admin",
    path: "/admin",
    children: [
      { label: "Expenses", path: "/admin/expenses" },
      { label: "Vendor Payment", path: "/admin/vendor-payment" },
      { label: "User Creation", path: "/admin/user-creation" },
      { label: "Day Closing", path: "/admin/day-closing" },
      { label: "Advance Order", path: "/admin/advance-order" },
      { label: "Lock Items", path: "/admin/lock-items" },
      { label: "QR", path: "/admin/qr" },
      { label: "Print Templates", path: "/admin/print-templates" },
      { label: "Company Branding", path: "/admin/company-branding" },
      { label: "Backup & Restore", path: "/admin/backup-restore" },
      { label: "Cloud Backup", path: "/admin/cloud-backup" },
    ],
  },
  {
    label: "Production",
    path: "/production",
    children: [
      { label: "Prod. Planning", path: "/production/planning" },
      { label: "Prod. Planning List", path: "/production/planning-list" },
      { label: "Production-In", path: "/production/production-in" },
      { label: "Production-In List", path: "/production/production-in-list" },
      { label: "Production Out", path: "/production/production-out" },
      { label: "Production Out List", path: "/production/production-out-list" },
      { label: "Wastage", path: "/production/wastage" },
      { label: "Wastage List", path: "/production/wastage-list" },
    ],
  },
  {
    label: "Sales",
    path: "/sales",
    children: [
      { label: "Estimate", path: "/sales/estimate" },
      { label: "Invoice", path: "/sales/invoice" },
    ],
  },
  {
    label: "WhatsApp",
    path: "/whatsapp",
    children: [
      { label: "Balance & Analytics", path: "/whatsapp/balance-analytics" },
      { label: "Template Manager", path: "/whatsapp/template-manager" },
      { label: "Campaign", path: "/whatsapp/campaign" },
    ],
  },
  { label: "Events", path: "/events/event-management" },
  {
    label: "Cash Flow",
    path: "/cash-flow",
    children: [
      { label: "Cash Dashboard", path: "/cash-flow/dashboard" },
      { label: "Cash Transaction", path: "/cash-flow/transaction" },
      { label: "Cash Category", path: "/cash-flow/category" },
      { label: "Cash Account", path: "/cash-flow/account" },
    ],
  },
  {
    label: "Accounting",
    path: "/accounting",
    children: [
      { label: "Acc Dashboard", path: "/accounting/dashboard" },
      { label: "Quote", path: "/accounting/quote" },
      { label: "Invoice", path: "/accounting/invoice" },
      { label: "A4 Invoice", path: "/accounting/a4-invoice" },
      { label: "A4 Invoice List", path: "/accounting/a4-invoice-list" },
      { label: "Quote Template", path: "/accounting/quote-template" },
    ],
  },
];

export function flattenMenuPaths(): string[] {
  const paths: string[] = [];
  for (const item of ALL_MENU_ITEMS) {
    if (item.children) {
      for (const child of item.children) {
        paths.push(child.path);
      }
    } else {
      paths.push(item.path);
    }
  }
  return paths;
}
