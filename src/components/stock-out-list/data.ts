export interface StockOutRecord {
  id: string;
  sNo: number;
  stockOutNo: string;
  date: string;
  stockOutType: string;
  referenceNumber: string;
  totalItems: number;
  totalQuantity: number;
  totalAmount: number;
  remarks: string;
  status: "Pending" | "Completed" | "Cancelled";
  createdBy: string;
  createdDate: string;
}
