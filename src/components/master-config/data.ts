export interface ConfigSection {
  id: string;
  title: string;
  type: "reset" | "list" | "config";
  fields?: { label: string; value: string; required?: boolean }[];
  items?: string[];
  addButtonLabel?: string;
  hasChevron?: boolean;
  hasConfigure?: boolean;
  cloudPrint?: string;
  hasSave?: boolean;
}

export const initialSections: ConfigSection[] = [
  {
    id: "bill-no-reset",
    title: "Bill No Reset",
    type: "reset",
    fields: [{ label: "New Bill No", value: "1", required: true }],
  },
  {
    id: "token-no-reset",
    title: "Token No Reset",
    type: "reset",
    fields: [{ label: "New Token No", value: "1", required: true }],
  },
  {
    id: "product-category",
    title: "Product Category List",
    type: "list",
    addButtonLabel: "Add Product Category",
    hasChevron: true,
    items: ["Food", "Beverages", "Desserts", "Starters", "Main Course"],
  },
  {
    id: "department",
    title: "Department List",
    type: "list",
    addButtonLabel: "Add Department",
    hasChevron: true,
    items: ["Kitchen", "Store", "Production", "Housekeeping", "Laundry"],
  },
  {
    id: "branch-out",
    title: "Branch Out List",
    type: "list",
    addButtonLabel: "Add Branch Out",
    hasChevron: true,
    items: ["Main Branch", "Second Branch"],
  },
  {
    id: "payment-mode",
    title: "Payment Mode List",
    type: "list",
    addButtonLabel: "Add Payment Mode",
    hasChevron: true,
    items: ["Cash", "Card", "UPI", "Wallet", "Credit"],
  },
  {
    id: "order-type",
    title: "Order Type List",
    type: "list",
    hasChevron: true,
    items: ["Dine In", "Take Away", "Delivery"],
  },
  {
    id: "tables",
    title: "Tables",
    type: "list",
    addButtonLabel: "Add Table",
    hasChevron: true,
    items: ["Table 1", "Table 2", "Table 3", "Table 4", "Table 5", "Table 6"],
  },
  {
    id: "whatsapp-api",
    title: "WhatsApp API Config",
    type: "config",
    hasChevron: true,
  },
  {
    id: "branch-config",
    title: "Branch Config",
    type: "config",
    hasConfigure: true,
    cloudPrint: "NO (Local Print)",
    hasSave: true,
  },
  {
    id: "bill-print-designer",
    title: "Bill Print Designer",
    type: "config",
    hasConfigure: true,
  },
];
