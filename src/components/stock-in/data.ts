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

export const stockInProducts: StockInProduct[] = [
  { id: "1", name: "Rice (Basmati)", uom: "KG", currentStock: 150, purchaseRate: 85, gstPercentage: 5 },
  { id: "2", name: "Sugar (White)", uom: "KG", currentStock: 200, purchaseRate: 45, gstPercentage: 5 },
  { id: "3", name: "Maida (Refined Flour)", uom: "KG", currentStock: 80, purchaseRate: 35, gstPercentage: 5 },
  { id: "4", name: "Sunflower Oil", uom: "Ltr", currentStock: 50, purchaseRate: 120, gstPercentage: 5 },
  { id: "5", name: "Salt (Iodised)", uom: "KG", currentStock: 120, purchaseRate: 20, gstPercentage: 0 },
  { id: "6", name: "Turmeric Powder", uom: "Gm", currentStock: 500, purchaseRate: 60, gstPercentage: 5 },
  { id: "7", name: "Chilli Powder", uom: "Gm", currentStock: 450, purchaseRate: 75, gstPercentage: 5 },
  { id: "8", name: "Onion", uom: "KG", currentStock: 30, purchaseRate: 30, gstPercentage: 0 },
  { id: "9", name: "Tomato", uom: "KG", currentStock: 25, purchaseRate: 40, gstPercentage: 0 },
  { id: "10", name: "Potato", uom: "KG", currentStock: 60, purchaseRate: 25, gstPercentage: 0 },
  { id: "11", name: "Milk (Full Cream)", uom: "Ltr", currentStock: 40, purchaseRate: 55, gstPercentage: 5 },
  { id: "12", name: "Butter (Unsalted)", uom: "Gm", currentStock: 300, purchaseRate: 180, gstPercentage: 12 },
  { id: "13", name: "Paneer (Fresh)", uom: "Gm", currentStock: 200, purchaseRate: 90, gstPercentage: 5 },
  { id: "14", name: "Besan (Gram Flour)", uom: "KG", currentStock: 70, purchaseRate: 50, gstPercentage: 5 },
  { id: "15", name: "Semolina (Sooji)", uom: "KG", currentStock: 55, purchaseRate: 40, gstPercentage: 5 },
];

export const stockInVendors: StockInVendor[] = [
  { id: "1", name: "Fresh Foods Ltd", mobile: "9876543210" },
  { id: "2", name: "Sweet Supply Co", mobile: "9876543211" },
  { id: "3", name: "Grain Traders", mobile: "9876543212" },
  { id: "4", name: "Oil Mart", mobile: "9876543213" },
  { id: "5", name: "Spice World", mobile: "9876543214" },
  { id: "6", name: "Veggie Farm", mobile: "9876543215" },
  { id: "7", name: "Dairy Direct", mobile: "9876543216" },
];

export const stockInPOs: StockInPO[] = [
  {
    id: "1",
    poNo: "PO-0001",
    vendorName: "Fresh Foods Ltd",
    items: [
      { id: "p1", product: stockInProducts[0], orderedQty: 100, receivedQty: 0, pendingQty: 100, amount: 8500 },
      { id: "p2", product: stockInProducts[4], orderedQty: 50, receivedQty: 0, pendingQty: 50, amount: 1000 },
      { id: "p3", product: stockInProducts[7], orderedQty: 30, receivedQty: 0, pendingQty: 30, amount: 900 },
      { id: "p4", product: stockInProducts[8], orderedQty: 25, receivedQty: 0, pendingQty: 25, amount: 1000 },
      { id: "p5", product: stockInProducts[10], orderedQty: 40, receivedQty: 0, pendingQty: 40, amount: 2200 },
    ],
  },
  {
    id: "2",
    poNo: "PO-0002",
    vendorName: "Spice World",
    items: [
      { id: "p6", product: stockInProducts[5], orderedQty: 200, receivedQty: 0, pendingQty: 200, amount: 12000 },
      { id: "p7", product: stockInProducts[6], orderedQty: 150, receivedQty: 0, pendingQty: 150, amount: 11250 },
    ],
  },
  {
    id: "3",
    poNo: "PO-0003",
    vendorName: "Grain Traders",
    items: [
      { id: "p8", product: stockInProducts[2], orderedQty: 80, receivedQty: 0, pendingQty: 80, amount: 2800 },
      { id: "p9", product: stockInProducts[13], orderedQty: 60, receivedQty: 0, pendingQty: 60, amount: 3000 },
      { id: "p10", product: stockInProducts[14], orderedQty: 45, receivedQty: 0, pendingQty: 45, amount: 1800 },
    ],
  },
  {
    id: "4",
    poNo: "PO-0004",
    vendorName: "Oil Mart",
    items: [
      { id: "p11", product: stockInProducts[3], orderedQty: 50, receivedQty: 0, pendingQty: 50, amount: 6000 },
    ],
  },
  {
    id: "5",
    poNo: "PO-0005",
    vendorName: "Dairy Direct",
    items: [
      { id: "p12", product: stockInProducts[11], orderedQty: 100, receivedQty: 0, pendingQty: 100, amount: 18000 },
      { id: "p13", product: stockInProducts[12], orderedQty: 80, receivedQty: 0, pendingQty: 80, amount: 7200 },
    ],
  },
];
