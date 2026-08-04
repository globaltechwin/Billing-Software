// @vitest-environment node
import { describe, it, expect } from "vitest";
import { buildUpiUri, isValidUpiId } from "./upi-qr";

describe("buildUpiUri", () => {
  it("builds correct UPI URI with all params", () => {
    const uri = buildUpiUri({
      upiId: "merchant@upi",
      merchantName: "Test Shop",
      amount: 250.5,
      invoiceNumber: "INV6-0001",
    });
    expect(uri).toBe(
      "upi://pay?pa=merchant%40upi&pn=Test+Shop&am=250.50&cu=INR&tn=Invoice+INV6-0001&tr=INV6-0001"
    );
  });

  it("formats amount to 2 decimal places", () => {
    const uri = buildUpiUri({
      upiId: "test@bank",
      merchantName: "Shop",
      amount: 100,
      invoiceNumber: "INV1",
    });
    expect(uri).toContain("am=100.00");
  });

  it("uses INR currency", () => {
    const uri = buildUpiUri({
      upiId: "a@b",
      merchantName: "X",
      amount: 1,
      invoiceNumber: "1",
    });
    expect(uri).toContain("cu=INR");
  });
});

describe("isValidUpiId", () => {
  it("accepts valid UPI IDs", () => {
    expect(isValidUpiId("merchant@upi")).toBe(true);
    expect(isValidUpiId("user.name@bank")).toBe(true);
    expect(isValidUpiId("test-123@oksbi")).toBe(true);
  });

  it("rejects invalid UPI IDs", () => {
    expect(isValidUpiId("")).toBe(false);
    expect(isValidUpiId("no-at-sign")).toBe(false);
    expect(isValidUpiId("@upi")).toBe(false);
    expect(isValidUpiId("user@")).toBe(false);
    expect(isValidUpiId("user name@upi")).toBe(false);
  });
});
