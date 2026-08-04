import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";

const { prisma: mockPrisma, cachedFn } = vi.hoisted(() => {
  const fnCache = new Map<string, ReturnType<typeof vi.fn>>();
  function cachedFn(key: string) {
    if (!fnCache.has(key)) fnCache.set(key, vi.fn().mockResolvedValue(null));
    return fnCache.get(key)!;
  }
  const proxy = new Proxy({} as Record<string, unknown>, {
    get(_t, prop) {
      const key = String(prop);
      if (!fnCache.has(key)) {
        fnCache.set(key, new Proxy({} as Record<string, unknown>, {
          get(_m, method) { return cachedFn(`${key}.${String(method)}`); },
        }) as unknown as ReturnType<typeof vi.fn>);
      }
      return fnCache.get(key);
    },
  });
  return { prisma: proxy, cachedFn };
});

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/company-context", () => ({
  getCurrentCompanyId: vi.fn().mockResolvedValue(6),
  getCompanyContext: vi.fn().mockResolvedValue({ userId: 23, companyId: 6, username: "superadmin" }),
}));

describe("GET /api/goods-receipts/[id]", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns 404 when receipt not found", async () => {
    const req = new NextRequest("http://localhost/api/goods-receipts/999");
    const res = await GET(req, { params: Promise.resolve({ id: "999" }) });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe("Goods receipt not found");
  });

  it("returns receipt with items when found", async () => {
    cachedFn("goodsReceipt.findFirst").mockResolvedValue({
      id: 1, grnNumber: "GRN000001", companyId: 6, vendorId: 1, poId: 1,
    });
    cachedFn("goodsReceiptItem.findMany").mockResolvedValue([
      { id: 1, productId: 1, productNameSnapshot: "Rice", quantity: 10, unitPrice: 50 },
    ]);
    const req = new NextRequest("http://localhost/api/goods-receipts/1");
    const res = await GET(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.grn.grnNumber).toBe("GRN000001");
  });
});
