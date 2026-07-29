export interface StockInProduct {
  id: string;
  name: string;
  uom: string;
  currentStock: number;
}

export interface StockInItem {
  id: string;
  product: StockInProduct;
  grnQty: number;
}

export interface StockInVendor {
  id: string;
  name: string;
  mobile: string;
}

export const stockInProducts: StockInProduct[] = [
  { id: "1", name: "Rice (Basmati)", uom: "KG", currentStock: 150 },
  { id: "2", name: "Sugar (White)", uom: "KG", currentStock: 200 },
  { id: "3", name: "Maida (Refined Flour)", uom: "KG", currentStock: 80 },
  { id: "4", name: "Sunflower Oil", uom: "Ltr", currentStock: 50 },
  { id: "5", name: "Salt (Iodised)", uom: "KG", currentStock: 120 },
  { id: "6", name: "Turmeric Powder", uom: "Gm", currentStock: 500 },
  { id: "7", name: "Chilli Powder", uom: "Gm", currentStock: 450 },
  { id: "8", name: "Onion", uom: "KG", currentStock: 30 },
  { id: "9", name: "Tomato", uom: "KG", currentStock: 25 },
  { id: "10", name: "Potato", uom: "KG", currentStock: 60 },
  { id: "11", name: "Milk (Full Cream)", uom: "Ltr", currentStock: 40 },
  { id: "12", name: "Butter (Unsalted)", uom: "Gm", currentStock: 300 },
  { id: "13", name: "Paneer (Fresh)", uom: "Gm", currentStock: 200 },
  { id: "14", name: "Besan (Gram Flour)", uom: "KG", currentStock: 70 },
  { id: "15", name: "Semolina (Sooji)", uom: "KG", currentStock: 55 },
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
