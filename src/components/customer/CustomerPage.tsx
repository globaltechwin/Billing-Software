"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronUp, ChevronDown, Loader2, Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Customer, CUSTOMER_TYPES } from "./data";

function downloadCsv(headers: string[], rows: (string | number)[][], filename: string) {
  const lines = [headers.join(",")];
  rows.forEach((row) => lines.push(row.map((v) => `"${v}"`).join(",")));
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function SortIcon({ column, sortBy, sortOrder }: { column: string; sortBy: string; sortOrder: string }) {
  if (sortBy !== column) return <ArrowUpDown size={12} className="ml-1 text-white/60 inline" />;
  return sortOrder === "asc"
    ? <ArrowUp size={12} className="ml-1 text-white inline" />
    : <ArrowDown size={12} className="ml-1 text-white inline" />;
}

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-700 font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [editId, setEditId] = useState<number | null>(null);

  const [showCustomerInfo, setShowCustomerInfo] = useState(true);
  const [showCustomerList, setShowCustomerList] = useState(true);

  // Basic Information
  const [customerCode, setCustomerCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [alternateMobile, setAlternateMobile] = useState("");
  const [email, setEmail] = useState("");

  // GST Details
  const [gstin, setGstin] = useState("");
  const [pan, setPan] = useState("");

  // Address
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("Tamil Nadu");
  const [country, setCountry] = useState("India");
  const [pincode, setPincode] = useState("");

  // Business Information
  const [customerType, setCustomerType] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [creditDays, setCreditDays] = useState("");
  const [priceList, setPriceList] = useState("");

  // Other
  const [isActive, setIsActive] = useState(true);
  const [remarks, setRemarks] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [codeFilter, setCodeFilter] = useState("");
  const [mobileFilter, setMobileFilter] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [formError, setFormError] = useState("");

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", String(entriesPerPage));
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      if (statusFilter) params.set("status", statusFilter);
      if (cityFilter) params.set("city", cityFilter);
      if (nameFilter) params.set("customerName", nameFilter);
      if (codeFilter) params.set("customerCode", codeFilter);
      if (mobileFilter) params.set("mobile", mobileFilter);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/customers?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.customers) {
        const formatted = data.customers.map((c: Record<string, unknown>) => ({
          ...c,
          createdByName: (c.createdByUser as Record<string, unknown>)?.name || "",
          updatedByName: (c.updatedByUser as Record<string, unknown>)?.name || "",
        }));
        setCustomers(formatted);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [currentPage, entriesPerPage, statusFilter, cityFilter, nameFilter, codeFilter, mobileFilter, searchQuery, sortBy, sortOrder]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCustomers();
  }, [fetchCustomers]);

  const totalPages = Math.ceil(totalCount / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;

  const showSuccessToast = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleSave = async () => {
    if (!customerName.trim()) {
      setFormError("Customer Name is required");
      return;
    }
    if (!mobile.trim()) {
      setFormError("Mobile Number is required");
      return;
    }
    setFormError("");
    setSaving(true);

    try {
      const body: Record<string, unknown> = {
        customerName: customerName.trim(),
        phone: mobile.trim(),
        alternatePhone: alternateMobile.trim() || null,
        email: email.trim() || null,
        gstNumber: gstin.trim() || null,
        panNumber: pan.trim() || null,
        address: addressLine1.trim() || null,
        addressLine2: addressLine2.trim() || null,
        city: city.trim() || null,
        stateName: stateName.trim() || "Tamil Nadu",
        stateCode: "33",
        country: country.trim() || "India",
        pincode: pincode.trim() || null,
        customerType: customerType || "INDIVIDUAL",
        creditLimit: creditLimit || "0",
        creditDays: creditDays || "0",
        priceList: priceList.trim() || null,
        remarks: remarks.trim() || null,
        isActive,
      };

      if (editId) {
        body.id = editId;
        const res = await fetch("/api/customers", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update customer");
        showSuccessToast("Customer updated successfully!");
      } else {
        const res = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create customer");
        showSuccessToast("Customer saved successfully!");
      }

      handleClear();
      fetchCustomers();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setCustomerCode("");
    setCustomerName("");
    setMobile("");
    setAlternateMobile("");
    setEmail("");
    setGstin("");
    setPan("");
    setAddressLine1("");
    setAddressLine2("");
    setCity("");
    setStateName("Tamil Nadu");
    setCountry("India");
    setPincode("");
    setCustomerType("");
    setCreditLimit("");
    setCreditDays("");
    setPriceList("");
    setIsActive(true);
    setRemarks("");
    setEditId(null);
    setFormError("");
  };

  const handleEdit = (customer: Customer) => {
    setCustomerCode(customer.customerCode || "");
    setCustomerName(customer.customerName);
    setMobile(customer.phone);
    setAlternateMobile(customer.alternatePhone || "");
    setEmail(customer.email || "");
    setGstin(customer.gstNumber || "");
    setPan(customer.panNumber || "");
    setAddressLine1(customer.address || "");
    setAddressLine2(customer.addressLine2 || "");
    setCity(customer.city || "");
    setStateName(customer.stateName || "Tamil Nadu");
    setCountry(customer.country || "India");
    setPincode(customer.pincode || "");
    setCustomerType(customer.customerType);
    setCreditLimit(customer.creditLimit);
    setCreditDays(String(customer.creditDays));
    setPriceList(customer.priceList || "");
    setIsActive(customer.isActive);
    setRemarks(customer.remarks || "");
    setEditId(customer.id);
    setShowCustomerInfo(true);
  };

  const handleToggleStatus = async (customer: Customer) => {
    try {
      const res = await fetch("/api/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: customer.id, isActive: !customer.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");
      showSuccessToast(`Customer ${customer.isActive ? "deactivated" : "activated"} successfully!`);
      fetchCustomers();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/customers?id=${deleteConfirm.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete customer");
      showSuccessToast("Customer deleted successfully!");
      setDeleteConfirm(null);
      fetchCustomers();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete");
      setDeleteConfirm(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const handleExportCsv = () => {
    if (customers.length === 0) return;
    const headers = [
      "CUSTOMER CODE", "CUSTOMER NAME", "MOBILE", "GSTIN", "CITY",
      "CREDIT LIMIT", "OUTSTANDING BALANCE", "STATUS", "CREATED DATE",
    ];
    const rows = customers.map((c) => [
      c.customerCode || "-",
      c.customerName,
      c.phone,
      c.gstNumber || "-",
      c.city || "-",
      c.creditLimit,
      (c.outstandingBalance ?? 0).toFixed(2),
      c.isActive ? "Active" : "Inactive",
      formatDate(c.createdAt),
    ]);
    downloadCsv(headers, rows, "Customers.csv");
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          {successMessage}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirm Delete</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-medium">{deleteConfirm.name}</span>?
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {viewCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Customer Details</h3>
              <button onClick={() => setViewCustomer(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-4">
                <div><span className="text-gray-500">Customer Code:</span><br /><span className="font-medium">{viewCustomer.customerCode || "-"}</span></div>
                <div><span className="text-gray-500">Status:</span><br />
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium inline-block mt-1 ${
                    viewCustomer.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  }`}>{viewCustomer.isActive ? "Active" : "Inactive"}</span>
                </div>
                <div><span className="text-gray-500">Customer Type:</span><br /><span className="font-medium">{viewCustomer.customerType || "-"}</span></div>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Basic Information</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div><span className="text-gray-500">Customer Name:</span><br /><span className="font-medium">{viewCustomer.customerName}</span></div>
                  <div><span className="text-gray-500">Mobile:</span><br /><span className="font-medium">{viewCustomer.phone}</span></div>
                  <div><span className="text-gray-500">Alternate Mobile:</span><br /><span className="font-medium">{viewCustomer.alternatePhone || "-"}</span></div>
                  <div><span className="text-gray-500">Email:</span><br /><span className="font-medium">{viewCustomer.email || "-"}</span></div>
                  <div><span className="text-gray-500">Credit Limit:</span><br /><span className="font-medium">{viewCustomer.creditLimit}</span></div>
                  <div><span className="text-gray-500">Credit Days:</span><br /><span className="font-medium">{viewCustomer.creditDays}</span></div>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">GST Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-gray-500">GSTIN:</span><br /><span className="font-medium">{viewCustomer.gstNumber || "-"}</span></div>
                  <div><span className="text-gray-500">PAN:</span><br /><span className="font-medium">{viewCustomer.panNumber || "-"}</span></div>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Address</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-3"><span className="text-gray-500">Address:</span><br /><span className="font-medium">{viewCustomer.address || "-"}</span></div>
                  {viewCustomer.addressLine2 && (
                    <div className="col-span-3"><span className="text-gray-500">Address Line 2:</span><br /><span className="font-medium">{viewCustomer.addressLine2}</span></div>
                  )}
                  <div><span className="text-gray-500">City:</span><br /><span className="font-medium">{viewCustomer.city || "-"}</span></div>
                  <div><span className="text-gray-500">State:</span><br /><span className="font-medium">{viewCustomer.stateName}</span></div>
                  <div><span className="text-gray-500">Country:</span><br /><span className="font-medium">{viewCustomer.country}</span></div>
                  <div><span className="text-gray-500">Pincode:</span><br /><span className="font-medium">{viewCustomer.pincode || "-"}</span></div>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3 grid grid-cols-3 gap-4">
                <div><span className="text-gray-500">Price List:</span><br /><span className="font-medium">{viewCustomer.priceList || "-"}</span></div>
                <div><span className="text-gray-500">Outstanding Balance:</span><br /><span className="font-medium">{(viewCustomer.outstandingBalance ?? 0).toFixed(2)}</span></div>
                <div><span className="text-gray-500">Created Date:</span><br /><span className="font-medium">{formatDate(viewCustomer.createdAt)}</span></div>
                <div><span className="text-gray-500">Created By:</span><br /><span className="font-medium">{viewCustomer.createdByName || "-"}</span></div>
                <div><span className="text-gray-500">Updated By:</span><br /><span className="font-medium">{viewCustomer.updatedByName || "-"}</span></div>
              </div>
              {viewCustomer.remarks && (
                <div className="border-t border-gray-100 pt-3">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Remarks</h4>
                  <p className="font-medium">{viewCustomer.remarks}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setViewCustomer(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Customer Info.</h2>
          <div className="flex items-center gap-3">
            <button className="bg-amber-500 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-amber-600 transition-colors">
              Employee Sync
            </button>
            <button
              onClick={() => setShowCustomerInfo(!showCustomerInfo)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showCustomerInfo ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {showCustomerInfo && (
          <div className="p-6 space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">{formError}</div>
            )}

            {/* Basic Information */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Basic Information</h4>
              <div className="grid grid-cols-2 gap-6 max-w-4xl">
                <FormField label="Customer Code">
                  <input
                    type="text"
                    value={customerCode}
                    readOnly
                    placeholder="Auto-generated"
                    className={inputClass + " bg-gray-50"}
                  />
                </FormField>
                <FormField label="Customer Name" required>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={inputClass}
                  />
                </FormField>
                <FormField label="Mobile Number" required>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className={inputClass}
                  />
                </FormField>
                <FormField label="Alternate Mobile Number">
                  <input
                    type="tel"
                    value={alternateMobile}
                    onChange={(e) => setAlternateMobile(e.target.value)}
                    className={inputClass}
                  />
                </FormField>
                <FormField label="Email Address">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </FormField>
              </div>
            </div>

            {/* GST Details */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">GST Details</h4>
              <div className="grid grid-cols-2 gap-6 max-w-4xl">
                <FormField label="GSTIN">
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    className={inputClass}
                  />
                </FormField>
                <FormField label="PAN Number">
                  <input
                    type="text"
                    value={pan}
                    onChange={(e) => setPan(e.target.value)}
                    className={inputClass}
                  />
                </FormField>
              </div>
            </div>

            {/* Address */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Address</h4>
              <div className="grid grid-cols-2 gap-6 max-w-4xl">
                <div className="col-span-2">
                  <FormField label="Address Line 1">
                    <input
                      type="text"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className={inputClass}
                    />
                  </FormField>
                </div>
                <div className="col-span-2">
                  <FormField label="Address Line 2">
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      className={inputClass}
                    />
                  </FormField>
                </div>
                <FormField label="City">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={inputClass}
                  />
                </FormField>
                <FormField label="State">
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className={inputClass}
                  />
                </FormField>
                <FormField label="Country">
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={inputClass}
                  />
                </FormField>
                <FormField label="Pincode">
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className={inputClass}
                  />
                </FormField>
              </div>
            </div>

            {/* Business Information */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Business Information</h4>
              <div className="grid grid-cols-2 gap-6 max-w-4xl">
                <FormField label="Customer Type">
                  <select
                    value={customerType}
                    onChange={(e) => setCustomerType(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">--Select Customer Type--</option>
                    {CUSTOMER_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Credit Limit">
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    min="0"
                    step="0.01"
                    className={inputClass}
                  />
                </FormField>
                <FormField label="Credit Days">
                  <input
                    type="number"
                    value={creditDays}
                    onChange={(e) => setCreditDays(e.target.value)}
                    min="0"
                    className={inputClass}
                  />
                </FormField>
                <FormField label="Price List">
                  <input
                    type="text"
                    value={priceList}
                    onChange={(e) => setPriceList(e.target.value)}
                    className={inputClass}
                  />
                </FormField>
              </div>
            </div>

            {/* Other */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Other</h4>
              <div className="grid grid-cols-2 gap-6 max-w-4xl">
                <FormField label="Status">
                  <select
                    value={isActive ? "active" : "inactive"}
                    onChange={(e) => setIsActive(e.target.value === "active")}
                    className={inputClass}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </FormField>
                <FormField label="Remarks">
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className={inputClass}
                  />
                </FormField>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editId ? "Update" : "Save"}
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

      {/* Customer List Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Customer List</h2>
          <button
            onClick={() => setShowCustomerList(!showCustomerList)}
            className="text-gray-500 hover:text-gray-700"
          >
            {showCustomerList ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        {showCustomerList && (
          <>
            {/* Filters */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Show</span>
                    <select
                      value={entriesPerPage}
                      onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-gray-600">entries</span>
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <input type="text" value={cityFilter} onChange={(e) => { setCityFilter(e.target.value); setCurrentPage(1); }} placeholder="City"
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[110px]" />
                  <input type="text" value={nameFilter} onChange={(e) => { setNameFilter(e.target.value); setCurrentPage(1); }} placeholder="Customer Name"
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[130px]" />
                  <input type="text" value={codeFilter} onChange={(e) => { setCodeFilter(e.target.value); setCurrentPage(1); }} placeholder="Customer Code"
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[120px]" />
                  <input type="text" value={mobileFilter} onChange={(e) => { setMobileFilter(e.target.value); setCurrentPage(1); }} placeholder="Mobile"
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[110px]" />
                  <div className="flex items-center gap-2 ml-2">
                    <button onClick={handleExportCsv} className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-300 transition-colors">
                      Excel
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Search:</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead>
                  <tr className="bg-[#3d9a7e] text-white">
                    <th className="px-4 py-3 text-left text-xs font-semibold w-12">S.NO</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold w-32">ACTIONS</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none hover:bg-[#358a6e]" onClick={() => handleSort("customerCode")}>
                      CUSTOMER CODE <SortIcon column="customerCode" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none hover:bg-[#358a6e]" onClick={() => handleSort("customerName")}>
                      CUSTOMER NAME <SortIcon column="customerName" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none hover:bg-[#358a6e]" onClick={() => handleSort("phone")}>
                      MOBILE <SortIcon column="phone" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none hover:bg-[#358a6e]" onClick={() => handleSort("gstNumber")}>
                      GSTIN <SortIcon column="gstNumber" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none hover:bg-[#358a6e]" onClick={() => handleSort("city")}>
                      CITY <SortIcon column="city" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none hover:bg-[#358a6e]" onClick={() => handleSort("creditLimit")}>
                      CREDIT LIMIT <SortIcon column="creditLimit" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">OUTSTANDING</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none hover:bg-[#358a6e]" onClick={() => handleSort("isActive")}>
                      STATUS <SortIcon column="isActive" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none hover:bg-[#358a6e]" onClick={() => handleSort("createdAt")}>
                      CREATED DATE <SortIcon column="createdAt" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-12 text-center text-sm text-gray-500">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading customers...
                        </div>
                      </td>
                    </tr>
                  ) : customers.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-8 text-center text-sm text-gray-500">
                        No data available in table
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer, index) => (
                      <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">{startIndex + index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setViewCustomer(customer)} className="text-gray-500 hover:text-gray-700" title="View">
                              <Eye size={16} />
                            </button>
                            <button onClick={() => handleEdit(customer)} className="text-blue-600 hover:text-blue-800" title="Edit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button onClick={() => handleToggleStatus(customer)}
                              className={`text-xs font-medium px-2 py-0.5 rounded ${customer.isActive ? "text-emerald-700 hover:bg-emerald-50" : "text-red-700 hover:bg-red-50"}`}
                              title={customer.isActive ? "Deactivate" : "Activate"}>
                              {customer.isActive ? "Active" : "Inactive"}
                            </button>
                            <button onClick={() => handleDeleteClick(customer.id, customer.customerName)}
                              className="text-red-600 hover:text-red-800" title="Delete">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-mono">{customer.customerCode || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">{customer.customerName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{customer.phone}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{customer.gstNumber || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{customer.city || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{customer.creditLimit}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                          {(customer.outstandingBalance ?? 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${customer.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                            {customer.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatDate(customer.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing {totalCount > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + entriesPerPage, totalCount)} of {totalCount} entries
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700 font-medium">{currentPage}</span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between py-2 text-xs text-gray-400">
        <span>&copy; 2025 - POS - V5.06.Nov</span>
        <span className="text-emerald-600 font-medium">LICENSE DATE 01/01/2030</span>
      </div>
    </div>
  );
}
