"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { poProducts, vendors, categories, POProduct, POItem } from "./data";

export default function PORequestPage() {
  const [category, setCategory] = useState("All Categories");
  const [indentNo, setIndentNo] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<POProduct | null>(null);
  const [reqQty, setReqQty] = useState("1");
  const [items, setItems] = useState<POItem[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Vendor panel
  const [vendorSearch, setVendorSearch] = useState("");
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<typeof vendors[0] | null>(null);
  const [mobile, setMobile] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [branch, setBranch] = useState("");
  const [taxAmount, setTaxAmount] = useState("");
  const [purchaseType, setPurchaseType] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [indentRef, setIndentRef] = useState("");
  const [remarks, setRemarks] = useState("");

  const productDropdownRef = useRef<HTMLDivElement>(null);
  const vendorDropdownRef = useRef<HTMLDivElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (productDropdownRef.current && !productDropdownRef.current.contains(e.target as Node)) {
        setShowProductDropdown(false);
      }
      if (vendorDropdownRef.current && !vendorDropdownRef.current.contains(e.target as Node)) {
        setShowVendorDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Filter products
  const filteredProducts = poProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) &&
      !items.some((i) => i.product.id === p.id)
  );

  // Filter vendors
  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
      v.mobile.includes(vendorSearch)
  );

  // Select product
  const handleProductSelect = (product: POProduct) => {
    setSelectedProduct(product);
    setProductSearch(product.name);
    setShowProductDropdown(false);
    setReqQty("1");
  };

  // Add item
  const handleAddItem = () => {
    if (!selectedProduct) return;
    const qty = parseInt(reqQty);
    if (isNaN(qty) || qty <= 0) return;

    const existing = items.find((i) => i.product.id === selectedProduct.id);
    if (existing) {
      setItems((prev) =>
        prev.map((i) =>
          i.product.id === selectedProduct.id
            ? { ...i, reqQty: i.reqQty + qty }
            : i
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        { id: Date.now().toString(), product: selectedProduct, reqQty: qty },
      ]);
    }

    setSelectedProduct(null);
    setProductSearch("");
    setReqQty("1");
  };

  // Handle qty change
  const handleQtyChange = (itemId: string, newQty: string) => {
    const qty = parseInt(newQty);
    if (newQty === "" || (!isNaN(qty) && qty >= 0)) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, reqQty: newQty === "" ? 0 : qty } : i
        )
      );
    }
  };

  // Remove item
  const handleRemoveItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Select vendor
  const handleVendorSelect = (vendor: typeof vendors[0]) => {
    setSelectedVendor(vendor);
    setVendorSearch(vendor.name);
    setMobile(vendor.mobile);
    setVendorName(vendor.name);
    setBranch(vendor.branch);
    setShowVendorDropdown(false);
  };

  // Totals
  const totalItems = items.length;
  const totalQty = items.reduce((sum, i) => sum + i.reqQty, 0);
  const totalAmount = items.reduce((sum, i) => {
    const amt = i.product.price * i.reqQty;
    const tax = amt * (i.product.taxRate / 100);
    return sum + amt + tax;
  }, 0);

  // Save
  const handleSave = () => {
    if (items.length === 0) return;
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setItems([]);
      setProductSearch("");
      setSelectedProduct(null);
      setReqQty("1");
      setRemarks("");
      setIndentRef("");
    }, 2000);
  };

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "F1") {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "F2") {
        e.preventDefault();
        productInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div className="flex gap-4 p-4 h-full">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          Purchase Order saved successfully!
        </div>
      )}

      {/* Left Panel - Main Content */}
      <div className="flex-[7] flex flex-col gap-4">
        {/* Title Row */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">Purchase Order Request</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Favourites</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Indent No + Product Search Row */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 flex flex-col gap-4">
          {/* Indent No */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-700 font-medium whitespace-nowrap">Indent No.</label>
            <input
              type="text"
              value={indentNo}
              onChange={(e) => setIndentNo(e.target.value)}
              className="w-56 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button className="text-gray-400 hover:text-gray-600">
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Product Search */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-lg" ref={productDropdownRef}>
              <input
                ref={productInputRef}
                type="text"
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
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
                        {product.uom} | Stock: {product.currentStock} | ₹{product.price}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleAddItem}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors whitespace-nowrap"
            >
              Auto Stock Out
            </button>
            <span className="bg-blue-500 text-white text-xs font-medium px-4 py-1.5 rounded whitespace-nowrap">
              F1 – Save, F2 – Select product, F3 – Vendor
            </span>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead>
                <tr className="bg-[#3d9a7e] text-white">
                  <th className="px-4 py-3 text-left w-12 text-xs font-semibold">-</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">Product Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-20">UOM</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-32">Vendor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-24">Cur. Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-24">Req Qty.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-24">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-28">Tax Amt.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-28">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <span className="text-orange-500 text-sm">
                        There are no items [<span className="text-orange-500">Stock</span>]
                      </span>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const amt = item.product.price * item.reqQty;
                    const tax = amt * (item.product.taxRate / 100);
                    const total = amt + tax;
                    return (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.product.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.product.uom}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.product.vendor}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.product.currentStock}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.reqQty}
                            onChange={(e) => handleQtyChange(item.id, e.target.value)}
                            min="1"
                            className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.product.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{tax.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">{total.toFixed(2)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-4 py-3 border-t border-gray-200 flex items-center gap-8">
            <span className="text-gray-400 text-sm">-</span>
            <div className="text-sm">
              <span className="font-semibold text-gray-700">Total Item(s)</span>
            </div>
            <div className="text-sm">
              <span className="font-semibold text-gray-700">Total Qty</span>
              <span className="ml-2 text-gray-600">{totalQty}</span>
            </div>
            <div className="text-sm">
              <span className="font-semibold text-gray-700">Total Amount</span>
              <span className="ml-2 text-gray-600">{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Vendor Details */}
      <div className="flex-[3] bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-fit">
        <div className="space-y-4">
          {/* Vendor Search */}
          <div className="relative" ref={vendorDropdownRef}>
            <input
              type="text"
              value={vendorSearch}
              onChange={(e) => {
                setVendorSearch(e.target.value);
                setShowVendorDropdown(true);
              }}
              onFocus={() => setShowVendorDropdown(true)}
              placeholder="Type Vendor Name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {showVendorDropdown && filteredVendors.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 max-h-48 overflow-y-auto">
                {filteredVendors.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => handleVendorSelect(v)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-gray-700">{v.name}</span>
                    <span className="text-xs text-gray-400 ml-2">{v.mobile}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm text-gray-700 font-medium mb-1">Mobile:*</label>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Mobile"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm text-gray-700 font-medium mb-1">Name:*</label>
            <input
              type="text"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="Vendor Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Branch */}
          <div>
            <label className="block text-sm text-gray-700 font-medium mb-1">Branch</label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">--Select Branch--</option>
              <option value="Main Branch">Main Branch</option>
              <option value="Second Branch">Second Branch</option>
            </select>
          </div>

          {/* Tax Amount */}
          <div>
            <label className="block text-sm text-gray-700 font-medium mb-1">Tax Amount</label>
            <input
              type="number"
              value={taxAmount}
              onChange={(e) => setTaxAmount(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Purchase Type */}
          <div>
            <label className="block text-sm text-gray-700 font-medium mb-1">Purchase Type</label>
            <select
              value={purchaseType}
              onChange={(e) => setPurchaseType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">--Select Type--</option>
              <option value="Credit">Credit</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          {/* Delivery Date */}
          <div>
            <label className="block text-sm text-gray-700 font-medium mb-1">
              Delivery Date<span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Indent No */}
          <div>
            <label className="block text-sm text-gray-700 font-medium mb-1">Indent No</label>
            <input
              type="text"
              value={indentNo}
              onChange={(e) => setIndentNo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Indent Ref */}
          <div>
            <label className="block text-sm text-gray-700 font-medium mb-1">Indent Ref</label>
            <textarea
              value={indentRef}
              onChange={(e) => setIndentRef(e.target.value)}
              placeholder="Indent Ref"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm text-gray-700 font-medium mb-1">Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Remarks"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total</span>
              <span className="text-sm font-bold text-gray-800">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
