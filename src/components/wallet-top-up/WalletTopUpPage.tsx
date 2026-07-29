"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Download } from "lucide-react";
import { sampleWalletTransactions, WalletTransaction, paymentModes } from "./data";
import { sampleCustomers, Customer } from "../customer/data";

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

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

export default function WalletTopUpPage() {
  const [cardNumber, setCardNumber] = useState("");
  const [mobile, setMobile] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [paymentMode, setPaymentMode] = useState("");
  const [enterAmount, setEnterAmount] = useState("");

  const [bulkPaymentMode, setBulkPaymentMode] = useState("");
  const [bulkFile, setBulkFile] = useState<File | null>(null);

  const [showWalletTopUp, setShowWalletTopUp] = useState(true);
  const [showAddMoney, setShowAddMoney] = useState(true);
  const [showBulkTopUp, setShowBulkTopUp] = useState(true);

  const [transactions, setTransactions] = useState<WalletTransaction[]>(sampleWalletTransactions);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleCardNumberChange = (value: string) => {
    setCardNumber(value);
    const match = sampleCustomers.find(
      (c) => c.loyaltyCardNumber === value || c.id === value
    );
    if (match) {
      setSelectedCustomer(match);
      setMobile(match.mobile);
      setEmployeeId(match.employeeId);
      setName(match.customerName);
      setWalletBalance(match.wallet);
    } else {
      setSelectedCustomer(null);
      setMobile("");
      setEmployeeId("");
      setName("");
      setWalletBalance(0);
    }
  };

  const handleMobileChange = (value: string) => {
    setMobile(value);
    const match = sampleCustomers.find((c) => c.mobile === value);
    if (match) {
      setSelectedCustomer(match);
      setCardNumber(match.loyaltyCardNumber || match.id);
      setEmployeeId(match.employeeId);
      setName(match.customerName);
      setWalletBalance(match.wallet);
    }
  };

  const handleEmployeeIdChange = (value: string) => {
    setEmployeeId(value);
    const match = sampleCustomers.find((c) => c.employeeId === value);
    if (match) {
      setSelectedCustomer(match);
      setCardNumber(match.loyaltyCardNumber || match.id);
      setMobile(match.mobile);
      setName(match.customerName);
      setWalletBalance(match.wallet);
    }
  };

  const handleQuickAmount = (amount: number) => {
    const current = parseFloat(enterAmount) || 0;
    setEnterAmount((current + amount).toFixed(2));
  };

  const handleAddMoney = () => {
    const amount = parseFloat(enterAmount);
    if (!amount || amount <= 0) return;
    if (!paymentMode || paymentMode === "-- Payment Mode --") return;

    const newBalance = walletBalance + amount;
    setWalletBalance(newBalance);

    const transaction: WalletTransaction = {
      id: Date.now().toString(),
      cardNumber,
      employeeId,
      customerName: name,
      mobile,
      amount,
      paymentMode,
      transactionDate: new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
      status: "Completed",
    };
    setTransactions((prev) => [transaction, ...prev]);

    setSuccessMessage(`₹${amount.toFixed(2)} added to wallet successfully! New balance: ₹${newBalance.toFixed(2)}`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    setEnterAmount("");
    setPaymentMode("");
  };

  const handleClearTopUp = () => {
    setEnterAmount("");
    setPaymentMode("");
  };

  const handleClearAll = () => {
    setCardNumber("");
    setMobile("");
    setEmployeeId("");
    setName("");
    setWalletBalance(0);
    setSelectedCustomer(null);
    setEnterAmount("");
    setPaymentMode("");
  };

  const handleBulkClear = () => {
    setBulkPaymentMode("");
    setBulkFile(null);
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm font-medium max-w-md">
          {successMessage}
        </div>
      )}

      <div className="flex gap-4">
        {/* Wallet Top Up - Left */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800">Wallet Top Up</h2>
              <button
                onClick={() => setShowWalletTopUp(!showWalletTopUp)}
                className="text-gray-500 hover:text-gray-700"
              >
                {showWalletTopUp ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            {showWalletTopUp && (
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6 max-w-xl">
                  <FormField label="Food Card Number" required>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Mobile">
                    <input
                      type="text"
                      value={mobile}
                      onChange={(e) => handleMobileChange(e.target.value)}
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Employee ID">
                    <input
                      type="text"
                      value={employeeId}
                      onChange={(e) => handleEmployeeIdChange(e.target.value)}
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Name">
                    <input
                      type="text"
                      value={name}
                      readOnly
                      className={inputClass + " bg-gray-50"}
                    />
                  </FormField>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add money to Wallet - Right */}
        <div className="w-[480px] flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800">Add money to Wallet</h2>
              <button
                onClick={() => setShowAddMoney(!showAddMoney)}
                className="text-gray-500 hover:text-gray-700"
              >
                {showAddMoney ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            {showAddMoney && (
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-700 font-medium">Wallet Balance</span>
                  <span className="text-sm text-gray-800 font-semibold">{walletBalance.toFixed(2)}</span>
                </div>

                <FormField label="Payment Mode" required>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className={inputClass}
                  >
                    {paymentModes.map((mode) => (
                      <option key={mode} value={mode === "-- Payment Mode --" ? "" : mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Enter Amount" required>
                  <input
                    type="text"
                    value={enterAmount}
                    onChange={(e) => setEnterAmount(e.target.value)}
                    className={inputClass}
                  />
                </FormField>

                <div className="flex items-center gap-3">
                  {[50, 100, 200, 500].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => handleQuickAmount(amt)}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-white rounded-md text-sm font-medium transition-colors"
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleAddMoney}
                    className="px-6 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors"
                  >
                    Add money to Wallet
                  </button>
                  <button
                    onClick={handleClearTopUp}
                    className="px-6 py-2 bg-purple-500 text-white rounded-md text-sm font-medium hover:bg-purple-600 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Wallet Top Up */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#f2f5f9] px-6 py-3 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-gray-800">Bulk Wallet Top Up</h2>
            <span className="text-sm text-gray-500">Add money to multiple wallets from an Excel file</span>
          </div>
          <button
            onClick={() => setShowBulkTopUp(!showBulkTopUp)}
            className="text-gray-500 hover:text-gray-700"
          >
            {showBulkTopUp ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        {showBulkTopUp && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-6">
              <FormField label="Payment Mode" required>
                <select
                  value={bulkPaymentMode}
                  onChange={(e) => setBulkPaymentMode(e.target.value)}
                  className="w-[320px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {paymentModes.map((mode) => (
                    <option key={mode} value={mode === "-- Payment Mode --" ? "" : mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </FormField>

              <div className="pt-6">
                <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <FormField label="Excel File" required>
                <div className="flex items-center">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="bulk-file-input"
                  />
                  <label
                    htmlFor="bulk-file-input"
                    className="px-4 py-2 border border-gray-300 rounded-l-md text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                  >
                    Choose file
                  </label>
                  <span className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md text-sm text-gray-500 flex-1 min-w-[200px]">
                    {bulkFile ? bulkFile.name : "No file chosen"}
                  </span>
                </div>
              </FormField>

              <div className="flex items-center gap-3 pt-6">
                <button className="px-6 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors">
                  Upload
                </button>
                <button
                  onClick={handleBulkClear}
                  className="px-6 py-2 bg-purple-500 text-white rounded-md text-sm font-medium hover:bg-purple-600 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Template columns: CustomerID, CustomerName, CardNumber, CustomerType, Amount. Only fill the Amount column. Select a payment mode, choose the filled template, then click Upload.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
