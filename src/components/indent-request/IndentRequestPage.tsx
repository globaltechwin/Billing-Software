"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { inventoryProducts, departments, RequestedItem, InventoryProduct } from "./data";

export default function IndentRequestPage() {
  const [requestType, setRequestType] = useState<"inventory" | "production">("inventory");
  const [centralised, setCentralised] = useState(false);
  const [department, setDepartment] = useState("");
  const [remarks, setRemarks] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [requestedItems, setRequestedItems] = useState<RequestedItem[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
  const [requestQty, setRequestQty] = useState<string>("1");
  const [showSuccess, setShowSuccess] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter products based on search
  const filteredProducts = inventoryProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !requestedItems.some((ri) => ri.product.id === p.id)
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowProductDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle product select from dropdown
  const handleProductSelect = (product: InventoryProduct) => {
    setSelectedProduct(product);
    setSearchQuery(product.name);
    setShowProductDropdown(false);
    setRequestQty("1");
  };

  // Handle add item
  const handleAddItem = () => {
    if (!selectedProduct) return;
    const qty = parseInt(requestQty);
    if (isNaN(qty) || qty <= 0) return;

    // Check if product already in list
    const existing = requestedItems.find((ri) => ri.product.id === selectedProduct.id);
    if (existing) {
      setRequestedItems((prev) =>
        prev.map((ri) =>
          ri.product.id === selectedProduct.id
            ? { ...ri, requestQty: ri.requestQty + qty }
            : ri
        )
      );
    } else {
      setRequestedItems((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          product: selectedProduct,
          requestQty: qty,
        },
      ]);
    }

    setSelectedProduct(null);
    setSearchQuery("");
    setRequestQty("1");
  };

  // Handle quantity change in table
  const handleQtyChange = (itemId: string, newQty: string) => {
    const qty = parseInt(newQty);
    if (newQty === "" || (!isNaN(qty) && qty >= 0)) {
      setRequestedItems((prev) =>
        prev.map((ri) =>
          ri.id === itemId
            ? { ...ri, requestQty: newQty === "" ? 0 : qty }
            : ri
        )
      );
    }
  };

  // Handle remove item
  const handleRemoveItem = (itemId: string) => {
    setRequestedItems((prev) => prev.filter((ri) => ri.id !== itemId));
  };

  // Handle save
  const handleSave = () => {
    if (requestedItems.length === 0) return;
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setRequestedItems([]);
      setDepartment("");
      setRemarks("");
      setCentralised(false);
      setRequestType("inventory");
    }, 2000);
  };

  // Handle clear
  const handleClear = () => {
    setRequestedItems([]);
    setDepartment("");
    setRemarks("");
    setCentralised(false);
    setRequestType("inventory");
    setSelectedProduct(null);
    setSearchQuery("");
    setRequestQty("1");
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "F1") {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "F2") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Totals
  const totalItems = requestedItems.length;
  const totalQty = requestedItems.reduce((sum, item) => sum + item.requestQty, 0);

  return (
    <div className="flex gap-4 p-4 h-full">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          Indent request saved successfully!
        </div>
      )}

      {/* Left Panel - Main Content */}
      <div className="flex-[7] flex flex-col gap-4">
        {/* Title Row */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">Indent Request</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="requestType"
                  checked={requestType === "inventory"}
                  onChange={() => setRequestType("inventory")}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Inventory</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="requestType"
                  checked={requestType === "production"}
                  onChange={() => setRequestType("production")}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Production</span>
              </label>
            </div>
            <span className="bg-purple-500 text-white text-xs font-medium px-4 py-1.5 rounded-full">
              Central Store Stock
            </span>
          </div>
        </div>

        {/* Product Search Row */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="relative flex-1 max-w-lg" ref={dropdownRef}>
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowProductDropdown(true);
                setSelectedProduct(null);
              }}
              onFocus={() => setShowProductDropdown(true)}
              placeholder="Enter Product"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {showProductDropdown && filteredProducts.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 max-h-60 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between border-b border-gray-50 last:border-0"
                  >
                    <span className="text-gray-700">{product.name}</span>
                    <span className="text-xs text-gray-400">
                      {product.uom} | Stock: {product.currentStock}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="bg-emerald-500 text-white text-xs font-medium px-4 py-1.5 rounded ml-4">
            F1 - Save, F2 - Select product
          </span>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
          {/* Table Header */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead>
                <tr className="bg-[#3d9a7e] text-white">
                  <th className="px-4 py-3 text-left w-12 text-xs font-semibold">-</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">Product Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-20">UOM</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-28">Cur. Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-32">Request Qty.</th>
                </tr>
              </thead>
              <tbody>
                {requestedItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <span className="text-orange-500 text-sm">
                        There are no items [<span className="text-orange-500">Stock</span>]
                      </span>
                    </td>
                  </tr>
                ) : (
                  requestedItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {item.product.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {item.product.uom}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {item.product.currentStock}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.requestQty}
                          onChange={(e) => handleQtyChange(item.id, e.target.value)}
                          min="1"
                          className="w-24 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-4 py-3 border-t border-gray-200 flex items-center gap-6">
            <span className="text-gray-400 text-sm">-</span>
            <div className="text-sm">
              <span className="font-semibold text-gray-700">Total Item(s)</span>
            </div>
            <div className="text-sm">
              <span className="font-semibold text-gray-700 ml-4">Total Qty</span>
              <span className="ml-2 text-gray-600">{totalQty}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Settings */}
      <div className="flex-[3] bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-fit">
        <div className="space-y-5">
          {/* Centralised */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700 font-medium">Centralised</label>
            <input
              type="checkbox"
              checked={centralised}
              onChange={(e) => setCentralised(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm text-gray-700 font-medium mb-1.5">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">--Select Department--</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm text-gray-700 font-medium mb-1.5">Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Remarks"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={requestedItems.length === 0}
              className="px-6 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
            <button
              onClick={handleClear}
              className="px-6 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
