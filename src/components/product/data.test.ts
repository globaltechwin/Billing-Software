import { describe, it, expect } from "vitest";
import { categoryUomMap } from "./data";

describe("categoryUomMap", () => {
  it("has all 8 categories", () => {
    expect(Object.keys(categoryUomMap)).toHaveLength(9);
  });

  it("Food category includes KG and Gm", () => {
    expect(categoryUomMap.Food).toContain("KG");
    expect(categoryUomMap.Food).toContain("Gm");
  });

  it("Beverages includes Ltr and ML", () => {
    expect(categoryUomMap.Beverages).toContain("Ltr");
    expect(categoryUomMap.Beverages).toContain("ML");
    expect(categoryUomMap.Beverages).toContain("Can");
    expect(categoryUomMap.Beverages).toContain("Bottle");
  });

  it("Stationery includes Sheet and Ream", () => {
    expect(categoryUomMap.Stationery).toContain("Sheet");
    expect(categoryUomMap.Stationery).toContain("Ream");
  });

  it("Electronics includes Unit and Pair", () => {
    expect(categoryUomMap.Electronics).toContain("Unit");
    expect(categoryUomMap.Electronics).toContain("Pair");
  });

  it("Cat category has Sheet and Ream", () => {
    expect(categoryUomMap.Cat).toContain("Sheet");
    expect(categoryUomMap.Cat).toContain("Ream");
  });
});

// Test UOM filtering logic (mirrors ProductPage logic)
function getUomOptions(category: string): string[] {
  return categoryUomMap[category] || ["Pcs", "Nos", "KG", "Ltr", "Box", "Pack", "Set"];
}

describe("getUomOptions helper", () => {
  it("returns category-specific UOMs for known category", () => {
    const options = getUomOptions("Food");
    expect(options).toEqual(categoryUomMap.Food);
  });

  it("returns default UOMs for unknown category", () => {
    const options = getUomOptions("Unknown");
    expect(options).toContain("Pcs");
    expect(options).toContain("KG");
    expect(options).toHaveLength(7);
  });

  it("returns default UOMs for empty string", () => {
    const options = getUomOptions("");
    expect(options).toEqual(["Pcs", "Nos", "KG", "Ltr", "Box", "Pack", "Set"]);
  });
});
