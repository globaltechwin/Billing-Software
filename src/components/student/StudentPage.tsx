"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronUp, ChevronDown, Loader2, Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Student, GENDERS } from "./data";

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

export default function StudentPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const [showStudentInfo, setShowStudentInfo] = useState(true);
  const [showStudentList, setShowStudentList] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);

  // Personal Information
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");

  // Academic Information
  const [course, setCourse] = useState("");
  const [department, setDepartment] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [section, setSection] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [rollNumber, setRollNumber] = useState("");

  // Parent / Guardian
  const [parentName, setParentName] = useState("");
  const [parentMobile, setParentMobile] = useState("");
  const [parentEmail, setParentEmail] = useState("");

  // Address
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [pincode, setPincode] = useState("");

  // Other
  const [block, setBlock] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [wallet, setWallet] = useState("");
  const [remarks, setRemarks] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [formError, setFormError] = useState("");

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", String(entriesPerPage));
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      if (statusFilter) params.set("status", statusFilter);
      if (courseFilter) params.set("course", courseFilter);
      if (departmentFilter) params.set("department", departmentFilter);
      if (academicYearFilter) params.set("academicYear", academicYearFilter);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/students?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.students) {
        const formatted = data.students.map((s: Record<string, unknown>) => ({
          ...s,
          createdByName: (s.createdByUser as Record<string, unknown>)?.name || "",
          updatedByName: (s.updatedByUser as Record<string, unknown>)?.name || "",
        }));
        setStudents(formatted);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [currentPage, entriesPerPage, statusFilter, courseFilter, departmentFilter, academicYearFilter, searchQuery, sortBy, sortOrder]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStudents();
  }, [fetchStudents]);

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
    if (!firstName.trim()) {
      setFormError("First Name is required");
      return;
    }
    setFormError("");
    setSaving(true);

    try {
      const body: Record<string, unknown> = {
        admissionNumber: admissionNumber.trim() || null,
        firstName: firstName.trim(),
        lastName: lastName.trim() || null,
        gender: gender || null,
        dateOfBirth: dateOfBirth || null,
        mobileNumber: mobileNumber.trim() || null,
        email: email.trim() || null,
        course: course.trim() || null,
        department: department.trim() || null,
        class: studentClass.trim() || null,
        section: section.trim() || null,
        academicYear: academicYear.trim() || null,
        rollNumber: rollNumber.trim() || null,
        parentName: parentName.trim() || null,
        parentMobile: parentMobile.trim() || null,
        parentEmail: parentEmail.trim() || null,
        address: address.trim() || null,
        city: city.trim() || null,
        state: state.trim() || null,
        country: country.trim() || "India",
        pincode: pincode.trim() || null,
        block: block.trim() || null,
        roomNo: roomNo.trim() || null,
        wallet: wallet || "0",
        remarks: remarks.trim() || null,
      };

      if (editId) {
        body.id = editId;
        const res = await fetch("/api/students", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update student");
        showSuccessToast("Student updated successfully!");
      } else {
        const res = await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create student");
        showSuccessToast("Student saved successfully!");
      }

      handleClear();
      fetchStudents();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setAdmissionNumber("");
    setFirstName("");
    setLastName("");
    setGender("");
    setDateOfBirth("");
    setMobileNumber("");
    setEmail("");
    setCourse("");
    setDepartment("");
    setStudentClass("");
    setSection("");
    setAcademicYear("");
    setRollNumber("");
    setParentName("");
    setParentMobile("");
    setParentEmail("");
    setAddress("");
    setCity("");
    setState("");
    setCountry("India");
    setPincode("");
    setBlock("");
    setRoomNo("");
    setWallet("");
    setRemarks("");
    setEditId(null);
    setFormError("");
  };

  const handleEdit = (student: Student) => {
    setAdmissionNumber(student.admissionNumber || "");
    setFirstName(student.firstName);
    setLastName(student.lastName || "");
    setGender(student.gender || "");
    setDateOfBirth(student.dateOfBirth ? student.dateOfBirth.substring(0, 10) : "");
    setMobileNumber(student.mobileNumber || "");
    setEmail(student.email || "");
    setCourse(student.course || "");
    setDepartment(student.department || "");
    setStudentClass(student.class || "");
    setSection(student.section || "");
    setAcademicYear(student.academicYear || "");
    setRollNumber(student.rollNumber || "");
    setParentName(student.parentName || "");
    setParentMobile(student.parentMobile || "");
    setParentEmail(student.parentEmail || "");
    setAddress(student.address || "");
    setCity(student.city || "");
    setState(student.state || "");
    setCountry(student.country || "India");
    setPincode(student.pincode || "");
    setBlock(student.block || "");
    setRoomNo(student.roomNo || "");
    setWallet(student.wallet.toString());
    setRemarks(student.remarks || "");
    setEditId(student.id);
    setShowStudentInfo(true);
  };

  const handleToggleStatus = async (student: Student) => {
    try {
      const res = await fetch("/api/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: student.id, isActive: !student.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");
      showSuccessToast(`Student ${student.isActive ? "deactivated" : "activated"} successfully!`);
      fetchStudents();
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
      const res = await fetch(`/api/students?id=${deleteConfirm.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete student");
      showSuccessToast("Student deleted successfully!");
      setDeleteConfirm(null);
      fetchStudents();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete");
      setDeleteConfirm(null);
    }
  };

  const handleExportCsv = () => {
    if (students.length === 0) return;
    const headers = [
      "STUDENT ID", "STUDENT NAME", "ADMISSION NUMBER", "ROLL NUMBER",
      "COURSE", "DEPARTMENT", "MOBILE NUMBER", "STATUS", "CREATED DATE",
    ];
    const rows = students.map((s) => [
      s.id,
      `${s.firstName}${s.lastName ? " " + s.lastName : ""}`,
      s.admissionNumber || "-",
      s.rollNumber || "-",
      s.course || "-",
      s.department || "-",
      s.mobileNumber || "-",
      s.isActive ? "Active" : "Inactive",
      formatDate(s.createdAt),
    ]);
    downloadCsv(headers, rows, "Students.csv");
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
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

      {viewStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Student Details</h3>
              <button onClick={() => setViewStudent(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-4">
                <div><span className="text-gray-500">Student ID:</span><br /><span className="font-medium">{viewStudent.id}</span></div>
                <div><span className="text-gray-500">Status:</span><br />
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium inline-block mt-1 ${
                    viewStudent.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  }`}>{viewStudent.isActive ? "Active" : "Inactive"}</span>
                </div>
                <div><span className="text-gray-500">Admission No:</span><br /><span className="font-medium">{viewStudent.admissionNumber || "-"}</span></div>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Personal Information</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div><span className="text-gray-500">First Name:</span><br /><span className="font-medium">{viewStudent.firstName}</span></div>
                  <div><span className="text-gray-500">Last Name:</span><br /><span className="font-medium">{viewStudent.lastName || "-"}</span></div>
                  <div><span className="text-gray-500">Gender:</span><br /><span className="font-medium">{viewStudent.gender || "-"}</span></div>
                  <div><span className="text-gray-500">Date of Birth:</span><br /><span className="font-medium">{formatDate(viewStudent.dateOfBirth)}</span></div>
                  <div><span className="text-gray-500">Mobile:</span><br /><span className="font-medium">{viewStudent.mobileNumber || "-"}</span></div>
                  <div><span className="text-gray-500">Email:</span><br /><span className="font-medium">{viewStudent.email || "-"}</span></div>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Academic Information</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div><span className="text-gray-500">Course:</span><br /><span className="font-medium">{viewStudent.course || "-"}</span></div>
                  <div><span className="text-gray-500">Department:</span><br /><span className="font-medium">{viewStudent.department || "-"}</span></div>
                  <div><span className="text-gray-500">Class:</span><br /><span className="font-medium">{viewStudent.class || "-"}</span></div>
                  <div><span className="text-gray-500">Section:</span><br /><span className="font-medium">{viewStudent.section || "-"}</span></div>
                  <div><span className="text-gray-500">Academic Year:</span><br /><span className="font-medium">{viewStudent.academicYear || "-"}</span></div>
                  <div><span className="text-gray-500">Roll Number:</span><br /><span className="font-medium">{viewStudent.rollNumber || "-"}</span></div>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Parent / Guardian</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div><span className="text-gray-500">Name:</span><br /><span className="font-medium">{viewStudent.parentName || "-"}</span></div>
                  <div><span className="text-gray-500">Mobile:</span><br /><span className="font-medium">{viewStudent.parentMobile || "-"}</span></div>
                  <div><span className="text-gray-500">Email:</span><br /><span className="font-medium">{viewStudent.parentEmail || "-"}</span></div>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Address</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-3"><span className="text-gray-500">Address:</span><br /><span className="font-medium">{viewStudent.address || "-"}</span></div>
                  <div><span className="text-gray-500">City:</span><br /><span className="font-medium">{viewStudent.city || "-"}</span></div>
                  <div><span className="text-gray-500">State:</span><br /><span className="font-medium">{viewStudent.state || "-"}</span></div>
                  <div><span className="text-gray-500">Pincode:</span><br /><span className="font-medium">{viewStudent.pincode || "-"}</span></div>
                </div>
              </div>
              {viewStudent.remarks && (
                <div className="border-t border-gray-100 pt-3">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Remarks</h4>
                  <p className="font-medium">{viewStudent.remarks}</p>
                </div>
              )}
              <div className="border-t border-gray-100 pt-3 grid grid-cols-3 gap-4">
                <div><span className="text-gray-500">Created By:</span><br /><span className="font-medium">{viewStudent.createdByName}</span></div>
                <div><span className="text-gray-500">Created Date:</span><br /><span className="font-medium">{formatDate(viewStudent.createdAt)}</span></div>
                <div><span className="text-gray-500">Updated By:</span><br /><span className="font-medium">{viewStudent.updatedByName || "-"}</span></div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setViewStudent(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Student Info.</h2>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 bg-amber-500 text-white rounded-md text-xs font-medium hover:bg-amber-600 transition-colors">
              Students Sync
            </button>
            <button onClick={() => setShowStudentInfo(!showStudentInfo)} className="text-gray-500 hover:text-gray-700">
              {showStudentInfo ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {showStudentInfo && (
          <div className="p-6 space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">{formError}</div>
            )}

            {/* Personal Information */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Personal Information</h4>
              <div className="grid grid-cols-3 gap-6 max-w-4xl">
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">First Name <span className="text-red-500">*</span></label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Last Name</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select Gender</option>
                    {GENDERS.map((g) => (<option key={g} value={g}>{g}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Date of Birth</label>
                  <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Mobile Number</label>
                  <input type="text" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Academic Information</h4>
              <div className="grid grid-cols-3 gap-6 max-w-4xl">
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Admission Number</label>
                  <input type="text" value={admissionNumber} onChange={(e) => setAdmissionNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Roll Number</label>
                  <input type="text" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Course</label>
                  <input type="text" value={course} onChange={(e) => setCourse(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Department</label>
                  <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Class</label>
                  <input type="text" value={studentClass} onChange={(e) => setStudentClass(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Section</label>
                  <input type="text" value={section} onChange={(e) => setSection(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Academic Year</label>
                  <input type="text" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
            </div>

            {/* Parent / Guardian */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Parent / Guardian</h4>
              <div className="grid grid-cols-3 gap-6 max-w-4xl">
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Parent Name</label>
                  <input type="text" value={parentName} onChange={(e) => setParentName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Parent Mobile</label>
                  <input type="text" value={parentMobile} onChange={(e) => setParentMobile(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Parent Email</label>
                  <input type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Address</h4>
              <div className="grid grid-cols-3 gap-6 max-w-4xl">
                <div className="col-span-3">
                  <label className="block text-sm text-gray-700 font-medium mb-1">Address</label>
                  <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">City</label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">State</label>
                  <input type="text" value={state} onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Country</label>
                  <input type="text" value={country} onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Pincode</label>
                  <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
            </div>

            {/* Other Fields */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Other</h4>
              <div className="grid grid-cols-3 gap-6 max-w-4xl">
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Block</label>
                  <input type="text" value={block} onChange={(e) => setBlock(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Room No.</label>
                  <input type="text" value={roomNo} onChange={(e) => setRoomNo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">Wallet</label>
                  <input type="number" value={wallet} onChange={(e) => setWallet(e.target.value)} min="0" step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="col-span-3">
                  <label className="block text-sm text-gray-700 font-medium mb-1">Remarks</label>
                  <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50">
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editId ? "Update" : "Save"}
              </button>
              <button onClick={handleClear}
                className="px-6 py-2 bg-purple-500 text-white rounded-md text-sm font-medium hover:bg-purple-600 transition-colors">
                Clear
              </button>
              <button className="px-6 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors">
                Capture Finger Print
              </button>
            </div>

            {/* Bulk Upload */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex flex-wrap items-end gap-4 max-w-4xl">
                <div className="flex-1">
                  <label className="block text-sm text-gray-700 font-medium mb-1">Upload Excel</label>
                  <input type="file" accept=".xlsx,.xls,.csv"
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors whitespace-nowrap">
                  Upload Excel
                </button>
                <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Students
                </button>
                <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Student List Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Student List</h2>
          <div className="flex items-center gap-2">
            <button onClick={handleExportCsv} disabled={students.length === 0}
              className="px-3 py-1 bg-emerald-500 text-white rounded-md text-xs font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50">
              Export CSV
            </button>
            <button onClick={() => setShowStudentList(!showStudentList)} className="text-gray-500 hover:text-gray-700">
              {showStudentList ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {showStudentList && (
          <>
            {/* Filters */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Show</span>
                    <select value={entriesPerPage} onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-gray-600">entries</span>
                  </div>
                  <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <input type="text" value={courseFilter} onChange={(e) => { setCourseFilter(e.target.value); setCurrentPage(1); }} placeholder="Course"
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[120px]" />
                  <input type="text" value={departmentFilter} onChange={(e) => { setDepartmentFilter(e.target.value); setCurrentPage(1); }} placeholder="Department"
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[120px]" />
                  <input type="text" value={academicYearFilter} onChange={(e) => { setAcademicYearFilter(e.target.value); setCurrentPage(1); }} placeholder="Academic Year"
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[130px]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Search:</span>
                  <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead>
                  <tr className="bg-[#3d9a7e] text-white">
                    <th className="px-4 py-3 text-left text-xs font-semibold w-12">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold w-28">ACTIONS</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none hover:bg-[#358a6e]" onClick={() => handleSort("id")}>
                      STUDENT ID <SortIcon column="id" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none hover:bg-[#358a6e]" onClick={() => handleSort("firstName")}>
                      STUDENT NAME <SortIcon column="firstName" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none hover:bg-[#358a6e]" onClick={() => handleSort("admissionNumber")}>
                      ADMISSION NO <SortIcon column="admissionNumber" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none hover:bg-[#358a6e]" onClick={() => handleSort("rollNumber")}>
                      ROLL NO <SortIcon column="rollNumber" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none hover:bg-[#358a6e]" onClick={() => handleSort("course")}>
                      COURSE <SortIcon column="course" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none hover:bg-[#358a6e]" onClick={() => handleSort("department")}>
                      DEPT <SortIcon column="department" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none hover:bg-[#358a6e]" onClick={() => handleSort("mobileNumber")}>
                      MOBILE <SortIcon column="mobileNumber" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none hover:bg-[#358a6e]" onClick={() => handleSort("isActive")}>
                      STATUS <SortIcon column="isActive" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none hover:bg-[#358a6e]" onClick={() => handleSort("createdAt")}>
                      CREATED <SortIcon column="createdAt" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-12 text-center text-sm text-gray-500">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading students...
                        </div>
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-8 text-center text-sm text-gray-500">
                        No data available in table
                      </td>
                    </tr>
                  ) : (
                    students.map((student, index) => (
                      <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">{startIndex + index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setViewStudent(student)} className="text-gray-500 hover:text-gray-700" title="View">
                              <Eye size={16} />
                            </button>
                            <button onClick={() => handleEdit(student)} className="text-blue-600 hover:text-blue-800" title="Edit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button onClick={() => handleToggleStatus(student)}
                              className={`text-xs font-medium px-2 py-0.5 rounded ${student.isActive ? "text-emerald-700 hover:bg-emerald-50" : "text-red-700 hover:bg-red-50"}`}
                              title={student.isActive ? "Deactivate" : "Activate"}>
                              {student.isActive ? "Active" : "Inactive"}
                            </button>
                            <button onClick={() => handleDeleteClick(student.id, `${student.firstName} ${student.lastName || ""}`.trim())}
                              className="text-red-600 hover:text-red-800" title="Delete">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-mono">{student.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                          {student.firstName}{student.lastName ? " " + student.lastName : ""}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{student.admissionNumber || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-mono">{student.rollNumber || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{student.course || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{student.department || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{student.mobileNumber || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                            {student.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatDate(student.createdAt)}</td>
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
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700 font-medium">{currentPage}</span>
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
