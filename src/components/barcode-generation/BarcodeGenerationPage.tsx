"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronUp, ChevronDown, Loader2, Printer, Eye } from "lucide-react";
import JsBarcode from "jsbarcode";
import { BarcodeRecord } from "./data";

interface ProductItem {
  id: number;
  productName: string;
  barcode: string | null;
  sellingPrice: number;
  unit: string;
  productCode: string | null;
}

export default function BarcodeGenerationPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [itemName, setItemName] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [price, setPrice] = useState("");
  const [packedOn, setPackedOn] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [noOfCopies, setNoOfCopies] = useState("1");
  const [netWeight, setNetWeight] = useState("");
  const [unitOfMeasurement, setUnitOfMeasurement] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [barCode, setBarCode] = useState("");
  const [showForm, setShowForm] = useState(true);
  const [generatedBarcodes, setGeneratedBarcodes] = useState<BarcodeRecord[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewRecord, setPreviewRecord] = useState<BarcodeRecord | null>(null);
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    fetch("/api/barcode")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products) {
          setProducts(data.products);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, []);

  const handleItemNameChange = useCallback((value: string) => {
    setItemName(value);
    const product = products.find(
      (p) => p.productName.toLowerCase() === value.toLowerCase()
    );
    if (product) {
      setSelectedProductId(product.id);
      setPrice(product.sellingPrice.toString());
      setUnitOfMeasurement(product.unit);
      if (product.barcode) {
        setBarCode(product.barcode);
      } else {
        setBarCode("");
      }
    } else {
      setSelectedProductId(null);
    }
  }, [products]);

  useEffect(() => {
    if (previewRecord && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, previewRecord.barCode, {
          format: "EAN13",
          width: 2,
          height: 60,
          displayValue: true,
          fontSize: 14,
          margin: 10,
        });
      } catch {
        try {
          JsBarcode(barcodeRef.current, previewRecord.barCode, {
            format: "CODE128",
            width: 2,
            height: 60,
            displayValue: true,
            fontSize: 14,
            margin: 10,
          });
        } catch {
          // ignore
        }
      }
    }
  }, [previewRecord]);

  const handleGenerate = async () => {
    if (!selectedProductId || !itemName || !price || !noOfCopies) return;
    const copies = parseInt(noOfCopies);
    if (isNaN(copies) || copies <= 0) return;

    setGenerating(true);
    try {
      const res = await fetch("/api/barcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProductId,
          barcode: barCode || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const newBarcode = data.barcode;
        setBarCode(newBarcode);

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
          barCode: newBarcode,
        };

        setGeneratedBarcodes((prev) => [...prev, newRecord]);
        setPreviewRecord(newRecord);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);

        setProducts((prev) =>
          prev.map((p) =>
            p.id === selectedProductId ? { ...p, barcode: newBarcode } : p
          )
        );
      } else {
        alert(data.error || "Failed to generate barcode");
      }
    } catch {
      alert("Failed to generate barcode");
    } finally {
      setGenerating(false);
    }
  };

  const handleClear = () => {
    setItemName("");
    setSelectedProductId(null);
    setPrice("");
    setPackedOn("");
    setExpiryDate("");
    setNoOfCopies("1");
    setNetWeight("");
    setUnitOfMeasurement("");
    setIngredient("");
    setBarCode("");
    setPreviewRecord(null);
  };

  const handlePrint = (record: BarcodeRecord) => {
    const printWindow = window.open("", "_blank", "width=400,height=300");
    if (!printWindow) return;

    const svgElement = document.createElement("div");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgElement.appendChild(svg);

    try {
      JsBarcode(svg, record.barCode, {
        format: "EAN13",
        width: 2,
        height: 50,
        displayValue: true,
        fontSize: 12,
        margin: 5,
      });
    } catch {
      try {
        JsBarcode(svg, record.barCode, {
          format: "CODE128",
          width: 2,
          height: 50,
          displayValue: true,
          fontSize: 12,
          margin: 5,
        });
      } catch {
        return;
      }
    }

    const svgData = svgElement.innerHTML;

    let copiesHtml = "";
    for (let i = 0; i < record.noOfCopies; i++) {
      copiesHtml += `
        <div style="text-align:center;margin:10px 0;page-break-inside:avoid;">
          <div style="font-weight:bold;font-size:14px;">${record.itemName}</div>
          <div style="font-size:12px;">₹${record.price.toFixed(2)}</div>
          ${record.packedOn ? `<div style="font-size:10px;">Packed On: ${record.packedOn}</div>` : ""}
          ${record.expiryDate ? `<div style="font-size:10px;">Expiry: ${record.expiryDate}</div>` : ""}
          ${record.netWeight ? `<div style="font-size:10px;">Net Wt: ${record.netWeight}</div>` : ""}
          ${record.unitOfMeasurement ? `<div style="font-size:10px;">Unit: ${record.unitOfMeasurement}</div>` : ""}
          ${record.ingredient ? `<div style="font-size:10px;">Ingredient: ${record.ingredient}</div>` : ""}
          <div style="margin:5px 0;">${svgData}</div>
        </div>
      `;
    }

    printWindow.document.write(`
      <html>
        <head><title>Barcode - ${record.itemName}</title></head>
        <body style="font-family:Arial,sans-serif;padding:20px;">
          ${copiesHtml}
          <script>window.onload=function(){window.print();window.close();}<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          Barcode generated and saved successfully!
        </div>
      )}

      {/* Main Form Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Barcode Generation</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-gray-500 hover:text-gray-700"
          >
            {showForm ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {showForm && (
          <div className="p-6 space-y-5">
            {loadingProducts ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin text-purple-600 mr-2" />
                <span className="text-sm text-gray-500">Loading products...</span>
              </div>
            ) : (
              <>
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
                      placeholder="Select a product..."
                    />
                    <datalist id="product-list">
                      {products.map((p) => (
                        <option key={p.id} value={p.productName} />
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
                      placeholder="Auto-generated if empty"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleGenerate}
                disabled={!selectedProductId || generating}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? <Loader2 size={14} className="animate-spin" /> : null}
                {generating ? "Generating..." : "Generate Barcode"}
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

      {/* Barcode Preview */}
      {previewRecord && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-3 bg-[#f2f5f9] border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Barcode Preview</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePrint(previewRecord)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 text-white rounded-md text-xs font-medium hover:bg-amber-600 transition-colors"
              >
                <Printer size={12} />
                Print ({previewRecord.noOfCopies} copies)
              </button>
              <button
                onClick={() => setPreviewRecord(null)}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
          <div className="p-6 flex flex-col items-center">
            <div className="text-sm font-medium text-gray-800 mb-2">{previewRecord.itemName}</div>
            <div className="text-xs text-gray-500 mb-3">₹{previewRecord.price.toFixed(2)}</div>
            <svg ref={barcodeRef} />
          </div>
        </div>
      )}

      {/* Generated Barcodes Table */}
      {generatedBarcodes.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-3 bg-[#f2f5f9] border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">Generated Barcodes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
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
                  <th className="px-4 py-3 text-left text-xs font-semibold w-32">ACTION</th>
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
                        <button
                          onClick={() => setPreviewRecord(record)}
                          className="text-gray-600 hover:text-gray-800 text-xs font-medium"
                          title="Preview"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handlePrint(record)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                          title="Print"
                        >
                          <Printer size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setGeneratedBarcodes((prev) => prev.filter((r) => r.id !== record.id));
                            if (previewRecord?.id === record.id) setPreviewRecord(null);
                          }}
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
