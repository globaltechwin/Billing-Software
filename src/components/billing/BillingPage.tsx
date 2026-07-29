"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import BillingToolbar from "./BillingToolbar";
import ProductSearch from "./ProductSearch";
import CartTable, { type CartItem } from "./CartTable";
import CustomerPanel from "./CustomerPanel";
import CustomerForm, { type CustomerData } from "./CustomerForm";
import WhatsAppBill from "./WhatsAppBill";
import BillSummary from "./BillSummary";
import BillingActions from "./BillingActions";

const DUMMY_PRODUCTS: Record<string, { price: number }> = {
  "Shirt Wash": { price: 50 },
  "Pant Iron": { price: 30 },
  "Suit Dry Clean": { price: 200 },
  "Saree Wash": { price: 150 },
  "Bed Sheet Wash": { price: 80 },
  "Towel Wash": { price: 25 },
  "Jacket Clean": { price: 180 },
  "Blanket Wash": { price: 120 },
};

let nextId = 1;

export default function BillingPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discPercent, setDiscPercent] = useState(0);
  const [discAmount, setDiscAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [complimentBill, setComplimentBill] = useState(false);
  const [creditBill, setCreditBill] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [amountGiven, setAmountGiven] = useState(0);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty * (1 - item.discPercent / 100),
    0
  );
  const total = subtotal - discAmount + taxAmount;

  const handleAddProduct = useCallback((productName: string) => {
    const product = DUMMY_PRODUCTS[productName];
    if (!product) return;
    setCart((prev) => [
      ...prev,
      {
        id: nextId++,
        name: productName,
        price: product.price,
        qty: 1,
        remarks: "",
        discPercent: 0,
      },
    ]);
  }, []);

  const handleUpdateQty = useCallback((id: number, qty: number) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty } : item))
    );
  }, []);

  const handleUpdateDisc = useCallback((id: number, disc: number) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, discPercent: disc } : item))
    );
  }, []);

  const handleRemove = useCallback((id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  const handleHoldBills = useCallback(() => {
    alert(`Bill held! ${cart.length} items saved.`);
  }, [cart]);

  const handleTableView = useCallback(() => {
    router.push("/billing/kot");
  }, [router]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleHold = useCallback(() => {
    alert(`Bill held! ${cart.length} items saved.`);
    setCart([]);
    setDiscPercent(0);
    setDiscAmount(0);
    setTaxAmount(0);
    setAmountGiven(0);
    setRemarks("");
  }, [cart]);

  const handleNoPrint = useCallback(() => {
    alert("Bill saved without printing!");
    setCart([]);
    setDiscPercent(0);
    setDiscAmount(0);
    setTaxAmount(0);
    setAmountGiven(0);
    setRemarks("");
    setSelectedCustomer(null);
  }, []);

  const handleCustomerSelect = useCallback((customer: CustomerData) => {
    setSelectedCustomer(customer);
    setShowCustomerForm(false);
  }, []);

  const handleClearCustomer = useCallback(() => {
    setSelectedCustomer(null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "F3") {
        e.preventDefault();
        // Laundry Service toggle
      }
      if (e.key === "F6") {
        e.preventDefault();
        handleTableView();
      }
      if (e.key === "F7") {
        e.preventDefault();
        handleHoldBills();
      }
      if (e.key === "F10") {
        e.preventDefault();
        handlePrint();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleTableView, handleHoldBills, handlePrint]);

  return (
    <div className="p-4 sm:p-5">
      <div className="flex gap-4">
        {/* LEFT SIDE — Billing area */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Toolbar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <BillingToolbar
              onFullscreen={handleFullscreen}
              onHoldBills={handleHoldBills}
              onTableView={handleTableView}
            />
          </div>

          {/* Product Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
            <ProductSearch onAddProduct={handleAddProduct} />
          </div>

          {/* Cart Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <CartTable
              items={cart}
              onUpdateQty={handleUpdateQty}
              onUpdateDisc={handleUpdateDisc}
              onRemove={handleRemove}
            />
          </div>
        </div>

        {/* RIGHT SIDE — Customer / Payment */}
        <div className="w-[300px] flex-shrink-0 space-y-3">
          {/* Customer Section */}
          {showCustomerForm ? (
            <CustomerForm
              onCustomerSelect={handleCustomerSelect}
              onClose={() => setShowCustomerForm(false)}
            />
          ) : selectedCustomer ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">
                  Customer
                </span>
                <button
                  onClick={handleClearCustomer}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Change
                </button>
              </div>
              <div className="space-y-1 text-sm">
                {selectedCustomer.name && (
                  <p className="font-medium text-gray-800">
                    {selectedCustomer.name}
                  </p>
                )}
                {selectedCustomer.mobile && (
                  <p className="text-gray-500">{selectedCustomer.mobile}</p>
                )}
                {selectedCustomer.address && (
                  <p className="text-gray-400 text-xs">
                    {selectedCustomer.address}
                    {selectedCustomer.landmark &&
                      `, ${selectedCustomer.landmark}`}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCustomerForm(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white text-sm font-semibold py-3 rounded-xl shadow-sm transition-colors"
            >
              Add Customer+
            </button>
          )}

          {/* Customer Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <CustomerPanel
              discPercent={discPercent}
              discAmount={discAmount}
              taxAmount={taxAmount}
              complimentBill={complimentBill}
              creditBill={creditBill}
              remarks={remarks}
              onDiscPercentChange={setDiscPercent}
              onDiscAmountChange={setDiscAmount}
              onTaxAmountChange={setTaxAmount}
              onComplimentChange={setComplimentBill}
              onCreditChange={setCreditBill}
              onRemarksChange={setRemarks}
            />
          </div>

          {/* WhatsApp Bill */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
            <WhatsAppBill
              enabled={whatsappEnabled}
              onToggle={setWhatsappEnabled}
            />
          </div>

          {/* Bill Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <BillSummary
              total={total}
              prevBillNo="V00004"
              prevBillAmount={10.5}
              amountGiven={amountGiven}
              onAmountGivenChange={setAmountGiven}
            />
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
            <BillingActions
              onPrint={handlePrint}
              onHold={handleHold}
              onNoPrint={handleNoPrint}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
