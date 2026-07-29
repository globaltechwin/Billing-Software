"use client";

import { useState, useMemo } from "react";
import { sampleVendors } from "@/components/vendor/data";

interface VendorPaymentRow {
  id: string;
  sNo: number;
  vendorName: string;
  date: string;
  type: string;
  mode: string;
  chequeNumber: string;
  amount: number;
  remarks: string;
  createdBy: string;
  createdDate: string;
}

const samplePayments: VendorPaymentRow[] = [
  { id: "1", sNo: 1, vendorName: "Rajesh kumar", date: "28/07/2026", type: "Payment", mode: "CASH", chequeNumber: "", amount: 5000.00, remarks: "Partial payment for July order", createdBy: "admin", createdDate: "28/07/2026" },
  { id: "2", sNo: 2, vendorName: "Arasu", date: "28/07/2026", type: "Credit", mode: "UPI", chequeNumber: "UPI-TXN-20260728", amount: 12000.00, remarks: "Credit against INV-202", createdBy: "admin", createdDate: "28/07/2026" },
  { id: "3", sNo: 3, vendorName: "MadhuAshwath", date: "27/07/2026", type: "Payment", mode: "CARD", chequeNumber: "CARD-4521", amount: 8500.00, remarks: "Full payment", createdBy: "manager1", createdDate: "27/07/2026" },
  { id: "4", sNo: 4, vendorName: "Fresh Foods Ltd", date: "27/07/2026", type: "Payment", mode: "CASH", chequeNumber: "", amount: 3200.00, remarks: "Vegetable supply payment", createdBy: "admin", createdDate: "27/07/2026" },
  { id: "5", sNo: 5, vendorName: "Spice World", date: "26/07/2026", type: "Credit", mode: "Wallet", chequeNumber: "WLT-8812", amount: 6000.00, remarks: "Wallet credit for spices", createdBy: "admin", createdDate: "26/07/2026" },
  { id: "6", sNo: 6, vendorName: "Grain Traders", date: "26/07/2026", type: "Payment", mode: "UPI", chequeNumber: "UPI-TXN-20260726", amount: 4500.00, remarks: "Grain supply partial", createdBy: "manager1", createdDate: "26/07/2026" },
];

