"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Trash2, RotateCcw, Loader2, AlertTriangle, X } from "lucide-react";

interface HeldBillItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  qty: number;
  stock: number;
  remarks: string;
}

interface HeldBill {
  id: number;
  holdNumber: string;
  customerId: number | null;
  customerName: string | null;
  items: HeldBillItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  gstMode: string | null;
  gstRate: number | null;
  paymentMode: string | null;
  remarks: string | null;
  salesPerson: string | null;
  createdAt: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const date = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${date} ${time}`;
}

function formatCurrency(val: number): string {
  return `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function HeldBillsPage() {
  const router = useRouter();
  const [heldBills, setHeldBills] = useState<HeldBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchHeldBills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/held-bills");
      const data = await res.json();
      if (data.success) setHeldBills(data.heldBills);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeldBills();
  }, [fetchHeldBills]);

  const filtered = searchQuery
    ? heldBills.filter(
        (h) =>
          h.holdNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (h.customerName && h.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (h.remarks && h.remarks.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : heldBills;

  const handleResume = (bill: HeldBill) => {
    router.push(`/billing/billing?resume=${bill.id}`);
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/held-bills?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setHeldBills((prev) => prev.filter((h) => h.id !== id));
      }
    } catch {
      // silently fail
    } finally {
      setDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirm Delete</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this held bill? This cannot be undone.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-gray-800">Held Bills</h2>
            <span className="text-sm text-gray-500">({heldBills.length} total)</span>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by hold number, customer, remarks..."
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-80"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#3d9a7e] text-white">
                <th className="px-4 py-3 text-left text-xs font-semibold w-12">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">HOLD NO.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">DATE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">CUSTOMER</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">ITEMS</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">TOTAL</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">REMARKS</th>
                <th className="px-4 py-3 text-left text-xs font-semibold w-32">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading held bills...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                    {searchQuery ? "No matching held bills found" : "No held bills"}
                  </td>
                </tr>
              ) : (
                filtered.map((bill, index) => {
                  const itemCount = Array.isArray(bill.items) ? bill.items.length : 0;
                  return (
                    <tr key={bill.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">{bill.holdNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{formatDate(bill.createdAt)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{bill.customerName || "Walk-in"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{itemCount}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">{formatCurrency(bill.grandTotal)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">{bill.remarks || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleResume(bill)}
                            className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 text-xs font-medium"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Resume
                          </button>
                          <span className="text-gray-300">/</span>
                          <button
                            onClick={() => setDeleteConfirmId(bill.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-800 text-xs font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <span className="text-sm text-gray-600">
            {filtered.length} held bill{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
