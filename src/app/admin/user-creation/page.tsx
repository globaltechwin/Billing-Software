"use client";

import { useState, useMemo } from "react";
import { sampleBranches } from "@/components/branch-master/data";

interface UserRow {
  id: string;
  sNo: number;
  firstName: string;
  lastName: string;
  userId: string;
  branchName: string;
  roleName: string;
  active: boolean;
  createdBy: string;
  createdDate: string;
  cancelKot: boolean;
  tableType: string;
  userAccess: string;
  lastAccessDate: string;
  lastAccessTime: string;
  lastIpAddress: string;
  lastBrowserName: string;
}

const ROLES = ["Admin", "Manager", "Cashier", "Captain", "Staff", "User", "Senior Manager", "Driver"];

const TABLE_TYPES = ["Main Hall", "First Floor", "DINING AREA", "AC Hall", "Terrace", "Take Away", "Home Delivery"];

const PRODUCT_CATEGORIES = ["Cat", "CatEgory TWO", "CAT ONE", "Food", "Beverages"];

const ORDER_TYPES = ["Sales", "Dine In", "Take Away", "Home Delivery"];

const sampleUsers: UserRow[] = [
  { id: "1", sNo: 1, firstName: "Aravinth", lastName: "Kumar", userId: "aravinth", branchName: "Demo2", roleName: "Admin", active: true, createdBy: "admin", createdDate: "06/07/2026", cancelKot: false, tableType: "Main Hall", userAccess: "", lastAccessDate: "", lastAccessTime: "", lastIpAddress: "", lastBrowserName: "" },
  { id: "2", sNo: 2, firstName: "Arun", lastName: "Kumar", userId: "Arun", branchName: "Demo2", roleName: "Admin", active: true, createdBy: "admin", createdDate: "06/07/2026", cancelKot: false, tableType: "First Floor", userAccess: "", lastAccessDate: "", lastAccessTime: "", lastIpAddress: "", lastBrowserName: "" },
  { id: "3", sNo: 3, firstName: "Barath", lastName: "Kumar", userId: "Barath", branchName: "Demo2", roleName: "Admin", active: true, createdBy: "admin", createdDate: "06/07/2026", cancelKot: false, tableType: "DINING AREA", userAccess: "", lastAccessDate: "", lastAccessTime: "", lastIpAddress: "", lastBrowserName: "" },
  { id: "4", sNo: 4, firstName: "Barath", lastName: "Kumar", userId: "Barath12", branchName: "Demo2", roleName: "Admin", active: true, createdBy: "admin", createdDate: "06/07/2026", cancelKot: false, tableType: "Main Hall", userAccess: "", lastAccessDate: "", lastAccessTime: "", lastIpAddress: "", lastBrowserName: "" },
  { id: "5", sNo: 5, firstName: "Barath", lastName: "Kumar", userId: "barath123", branchName: "Demo2", roleName: "Admin", active: true, createdBy: "admin", createdDate: "06/07/2026", cancelKot: false, tableType: "First Floor", userAccess: "", lastAccessDate: "", lastAccessTime: "", lastIpAddress: "", lastBrowserName: "" },
  { id: "6", sNo: 6, firstName: "Barath", lastName: "Kumar", userId: "barathkumar", branchName: "Demo2", roleName: "Admin", active: true, createdBy: "admin", createdDate: "06/07/2026", cancelKot: false, tableType: "DINING AREA", userAccess: "", lastAccessDate: "", lastAccessTime: "", lastIpAddress: "", lastBrowserName: "" },
  { id: "7", sNo: 7, firstName: "Barath", lastName: "R", userId: "BarathR", branchName: "Demo2", roleName: "Admin", active: true, createdBy: "admin", createdDate: "06/07/2026", cancelKot: false, tableType: "AC Hall", userAccess: "", lastAccessDate: "", lastAccessTime: "", lastIpAddress: "", lastBrowserName: "" },
  { id: "8", sNo: 8, firstName: "barath", lastName: "test", userId: "barath1", branchName: "Demo2", roleName: "Admin", active: true, createdBy: "admin", createdDate: "06/07/2026", cancelKot: false, tableType: "Terrace", userAccess: "", lastAccessDate: "", lastAccessTime: "", lastIpAddress: "", lastBrowserName: "" },
  { id: "9", sNo: 9, firstName: "barath", lastName: "test", userId: "test1", branchName: "Demo2", roleName: "Admin", active: true, createdBy: "admin", createdDate: "06/07/2026", cancelKot: false, tableType: "Take Away", userAccess: "", lastAccessDate: "", lastAccessTime: "", lastIpAddress: "", lastBrowserName: "" },
  { id: "10", sNo: 10, firstName: "Kumar", lastName: "Raja", userId: "kumar123", branchName: "Demo2", roleName: "Admin", active: true, createdBy: "admin", createdDate: "06/07/2026", cancelKot: false, tableType: "Main Hall", userAccess: "", lastAccessDate: "", lastAccessTime: "", lastIpAddress: "", lastBrowserName: "" },
  { id: "11", sNo: 11, firstName: "Madhesh", lastName: "Kumar", userId: "Madhesh", branchName: "Demo2", roleName: "Admin", active: true, createdBy: "admin", createdDate: "06/07/2026", cancelKot: false, tableType: "First Floor", userAccess: "", lastAccessDate: "", lastAccessTime: "", lastIpAddress: "", lastBrowserName: "" },
  { id: "12", sNo: 12, firstName: "Madhesh", lastName: "Kumar", userId: "Madhesh123", branchName: "Demo2", roleName: "Admin", active: true, createdBy: "admin", createdDate: "06/07/2026", cancelKot: false, tableType: "DINING AREA", userAccess: "", lastAccessDate: "", lastAccessTime: "", lastIpAddress: "", lastBrowserName: "" },
  { id: "13", sNo: 13, firstName: "MADHESH", lastName: "K", userId: "MADHESH", branchName: "Demo2", roleName: "Admin", active: true, createdBy: "admin", createdDate: "06/07/2026", cancelKot: false, tableType: "Main Hall", userAccess: "", lastAccessDate: "", lastAccessTime: "", lastIpAddress: "", lastBrowserName: "" },
  { id: "14", sNo: 14, firstName: "Raj", lastName: "Kumar", userId: "raj123", branchName: "Demo2", roleName: "Admin", active: true, createdBy: "admin", createdDate: "06/07/2026", cancelKot: false, tableType: "First Floor", userAccess: "", lastAccessDate: "", lastAccessTime: "", lastIpAddress: "", lastBrowserName: "" },
  { id: "15", sNo: 15, firstName: "Raj", lastName: "test", userId: "raj", branchName: "Demo2", roleName: "Admin", active: true, createdBy: "admin", createdDate: "06/07/2026", cancelKot: false, tableType: "DINING AREA", userAccess: "", lastAccessDate: "", lastAccessTime: "", lastIpAddress: "", lastBrowserName: "" },
  { id: "16", sNo: 16, firstName: "Vignesh", lastName: "R", userId: "Vignesh", branchName: "Demo2", roleName: "Admin", active: true, createdBy: "admin", createdDate: "06/07/2026", cancelKot: false, tableType: "AC Hall", userAccess: "", lastAccessDate: "", lastAccessTime: "", lastIpAddress: "", lastBrowserName: "" },
  { id: "17", sNo: 17, firstName: "Vignesh", lastName: "R", userId: "vignesh123", branchName: "Demo2", roleName: "Admin", active: true, createdBy: "admin", createdDate: "06/07/2026", cancelKot: false, tableType: "Terrace", userAccess: "", lastAccessDate: "", lastAccessTime: "", lastIpAddress: "", lastBrowserName: "" },
  { id: "18", sNo: 18, firstName: "User1", lastName: "Test", userId: "user1", branchName: "Demo2", roleName: "User", active: true, createdBy: "admin", createdDate: "06/07/2026", cancelKot: false, tableType: "Main Hall", userAccess: "", lastAccessDate: "", lastAccessTime: "", lastIpAddress: "", lastBrowserName: "" },
  { id: "19", sNo: 19, firstName: "Captain", lastName: "One", userId: "captain1", branchName: "Demo2", roleName: "Captain", active: true, createdBy: "admin", createdDate: "06/07/2026", cancelKot: false, tableType: "First Floor", userAccess: "", lastAccessDate: "", lastAccessTime: "", lastIpAddress: "", lastBrowserName: "" },
  { id: "20", sNo: 20, firstName: "Driver", lastName: "Test", userId: "driver1", branchName: "Demo2", roleName: "Driver", active: true, createdBy: "admin", createdDate: "06/07/2026", cancelKot: false, tableType: "Home Delivery", userAccess: "", lastAccessDate: "", lastAccessTime: "", lastIpAddress: "", lastBrowserName: "" },
  { id: "21", sNo: 21, firstName: "Senior", lastName: "Manager", userId: "seniormgr", branchName: "Demo2", roleName: "Senior Manager", active: true, createdBy: "admin", createdDate: "06/07/2026", cancelKot: false, tableType: "DINING AREA", userAccess: "", lastAccessDate: "", lastAccessTime: "", lastIpAddress: "", lastBrowserName: "" },
];

