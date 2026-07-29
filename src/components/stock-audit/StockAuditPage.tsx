"use client";

import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { auditProducts, branches, AuditItem } from "./data";

export default function StockAuditPage() {
  const [branch, setBranch] = useState(branches[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [auditItems, setAuditItems] = useState<AuditItem[]>(
    auditProducts.map((p) => ({
      ...p,
      modifiedStock: "",
      remarks: "",
    })),
  );
  const [showSuccess, setShowSuccess] = useState(false);

  // Search filter
  const filteredItems = searchQuery
    ? auditItems.filter(
        (item) =>
          item.prodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.prodCode.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : auditItems;

  // Update modified stock
  const handleModifiedStockChange = (id: string, value: string) => {
    if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
      setAuditItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, modifiedStock: value } : item,
        ),
      );
    }
  };

  // Update remarks
  const handleRemarksChange = (id: string, value: string) => {
    setAuditItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, remarks: value } : item)),
    );
  };

  // Save
  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setAuditItems(
        auditProducts.map((p) => ({
          ...p,
          modifiedStock: "",
          remarks: "",
        })),
      );
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          Stock Audit saved successfully!
        </div>
      )}

      {/* Main Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Title Bar */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">Stock List</h2>
            <button className="text-gray-400 hover:text-gray-600">
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors"
            >
              Save
            </button>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[260px]"
            >
              {branches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-3 flex justify-end border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Search:</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder=""
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#3d9a7e] text-white">
                <th className="px-4 py-3 text-left text-xs font-semibold w-16">
                  S.NO
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold w-28">
                  PROD CODE
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold">
                  PROD NAME
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold w-36">
                  CURRENT STOCK
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold w-56">
                  MODIFIED STOCK
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold w-64">
                  REMARKS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No data available in table
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {item.prodCode}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {item.prodName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                      {item.currentStock.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.modifiedStock}
                        onChange={(e) =>
                          handleModifiedStockChange(item.id, e.target.value)
                        }
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.remarks}
                        onChange={(e) =>
                          handleRemarksChange(item.id, e.target.value)
                        }
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <span className="text-sm text-gray-600">
            Showing 1 to {filteredItems.length} of {filteredItems.length}{" "}
            entries
          </span>
        </div>
      </div>
    </div>
  );
}
