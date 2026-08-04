import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
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
      if (key === "$transaction") {
        return vi.fn().mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => cb(proxy));
      }
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

describe("GET /api/products", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns products list", async () => {
    cachedFn("product.findMany").mockResolvedValue([
      { id: 1, productName: "Rice", productCode: "PRD-001", isActive: true },
    ]);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.products).toHaveLength(1);
  });

  it("returns empty list when no products", async () => {
    cachedFn("product.findMany").mockResolvedValue([]);
    const res = await GET();
    const data = await res.json();
    expect(data.products).toHaveLength(0);
  });
});

describe("POST /api/products", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns 400 when productName is missing", async () => {
    const req = new NextRequest("http://localhost/api/products", {
      method: "POST", body: JSON.stringify({ category: "Food" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("creates product with valid data", async () => {
    cachedFn("company.findUnique").mockResolvedValue({ gstEnabled: true });
    cachedFn("gSTMaster.findFirst").mockResolvedValue({ id: 1 });
    cachedFn("product.findFirst").mockResolvedValue(null);
    cachedFn("product.create").mockResolvedValue({ id: 1, productName: "Test Product" });
    const req = new NextRequest("http://localhost/api/products", {
      method: "POST",
      body: JSON.stringify({ productName: "Test Product", category: "Food", unit: "KG", purchasePrice: 50, sellingPrice: 75, gstMasterId: 1, isActive: true }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
  });
});
