"use client";

interface BillingActionsProps {
  onPrint: () => void;
  onHold: () => void;
  onNoPrint: () => void;
}

export default function BillingActions({
  onPrint,
  onHold,
  onNoPrint,
}: BillingActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Print Bill F10 */}
      <button
        onClick={onPrint}
        className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-orange-400 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm"
      >
        Print Bill
        <span className="bg-white/25 text-[10px] font-bold px-1.5 py-0.5 rounded">
          F10
        </span>
      </button>

      {/* Hold */}
      <button
        onClick={onHold}
        className="flex items-center gap-1.5 bg-gradient-to-r from-green-500 to-green-400 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm"
      >
        Hold
      </button>

      {/* No Print */}
      <button
        onClick={onNoPrint}
        className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-blue-400 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm"
      >
        No Print
      </button>
    </div>
  );
}
