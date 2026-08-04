export interface Student {
  id: number;
  admissionNumber: string | null;
  firstName: string;
  lastName: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  mobileNumber: string | null;
  email: string | null;
  course: string | null;
  department: string | null;
  class: string | null;
  section: string | null;
  academicYear: string | null;
  rollNumber: string | null;
  parentName: string | null;
  parentMobile: string | null;
  parentEmail: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  pincode: string | null;
  remarks: string | null;
  block: string | null;
  roomNo: string | null;
  wallet: number;
  fingerPrint: string | null;
  isActive: boolean;
  createdByUserId: number;
  createdByName: string;
  updatedByUserId: number | null;
  updatedByName: string;
  createdAt: string;
  updatedAt: string;
}

export const GENDERS = ["Male", "Female", "Other"] as const;