export default function UserCreationPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [branch, setBranch] = useState("");
  const [role, setRole] = useState("");
  const [noSettlement, setNoSettlement] = useState(false);
  const [cancelKot, setCancelKot] = useState(false);
  const [selectedTableTypes, setSelectedTableTypes] = useState<string[]>([]);
  const [selectedProductCategories, setSelectedProductCategories] = useState<string[]>([]);
  const [selectedOrderTypes, setSelectedOrderTypes] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportData, setReportData] = useState<UserRow[]>(sampleUsers);

  const filteredData = useMemo(() => {
    if (!searchQuery) return reportData;
    const q = searchQuery.toLowerCase();
    return reportData.filter(
      (r) =>
        r.firstName.toLowerCase().includes(q) ||
        r.lastName.toLowerCase().includes(q) ||
        r.userId.toLowerCase().includes(q) ||
        r.branchName.toLowerCase().includes(q) ||
        r.roleName.toLowerCase().includes(q)
    );
  }, [reportData, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage);

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setUserId("");
    setPassword("");
    setBranch("");
    setRole("");
    setNoSettlement(false);
    setCancelKot(false);
    setSelectedTableTypes([]);
    setSelectedProductCategories([]);
    setSelectedOrderTypes([]);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!firstName || !lastName || !userId || !password || !branch || !role) {
      alert("Please fill all required fields");
      return;
    }
    const branchName = sampleBranches.find((b) => b.id === branch)?.branchName || "";

    if (editingId) {
      setReportData((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? {
                ...r,
                firstName,
                lastName,
                userId,
                branchName,
                roleName: role,
                cancelKot,
                tableType: selectedTableTypes.join(", "),
              }
            : r
        )
      );
    } else {
      const today = new Date().toLocaleDateString("en-GB");
      const newRow: UserRow = {
        id: String(Date.now()),
        sNo: reportData.length + 1,
        firstName,
        lastName,
        userId,
        branchName,
        roleName: role,
        active: true,
        createdBy: "admin",
        createdDate: today,
        cancelKot,
        tableType: selectedTableTypes.join(", "),
        userAccess: "",
        lastAccessDate: "",
        lastAccessTime: "",
        lastIpAddress: "",
        lastBrowserName: "",
      };
      setReportData((prev) => [newRow, ...prev]);
    }
    resetForm();
  };

  const handleEdit = (row: UserRow) => {
    const br = sampleBranches.find((b) => b.branchName === row.branchName);
    setEditingId(row.id);
    setFirstName(row.firstName);
    setLastName(row.lastName);
    setUserId(row.userId);
    setPassword("");
    setBranch(br?.id || "");
    setRole(row.roleName);
    setNoSettlement(false);
    setCancelKot(row.cancelKot);
    setSelectedTableTypes(row.tableType ? row.tableType.split(", ") : []);
    setSelectedProductCategories([]);
    setSelectedOrderTypes([]);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setReportData((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleActive = (id: string) => {
    setReportData((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  const toggleListSelection = (
    item: string,
    list: string[],
    setList: (v: string[]) => void
  ) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* User Creation Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">User Creation</h2>
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg>
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4 max-w-3xl">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-40 text-right">First Name*</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-40 text-right">Last Name*</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-40 text-right">User ID*</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-[250px]"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-40 text-right">Password*</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-[250px]"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-40 text-right">Branch*</label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">--Select Branch--</option>
              {sampleBranches.map((b) => (
                <option key={b.id} value={b.id}>{b.branchName}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-40 text-right">Role*</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">--Select Role--</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-40 text-right">No Settlement</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="noSettlement" checked={!noSettlement} onChange={() => setNoSettlement(false)} className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-sm text-gray-700">No</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="noSettlement" checked={noSettlement} onChange={() => setNoSettlement(true)} className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 w-40 text-right">Cancel KOT</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="cancelKot" checked={!cancelKot} onChange={() => setCancelKot(false)} className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-sm text-gray-700">No</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="cancelKot" checked={cancelKot} onChange={() => setCancelKot(true)} className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <label className="text-sm font-medium text-gray-700 w-40 text-right pt-2">Table Type</label>
            <select
              multiple
              value={selectedTableTypes}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, (o) => o.value);
                setSelectedTableTypes(values);
              }}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-[120px]"
            >
              {TABLE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex items-start gap-4">
            <label className="text-sm font-medium text-gray-700 w-40 text-right pt-2">Product Categories</label>
            <select
              multiple
              value={selectedProductCategories}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, (o) => o.value);
                setSelectedProductCategories(values);
              }}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-[120px]"
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-start gap-4">
            <label className="text-sm font-medium text-gray-700 w-40 text-right pt-2">Order Type</label>
            <select
              multiple
              value={selectedOrderTypes}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, (o) => o.value);
                setSelectedOrderTypes(values);
              }}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-[120px]"
            >
              {ORDER_TYPES.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 pl-40">
            <button onClick={handleSave} className="px-6 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-colors">
              {editingId ? "Update" : "Save"}
            </button>
            <button onClick={resetForm} className="px-6 py-2 bg-purple-500 text-white rounded-md text-sm font-medium hover:bg-purple-600 transition-colors">
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">User List</h2>
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg>
          </button>
        </div>

        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200">
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
                <th className="px-3 py-3 text-center text-xs font-semibold">S.NO</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">EDIT / DELETE</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">FIRST NAME</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">LAST NAME</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">USERID</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">BRANCH NAME</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">ROLE NAME</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">ACTIVE</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">CREATED BY</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">CREATED DATE</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">CANCELKOT</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">TABLETYPE</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">USER ACCESS</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">LAST ACCESS DATE</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">LAST ACCESS TIME</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">LAST IP ADDRESS</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">LAST BROWSER NAME</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={17} className="px-4 py-8 text-center text-sm text-gray-500">
                    No data available in table
                  </td>
                </tr>
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
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.firstName}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.lastName}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center font-medium">{row.userId}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.branchName}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.roleName}</td>
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => toggleActive(row.id)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          row.active
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {row.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.createdBy}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.createdDate}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        row.cancelKot ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {row.cancelKot ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.tableType}</td>
                    <td className="px-3 py-3 text-center">
                      <button className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors">
                        USER ACCESS
                      </button>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.lastAccessDate || "-"}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.lastAccessTime || "-"}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.lastIpAddress || "-"}</td>
                    <td className="px-3 py-3 text-sm text-gray-700 text-center">{row.lastBrowserName || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
