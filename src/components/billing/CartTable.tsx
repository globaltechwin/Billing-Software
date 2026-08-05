"use client";

import { Star, Trash2 } from "lucide-react";

export interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  qty: number;
  stock: number;
  remarks: string;
}

export interface CartItemGST extends CartItem {
  gstApplicable: boolean;
  gst: {
    gstPercentage: number;
    cgstPercentage: number;
    sgstPercentage: number;
    igstPercentage: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    taxAmount: number;
  };
}

interface CartTableProps {
  items: CartItem[];
  onUpdateQty: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
  perItemGst?: boolean;
  onUpdateGstRate?: (id: number, rate: number) => void;
  onItemRemarksChange?: (id: number, remarks: string) => void;
  billType?: "INVOICE" | "QUOTATION" | "A4_BILL";
  gstMode?: string;
  billGstRate?: number;
}

export default function CartTable({
  items,
  onUpdateQty,
  onRemove,
  perItemGst = false,
  onUpdateGstRate,
  onItemRemarksChange,
  billType = "INVOICE",
  gstMode = "WITH_GST",
  billGstRate = 0,
}: CartTableProps) {
  const isA4 = billType === "A4_BILL";
  const isIGST = perItemGst
    ? items.some((item) => { const g = (item as CartItemGST).gst; return g && g.igstPercentage > 0 && g.cgstPercentage === 0; })
    : gstMode === "WITH_IGST";
  const showGST = gstMode !== "WITHOUT_GST";

  if (isA4) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200" style={{ minWidth: "1000px" }}>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 w-10 border-r border-gray-300" rowSpan={2}>Sr. No.</th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 border-r border-gray-300" rowSpan={2}>Name of product</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 w-16 border-r border-gray-300" rowSpan={2}>Quantity</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 w-20 border-r border-gray-300" rowSpan={2}>Unit</th>
                <th className="px-2 py-2 text-right text-xs font-semibold text-gray-600 w-20 border-r border-gray-300" rowSpan={2}>Rate</th>
                <th className="px-2 py-2 text-right text-xs font-semibold text-gray-600 w-24 border-r border-gray-300" rowSpan={2}>Taxable Value</th>
                {showGST && !isIGST && (
                  <>
                    <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 border-r border-gray-300" colSpan={2}>CGST</th>
                    <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 border-r border-gray-300" colSpan={2}>SGST</th>
                  </>
                )}
                {showGST && isIGST && (
                  <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 border-r border-gray-300" colSpan={2}>IGST</th>
                )}
                <th className="px-2 py-2 text-right text-xs font-semibold text-gray-600 w-24 border-r border-gray-300" rowSpan={2}>Total</th>
                <th className="w-8" rowSpan={2}></th>
              </tr>
              {showGST && !isIGST && (
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-2 py-1 text-center text-[10px] font-semibold text-gray-500 border-r border-gray-300">Rate</th>
                  <th className="px-2 py-1 text-right text-[10px] font-semibold text-gray-500 border-r border-gray-300">Amount</th>
                  <th className="px-2 py-1 text-center text-[10px] font-semibold text-gray-500 border-r border-gray-300">Rate</th>
                  <th className="px-2 py-1 text-right text-[10px] font-semibold text-gray-500 border-r border-gray-300">Amount</th>
                </tr>
              )}
              {showGST && isIGST && (
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-2 py-1 text-center text-[10px] font-semibold text-gray-500 border-r border-gray-300">Rate</th>
                  <th className="px-2 py-1 text-right text-[10px] font-semibold text-gray-500 border-r border-gray-300">Amount</th>
                </tr>
              )}
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={showGST ? (isIGST ? 9 : 11) : 7} className="py-16 text-center">
                    <p className="text-purple-400 text-sm italic">There are no items in the cart [Sales]</p>
                  </td>
                </tr>
              )}
              {items.map((item, idx) => {
                const gstItem = item as CartItemGST;
                const taxableVal = item.price * item.qty;
                const effectiveGstPct = perItemGst ? (gstItem.gst?.gstPercentage || 0) : billGstRate;
                const cgstPct = perItemGst ? (gstItem.gst?.cgstPercentage || 0) : (isIGST ? 0 : billGstRate / 2);
                const sgstPct = perItemGst ? (gstItem.gst?.sgstPercentage || 0) : (isIGST ? 0 : billGstRate / 2);
                const igstPct = perItemGst ? (gstItem.gst?.igstPercentage || 0) : (isIGST ? billGstRate : 0);
                const cgstAmt = showGST && !isIGST ? taxableVal * (cgstPct / 100) : 0;
                const sgstAmt = showGST && !isIGST ? taxableVal * (sgstPct / 100) : 0;
                const igstAmt = showGST && isIGST ? taxableVal * (igstPct / 100) : 0;
                const lineTotal = taxableVal + cgstAmt + sgstAmt + igstAmt;
                return (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="px-2 py-1 text-center text-sm text-gray-600 border-r border-gray-300">{idx + 1}</td>
                    <td className="px-2 py-1 border-r border-gray-300">
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-400 flex-shrink-0" />
                        <span className="font-medium truncate text-sm">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-1 border-r border-gray-300">
                      <div className="flex items-center justify-center border border-gray-300 rounded-lg overflow-hidden">
                        <button
                          onClick={() => onUpdateQty(item.id, Math.max(0.5, item.qty - 1))}
                          className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-xs"
                        >-</button>
                        <input
                          type="number"
                          value={item.qty}
                          min={0.5}
                          step={0.5}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val >= 0.5) onUpdateQty(item.id, val);
                          }}
                          className="w-10 h-6 text-center text-xs font-medium border-x border-gray-300 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => { if (item.qty < item.stock) onUpdateQty(item.id, item.qty + 1); }}
                          disabled={item.qty >= item.stock}
                          className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-xs disabled:opacity-40"
                        >+</button>
                      </div>
                    </td>
                    <td className="px-2 py-1 text-center text-xs text-gray-500 border-r border-gray-300">NOS</td>
                    <td className="px-2 py-1 text-right text-sm border-r border-gray-300">{item.price.toFixed(2)}</td>
                    <td className="px-2 py-1 text-right text-sm font-medium border-r border-gray-300">{taxableVal.toFixed(2)}</td>
                    {showGST && !isIGST && (
                      <>
                        <td className="px-2 py-1 text-center text-xs text-gray-500 border-r border-gray-300">{cgstPct.toFixed(2)}%</td>
                        <td className="px-2 py-1 text-right text-sm border-r border-gray-300">{cgstAmt.toFixed(2)}</td>
                        <td className="px-2 py-1 text-center text-xs text-gray-500 border-r border-gray-300">{sgstPct.toFixed(2)}%</td>
                        <td className="px-2 py-1 text-right text-sm border-r border-gray-300">{sgstAmt.toFixed(2)}</td>
                      </>
                    )}
                    {showGST && isIGST && (
                      <>
                        <td className="px-2 py-1 text-center text-xs text-gray-500 border-r border-gray-300">{igstPct.toFixed(2)}%</td>
                        <td className="px-2 py-1 text-right text-sm border-r border-gray-300">{igstAmt.toFixed(2)}</td>
                      </>
                    )}
                    <td className="px-2 py-1 text-right text-sm font-bold border-r border-gray-300">{lineTotal.toFixed(2)}</td>
                    <td className="px-1 py-1 text-center">
                      <button onClick={() => onRemove(item.id)} className="p-1 hover:bg-red-50 rounded transition-colors">
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Original POS-style layout
  const cols = perItemGst
    ? "grid grid-cols-[36px_1.5fr_70px_70px_60px_80px_1fr_110px_40px]"
    : "grid grid-cols-[36px_1.5fr_80px_80px_60px_1fr_120px_40px]";
  const colsHeader = perItemGst
    ? "grid grid-cols-[36px_1.5fr_70px_70px_60px_80px_1fr_110px_40px]"
    : "grid grid-cols-[36px_1.5fr_80px_80px_60px_1fr_120px_40px]";

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <div className={perItemGst ? "min-w-[780px]" : "min-w-[680px]"}>
      {/* Table Header */}
      <div className={`${colsHeader} bg-[#1a8a7d] text-white text-xs font-semibold`}>
        <div className="flex items-center justify-center py-2.5">
          <Star size={14} />
        </div>
        <div className="py-2.5 px-2">Product Name</div>
        <div className="py-2.5 px-2 text-right">Price</div>
        <div className="py-2.5 px-2 text-center">Qty.</div>
        <div className="py-2.5 px-2 text-center">Stock</div>
        {perItemGst && <div className="py-2.5 px-2 text-center">GST %</div>}
        <div className="py-2.5 px-2">Remarks</div>
        <div className="py-2.5 px-2 text-right">Total</div>
        <div className="py-2.5" />
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-purple-400 text-sm italic">
            There are no items in the cart [Sales]
          </p>
        </div>
      )}

      {/* Rows */}
      {items.map((item) => {
        const lineTotal = item.price * item.qty;
        return (
          <div
            key={item.id}
            className={`${cols} border-t border-gray-100 text-sm text-gray-700 items-center`}
          >
            <div className="flex items-center justify-center py-2">
              <Star size={14} className="text-yellow-400" />
            </div>
            <div className="py-2 px-2 font-medium truncate">{item.name}</div>
            <div className="py-2 px-2 text-right">{item.price.toFixed(2)}</div>
            <div className="py-2 px-1 flex items-center justify-center">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => onUpdateQty(item.id, Math.max(0.5, item.qty - 1))}
                  className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:bg-gray-200 text-sm font-medium"
                >
                  -
                </button>
                <input
                  type="number"
                  value={item.qty}
                  min={0.5}
                  step={0.5}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 0.5) {
                      onUpdateQty(item.id, val);
                    }
                  }}
                  className="w-10 h-7 text-center text-xs font-medium border-x border-gray-300 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => {
                    if (item.qty < item.stock) {
                      onUpdateQty(item.id, item.qty + 1);
                    }
                  }}
                  disabled={item.qty >= item.stock}
                  className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:bg-gray-200 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>
            <div className="py-2 px-2 text-center text-xs text-gray-500">
              {item.stock}
            </div>
            {perItemGst && (
              <div className="py-2 px-1 flex items-center justify-center">
                <input
                  type="number"
                  value={(item as CartItemGST).gst?.gstPercentage || ""}
                  onChange={(e) => onUpdateGstRate?.(item.id, parseFloat(e.target.value) || 0)}
                  className="w-14 px-1 py-0.5 border border-gray-300 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-purple-500"
                  min={0}
                  max={100}
                  step={0.5}
                />
              </div>
            )}
            <div className="py-2 px-2">
              <input
                type="text"
                value={item.remarks}
                onChange={(e) => onItemRemarksChange?.(item.id, e.target.value)}
                className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div className="py-2 px-2 text-right font-medium">
              {lineTotal.toFixed(2)}
            </div>
            <div className="py-2 flex justify-center">
              <button
                onClick={() => onRemove(item.id)}
                className="p-1 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 size={14} className="text-red-400" />
              </button>
            </div>
          </div>
        );
      })}
        </div>
      </div>
    </div>
  );
}
