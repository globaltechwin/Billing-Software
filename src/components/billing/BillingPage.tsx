"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BillingToolbar from "./BillingToolbar";
import ProductSearch from "./ProductSearch";
import CartTable, { type CartItemGST } from "./CartTable";
import CustomerPanel from "./CustomerPanel";
import CustomerForm, { type CustomerData } from "./CustomerForm";
import WhatsAppBill from "./WhatsAppBill";
import BillSummary from "./BillSummary";
import BillingActions from "./BillingActions";
import InvoicePrintPreview from "./InvoicePrintPreview";

export type BillingMode = "WITH_GST" | "WITH_GST_HIDE" | "WITH_IGST" | "WITHOUT_GST" | "GST_ITEM_WISE";

let nextId = 1;

interface CartItemExtra extends CartItemGST {
  gstApplicable: boolean;
  gst: {
    gstPercentage: number;
    cgstPercentage: number;
    sgstPercentage: number;
    igstPercentage: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    taxAmount: number;
  };
}

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("resume");
  const [cart, setCart] = useState<CartItemExtra[]>([]);
  const [discPercent, setDiscPercent] = useState(0);
  const [discAmount, setDiscAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [gstRate, setGstRate] = useState(0);
  const [complimentBill, setComplimentBill] = useState(false);
  const [creditBill, setCreditBill] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [hasQRAccess, setHasQRAccess] = useState(false);
  const [amountGiven, setAmountGiven] = useState(0);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [salesPerson, setSalesPerson] = useState("");
  const [saving, setSaving] = useState(false);
  const [billingMode, setBillingMode] = useState<BillingMode>("WITH_GST");
  const [billType, setBillType] = useState<"INVOICE" | "QUOTATION">("INVOICE");
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printInvoiceId, setPrintInvoiceId] = useState<number | null>(null);
  const [printDocType, setPrintDocType] = useState<"INVOICE" | "QUOTATION">("INVOICE");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    fetch("/api/company/gst-settings")
      .then((res) => res.json())
      .then((data) => {
        if (!data.gstSettings) return;
        const map: Record<string, BillingMode> = {
          GST_VISIBLE: "WITH_GST",
          GST_INCLUDED_HIDDEN: "WITH_GST_HIDE",
          GST_IGST: "WITH_IGST",
          NO_GST: "WITHOUT_GST",
          GST_ITEM_WISE: "GST_ITEM_WISE",
        };
        const configuredMode = data.gstSettings.gstEnabled === false
          ? "WITHOUT_GST"
          : map[data.gstSettings.gstMode] || "WITH_GST";
        setBillingMode(configuredMode);
      })
      .catch(() => {});
  }, []);

  // Check QR access
  useEffect(() => {
    fetch("/api/my-menu-access")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const paths = data.allowedMenuPaths || [];
          const allowed = paths.includes("/admin/qr");
          setHasQRAccess(allowed);
          if (allowed) setShowQR(true);
        }
      })
      .catch(() => {});
  }, []);

  // Resume a held bill
  useEffect(() => {
    if (!resumeId) return;
    fetch("/api/held-bills")
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;
        const bill = data.heldBills.find((h: { id: number }) => h.id === parseInt(resumeId));
        if (!bill) {
          alert("Held bill not found");
          return;
        }
        // Load items into cart
        const loadedItems = bill.items.map((item: CartItemExtra) => ({
          ...item,
          gstApplicable: true,
          gst: {
            gstPercentage: 0,
            cgstPercentage: 0,
            sgstPercentage: 0,
            igstPercentage: 0,
            cgstAmount: 0,
            sgstAmount: 0,
            igstAmount: 0,
            taxAmount: 0,
          },
        }));
        setCart(loadedItems);
        setRemarks(bill.remarks || "");
        setSalesPerson(bill.salesPerson || "");
        if (bill.gstRate) setGstRate(Number(bill.gstRate));
        setDiscAmount(Number(bill.discountAmount) || 0);
        // Delete the held bill after resuming
        fetch(`/api/held-bills?id=${bill.id}`, { method: "DELETE" });
        // Clean up URL
        router.replace("/billing/billing");
      })
      .catch(() => alert("Failed to load held bill"));
  }, [resumeId, router]);

  const isGSTVisible = billingMode === "WITH_GST" || billingMode === "WITH_IGST" || billingMode === "WITH_GST_HIDE" || billingMode === "GST_ITEM_WISE";
  const isGSTHidden = billingMode === "WITH_GST_HIDE";
  const isNoGST = billingMode === "WITHOUT_GST";
  const isIGST = billingMode === "WITH_IGST";
  const isItemWise = billingMode === "GST_ITEM_WISE";

  const gstModeAPI = isNoGST ? "NO_GST" : isGSTHidden ? "GST_INCLUDED_HIDDEN" : isIGST ? "GST_IGST" : isItemWise ? "GST_ITEM_WISE" : "GST_VISIBLE";

  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);

  const perItemTax = useMemo(() => {
    if (!isItemWise) return 0;
    return cart.reduce((sum, item) => {
      const rate = item.gst.gstPercentage || 0;
      return sum + Math.round(item.price * item.qty * (rate / 100) * 100) / 100;
    }, 0);
  }, [cart, isItemWise]);

  const effectiveTax = isNoGST ? taxAmount : isItemWise ? perItemTax : Math.round((subtotal - discAmount) * (gstRate / 100) * 100) / 100;
  const total = subtotal - discAmount + effectiveTax;

  const handleAddProduct = useCallback(
    (product: {
      id: number;
      productName: string;
      sellingPrice: number;
      currentStock: number;
      gstApplicable?: boolean;
      gstMaster?: { totalPercentage: number } | null;
    }) => {
      setCart((prev) => {
        const existing = prev.find((item) => item.productId === product.id);
        if (existing) {
          if (existing.qty >= product.currentStock) return prev;
          return prev.map((item) =>
            item.productId === product.id
              ? { ...item, qty: Math.min(item.qty + 1, product.currentStock) }
              : item
          );
        }

        const productRate = (product.gstApplicable !== false && product.gstMaster)
          ? Number(product.gstMaster.totalPercentage)
          : 0;

        return [
          ...prev,
          {
            id: nextId++,
            productId: product.id,
            name: product.productName,
            price: product.sellingPrice,
            qty: 1,
            stock: product.currentStock,
            remarks: "",
            gstApplicable: product.gstApplicable ?? true,
            gst: { gstPercentage: productRate, cgstPercentage: productRate / 2, sgstPercentage: productRate / 2, igstPercentage: productRate, cgstAmount: 0, sgstAmount: 0, igstAmount: 0, taxAmount: 0 },
          },
        ];
      });
    },
    []
  );

  const handleUpdateQty = useCallback((id: number, qty: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.min(qty, item.stock) } : item
      )
    );
  }, []);

  const handleRemove = useCallback((id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleUpdateGstRate = useCallback((id: number, rate: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, gst: { ...item.gst, gstPercentage: rate, cgstPercentage: rate / 2, sgstPercentage: rate / 2, igstPercentage: rate } }
          : item
      )
    );
  }, []);

  const handleUpdateRemarks = useCallback((id: number, remarks: string) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, remarks } : item))
    );
  }, []);

  const handleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  const handleHoldBills = useCallback(async () => {
    if (cart.length === 0) return;
    try {
      const items = cart.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.name,
        price: item.price,
        qty: item.qty,
        stock: item.stock,
        remarks: item.remarks,
      }));
      const res = await fetch("/api/held-bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer?.id || null,
          customerName: selectedCustomer?.name || null,
          items,
          subtotal,
          taxAmount: effectiveTax,
          discountAmount: discAmount,
          grandTotal: total,
          gstMode: gstModeAPI,
          gstRate: gstRate || null,
          paymentMode,
          remarks: remarks || null,
          salesPerson: salesPerson || null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Bill held! ${cart.length} items saved as ${data.heldBill.holdNumber}`);
        setCart([]);
        setDiscPercent(0);
        setDiscAmount(0);
        setTaxAmount(0);
        setAmountGiven(0);
        setRemarks("");
        setSelectedCustomer(null);
        setPaymentMode("CASH");
      } else {
        alert(data.error || "Failed to hold bill");
      }
    } catch {
      alert("Failed to hold bill");
    }
  }, [cart, selectedCustomer, subtotal, effectiveTax, discAmount, total, gstModeAPI, gstRate, paymentMode, remarks, salesPerson]);

  const handleTableView = useCallback(() => {
    router.push("/billing/kot");
  }, [router]);

  const handleHold = useCallback(async () => {
    if (cart.length === 0) return;
    try {
      const items = cart.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.name,
        price: item.price,
        qty: item.qty,
        stock: item.stock,
        remarks: item.remarks,
      }));
      const res = await fetch("/api/held-bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer?.id || null,
          customerName: selectedCustomer?.name || null,
          items,
          subtotal,
          taxAmount: effectiveTax,
          discountAmount: discAmount,
          grandTotal: total,
          gstMode: gstModeAPI,
          gstRate: gstRate || null,
          paymentMode,
          remarks: remarks || null,
          salesPerson: salesPerson || null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Bill held! ${cart.length} items saved as ${data.heldBill.holdNumber}`);
        setCart([]);
        setDiscPercent(0);
        setDiscAmount(0);
        setTaxAmount(0);
        setAmountGiven(0);
        setRemarks("");
        setSelectedCustomer(null);
        setPaymentMode("CASH");
      } else {
        alert(data.error || "Failed to hold bill");
      }
    } catch {
      alert("Failed to hold bill");
    }
  }, [cart, selectedCustomer, subtotal, effectiveTax, discAmount, total, gstModeAPI, gstRate, paymentMode, remarks, salesPerson]);

  const clearAll = useCallback(() => {
    setCart([]);
    setDiscPercent(0);
    setDiscAmount(0);
    setTaxAmount(0);
    setGstRate(0);
    setAmountGiven(0);
    setRemarks("");
    setSelectedCustomer(null);
    setPaymentMode("CASH");
  }, []);

  const handlePrint = useCallback(async () => {
    if (cart.length === 0) return;
    setSaving(true);
    try {
      const items = cart.map((item) => ({
        productId: item.productId,
        quantity: item.qty,
        unitPrice: item.price,
        gstRate: isItemWise ? item.gst.gstPercentage : undefined,
      }));

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer?.id || 0,
          items,
          gstMode: gstModeAPI,
          taxRate: isItemWise ? undefined : gstRate,
          discountAmount: discAmount,
          paymentMode: complimentBill ? "COMPLIMENT" : creditBill ? "CREDIT" : paymentMode,
          cashReceived: amountGiven,
          remarks: remarks || undefined,
          salesPerson: salesPerson || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPrintInvoiceId(data.invoice.id);
        setPrintDocType("INVOICE");
        setShowPrintPreview(true);
        clearAll();
      } else {
        alert(data.error || "Failed to save bill");
      }
    } catch {
      alert("Failed to save bill. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [cart, selectedCustomer, discAmount, gstRate, complimentBill, creditBill, paymentMode, amountGiven, remarks, salesPerson, gstModeAPI, isItemWise, clearAll]);

  const handleSaveBill = useCallback(async () => {
    if (cart.length === 0) return;
    setSaving(true);
    try {
      const items = cart.map((item) => ({
        productId: item.productId,
        quantity: item.qty,
        unitPrice: item.price,
        gstRate: isItemWise ? item.gst.gstPercentage : undefined,
      }));

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer?.id || 0,
          items,
          gstMode: gstModeAPI,
          taxRate: isItemWise ? undefined : gstRate,
          discountAmount: discAmount,
          paymentMode: complimentBill ? "COMPLIMENT" : creditBill ? "CREDIT" : paymentMode,
          cashReceived: amountGiven,
          remarks: remarks || undefined,
          salesPerson: salesPerson || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`Bill saved! Invoice: ${data.invoice.invoiceNumber}`);
        clearAll();
      } else {
        alert(data.error || "Failed to save bill");
      }
    } catch {
      alert("Failed to save bill. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [cart, selectedCustomer, discAmount, gstRate, complimentBill, creditBill, paymentMode, amountGiven, remarks, salesPerson, gstModeAPI, isItemWise, clearAll]);

  const handleSaveQuotation = useCallback(async () => {
    if (cart.length === 0) return;
    setSaving(true);
    try {
      const items = cart.map((item) => ({
        productId: item.productId,
        quantity: item.qty,
        unitPrice: item.price,
      }));

      const res = await fetch("/api/estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer?.id || undefined,
          items,
          gstMode: gstModeAPI,
          taxRate: isItemWise ? undefined : gstRate,
          discountAmount: discAmount,
          remarks: remarks || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`Quotation saved! Number: ${data.estimate.estimateNumber}`);
        clearAll();
      } else {
        alert(data.error || "Failed to save quotation");
      }
    } catch {
      alert("Failed to save quotation. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [cart, selectedCustomer, discAmount, gstRate, remarks, gstModeAPI, isItemWise, clearAll]);

  const handlePrintQuotation = useCallback(async () => {
    if (cart.length === 0) return;
    setSaving(true);
    try {
      const items = cart.map((item) => ({
        productId: item.productId,
        quantity: item.qty,
        unitPrice: item.price,
      }));

      const res = await fetch("/api/estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer?.id || undefined,
          items,
          gstMode: gstModeAPI,
          taxRate: isItemWise ? undefined : gstRate,
          discountAmount: discAmount,
          remarks: remarks || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPrintInvoiceId(data.estimate.id);
        setPrintDocType("QUOTATION");
        setShowPrintPreview(true);
        clearAll();
      } else {
        alert(data.error || "Failed to save quotation");
      }
    } catch {
      alert("Failed to save quotation. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [cart, selectedCustomer, discAmount, gstRate, remarks, gstModeAPI, isItemWise, clearAll]);

  const handleNoPrint = useCallback(async () => {
    if (billType === "QUOTATION") {
      await handleSaveQuotation();
    } else {
      await handleSaveBill();
    }
  }, [billType, handleSaveBill, handleSaveQuotation]);

  const handleCustomerSelect = useCallback((customer: CustomerData) => {
    setSelectedCustomer(customer);
    setShowCustomerForm(false);
  }, []);

  const handleClearCustomer = useCallback(() => {
    setSelectedCustomer(null);
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "F3") {
        e.preventDefault();
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
      <div className="flex flex-col lg:flex-row gap-4">
        {/* LEFT SIDE — Billing area */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Toolbar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <BillingToolbar
              onFullscreen={handleFullscreen}
              isFullscreen={isFullscreen}
              onHoldBills={handleHoldBills}
              onTableView={handleTableView}
            />
          </div>

          {/* Billing Mode + GST Rate */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm font-semibold text-gray-700">Billing Mode:</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="billingMode" value="WITH_GST" checked={billingMode === "WITH_GST"} onChange={() => setBillingMode("WITH_GST")} className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
                  <span className="text-sm text-gray-700">With GST</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="billingMode" value="WITH_GST_HIDE" checked={billingMode === "WITH_GST_HIDE"} onChange={() => setBillingMode("WITH_GST_HIDE")} className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
                  <span className="text-sm text-gray-700">With GST (Hide Details)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="billingMode" value="WITH_IGST" checked={billingMode === "WITH_IGST"} onChange={() => setBillingMode("WITH_IGST")} className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
                  <span className="text-sm text-gray-700">With IGST</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="billingMode" value="WITHOUT_GST" checked={billingMode === "WITHOUT_GST"} onChange={() => setBillingMode("WITHOUT_GST")} className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
                  <span className="text-sm text-gray-700">Without GST</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="billingMode" value="GST_ITEM_WISE" checked={billingMode === "GST_ITEM_WISE"} onChange={() => setBillingMode("GST_ITEM_WISE")} className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
                  <span className="text-sm text-gray-700">Item Wise GST</span>
                </label>
              </div>
              {isGSTVisible && !isItemWise && (
                <div className="flex items-center gap-2 ml-auto">
                  <label className="text-sm font-medium text-gray-700">GST %:</label>
                  <input
                    type="number"
                    value={gstRate || ""}
                    onChange={(e) => setGstRate(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    min={0}
                    max={100}
                    step={0.5}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
              <span className="text-sm font-semibold text-gray-700">Bill Type:</span>
              <div className="flex rounded-lg overflow-hidden border border-gray-300">
                <button
                  onClick={() => setBillType("INVOICE")}
                  className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                    billType === "INVOICE"
                      ? "bg-violet-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Invoice
                </button>
                <button
                  onClick={() => setBillType("QUOTATION")}
                  className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                    billType === "QUOTATION"
                      ? "bg-amber-500 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Quotation
                </button>
              </div>
            </div>
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
              onRemove={handleRemove}
              perItemGst={isItemWise}
              onUpdateGstRate={handleUpdateGstRate}
              onItemRemarksChange={handleUpdateRemarks}
            />
          </div>

          {/* GST Summary */}
          {isGSTVisible && cart.length > 0 && effectiveTax > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-6 text-sm flex-wrap">
                {isItemWise ? (
                  <>
                    <span className="text-gray-600">GST (Item Wise): <span className="font-semibold text-billora-primary">{effectiveTax.toFixed(2)}</span></span>
                    {isIGST ? (
                      <span className="text-gray-600">IGST: <span className="font-semibold text-gray-800">{effectiveTax.toFixed(2)}</span></span>
                    ) : (
                      <>
                        <span className="text-gray-600">CGST: <span className="font-semibold text-gray-800">{(effectiveTax / 2).toFixed(2)}</span></span>
                        <span className="text-gray-600">SGST: <span className="font-semibold text-gray-800">{(effectiveTax / 2).toFixed(2)}</span></span>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <span className="text-gray-600">GST ({gstRate}%): <span className="font-semibold text-billora-primary">{effectiveTax.toFixed(2)}</span></span>
                    {isIGST ? (
                      <span className="text-gray-600">IGST: <span className="font-semibold text-gray-800">{effectiveTax.toFixed(2)}</span></span>
                    ) : (
                      <>
                        <span className="text-gray-600">CGST ({(gstRate / 2).toFixed(1)}%): <span className="font-semibold text-gray-800">{(effectiveTax / 2).toFixed(2)}</span></span>
                        <span className="text-gray-600">SGST ({(gstRate / 2).toFixed(1)}%): <span className="font-semibold text-gray-800">{(effectiveTax / 2).toFixed(2)}</span></span>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE — Customer / Payment */}
        <div className="w-full lg:w-[300px] flex-shrink-0 space-y-3">
          {/* Customer Section */}
          {showCustomerForm ? (
            <CustomerForm
              onCustomerSelect={handleCustomerSelect}
              onClose={() => setShowCustomerForm(false)}
            />
          ) : selectedCustomer ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Customer</span>
                <button onClick={handleClearCustomer} className="text-xs text-red-500 hover:text-red-600">Change</button>
              </div>
              <div className="space-y-1 text-sm">
                {selectedCustomer.name && <p className="font-medium text-gray-800">{selectedCustomer.name}</p>}
                {selectedCustomer.mobile && <p className="text-gray-500">{selectedCustomer.mobile}</p>}
                {selectedCustomer.address && (
                  <p className="text-gray-400 text-xs">{selectedCustomer.address}{selectedCustomer.landmark ? `, ${selectedCustomer.landmark}` : ""}</p>
                )}
              </div>
            </div>
          ) : (
            <button onClick={() => setShowCustomerForm(true)} className="w-full bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white text-sm font-semibold py-3 rounded-xl shadow-sm transition-colors">
              Add Customer+
            </button>
          )}

          {/* Customer Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <CustomerPanel
              subtotal={subtotal}
              discPercent={discPercent}
              discAmount={discAmount}
              taxAmount={effectiveTax}
              showTaxInput={isNoGST}
              complimentBill={complimentBill}
              creditBill={creditBill}
              remarks={remarks}
              paymentMode={paymentMode}
              salesPerson={salesPerson}
              onDiscPercentChange={setDiscPercent}
              onDiscAmountChange={setDiscAmount}
              onTaxAmountChange={setTaxAmount}
              onComplimentChange={setComplimentBill}
              onCreditChange={setCreditBill}
              onRemarksChange={setRemarks}
              onPaymentModeChange={setPaymentMode}
              onSalesPersonChange={setSalesPerson}
            />
          </div>

          {/* WhatsApp Bill */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
            <WhatsAppBill enabled={whatsappEnabled} onToggle={setWhatsappEnabled} />
          </div>

          {/* QR Code Toggle */}
          {hasQRAccess && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={showQR} onChange={(e) => setShowQR(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 flex-shrink-0" />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              <span className="text-xs text-purple-600 font-medium">Show UPI QR on Bill</span>
            </div>
          </div>
          )}

          {/* Bill Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <BillSummary total={total} amountGiven={amountGiven} onAmountGivenChange={setAmountGiven} />
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
            <BillingActions onPrint={handlePrint} onHold={handleHold} onNoPrint={handleNoPrint} onSaveBill={handleSaveBill} onSaveQuotation={handleSaveQuotation} onPrintQuotation={handlePrintQuotation} billType={billType} saving={saving} canSave={cart.length > 0} />
          </div>
        </div>
      </div>

      {/* Print Preview Modal */}
      {showPrintPreview && printInvoiceId && (
        <InvoicePrintPreview invoiceId={printInvoiceId} onClose={() => { setShowPrintPreview(false); setPrintInvoiceId(null); }} showQR={showQR} docType={printDocType} />
      )}
    </div>
  );
}
