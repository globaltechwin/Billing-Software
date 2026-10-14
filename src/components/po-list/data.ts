export interface PORecord {
  id: string;
  sNo: number;
  poDate: string;
  poNo: string;
  branchName: string;
  noOfProducts: number;
  grandTotal: number;
  remarks: string;
  vendorName: string;
  createdDate: string;
  requestStatus: "Pending" | "Approved" | "Rejected" | "Completed";
}
