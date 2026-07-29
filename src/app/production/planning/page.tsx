"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { sampleProducts } from "@/components/product/data";
import { sampleBranches } from "@/components/branch-master/data";

interface PlanningItem {
  id: string;
  productName: string;
  uom: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

const PRODUCTION_CATEGORIES = [
  "--Select Session--",
  "Morning Session",
  "Afternoon Session",
  "Evening Session",
  "Full Day",
];

export default function PlanningPage() {
  const today = new Date().toLocaleDateString("en-GB");
  const [requestDate, setRequestDate] = useState(() => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  });
  const [productionCategory, setProductionCategory] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [items, setItems] = useState<PlanningItem[]>([]);
  const [editingQty, setEditingQty] = useState<string | null>(null);

  const productInputRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredProducts = useMemo(() => {
    if (!productSearch) return sampleProducts.filter((p) => p.status === "Active");
    const q = productSearch.toLowerCase();
    return sampleProducts.filter(
      (p) => p.status === "Active" && p.name.toLowerCase().includes(q)
    );
  }, [productSearch]);

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.totalPrice, 0),
    [items]
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        productInputRef.current &&
        !productInputRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowProductDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProductSelect = (product: (typeof sampleProducts)[0]) => {
    const exists = items.find((i) => i.productName === product.name);
    if (exists) {
      setItems((prev) =>
        prev.map((i) =>
          i.productName === product.name
            ? { ...i, quantity: i.quantity + 1, totalPrice: (i.quantity + 1) * i.price }
            : i
        )
      );
    } else {
      const newItem: PlanningItem = {
        id: String(Date.now()),
        productName: product.name,
        uom: product.uom,
        quantity: 1,
        price: product.sellingPrice,
        totalPrice: product.sellingPrice,
      };
      setItems((prev) => [...prev, newItem]);
    }
    setProductSearch("");
    setShowProductDropdown(false);
  };

  const handleAddProduct = () => {
    if (!productSearch) return;
    const match = sampleProducts.find(
      (p) => p.status === "Active" && p.name.toLowerCase() === productSearch.toLowerCase()
    );
    if (match) {
      handleProductSelect(match);
    }
  };

  const handleQuantityChange = (id: string, qty: number) => {
    if (qty < 0) return;
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, quantity: qty, totalPrice: qty * i.price }
          : i
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSave = () => {
    if (items.length === 0) {
      alert("Please add at least one product");
      return;
    }
    alert("Production plan saved successfully!");
    handleClear();
  };

  const handleClear = () => {
    setProductSearch("");
    setRemarks("");
    setItems([]);
    setEditingQty(null);
    setProductionCategory("");
  };

  const formatCurrency = (val: number) =>
    val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="flex gap-4">
        {/* Left: Main Form Area */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Title Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Production Planning</h2>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Production Category</label>
                <select
                  value={productionCategory}
                  onChange={(e) => setProductionCategory(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {PRODUCTION_CATEGORIES.map((c) => (
                    <option key={c} value={c === "--Select Session--" ? "" : c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Product Input Row */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 flex items-center gap-4">
              <div className="flex-1 relative" ref={productInputRef}>
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowProductDropdown(true);
                  }}
                  onFocus={() => setShowProductDropdown(true)}
                  placeholder="Enter Product"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {showProductDropdown && filteredProducts.length > 0 && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-[200px] overflow-y-auto"
                  >
                    {filteredProducts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleProductSelect(p)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={handleAddProduct}
                className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-md text-gray-600 text-lg font-bold transition-colors flex-shrink-0"
              >
                +
              </button>
              <button className="px-4 py-2 bg-[#3d9a7e] text-white rounded-md text-sm font-medium hover:bg-[#2e8a6e] transition-colors flex-shrink-0">
                F1 - Save, F2 - Select product
              </button>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#3d9a7e] text-white">
                    <th className="px-4 py-3 text-center text-xs font-semibold w-[60px]">-</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold">Product Name</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold w-[120px]">UOM</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold w-[140px]">Quantity</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold w-[120px]">Price</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold w-[140px]">Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm">
                        <span className="text-orange-500">There are no items</span>{" "}
                        <span className="text-green-500">[Stock]</span>
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700 text-sm font-bold"
                          >
                            -
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-center font-medium">
                          {item.productName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-center">{item.uom}</td>
                        <td className="px-4 py-3 text-center">
                          {editingQty === item.id ? (
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(item.id, parseInt(e.target.value) || 0)
                              }
                              onBlur={() => setEditingQty(null)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") setEditingQty(null);
                              }}
                              autoFocus
                              className="w-20 px-2 py-1 border border-blue-400 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <button
                              onClick={() => setEditingQty(item.id)}
                              className="text-sm text-gray-700 hover:text-blue-600 cursor-pointer"
                            >
                              {item.quantity}
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-center">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-center font-medium">
                          {formatCurrency(item.totalPrice)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Summary Panel */}
        <div className="w-[280px] flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Request Date*
                </label>
                <input
                  type="date"
                  value={requestDate}
                  onChange={(e) => setRequestDate(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  placeholder="Remarks"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <span className="text-sm font-medium text-gray-700">Total</span>
                <div className="text-xl font-bold text-orange-500 mt-1">
                  {formatCurrency(totalAmount)}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-[#4caf85] text-white rounded-md text-sm font-medium hover:bg-[#3d9a7e] transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleClear}
                  className="px-6 py-2 bg-purple-500 text-white rounded-md text-sm font-medium hover:bg-purple-600 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
