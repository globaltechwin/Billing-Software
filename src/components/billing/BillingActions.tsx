"use client";

import { Loader2, Save, Printer, PauseCircle, Ban } from "lucide-react";

interface BillingActionsProps {
  onPrint: () => void;
  onHold: () => void;
  onNoPrint: () => void;
  onSaveBill: () => void;
  onSaveQuotation?: () => void;
  onPrintQuotation?: () => void;
  billType: "INVOICE" | "QUOTATION";
  saving: boolean;
  canSave: boolean;
}

export default function BillingActions({
  onPrint,
  onHold,
  onNoPrint,
  onSaveBill,
  onSaveQuotation,
  onPrintQuotation,
  billType,
  saving,
  canSave,
}: BillingActionsProps) {
  return (
    <div className="flex items-stretch gap-2.5">
      {/* Save */}
      <button
        onClick={billType === "QUOTATION" ? onSaveQuotation : onSaveBill}
        disabled={!canSave || saving}
        className="flex-1 flex flex-col items-center gap-1 bg-gradient-to-b from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 active:scale-[0.97] text-white text-xs font-semibold py-3 rounded-xl shadow-md shadow-violet-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {saving ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Save size={20} strokeWidth={1.8} />
        )}
        <span>{saving ? "Saving..." : "Save Bill"}</span>
      </button>

      {/* Print F10 */}
      <button
        onClick={billType === "QUOTATION" ? onPrintQuotation : onPrint}
        className="flex-1 flex flex-col items-center gap-1 bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.97] text-white text-xs font-semibold py-3 rounded-xl shadow-md shadow-amber-500/25 transition-all"
      >
        <Printer size={20} strokeWidth={1.8} />
        <span className="flex items-center gap-1">
          Print
          <kbd className="bg-white/20 text-[9px] font-bold px-1 py-px rounded">F10</kbd>
        </span>
      </button>

      {/* Hold */}
      <button
        onClick={onHold}
        className="flex-1 flex flex-col items-center gap-1 bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 active:scale-[0.97] text-white text-xs font-semibold py-3 rounded-xl shadow-md shadow-emerald-500/25 transition-all"
      >
        <PauseCircle size={20} strokeWidth={1.8} />
        <span>Hold</span>
      </button>

      {/* No Print */}
      <button
        onClick={onNoPrint}
        className="flex-1 flex flex-col items-center gap-1 bg-gradient-to-b from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 active:scale-[0.97] text-white text-xs font-semibold py-3 rounded-xl shadow-md shadow-sky-500/25 transition-all"
      >
        <Ban size={20} strokeWidth={1.8} />
        <span>No Print</span>
      </button>
    </div>
  );
}
