"use client";

import { useState, useRef } from "react";
import {
  Lock,
  Upload,
  Download,
  ChevronDown,
  ChevronUp,
  Cloud,
  Maximize2,
  Settings,
  X,
} from "lucide-react";
import {
  Product,
  productCategories,
  vendors,
  uomList,
  visibleInOptions,
  taxGroups,
  orderTypes,
  sampleProducts,
} from "./data";

export default function ProductPage() {
  // Form state
  const [productCode, setProductCode] = useState("");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("Cat");
  const [vendor, setVendor] = useState("--Select Vendor--");
  const [uom, setUom] = useState("KG");
  const [visibleIn, setVisibleIn] = useState("Both Billing and Inventory");
  const [taxGroupName, setTaxGroupName] = useState("--Select Tax Group Name");
  const [sellingPrice, setSellingPrice] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Order type prices
  const [orderType, setOrderType] = useState("Laundry Service");
  const [orderTaxGroup, setOrderTaxGroup] = useState("GST 0%");
  const [orderAmount, setOrderAmount] = useState("");
  const [orderPrices, setOrderPrices] = useState<{ orderType: string; taxGroup: string; amount: string }[]>([]);

  // Product list
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");
  const [visibleFilter, setVisibleFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [showSuccess, setShowSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesTab = activeTab === "active" ? p.status === "Active" : p.status === "Inactive";
    const matchesVisible = visibleFilter === "All" || p.visibleIn === visibleFilter;
    const matchesCategory = categoryFilter === "All Categories" || p.category === categoryFilter;
    const matchesSearch =
      searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesVisible && matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredProducts.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + entriesPerPage);

  // Save product
  const handleSaveProduct = () => {
    if (!productName) return;
    const newProduct: Product = {
      id: Date.now().toString(),
      code: productCode || `PRD-${String(products.length + 1).padStart(3, "0")}`,
      name: productName,
      category,
      vendor: vendor === "--Select Vendor--" ? "" : vendor,
      uom,
      visibleIn,
      taxGroupName: taxGroupName === "--Select Tax Group Name" ? "GST 0%" : taxGroupName,
      sellingPrice: parseFloat(sellingPrice) || 0,
      mrp: parseFloat(sellingPrice) || 0,
      barcode: "",
      reorderQty: 0,
      status: "Active",
    };
    setProducts((prev) => [newProduct, ...prev]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    handleClear();
  };

  // Clear form
  const handleClear = () => {
    setProductCode("");
    setProductName("");
    setCategory("Cat");
    setVendor("--Select Vendor--");
    setUom("KG");
    setVisibleIn("Both Billing and Inventory");
    setTaxGroupName("--Select Tax Group Name");
    setSellingPrice("");
  };

  // Add order type price
  const handleAddPrice = () => {
    if (!orderAmount) return;
    setOrderPrices((prev) => [
      ...prev,
      { orderType, taxGroup: orderTaxGroup, amount: orderAmount },
    ]);
    setOrderAmount("");
  };

  // Delete product
  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          Product saved successfully!
        </div>
      )}

      {/* Top Section: Form + Image + Order Type Prices */}
      <div className="flex gap-4">
        {/* Left: Product Form */}
        <div className="flex-[7] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Title Bar */}
          <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-gray-800">Product Master</h2>
              <span className="text-sm text-gray-500">Details</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-500 text-white rounded-md text-xs font-medium hover:bg-blue-600 transition-colors">
                <Lock className="w-3.5 h-3.5" />
                Bill Item Lock
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-4">
            {/* Product Code + Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Product Code</label>
                <input
                  type="text"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Category + Vendor */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Product Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {productCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Vendor</label>
                <select
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {vendors.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* UOM + Visible In */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  UOM <span className="text-red-500">*</span>
                </label>
                <select
                  value={uom}
                  onChange={(e) => setUom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {uomList.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Visible in</label>
                <select
                  value={visibleIn}
                  onChange={(e) => setVisibleIn(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {visibleInOptions.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tax Group + Selling Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Tax Group Name <span className="text-red-500">*</span>
                </label>
                <select
                  value={taxGroupName}
                  onChange={(e) => setTaxGroupName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {taxGroups.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Selling Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-blue-600 hover:bg-gray-50 transition-colors"
              >
                Advanced Settings
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showAdvanced && (
                <div className="px-4 pb-4 text-sm text-gray-500">
                  Advanced settings content will be implemented here.
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveProduct}
                className="px-6 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors"
              >
                Save Product
              </button>
              <button
                onClick={handleClear}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Bulk Upload */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Bulk Upload</h3>
              <div className="flex items-center gap-3">
                <button className="px-5 py-2 bg-purple-500 text-white rounded-md text-sm font-medium hover:bg-purple-600 transition-colors">
                  Upload Excel
                </button>
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-gray-300 file:text-sm file:bg-white file:text-gray-700 hover:file:bg-gray-50"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3">
                <button className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium">
                  <Download className="w-4 h-4" />
                  Download Products
                </button>
                <button className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium">
                  <Download className="w-4 h-4" />
                  Template
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Image Preview + Order Type Prices */}
        <div className="flex-[3] flex flex-col gap-4">
          {/* Product Image Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800">Product Image Preview</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">LOGO</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-50">
                  Choose file
                </button>
                <span className="text-xs text-gray-400">No file chosen</span>
              </div>
              <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Product Image
              </button>
              <p className="text-xs text-gray-400 text-center">Save product first to enable upload</p>
            </div>
          </div>

          {/* Order Type Prices */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 flex items-center justify-between border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800">Order Type Prices</h3>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-md text-xs font-medium hover:bg-blue-600 transition-colors">
                <Cloud className="w-3.5 h-3.5" />
                Cloud Sync
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Order Type</label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {orderTypes.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Tax Group</label>
                <select
                  value={orderTaxGroup}
                  onChange={(e) => setOrderTaxGroup(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {taxGroups.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Amount</label>
                <input
                  type="number"
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddPrice}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors"
                >
                  Add Price
                </button>
                <button className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors">
                  Clear
                </button>
              </div>

              {/* Order Type Prices Table */}
              <div className="overflow-x-auto mt-3">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#3d9a7e] text-white">
                      <th className="px-3 py-2 text-left text-xs font-semibold">EDIT / DELETE</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold">ORDER TYPE</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold">TAX GROUP NAME</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderPrices.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-3 py-4 text-center text-xs text-gray-500">
                          No data available in table
                        </td>
                      </tr>
                    ) : (
                      orderPrices.map((op, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1">
                              <button className="text-blue-600 hover:text-blue-800 text-xs">Edit</button>
                              <span className="text-gray-300">/</span>
                              <button className="text-red-600 hover:text-red-800 text-xs">Delete</button>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-700">{op.orderType}</td>
                          <td className="px-3 py-2 text-xs text-gray-700">{op.taxGroup}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500">
                Showing 0 to 0 of 0 entries
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Product List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs + Filters */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex">
              <button
                onClick={() => setActiveTab("active")}
                className={`px-5 py-2 rounded-l-md text-sm font-medium transition-colors ${
                  activeTab === "active"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Active Products
              </button>
              <button
                onClick={() => setActiveTab("inactive")}
                className={`px-5 py-2 rounded-r-md text-sm font-medium transition-colors ${
                  activeTab === "inactive"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Inactive Products
              </button>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 font-medium">Visible In</label>
              <select
                value={visibleFilter}
                onChange={(e) => setVisibleFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All</option>
                {visibleInOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 font-medium">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All Categories">All Categories</option>
                {productCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table Controls */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show</span>
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">entries</span>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button className="bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-red-700 transition-colors">
                PDF
              </button>
              <button className="bg-emerald-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-emerald-700 transition-colors">
                Excel
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Search:</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#3d9a7e] text-white">
                <th className="px-4 py-3 text-left text-xs font-semibold w-12">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold w-28">ACTION</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">CODE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">NAME</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">CATEGORY</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">PRICE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">MRP</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">BARCODE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">VISIBLE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">REORDER QTY</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-sm text-gray-500">
                    No data available in table
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product, index) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{startIndex + index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                        <span className="text-gray-300">/</span>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">{product.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{product.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{product.sellingPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{product.mrp.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{product.barcode}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{product.visibleIn}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{product.reorderQty}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Showing {filteredProducts.length > 0 ? startIndex + 1 : 0} to{" "}
            {Math.min(startIndex + entriesPerPage, filteredProducts.length)} of{" "}
            {filteredProducts.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between py-2 text-xs text-gray-400">
        <span>&copy; 2025 - POS - V5.06.Nov</span>
        <span className="text-emerald-600 font-medium">LICENSE DATE 01/01/2030</span>
      </div>
    </div>
  );
}
