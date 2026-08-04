"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { type CartItem } from "./data";
import { type CustomerData } from "./AddCustomerModal";
import {
  useCompanyBranding,
  getCompanyColors,
} from "@/components/branding/CompanyBrandingProvider";

interface POSRightPanelProps {
  cart: CartItem[];
  total: number;
  discPercent: number;
  discAmount: number;
  taxAmount: number;
  creditBill: boolean;
  complimentBill: boolean;
  remarks: string;
  amountGiven: number;
  selectedPayment: string;
  selectedCustomer: CustomerData | null;
  onDiscPercentChange: (val: number) => void;
  onDiscAmountChange: (val: number) => void;
  onTaxAmountChange: (val: number) => void;
  onCreditChange: (val: boolean) => void;
  onComplimentChange: (val: boolean) => void;
  onRemarksChange: (val: string) => void;
  onAmountGivenChange: (val: number) => void;
  onPaymentChange: (val: string) => void;
  onUpdateQty: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
  onClearCart: () => void;
  onPrint: () => void;
  onHold: () => void;
  onNoPrint: () => void;
  onAddCustomer: () => void;
  onChangeCustomer: () => void;
}

const PAYMENT_METHODS = ["CASH", "CARD", "UPI", "WALLET"];

export default function POSRightPanel({
  cart,
  total,
  discPercent,
  discAmount,
  taxAmount,
  creditBill,
  complimentBill,
  remarks,
  amountGiven,
  selectedPayment,
  selectedCustomer,
  onDiscPercentChange,
  onDiscAmountChange,
  onTaxAmountChange,
  onCreditChange,
  onComplimentChange,
  onRemarksChange,
  onAmountGivenChange,
  onPaymentChange,
  onUpdateQty,
  onRemove,
  onClearCart,
  onPrint,
  onHold,
  onNoPrint,
  onAddCustomer,
  onChangeCustomer,
}: POSRightPanelProps) {
  const { companyName } = useCompanyBranding();
  const companyColors = getCompanyColors(companyName);
  return (
    <div className="space-y-3">
      {/* Company Name */}
      <button
        className="w-full text-white text-sm font-semibold py-3 rounded-xl shadow-sm"
        style={{
          background: `linear-gradient(to right, ${companyColors.from}, ${companyColors.to})`,
        }}
      >
        {companyName || "Laundry Service"}
      </button>

      {/* Attender & Customer */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
        <div className="flex items-center gap-2">
          <select className="flex-1 border border-gray-200 text-sm text-gray-600 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Select Attender</option>
            <option>Attender 1</option>
            <option>Attender 2</option>
          </select>
          {selectedCustomer ? (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-800 truncate">{selectedCustomer.name}</p>
                <button
                  onClick={onChangeCustomer}
                  className="text-xs text-red-500 hover:text-red-600 ml-2"
                >
                  Change
                </button>
              </div>
              <p className="text-xs text-gray-500 truncate">{selectedCustomer.mobile}</p>
            </div>
          ) : (
            <button
              onClick={onAddCustomer}
              className="bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              + Customer
            </button>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 min-h-[120px] max-h-[200px] overflow-y-auto">
        {cart.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No items in cart</p>
          </div>
        ) : (
          <div className="space-y-2">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{item.product.name}</p>
                  <p className="text-xs text-gray-500">₹{item.product.price} × {item.qty}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateQty(item.id, item.qty - 1)}
                    className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-sm font-medium w-6 text-center">{item.qty}</span>
                  <button
                    onClick={() => onUpdateQty(item.id, item.qty + 1)}
                    className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="w-6 h-6 flex items-center justify-center rounded text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total */}
      <div className="bg-[#1e293b] rounded-xl shadow-sm p-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-300">TOTAL</span>
        <span className="text-xl font-bold text-white">{total.toFixed(2)}</span>
      </div>

      {/* Discount & Tax */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-gray-600">Disc%</span>
            <input
              type="number"
              value={discPercent || ""}
              onChange={(e) => onDiscPercentChange(Number(e.target.value))}
              className="w-14 border border-gray-200 text-sm px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="%"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-gray-600">Disc Amt</span>
            <input
              type="number"
              value={discAmount || ""}
              onChange={(e) => onDiscAmountChange(Number(e.target.value))}
              className="w-20 border border-gray-200 text-sm px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-gray-600">Tax</span>
            <input
              type="number"
              value={taxAmount || ""}
              onChange={(e) => onTaxAmountChange(Number(e.target.value))}
              className="w-16 border border-gray-200 text-sm px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={creditBill}
              onChange={(e) => onCreditChange(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-600">Credit</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={complimentBill}
              onChange={(e) => onComplimentChange(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-600">Comp.</span>
          </label>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
        <div className="grid grid-cols-4 gap-2">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method}
              onClick={() => onPaymentChange(method)}
              className={`py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedPayment === method
                  ? "bg-[#1e293b] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {method}
            </button>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {PAYMENT_METHODS.map((method) => (
            <input
              key={method}
              type="number"
              className="border border-gray-200 text-sm px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          ))}
        </div>
      </div>

      {/* Amount Given & Due */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={amountGiven || ""}
            onChange={(e) => onAmountGivenChange(Number(e.target.value))}
            className="flex-1 border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Amt given"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Amount Due</span>
            <span className="text-lg font-bold text-[#1e293b]">{(total - amountGiven).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Remarks */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
        <input
          type="text"
          value={remarks}
          onChange={(e) => onRemarksChange(e.target.value)}
          className="w-full border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Remarks"
        />
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
        <div className="flex gap-2">
          <button
            onClick={onPrint}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white text-sm font-semibold py-3 rounded-xl shadow-sm transition-colors"
          >
            Print Bill
            <span className="bg-white/25 text-[10px] font-bold px-1.5 py-0.5 rounded ml-1.5">
              F10
            </span>
          </button>
          <button
            onClick={onHold}
            className="flex-1 bg-gradient-to-r from-billora-primary to-billora-accent hover:from-billora-primary-dark hover:to-billora-primary text-white text-sm font-semibold py-3 rounded-xl shadow-sm transition-colors"
          >
            Hold
          </button>
          <button
            onClick={onNoPrint}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold py-3 rounded-xl shadow-sm transition-colors"
          >
            No Print
          </button>
        </div>
      </div>
    </div>
  );
}