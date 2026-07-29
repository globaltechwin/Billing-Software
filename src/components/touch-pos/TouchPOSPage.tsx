"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import TouchPOSTopBar from "./TouchPOSTopBar";
import POSCategories from "./POSCategories";
import POSProductGrid from "./POSProductGrid";
import POSRightPanel from "./POSRightPanel";
import AddCustomerModal, { type CustomerData } from "./AddCustomerModal";
import { PRODUCTS, type Product, type CartItem } from "./data";

let nextId = 1;

export default function TouchPOSPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discPercent, setDiscPercent] = useState(0);
  const [discAmount, setDiscAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [creditBill, setCreditBill] = useState(false);
  const [complimentBill, setComplimentBill] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [amountGiven, setAmountGiven] = useState(0);
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("CASH");
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);

  const filteredProducts = useMemo(() => {
    let items = PRODUCTS;
    if (activeCategory !== "all") {
      items = items.filter((p) => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((p) => p.name.toLowerCase().includes(q));
    }
    return items;
  }, [activeCategory, searchQuery]);

  const total = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
    return subtotal - discAmount + taxAmount;
  }, [cart, discAmount, taxAmount]);

  const handleAddProduct = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { id: nextId++, product, qty: 1 }];
    });
  }, []);

  const handleUpdateQty = useCallback((id: number, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCart((prev) =>
        prev.map((item) => (item.id === id ? { ...item, qty } : item))
      );
    }
  }, []);

  const handleRemove = useCallback((id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleClearCart = useCallback(() => {
    setCart([]);
    setDiscPercent(0);
    setDiscAmount(0);
    setTaxAmount(0);
    setAmountGiven(0);
    setRemarks("");
  }, []);

  const handleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  const handleTableView = useCallback(() => {
    router.push("/billing");
  }, [router]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleHold = useCallback(() => {
    alert(`Bill held! ${cart.length} items saved.`);
    handleClearCart();
  }, [cart, handleClearCart]);

  const handleNoPrint = useCallback(() => {
    alert("Bill saved without printing!");
    handleClearCart();
  }, [handleClearCart]);

  const handleSaveCustomer = useCallback((customer: CustomerData) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(false);
  }, []);

  return (
    <div className="p-4 sm:p-5">
      <div className="flex gap-4">
        {/* LEFT SIDE — Products */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Top Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
            <TouchPOSTopBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onFullscreen={handleFullscreen}
              splitEnabled={splitEnabled}
              onSplitToggle={setSplitEnabled}
              onTableView={handleTableView}
            />
          </div>

          {/* Categories */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
            <POSCategories
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>

          {/* Product Grid */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
            <POSProductGrid
              products={filteredProducts}
              onAddProduct={handleAddProduct}
            />
          </div>
        </div>

        {/* RIGHT SIDE — Cart & Payment */}
        <div className="w-[340px] flex-shrink-0">
          <POSRightPanel
            cart={cart}
            total={total}
            discPercent={discPercent}
            discAmount={discAmount}
            taxAmount={taxAmount}
            creditBill={creditBill}
            complimentBill={complimentBill}
            remarks={remarks}
            amountGiven={amountGiven}
            selectedPayment={selectedPayment}
            selectedCustomer={selectedCustomer}
            onDiscPercentChange={setDiscPercent}
            onDiscAmountChange={setDiscAmount}
            onTaxAmountChange={setTaxAmount}
            onCreditChange={setCreditBill}
            onComplimentChange={setComplimentBill}
            onRemarksChange={setRemarks}
            onAmountGivenChange={setAmountGiven}
            onPaymentChange={setSelectedPayment}
            onUpdateQty={handleUpdateQty}
            onRemove={handleRemove}
            onClearCart={handleClearCart}
            onPrint={handlePrint}
            onHold={handleHold}
            onNoPrint={handleNoPrint}
            onAddCustomer={() => setShowCustomerModal(true)}
            onChangeCustomer={() => setSelectedCustomer(null)}
          />
        </div>
      </div>

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSave={handleSaveCustomer}
      />
    </div>
  );
}