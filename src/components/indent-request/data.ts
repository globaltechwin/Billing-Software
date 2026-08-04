export interface IndentProduct {
  id: string;
  name: string;
  uom: string;
  currentStock: number;
}

export interface IndentItem {
  id: string;
  product: IndentProduct;
  requiredQty: number;
  remarks: string;
}

export interface Department {
  id: string;
  name: string;
}

export const departments: Department[] = [
  { id: "Kitchen", name: "Kitchen" },
  { id: "Store", name: "Store" },
  { id: "Production", name: "Production" },
  { id: "Housekeeping", name: "Housekeeping" },
  { id: "Laundry", name: "Laundry" },
];
