"use client";

import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

interface BillCardProps {
  billNo: number;
  time: string;
  customer?: string;
  phone?: string;
  noOfItems: number;
  amount: number;
  status: "running" | "settled";
}

export default function BillCard({
  billNo,
  time,
  customer,
  phone,
  noOfItems,
  amount,
  status,
}: BillCardProps) {
  const router = useRouter();
  const bgColor =
    status === "settled"
      ? "bg-gradient-to-br from-green-500 to-green-600"
      : "bg-gradient-to-br from-orange-500 to-orange-400";

  return (
    <div
      onClick={() => router.push("/billing/billing")}
      className={`${bgColor} rounded-xl p-4 text-white shadow-md min-w-[200px] max-w-[240px] flex flex-col gap-1 relative cursor-pointer hover:scale-105 transition-transform`}
    >
      {/* Edit button */}
      <button className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded transition-colors">
        <Pencil size={14} />
      </button>

      {/* Bill Number */}
      <h3 className="text-sm font-bold mb-1">Bill No. {billNo}</h3>

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
        <div className="flex items-center justify-end gap-1 text-xs">
          <span className="opacity-70">📞</span>
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
