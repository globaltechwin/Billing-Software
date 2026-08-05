"use client";

import { useState, useMemo, useEffect } from "react";
import { Trash2, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

interface InvoiceRecord {
  id: string; sNo: number; invoiceNo: string; documentType: string; gstType: string; customerName: string; status: string;
  issueDate: string; dueDate: string; total: number; paid: number;
  items: { id: string; item: string; description: string; unit: string; qty: number; rate: number; amount: number }[];
  discount: number; discountType: string; taxRate: number; notes: string; terms: string;
}

const ENTRIES_PER_PAGE = 50;
const statusColors: Record<string, string> = {
  Draft:"bg-gray-100 text-gray-700", Unpaid:"bg-red-100 text-red-700",
  Partial:"bg-yellow-100 text-yellow-700", Paid:"bg-green-100 text-green-700",
  Overdue:"bg-orange-100 text-orange-700", Cancelled:"bg-gray-200 text-gray-600",
};

export default function A4InvoiceListPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage] = useState(ENTRIES_PER_PAGE);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch("/api/accounting/invoices?limit=500")
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          const a4Only = json.invoices
            .filter((r: InvoiceRecord) => r.documentType === "A4 Bill")
            .map((r: InvoiceRecord, i: number) => ({ ...r, sNo: i + 1 }));
          setInvoices(a4Only);
        }
      })
      .catch(e => console.error("Failed to fetch invoices:", e));
  }, []);

  const filteredData = useMemo(() => {
    if (!searchQuery) return invoices;
    const q = searchQuery.toLowerCase();
    return invoices.filter(r =>
      r.invoiceNo.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q)
    );
  }, [invoices, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const start = (currentPage - 1) * entriesPerPage;
  const paginated = filteredData.slice(start, start + entriesPerPage);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    try {
      const res = await fetch(`/api/accounting/invoices?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setInvoices(prev => prev.filter(inv => inv.id !== id));
      } else {
        alert(json.error || "Failed to delete invoice.");
      }
    } catch (e) { console.error("Failed to delete invoice:", e); alert("Failed to delete invoice."); }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="w-full bg-white shadow-sm rounded-lg m-4">
        <div className="px-6 py-3 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">A4 Invoices ({filteredData.length})</h2>
            <input type="text" placeholder="Search invoices..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm w-64" />
          </div>
        </div>
        <div className="px-6 py-4">
          {paginated.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p>No A4 invoices found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Invoice #</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Customer</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Date</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Status</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Total</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((inv) => (
                      <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm font-medium text-gray-800">{inv.invoiceNo}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">{inv.customerName}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">{inv.issueDate}</td>
                        <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[inv.status] || "bg-gray-100 text-gray-600"}`}>{inv.status}</span></td>
                        <td className="px-3 py-2 text-sm text-right font-bold text-[#3d9a7e]">₹{Number(inv.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => router.push(`/accounting/a4-invoice?id=${inv.id}`)} className="p-1 text-gray-400 hover:text-blue-600"><Pencil size={14} /></button>
                            <button onClick={() => handleDelete(inv.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-500">Showing {(currentPage - 1) * entriesPerPage + 1}–{Math.min(currentPage * entriesPerPage, filteredData.length)} of {filteredData.length}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50">Prev</button>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50">Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
