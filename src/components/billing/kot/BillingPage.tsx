"use client";

import { useEffect, useState } from "react";
import BillingHeader from "./BillingHeader";
import BillCard from "./BillCard";

interface RecentBill {
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  itemCount: number;
  grandTotal: number;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} Mins`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} Hrs`;
  const days = Math.floor(hrs / 24);
  return `${days} Days`;
}

export default function BillingPage() {
  const [recentBills, setRecentBills] = useState<RecentBill[]>([]);

  useEffect(() => {
    fetch("/api/invoices?limit=5&sortField=createdAt&sortDirection=desc")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.invoices) setRecentBills(data.invoices);
      })
      .catch(() => { /* empty */ });
  }, []);

  return (
    <div className="p-4 sm:p-5">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        {/* Header tabs */}
        <BillingHeader />

        {/* Divider */}
        <div className="border-t border-gray-200 my-4" />

        {/* Recent Bills */}
        {recentBills.length > 0 && (
          <>
            <h3 className="text-sm font-semibold text-gray-500 mb-3">Recent Bills</h3>
            <div className="flex gap-4 flex-wrap">
              {recentBills.map((bill) => (
                <BillCard
                  key={bill.invoiceNumber}
                  billNo={bill.invoiceNumber}
                  time={timeAgo(bill.createdAt)}
                  customer={bill.customerName !== "Walk-in" ? bill.customerName : undefined}
                  phone={bill.customerPhone || undefined}
                  noOfItems={bill.itemCount}
                  amount={bill.grandTotal}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
