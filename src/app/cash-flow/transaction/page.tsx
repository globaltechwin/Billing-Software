"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

interface CashTxn {
  id: string;
  sNo: number;
  tranId: string;
  tranDate: string;
  tranType: "Cash In" | "Cash Out";
  categoryName: string;
  accountName: string;
  payMode: "Cash" | "UPI" | "Card" | "Bank";
  party: string;
  refNo: string;
  amount: number;
  remarks: string;
  createdDate: string;
}

const sampleTxns: CashTxn[] = [];

const categories = ["Sales", "Purchase", "Salary", "Rent", "Utilities", "Refund", "Donation", "Other"];
const accounts = ["Main Cash", "Bank Account", "Petty Cash", "Salary Account"];

export default function CashTransactionPage() {
  const [txnType, setTxnType] = useState<"Cash In" | "Cash Out">("Cash In");
  const [txnDate, setTxnDate] = useState("2026-07-29");
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("");
  const [payMode, setPayMode] = useState<"Cash" | "UPI" | "Card" | "Bank">("Cash");
  const [amount, setAmount] = useState("");
  const [partyName, setPartyName] = useState("");
  const [refNo, setRefNo] = useState("");
  const [remarks, setRemarks] = useState("");

  const [searchFromDate, setSearchFromDate] = useState("2026-07-29");
  const [searchToDate, setSearchToDate] = useState("2026-07-29");
  const [searchType, setSearchType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [formCollapsed, setFormCollapsed] = useState(false);
  const [listCollapsed, setListCollapsed] = useState(false);

  const filteredData = useMemo(() => {
    let d = [...sampleTxns];
    if (searchType !== "All") d = d.filter(r => r.tranType === searchType);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      d = d.filter(r =>
        r.tranId.toLowerCase().includes(q) ||
        r.refNo.toLowerCase().includes(q) ||
        r.party.toLowerCase().includes(q) ||
        r.categoryName.toLowerCase().includes(q) ||
        r.accountName.toLowerCase().includes(q) ||
        r.remarks.toLowerCase().includes(q)
      );
    }
    return d;
  }, [searchType, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const start = (currentPage - 1) * entriesPerPage;
  const paginated = filteredData.slice(start, start + entriesPerPage);

  const fmt = (v: number) => v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleSave = () => {
    if (!category || !account || !amount) {
      alert("Please fill all required fields.");
      return;
    }
    alert(`Transaction saved: ${txnType} - ${fmt(Number(amount))}`);
    handleClear();
  };

  const handleClear = () => {
    setTxnType("Cash In");
    setTxnDate("2026-07-29");
    setCategory("");
    setAccount("");
    setPayMode("Cash");
    setAmount("");
    setPartyName("");
    setRefNo("");
    setRemarks("");
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      alert(`Transaction ${id} deleted.`);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Cash Transaction Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Cash Transaction</h2>
          <button onClick={() => setFormCollapsed(!formCollapsed)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
            <ChevronUp size={18} className={`transition-transform ${formCollapsed ? "rotate-180" : ""}`} />
          </button>
        </div>
        {!formCollapsed && (
          <div className="px-6 py-6">
            <div className="max-w-3xl">
              {/* Transaction Type */}
              <div className="flex items-center gap-4 mb-5">
                <label className="text-sm font-medium text-gray-700 w-[160px] text-right">Transaction Type*</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setTxnType("Cash In")} className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium border transition-colors ${txnType === "Cash In" ? "bg-[#4caf85] text-white border-[#4caf85]" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>
                    <ArrowDownCircle size={14} /> Cash In
                  </button>
                  <button onClick={() => setTxnType("Cash Out")} className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium border transition-colors ${txnType === "Cash Out" ? "bg-[#4caf85] text-white border-[#4caf85]" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>
                    <ArrowUpCircle size={14} /> Cash Out
                  </button>
                </div>
              </div>

              {/* Transaction Date */}
              <div className="flex items-center gap-4 mb-5">
                <label className="text-sm font-medium text-gray-700 w-[160px] text-right">Transaction Date*</label>
                <input type="date" value={txnDate} onChange={e => setTxnDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[220px]" />
              </div>

              {/* Category */}
              <div className="flex items-center gap-4 mb-5">
                <label className="text-sm font-medium text-gray-700 w-[160px] text-right">Category*</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[420px]">
                  <option value="">--Select Category--</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Account */}
              <div className="flex items-center gap-4 mb-5">
                <label className="text-sm font-medium text-gray-700 w-[160px] text-right">Account*</label>
                <select value={account} onChange={e => setAccount(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[420px]">
                  <option value="">--Select Account--</option>
                  {accounts.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              {/* Pay Mode */}
              <div className="flex items-center gap-4 mb-5">
                <label className="text-sm font-medium text-gray-700 w-[160px] text-right">Pay Mode</label>
                <div className="flex items-center gap-2">
                  {(["Cash", "UPI", "Card", "Bank"] as const).map(mode => (
                    <button key={mode} onClick={() => setPayMode(mode)} className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors ${payMode === mode ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div className="flex items-center gap-4 mb-5">
                <label className="text-sm font-medium text-gray-700 w-[160px] text-right">Amount*</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="" className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[220px]" />
              </div>

              {/* Party Name */}
              <div className="flex items-center gap-4 mb-5">
                <label className="text-sm font-medium text-gray-700 w-[160px] text-right">Party Name</label>
                <input type="text" value={partyName} onChange={e => setPartyName(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[420px]" />
              </div>

              {/* Reference No. */}
              <div className="flex items-center gap-4 mb-5">
                <label className="text-sm font-medium text-gray-700 w-[160px] text-right">Reference No.</label>
                <input type="text" value={refNo} onChange={e => setRefNo(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[320px]" />
              </div>

              {/* Remarks */}
              <div className="flex items-start gap-4 mb-6">
                <label className="text-sm font-medium text-gray-700 w-[160px] text-right mt-2">Remarks (500 max):</label>
                <textarea value={remarks} onChange={e => setRemarks(e.target.value)} maxLength={500} rows={4} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[520px] resize-none" />
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 ml-[160px]">
                <button onClick={handleSave} className="px-6 py-2 bg-[#4caf85] text-white rounded-full text-sm font-medium hover:bg-[#3d9a7e]">Save</button>
                <button onClick={handleClear} className="px-6 py-2 bg-purple-500 text-white rounded-full text-sm font-medium hover:bg-purple-600">Clear</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Search</h2>
        </div>
        <div className="px-6 py-5 flex items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">From Date</label>
            <div className="relative">
              <input type="date" value={searchFromDate} onChange={e => setSearchFromDate(e.target.value)} className="px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[180px]" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">To Date</label>
            <div className="relative">
              <input type="date" value={searchToDate} onChange={e => setSearchToDate(e.target.value)} className="px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[180px]" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Type</label>
            <select value={searchType} onChange={e => setSearchType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[160px]">
              <option value="All">All</option>
              <option value="Cash In">Cash In</option>
              <option value="Cash Out">Cash Out</option>
            </select>
          </div>
          <button onClick={handleSearch} className="px-6 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600">Search</button>
        </div>
      </div>

      {/* Cash Transaction List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Cash Transaction List</h2>
          <button onClick={() => setListCollapsed(!listCollapsed)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
            <ChevronUp size={18} className={`transition-transform ${listCollapsed ? "rotate-180" : ""}`} />
          </button>
        </div>
        {!listCollapsed && (
          <>
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show</span>
                <select value={entriesPerPage} onChange={e => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }} className="px-2 py-1 border border-gray-300 rounded-md text-sm">
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-600">entries</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Search:</span>
                <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead>
                  <tr className="bg-[#3d9a7e] text-white">
                    {["S.NO", "EDIT / DELETE", "TRANID", "TRANDATE", "TRANTYPE", "CATEGORYNAME", "ACCOUNTNAME", "PAYMODE", "PARTY", "REFNO", "AMOUNT", "REMARKS", "CREATEDDATE"].map(h => (
                      <th key={h} className="px-3 py-3 text-center text-xs font-semibold whitespace-nowrap">{h} {h !== "EDIT / DELETE" ? "↕" : ""}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="px-4 py-8 text-center text-sm text-gray-500">No data available in table</td>
                    </tr>
                  ) : (
                    paginated.map((r, idx) => (
                      <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-3 text-sm text-center">{start + idx + 1}</td>
                        <td className="px-3 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded hover:bg-amber-200">Edit</button>
                            <button onClick={() => handleDelete(r.id)} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">Delete</button>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm text-center font-medium">{r.tranId}</td>
                        <td className="px-3 py-3 text-sm text-center">{r.tranDate}</td>
                        <td className="px-3 py-3 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${r.tranType === "Cash In" ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>{r.tranType}</span>
                        </td>
                        <td className="px-3 py-3 text-sm text-center">{r.categoryName}</td>
                        <td className="px-3 py-3 text-sm text-center">{r.accountName}</td>
                        <td className="px-3 py-3 text-sm text-center">{r.payMode}</td>
                        <td className="px-3 py-3 text-sm text-center">{r.party}</td>
                        <td className="px-3 py-3 text-sm text-center">{r.refNo}</td>
                        <td className={`px-3 py-3 text-sm text-center font-medium ${r.tranType === "Cash In" ? "text-green-600" : "text-red-600"}`}>{fmt(r.amount)}</td>
                        <td className="px-3 py-3 text-sm text-center max-w-[120px] truncate">{r.remarks}</td>
                        <td className="px-3 py-3 text-sm text-center">{r.createdDate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-600">Showing {filteredData.length > 0 ? start + 1 : 0} to {Math.min(start + entriesPerPage, filteredData.length)} of {filteredData.length} entries</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50">Previous</button>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50">Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
