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

export const categoryUomMap: Record<string, string[]> = {
  Cat: ["KG", "Gm", "Ltr", "ML", "Pcs", "Nos", "Box", "Pack", "Set", "Dozen", "Sheet", "Ream"],
  Food: ["KG", "Gm", "Ltr", "ML", "Pcs", "Nos", "Dozen", "Packet", "Slice", "Piece"],
  Beverages: ["Ltr", "ML", "Pcs", "Nos", "Can", "Bottle", "Pack", "Glass"],
  Desserts: ["Pcs", "Nos", "Slice", "Bowl", "Cup", "Pack", "Dozen"],
  Starters: ["Pcs", "Nos", "Plate", "Bowl", "Pack", "Dozen"],
  "Main Course": ["Pcs", "Nos", "Plate", "Bowl", "Pack", "Dozen", "Kg"],
  Stationery: ["Pcs", "Nos", "Box", "Pack", "Sheet", "Ream", "Dozen", "Set", "Bundle"],
  Electronics: ["Pcs", "Nos", "Box", "Set", "Unit", "Pack", "Pair"],
  Donation: ["Nos", "Pcs", "Sheet", "Year", "Set", "Pack"],
};

export const uomList = ["KG", "Ltr", "Gm", "PCS", "BOX", "PACK"];

export const visibleInOptions = [
  "Both Billing and Inventory",
  "Billing Only",
  "Inventory Only",
];

export const orderTypes = [
  "Laundry Service",
  "Dine In",
  "Take Away",
  "Delivery",
];
