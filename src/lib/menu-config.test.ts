// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { flattenMenuPaths, ALL_MENU_ITEMS } from "./menu-config";

describe("flattenMenuPaths", () => {
  it("returns all leaf paths", () => {
    const paths = flattenMenuPaths();
    expect(paths).toContain("/dashboard");
    expect(paths).toContain("/billing");
    expect(paths).toContain("/view-bill/bill-list");
    expect(paths).toContain("/inventory/indent-request");
    expect(paths).toContain("/reports/sales");
    expect(paths).toContain("/admin/expenses");
  });

  it("returns flat paths for top-level items without children", () => {
    const paths = flattenMenuPaths();
    expect(paths).toContain("/events/event-management");
  });

  it("does not include parent paths that have children", () => {
    const paths = flattenMenuPaths();
    // /view-bill has children so should not be in flat list
    expect(paths.filter((p) => p === "/view-bill")).toHaveLength(0);
  });

  it("includes all child paths", () => {
    const paths = flattenMenuPaths();
    const inventoryChildren = ALL_MENU_ITEMS.find(
      (item) => item.path === "/inventory"
    )!.children!;
    for (const child of inventoryChildren) {
      expect(paths).toContain(child.path);
    }
  });
});
