export interface ExpenseCategory {
  id: number;
  categoryName: string;
  displayOrder: number;
  isActive: boolean;
  createdByUserId: number;
  createdByName: string;
  createdAt: string;
}

// Legacy type for backward compatibility in admin/expenses/page.tsx
export interface LegacyExpenseCategory {
  id: string;
  categoryId: number;
  categoryName: string;
  displayOrder: number;
  createdBy: string;
  createdDate: string;
}

export const sampleExpenseCategories: LegacyExpenseCategory[] = [
  { id: "1", categoryId: 17, categoryName: "Salary", displayOrder: 1, createdBy: "demo1", createdDate: "08/11/2021" },
  { id: "2", categoryId: 18, categoryName: "Petrol", displayOrder: 1, createdBy: "manager", createdDate: "05/03/2022" },
  { id: "3", categoryId: 19, categoryName: "Local Purchase", displayOrder: 2, createdBy: "manager", createdDate: "05/03/2022" },
];
