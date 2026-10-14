export interface POProduct {
  id: string;
  name: string;
  productCode?: string | null;
  barcode?: string | null;
  category: string;
  uom: string;
  vendor: string;
  currentStock: number;
  price: number;
  taxRate: number;
}

export interface POItem {
  id: string;
  product: POProduct;
  reqQty: number;
}

