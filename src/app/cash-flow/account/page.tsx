"use client";

import { useState, useMemo } from "react";
import { ChevronUp, Pencil, Trash2 } from "lucide-react";

interface CashAccount {
  id: string;
  sNo: number;
  accountId: string;
  accountName: string;
  accountType: "Cash" | "Bank";
  openingBalance: number;
  status: "Active" | "Inactive";
}

const initialAccounts: CashAccount[] = [
  { id: "1", sNo: 1, accountId: "2", accountName: "BOC BANK", accountType: "Bank", openingBalance: 0, status: "Active" },
  { id: "2", sNo: 2, accountId: "1", accountName: "Cash", accountType: "Cash", openingBalance: 1, status: "Active" },
];

const fmt = (v: number) => v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CashAccountPage() {
  const [accounts, setAccounts] = useState<CashAccount[]>(initialAccounts);
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [formCollapsed, setFormCollapsed] = useState(false);
  const [listCollapsed, setListCollapsed] = useState(false);

  const filteredData = useMemo(() => {
    let d = [...accounts];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      d = d.filter(r =>
        r.accountName.toLowerCase().includes(q) ||
        r.accountId.toLowerCase().includes(q) ||
        r.accountType.toLowerCase().includes(q)
      );
    }
    return d;
  }, [accounts, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const start = (currentPage - 1) * entriesPerPage;
  const paginated = filteredData.slice(start, start + entriesPerPage);

  const handleSave = () => {
    if (!accountName.trim()) {
      alert("Account Name is required.");
      return;
    }
    if (!accountType) {
      alert("Account Type is required.");
      return;
    }
    const balance = parseFloat(openingBalance) || 0;
    if (balance < 0) {
      alert("Opening Balance must be zero or greater.");
      return;
    }

    if (editId) {
      setAccounts(prev => prev.map(a =>
        a.id === editId
          ? { ...a, accountName: accountName.trim(), accountType: accountType as "Cash" | "Bank", openingBalance: balance }
          : a
      ));
    } else {
      const newId = String(accounts.length + 1);
      const newAccountId = String(accounts.length + 1);
      setAccounts(prev => [...prev, {
        id: newId,
        sNo: prev.length + 1,
        accountId: newAccountId,
        accountName: accountName.trim(),
        accountType: accountType as "Cash" | "Bank",
        openingBalance: balance,
        status: "Active",
      }]);
    }
    handleClear();
  };

  const handleClear = () => {
    setAccountName("");
    setAccountType("");
    setOpeningBalance("");
    setEditId(null);
  };

  const handleEdit = (acc: CashAccount) => {
    setAccountName(acc.accountName);
    setAccountType(acc.accountType);
    setOpeningBalance(String(acc.openingBalance));
    setEditId(acc.id);
    setFormCollapsed(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this account?")) {
      setAccounts(prev => prev.filter(a => a.id !== id));
    }
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Cash Account Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Cash Account</h2>
          <button onClick={() => setFormCollapsed(!formCollapsed)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
            <ChevronUp size={18} className={`transition-transform ${formCollapsed ? "rotate-180" : ""}`} />
          </button>
        </div>
        {!formCollapsed && (
          <div className="px-6 py-6">
            <div className="max-w-3xl">
              {/* Account Name */}
              <div className="flex items-center gap-4 mb-5">
                <label className="text-sm font-medium text-gray-700 w-[140px] text-right">Account Name*</label>
                <input type="text" value={accountName} onChange={e => setAccountName(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[420px]" />
              </div>

              {/* Account Type */}
              <div className="flex items-center gap-4 mb-5">
                <label className="text-sm font-medium text-gray-700 w-[140px] text-right">Account Type*</label>
                <select value={accountType} onChange={e => setAccountType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[280px]">
                  <option value="">--Select Type--</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank</option>
                </select>
              </div>

              {/* Opening Balance */}
              <div className="flex items-center gap-4 mb-6">
                <label className="text-sm font-medium text-gray-700 w-[140px] text-right">Opening Balance</label>
                <input type="number" value={openingBalance} onChange={e => setOpeningBalance(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[160px]" />
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 ml-[140px]">
                <button onClick={handleSave} className="px-6 py-2 bg-[#4caf85] text-white rounded-full text-sm font-medium hover:bg-[#3d9a7e]">Save</button>
                <button onClick={handleClear} className="px-6 py-2 bg-purple-500 text-white rounded-full text-sm font-medium hover:bg-purple-600">Clear</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cash Account List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Cash Account List</h2>
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
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-[#3d9a7e] text-white">
                    {["S.NO", "EDIT", "DELETE", "ACCOUNTID", "ACCOUNTNAME", "ACCOUNTTYPE", "OPENINGBALANCE", "STATUS"].map(h => (
                      <th key={h} className="px-3 py-3 text-center text-xs font-semibold whitespace-nowrap">{h} {h !== "EDIT" && h !== "DELETE" ? "↕" : ""}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">No data available in table</td>
                    </tr>
                  ) : (
                    paginated.map((r) => (
                      <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-3 text-sm text-center">{r.sNo}</td>
                        <td className="px-3 py-3 text-center">
                          <button onClick={() => handleEdit(r)} className="p-1 text-blue-500 hover:text-blue-700 rounded hover:bg-blue-50"><Pencil size={15} /></button>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button onClick={() => handleDelete(r.id)} className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50"><Trash2 size={15} /></button>
                        </td>
                        <td className="px-3 py-3 text-sm text-center font-medium">{r.accountId}</td>
                        <td className="px-3 py-3 text-sm text-center">{r.accountName}</td>
                        <td className="px-3 py-3 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${r.accountType === "Cash" ? "bg-green-100 text-green-700 border border-green-200" : "bg-blue-100 text-blue-700 border border-blue-200"}`}>{r.accountType}</span>
                        </td>
                        <td className="px-3 py-3 text-sm text-center">{fmt(r.openingBalance)}</td>
                        <td className="px-3 py-3 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${r.status === "Active" ? "bg-green-100 text-green-700 border border-green-200" : "bg-gray-100 text-gray-600 border border-gray-200"}`}>{r.status}</span>
                        </td>
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
                {totalPages > 0 && Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setCurrentPage(p)} className={`px-3 py-1 border rounded text-sm ${currentPage === p ? "bg-[#3d9a7e] text-white border-[#3d9a7e]" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}>{p}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50">Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
