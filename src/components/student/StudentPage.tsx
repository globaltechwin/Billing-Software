"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { sampleStudents, Student } from "./data";

export default function StudentPage() {
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [regNo, setRegNo] = useState("");
  const [block, setBlock] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [wallet, setWallet] = useState("");
  const [showStudentInfo, setShowStudentInfo] = useState(true);
  const [showStudentList, setShowStudentList] = useState(true);
  const [students, setStudents] = useState<Student[]>(sampleStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const filteredStudents = searchQuery
    ? students.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.regNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.mobile.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.block.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : students;

  const totalPages = Math.ceil(filteredStudents.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + entriesPerPage);

  const handleSave = () => {
    if (!mobile.trim() || !name.trim() || !regNo.trim()) return;

    const exists = students.some(
      (s) =>
        s.regNo.toLowerCase() === regNo.trim().toLowerCase() &&
        s.id !== editId
    );
    if (exists) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      return;
    }

    if (editId) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === editId
            ? {
                ...s,
                mobile: mobile.trim(),
                name: name.trim(),
                regNo: regNo.trim(),
                block: block.trim(),
                roomNo: roomNo.trim(),
                wallet: parseFloat(wallet) || 0,
              }
            : s
        )
      );
    } else {
      const newStudent: Student = {
        id: Date.now().toString(),
        mobile: mobile.trim(),
        name: name.trim(),
        regNo: regNo.trim(),
        block: block.trim(),
        roomNo: roomNo.trim(),
        wallet: parseFloat(wallet) || 0,
        createdBy: "demo1",
        createdDate: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        fingerPrint: "",
      };
      setStudents((prev) => [...prev, newStudent]);
    }

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    handleClear();
  };

  const handleClear = () => {
    setMobile("");
    setName("");
    setRegNo("");
    setBlock("");
    setRoomNo("");
    setWallet("");
    setEditId(null);
  };

  const handleEdit = (student: Student) => {
    setMobile(student.mobile);
    setName(student.name);
    setRegNo(student.regNo);
    setBlock(student.block);
    setRoomNo(student.roomNo);
    setWallet(student.wallet.toString());
    setEditId(student.id);
    setShowStudentInfo(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      setStudents((prev) => prev.filter((s) => s.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium">
          {editId ? "Student updated successfully!" : "Student saved successfully!"}
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

      {/* Student Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Student Info.</h2>
          <div className="flex items-center gap-3">
            <button className="bg-amber-500 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-amber-600 transition-colors">
              Students Sync
            </button>
            <button
              onClick={() => setShowStudentInfo(!showStudentInfo)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showStudentInfo ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {showStudentInfo && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-6 max-w-4xl">
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Mobile<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Reg. No.<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Block</label>
                <input
                  type="text"
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Room No.</label>
                <input
                  type="text"
                  value={roomNo}
                  onChange={(e) => setRoomNo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Wallet</label>
                <input
                  type="number"
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Bulk Upload Section */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200 mt-4">
              <label className="text-sm text-gray-700 font-medium">Bulk Upload</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
                />
              </div>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors">
                Upload Excel
              </button>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Students
              </button>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Template
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors"
              >
                Save
              </button>
              <button className="px-6 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors">
                Capture Finger Print
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

      {/* Student List Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Student List</h2>
          <button
            onClick={() => setShowStudentList(!showStudentList)}
            className="text-gray-500 hover:text-gray-700"
          >
            {showStudentList ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        {showStudentList && (
          <>
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
                <div className="flex items-center gap-2 ml-4">
                  <button className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-300 transition-colors">
                    PDF
                  </button>
                  <button className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-300 transition-colors">
                    Excel
                  </button>
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

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#3d9a7e] text-white">
                    <th className="px-4 py-3 text-left text-xs font-semibold w-12">S.NO</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold w-32">EDIT / DELETE</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">MOBILE</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">STUDENT NAME</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">REG. NO.</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">BLOCK</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">ROOM NO.</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">WALLET</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">CREATED BY</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">CREATED DATE</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">FINGER PRINT</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-8 text-center text-sm text-gray-500">
                        No data available in table
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map((student, index) => (
                      <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">{startIndex + index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(student)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(student.id, student.name)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{student.mobile}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">{student.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{student.regNo}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{student.block}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{student.roomNo}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{student.wallet.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{student.createdBy}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{student.createdDate}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{student.fingerPrint}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing {filteredStudents.length > 0 ? startIndex + 1 : 0} to{" "}
                {Math.min(startIndex + entriesPerPage, filteredStudents.length)} of{" "}
                {filteredStudents.length} entries
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded text-sm ${
                        currentPage === page
                          ? "bg-blue-500 text-white border-blue-500"
                          : "border-gray-300 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                {totalPages > 5 && (
                  <span className="px-2 text-gray-400">...</span>
                )}
                {totalPages > 5 && (
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`px-3 py-1 border rounded text-sm ${
                      currentPage === totalPages
                        ? "bg-blue-500 text-white border-blue-500"
                        : "border-gray-300 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {totalPages}
                  </button>
                )}
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
