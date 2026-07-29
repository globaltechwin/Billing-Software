export interface Unit {
  id: string;
  unitName: string;
  displayOrder: number;
  isActive: boolean;
  createdBy: string;
  createdDate: string;
}

export const sampleUnits: Unit[] = [
  { id: "1", unitName: "KG", displayOrder: 1, isActive: true, createdBy: "demo1", createdDate: "15/10/2020" },
  { id: "2", unitName: "LITRE", displayOrder: 2, isActive: false, createdBy: "demo1", createdDate: "03/03/2022" },
  { id: "3", unitName: "NOS", displayOrder: 3, isActive: true, createdBy: "demo1", createdDate: "04/11/2020" },
  { id: "4", unitName: "BOX", displayOrder: 4, isActive: true, createdBy: "demo1", createdDate: "05/11/2020" },
  { id: "5", unitName: "GRAMS", displayOrder: 5, isActive: true, createdBy: "demo1", createdDate: "18/03/2021" },
  { id: "6", unitName: "PIECES", displayOrder: 1, isActive: true, createdBy: "demo", createdDate: "19/03/2022" },
  { id: "7", unitName: "SETS", displayOrder: 1, isActive: true, createdBy: "demo", createdDate: "19/03/2022" },
  { id: "8", unitName: "ML", displayOrder: 2, isActive: true, createdBy: "demo1", createdDate: "25/09/2023" },
  { id: "9", unitName: "KILO GRAMS", displayOrder: 1, isActive: true, createdBy: "demo1", createdDate: "28/01/2024" },
];
