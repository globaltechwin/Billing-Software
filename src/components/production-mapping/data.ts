export interface ProductionMapping {
  id: string;
  productName: string;
  uom: string;
  mappingType: string;
  itemName: string;
  quantity: number;
  purchasePrice: number;
  cost: number;
}

export const sampleProductionMappings: ProductionMapping[] = [
  {
    id: "1",
    productName: "Rice (Basmati)",
    uom: "KG",
    mappingType: "Production",
    itemName: "Sugar (White)",
    quantity: 2,
    purchasePrice: 50,
    cost: 100,
  },
  {
    id: "2",
    productName: "Sunflower Oil",
    uom: "Ltr",
    mappingType: "Recipes",
    itemName: "Maida (Refined Flour)",
    quantity: 1,
    purchasePrice: 40,
    cost: 40,
  },
  {
    id: "3",
    productName: "Turmeric Powder",
    uom: "Gm",
    mappingType: "Modifier",
    itemName: "Chilli Powder",
    quantity: 0.5,
    purchasePrice: 80,
    cost: 40,
  },
];
