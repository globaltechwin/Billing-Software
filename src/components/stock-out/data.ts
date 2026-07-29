export interface StockOutProduct {
  id: string;
  name: string;
  uom: string;
  currentStock: number;
  price: number;
}

export interface StockOutItem {
  id: string;
  product: StockOutProduct;
  qty: number;
}

export const stockOutProducts: StockOutProduct[] = [
  { id: "1", name: "Rice (Basmati)", uom: "KG", currentStock: 150, price: 85 },
  { id: "2", name: "Sugar (White)", uom: "KG", currentStock: 200, price: 45 },
  { id: "3", name: "Maida (Refined Flour)", uom: "KG", currentStock: 80, price: 35 },
  { id: "4", name: "Sunflower Oil", uom: "Ltr", currentStock: 50, price: 120 },
  { id: "5", name: "Salt (Iodised)", uom: "KG", currentStock: 120, price: 20 },
  { id: "6", name: "Turmeric Powder", uom: "Gm", currentStock: 500, price: 60 },
  { id: "7", name: "Chilli Powder", uom: "Gm", currentStock: 450, price: 75 },
  { id: "8", name: "Onion", uom: "KG", currentStock: 30, price: 30 },
  { id: "9", name: "Tomato", uom: "KG", currentStock: 25, price: 40 },
  { id: "10", name: "Potato", uom: "KG", currentStock: 60, price: 25 },
  { id: "11", name: "Milk (Full Cream)", uom: "Ltr", currentStock: 40, price: 55 },
  { id: "12", name: "Butter (Unsalted)", uom: "Gm", currentStock: 300, price: 180 },
  { id: "13", name: "Paneer (Fresh)", uom: "Gm", currentStock: 200, price: 90 },
  { id: "14", name: "Besan (Gram Flour)", uom: "KG", currentStock: 70, price: 50 },
  { id: "15", name: "Semolina (Sooji)", uom: "KG", currentStock: 55, price: 40 },
];

export const departments = [
  "Kitchen",
  "Production",
  "Housekeeping",
  "Laundry",
  "Store",
];
