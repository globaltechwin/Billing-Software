"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { StockInItem, StockInPO, StockInProduct } from "./data";

interface ApiVendor {
  id: number;
  vendorName: string;
  mobileNumber: string;
}

interface ApiPOItem {
  id: number;
  productId: number;
  quantity: number;
  receivedQty: number;
  unit: string;
  purchasePrice: number;
  discount: number;
  gstPercentage: number;
  lineTotal: number;
  product?: { id: number; productName: string; currentStock: number };
}

interface ApiPO {
  id: number;
  poNumber: string;
  status: string;
  grandTotal: number;
  vendor: { vendorName: string };
  items: ApiPOItem[];
  createdAt: string;
}

export default function StockInPage() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [showSuccess, setShowSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [editingGrnId, setEditingGrnId] = useState<number | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(!!editId);

  // Header fields
  const [stockInNo, setStockInNo] = useState("SI-0011 (Auto)");
  const [stockInDate, setStockInDate] = useState(() => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  });
  const [branch, setBranch] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<ApiVendor | null>(null);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [vendorsList, setVendorsList] = useState<ApiVendor[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);

  // PO selection
  const [poSearch, setPoSearch] = useState("");
  const [selectedPO, setSelectedPO] = useState<StockInPO | null>(null);
  const [showPODropdown, setShowPODropdown] = useState(false);
  const [poList, setPoList] = useState<StockInPO[]>([]);
  const [poLoading, setPoLoading] = useState(false);

  // Invoice fields
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [remarks, setRemarks] = useState("");

  // Items table
  const [items, setItems] = useState<StockInItem[]>([]);

  // Refs
  const vendorDropdownRef = useRef<HTMLDivElement>(null);
  const poDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch vendors from API
  useEffect(() => {
    fetch("/api/vendors")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.vendors) {
          setVendorsList(data.vendors);
        }
      })
      .catch(() => {})
      .finally(() => setVendorsLoading(false));
  }, []);

  // Fetch POs when vendor changes
  useEffect(() => {
    if (!selectedVendor) {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPoLoading(true);
    fetch("/api/purchase-orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.orders) {
          const filtered: StockInPO[] = data.orders
            .filter((po: ApiPO) => po.vendor.vendorName === selectedVendor.vendorName && (po.status === "APPROVED" || po.status === "PARTIALLY_RECEIVED"))
            .map((po: ApiPO) => ({
              id: String(po.id),
              poNo: po.poNumber,
              vendorName: po.vendor.vendorName,
              items: po.items.map((item: ApiPOItem) => ({
                id: String(item.id),
                product: {
                  id: String(item.productId),
                  name: item.product?.productName || `Product ${item.productId}`,
                  uom: item.unit,
                  currentStock: Number(item.product?.currentStock || 0),
                  purchaseRate: Number(item.purchasePrice),
                  gstPercentage: Number(item.gstPercentage),
                } as StockInProduct,
                orderedQty: Number(item.quantity),
                receivedQty: 0,
                pendingQty: Number(item.quantity) - Number(item.receivedQty),
                amount: Number(item.lineTotal),
              })),
            }));
          setPoList(filtered);
        }
      })
      .catch(() => setPoList([]))
      .finally(() => setPoLoading(false));
  }, [selectedVendor]);

  // Load existing GRN when in edit mode
  useEffect(() => {
    if (!editId) return;
    fetch(`/api/goods-receipts/${editId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success || !data.grn) return;
        const grn = data.grn as Record<string, unknown>;
        setEditingGrnId(Number(grn.id));

        const vendor = grn.vendor as Record<string, unknown>;
        setSelectedVendor({
          id: Number(vendor.id),
          vendorName: String(vendor.vendorName || ""),
          mobileNumber: String(vendor.mobileNumber || ""),
        });
        setVendorSearch(String(vendor.vendorName || ""));

        const po = grn.purchaseOrder as Record<string, unknown>;
        setSelectedPO({
          id: String(grn.purchaseOrderId),
          poNo: String(po.poNumber || ""),
          vendorName: String(vendor.vendorName || ""),
          items: [],
        });
        setPoSearch(String(po.poNumber || ""));

        setStockInNo(String(grn.grnNumber || ""));
        const receiptDate = new Date(grn.receiptDate as string);
        if (!isNaN(receiptDate.getTime())) {
          const dd = String(receiptDate.getDate()).padStart(2, "0");
          const mm = String(receiptDate.getMonth() + 1).padStart(2, "0");
          setStockInDate(`${receiptDate.getFullYear()}-${mm}-${dd}`);
        }
        setRemarks(String(grn.notes || ""));

        const grnItems = (grn.items as Record<string, unknown>[]) || [];
        const mappedItems: StockInItem[] = grnItems.map((item) => {
          const product = item.product as Record<string, unknown>;
          const receivedQty = Number(item.receivedQty || 0);
          const orderedQty = Number(item.orderedQty || 0);
          const purchaseRate = Number(product.purchasePrice || 0);
          const gstMaster = product.gstMaster as Record<string, unknown> | undefined;
          const gstPercentage = Number(gstMaster?.totalPercentage || 0);
          return {
            id: String(item.id),
            product: {
              id: String(product.id),
              name: String(product.productName || ""),
              uom: String(product.unit || "NOS"),
              currentStock: Number(product.currentStock || 0),
              purchaseRate,
              gstPercentage,
            } as StockInProduct,
            orderedQty,
            receivedQty,
            pendingQty: Number(item.pendingQty || 0),
            amount: receivedQty * purchaseRate * (1 + gstPercentage / 100),
          };
        });
        setItems(mappedItems);
      })
      .catch(() => setSaveError("Failed to load stock in record for editing"))
      .finally(() => setLoadingEdit(false));
  }, [editId]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (vendorDropdownRef.current && !vendorDropdownRef.current.contains(e.target as Node)) {
        setShowVendorDropdown(false);
      }
      if (poDropdownRef.current && !poDropdownRef.current.contains(e.target as Node)) {
        setShowPODropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Filter vendors
  const filteredVendors = vendorsList.filter(
    (v) =>
      v.vendorName.toLowerCase().includes(vendorSearch.toLowerCase()) ||
      v.mobileNumber.includes(vendorSearch)
  );

  // Filter POs by search term
  const filteredPOs = poList.filter(
    (po) => po.poNo.toLowerCase().includes(poSearch.toLowerCase())
  );

  // Select vendor
  const handleVendorSelect = (vendor: ApiVendor) => {
    setSelectedVendor(vendor);
    setVendorSearch(vendor.vendorName);
    setShowVendorDropdown(false);
    // Clear PO when vendor changes
    setSelectedPO(null);
    setPoSearch("");
    setItems([]);
    setPoList([]);
  };

  // Select PO and load items
  const handlePOSelect = (po: StockInPO) => {
    setSelectedPO(po);
    setPoSearch(po.poNo);
    setShowPODropdown(false);

    // Load PO items into the table
    const loadedItems: StockInItem[] = po.items.map((item) => ({
      ...item,
      receivedQty: 0,
      pendingQty: item.orderedQty,
      amount: item.orderedQty * item.product.purchaseRate,
    }));
    setItems(loadedItems);
  };

  // Handle received qty change
  const handleReceivedQtyChange = (itemId: string, newQty: string) => {
    const qty = parseInt(newQty) || 0;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const pending = Math.max(0, item.orderedQty - qty);
          const amount = qty * item.product.purchaseRate * (1 + item.product.gstPercentage / 100);
          return { ...item, receivedQty: qty, pendingQty: pending, amount };
        }
        return item;
      })
    );
  };

  // Remove item
  const handleRemoveItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Compute totals
  const totalQuantity = items.reduce((sum, i) => sum + i.receivedQty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.receivedQty * i.product.purchaseRate, 0);
  const totalTax = items.reduce(
    (sum, i) => sum + i.receivedQty * i.product.purchaseRate * (i.product.gstPercentage / 100),
    0
  );
  const grandTotal = subtotal + totalTax;

  // Save
  const handleSave = async () => {
    if (items.length === 0) return;
    if (!selectedVendor) return;
    if (!selectedPO) return;
    setSaving(true);
    setSaveError("");
    try {
      const payload = {
        purchaseOrderId: Number(selectedPO.id),
        notes: remarks || null,
        items: items.map((item) => ({
          productId: Number(item.product.id),
          receivedQty: item.receivedQty,
        })),
      };
      const url = editingGrnId
        ? `/api/goods-receipts/${editingGrnId}`
        : "/api/goods-receipts";
      const res = await fetch(url, {
        method: editingGrnId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save stock in");
      }
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        handleClear();
      }, 2000);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // Clear
  const handleClear = () => {
    setStockInNo("SI-0011 (Auto)");
    setStockInDate(() => {
      const d = new Date();
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${yyyy}-${mm}-${dd}`;
    });
    setBranch("");
    setVendorSearch("");
    setSelectedVendor(null);
    setPoSearch("");
    setSelectedPO(null);
    setPoList([]);
    setInvoiceNumber("");
    setInvoiceDate("");
    setRemarks("");
    setItems([]);
    setSaveError("");
    setEditingGrnId(null);
  };

  // Cancel
  const handleCancel = () => {
    handleClear();
  };

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "F1") {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "Escape") {
        setSaveError("");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const formatCurrency = (amount: number) => amount.toFixed(2);

  return (
    <div className="flex flex-col xl:flex-row gap-4 p-4 h-full">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          {editingGrnId ? "Stock In updated successfully!" : "Stock In saved successfully!"}
        </div>
      )}
      {saveError && (
        <div className="fixed top-20 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          {saveError}
        </div>
      )}

      {/* Left Panel - Main Content */}
      <div className="xl:flex-[7] flex flex-col gap-4">
        {/* Title Row */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-800">Stock In</h1>
            {editingGrnId && (
              <span className="bg-amber-100 text-amber-700 text-xs font-medium px-3 py-1 rounded-full">
                Editing {stockInNo}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button className="text-gray-400 hover:text-gray-600">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Header Fields Row */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
          <div className="grid grid-cols-4 gap-4">
            {/* Stock In No. */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">
                Stock In No.<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={stockInNo}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-500"
              />
            </div>
            {/* Date */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">
                Date<span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={stockInDate}
                onChange={(e) => setStockInDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {/* Branch */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">
                Branch<span className="text-red-500">*</span>
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">--Select Branch--</option>
                <option value="Main Branch">Main Branch</option>
                <option value="Second Branch">Second Branch</option>
              </select>
            </div>
            {/* Vendor */}
            <div className="relative" ref={vendorDropdownRef}>
              <label className="block text-sm text-gray-700 font-medium mb-1">
                Vendor<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={vendorSearch}
                onChange={(e) => {
                  setVendorSearch(e.target.value);
                  setShowVendorDropdown(true);
                  setSelectedVendor(null);
                  setSelectedPO(null);
                  setPoSearch("");
                  setItems([]);
                  setPoList([]);
                }}
                onFocus={() => setShowVendorDropdown(true)}
                placeholder="Type Vendor Name..."
                disabled={!!editingGrnId}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
              {showVendorDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 max-h-48 overflow-y-auto">
                  {vendorsLoading ? (
                    <div className="px-4 py-3 text-sm text-gray-500">Loading vendors...</div>
                  ) : filteredVendors.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">No vendors found</div>
                  ) : (
                    filteredVendors.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => handleVendorSelect(v)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-0"
                      >
                        <span className="text-gray-700">{v.vendorName}</span>
                        <span className="text-xs text-gray-400 ml-2">{v.mobileNumber}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-4">
            {/* Purchase Order */}
            <div className="relative" ref={poDropdownRef}>
              <label className="block text-sm text-gray-700 font-medium mb-1">
                Purchase Order<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={poSearch}
                onChange={(e) => {
                  setPoSearch(e.target.value);
                  setShowPODropdown(true);
                  setSelectedPO(null);
                  setItems([]);
                }}
                onFocus={() => setShowPODropdown(true)}
                placeholder="Select Purchase Order"
                disabled={!!editingGrnId}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
              />
              {showPODropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 max-h-48 overflow-y-auto">
                  {!selectedVendor ? (
                    <div className="px-4 py-3 text-sm text-gray-500">Select a vendor first</div>
                  ) : poLoading ? (
                    <div className="px-4 py-3 text-sm text-gray-500">Loading purchase orders...</div>
                  ) : filteredPOs.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">No approved purchase orders found for this vendor</div>
                  ) : (
                    filteredPOs.map((po) => (
                      <button
                        key={po.id}
                        onClick={() => handlePOSelect(po)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-0"
                      >
                        <span className="text-gray-700 font-medium">{po.poNo}</span>
                        <span className="text-xs text-gray-400 ml-2">{po.items.length} items</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {/* Invoice Number */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">Invoice Number</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Invoice Number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {/* Invoice Date */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {/* Remarks */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">Remarks</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Remarks"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-[#3d9a7e] text-white">
                  <th className="px-4 py-3 text-left w-12 text-xs font-semibold">-</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-24">Ordered Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-28">Received Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-24">Pending Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-20">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-28">Purchase Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-24">Tax</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold w-28">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <span className="text-orange-500 text-sm">
                        {loadingEdit
                          ? "Loading stock in record..."
                          : selectedPO
                            ? "No items in this Purchase Order"
                            : "Select a Purchase Order to view items"}
                      </span>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const taxAmt =
                      item.receivedQty * item.product.purchaseRate * (item.product.gstPercentage / 100);
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
                        <td className="px-4 py-3 text-sm text-gray-700">{item.orderedQty}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.receivedQty || ""}
                            onChange={(e) => handleReceivedQtyChange(item.id, e.target.value)}
                            min="0"
                            max={item.orderedQty}
                            className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.pendingQty}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.product.uom}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {formatCurrency(item.product.purchaseRate)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {item.product.gstPercentage}% ({formatCurrency(taxAmt)})
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-4 py-3 border-t border-gray-200 flex items-center gap-8">
            <div className="text-sm">
              <span className="font-semibold text-gray-700">Total Qty</span>
              <span className="ml-2 text-gray-600">{totalQuantity}</span>
            </div>
            <div className="text-sm">
              <span className="font-semibold text-gray-700">Tax</span>
              <span className="ml-2 text-gray-600">{formatCurrency(totalTax)}</span>
            </div>
            <div className="text-sm">
              <span className="font-semibold text-gray-700">Grand Total</span>
              <span className="ml-2 text-gray-600 font-bold">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Actions */}
      <div className="xl:flex-[3] bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-fit">
        <div className="space-y-4">
          {/* Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Stock In No.</span>
              <span className="text-sm font-medium text-gray-800">{stockInNo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Date</span>
              <span className="text-sm font-medium text-gray-800">
                {stockInDate
                  ? new Date(stockInDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Vendor</span>
              <span className="text-sm font-medium text-gray-800">
                {selectedVendor?.vendorName || "-"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Purchase Order</span>
              <span className="text-sm font-medium text-gray-800">
                {selectedPO?.poNo || "-"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Invoice Number</span>
              <span className="text-sm font-medium text-gray-800">{invoiceNumber || "-"}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total Items</span>
              <span className="text-sm font-medium text-gray-800">{items.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total Quantity</span>
              <span className="text-sm font-medium text-gray-800">{totalQuantity}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Tax</span>
              <span className="text-sm font-medium text-gray-800">{formatCurrency(totalTax)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-800">Grand Total</span>
              <span className="text-sm font-bold text-gray-800">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={items.length === 0 || saving || loadingEdit}
              className="flex-1 px-6 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingGrnId ? "Update" : "Save"}
            </button>
            <button
              onClick={handleClear}
              className="flex-1 px-6 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Keyboard shortcut badge */}
          <div className="flex justify-center pt-1">
            <span className="bg-blue-500 text-white text-xs font-medium px-4 py-1.5 rounded whitespace-nowrap">
              F1 – Save
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
