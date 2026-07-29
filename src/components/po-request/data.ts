export interface POProduct {
  id: string;
  name: string;
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

export interface Vendor {
  id: string;
  name: string;
  mobile: string;
  branch: string;
}

export const poProducts: POProduct[] = [
  { id: "1", name: "Rice (Basmati)", uom: "KG", vendor: "Fresh Foods Ltd", currentStock: 150, price: 85, taxRate: 5 },
  { id: "2", name: "Sugar (White)", uom: "KG", vendor: "Sweet Supply Co", currentStock: 200, price: 45, taxRate: 5 },
  { id: "3", name: "Maida (Refined Flour)", uom: "KG", vendor: "Grain Traders", currentStock: 80, price: 35, taxRate: 5 },
  { id: "4", name: "Sunflower Oil", uom: "Ltr", vendor: "Oil Mart", currentStock: 50, price: 120, taxRate: 12 },
  { id: "5", name: "Salt (Iodised)", uom: "KG", vendor: "Fresh Foods Ltd", currentStock: 120, price: 20, taxRate: 5 },
  { id: "6", name: "Turmeric Powder", uom: "Gm", vendor: "Spice World", currentStock: 500, price: 60, taxRate: 5 },
  { id: "7", name: "Chilli Powder", uom: "Gm", vendor: "Spice World", currentStock: 450, price: 75, taxRate: 5 },
  { id: "8", name: "Onion", uom: "KG", vendor: "Veggie Farm", currentStock: 30, price: 30, taxRate: 0 },
  { id: "9", name: "Tomato", uom: "KG", vendor: "Veggie Farm", currentStock: 25, price: 40, taxRate: 0 },
  { id: "10", name: "Potato", uom: "KG", vendor: "Veggie Farm", currentStock: 60, price: 25, taxRate: 0 },
  { id: "11", name: "Milk (Full Cream)", uom: "Ltr", vendor: "Dairy Direct", currentStock: 40, price: 55, taxRate: 5 },
  { id: "12", name: "Butter (Unsalted)", uom: "Gm", vendor: "Dairy Direct", currentStock: 300, price: 180, taxRate: 12 },
  { id: "13", name: "Paneer (Fresh)", uom: "Gm", vendor: "Dairy Direct", currentStock: 200, price: 90, taxRate: 5 },
  { id: "14", name: "Besan (Gram Flour)", uom: "KG", vendor: "Grain Traders", currentStock: 70, price: 50, taxRate: 5 },
  { id: "15", name: "Semolina (Sooji)", uom: "KG", vendor: "Grain Traders", currentStock: 55, price: 40, taxRate: 5 },
];

export const vendors: Vendor[] = [
  { id: "1", name: "Fresh Foods Ltd", mobile: "9876543210", branch: "Main Branch" },
  { id: "2", name: "Sweet Supply Co", mobile: "9876543211", branch: "Main Branch" },
  { id: "3", name: "Grain Traders", mobile: "9876543212", branch: "Second Branch" },
  { id: "4", name: "Oil Mart", mobile: "9876543213", branch: "Main Branch" },
  { id: "5", name: "Spice World", mobile: "9876543214", branch: "Second Branch" },
  { id: "6", name: "Veggie Farm", mobile: "9876543215", branch: "Main Branch" },
  { id: "7", name: "Dairy Direct", mobile: "9876543216", branch: "Main Branch" },
];

export const categories = [
  "All Categories",
  "Groceries",
  "Dairy",
  "Vegetables",
  "Spices",
  "Oils",
];
