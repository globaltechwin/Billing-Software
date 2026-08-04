export interface StockAuditRecord {
  id: string;
  sNo: number;
  auditNumber: string;
  auditDate: string;
  auditType: string;
  auditor: string;
  totalProducts: number;
  totalAdjustments: number;
  status: "Draft" | "Completed" | "Cancelled";
  createdBy: string;
  createdDate: string;
}
