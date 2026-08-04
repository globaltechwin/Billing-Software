export interface SummaryCard {
  label: string;
  value: number | string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
}

export interface LowStockProduct {
  id: number;
  productName: string;
  currentStock: number;
  reorderLevel: number;
  unit: string;
}

export interface OutOfStockProduct {
  id: number;
  productName: string;
  unit: string;
}

export interface RecentStockIn {
  id: number;
  grnNumber: string;
  vendorName: string;
  date: string;
  totalQty: number;
  status: string;
  createdBy: string;
}

export interface RecentStockOut {
  id: number;
  stockOutNumber: string;
  date: string;
  totalQty: number;
  type: string;
  status: string;
  createdBy: string;
}

export interface RecentPO {
  id: number;
  poNumber: string;
  vendorName: string;
  date: string;
  grandTotal: number;
  status: string;
  createdBy: string;
}

export interface RecentIndent {
  id: number;
  indentNumber: string;
  department: string;
  priority: string;
  date: string;
  totalQty: number;
  status: string;
  createdBy: string;
}

export interface IndentStatusItem {
  name: string;
  value: number;
  color: string;
}

export interface DashboardData {
  summaryCards: {
    totalProducts: number;
    totalVendors: number;
    pendingIndents: number;
    pendingPOs: number;
    todayStockIn: number;
    todayStockOut: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalInventoryValue: number;
  };
  lowStockProducts: LowStockProduct[];
  outOfStockProducts: OutOfStockProduct[];
  recentStockIns: RecentStockIn[];
  recentStockOuts: RecentStockOut[];
  recentPOs: RecentPO[];
  recentIndents: RecentIndent[];
  indentStatus: IndentStatusItem[];
}
