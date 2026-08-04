import { vi, type Mock } from "vitest";

// Creates a Proxy-based Prisma mock that caches function instances
// so .mockResolvedValue() works correctly on repeated property access
export function createPrismaMock() {
  const fnCache = new Map<string, Mock>();

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
          get(_m, method) {
            return cachedFn(`${key}.${String(method)}`);
          },
        }) as unknown as Mock);
      }
      return fnCache.get(key);
    },
  });

  return { prisma: proxy, cachedFn, fnCache };
}
