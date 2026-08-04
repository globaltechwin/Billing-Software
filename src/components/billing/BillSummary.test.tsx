import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BillSummary from "./BillSummary";

// Mock fetch for previous bill
beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, invoices: [] }),
    })
  );
});

describe("BillSummary", () => {
  it("renders total and amount due labels", () => {
    render(<BillSummary total={500} amountGiven={0} onAmountGivenChange={vi.fn()} />);
    expect(screen.getByText("Total")).toBeTruthy();
    expect(screen.getByText("Amount Due")).toBeTruthy();
  });

  it("displays formatted total in green", () => {
    render(<BillSummary total={1234.56} amountGiven={0} onAmountGivenChange={vi.fn()} />);
    const totalEls = screen.getAllByText("1234.56");
    const greenEl = totalEls.find((el) => el.className.includes("text-green-600"));
    expect(greenEl).toBeTruthy();
  });

  it("calculates amount due correctly", () => {
    render(<BillSummary total={500} amountGiven={300} onAmountGivenChange={vi.fn()} />);
    // Amount Due label + value are adjacent
    const amountDueLabel = screen.getByText("Amount Due");
    const amountDueValue = amountDueLabel.nextElementSibling;
    expect(amountDueValue?.textContent).toBe("200.00");
  });

  it("shows zero amount due when fully paid", () => {
    render(<BillSummary total={500} amountGiven={500} onAmountGivenChange={vi.fn()} />);
    const amountDueLabel = screen.getByText("Amount Due");
    const amountDueValue = amountDueLabel.nextElementSibling;
    expect(amountDueValue?.textContent).toBe("0.00");
  });

  it("shows negative amount due (overpayment)", () => {
    render(<BillSummary total={500} amountGiven={600} onAmountGivenChange={vi.fn()} />);
    const amountDueLabel = screen.getByText("Amount Due");
    const amountDueValue = amountDueLabel.nextElementSibling;
    expect(amountDueValue?.textContent).toBe("-100.00");
  });

  it("calls onAmountGivenChange when input changes", () => {
    const onChange = vi.fn();
    render(<BillSummary total={500} amountGiven={0} onAmountGivenChange={onChange} />);
    const input = screen.getByPlaceholderText("Amt given");
    fireEvent.change(input, { target: { value: "250" } });
    expect(onChange).toHaveBeenCalledWith(250);
  });
});
