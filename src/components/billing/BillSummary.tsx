"use client";

import { useEffect, useState } from "react";

interface BillSummaryProps {
  total: number;
  amountGiven: number;
  onAmountGivenChange: (val: number) => void;
}

export default function BillSummary({
  total,
  amountGiven,
  onAmountGivenChange,
}: BillSummaryProps) {
  const amountDue = total - amountGiven;
  const [prevBill, setPrevBill] = useState<{ invoiceNumber: string; grandTotal: number } | null>(null);

  useEffect(() => {
    fetch("/api/invoices")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.invoices && data.invoices.length > 0) {
          setPrevBill(data.invoices[0]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-3">
      {/* Amt given + Amount Due */}
      <div className="flex items-center gap-3">
        <input
          type="number"
          value={amountGiven || ""}
          onChange={(e) => onAmountGivenChange(parseFloat(e.target.value) || 0)}
          placeholder="Amt given"
          className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
        />
        <div className="flex-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">
            Amount Due
          </span>
          <span className="text-sm font-bold text-gray-800">
            {amountDue.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Total + Prev Bill */}
      <div className="flex gap-3">
        {/* Total */}
        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3 text-center">
          <p className="text-sm font-semibold text-gray-700 mb-1">Total</p>
          <p className="text-3xl font-bold text-green-600">
            {total.toFixed(2)}
          </p>
        </div>

        {/* Prev Bill */}
        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3 text-center">
          <p className="text-sm font-semibold text-gray-700 mb-1">
            Prev. Bill: {prevBill?.invoiceNumber || "N/A"}
          </p>
          <p className="text-2xl font-bold text-billora-primary">
            {prevBill?.grandTotal ? Number(prevBill.grandTotal).toFixed(2) : "0.00"}
          </p>
        </div>
      </div>
    </div>
  );
}