export default function VendorPaymentPage() {
  const today = new Date().toISOString().split("T")[0];
  const [transactionDate, setTransactionDate] = useState(today);
  const [transactionType, setTransactionType] = useState("Credit");
  const [vendor, setVendor] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportData, setReportData] = useState<VendorPaymentRow[]>([]);

  const filteredData = useMemo(() => {
    if (!searchQuery) return reportData;
    const q = searchQuery.toLowerCase();
    return reportData.filter((r) => r.vendorName.toLowerCase().includes(q) || r.type.toLowerCase().includes(q) || r.mode.toLowerCase().includes(q) || r.chequeNumber.toLowerCase().includes(q) || r.remarks.toLowerCase().includes(q));
  }, [reportData, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage);
  const totalAmount = useMemo(() => filteredData.reduce((sum, r) => sum + r.amount, 0), [filteredData]);

  const selectedVendorName = sampleVendors.find((v) => v.id === vendor)?.vendorName || "";
  const balanceDue = useMemo(() => {
    if (!selectedVendorName) return 0;
    return reportData.filter((r) => r.vendorName === selectedVendorName && r.type === "Credit").reduce((sum, r) => sum + r.amount, 0);
  }, [reportData, selectedVendorName]);

  const resetForm = () => {
    setTransactionDate(today);
    setTransactionType("Credit");
    setVendor("");
    setPaymentMode("CASH");
    setAmount("");
    setRemarks("");
    setEditingId(null);
  };

  const handleSave = () => {
    if (!vendor || !amount || parseFloat(amount) <= 0) { alert("Please fill all required fields"); return; }
    const vName = sampleVendors.find((v) => v.id === vendor)?.vendorName || "";
    if (editingId) {
      setReportData((prev) => prev.map((r) => r.id === editingId ? { ...r, vendorName: vName, date: transactionDate, type: transactionType, mode: paymentMode, amount: parseFloat(amount), remarks } : r));
    } else {
      const newRow: VendorPaymentRow = { id: String(Date.now()), sNo: reportData.length + 1, vendorName: vName, date: transactionDate, type: transactionType, mode: paymentMode, chequeNumber: paymentMode === "CASH" ? "" : `${paymentMode}-${Date.now()}`, amount: parseFloat(amount), remarks, createdBy: "admin", createdDate: today };
      setReportData((prev) => [newRow, ...prev]);
    }
    resetForm();
  };

  const handleEdit = (row: VendorPaymentRow) => {
    const ven = sampleVendors.find((v) => v.vendorName === row.vendorName);
    setEditingId(row.id);
    setTransactionDate(row.date.split("/").reverse().join("-"));
    setTransactionType(row.type);
    setVendor(ven?.id || "");
    setPaymentMode(row.mode);
    setAmount(String(row.amount));
    setRemarks(row.remarks);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this payment?")) return;
    setReportData((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="flex gap-4">
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-[#f2f5f9] px-6 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">Vendor Payment</h2>
            <button className="p-1 text-gray-400 hover:text-gray-600"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg></button>
          </div>
          <div className="px-6 py-5 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 w-36 text-right">Transaction Date*</label>
              <input type="date" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-[200px]" />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 w-36 text-right">Transaction Type*</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="transactionType" value="Credit" checked={transactionType === "Credit"} onChange={() => setTransactionType("Credit")} className="w-3.5 h-3.5 text-blue-600" /><span className="text-sm text-gray-700">Credit</span></label>
                <label className="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="transactionType" value="Payment" checked={transactionType === "Payment"} onChange={() => setTransactionType("Payment")} className="w-3.5 h-3.5 text-blue-600" /><span className="text-sm text-gray-700">Payment</span></label>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 w-36 text-right">Vendor*</label>
              <select value={vendor} onChange={(e) => setVendor(e.target.value)} className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">--Select Vendor--</option>
                {sampleVendors.map((v) => (<option key={v.id} value={v.id}>{v.vendorName}</option>))}
              </select>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 w-36 text-right">Payment Modes*</label>
              <div className="flex items-center gap-4">
                {["CASH", "CARD", "UPI", "Wallet"].map((mode) => (
                  <label key={mode} className="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="paymentMode" value={mode} checked={paymentMode === mode} onChange={() => setPaymentMode(mode)} className="w-3.5 h-3.5 text-blue-600" /><span className="text-sm text-gray-700">{mode}</span></label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 w-36 text-right">Amount*</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="0" step="0.01" className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-[200px]" />
            </div>
            <div className="flex items-start gap-4">
              <label className="text-sm font-medium text-gray-700 w-36 text-right pt-1">Remarks (500 max) :</label>
              <textarea value={remarks} onChange={(e) => setRemarks(e.target.value.slice(0, 500))} rows={4} className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" />
            </div>
            <div className="flex items-center gap-3 pl-36">
              <button onClick={handleSave} className="px-6 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-colors">{editingId ? "Update" : "Save"}</button>
              <button onClick={resetForm} className="px-6 py-2 bg-teal-500 text-white rounded-md text-sm font-medium hover:bg-teal-600 transition-colors">Clear</button>
              <button onClick={() => { setReportData(samplePayments); setCurrentPage(1); }} className="px-6 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors">Search</button>
            </div>
          </div>
        </div>
        <div className="w-[280px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-shrink-0">
          <div className="px-6 py-8 flex flex-col items-center justify-center h-full">
            <div className="bg-[#4caf85] text-white px-6 py-2 rounded-md text-sm font-medium mb-4">Balance Due</div>
            <div className="text-2xl font-bold text-gray-800">{selectedVendorName ? balanceDue.toFixed(2) : "0.00"}</div>
            {selectedVendorName && (<div className="text-xs text-gray-500 mt-1">{selectedVendorName}</div>)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Payment List</h2>
          <button className="p-1 text-gray-400 hover:text-gray-600"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg></button>
        </div>
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show</span>
            <select value={entriesPerPage} onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }} className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600">entries</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Search:</span>
            <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="bg-[#3d9a7e] text-white">
                <th className="px-3 py-3 text-center text-xs font-semibold">S.NO</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">EDIT / DELETE</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">VENDOR NAME</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">DATE</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">TYPE</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">MODE</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">CHEQUE NUMBER</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">AMOUNT</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">REMARKS</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">CREATED BY</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">CREATED DATE</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr><td colSpan={11} className="px-4 py-8 text-center text-sm text-gray-500">No data available in table</td></tr>
              ) : (
                paginatedData.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.sNo}</td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleEdit(row)} className="text-blue-500 hover:text-blue-700 text-xs underline">Edit</button>
                        <span className="text-gray-400">/</span>
                        <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-700 text-xs underline">Delete</button>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center font-medium">{row.vendorName}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.date}</td>
                    <td className="px-3 py-3 text-center"><span className={`text-xs px-2 py-1 rounded-full font-medium ${row.type === "Credit" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>{row.type}</span></td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.mode}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.chequeNumber}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center font-medium">{row.amount.toFixed(2)}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.remarks}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.createdBy}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.createdDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-600">Showing {filteredData.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + entriesPerPage, filteredData.length)} of {filteredData.length} entries</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}