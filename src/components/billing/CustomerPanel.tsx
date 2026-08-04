"use client";

interface CustomerPanelProps {
  subtotal: number;
  discPercent: number;
  discAmount: number;
  taxAmount: number;
  showTaxInput: boolean;
  complimentBill: boolean;
  creditBill: boolean;
  remarks: string;
  paymentMode: string;
  salesPerson: string;
  onDiscPercentChange: (val: number) => void;
  onDiscAmountChange: (val: number) => void;
  onTaxAmountChange: (val: number) => void;
  onComplimentChange: (val: boolean) => void;
  onCreditChange: (val: boolean) => void;
  onRemarksChange: (val: string) => void;
  onPaymentModeChange: (val: string) => void;
  onSalesPersonChange: (val: string) => void;
}

export default function CustomerPanel({
  subtotal,
  discPercent,
  discAmount,
  taxAmount,
  showTaxInput,
  complimentBill,
  creditBill,
  remarks,
  paymentMode,
  salesPerson,
  onDiscPercentChange,
  onDiscAmountChange,
  onTaxAmountChange,
  onComplimentChange,
  onCreditChange,
  onRemarksChange,
  onPaymentModeChange,
  onSalesPersonChange,
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
              onChange={(e) => {
                const pct = parseFloat(e.target.value) || 0;
                onDiscPercentChange(pct);
                onDiscAmountChange(Math.round((subtotal * pct) / 100 * 100) / 100);
              }}
              placeholder="%"
              min={0}
              max={100}
              className="w-16 border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-purple-400"
            />
            <input
              type="number"
              value={discAmount || ""}
              onChange={(e) => {
                const amt = parseFloat(e.target.value) || 0;
                onDiscAmountChange(amt);
                onDiscPercentChange(subtotal > 0 ? Math.round((amt / subtotal) * 10000) / 100 : 0);
              }}
              placeholder="Amount"
              min={0}
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
          {showTaxInput ? (
            <input
              type="number"
              value={taxAmount || ""}
              onChange={(e) => onTaxAmountChange(parseFloat(e.target.value) || 0)}
              className="w-24 border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-purple-400"
            />
          ) : (
            <span className="text-sm font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">
              {taxAmount > 0 ? taxAmount.toFixed(2) : "0.00"}
            </span>
          )}
        </div>
      </div>

      {/* Checkboxes */}
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={complimentBill}
            onChange={(e) => {
              onComplimentChange(e.target.checked);
              if (e.target.checked) onCreditChange(false);
            }}
            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-sm text-gray-700">Compliment Bill</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={creditBill}
            onChange={(e) => {
              onCreditChange(e.target.checked);
              if (e.target.checked) onComplimentChange(false);
            }}
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

      {/* Payment Mode */}
      <select
        value={paymentMode}
        onChange={(e) => onPaymentModeChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white cursor-pointer"
      >
        <option value="CASH">Cash</option>
        <option value="CARD">Card</option>
        <option value="UPI">UPI</option>
        <option value="CREDIT">Credit</option>
        <option value="COMPLIMENT">Compliment</option>
      </select>

      {/* Sales Person */}
      <input
        type="text"
        value={salesPerson}
        onChange={(e) => onSalesPersonChange(e.target.value)}
        placeholder="Sales Person"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
      />
    </div>
  );
}
