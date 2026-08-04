export interface IndentRecord {
  id: string;
  sNo: number;
  indentNo: string;
  indentDate: string;
  requestedBy: string;
  department: string;
  priority: string;
  requiredDate: string;
  totalProducts: number;
  totalQty: number;
  remarks: string;
  status: "Pending" | "Approved" | "Rejected" | "Completed" | "Cancelled";
  createdBy: string;
  createdDate: string;
}
