"use client";

import { useState, useRef, useEffect, useMemo } from "react";

interface Product {
  id: number;
  productName: string;
  productCode: string | null;
  unit: string;
  sellingPrice: number;
  currentStock: number;
  isActive: boolean;
}

interface WastageItem {
  id: string;
  productId: number;
  productName: string;
  currentStock: number;
  wastageQuantity: number;
}

const PRODUCTION_CATEGORIES = [
  "--Select Category--",
  "Morning Session",
  "Afternoon Session",
  "Evening Session",
  "Full Day",
];

export default function WastagePage() {
  const [productionCategory, setProductionCategory] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [items, setItems] = useState<WastageItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);
  const itemIdCounter = useRef(0);

  const productInputRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setProducts(d.products.filter((p: Product) => p.isActive));
      })
      .catch(() => {});
  }, []);

  const filteredProducts = useMemo(() => {
    if (!productSearch) return products;
    const q = productSearch.toLowerCase();
    return products.filter((p) => p.productName.toLowerCase().includes(q));
  }, [productSearch, products]);

  const totalWastage = useMemo(
    () => items.reduce((sum, item) => sum + item.wastageQuantity, 0),
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

  const handleProductSelect = (product: Product) => {
    const exists = items.find((i) => i.productName === product.productName);
    if (!exists) {
      const newItem: WastageItem = {
        id: `item-${itemIdCounter.current++}`,
        productId: product.id,
        productName: product.productName,
        currentStock: product.currentStock,
        wastageQuantity: 0,
      };
      setItems((prev) => [...prev, newItem]);
    }
    setProductSearch("");
    setShowProductDropdown(false);
  };

  const handleAddProduct = () => {
    if (!productSearch) return;
    const match = products.find(
      (p) => p.productName.toLowerCase() === productSearch.toLowerCase()
    );
    if (match) {
      handleProductSelect(match);
    }
  };

  const handleWastageQuantityChange = (id: string, qty: number) => {
    if (qty < 0) return;
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, wastageQuantity: qty } : i))
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSave = async () => {
    if (items.length === 0) {
      alert("Please add at least one product");
      return;
    }
    const hasInvalid = items.some((i) => i.wastageQuantity <= 0);
    if (hasInvalid) {
      alert("Please enter valid wastage quantities");
      return;
    }
    if (!productionCategory) {
      alert("Please select a production category");
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/wastage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productionCategory,
          remarks,
          items: items.map((i) => ({
            productId: i.productId,
            wastageQuantity: i.wastageQuantity,
          })),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || "Failed to save wastage");
        return;
      }
      alert("Wastage saved successfully!");
      handleClear();
    } catch {
      alert("Failed to save wastage");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setProductionCategory("");
    setProductSearch("");
    setRemarks("");
    setItems([]);
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="flex flex-col xl:flex-row gap-4">
        {/* Left: Main Form Area */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Title Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-lg font-semibold text-gray-800">Production Wastage</h2>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Production Category</label>
                <select
                  value={productionCategory}
                  onChange={(e) => setProductionCategory(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {PRODUCTION_CATEGORIES.map((c) => (
                    <option key={c} value={c === "--Select Category--" ? "" : c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Product Input Row */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 flex flex-wrap items-center gap-4">
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
                        {p.productName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="px-4 py-2 bg-[#3d9a7e] text-white rounded-md text-sm font-medium hover:bg-[#2e8a6e] transition-colors flex-shrink-0">
                F1 - Save, F2 - Select product
              </button>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-[#3d9a7e] text-white">
                    <th className="px-4 py-3 text-center text-xs font-semibold w-[60px]">-</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold">Product Name</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold w-[150px]">Cur. Stock</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold w-[180px]">Wastage Quantity.</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm">
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
                        <td className="px-4 py-3 text-sm text-gray-700 text-center">
                          {item.currentStock}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            value={item.wastageQuantity || ""}
                            onChange={(e) =>
                              handleWastageQuantityChange(item.id, parseInt(e.target.value) || 0)
                            }
                            min="0"
                            placeholder="0"
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
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
        <div className="w-full xl:w-[280px] flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-5 flex flex-col gap-4">
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
                <div className="text-xl font-bold text-billora-primary mt-1">
                  {totalWastage.toLocaleString("en-IN")}
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
