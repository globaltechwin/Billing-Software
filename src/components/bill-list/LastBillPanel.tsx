"use client";

import { Printer } from "lucide-react";

interface LastBillPanelProps {
  billNo: string;
  amount: number;
  onReprint: () => void;
}

export default function LastBillPanel({
  billNo,
  amount,
  onReprint,
}: LastBillPanelProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-full">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider text-center mb-6">
        Last Bill
      </h3>

      <div className="flex items-center justify-center gap-6 mb-8">
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase">Bill No</p>
          <p className="text-2xl font-bold text-gray-800">{billNo}</p>
        </div>
        <div className="w-px h-10 bg-gray-200" />
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase">Amount</p>
          <p className="text-2xl font-bold text-green-600">₹{amount}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onReprint}
          className="flex-1 bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white text-sm font-semibold py-3 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <Printer size={16} />
          Reprint
        </button>
      </div>
    </div>
  );
}
