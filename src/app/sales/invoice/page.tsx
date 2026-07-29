"use client";

import { useState, useMemo } from "react";
import { ChevronUp, Settings, X, FileEdit, Trash2, Printer } from "lucide-react";

interface InvoiceRecord {
  id: string;
  date: string;
  invoiceNo: string;
  companyName: string;
  status: "DRAFT" | "PENDING" | "PAID" | "CANCELLED";
  amount: number;
}

const sampleInvoices: InvoiceRecord[] = [
  { id: "1", date: "26/05/2026", invoiceNo: "INV-0010", companyName: "", status: "DRAFT", amount: 118000.00 },
];

export default function InvoicePage() {
  const [invoiceNoSearch, setInvoiceNoSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [showData, setShowData] = useState(true);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const uniqueInvoiceNos = useMemo(() => [...new Set(sampleInvoices.map((r) => r.invoiceNo))], []);
  const uniqueStatuses = ["DRAFT", "PENDING", "PAID", "CANCELLED"];

  const filteredData = useMemo(() => {
    let data = showData ? sampleInvoices : [];
    if (invoiceNoSearch) {
      data = data.filter((r) => r.invoiceNo === invoiceNoSearch);
    }
    if (statusFilter) {
      data = data.filter((r) => r.status === statusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (r) =>
          r.invoiceNo.toLowerCase().includes(q) ||
          r.companyName.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q)
      );
    }
    return data;
  }, [showData, invoiceNoSearch, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage);

  const handleSearch = () => {
    setShowData(true);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setInvoiceNoSearch("");
    setCustomerSearch("");
    setStatusFilter("");
    setSearchQuery("");
    setCurrentPage(1);
    setShowData(true);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(new Set(paginatedData.map((r) => r.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const formatCurrency = (val: number) =>
    val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: "bg-gray-100 text-gray-700 border border-gray-200",
      PENDING: "bg-yellow-100 text-yellow-700 border border-yellow-200",
      PAID: "bg-green-100 text-green-700 border border-green-200",
      CANCELLED: "bg-red-100 text-red-700 border border-red-200",
    };
    return styles[status] || styles.DRAFT;
  };

  const allSelected = paginatedData.length > 0 && paginatedData.every((r) => selectedRows.has(r.id));

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-gray-800">All Invoices</h2>
            <button className="px-4 py-1.5 bg-[#6b5ce7] text-white rounded-md text-sm font-medium hover:bg-[#5a4bd6] transition-colors">
              New F3
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
              <ChevronUp size={16} />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
              <Settings size={16} />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Invoice No</label>
            <div className="relative">
              <select
                value={invoiceNoSearch}
                onChange={(e) => setInvoiceNoSearch(e.target.value)}
                className="px-3 py-1.5 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none w-[200px]"
              >
                <option value="">--Search in Invoice No--</option>
                {uniqueInvoiceNos.map((no) => (
                  <option key={no} value={no}>{no}</option>
                ))}
              </select>
              {invoiceNoSearch && (
                <button
                  onClick={() => setInvoiceNoSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Customer</label>
            <div className="relative">
              <select
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="px-3 py-1.5 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none w-[220px]"
              >
                <option value="">--Search in Customer--</option>
              </select>
              {customerSearch && (
                <button
                  onClick={() => setCustomerSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none w-[160px]"
              >
                <option value="">--Status--</option>
                {uniqueStatuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {statusFilter && (
                <button
                  onClick={() => setStatusFilter("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 pb-5 flex items-center gap-3">
          <button
            onClick={handleSearch}
            className="px-5 py-2 bg-[#4caf85] text-white rounded-md text-sm font-medium hover:bg-[#3d9a7e] transition-colors"
          >
            Search
          </button>
          <button
            onClick={handleClear}
            className="px-5 py-2 bg-[#6b5ce7] text-white rounded-md text-sm font-medium hover:bg-[#5a4bd6] transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200">
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

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Search:</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowData(true);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-[#3d9a7e] text-white">
                <th className="px-3 py-3 text-center text-xs font-semibold w-[50px]">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">DATE ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">INVOICE NO. ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">COMPANY NAME ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">STATUS ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">AMOUNT ↕</div>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  <div className="flex items-center justify-center gap-1">EDIT / PRINT</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                    No data available in table
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row.id)}
                        onChange={() => handleSelectRow(row.id)}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.date}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center font-medium">{row.invoiceNo}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.companyName || "\u00A0"}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center font-medium">{formatCurrency(row.amount)}</td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1 text-blue-500 hover:text-blue-700 rounded hover:bg-blue-50" title="Edit">
                          <FileEdit size={15} />
                        </button>
                        <button className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50" title="Delete">
                          <Trash2 size={15} />
                        </button>
                        <button className="p-1 text-gray-600 hover:text-gray-800 rounded hover:bg-gray-100" title="Print">
                          <Printer size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-200">
          <div className="text-sm text-gray-700 font-medium mb-2">
            Total: <span className="ml-2">{formatCurrency(filteredData.reduce((s, r) => s + r.amount, 0))}</span>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Showing {filteredData.length > 0 ? startIndex + 1 : 0} to{" "}
            {Math.min(startIndex + entriesPerPage, filteredData.length)} of{" "}
            {filteredData.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {totalPages > 0 && Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded text-sm ${
                  currentPage === page
                    ? "bg-[#3d9a7e] text-white border-[#3d9a7e]"
                    : "border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
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
    </div>
  );
}
