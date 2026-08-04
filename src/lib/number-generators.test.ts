// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Prisma before importing the module under test
vi.mock("@/lib/prisma", () => ({
  prisma: {
    vendor: { findFirst: vi.fn() },
    purchaseOrder: { findFirst: vi.fn() },
    goodsReceipt: { findFirst: vi.fn() },
    expense: { findFirst: vi.fn() },
    invoice: { findFirst: vi.fn() },
  },
}));

import {
  generateVendorCode,
  generatePONumber,
  generateGRNNumber,
  generateExpenseNumber,
} from "./number-generators";
import { prisma } from "@/lib/prisma";

const mockedPrisma = prisma as unknown as { vendor: { findFirst: ReturnType<typeof vi.fn> }; purchaseOrder: { findFirst: ReturnType<typeof vi.fn> }; goodsReceipt: { findFirst: ReturnType<typeof vi.fn> }; expense: { findFirst: ReturnType<typeof vi.fn> }; };

describe("number-generators", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateVendorCode", () => {
    it("returns VEND0001 when no records exist", async () => {
      mockedPrisma.vendor.findFirst.mockResolvedValue(null);
      const result = await generateVendorCode(6);
      expect(result).toBe("VEND0001");
    });

    it("increments from last record", async () => {
      mockedPrisma.vendor.findFirst.mockResolvedValue({ vendorCode: "VEND0042" });
      const result = await generateVendorCode(6);
      expect(result).toBe("VEND0043");
    });
  });

  describe("generatePONumber", () => {
    it("returns PO000001 when no records", async () => {
      mockedPrisma.purchaseOrder.findFirst.mockResolvedValue(null);
      const result = await generatePONumber(6);
      expect(result).toBe("PO000001");
    });

    it("increments from last PO", async () => {
      mockedPrisma.purchaseOrder.findFirst.mockResolvedValue({ poNumber: "PO000099" });
      const result = await generatePONumber(6);
      expect(result).toBe("PO000100");
    });
  });

  describe("generateGRNNumber", () => {
    it("returns GRN000001 when no records", async () => {
      mockedPrisma.goodsReceipt.findFirst.mockResolvedValue(null);
      const result = await generateGRNNumber(6);
      expect(result).toBe("GRN000001");
    });
  });

  describe("generateExpenseNumber", () => {
    it("returns EXP-1001 when no records", async () => {
      mockedPrisma.expense.findFirst.mockResolvedValue(null);
      const result = await generateExpenseNumber(6);
      expect(result).toBe("EXP-1001");
    });

    it("increments from last expense", async () => {
      mockedPrisma.expense.findFirst.mockResolvedValue({ expenseNumber: "EXP-1050" });
      const result = await generateExpenseNumber(6);
      expect(result).toBe("EXP-1051");
    });
  });
});
