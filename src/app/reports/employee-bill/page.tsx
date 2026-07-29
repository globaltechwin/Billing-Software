"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Settings, X, Download, Search } from "lucide-react";

interface EmployeeBillRow {
  id: string;
  billNo: string;
  grandTotal: number;
  billDate: string;
  session: string;
  employeeId: string;
  employeeName: string;
  mobile: string;
  department: string;
  cardNumber: string;
  createdBy: string;
  createdDate: string;
}

const sampleData: EmployeeBillRow[] = [
  {
    id: "1",
    billNo: "BILL-001",
    grandTotal: 1250.00,
    billDate: "28/07/2026",
    session: "Morning",
    employeeId: "EMP001",
    employeeName: "Ravi Kumar",
    mobile: "9876543210",
    department: "Sales",
    cardNumber: "CARD-1001",
    createdBy: "admin",
    createdDate: "28/07/2026 09:15:00",
  },
  {
    id: "2",
    billNo: "BILL-002",
    grandTotal: 875.50,
    billDate: "28/07/2026",
    session: "Morning",
    employeeId: "EMP002",
    employeeName: "Suresh Patel",
    mobile: "9876543211",
    department: "Billing",
    cardNumber: "CARD-1002",
    createdBy: "admin",
    createdDate: "28/07/2026 10:30:00",
  },
  {
    id: "3",
    billNo: "BILL-003",
    grandTotal: 2100.00,
    billDate: "28/07/2026",
    session: "Afternoon",
    employeeId: "EMP001",
    employeeName: "Ravi Kumar",
    mobile: "9876543210",
    department: "Sales",
    cardNumber: "CARD-1001",
    createdBy: "admin",
    createdDate: "28/07/2026 13:45:00",
  },
  {
    id: "4",
    billNo: "BILL-004",
    grandTotal: 450.00,
    billDate: "28/07/2026",
    session: "Evening",
    employeeId: "EMP003",
    employeeName: "Anita Sharma",
    mobile: "9876543212",
    department: "Counter",
    cardNumber: "CARD-1003",
    createdBy: "admin",
    createdDate: "28/07/2026 17:20:00",
  },
  {
    id: "5",
    billNo: "BILL-005",
    grandTotal: 3200.00,
    billDate: "28/07/2026",
    session: "Evening",
    employeeId: "EMP002",
    employeeName: "Suresh Patel",
    mobile: "9876543211",
    department: "Billing",
    cardNumber: "CARD-1002",
    createdBy: "admin",
    createdDate: "28/07/2026 18:00:00",
  },
];

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

export default function EmployeeBillReportPage() {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [session, setSession] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [showReport, setShowReport] = useState(true);
  const [reportData, setReportData] = useState<EmployeeBillRow[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const filteredData = searchQuery
    ? reportData.filter(
        (row) =>
          row.billNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row.mobile.includes(searchQuery)
      )
    : reportData;

  const handleViewReport = () => {
    const filtered = sampleData.filter((row) => {
      const rowDate = row.billDate.split("/").reverse().join("-");
      const matchSession = session === "All" || row.session === session;
      return matchSession;
    });
    setReportData(filtered);
    setHasSearched(true);
  };

  const handleClear = () => {
    setStartDate(today);
    setEndDate(today);
    setSession("All");
    setSearchQuery("");
    setReportData([]);
    setHasSearched(false);
  };

  const handleDownloadExcel = () => {
    if (filteredData.length === 0) return;
    const headers = ["BILL NO", "GRAND TOTAL", "BILL DATE", "SESSION", "EMPLOYEE ID", "EMPLOYEE NAME", "MOBILE", "DEPARTMENT", "CARD NUMBER", "CREATED BY", "CREATED DATE"];
    const rows = filteredData.map((row) =>
      [row.billNo, row.grandTotal.toFixed(2), row.billDate, row.session, row.employeeId, row.employeeName, row.mobile, row.department, row.cardNumber, row.createdBy, row.createdDate].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employee-bill-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Filter Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Employee Bill Report</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button className="text-gray-500 hover:text-gray-700 p-1">
              <Settings className="w-4 h-4" />
            </button>
            <button className="text-gray-500 hover:text-gray-700 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {showFilters && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-6 max-w-4xl">
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Start Date<span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  End Date<span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">Session</label>
                <select
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className={inputClass}
                >
                  <option value="All">All</option>
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleViewReport}
                className="px-6 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors"
              >
                View Report
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

      {/* Report Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
          <button
            onClick={handleDownloadExcel}
            disabled={filteredData.length === 0}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Download Excel
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Search:</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[200px]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="bg-[#3d9a7e] text-white">
                <th className="px-4 py-3 text-left text-xs font-semibold">BILL NO</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">GRAND TOTAL</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">BILL DATE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">SESSION</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">EMPLOYEE ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">EMPLOYEE NAME</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">MOBILE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">DEPARTMENT</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">CARD NUMBER</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">CREATED BY</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">CREATED DATE</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-sm text-gray-500">
                    {hasSearched ? "No records found" : "Click View Report to generate the report"}
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">{row.billNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.grandTotal.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.billDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.session}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.employeeId}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">{row.employeeName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.mobile}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.department}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.cardNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.createdBy}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.createdDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
