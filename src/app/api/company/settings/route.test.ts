import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PATCH } from "./route";
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

describe("GET /api/company/settings", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns company settings", async () => {
    cachedFn("company.findUnique").mockResolvedValue({
      id: 6, companyName: "Test Restaurant", gstNumber: "27AABCT1234F1Z5",
    });
    cachedFn("userCompany.findUnique").mockResolvedValue({ role: { name: "Owner" } });
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.settings.companyName).toBe("Test Restaurant");
  });
});

describe("PATCH /api/company/settings", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("updates settings for Owner", async () => {
    cachedFn("userCompany.findUnique").mockResolvedValue({ role: { name: "Owner" } });
    cachedFn("company.update").mockResolvedValue({});
    const req = new NextRequest("http://localhost/api/company/settings", {
      method: "PATCH", body: JSON.stringify({ companyName: "Updated Name" }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it("returns 403 for non-owner/non-admin", async () => {
    cachedFn("userCompany.findUnique").mockResolvedValue({ role: { name: "Staff" } });
    const req = new NextRequest("http://localhost/api/company/settings", {
      method: "PATCH", body: JSON.stringify({ companyName: "Hacked" }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(403);
  });
});
