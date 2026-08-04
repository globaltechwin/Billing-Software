// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  pad,
  formatDate,
  formatDateTime,
  formatDateTimeSeconds,
  payModeLabel,
  orderTypeLabel,
  buildDateRange,
  getSession,
} from "./report-utils";

describe("pad", () => {
  it("pads single digit with leading zero", () => {
    expect(pad(0)).toBe("00");
    expect(pad(5)).toBe("05");
    expect(pad(9)).toBe("09");
  });

  it("does not pad double digits", () => {
    expect(pad(10)).toBe("10");
    expect(pad(31)).toBe("31");
  });
});

describe("formatDate", () => {
  it("formats date as dd/mm/yyyy", () => {
    const d = new Date(2026, 0, 15); // 15 Jan 2026
    expect(formatDate(d)).toBe("15/01/2026");
  });

  it("pads day and month", () => {
    const d = new Date(2026, 2, 5); // 5 Mar 2026
    expect(formatDate(d)).toBe("05/03/2026");
  });
});

describe("formatDateTime", () => {
  it("formats as dd/mm/yyyy HH:mm", () => {
    const d = new Date(2026, 5, 20, 14, 30);
    expect(formatDateTime(d)).toBe("20/06/2026 14:30");
  });

  it("pads hours and minutes", () => {
    const d = new Date(2026, 0, 1, 8, 5);
    expect(formatDateTime(d)).toBe("01/01/2026 08:05");
  });
});

describe("formatDateTimeSeconds", () => {
  it("includes seconds", () => {
    const d = new Date(2026, 0, 1, 8, 5, 9);
    expect(formatDateTimeSeconds(d)).toBe("01/01/2026 08:05:09");
  });
});

describe("payModeLabel", () => {
  it("returns label for known modes", () => {
    expect(payModeLabel("CASH")).toBe("Cash");
    expect(payModeLabel("UPI")).toBe("UPI");
    expect(payModeLabel("CARD")).toBe("Card");
    expect(payModeLabel("COMPLIMENT")).toBe("Compliment");
  });

  it("returns raw value for unknown modes", () => {
    expect(payModeLabel("BITCOIN")).toBe("BITCOIN");
  });

  it("defaults to Cash for null/undefined", () => {
    expect(payModeLabel(null)).toBe("Cash");
    expect(payModeLabel(undefined)).toBe("Cash");
  });
});

describe("orderTypeLabel", () => {
  it("returns label for known types", () => {
    expect(orderTypeLabel("DINE_IN")).toBe("Dine In");
    expect(orderTypeLabel("TAKE_AWAY")).toBe("Take Away");
    expect(orderTypeLabel("DELIVERY")).toBe("Delivery");
  });

  it("returns raw value for unknown types", () => {
    expect(orderTypeLabel("BUFFET")).toBe("BUFFET");
  });

  it("returns empty string for null/undefined", () => {
    expect(orderTypeLabel(null)).toBe("");
    expect(orderTypeLabel(undefined)).toBe("");
  });
});

describe("buildDateRange", () => {
  it("returns gte and lte when both dates provided", () => {
    const range = buildDateRange("2026-01-01", "08:00", "2026-01-31", "17:00");
    expect(range.gte).toBeDefined();
    expect(range.lte).toBeDefined();
    expect(range.gte!.getTime()).toBeLessThan(range.lte!.getTime());
  });

  it("defaults fromTime to 00:00 and toTime to 23:59", () => {
    const range = buildDateRange("2026-06-15", "", "2026-06-15", "");
    expect(range.gte).toBeDefined();
    expect(range.lte).toBeDefined();
  });

  it("returns empty object for null dates", () => {
    const range = buildDateRange(null, "", null, "");
    expect(range.gte).toBeUndefined();
    expect(range.lte).toBeUndefined();
  });
});

describe("getSession", () => {
  it("returns Morning for hours < 12", () => {
    expect(getSession(new Date(2026, 0, 1, 0))).toBe("Morning");
    expect(getSession(new Date(2026, 0, 1, 11, 59))).toBe("Morning");
  });

  it("returns Afternoon for hours 12-15", () => {
    expect(getSession(new Date(2026, 0, 1, 12))).toBe("Afternoon");
    expect(getSession(new Date(2026, 0, 1, 15, 59))).toBe("Afternoon");
  });

  it("returns Evening for hours >= 16", () => {
    expect(getSession(new Date(2026, 0, 1, 16))).toBe("Evening");
    expect(getSession(new Date(2026, 0, 1, 23))).toBe("Evening");
  });
});
