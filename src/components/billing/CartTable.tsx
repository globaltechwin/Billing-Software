"use client";

import { Star, Trash2 } from "lucide-react";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  remarks: string;
  discPercent: number;
}

interface CartTableProps {
  items: CartItem[];
  onUpdateQty: (id: number, qty: number) => void;
  onUpdateDisc: (id: number, disc: number) => void;
  onRemove: (id: number) => void;
}

export default function CartTable({
  items,
  onUpdateQty,
  onUpdateDisc,
  onRemove,
}: CartTableProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-[36px_1.5fr_80px_80px_1fr_70px_120px_40px] bg-[#1a8a7d] text-white text-xs font-semibold">
        <div className="flex items-center justify-center py-2.5">
          <Star size={14} />
        </div>
        <div className="py-2.5 px-2">Product Name</div>
        <div className="py-2.5 px-2 text-right">Price</div>
        <div className="py-2.5 px-2 text-center">Stock / Qty.</div>
        <div className="py-2.5 px-2">Remarks</div>
        <div className="py-2.5 px-2 text-center">Disc%</div>
        <div className="py-2.5 px-2 text-right">Total Inc. of Tax</div>
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
        const total = item.price * item.qty * (1 - item.discPercent / 100);
        return (
          <div
            key={item.id}
            className="grid grid-cols-[36px_1.5fr_80px_80px_1fr_70px_120px_40px] border-t border-gray-100 text-sm text-gray-700 items-center"
          >
            <div className="flex items-center justify-center py-2">
              <Star size={14} className="text-yellow-400" />
            </div>
            <div className="py-2 px-2 font-medium">{item.name}</div>
            <div className="py-2 px-2 text-right">{item.price.toFixed(2)}</div>
            <div className="py-2 px-2 flex items-center justify-center gap-1">
              <button
                onClick={() => onUpdateQty(item.id, Math.max(1, item.qty - 1))}
                className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-xs flex items-center justify-center"
              >
                -
              </button>
              <span className="w-6 text-center text-xs">{item.qty}</span>
              <button
                onClick={() => onUpdateQty(item.id, item.qty + 1)}
                className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-xs flex items-center justify-center"
              >
                +
              </button>
            </div>
            <div className="py-2 px-2">
              <input
                type="text"
                value={item.remarks}
                readOnly
                className="w-full text-xs border border-gray-200 rounded px-2 py-1 bg-gray-50"
              />
            </div>
            <div className="py-2 px-2">
              <input
                type="number"
                value={item.discPercent}
                onChange={(e) =>
                  onUpdateDisc(item.id, parseFloat(e.target.value) || 0)
                }
                className="w-full text-xs border border-gray-200 rounded px-2 py-1 text-center focus:outline-none focus:border-purple-400"
              />
            </div>
            <div className="py-2 px-2 text-right font-medium">
              {total.toFixed(2)}
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
  );
}
