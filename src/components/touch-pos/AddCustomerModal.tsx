"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";

export interface CustomerData {
  mobile: string;
  name: string;
  address: string;
  landmark: string;
  additionalMobile: string;
  wallet: string;
  attender: string;
}

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: CustomerData) => void;
}

const INITIAL_STATE: CustomerData = {
  mobile: "",
  name: "",
  address: "",
  landmark: "",
  additionalMobile: "",
  wallet: "",
  attender: "",
};

export default function AddCustomerModal({
  isOpen,
  onClose,
  onSave,
}: AddCustomerModalProps) {
  const [form, setForm] = useState<CustomerData>(INITIAL_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerData, string>>>({});

  const handleChange = useCallback(
    (field: keyof CustomerData, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const validate = useCallback(() => {
    const newErrors: Partial<Record<keyof CustomerData, string>> = {};
    if (!form.mobile.trim()) {
      newErrors.mobile = "Mobile is required";
    }
    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    }
    return newErrors;
  }, [form]);

  const handleSave = useCallback(() => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSave(form);
    setForm(INITIAL_STATE);
    onClose();
  }, [form, validate, onSave, onClose]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-[480px] max-w-[90vw] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-400 px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Customer Details</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="p-5 space-y-4">
          {/* Mobile */}
          <div className="flex items-center gap-4">
            <label className="w-20 text-sm font-medium text-gray-700">
              Mobile:
            </label>
            <div className="flex-1">
              <input
                type="tel"
                value={form.mobile}
                onChange={(e) => handleChange("mobile", e.target.value)}
                className={`w-full border ${
                  errors.mobile ? "border-red-500" : "border-gray-200"
                } text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                placeholder=""
              />
              {errors.mobile && (
                <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="flex items-center gap-4">
            <label className="w-20 text-sm font-medium text-gray-700">
              Name:
            </label>
            <div className="flex-1">
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`w-full border ${
                  errors.name ? "border-red-500" : "border-gray-200"
                } text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                placeholder=""
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>
          </div>

          {/* Address & Landmark */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Address"
            />
            <input
              type="text"
              value={form.landmark}
              onChange={(e) => handleChange("landmark", e.target.value)}
              className="border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Landmark"
            />
          </div>

          {/* Additional Mobile & Attender */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="tel"
              value={form.additionalMobile}
              onChange={(e) => handleChange("additionalMobile", e.target.value)}
              className="border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Additional Mobile"
            />
            <select
              value={form.attender}
              onChange={(e) => handleChange("attender", e.target.value)}
              className="border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-600"
            >
              <option value="">Select</option>
              <option value="attender1">Attender 1</option>
              <option value="attender2">Attender 2</option>
            </select>
          </div>

          {/* Wallet */}
          <div className="flex items-center gap-4">
            <label className="w-20 text-sm font-medium text-gray-700">
              Wallet:
            </label>
            <input
              type="text"
              value={form.wallet}
              onChange={(e) => handleChange("wallet", e.target.value)}
              className="flex-1 border border-gray-200 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder=""
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex items-center justify-end gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2 rounded-lg shadow-sm transition-colors"
          >
            <span>✓</span>
            OK
          </button>
          <button
            onClick={onClose}
            className="border border-gray-300 text-gray-600 text-sm font-medium px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}