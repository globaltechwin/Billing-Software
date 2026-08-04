"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { Branch } from "./data";

function YesNoRadio({
  name,
  value,
  onChange,
}: {
  name: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="radio"
          name={name}
          checked={value === true}
          onChange={() => onChange(true)}
          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">Yes</span>
      </label>
      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="radio"
          name={name}
          checked={value === false}
          onChange={() => onChange(false)}
          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">No</span>
      </label>
    </div>
  );
}

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

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const timeInputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [color-scheme:light]";

function getDefaultBranch(): Omit<Branch, "id" | "companyId" | "createdAt" | "updatedAt" | "createdByName" | "updatedByName" | "createdByUserId" | "updatedByUserId"> {
  return {
    branchCode: null,
    branchName: "",
    branchType: "Branch",
    connectionString: "",
    branchDisplayName: "",
    dayEndAutoClosing: true,
    customField1: "",
    customField2: "",
    rewardPoint: "",
    footerMsg: "",
    website: "",
    billCopy: "",
    openingTime: "",
    closingTime: "",
    graceHours: "",
    gstSummary: true,
    isBarCodeBill: true,
    couponPercent: "",
    couponValidity: "",
    indentApproval: true,
    isDeptKOT: true,
    unitPriceEdit: true,
    billNoReset: true,
    couponVisible: true,
    orderTypeBill: true,
    isZomato: true,
    isSwiggy: true,
    cloudLogo: "",
    contactPerson: "",
    phone: "",
    alternateMobile: "",
    email: "",
    addr1: "",
    addr2: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    gstin: "",
    pan: "",
    logo: "",
    industryID: "",
    textileGST: "",
    fssai: "",
    isHeadOffice: false,
    isDefault: false,
    isActive: true,
    remarks: "",
  };
}

type FormState = ReturnType<typeof getDefaultBranch>;

