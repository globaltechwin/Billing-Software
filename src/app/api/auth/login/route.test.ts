import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

// Cache mock functions so repeated access returns the same instance
const fnCache = new Map<string, ReturnType<typeof vi.fn>>();

function cachedFn(key: string) {
  if (!fnCache.has(key)) fnCache.set(key, vi.fn().mockResolvedValue(null));
  return fnCache.get(key)!;
}

const { mockPrisma, mockVerifyPassword } = vi.hoisted(() => {
  const prismaProxy = new Proxy({} as Record<string, unknown>, {
    get(_t, prop) {
      const key = String(prop);
      if (key === "$transaction") {
        return vi.fn().mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => cb(prismaProxy));
      }
      // Return a sub-proxy for model methods
      if (!fnCache.has(key)) {
        fnCache.set(key, new Proxy({} as Record<string, unknown>, {
          get(_m, method) {
            const methodKey = `${key}.${String(method)}`;
            return cachedFn(methodKey);
          },
        }) as unknown as ReturnType<typeof vi.fn>);
      }
      return fnCache.get(key);
    },
  });

  return {
    mockPrisma: prismaProxy,
    mockVerifyPassword: vi.fn().mockResolvedValue(true),
  };
});

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/auth", () => ({
  verifyPassword: mockVerifyPassword,
  signToken: vi.fn().mockResolvedValue("mock-jwt"),
  setAuthCookie: vi.fn().mockResolvedValue(undefined),
  shouldSecureCookie: vi.fn().mockReturnValue(false),
}));

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fnCache.clear();
    mockVerifyPassword.mockResolvedValue(true);
  });

  it("returns 400 when username is missing", async () => {
    const req = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ password: "pass" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when password is missing", async () => {
    const req = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: "admin" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 for non-existent user", async () => {
    const req = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: "nobody", password: "pass" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 for wrong password", async () => {
    mockVerifyPassword.mockResolvedValue(false);
    cachedFn("user.findUnique").mockResolvedValue({
      id: 1, username: "admin", password: "hashed", isActive: true,
      userCompanies: [{ companyId: 6 }],
    });

    const req = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: "admin", password: "wrong" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns success for valid credentials", async () => {
    cachedFn("user.findUnique").mockResolvedValue({
      id: 23, username: "superadmin", password: "hashed", isActive: true,
      userCompanies: [{ companyId: 6, role: { name: "Owner" }, company: { companyName: "Test Co" } }],
      roleId: 1, defaultCompanyId: 6, name: "Super Admin",
    });
    cachedFn("rolePermission.findMany").mockResolvedValue([]);
    cachedFn("userMenuAccess.findMany").mockResolvedValue([]);
    cachedFn("loginHistory.create").mockResolvedValue({});

    const req = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: "superadmin", password: "admin123" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.user).toBeDefined();
  });
});
