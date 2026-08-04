export interface Unit {
  id: number;
  unitName: string;
  shortName: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  createdByUserId: number;
  createdByName: string;
  createdAt: string;
}

export interface LegacyUnit {
  id: string;
  unitName: string;
}

export const sampleUnits: LegacyUnit[] = [
  { id: "1", unitName: "KG" },
  { id: "2", unitName: "LTR" },
  { id: "3", unitName: "G" },
  { id: "4", unitName: "ML" },
  { id: "5", unitName: "PCS" },
  { id: "6", unitName: "BOX" },
  { id: "7", unitName: "PACK" },
  { id: "8", unitName: "MTR" },
  { id: "9", unitName: "NOS" },
];
