export const inventoryDashboardData = {
  summaryCards: [
    {
      label: "TOTAL PRODUCTS",
      value: 7,
      borderColor: "#3b82f6",
      iconBg: "#eff6ff",
      iconColor: "#3b82f6",
    },
    {
      label: "LOW STOCK ITEMS",
      value: 0,
      borderColor: "#f59e0b",
      iconBg: "#fffbeb",
      iconColor: "#f59e0b",
    },
    {
      label: "TODAY STOCK IN",
      value: "0.00",
      borderColor: "#ef4444",
      iconBg: "#fef2f2",
      iconColor: "#ef4444",
    },
    {
      label: "TODAY STOCK OUT",
      value: "0.00",
      borderColor: "#a855f7",
      iconBg: "#faf5ff",
      iconColor: "#a855f7",
    },
    {
      label: "PENDING INDENTS",
      value: 0,
      borderColor: "#3b82f6",
      iconBg: "#eff6ff",
      iconColor: "#3b82f6",
    },
    {
      label: "PENDING PO",
      value: 0,
      borderColor: "#22c55e",
      iconBg: "#f0fdf4",
      iconColor: "#22c55e",
    },
  ],
  indentStatus: [
    { name: "Approved", value: 5, color: "#3d9a7e" },
    { name: "HO Approved", value: 3, color: "#1e293b" },
    { name: "Rejected", value: 2, color: "#d1d5db" },
  ],
  lowStockAlerts: [] as { name: string; stock: number; reorderLevel: number }[],
};
