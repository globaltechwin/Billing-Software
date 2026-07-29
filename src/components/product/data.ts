export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  vendor: string;
  uom: string;
  visibleIn: string;
  taxGroupName: string;
  sellingPrice: number;
  mrp: number;
  barcode: string;
  reorderQty: number;
  status: "Active" | "Inactive";
}

export const productCategories = [
  "Cat",
  "Food",
  "Beverages",
  "Desserts",
  "Starters",
  "Main Course",
  "Stationery",
  "Electronics",
];

export const vendors = [
  "--Select Vendor--",
  "Fresh Foods Ltd",
  "Spice World",
  "Grain Traders",
  "Oil Mart",
  "Dairy Direct",
];

export const uomList = ["KG", "Ltr", "Gm", "PCS", "BOX", "PACK"];

export const visibleInOptions = [
  "Both Billing and Inventory",
  "Billing Only",
  "Inventory Only",
];

export const taxGroups = [
  "--Select Tax Group Name",
  "GST 0%",
  "GST 5%",
  "GST 12%",
  "GST 18%",
  "GST 28%",
];

export const orderTypes = [
  "Laundry Service",
  "Dine In",
  "Take Away",
  "Delivery",
];

export const sampleProducts: Product[] = [
  { id: "1", code: "PRD-001", name: "Rice (Basmati)", category: "Food", vendor: "Fresh Foods Ltd", uom: "KG", visibleIn: "Both Billing and Inventory", taxGroupName: "GST 5%", sellingPrice: 95.00, mrp: 100.00, barcode: "8901234567001", reorderQty: 50, status: "Active" },
  { id: "2", code: "PRD-002", name: "Sugar (White)", category: "Food", vendor: "Grain Traders", uom: "KG", visibleIn: "Both Billing and Inventory", taxGroupName: "GST 5%", sellingPrice: 50.00, mrp: 55.00, barcode: "8901234567002", reorderQty: 100, status: "Active" },
  { id: "3", code: "PRD-003", name: "Maida (Refined Flour)", category: "Food", vendor: "Grain Traders", uom: "KG", visibleIn: "Both Billing and Inventory", taxGroupName: "GST 5%", sellingPrice: 40.00, mrp: 45.00, barcode: "8901234567003", reorderQty: 80, status: "Active" },
  { id: "4", code: "PRD-004", name: "Sunflower Oil", category: "Food", vendor: "Oil Mart", uom: "Ltr", visibleIn: "Both Billing and Inventory", taxGroupName: "GST 5%", sellingPrice: 130.00, mrp: 140.00, barcode: "8901234567004", reorderQty: 30, status: "Active" },
  { id: "5", code: "PRD-005", name: "Salt (Iodised)", category: "Food", vendor: "Fresh Foods Ltd", uom: "KG", visibleIn: "Both Billing and Inventory", taxGroupName: "GST 0%", sellingPrice: 22.00, mrp: 25.00, barcode: "8901234567005", reorderQty: 100, status: "Active" },
  { id: "6", code: "PRD-006", name: "Turmeric Powder", category: "Food", vendor: "Spice World", uom: "Gm", visibleIn: "Both Billing and Inventory", taxGroupName: "GST 5%", sellingPrice: 65.00, mrp: 70.00, barcode: "8901234567006", reorderQty: 200, status: "Active" },
  { id: "7", code: "PRD-007", name: "Chilli Powder", category: "Food", vendor: "Spice World", uom: "Gm", visibleIn: "Both Billing and Inventory", taxGroupName: "GST 5%", sellingPrice: 80.00, mrp: 85.00, barcode: "8901234567007", reorderQty: 200, status: "Active" },
  { id: "8", code: "PRD-008", name: "Onion", category: "Food", vendor: "Fresh Foods Ltd", uom: "KG", visibleIn: "Both Billing and Inventory", taxGroupName: "GST 0%", sellingPrice: 35.00, mrp: 40.00, barcode: "8901234567008", reorderQty: 50, status: "Active" },
  { id: "9", code: "PRD-009", name: "Tomato", category: "Food", vendor: "Fresh Foods Ltd", uom: "KG", visibleIn: "Both Billing and Inventory", taxGroupName: "GST 0%", sellingPrice: 45.00, mrp: 50.00, barcode: "8901234567009", reorderQty: 40, status: "Active" },
  { id: "10", code: "PRD-010", name: "Potato", category: "Food", vendor: "Fresh Foods Ltd", uom: "KG", visibleIn: "Both Billing and Inventory", taxGroupName: "GST 0%", sellingPrice: 28.00, mrp: 30.00, barcode: "8901234567010", reorderQty: 60, status: "Active" },
  { id: "11", code: "PRD-011", name: "Milk (Full Cream)", category: "Food", vendor: "Dairy Direct", uom: "Ltr", visibleIn: "Both Billing and Inventory", taxGroupName: "GST 5%", sellingPrice: 60.00, mrp: 65.00, barcode: "8901234567011", reorderQty: 30, status: "Active" },
  { id: "12", code: "PRD-012", name: "Butter (Unsalted)", category: "Food", vendor: "Dairy Direct", uom: "Gm", visibleIn: "Both Billing and Inventory", taxGroupName: "GST 12%", sellingPrice: 200.00, mrp: 220.00, barcode: "8901234567012", reorderQty: 100, status: "Active" },
  { id: "13", code: "PRD-013", name: "Paneer (Fresh)", category: "Food", vendor: "Dairy Direct", uom: "Gm", visibleIn: "Both Billing and Inventory", taxGroupName: "GST 12%", sellingPrice: 100.00, mrp: 110.00, barcode: "8901234567013", reorderQty: 80, status: "Active" },
  { id: "14", code: "PRD-014", name: "Besan (Gram Flour)", category: "Food", vendor: "Grain Traders", uom: "KG", visibleIn: "Both Billing and Inventory", taxGroupName: "GST 5%", sellingPrice: 55.00, mrp: 60.00, barcode: "8901234567014", reorderQty: 60, status: "Active" },
  { id: "15", code: "PRD-015", name: "Semolina (Sooji)", category: "Food", vendor: "Grain Traders", uom: "KG", visibleIn: "Both Billing and Inventory", taxGroupName: "GST 5%", sellingPrice: 45.00, mrp: 50.00, barcode: "8901234567015", reorderQty: 50, status: "Inactive" },
];
