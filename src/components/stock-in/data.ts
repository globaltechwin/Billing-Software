export interface StockInProduct {
  id: string;
  name: string;
  uom: string;
  currentStock: number;
  purchaseRate: number;
  gstPercentage: number;
}

export interface StockInItem {
  id: string;
  product: StockInProduct;
  orderedQty: number;
  receivedQty: number;
  pendingQty: number;
  amount: number;
}

export interface StockInVendor {
  id: string;
  name: string;
  mobile: string;
}

export interface StockInPO {
  id: string;
  poNo: string;
  vendorName: string;
  items: StockInItem[];
}
