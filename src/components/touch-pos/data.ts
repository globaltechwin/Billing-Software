export interface Product {
  id: number;
  name: string;
  productCode?: string | null;
  barcode?: string | null;
  price: number;
  category: string;
  gstRate: number;
  color: string;
}

export interface CartItem {
  id: number;
  product: Product;
  qty: number;
}
