"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronUp, ChevronDown, Search } from "lucide-react";
import { sampleProductionMappings, ProductionMapping } from "./data";
import { sampleProducts, Product } from "../product/data";
import { sampleUnits, Unit } from "../unit/data";

export default function ProductionMappingPage() {
  const [mappingType, setMappingType] = useState("Production");
  const [itemName, setItemName] = useState("");
  const [itemNameSearch, setItemNameSearch] = useState("");
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [productionName, setProductionName] = useState("");
  const [productionNameSearch, setProductionNameSearch] = useState("");
  const [showProductionDropdown, setShowProductionDropdown] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [uom, setUom] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [cost, setCost] = useState("");

  const [mappings, setMappings] = useState<ProductionMapping[]>(sampleProductionMappings);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(true);
  const [showList, setShowList] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const itemDropdownRef = useRef<HTMLDivElement>(null);
  const productionDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (itemDropdownRef.current && !itemDropdownRef.current.contains(e.target as Node)) {
        setShowItemDropdown(false);
      }
      if (productionDropdownRef.current && !productionDropdownRef.current.contains(e.target as Node)) {
        setShowProductionDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredItems = itemNameSearch
    ? sampleProducts.filter((p) =>
        p.name.toLowerCase().includes(itemNameSearch.toLowerCase())
      )
    : sampleProducts;

  const filteredProductionItems = productionNameSearch
    ? sampleProducts.filter((p) =>
        p.name.toLowerCase().includes(productionNameSearch.toLowerCase())
      )
    : sampleProducts;

  const filteredMappings = searchQuery
    ? mappings.filter(
        (m) =>
          m.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.uom.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.mappingType.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mappings;

  const totalPages = Math.ceil(filteredMappings.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedMappings = filteredMappings.slice(startIndex, startIndex + entriesPerPage);

  const handleSave = () => {
    if (!itemName.trim() || !productionName.trim()) return;

    const calculatedCost = quantity && purchasePrice
      ? parseFloat(quantity) * parseFloat(purchasePrice)
      : 0;

    if (editId) {
      setMappings((prev) =>
        prev.map((m) =>
          m.id === editId
            ? {
                ...m,
                itemName: itemName.trim(),
                productName: productionName.trim(),
                quantity: parseFloat(quantity) || 0,
                uom,
                purchasePrice: parseFloat(purchasePrice) || 0,
                cost: calculatedCost,
                mappingType,
              }
            : m
        )
      );
    } else {
      const newMapping: ProductionMapping = {
        id: Date.now().toString(),
        itemName: itemName.trim(),
        productName: productionName.trim(),
        quantity: parseFloat(quantity) || 0,
        uom,
        purchasePrice: parseFloat(purchasePrice) || 0,
        cost: calculatedCost,
        mappingType,
      };
      setMappings((prev) => [...prev, newMapping]);
    }

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    handleClear();
  };

  const handleClear = () => {
    setMappingType("Production");
    setItemName("");
    setItemNameSearch("");
    setProductionName("");
    setProductionNameSearch("");
    setQuantity("");
    setUom("");
    setPurchasePrice("");
    setCost("");
    setEditId(null);
  };

  const handleEdit = (mapping: ProductionMapping) => {
    setMappingType(mapping.mappingType);
    setItemName(mapping.itemName);
    setItemNameSearch(mapping.itemName);
    setProductionName(mapping.productName);
    setProductionNameSearch(mapping.productName);
    setQuantity(mapping.quantity.toString());
    setUom(mapping.uom);
    setPurchasePrice(mapping.purchasePrice.toString());
    setCost(mapping.cost.toString());
    setEditId(mapping.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setMappings((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          {editId ? "Production mapping updated successfully!" : "Production mapping saved successfully!"}
        </div>
      )}

      {/* Product Mapping Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Product Mapping</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-gray-500 hover:text-gray-700"
          >
            {showForm ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        {showForm && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-6 max-w-4xl">
              <div className="col-span-2">
                <label className="block text-sm text-gray-700 font-medium mb-2">
                  Mapping Type <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mappingType"
                      value="Production"
                      checked={mappingType === "Production"}
                      onChange={(e) => setMappingType(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Production</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mappingType"
                      value="Recipes"
                      checked={mappingType === "Recipes"}
                      onChange={(e) => setMappingType(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Recipes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mappingType"
                      value="Modifier"
                      checked={mappingType === "Modifier"}
                      onChange={(e) => setMappingType(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Modifier</span>
                  </label>
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <div className="relative" ref={itemDropdownRef}>
                  <div className="relative">
                    <input
                      type="text"
                      value={itemNameSearch}
                      onChange={(e) => {
                        setItemNameSearch(e.target.value);
                        setShowItemDropdown(true);
                      }}
                      onFocus={() => setShowItemDropdown(true)}
                      placeholder="Enter Product"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  {showItemDropdown && filteredItems.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredItems.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            setItemName(product.name);
                            setItemNameSearch(product.name);
                            setShowItemDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          {product.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Production Name <span className="text-red-500">*</span>
                </label>
                <div className="relative" ref={productionDropdownRef}>
                  <input
                    type="text"
                    value={productionNameSearch}
                    onChange={(e) => {
                      setProductionNameSearch(e.target.value);
                      setShowProductionDropdown(true);
                    }}
                    onFocus={() => setShowProductionDropdown(true)}
                    placeholder="Enter Product"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {showProductionDropdown && filteredProductionItems.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredProductionItems.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            setProductionName(product.name);
                            setProductionNameSearch(product.name);
                            setShowProductionDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          {product.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Quantity</label>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Quantity"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">UOM</label>
                <select
                  value={uom}
                  onChange={(e) => setUom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select UOM</option>
                  {sampleUnits.map((unit) => (
                    <option key={unit.id} value={unit.unitName}>
                      {unit.unitName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Purchase Price</label>
                <input
                  type="text"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="Purchase Price"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Cost</label>
                <input
                  type="text"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="Cost"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors"
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
        )}
      </div>

      {/* Product Mapping List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Product Mapping List</h2>
          <button
            onClick={() => setShowList(!showList)}
            className="text-gray-500 hover:text-gray-700"
          >
            {showList ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        {showList && (
          <>
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

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#3d9a7e] text-white">
                    <th className="px-4 py-3 text-left text-xs font-semibold w-16">S.NO</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold w-20">EDIT</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">PRODUCT NAME</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold w-24">UOM</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">MAPPING TYPE</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold w-24">DELETE</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMappings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                        No data available in table
                      </td>
                    </tr>
                  ) : (
                    paginatedMappings.map((mapping, index) => (
                      <tr key={mapping.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">{startIndex + index + 1}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleEdit(mapping)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">{mapping.productName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{mapping.uom}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{mapping.mappingType}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDelete(mapping.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing {filteredMappings.length > 0 ? startIndex + 1 : 0} to{" "}
                {Math.min(startIndex + entriesPerPage, filteredMappings.length)} of{" "}
                {filteredMappings.length} entries
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700 font-medium">{currentPage}</span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
