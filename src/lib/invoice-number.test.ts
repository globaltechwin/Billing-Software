// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    invoice: { findFirst: vi.fn() },
  },
}));

import { generateInvoiceNumber } from "./invoice-number";
import { prisma } from "@/lib/prisma";

const mockedPrisma = prisma as unknown as { invoice: { findFirst: ReturnType<typeof vi.fn> }; };

describe("generateInvoiceNumber", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns INV6-0001 when no invoices exist for company", async () => {
    mockedPrisma.invoice.findFirst.mockResolvedValue(null);
    const result = await generateInvoiceNumber(6);
    expect(result).toBe("INV6-0001");
  });

  it("increments from last invoice", async () => {
    mockedPrisma.invoice.findFirst.mockResolvedValue({
      invoiceNumber: "INV6-0015",
    });
    const result = await generateInvoiceNumber(6);
    expect(result).toBe("INV6-0016");
  });

  it("uses company-specific prefix", async () => {
    mockedPrisma.invoice.findFirst.mockResolvedValue(null);
    const result = await generateInvoiceNumber(12);
    expect(result).toBe("INV12-0001");
  });
});
