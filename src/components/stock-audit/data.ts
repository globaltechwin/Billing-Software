export interface AuditProduct {
  id: string;
  prodCode: string;
  prodName: string;
  currentStock: number;
}

export const auditProducts: AuditProduct[] = [
  { id: "1", prodCode: "001", prodName: "T-Shirts", currentStock: -55 },
  { id: "2", prodCode: "002", prodName: "TESTOOO2", currentStock: -40 },
  { id: "3", prodCode: "", prodName: "Shirts", currentStock: -7 },
  { id: "4", prodCode: "", prodName: "Pant", currentStock: -5 },
  { id: "5", prodCode: "", prodName: "Pant25", currentStock: -31 },
  { id: "6", prodCode: "", prodName: "Sarees", currentStock: 0 },
  { id: "7", prodCode: "", prodName: "Pant30", currentStock: 0 },
];

export interface AuditItem extends AuditProduct {
  modifiedStock: string;
  remarks: string;
}

export const branches = [
  "Only Coffee Vegetarian Restaurant",
  "Main Branch",
  "Second Branch",
];
