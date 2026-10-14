export interface StockOutProduct {
  id: string;
  name: string;
  productCode?: string | null;
  barcode?: string | null;
  uom: string;
  currentStock: number;
  price: number;
}

export interface StockOutItem {
  id: string;
  product: StockOutProduct;
  qty: number;
}
