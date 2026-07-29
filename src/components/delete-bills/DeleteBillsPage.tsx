"use client";

import { useState, useRef, useEffect } from 'react';
import { Search, Maximize2, Settings, X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { sampleBills, DeleteBill } from './data';

export default function DeleteBillsPage() {
  const [selectedDate, setSelectedDate] = useState('28/07/2026');
  const [paymentModes, setPaymentModes] = useState({
    cash: true,
    card: true,
    upi: true,
    wallet: true,
  });
  const [laundryService, setLaundryService] = useState(true);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedBills, setSelectedBills] = useState<Set<string>>(new Set());
  const [fromBillId, setFromBillId] = useState('');
  const [toBillId, setToBillId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBills, setFilteredBills] = useState<DeleteBill[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [dateInputValue, setDateInputValue] = useState('28/07/2026');

  useEffect(() => {
    setFilteredBills(sampleBills);
  }, []);

  const paymentFilteredBills = filteredBills.filter((bill) => {
    return (
      (paymentModes.cash && bill.paymentMode === 'CASH') ||
      (paymentModes.card && bill.paymentMode === 'CARD') ||
      (paymentModes.upi && bill.paymentMode === 'UPI') ||
      (paymentModes.wallet && bill.paymentMode === 'WALLET')
    );
  });

  const searchFilteredBills = searchQuery
    ? paymentFilteredBills.filter(
        (bill) =>
          bill.billNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bill.billDate.includes(searchQuery) ||
          bill.orderType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bill.payModes.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : paymentFilteredBills;

  const handlePaymentModeToggle = (mode: keyof typeof paymentModes) => {
    setPaymentModes((prev) => ({ ...prev, [mode]: !prev[mode] }));
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedBills(new Set());
      setSelectAll(false);
    } else {
      const allBillNos = new Set(searchFilteredBills.map((b) => b.billNo));
      setSelectedBills(allBillNos);
      setSelectAll(true);
    }
  };

  const handleBillSelect = (billNo: string) => {
    setSelectedBills((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(billNo)) {
        newSet.delete(billNo);
        setSelectAll(false);
      } else {
        newSet.add(billNo);
        if (newSet.size === searchFilteredBills.length) {
          setSelectAll(true);
        }
      }
      return newSet;
    });
  };

  const handleDelete = () => {
    if (selectedBills.size > 0) {
      setShowConfirmModal(true);
    }
  };

  const confirmDelete = () => {
    setFilteredBills((prev) => prev.filter((bill) => !selectedBills.has(bill.billNo)));
    setSelectedBills(new Set());
    setSelectAll(false);
    setShowConfirmModal(false);
  };

  const handleClear = () => {
    setPaymentModes({ cash: true, card: true, upi: true, wallet: true });
    setLaundryService(true);
    setSelectedBills(new Set());
    setSelectAll(false);
    setFromBillId('');
    setToBillId('');
    setSearchQuery('');
    setDateInputValue('28/07/2026');
    setSelectedDate('28/07/2026');
    setFilteredBills(sampleBills);
  };

  const handleViewBills = () => {
    let result = [...sampleBills];
    if (dateInputValue) {
      result = result.filter((bill) => bill.billDate === dateInputValue);
    }
    if (fromBillId) {
      result = result.filter((bill) => bill.billNo >= fromBillId);
    }
    if (toBillId) {
      result = result.filter((bill) => bill.billNo <= toBillId);
    }
    setFilteredBills(result);
    setSelectedBills(new Set());
    setSelectAll(false);
  };

  const handleFilter = () => {
    handleViewBills();
  };

  const formatCurrency = (amount: number) => amount.toFixed(2);

  const totalBills = searchFilteredBills.length;
  const totalAmount = searchFilteredBills.reduce((sum, bill) => sum + bill.grandTotal, 0);

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Top Row: Search Bill + Summary */}
      <div className="flex gap-4">
        {/* Search Bill Panel - Left ~60% */}
        <div className="flex-[3] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Title Bar */}
          <div className="bg-[#f2f5f9] px-4 py-3 flex items-center justify-between border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">Search Bill</h3>
            <div className="flex items-center gap-2">
              <button className="text-gray-500 hover:text-gray-700">
                <Maximize2 className="w-4 h-4" />
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                <Settings className="w-4 h-4" />
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Row 1: Date + Checkboxes */}
            <div className="flex items-start gap-8 mb-5">
              {/* Date Picker */}
              <div className="flex-shrink-0">
                <input
                  type="date"
                  value={dateInputValue.split('/').reverse().join('-')}
                  onChange={(e) => {
                    const [year, month, day] = e.target.value.split('-');
                    setDateInputValue(`${day}/${month}/${year}`);
                    setSelectedDate(`${day}/${month}/${year}`);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Payment Mode Checkboxes */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={paymentModes.cash}
                    onChange={() => handlePaymentModeToggle('cash')}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="text-xs text-gray-700">CASH</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={paymentModes.card}
                    onChange={() => handlePaymentModeToggle('card')}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="text-xs text-gray-700">CARD</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={paymentModes.upi}
                    onChange={() => handlePaymentModeToggle('upi')}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="text-xs text-gray-700">UPI</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={paymentModes.wallet}
                    onChange={() => handlePaymentModeToggle('wallet')}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="text-xs text-gray-700">Wallet</label>
                </div>
              </div>

              {/* Laundry Service */}
              <div className="flex items-center gap-2 ml-8">
                <input
                  type="checkbox"
                  checked={laundryService}
                  onChange={() => setLaundryService(!laundryService)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-xs text-gray-700">Laundry Service</label>
              </div>
            </div>

            {/* Row 2: Bill ID */}
            <div className="flex items-center gap-4 mb-5">
              <label className="text-xs text-gray-700 font-medium">Bill ID</label>
              <input
                type="text"
                value={fromBillId}
                onChange={(e) => setFromBillId(e.target.value)}
                placeholder="From Bill ID"
                className="w-48 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                value={toBillId}
                onChange={(e) => setToBillId(e.target.value)}
                placeholder="To Bill ID"
                className="w-48 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleFilter}
                className="px-6 py-2 bg-purple-600 text-white rounded-full text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Filter
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-5"></div>

            {/* Row 3: Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleViewBills}
                className="px-5 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                View Bills
              </button>
              <button
                onClick={handleClear}
                className="px-5 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleDelete}
                disabled={selectedBills.size === 0}
                className="px-5 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Bills
              </button>
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            {/* Select All Bills text */}
            <div className="mt-2">
              <span className="text-xs text-gray-700">Select All Bills</span>
            </div>
          </div>
        </div>

        {/* Summary Panel - Right ~40% - Small */}
        <div className="flex-[2] flex flex-col justify-start bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-fit">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 font-medium">No. of Bills:</span>
              <span className="text-sm font-semibold text-emerald-600">{totalBills}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 font-medium">Total:</span>
              <span className="text-sm font-semibold text-emerald-600">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header Controls */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button className="bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-red-700 transition-colors">
              PDF
            </button>
            <button className="bg-emerald-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-emerald-700 transition-colors">
              Excel
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Search:</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder=""
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#3d9a7e] text-white">
                <th className="px-4 py-3 text-left w-10"></th>
                <th className="px-4 py-3 text-left text-xs font-semibold">BILL NO</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">BILL DATE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">CREATED DATE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">ORDER TYPE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">SUB TOTAL</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">DISCOUNT</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">GRAND TOTAL</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">PAID AMOUNT</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">PAY MODES</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">DELETE</th>
              </tr>
            </thead>
            <tbody>
              {searchFilteredBills.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-sm text-gray-500">
                    No data available in table
                  </td>
                </tr>
              ) : (
                searchFilteredBills.map((bill) => (
                  <tr
                    key={bill.billNo}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      selectedBills.has(bill.billNo) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedBills.has(bill.billNo)}
                        onChange={() => handleBillSelect(bill.billNo)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{bill.billNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{bill.billDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{bill.createdDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{bill.orderType}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(bill.subTotal)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(bill.discount)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(bill.grandTotal)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(bill.paidAmount)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{bill.payModes}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelectedBills(new Set([bill.billNo]));
                          setShowConfirmModal(true);
                        }}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50">
          <span className="text-sm text-gray-600">
            Showing {searchFilteredBills.length > 0 ? 1 : 0} to {searchFilteredBills.length} of {searchFilteredBills.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded hover:bg-gray-200 text-gray-400">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">1</button>
            <button className="p-1 rounded hover:bg-gray-200 text-gray-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[400px] overflow-hidden">
            <div className="bg-amber-500 px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-semibold">Confirm Delete</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-white hover:text-amber-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete the selected bill(s)? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
