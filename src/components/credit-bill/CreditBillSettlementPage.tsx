"use client";

import { useState, useCallback } from "react";
import { ChevronUp, ChevronDown, X, Settings } from "lucide-react";

export default function CreditBillSettlementPage() {
  // Search By Customer
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  // Search By Bill
  const [billDateFrom, setBillDateFrom] = useState("");
  const [billDateTo, setBillDateTo] = useState("");
  const [billNo, setBillNo] = useState("");
  const [itemWise, setItemWise] = useState(false);
  const [unsettledBill, setUnsettledBill] = useState(false);
  const [orderType, setOrderType] = useState("all");

  const handleViewBills = useCallback(() => {
    alert("Viewing credit bills...");
  }, []);

  const handleClear = useCallback(() => {
    setMobile("");
    setName("");
    setSelectAll(false);
    setBillDateFrom("");
    setBillDateTo("");
    setBillNo("");
    setItemWise(false);
    setUnsettledBill(false);
    setOrderType("all");
  }, []);

  const handleBulkSettle = useCallback(() => {
    alert("Bulk settle...");
  }, []);

  return (
    <div className="p-4 sm:p-5 space-y-4">
      {/* Top Row — Two search panels */}
      <div className="flex gap-4">
        {/* Left — Search By Customer */}
        <div className="flex-1 min-w-0 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <h1 className="text-lg font-semibold text-gray-800">Credit Bills</h1>
            <span className="text-sm text-gray-500">Search By Customer</span>
            <div className="ml-auto flex items-center gap-1">
              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronUp size={16} className="text-gray-500" />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings size={16} className="text-gray-500" />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={16} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Search Fields */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile
              </label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Due Amt Button */}
          <div className="mb-4">
            <button className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-white text-sm font-semibold px-5 py-2 rounded-lg shadow-sm transition-colors">
              Due Amt.
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-4" />

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleViewBills}
              className="bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-colors"
            >
              View Bills
            </button>
            <button
              onClick={handleClear}
              className="bg-gradient-to-r from-purple-500 to-purple-400 hover:from-purple-600 hover:to-purple-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-colors"
            >
              Clear
            </button>
            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={handleBulkSettle}
                className="border border-gray-300 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Bulk Settle
              </button>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => setSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-600">Select All</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right — Search By Bill */}
        <div className="flex-1 min-w-0 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-sm font-semibold text-gray-700">Search By Bill</h2>
            <div className="ml-auto flex items-center gap-1">
              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronUp size={16} className="text-gray-500" />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings size={16} className="text-gray-500" />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={16} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Bill Date Range */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bill Date Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={billDateFrom}
                onChange={(e) => setBillDateFrom(e.target.value)}
                className="flex-1 border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="date"
                value={billDateTo}
                onChange={(e) => setBillDateTo(e.target.value)}
                className="flex-1 border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Bill No + Checkboxes */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bill No
              </label>
              <input
                type="text"
                value={billNo}
                onChange={(e) => setBillNo(e.target.value)}
                className="w-full border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex items-end gap-4 pb-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={itemWise}
                  onChange={(e) => setItemWise(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-600">Item Wise</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={unsettledBill}
                  onChange={(e) => setUnsettledBill(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-600">UnSettled Bill</span>
              </label>
            </div>
          </div>

          {/* Order Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Type
            </label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className="w-full border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">--All--</option>
              <option value="laundry">Laundry Service</option>
              <option value="drycleaning">Dry Cleaning</option>
              <option value="ironing">Ironing</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Area — Full Width */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 min-h-[200px]">
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">Use the search filters above to view credit bills</p>
        </div>
      </div>
    </div>
  );
}