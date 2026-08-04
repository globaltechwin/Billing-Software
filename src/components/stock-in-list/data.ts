export interface StockInRecord {
  id: string;
  sNo: number;
  stockInNo: string;
  date: string;
  vendorName: string;
  purchaseOrder: string;
  totalItems: number;
  totalQuantity: number;
  totalAmount: number;
  status: "Pending" | "Received" | "Partial" | "Cancelled";
}
