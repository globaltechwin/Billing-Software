"use client";

import BillingHeader from "./BillingHeader";
import BillingFilters from "./BillingFilters";
import BillCard from "./BillCard";

const BILLS = [
  {
    billNo: 4,
    time: "355 Mins",
    customer: "Raju",
    phone: "9940393333",
    noOfItems: 1,
    amount: 10.5,
    status: "running" as const,
  },
  {
    billNo: 3,
    time: "8609 Mins",
    customer: "Raju",
    phone: "9940393333",
    noOfItems: 10,
    amount: 2080.0,
    status: "settled" as const,
  },
  {
    billNo: 2,
    time: "8721 Mins",
    customer: "Rajesh",
    phone: "7010991925",
    noOfItems: 1,
    amount: 200.0,
    status: "running" as const,
  },
  {
    billNo: 1,
    time: "8722 Mins",
    noOfItems: 2,
    amount: 100.0,
    status: "running" as const,
  },
];

export default function BillingPage() {
  return (
    <div className="p-4 sm:p-5">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        {/* Header tabs */}
        <BillingHeader />

        {/* Divider */}
        <div className="border-t border-gray-200 my-4" />

        {/* Filters */}
        <BillingFilters />

        {/* Divider */}
        <div className="border-t border-gray-200 my-4" />

        {/* Bill Cards */}
        <div className="flex gap-4 flex-wrap">
          {BILLS.map((bill) => (
            <BillCard key={bill.billNo} {...bill} />
          ))}
        </div>
      </div>
    </div>
  );
}