export default function BranchMasterPage() {
  const [form, setForm] = useState<FormState>(getDefaultBranch);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(true);
  const [showAddress, setShowAddress] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [formError, setFormError] = useState("");

  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", String(entriesPerPage));
      params.set("sortBy", "createdAt");
      params.set("sortOrder", "desc");
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/branches?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.branches) {
        setBranches(data.branches);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [currentPage, entriesPerPage, searchQuery]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBranches();
  }, [fetchBranches]);

  const totalPages = Math.ceil(totalCount / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedBranches = branches;

  const handleFieldChange = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const showSuccessToast = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleSave = async () => {
    if (!form.branchName.trim()) {
      setFormError("Branch Name is required");
      return;
    }
    setFormError("");
    setSaving(true);

    try {
      const body = { ...form };

      if (editId) {
        const res = await fetch("/api/branches", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editId, ...body }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update branch");
        showSuccessToast("Branch updated successfully!");
      } else {
        const res = await fetch("/api/branches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create branch");
        showSuccessToast("Branch saved successfully!");
      }

      handleClear();
      fetchBranches();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setForm(getDefaultBranch());
    setEditId(null);
    setFormError("");
  };

  const handleEdit = (branch: Branch) => {
    setForm({
      branchCode: branch.branchCode,
      branchName: branch.branchName,
      branchType: branch.branchType,
      connectionString: branch.connectionString || "",
      branchDisplayName: branch.branchDisplayName || "",
      dayEndAutoClosing: branch.dayEndAutoClosing,
      customField1: branch.customField1 || "",
      customField2: branch.customField2 || "",
      rewardPoint: branch.rewardPoint || "",
      footerMsg: branch.footerMsg || "",
      website: branch.website || "",
      billCopy: branch.billCopy || "",
      openingTime: branch.openingTime || "",
      closingTime: branch.closingTime || "",
      graceHours: branch.graceHours || "",
      gstSummary: branch.gstSummary,
      isBarCodeBill: branch.isBarCodeBill,
      couponPercent: branch.couponPercent || "",
      couponValidity: branch.couponValidity || "",
      indentApproval: branch.indentApproval,
      isDeptKOT: branch.isDeptKOT,
      unitPriceEdit: branch.unitPriceEdit,
      billNoReset: branch.billNoReset,
      couponVisible: branch.couponVisible,
      orderTypeBill: branch.orderTypeBill,
      isZomato: branch.isZomato,
      isSwiggy: branch.isSwiggy,
      cloudLogo: branch.cloudLogo || "",
      contactPerson: branch.contactPerson || "",
      phone: branch.phone || "",
      alternateMobile: branch.alternateMobile || "",
      email: branch.email || "",
      addr1: branch.addr1 || "",
      addr2: branch.addr2 || "",
      city: branch.city || "",
      state: branch.state || "",
      country: branch.country || "India",
      pincode: branch.pincode || "",
      gstin: branch.gstin || "",
      pan: branch.pan || "",
      logo: branch.logo || "",
      industryID: branch.industryID || "",
      textileGST: branch.textileGST || "",
      fssai: branch.fssai || "",
      isHeadOffice: branch.isHeadOffice,
      isDefault: branch.isDefault,
      isActive: branch.isActive,
      remarks: branch.remarks || "",
    });
    setEditId(branch.id);
    setShowForm(true);
    setShowAddress(true);
  };

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/branches?id=${deleteConfirm.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete branch");
      showSuccessToast("Branch deleted successfully!");
      setDeleteConfirm(null);
      fetchBranches();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete branch");
      setDeleteConfirm(null);
    }
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
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors">Cancel</button>
              <button onClick={handleConfirmDelete} className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {formError && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          {formError}
          <button onClick={() => setFormError("")} className="ml-2 underline">dismiss</button>
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-4">
        {/* Branch Master Form - Left Column */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800">Branch Master</h2>
              <button onClick={() => setShowForm(!showForm)} className="text-gray-500 hover:text-gray-700">
                {showForm ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            {showForm && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <FormField label="Branch Name" required>
                    <input type="text" value={form.branchName} onChange={(e) => handleFieldChange("branchName", e.target.value)} className={inputClass} />
                  </FormField>

                  <FormField label="Connection String" required>
                    <input type="text" value={form.connectionString || ""} onChange={(e) => handleFieldChange("connectionString", e.target.value)} className={inputClass} />
                  </FormField>

                  <div className="col-span-2">
                    <FormField label="DayEnd Auto Closing">
                      <YesNoRadio name="dayEndAutoClosing" value={form.dayEndAutoClosing} onChange={(v) => handleFieldChange("dayEndAutoClosing", v)} />
                    </FormField>
                  </div>

                  <FormField label="CustomField1">
                    <input type="text" value={form.customField1 || ""} onChange={(e) => handleFieldChange("customField1", e.target.value)} className={inputClass} />
                  </FormField>

                  <FormField label="CustomField2">
                    <input type="text" value={form.customField2 || ""} onChange={(e) => handleFieldChange("customField2", e.target.value)} className={inputClass} />
                  </FormField>

                  <FormField label="Reward Point">
                    <input type="text" value={form.rewardPoint || ""} onChange={(e) => handleFieldChange("rewardPoint", e.target.value)} className={inputClass} />
                  </FormField>

                  <FormField label="Footermsg">
                    <input type="text" value={form.footerMsg || ""} onChange={(e) => handleFieldChange("footerMsg", e.target.value)} className={inputClass} />
                  </FormField>

                  <FormField label="Website">
                    <input type="text" value={form.website || ""} onChange={(e) => handleFieldChange("website", e.target.value)} className={inputClass} />
                  </FormField>

                  <FormField label="BillCOPY">
                    <input type="text" value={form.billCopy || ""} onChange={(e) => handleFieldChange("billCopy", e.target.value)} className={inputClass} />
                  </FormField>

                  <FormField label="OpeningTime">
                    <input type="time" value={form.openingTime || ""} onChange={(e) => handleFieldChange("openingTime", e.target.value)} className={timeInputClass} />
                  </FormField>

                  <FormField label="ClosingTime">
                    <input type="time" value={form.closingTime || ""} onChange={(e) => handleFieldChange("closingTime", e.target.value)} className={timeInputClass} />
                  </FormField>

                  <FormField label="GraceHours">
                    <input type="time" value={form.graceHours || ""} onChange={(e) => handleFieldChange("graceHours", e.target.value)} className={timeInputClass} />
                  </FormField>

                  <FormField label="GstSummary">
                    <YesNoRadio name="gstSummary" value={form.gstSummary} onChange={(v) => handleFieldChange("gstSummary", v)} />
                  </FormField>

                  <FormField label="isBarCode Bill">
                    <YesNoRadio name="isBarCodeBill" value={form.isBarCodeBill} onChange={(v) => handleFieldChange("isBarCodeBill", v)} />
                  </FormField>

                  <FormField label="Coupon Percent">
                    <input type="text" value={form.couponPercent || ""} onChange={(e) => handleFieldChange("couponPercent", e.target.value)} className={inputClass} />
                  </FormField>

                  <FormField label="Indent Approval">
                    <YesNoRadio name="indentApproval" value={form.indentApproval} onChange={(v) => handleFieldChange("indentApproval", v)} />
                  </FormField>

                  <FormField label="is DeptKOT">
                    <YesNoRadio name="isDeptKOT" value={form.isDeptKOT} onChange={(v) => handleFieldChange("isDeptKOT", v)} />
                  </FormField>

                  <FormField label="UnitPrice Edit">
                    <YesNoRadio name="unitPriceEdit" value={form.unitPriceEdit} onChange={(v) => handleFieldChange("unitPriceEdit", v)} />
                  </FormField>

                  <FormField label="BillNo Reset">
                    <YesNoRadio name="billNoReset" value={form.billNoReset} onChange={(v) => handleFieldChange("billNoReset", v)} />
                  </FormField>

                  <FormField label="Coupon Visible">
                    <YesNoRadio name="couponVisible" value={form.couponVisible} onChange={(v) => handleFieldChange("couponVisible", v)} />
                  </FormField>

                  <FormField label="OrderTypeBill">
                    <YesNoRadio name="orderTypeBill" value={form.orderTypeBill} onChange={(v) => handleFieldChange("orderTypeBill", v)} />
                  </FormField>

                  <FormField label="is Zomato">
                    <YesNoRadio name="isZomato" value={form.isZomato} onChange={(v) => handleFieldChange("isZomato", v)} />
                  </FormField>

                  <FormField label="is Swiggy">
                    <YesNoRadio name="isSwiggy" value={form.isSwiggy} onChange={(v) => handleFieldChange("isSwiggy", v)} />
                  </FormField>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Branch Address - Right Column */}
        <div className="w-full xl:w-[420px] flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800">Branch Address</h2>
              <button onClick={() => setShowAddress(!showAddress)} className="text-gray-500 hover:text-gray-700">
                {showAddress ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            {showAddress && (
              <div className="p-6 space-y-4">
                <FormField label="Branch DisplayName" required>
                  <input type="text" value={form.branchDisplayName || ""} onChange={(e) => handleFieldChange("branchDisplayName", e.target.value)} className={inputClass} />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Addr1" required>
                    <input type="text" value={form.addr1 || ""} onChange={(e) => handleFieldChange("addr1", e.target.value)} className={inputClass} />
                  </FormField>

                  <FormField label="Addr2" required>
                    <input type="text" value={form.addr2 || ""} onChange={(e) => handleFieldChange("addr2", e.target.value)} className={inputClass} />
                  </FormField>

                  <FormField label="GSTNO" required>
                    <input type="text" value={form.gstin || ""} onChange={(e) => handleFieldChange("gstin", e.target.value)} className={inputClass} />
                  </FormField>

                  <FormField label="Phone" required>
                    <input type="text" value={form.phone || ""} onChange={(e) => handleFieldChange("phone", e.target.value)} className={inputClass} />
                  </FormField>

                  <FormField label="Logo">
                    <input type="text" value={form.logo || ""} onChange={(e) => handleFieldChange("logo", e.target.value)} className={inputClass} />
                  </FormField>

                  <FormField label="IndustryID">
                    <input type="text" value={form.industryID || ""} onChange={(e) => handleFieldChange("industryID", e.target.value)} className={inputClass} />
                  </FormField>

                  <FormField label="TextileGST">
                    <input type="text" value={form.textileGST || ""} onChange={(e) => handleFieldChange("textileGST", e.target.value)} className={inputClass} />
                  </FormField>

                  <FormField label="FSSAI">
                    <input type="text" value={form.fssai || ""} onChange={(e) => handleFieldChange("fssai", e.target.value)} className={inputClass} />
                  </FormField>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save / Clear buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save
        </button>
        <button
          onClick={handleClear}
          className="px-6 py-2 bg-purple-500 text-white rounded-md text-sm font-medium hover:bg-purple-600 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Branch List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-3">
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

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1400px]">
            <thead>
              <tr className="bg-[#3d9a7e] text-white">
                <th className="px-4 py-3 text-left text-xs font-semibold w-12">S.NO</th>
                <th className="px-4 py-3 text-left text-xs font-semibold w-28">EDIT / DELETE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">BRANCHID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">CLIENTID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">BRANCHNAME</th>
                <th className="px-4 py-3 text-left text-xs font-semibold min-w-[200px]">CONNECTIONSTRING</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">DAYENDAUTOCLOSING</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">CUSTOMFIELD1</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">CUSTOMFIELD2</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">REWARDPOINT</th>
                <th className="px-4 py-3 text-left text-xs font-semibold min-w-[150px]">BRANCHDISPLAYNAME</th>
                <th className="px-4 py-3 text-left text-xs font-semibold min-w-[200px]">ADDR1</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">ADDR2</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">GSTNO</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">PHONE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">LOGO</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">INDUSTRYID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">TEXTILEGST</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">FSSAI</th>
                <th className="px-4 py-3 text-left text-xs font-semibold min-w-[150px]">FOOTERMSG</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">WEBSITE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">BILLCOPY</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">OPENINGTIME</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">CLOSINGTIME</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">GRACEHOURS</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">GSTSUMMARY</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">ISBARCODEBILL</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">COUPONPERCENT</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">COUPONVALIDITY</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">INDENTAPPROVAL</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">ISDEPTKOT</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">UNITPRICEEDIT</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">BILLNORESET</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">COUPONVISIBLE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">ORDERTYPEBILL</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">ISZOMATO</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">ISSWIGGY</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">CLOUDLOGO</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={38} className="px-4 py-8 text-center text-sm text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                  </td>
                </tr>
              ) : paginatedBranches.length === 0 ? (
                <tr>
                  <td colSpan={38} className="px-4 py-8 text-center text-sm text-gray-500">
                    No data available in table
                  </td>
                </tr>
              ) : (
                paginatedBranches.map((branch, index) => (
                  <tr key={branch.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{startIndex + index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(branch)} className="text-blue-600 hover:text-blue-800">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDeleteClick(branch.id, branch.branchName)} className="text-red-600 hover:text-red-800">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.companyId}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">{branch.branchName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-[300px] break-words">{branch.connectionString}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.dayEndAutoClosing ? "True" : "False"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.customField1}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.customField2}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.rewardPoint}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.branchDisplayName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-[250px] break-words">{branch.addr1}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.addr2}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.gstin}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.logo}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.industryID}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.textileGST}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.fssai}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.footerMsg}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.website}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.billCopy}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.openingTime}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.closingTime}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.graceHours}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.gstSummary ? "True" : "False"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.isBarCodeBill ? "True" : "False"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.couponPercent}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.couponValidity}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.indentApproval ? "True" : "False"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.isDeptKOT ? "True" : "False"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.unitPriceEdit ? "True" : "False"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.billNoReset ? "True" : "False"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.couponVisible ? "True" : "False"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.orderTypeBill ? "True" : "False"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.isZomato ? "True" : "False"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.isSwiggy ? "True" : "False"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{branch.cloudLogo}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Showing {paginatedBranches.length > 0 ? startIndex + 1 : 0} to{" "}
            {Math.min(startIndex + entriesPerPage, totalCount)} of {totalCount} entries
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
      </div>
    </div>
  );
}
