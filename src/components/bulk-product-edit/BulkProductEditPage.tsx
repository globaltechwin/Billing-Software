"use client";

import { useState } from "react";
import { Edit3, DollarSign, RefreshCw } from "lucide-react";
import { productCategories, vendors } from "@/components/product/data";

const branches = ["--Select Branch--", "Main Branch", "Second Branch", "Demo2"];

export default function BulkProductEditPage() {
  const [activeTab, setActiveTab] = useState<"product-edit" | "order-type" | "stock-revision">("product-edit");
  const [showSuccess, setShowSuccess] = useState(false);

  // Product Edit tab state
  const [peCategory, setPeCategory] = useState("Cat");
  const [peVendor, setPeVendor] = useState("--Select Vendor--");
  const [peBranch, setPeBranch] = useState("--Select Branch--");

  // Order Type Price tab state
  const [otCategory, setOtCategory] = useState("--Select--");
  const [otDate, setOtDate] = useState("28/07/2026");

  // Stock Price Revision tab state
  const [srStartDate, setSrStartDate] = useState("");
  const [srEndDate, setSrEndDate] = useState("");

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleLoad = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleStockRevision = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          Operation completed successfully!
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setActiveTab("product-edit")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
            activeTab === "product-edit"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <Edit3 className="w-4 h-4" />
          Product Edit
        </button>
        <button
          onClick={() => setActiveTab("order-type")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
            activeTab === "order-type"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Order Type Price
        </button>
        <button
          onClick={() => setActiveTab("stock-revision")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
            activeTab === "stock-revision"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          Stock Price Revision
        </button>
      </div>

      {/* Product Edit Tab */}
      {activeTab === "product-edit" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Product Modification</h2>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-700 font-medium whitespace-nowrap">
                  Product Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={peCategory}
                  onChange={(e) => setPeCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[160px]"
                >
                  {productCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-700 font-medium whitespace-nowrap">Vendor</label>
                <select
                  value={peVendor}
                  onChange={(e) => setPeVendor(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
                >
                  {vendors.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-700 font-medium whitespace-nowrap">Branch</label>
                <select
                  value={peBranch}
                  onChange={(e) => setPeBranch(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
                >
                  {branches.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleLoad}
                  className="px-6 py-2 bg-purple-500 text-white rounded-md text-sm font-medium hover:bg-purple-600 transition-colors"
                >
                  Load
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Type Price Tab */}
      {activeTab === "order-type" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Order Type Price</h2>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-700 font-medium whitespace-nowrap">
                  Product Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={otCategory}
                  onChange={(e) => setOtCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
                >
                  <option value="--Select--">--Select--</option>
                  {productCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-700 font-medium whitespace-nowrap">
                  Effective Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={otDate.split("/").reverse().join("-")}
                  onChange={(e) => {
                    const [y, m, d] = e.target.value.split("-");
                    setOtDate(`${d}/${m}/${y}`);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-6 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Price Revision Tab */}
      {activeTab === "stock-revision" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Stock Price Revision</h2>
            <div className="flex items-center gap-4">
              <input
                type="date"
                value={srStartDate}
                onChange={(e) => setSrStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="date"
                value={srEndDate}
                onChange={(e) => setSrEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleStockRevision}
                className="px-6 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors"
              >
                Stock Revision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
