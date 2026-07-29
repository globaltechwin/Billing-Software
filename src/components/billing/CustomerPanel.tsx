"use client";

interface CustomerPanelProps {
  discPercent: number;
  discAmount: number;
  taxAmount: number;
  complimentBill: boolean;
  creditBill: boolean;
  remarks: string;
  onDiscPercentChange: (val: number) => void;
  onDiscAmountChange: (val: number) => void;
  onTaxAmountChange: (val: number) => void;
  onComplimentChange: (val: boolean) => void;
  onCreditChange: (val: boolean) => void;
  onRemarksChange: (val: string) => void;
}

export default function CustomerPanel({
  discPercent,
  discAmount,
  taxAmount,
  complimentBill,
  creditBill,
  remarks,
  onDiscPercentChange,
  onDiscAmountChange,
  onTaxAmountChange,
  onComplimentChange,
  onCreditChange,
  onRemarksChange,
}: CustomerPanelProps) {
  return (
    <div className="space-y-4">
      {/* Discount */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm font-semibold text-gray-700">
            Disc. By Sale :
          </span>
          <div className="flex items-center gap-1 ml-auto">
            <input
              type="number"
              value={discPercent || ""}
              onChange={(e) => onDiscPercentChange(parseFloat(e.target.value) || 0)}
              placeholder="%"
              className="w-16 border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-purple-400"
            />
            <input
              type="number"
              value={discAmount || ""}
              onChange={(e) => onDiscAmountChange(parseFloat(e.target.value) || 0)}
              placeholder="Amount"
              className="w-20 border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-purple-400"
            />
          </div>
        </div>
      </div>

      {/* Tax Amount */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">
            Tax Amount
          </span>
          <input
            type="number"
            value={taxAmount || ""}
            onChange={(e) => onTaxAmountChange(parseFloat(e.target.value) || 0)}
            className="w-24 border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-purple-400"
          />
        </div>
      </div>

      {/* Checkboxes */}
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={complimentBill}
            onChange={(e) => onComplimentChange(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-sm text-gray-700">Compliment Bill</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={creditBill}
            onChange={(e) => onCreditChange(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-sm text-gray-700">Credit Bill</span>
        </label>
      </div>

      {/* Remarks */}
      <div>
        <textarea
          value={remarks}
          onChange={(e) => onRemarksChange(e.target.value)}
          placeholder="Remarks"
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none"
        />
      </div>

      {/* Dropdown */}
      <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white cursor-pointer">
        <option value="">Select</option>
        <option value="walk-in">Walk-in Customer</option>
        <option value="regular">Regular Customer</option>
        <option value="wholesale">Wholesale</option>
      </select>
    </div>
  );
}
