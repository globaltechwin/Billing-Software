"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Maximize2, Settings, X, Loader2, Printer } from "lucide-react";
import { StockInRecord } from "./data";

interface RawReceiptItem {
  id: number;
  orderedQty: number | string;
  receivedQty: number | string;
  pendingQty: number | string;
  product: {
    productName: string;
    unit: string | null;
    purchasePrice: number | string;
  };
}

interface RawReceipt {
  id: number;
  grnNumber: string;
  receiptDate: string;
  notes: string | null;
  status: string;
  vendor: { vendorName: string };
  purchaseOrder: { poNumber: string } | null;
  items: RawReceiptItem[];
}

export default function StockInListPage() {
  const router = useRouter();
  const [startDate, setStartDate] = useState("30/07/2026");
  const [endDate, setEndDate] = useState("30/07/2026");
  const [vendorFilter, setVendorFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [stockIns, setStockIns] = useState<StockInRecord[]>([]);
  const [filteredData, setFilteredData] = useState<StockInRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [printReceipt, setPrintReceipt] = useState<RawReceipt | null>(null);
  const [rawReceipts, setRawReceipts] = useState<RawReceipt[]>([]);
  const [printCompany, setPrintCompany] = useState<{
    companyName: string;
    gstNumber: string | null;
    address: string | null;
  } | null>(null);

  // Map GRN status to display status
  const mapGRNStatus = (
    status: string
  ): StockInRecord["status"] => {
    switch (status) {
      case "COMPLETED":
        return "Received";
      case "PARTIAL":
        return "Partial";
      case "CANCELLED":
        return "Cancelled";
      case "PENDING":
      default:
        return "Pending";
    }
  };

  const fetchStockIns = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/goods-receipts");
      const data = await res.json();
      if (data.success && data.receipts) {
        const mapped: StockInRecord[] = data.receipts.map(
          (r: Record<string, unknown>, index: number) => {
            const items = (r.items as Record<string, unknown>[]) || [];
            const totalQty = items.reduce(
              (sum: number, item: Record<string, unknown>) =>
                sum + Number(item.receivedQty || 0),
              0
            );
            const totalAmt = items.reduce(
              (sum: number, item: Record<string, unknown>) => {
                const product = item.product as Record<string, unknown> | undefined;
                return sum + Number(item.receivedQty || 0) * Number(product?.purchasePrice || 0);
              },
              0
            );
            return {
              id: String(r.id),
              sNo: index + 1,
              stockInNo: r.grnNumber as string,
              date: new Date(r.receiptDate as string).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }),
              vendorName: (r.vendor as Record<string, string>)?.vendorName || "",
              purchaseOrder:
                (r.purchaseOrder as Record<string, string> | null)?.poNumber || (r.purchaseOrder ? "" : "Direct"),
              totalItems: items.length,
              totalQuantity: totalQty,
              totalAmount: totalAmt,
              status: mapGRNStatus(r.status as string),
            };
          }
        );
        setStockIns(mapped);
        setFilteredData(mapped);
        setRawReceipts(data.receipts as RawReceipt[]);
        setPrintReceipt(null);
        setPrintCompany(null);
      } else {
        setError(data.error || "Failed to load stock in records");
      }
    } catch (err) {
      setError(
        "Failed to load stock in records: " +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStockIns();
  }, []);

  // Unique vendors and statuses from data
  const vendorList = [...new Set(stockIns.map((r) => r.vendorName))].sort();
  const branchList = ["Main Branch", "Second Branch"];
  const statusList = ["Pending", "Received", "Partial", "Cancelled"];

  // Parse DD/MM/YYYY to Date
  const parseDate = (dateStr: string): Date => {
    const [d, m, y] = dateStr.split("/").map(Number);
    return new Date(y, m - 1, d);
  };

  // Handle view report
  const handleViewReport = () => {
    let result = [...stockIns];
    if (startDate) {
      const start = parseDate(startDate);
      result = result.filter((r) => parseDate(r.date) >= start);
    }
    if (endDate) {
      const end = parseDate(endDate);
      result = result.filter((r) => parseDate(r.date) <= end);
    }
    if (vendorFilter) {
      result = result.filter((r) => r.vendorName === vendorFilter);
    }
    if (branchFilter) {
      result = result.filter(
        (r) => r.status === branchFilter || branchFilter === ""
      );
    }
    if (statusFilter) {
      result = result.filter((r) => r.status === statusFilter);
    }
    setFilteredData(result);
    setCurrentPage(1);
  };

  // Handle clear
  const handleClear = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    setStartDate(`${dd}/${mm}/${yyyy}`);
    setEndDate(`${dd}/${mm}/${yyyy}`);
    setVendorFilter("");
    setBranchFilter("");
    setStatusFilter("");
    setSearchQuery("");
    setFilteredData(stockIns);
    setCurrentPage(1);
  };

  // Search filter
  const searchFilteredData = searchQuery
    ? filteredData.filter(
        (r) =>
          r.stockInNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.purchaseOrder.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.status.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredData;

  // Pagination
  const totalPages = Math.ceil(searchFilteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = searchFilteredData.slice(
    startIndex,
    startIndex + entriesPerPage
  );

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Received":
        return "bg-emerald-100 text-emerald-700";
      case "Pending":
        return "bg-amber-100 text-amber-700";
      case "Partial":
        return "bg-blue-100 text-blue-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => amount.toFixed(2);

  // Edit - navigate to stock in form with edit param
  const handleEdit = (id: string) => {
    router.push(`/inventory/stock-in?edit=${id}`);
  };

  // Print - open print preview modal
  const handlePrint = (id: string) => {
    const raw = rawReceipts.find((r) => String(r.id) === id) || null;
    setPrintReceipt(raw);
    if (raw) {
      setPrintCompany(null);
      fetch("/api/company/settings")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.settings) {
            setPrintCompany({
              companyName: data.settings.companyName || "",
              gstNumber: data.settings.gstNumber || null,
              address: data.settings.address || null,
            });
          }
        })
        .catch(() => {});
    }
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Top Panel - Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Title Bar */}
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">
            Stock In List
          </h2>
          <div className="flex items-center gap-2">
            <button className="text-gray-500 hover:text-gray-700">
              <Maximize2 className="w-4 h-4" />
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <Settings className="w-4 h-4" />
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Content */}
        <div className="px-6 pt-6 pb-12 space-y-5">
          {/* Row 1: Dates + Branch */}
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 font-medium whitespace-nowrap">
                Start Date<span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate.split("/").reverse().join("-")}
                onChange={(e) => {
                  const [y, m, d] = e.target.value.split("-");
                  setStartDate(`${d}/${m}/${y}`);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 font-medium whitespace-nowrap">
                End Date<span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={endDate.split("/").reverse().join("-")}
                onChange={(e) => {
                  const [y, m, d] = e.target.value.split("-");
                  setEndDate(`${d}/${m}/${y}`);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 font-medium whitespace-nowrap">
                Branch
              </label>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">--Select Branch--</option>
                {branchList.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Vendor + Status + Buttons */}
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 font-medium whitespace-nowrap">
                Vendor
              </label>
              <select
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">--Select Vendor--</option>
                {vendorList.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 font-medium whitespace-nowrap">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">--Select Status--</option>
                {statusList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 ml-auto">
              <button
                onClick={handleViewReport}
                className="px-6 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                View Report
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

      {/* Bottom Panel - Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Controls */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200 flex-wrap gap-2">
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
              placeholder=""
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="bg-[#3d9a7e] text-white">
                <th className="px-4 py-3 text-left text-xs font-semibold">
                  S.NO
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold">
                  STOCK IN NO.
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold">
                  DATE
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold">
                  VENDOR
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold">
                  PURCHASE ORDER
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold">
                  TOTAL ITEMS
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold">
                  TOTAL QTY
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold">
                  TOTAL AMOUNT
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold">
                  STATUS
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-12 text-center text-sm text-gray-500"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-8 text-center text-sm text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No data available in table
                  </td>
                </tr>
              ) : (
                paginatedData.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {record.sNo}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                      {record.stockInNo}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {record.date}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {record.vendorName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {record.purchaseOrder}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {record.totalItems}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {record.totalQuantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatCurrency(record.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(record.id)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          Edit
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handlePrint(record.id)}
                          className="text-gray-600 hover:text-gray-800 text-xs font-medium"
                        >
                          Print
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <span className="text-sm text-gray-600">Total:</span>
            <div className="flex gap-8">
              <span className="text-sm font-semibold text-gray-700">
                {searchFilteredData.reduce(
                  (sum, r) => sum + r.totalQuantity,
                  0
                )}
              </span>
              <span className="text-sm font-semibold text-gray-700">
                {formatCurrency(
                  searchFilteredData.reduce(
                    (sum, r) => sum + r.totalAmount,
                    0
                  )
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm text-gray-600">
              Showing {searchFilteredData.length > 0 ? startIndex + 1 : 0} to{" "}
              {Math.min(
                startIndex + entriesPerPage,
                searchFilteredData.length
              )}{" "}
              of {searchFilteredData.length} entries
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Print Preview Modal */}
      {printReceipt && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex flex-col">
          <div className="no-print flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800">Stock In Print Preview</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Printer size={14} />
                Print
              </button>
              <button
                onClick={() => setPrintReceipt(null)}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                <X size={14} />
                Close
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-8 flex justify-center bg-gray-100">
            <div className="print-invoice-area">
              <div
                className="bg-white shadow-2xl mx-auto border border-gray-300"
                style={{ width: "440px", padding: "28px 32px", fontFamily: "'Courier New', Courier, monospace" }}
              >
                <div className="text-center" style={{ fontSize: "18px" }}>
                  <span className="font-bold">{printCompany?.companyName || "Stock In"}</span>
                </div>
                {printCompany?.address && (
                  <div className="text-center text-gray-600 mt-1 whitespace-pre-line" style={{ fontSize: "12px" }}>
                    {printCompany.address}
                  </div>
                )}
                {printCompany?.gstNumber && (
                  <div className="text-center text-gray-700 mt-1" style={{ fontSize: "12px" }}>
                    {printCompany.gstNumber}
                  </div>
                )}
                <div className="text-center mt-2" style={{ fontSize: "15px" }}>
                  <span className="font-bold">Stock In {printReceipt.grnNumber}</span>
                </div>

                <div className="mt-4 space-y-1" style={{ fontSize: "13px" }}>
                  <div className="flex justify-between">
                    <span>Date</span>
                    <span>
                      {new Date(printReceipt.receiptDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vendor</span>
                    <span>{printReceipt.vendor.vendorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PO No.</span>
                    <span>{printReceipt.purchaseOrder?.poNumber || "Direct"}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-400 my-4" />

                <div style={{ fontSize: "13px" }}>
                  <div className="flex font-bold pb-1">
                    <span className="flex-1">Item</span>
                    <span className="w-10 text-center">Ord</span>
                    <span className="w-10 text-center">Rec</span>
                    <span className="w-16 text-right">Amt</span>
                  </div>
                  {printReceipt.items.map((item, i) => (
                    <div key={i} className="flex items-center py-1.5 border-b border-dotted border-gray-300">
                      <span className="flex-1 truncate">{item.product.productName}</span>
                      <span className="w-10 text-center">{Number(item.orderedQty)}</span>
                      <span className="w-10 text-center">{Number(item.receivedQty)}</span>
                      <span className="w-16 text-right">
                        {(Number(item.receivedQty) * Number(item.product.purchasePrice || 0)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-gray-400 my-4" />

                <div style={{ fontSize: "13px" }}>
                  <div className="flex justify-between py-0.5">
                    <span>Total Items</span>
                    <span>{printReceipt.items.length}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Total Quantity</span>
                    <span>
                      {printReceipt.items.reduce((sum, i) => sum + Number(i.receivedQty), 0)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold mt-2 py-1" style={{ fontSize: "15px" }}>
                    <span>Total Amount</span>
                    <span>
                      {printReceipt.items
                        .reduce((sum, i) => sum + Number(i.receivedQty) * Number(i.product.purchasePrice || 0), 0)
                        .toFixed(2)}
                    </span>
                  </div>
                </div>

                {printReceipt.notes && (
                  <>
                    <div className="border-t border-dashed border-gray-400 my-4" />
                    <div style={{ fontSize: "12px" }} className="text-gray-600">
                      {printReceipt.notes}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
