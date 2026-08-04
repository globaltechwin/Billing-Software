"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Trash2, ShoppingCart } from "lucide-react";

interface Product {
  id: number;
  productName: string;
  sellingPrice: number;
  currentStock: number;
  barcode?: string;
  category?: string;
}

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  qty: number;
  stock: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  totalAmount: number;
}

interface AdvanceOrderRecord {
  id: number;
  orderNumber: string;
  orderDate: string;
  deliveryDate: string;
  deliveryTime: string;
  invoiceDate: string;
  noOfPax: number | null;
  categoryName: string;
  serviceName: string;
  customerMobile: string;
  customerName: string;
  address: string;
  landmark: string;
  additionalMobile: string;
  customerGstNo: string;
  companyName: string;
  referenceNumber: string;
  remarks: string;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentMode: string;
  cashAmount: number;
  cardAmount: number;
  upiAmount: number;
  walletAmount: number;
  orderStatus: string;
  branchName: string;
  createdBy: string;
  createdAt: string;
  items: { id: number; productId: number | null; productName: string; quantity: number; unitPrice: number; discountPercent: number; discountAmount: number; taxPercent: number; taxAmount: number; totalAmount: number }[];
}

let nextId = 1;
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const toGB = (iso: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

export default function AdvanceOrderPage() {
  const [showList, setShowList] = useState(false);

  const [deliveryDate, setDeliveryDate] = useState(todayISO());
  const [invoiceDate, setInvoiceDate] = useState(todayISO());
  const [deliveryTime, setDeliveryTime] = useState("");
  const [noOfPax, setNoOfPax] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [additionalMobile, setAdditionalMobile] = useState("");
  const [customerGstNo, setCustomerGstNo] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [remarks, setRemarks] = useState("");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [discPercent, setDiscPercent] = useState(0);
  const [discAmount, setDiscAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [cashAmount, setCashAmount] = useState(0);
  const [cardAmount, setCardAmount] = useState(0);
  const [upiAmount, setUpiAmount] = useState(0);
  const [walletAmount, setWalletAmount] = useState(0);

  const [products, setProducts] = useState<Product[]>([]);
  const [productQuery, setProductQuery] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<AdvanceOrderRecord[]>([]);
  const [ordersFetched, setOrdersFetched] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setProducts(d.products || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!showList) return;
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (statusFilter) params.set("status", statusFilter);
    params.set("limit", "50");
    fetch(`/api/advance-orders?${params}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { setOrders(d.orders || []); setOrdersFetched(true); })
      .catch(() => { setOrders([]); setOrdersFetched(true); });
  }, [showList, searchQuery, statusFilter]);

  const filteredProducts = useMemo(() => {
    if (!productQuery) return [];
    const q = productQuery.toLowerCase();
    return products.filter((p) => p.productName.toLowerCase().includes(q) || p.barcode?.toLowerCase().includes(q));
  }, [productQuery, products]);

  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);
  const computedTax = useMemo(() => cart.reduce((s, i) => s + i.taxAmount, 0), [cart]);
  const effectiveTax = computedTax > 0 ? computedTax : taxAmount;
  const total = subtotal - discAmount + effectiveTax;
  const paid = cashAmount + cardAmount + upiAmount + walletAmount;
  const due = total - paid;

  const handleAddProduct = useCallback((p: Product) => {
    const price = Number(p.sellingPrice);
    setCart((prev) => [
      ...prev,
      {
        id: nextId++,
        productId: p.id,
        name: p.productName,
        price,
        qty: 1,
        stock: p.currentStock,
        discountPercent: 0,
        discountAmount: 0,
        taxPercent: 0,
        taxAmount: 0,
        totalAmount: price,
      },
    ]);
    setProductQuery("");
    setShowProductDropdown(false);
  }, []);

  const handleRemoveItem = useCallback((id: number) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const handleUpdateQty = useCallback((id: number, qty: number) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.max(0.5, qty), totalAmount: i.price * Math.max(0.5, qty) } : i))
    );
  }, []);

  const handleDiscPercentChange = useCallback(
    (pct: number) => {
      setDiscPercent(pct);
      setDiscAmount(Math.round((subtotal * pct) / 100 * 100) / 100);
    },
    [subtotal]
  );

  const handleDiscAmountChange = useCallback(
    (amt: number) => {
      setDiscAmount(amt);
      setDiscPercent(subtotal > 0 ? Math.round((amt / subtotal) * 10000) / 100 : 0);
    },
    [subtotal]
  );

  const resetForm = useCallback(() => {
    setDeliveryDate(todayISO());
    setInvoiceDate(todayISO());
    setDeliveryTime("");
    setNoOfPax("");
    setCategoryName("");
    setServiceName("");
    setCustomerMobile("");
    setCustomerName("");
    setAddress("");
    setLandmark("");
    setAdditionalMobile("");
    setCustomerGstNo("");
    setCompanyName("");
    setReferenceNumber("");
    setRemarks("");
    setCart([]);
    setDiscPercent(0);
    setDiscAmount(0);
    setTaxAmount(0);
    setPaymentMode("CASH");
    setCashAmount(0);
    setCardAmount(0);
    setUpiAmount(0);
    setWalletAmount(0);
  }, []);

  const handleSave = useCallback(async () => {
    if (cart.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/advance-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryDate, invoiceDate, deliveryTime, noOfPax,
          categoryName, serviceName,
          customerMobile, customerName, address, landmark,
          additionalMobile, customerGstNo, companyName, referenceNumber,
          remarks,
          items: cart.map((i) => ({
            productId: i.productId, productName: i.name,
            quantity: i.qty, unitPrice: i.price,
            discountPercent: i.discountPercent, discountAmount: i.discountAmount,
            taxPercent: i.taxPercent, taxAmount: i.taxAmount,
            totalAmount: i.totalAmount,
          })),
          discountPercent: discPercent, discountAmount: discAmount, taxAmount: effectiveTax,
          paymentMode, cashAmount, cardAmount, upiAmount, walletAmount,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      alert(`Order ${data.order.orderNumber} created successfully`);
      resetForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }, [cart, deliveryDate, invoiceDate, deliveryTime, noOfPax, categoryName, serviceName,
    customerMobile, customerName, address, landmark, additionalMobile, customerGstNo,
    companyName, referenceNumber, remarks, discPercent, discAmount, effectiveTax,
    paymentMode, cashAmount, cardAmount, upiAmount, walletAmount, resetForm]);

  const handleCancelOrder = useCallback(async (id: number) => {
    if (!confirm("Cancel this order?")) return;
    try {
      await fetch(`/api/advance-orders?id=${id}`, { method: "DELETE" });
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, orderStatus: "CANCELLED" } : o)));
    } catch { /* empty */ }
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "F6") { e.preventDefault(); setShowList(true); }
      if (e.key === "F9") { e.preventDefault(); handleSave(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  return (
    <div className="p-4 sm:p-5">
      <div className="flex flex-col xl:flex-row gap-4">
        {/* Left side - Form */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#f2f5f9] px-6 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-semibold text-gray-800">Advance Order</h2>
                <button
                  onClick={() => setShowList(!showList)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded-md text-xs font-semibold hover:bg-yellow-600 transition-colors"
                >
                  Order List F6
                </button>
              </div>
              <button
                onClick={() => setShowList(!showList)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points={showList ? "6 9 12 15 18 9" : "18 15 12 9 6 15"} />
                </svg>
              </button>
            </div>

            {!showList && (
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {/* Row 1 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Delivery Date*</label>
                    <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Invoice Date*</label>
                    <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                  </div>

                  {/* Row 2 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Delivery Time*</label>
                    <input type="time" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">No. of Pax</label>
                    <input type="number" value={noOfPax} onChange={(e) => setNoOfPax(e.target.value)} min="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                  </div>

                  {/* Row 3 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                    <select value={categoryName} onChange={(e) => setCategoryName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
                      <option value="">-- Select Category --</option>
                      <option value="Dine In">Dine In</option>
                      <option value="Take Away">Take Away</option>
                      <option value="Delivery">Delivery</option>
                      <option value="Drive Through">Drive Through</option>
                      <option value="Catering">Catering</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Service</label>
                    <select value={serviceName} onChange={(e) => setServiceName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
                      <option value="">-- Select Service --</option>
                      <option value="Normal">Normal</option>
                      <option value="Express">Express</option>
                      <option value="Premium">Premium</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </div>

                  {/* Row 4 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Customer Mobile *</label>
                    <input type="tel" value={customerMobile} onChange={(e) => setCustomerMobile(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Customer Name *</label>
                    <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                  </div>

                  {/* Row 5 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                    <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Landmark</label>
                    <input type="text" value={landmark} onChange={(e) => setLandmark(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                  </div>

                  {/* Row 6 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Additional Mobile</label>
                    <input type="tel" value={additionalMobile} onChange={(e) => setAdditionalMobile(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Customer GST No.</label>
                    <input type="text" value={customerGstNo} onChange={(e) => setCustomerGstNo(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                  </div>

                  {/* Row 7 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name</label>
                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Reference Number</label>
                    <input type="text" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                  </div>

                  {/* Row 8 */}
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Remarks</label>
                    <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} placeholder="Remarks"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order List Table */}
          {showList && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search orders..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
                  <option value="">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[900px]">
                  <thead>
                    <tr className="bg-[#1a8a7d] text-white">
                      <th className="px-4 py-2 text-left font-medium">Order No</th>
                      <th className="px-4 py-2 text-left font-medium">Delivery Date</th>
                      <th className="px-4 py-2 text-left font-medium">Customer</th>
                      <th className="px-4 py-2 text-left font-medium">Mobile</th>
                      <th className="px-4 py-2 text-right font-medium">Total</th>
                      <th className="px-4 py-2 text-right font-medium">Due</th>
                      <th className="px-4 py-2 text-center font-medium">Status</th>
                      <th className="px-4 py-2 text-center font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-8 text-gray-400 italic">
                        {!ordersFetched ? "Loading..." : "No orders found"}
                      </td></tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium text-purple-600">{o.orderNumber}</td>
                          <td className="px-4 py-2">{toGB(o.deliveryDate)}</td>
                          <td className="px-4 py-2">{o.customerName || "-"}</td>
                          <td className="px-4 py-2">{o.customerMobile || "-"}</td>
                          <td className="px-4 py-2 text-right">{o.grandTotal.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right">{o.dueAmount.toFixed(2)}</td>
                          <td className="px-4 py-2 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              o.orderStatus === "DELIVERED" ? "bg-green-100 text-green-700" :
                              o.orderStatus === "CANCELLED" ? "bg-red-100 text-red-700" :
                              o.orderStatus === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                              "bg-yellow-100 text-yellow-700"
                            }`}>{o.orderStatus}</span>
                          </td>
                          <td className="px-4 py-2 text-center">
                            {o.orderStatus !== "CANCELLED" && (
                              <button onClick={() => handleCancelOrder(o.id)} className="text-red-500 hover:text-red-700 text-xs">Cancel</button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right side - Product & Payment */}
        {!showList && (
          <div className="w-full xl:w-[380px] flex-shrink-0 space-y-3">
            {/* Product Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 relative">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={productQuery}
                  onChange={(e) => { setProductQuery(e.target.value); setShowProductDropdown(true); }}
                  onFocus={() => setShowProductDropdown(true)}
                  placeholder="Enter Product"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
              {showProductDropdown && filteredProducts.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto mx-3">
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      onMouseDown={() => handleAddProduct(p)}
                      disabled={p.currentStock <= 0}
                      className="w-full text-left px-3 py-2 hover:bg-purple-50 flex items-center justify-between text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span className="text-gray-800">{p.productName}</span>
                      <span className="text-gray-400 text-xs">Stock: {p.currentStock}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {cart.length === 0 ? (
                <div className="p-8 text-center text-gray-400 italic">
                  <ShoppingCart size={24} className="mx-auto mb-2 opacity-40" />
                  <p>There are no items in the cart</p>
                </div>
              ) : (
                <>
                  <div className="bg-[#1a8a7d] text-white px-4 py-2 grid grid-cols-[1.2fr_60px_50px_70px_70px_36px] gap-1 text-xs font-medium uppercase">
                    <span>Product</span>
                    <span className="text-right">Price</span>
                    <span className="text-center">Qty</span>
                    <span className="text-right">Disc</span>
                    <span className="text-right">Total</span>
                    <span></span>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="px-4 py-2 grid grid-cols-[1.2fr_60px_50px_70px_70px_36px] gap-1 text-sm border-b border-gray-100 items-center">
                        <span className="text-gray-800 truncate">{item.name}</span>
                        <span className="text-right text-gray-600">{item.price.toFixed(2)}</span>
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleUpdateQty(item.id, item.qty - 1)} className="w-5 h-5 rounded bg-gray-200 text-xs hover:bg-gray-300">-</button>
                          <span className="w-6 text-center text-xs">{item.qty}</span>
                          <button onClick={() => handleUpdateQty(item.id, item.qty + 1)} className="w-5 h-5 rounded bg-gray-200 text-xs hover:bg-gray-300" disabled={item.qty >= item.stock}>+</button>
                        </div>
                        <span className="text-right text-gray-600">{item.discountAmount.toFixed(2)}</span>
                        <span className="text-right font-medium">{item.totalAmount.toFixed(2)}</span>
                        <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-3 text-sm font-medium">
                <div className="bg-teal-600 text-white px-3 py-2 flex items-center justify-between">
                  <span>Paid:</span>
                  <span>{paid.toFixed(2)}</span>
                </div>
                <div className="bg-yellow-500 text-white px-3 py-2 flex items-center justify-between">
                  <span>Due:</span>
                  <span>{due.toFixed(2)}</span>
                </div>
                <div className="bg-green-600 text-white px-3 py-2 flex items-center justify-between">
                  <span>Total:</span>
                  <span>{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-3 grid grid-cols-[auto_1fr_auto_1fr] gap-2 items-center text-sm">
                <span className="font-medium text-gray-700">Discount</span>
                <div className="flex items-center gap-1">
                  <input type="number" value={discPercent || ""} onChange={(e) => handleDiscPercentChange(Number(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm" placeholder="%" min="0" max="100" />
                  <span className="text-gray-400 text-xs">%</span>
                </div>
                <span className="text-gray-700">Amount</span>
                <input type="number" value={discAmount || ""} onChange={(e) => handleDiscAmountChange(Number(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm" placeholder="0" min="0" />
              </div>

              <div className="px-3 pb-3 grid grid-cols-[auto_1fr] gap-2 items-center text-sm">
                <span className="font-medium text-gray-700">Tax</span>
                <input type="number" value={taxAmount || ""} onChange={(e) => setTaxAmount(Number(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm" placeholder="0" min="0" />
              </div>

              {/* Payment Modes */}
              <div className="grid grid-cols-4 text-xs font-medium text-center">
                <div className="bg-teal-600 text-white py-1">CASH</div>
                <div className="bg-teal-500 text-white py-1">CARD</div>
                <div className="bg-teal-600 text-white py-1">UPI</div>
                <div className="bg-teal-500 text-white py-1">Wallet</div>
              </div>
              <div className="grid grid-cols-4 gap-1 p-2">
                <input type="number" value={cashAmount || ""} onChange={(e) => setCashAmount(Number(e.target.value) || 0)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm text-center" placeholder="0" min="0" />
                <input type="number" value={cardAmount || ""} onChange={(e) => setCardAmount(Number(e.target.value) || 0)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm text-center" placeholder="0" min="0" />
                <input type="number" value={upiAmount || ""} onChange={(e) => setUpiAmount(Number(e.target.value) || 0)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm text-center" placeholder="0" min="0" />
                <input type="number" value={walletAmount || ""} onChange={(e) => setWalletAmount(Number(e.target.value) || 0)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm text-center" placeholder="0" min="0" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSave}
                disabled={saving || cart.length === 0}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Make Order F9"}
              </button>
              <button
                className="px-6 py-3 bg-yellow-500 text-white rounded-lg text-sm font-semibold hover:bg-yellow-600 transition-colors"
                onClick={() => alert("Print functionality coming soon")}
              >
                Print Order F10
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
