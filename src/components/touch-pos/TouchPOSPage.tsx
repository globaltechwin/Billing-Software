"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import TouchPOSTopBar from "./TouchPOSTopBar";
import POSCategories from "./POSCategories";
import POSProductGrid from "./POSProductGrid";
import POSRightPanel from "./POSRightPanel";
import AddCustomerModal, { type CustomerData } from "./AddCustomerModal";
import { type Product, type CartItem } from "./data";

let nextId = 1;

export default function TouchPOSPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([{ id: "all", name: "All" }]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadLiveData() {
      setProductsLoading(true);
      setProductsError("");
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch("/api/products", { cache: "no-store" }),
          fetch("/api/product-categories", { cache: "no-store" }),
        ]);
        if (!productsResponse.ok) throw new Error("Could not load products from the database.");
        const productsData = await productsResponse.json();
        if (!productsData.success || !Array.isArray(productsData.products)) throw new Error("The products API returned an invalid response.");
        const liveProducts: Product[] = productsData.products
          .filter((p: Record<string, unknown>) => p.isActive !== false)
          .map((p: Record<string, unknown>) => ({
            id: Number(p.id),
            name: String(p.productName ?? ""),
            productCode: typeof p.productCode === "string" ? p.productCode : null,
            barcode: typeof p.barcode === "string" ? p.barcode : null,
            price: Number(p.sellingPrice ?? 0),
            category: String(p.category ?? "Uncategorized"),
            gstRate: Number((p.gstMaster as Record<string, unknown> | undefined)?.totalPercentage ?? 0),
            color: ["bg-amber-100", "bg-green-100", "bg-blue-100", "bg-pink-100", "bg-yellow-100", "bg-purple-100", "bg-red-100", "bg-teal-100"][Number(p.id) % 8],
          }))
          .filter((p: Product) => Number.isFinite(p.id) && p.name.length > 0);
        let liveCategories: { id: string; name: string }[] = [];
        if (categoriesResponse.ok) {
          const categoryData = await categoriesResponse.json();
          if (categoryData.success && Array.isArray(categoryData.categories)) {
            liveCategories = categoryData.categories
              .filter((c: { isActive?: boolean; name?: string }) => c.isActive !== false && typeof c.name === "string")
              .map((c: { name: string }) => ({ id: c.name, name: c.name }));
          }
        }
        const productCategoryNames = liveProducts.map(p => p.category).filter(name => name && name !== "Uncategorized");
        const names = [...new Set([...liveCategories.map(c => c.name), ...productCategoryNames])].sort((a,b) => a.localeCompare(b));
        if (!cancelled) {
          setProducts(liveProducts);
          setCategories([{ id: "all", name: "All" }, ...names.map(name => ({ id: name, name }))]);
          if (activeCategory !== "all" && !names.includes(activeCategory)) setActiveCategory("all");
        }
      } catch (error) {
        if (!cancelled) setProductsError(error instanceof Error ? error.message : "Could not load live products.");
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    }
    loadLiveData();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const filteredProducts = useMemo(() => {
    let items = products;
    if (activeCategory !== "all") {
      items = items.filter((p) => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((p) => p.name.toLowerCase().includes(q) || (p.productCode ?? "").toLowerCase().includes(q) || (p.barcode ?? "").toLowerCase().includes(q));
    }
    return items;
  }, [products, activeCategory, searchQuery]);

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

  const getPaymentMode = () => creditBill ? "CREDIT" : complimentBill ? "COMPLIMENT" : selectedPayment;
  const getSubtotal = () => cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const getDiscount = () => Math.max(0, discAmount + getSubtotal() * Math.max(0, discPercent) / 100);
  const getRemarks = () => [remarks.trim(), selectedCustomer ? `Customer: ${selectedCustomer.name} (${selectedCustomer.mobile})` : ""].filter(Boolean).join(" | ");

  const handleSaveInvoice = useCallback(async (printAfterSave: boolean) => {
    if (!cart.length) { alert("Add at least one product before saving the bill."); return; }
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({ productId: item.product.id, quantity: item.qty, unitPrice: item.product.price, discountPercent: 0, gstRate: item.product.gstRate })),
          gstMode: "GST_ITEM_WISE",
          discountAmount: getDiscount(),
          paymentMode: getPaymentMode(),
          cashReceived: amountGiven,
          remarks: getRemarks(),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Could not save invoice.");
      if (printAfterSave) window.print();
      else alert(`Invoice ${data.invoice?.invoiceNumber || ""} saved successfully.`);
      handleClearCart();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not save invoice. Your cart has been kept.");
    }
  }, [cart, discAmount, discPercent, selectedCustomer, remarks, creditBill, complimentBill, selectedPayment, amountGiven, handleClearCart]);

  const handlePrint = useCallback(() => { void handleSaveInvoice(true); }, [handleSaveInvoice]);

  const handleHold = useCallback(async () => {
    if (!cart.length) { alert("Add at least one product before holding the bill."); return; }
    try {
      const subtotal = getSubtotal();
      const discountAmount = getDiscount();
      const response = await fetch("/api/held-bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: selectedCustomer?.name || null,
          items: cart.map((item) => ({ productId: item.product.id, productName: item.product.name, quantity: item.qty, unitPrice: item.product.price, gstRate: item.product.gstRate })),
          subtotal,
          taxAmount,
          discountAmount,
          grandTotal: Math.max(0, subtotal - discountAmount + taxAmount),
          gstMode: "GST_ITEM_WISE",
          paymentMode: getPaymentMode(),
          remarks: getRemarks(),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Could not hold bill.");
      alert(`Bill ${data.heldBill?.holdNumber || ""} held successfully.`);
      handleClearCart();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not hold bill. Your cart has been kept.");
    }
  }, [cart, selectedCustomer, taxAmount, remarks, discAmount, discPercent, creditBill, complimentBill, selectedPayment, handleClearCart]);

  const handleNoPrint = useCallback(() => { void handleSaveInvoice(false); }, [handleSaveInvoice]);

  const handleSaveCustomer = useCallback((customer: CustomerData) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(false);
  }, []);

  return (
    <div className="p-4 sm:p-5">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* LEFT SIDE — Products */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Top Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
            <TouchPOSTopBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onFullscreen={handleFullscreen}
              isFullscreen={isFullscreen}
              splitEnabled={splitEnabled}
              onSplitToggle={setSplitEnabled}
              onTableView={handleTableView}
            />
          </div>

          {/* Categories */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
            <POSCategories
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>

          {/* Product Grid */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
            {productsError ? <div role="alert" className="text-sm text-red-600 p-4">{productsError}</div> : productsLoading ? <div className="text-sm text-gray-500 p-4">Loading products…</div> : <POSProductGrid
              products={filteredProducts}
              onAddProduct={handleAddProduct}
            />}
          </div>
        </div>

        {/* RIGHT SIDE — Cart & Payment */}
        <div className="w-full lg:w-[340px] flex-shrink-0">
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