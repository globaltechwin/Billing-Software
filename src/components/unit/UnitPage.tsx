"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { sampleUnits, Unit } from "./data";

export default function UnitPage() {
  const [unitName, setUnitName] = useState("");
  const [displayOrder, setDisplayOrder] = useState("");
  const [units, setUnits] = useState<Unit[]>(sampleUnits);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [showUnitMaster, setShowUnitMaster] = useState(true);
  const [showUnitList, setShowUnitList] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Filter units
  const filteredUnits = searchQuery
    ? units.filter((u) =>
        u.unitName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : units;

  const totalPages = Math.ceil(filteredUnits.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedUnits = filteredUnits.slice(startIndex, startIndex + entriesPerPage);

  // Save / Update
  const handleSave = () => {
    if (!unitName.trim()) return;
    const order = parseInt(displayOrder) || 1;

    if (editId) {
      setUnits((prev) =>
        prev.map((u) =>
          u.id === editId ? { ...u, unitName: unitName.trim().toUpperCase(), displayOrder: order } : u
        )
      );
    } else {
      const newUnit: Unit = {
        id: Date.now().toString(),
        unitName: unitName.trim().toUpperCase(),
        displayOrder: order,
        isActive: true,
        createdBy: "demo1",
        createdDate: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      };
      setUnits((prev) => [...prev, newUnit]);
    }
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    handleClear();
  };

  // Clear form
  const handleClear = () => {
    setUnitName("");
    setDisplayOrder("");
    setEditId(null);
  };

  // Edit unit
  const handleEdit = (unit: Unit) => {
    setUnitName(unit.unitName);
    setDisplayOrder(unit.displayOrder.toString());
    setEditId(unit.id);
    setShowUnitMaster(true);
  };

  // Delete unit
  const handleDelete = (id: string) => {
    setUnits((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          Unit saved successfully!
        </div>
      )}

      {/* Unit Master Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Unit Master</h2>
          <button
            onClick={() => setShowUnitMaster(!showUnitMaster)}
            className="text-gray-500 hover:text-gray-700"
          >
            {showUnitMaster ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        {showUnitMaster && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-6 max-w-3xl">
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Unit Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Display Order <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors"
              >
                Save
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

      {/* Unit List Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Unit List</h2>
          <button
            onClick={() => setShowUnitList(!showUnitList)}
            className="text-gray-500 hover:text-gray-700"
          >
            {showUnitList ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        {showUnitList && (
          <>
            {/* Table Controls */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200">
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
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#3d9a7e] text-white">
                    <th className="px-4 py-3 text-left text-xs font-semibold w-16">S.NO</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold w-24">EDIT</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold w-24">DELETE</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">UNIT NAME</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">DISP ORDER</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">ISACTIVE</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">CREATED BY</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">CREATED DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUnits.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                        No data available in table
                      </td>
                    </tr>
                  ) : (
                    paginatedUnits.map((unit, index) => (
                      <tr key={unit.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">{startIndex + index + 1}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleEdit(unit)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDelete(unit.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">{unit.unitName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{unit.displayOrder}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{unit.isActive ? "True" : "False"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{unit.createdBy}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{unit.createdDate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing {filteredUnits.length > 0 ? startIndex + 1 : 0} to{" "}
                {Math.min(startIndex + entriesPerPage, filteredUnits.length)} of{" "}
                {filteredUnits.length} entries
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
