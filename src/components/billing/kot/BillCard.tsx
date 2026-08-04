"use client";

import { Pencil } from "lucide-react";

interface BillCardProps {
  billNo: string;
  time: string;
  customer?: string;
  phone?: string;
  noOfItems: number;
  amount: number;
}

export default function BillCard({
  billNo,
  time,
  customer,
  phone,
  noOfItems,
  amount,
}: BillCardProps) {
  return (
    <div className="bg-gradient-to-br from-orange-500 to-orange-400 rounded-xl p-4 text-white shadow-md min-w-[200px] max-w-[240px] flex flex-col gap-1 relative hover:scale-105 transition-transform">
      {/* Edit button */}
      <button className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded transition-colors">
        <Pencil size={14} />
      </button>

      {/* Bill Number */}
      <h3 className="text-sm font-bold mb-1">{billNo}</h3>

      {/* Time */}
      <div className="flex justify-between text-xs">
        <span className="opacity-80">Time</span>
        <span className="font-medium">{time}</span>
      </div>

      {/* Customer */}
      {customer && (
        <div className="flex justify-between text-xs">
          <span className="opacity-80">Customer</span>
          <span className="font-medium">{customer}</span>
        </div>
      )}

      {/* Phone */}
      {phone && (
        <div className="flex justify-between text-xs">
          <span className="opacity-80">Phone</span>
          <span className="font-medium">{phone}</span>
        </div>
      )}

      {/* No of Items */}
      <div className="flex justify-between text-xs">
        <span className="opacity-80">No of Items</span>
        <span className="font-medium">{noOfItems}</span>
      </div>

      {/* Amount */}
      <div className="mt-2 text-right">
        <span className="text-lg font-bold">Rs.{amount.toFixed(2)}</span>
      </div>
    </div>
  );
}
