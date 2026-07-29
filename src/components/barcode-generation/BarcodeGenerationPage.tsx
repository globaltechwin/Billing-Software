"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { sampleProducts } from "@/components/product/data";
import { BarcodeRecord } from "./data";

export default function BarcodeGenerationPage() {
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [packedOn, setPackedOn] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [noOfCopies, setNoOfCopies] = useState("");
  const [netWeight, setNetWeight] = useState("");
  const [unitOfMeasurement, setUnitOfMeasurement] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [barCode, setBarCode] = useState("");
  const [showForm, setShowForm] = useState(true);
  const [generatedBarcodes, setGeneratedBarcodes] = useState<BarcodeRecord[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Auto-fill from product name
  const handleItemNameChange = (value: string) => {
    setItemName(value);
    const product = sampleProducts.find(
      (p) => p.name.toLowerCase() === value.toLowerCase()
    );
    if (product) {
      setPrice(product.sellingPrice.toString());
      setBarCode(product.barcode);
      setUnitOfMeasurement(product.uom);
    }
  };

  // Generate barcode
  const handleGenerate = () => {
    if (!itemName || !price || !noOfCopies || !barCode) return;
    const copies = parseInt(noOfCopies);
    if (isNaN(copies) || copies <= 0) return;

    const newRecord: BarcodeRecord = {
      id: Date.now().toString(),
      itemName,
      price: parseFloat(price),
      packedOn,
      expiryDate,
      noOfCopies: copies,
      netWeight,
      unitOfMeasurement,
      ingredient,
      barCode,
    };
    setGeneratedBarcodes((prev) => [...prev, newRecord]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  // Clear form
  const handleClear = () => {
    setItemName("");
    setPrice("");
    setPackedOn("");
    setExpiryDate("");
    setNoOfCopies("");
    setNetWeight("");
    setUnitOfMeasurement("");
    setIngredient("");
    setBarCode("");
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          Barcode generated successfully!
        </div>
      )}

      {/* Main Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Title Bar */}
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Barcode Generation</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-gray-500 hover:text-gray-700"
          >
            {showForm ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Form Content */}
        {showForm && (
          <div className="p-6 space-y-5">
            {/* Row 1 */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Item Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => handleItemNameChange(e.target.value)}
                  list="product-list"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <datalist id="product-list">
                  {sampleProducts.map((p) => (
                    <option key={p.id} value={p.name} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Price<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Packed On</label>
                <input
                  type="date"
                  value={packedOn}
                  onChange={(e) => setPackedOn(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  No. of Copies<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={noOfCopies}
                  onChange={(e) => setNoOfCopies(e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Net Weight</label>
                <input
                  type="text"
                  value={netWeight}
                  onChange={(e) => setNetWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Unit of Measurement</label>
                <input
                  type="text"
                  value={unitOfMeasurement}
                  onChange={(e) => setUnitOfMeasurement(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Ingredient</label>
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => setIngredient(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  BarCode<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={barCode}
                  onChange={(e) => setBarCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleGenerate}
                className="px-6 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors"
              >
                Generate Barcode
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

      {/* Generated Barcodes */}
      {generatedBarcodes.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-3 bg-[#f2f5f9] border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">Generated Barcodes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#3d9a7e] text-white">
                  <th className="px-4 py-3 text-left text-xs font-semibold w-12">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">ITEM NAME</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">PRICE</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">BARCODE</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">COPIES</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">PACKED ON</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">EXPIRY DATE</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">UOM</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-28">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {generatedBarcodes.map((record, index) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{record.itemName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{record.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-mono">{record.barCode}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{record.noOfCopies}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{record.packedOn || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{record.expiryDate || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{record.unitOfMeasurement || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">Print</button>
                        <span className="text-gray-300">/</span>
                        <button
                          onClick={() => setGeneratedBarcodes((prev) => prev.filter((r) => r.id !== record.id))}
                          className="text-red-600 hover:text-red-800 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
