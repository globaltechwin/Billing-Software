// @vitest-environment node
import { describe, it, expect } from "vitest";
import { calculateGST, type GSTInput } from "./gst-calculator";

function makeGstMaster(total: number, cgst: number, sgst: number, igst: number) {
  return {
    totalPercentage: { [Symbol.toPrimitive]() { return total; } },
    cgstPercentage: { [Symbol.toPrimitive]() { return cgst; } },
    sgstPercentage: { [Symbol.toPrimitive]() { return sgst; } },
    igstPercentage: { [Symbol.toPrimitive]() { return igst; } },
  };
}

describe("calculateGST", () => {
  const gst18 = makeGstMaster(18, 9, 9, 18);

  it("calculates intrastate GST (same state)", () => {
    const input: GSTInput = {
      companyStateCode: "27",
      customerStateCode: "27",
      productPrice: 1000,
      gstMaster: gst18 as unknown as GSTInput["gstMaster"],
    };
    const result = calculateGST(input);
    expect(result.gstType).toBe("INTRASTATE");
    expect(result.cgstAmount).toBe(90);
    expect(result.sgstAmount).toBe(90);
    expect(result.igstAmount).toBe(0);
    expect(result.taxAmount).toBe(180);
    expect(result.totalAmount).toBe(1180);
  });

  it("calculates interstate GST (different state)", () => {
    const input: GSTInput = {
      companyStateCode: "27",
      customerStateCode: "06",
      productPrice: 500,
      gstMaster: gst18 as unknown as GSTInput["gstMaster"],
    };
    const result = calculateGST(input);
    expect(result.gstType).toBe("INTERSTATE");
    expect(result.cgstAmount).toBe(0);
    expect(result.sgstAmount).toBe(0);
    expect(result.igstAmount).toBe(90);
    expect(result.taxAmount).toBe(90);
    expect(result.totalAmount).toBe(590);
  });

  it("rounds amounts to 2 decimal places", () => {
    const gst7 = makeGstMaster(7, 3.5, 3.5, 7);
    const input: GSTInput = {
      companyStateCode: "27",
      customerStateCode: "27",
      productPrice: 333,
      gstMaster: gst7 as unknown as GSTInput["gstMaster"],
    };
    const result = calculateGST(input);
    // cgst = 333 * 3.5 / 100 = 11.655, rounded to 11.66
    expect(result.cgstAmount).toBe(11.66);
    expect(result.sgstAmount).toBe(11.66);
    // total uses sum of intermediates: 333 + (11.655 + 11.655) = 356.31
    expect(result.totalAmount).toBe(356.31);
  });

  it("handles zero price", () => {
    const input: GSTInput = {
      companyStateCode: "27",
      customerStateCode: "27",
      productPrice: 0,
      gstMaster: gst18 as unknown as GSTInput["gstMaster"],
    };
    const result = calculateGST(input);
    expect(result.taxAmount).toBe(0);
    expect(result.totalAmount).toBe(0);
  });

  it("returns correct percentages", () => {
    const input: GSTInput = {
      companyStateCode: "27",
      customerStateCode: "27",
      productPrice: 100,
      gstMaster: gst18 as unknown as GSTInput["gstMaster"],
    };
    const result = calculateGST(input);
    expect(result.cgstPercentage).toBe(9);
    expect(result.sgstPercentage).toBe(9);
    expect(result.igstPercentage).toBe(18);
  });
});
