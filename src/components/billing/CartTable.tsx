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
}

export default function CartTable({
  items,
  onUpdateQty,
  onRemove,
  perItemGst = false,
  onUpdateGstRate,
}: CartTableProps) {
  const cols = perItemGst
    ? "grid grid-cols-[36px_1.5fr_70px_70px_80px_1fr_110px_40px]"
    : "grid grid-cols-[36px_1.5fr_80px_80px_1fr_120px_40px]";
  const colsHeader = perItemGst
    ? "grid grid-cols-[36px_1.5fr_70px_70px_80px_1fr_110px_40px]"
    : "grid grid-cols-[36px_1.5fr_80px_80px_1fr_120px_40px]";

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <div className={perItemGst ? "min-w-[720px]" : "min-w-[620px]"}>
      {/* Table Header */}
      <div className={`${colsHeader} bg-[#1a8a7d] text-white text-xs font-semibold`}>
        <div className="flex items-center justify-center py-2.5">
          <Star size={14} />
        </div>
        <div className="py-2.5 px-2">Product Name</div>
        <div className="py-2.5 px-2 text-right">Price</div>
        <div className="py-2.5 px-2 text-center">Qty.</div>
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
            <div className="py-2 px-2 flex items-center justify-center gap-1">
              <button
                onClick={() => onUpdateQty(item.id, Math.max(0.5, item.qty - 1))}
                className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-xs flex items-center justify-center"
              >
                -
              </button>
              <span className="w-6 text-center text-xs">{item.qty}</span>
              <button
                onClick={() => {
                  if (item.qty < item.stock) {
                    onUpdateQty(item.id, item.qty + 1);
                  }
                }}
                disabled={item.qty >= item.stock}
                className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-xs flex items-center justify-center disabled:opacity-40"
              >
                +
              </button>
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
                readOnly
                className="w-full text-xs border border-gray-200 rounded px-2 py-1 bg-gray-50"
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
