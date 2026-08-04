"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Printer, Loader2 } from "lucide-react";
import QRCode from "qrcode";

interface TemplateField {
  id?: number;
  fieldKey: string;
  label: string;
  visible: boolean;
  bold: boolean;
  fontSize: number;
  alignment: string;
  displayOrder: number;
}

interface PrintTemplate {
  id: number;
  templateName: string;
  templateType: string;
  isDefault: boolean;
  useDynamicPrint: boolean;
  showLogo: boolean;
  logoUrl: string | null;
  logoSize: string;
  logoAlignment: string;
  footerMessage: string | null;
  fields: TemplateField[];
}

interface InvoiceItem {
  id: number;
  productName: string;
  hsnCode: string | null;
  unit: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  gstPercentage: number;
  cgstPercentage: number;
  sgstPercentage: number;
  igstPercentage: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  taxAmount: number;
  totalAmount: number;
}

interface InvoiceData {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  gstMode: string;
  paymentStatus: string;
  invoiceStatus: string;
  paymentMode?: string;
  salesPerson?: string;
  remarks?: string;
  company: {
    companyName: string;
    gstNumber: string | null;
    gstStateCode: string | null;
    stateName: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    logo: string | null;
  };
  customer: {
    customerName: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    stateCode: string | null;
    stateName: string | null;
    gstNumber: string | null;
  } | null;
  createdBy: { id: number; name: string; email: string } | null;
  items: InvoiceItem[];
  gstBreakup: {
    subtotal: number;
    cgst: number;
    sgst: number;
    igst: number;
    tax: number;
    grandTotal: number;
  } | null;
}

interface PaymentSettings {
  merchantName: string;
  upiId: string;
  qrEnabled: boolean;
}

interface InvoicePrintPreviewProps {
  invoiceId: number;
  onClose: () => void;
  showQR?: boolean;
  docType?: "INVOICE" | "QUOTATION";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${day}/${month}/${year} ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
}

export default function InvoicePrintPreview({ invoiceId, onClose, showQR = true, docType = "INVOICE" }: InvoicePrintPreviewProps) {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [template, setTemplate] = useState<PrintTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [upiQrDataUrl, setUpiQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const dataUrl = docType === "QUOTATION"
          ? `/api/estimates/${invoiceId}`
          : `/api/invoices/${invoiceId}`;
        const [invRes, tplRes, psRes] = await Promise.all([
          fetch(dataUrl),
          fetch("/api/print-templates"),
          fetch("/api/payment-settings"),
        ]);

        const invData = await invRes.json();
        if (!invData.success) {
          setError("Failed to load invoice data");
          return;
        }
        setInvoice(invData.invoice);

        const tplData = await tplRes.json();
        if (tplData.success && tplData.templates) {
          const billTemplates = tplData.templates.filter(
            (t: PrintTemplate) => t.templateType === "BILL"
          );
          const defaultTpl =
            billTemplates.find((t: PrintTemplate) => t.isDefault) || billTemplates[0];
          if (defaultTpl) {
            setTemplate(defaultTpl);
          } else {
            setError("No default Print Template configured. Please ask administrator to set a default Bill template in Admin > Print Templates.");
          }
        } else {
          setError("Failed to load print templates");
        }

        try {
          const psData = await psRes.json();
          if (psData.success && psData.settings?.qrEnabled) {
            setPaymentSettings(psData.settings);
          }
        } catch { /* empty */ }
      } catch {
        setError("Failed to load print data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [invoiceId, docType]);

  useEffect(() => {
    if (!invoice || !paymentSettings) return;
    const label = docType === "QUOTATION" ? "Quotation" : "Invoice";
    const upiUri = `upi://pay?pa=${encodeURIComponent(paymentSettings.upiId)}&pn=${encodeURIComponent(paymentSettings.merchantName)}&am=${Number(invoice.grandTotal).toFixed(2)}&cu=INR&tn=${encodeURIComponent(label + " " + invoice.invoiceNumber)}&tr=${encodeURIComponent(invoice.invoiceNumber)}`;
    QRCode.toDataURL(upiUri, { width: 160, margin: 1 })
      .then((dataUrl) => setUpiQrDataUrl(dataUrl))
      .catch(() => {});
  }, [invoice, paymentSettings, docType]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-purple-600" />
          <p className="text-sm text-gray-600">Loading print preview...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice || !template) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Print Error</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X size={18} />
            </button>
          </div>
          <p className="text-sm text-red-600 mb-4">{error || "Unable to load print data"}</p>
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const fields = template.fields.length > 0
    ? [...template.fields].sort((a, b) => a.displayOrder - b.displayOrder)
    : [];

  const visibleFields = fields.filter((f) => f.visible);
  const isFieldVisible = (key: string) => visibleFields.some((f) => f.fieldKey === key);

  const gstMode = invoice.gstMode;
  const showGSTCols = gstMode === "GST_VISIBLE";
  const showIGSTCols = gstMode === "GST_IGST";

  const logoSizePx = template.logoSize === "SMALL" ? 50 : template.logoSize === "LARGE" ? 90 : 65;

  const taxAmount = Number(invoice.taxAmount);

  const F = (size: number): React.CSSProperties => ({ fontSize: `${size}px` });

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex flex-col">
      {/* Top bar — hidden during print */}
      <div className="no-print flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-800">{docType === "QUOTATION" ? "Quotation Print Preview" : "Invoice Print Preview"}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Printer size={14} />
            Print
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            <X size={14} />
            Close
          </button>
        </div>
      </div>

      {/* Scrollable area */}
      <div className="flex-1 overflow-auto p-8 flex justify-center bg-gray-100">
        <div className="print-invoice-area">
          {/* Receipt Paper */}
          <div
            className="bg-white shadow-2xl mx-auto border border-gray-300"
            style={{ width: "440px", padding: "28px 32px", fontFamily: "'Courier New', Courier, monospace" }}
          >
            {/* ═══════ LOGO ═══════ */}
            {(template.showLogo && template.logoUrl) || invoice.company.logo ? (
              <div className={`mb-3 ${
                template.logoAlignment === "CENTER" ? "text-center" :
                template.logoAlignment === "RIGHT" ? "text-right" : "text-left"
              }`}>
                <img
                  src={template.showLogo && template.logoUrl ? template.logoUrl : invoice.company.logo!}
                  alt="Logo"
                  style={{ width: `${logoSizePx}px`, height: "auto" }}
                  className={`inline-block ${template.logoAlignment === "CENTER" ? "mx-auto" : ""}`}
                />
              </div>
            ) : null}

            {/* ═══════ HEADER: All Centered ═══════ */}
            {isFieldVisible("branchName") && (
              <div className="text-center" style={F(18)}>
                <span className="font-bold">{invoice.company.companyName}</span>
              </div>
            )}

            {isFieldVisible("address1") && invoice.company.address && (
              <div className="text-center text-gray-600 mt-1 whitespace-pre-line" style={F(12)}>
                {invoice.company.address}
              </div>
            )}

            {isFieldVisible("gstNumber") && invoice.company.gstNumber && (
              <div className="text-center text-gray-700 mt-1" style={F(12)}>
                {invoice.company.gstNumber}
              </div>
            )}

            {isFieldVisible("invoiceNumber") && (
              <div className="text-center mt-2" style={F(15)}>
                <span className="font-bold">{invoice.invoiceNumber}</span>
              </div>
            )}

            {/* ═══════ INFO ROWS: Label left, Value right ═══════ */}
            <div className="mt-4 space-y-1" style={F(13)}>
              {isFieldVisible("orderType") && (
                <div className="flex justify-between">
                  <span>Order Type</span>
                  <span>{invoice.paymentMode || "Dine In"}</span>
                </div>
              )}
              {isFieldVisible("cashier") && invoice.createdBy?.name && (
                <div className="flex justify-between">
                  <span>Cashier</span>
                  <span>{invoice.createdBy.name}</span>
                </div>
              )}
              {isFieldVisible("invoiceDate") && (
                <div className="flex justify-between">
                  <span>Bill Date</span>
                  <span>{formatDate(invoice.invoiceDate)}</span>
                </div>
              )}
            </div>

            {/* ═══════ DASHED DIVIDER ═══════ */}
            <div className="border-t border-dashed border-gray-400 my-4" />

            {/* ═══════ ITEMS TABLE ═══════ */}
            {isFieldVisible("itemName") && invoice.items.length > 0 && (
              <div style={F(13)}>
                {/* Table Header */}
                <div className="flex font-bold pb-1">
                  <span className="flex-1">Item</span>
                  <span className="w-14 text-center">Qty</span>
                  <span className="w-18 text-right">Amt</span>
                </div>

                {/* Items */}
                {invoice.items.map((item, i) => (
                  <div key={i} className="flex items-center py-1.5 border-b border-dotted border-gray-300">
                    <span className="flex-1 truncate">{item.productName}</span>
                    <span className="w-14 text-center">{item.quantity}</span>
                    <span className="w-18 text-right">
                      {Number(item.totalAmount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* ═══════ DASHED DIVIDER ═══════ */}
            <div className="border-t border-dashed border-gray-400 my-4" />

            {/* ═══════ TOTALS ═══════ */}
            <div style={F(13)}>
              <div className="flex justify-between py-0.5">
                <span>Sub Total</span>
                <span>{Number(invoice.subtotal).toFixed(2)}</span>
              </div>

              {isFieldVisible("discount") && (
                <div className="flex justify-between py-0.5">
                  <span>Discount</span>
                  <span>{Number(invoice.discountAmount).toFixed(2)}</span>
                </div>
              )}

              {/* Grand Total */}
              <div className="flex justify-between font-bold mt-2 py-1" style={F(15)}>
                <span>Grand Total</span>
                <span>{Number(invoice.grandTotal).toFixed(2)}</span>
              </div>
            </div>

            {/* ═══════ DASHED DIVIDER ═══════ */}
            <div className="border-t border-dashed border-gray-400 my-4" />

            {/* ═══════ TAX SUMMARY ═══════ */}
            {showGSTCols && taxAmount > 0 && (
              <div style={F(13)} className="mb-1">
                {invoice.gstMode === "GST_ITEM_WISE" ? (
                  <>
                    <div className="flex justify-between">
                      <span>Tax (GST - Item Wise)</span>
                      <span>{taxAmount.toFixed(2)}</span>
                    </div>
                    {(() => {
                      const totalCgst = invoice.items.reduce((s, i) => s + (i.cgstAmount || 0), 0);
                      const totalIgst = invoice.items.reduce((s, i) => s + (i.igstAmount || 0), 0);
                      return totalIgst > 0 ? (
                        <div className="flex justify-between">
                          <span>  IGST</span>
                          <span>{totalIgst.toFixed(2)}</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span>  CGST</span>
                            <span>{totalCgst.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>  SGST</span>
                            <span>{invoice.items.reduce((s, i) => s + (i.sgstAmount || 0), 0).toFixed(2)}</span>
                          </div>
                        </>
                      );
                    })()}
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span>Tax (GST)</span>
                      <span>{taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>  CGST ({(invoice.gstMode === "GST_IGST" ? 0 : 5).toFixed(1)}%)</span>
                      <span>{(taxAmount / 2).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>  SGST ({(invoice.gstMode === "GST_IGST" ? 0 : 5).toFixed(1)}%)</span>
                      <span>{(taxAmount / 2).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            )}
            {showIGSTCols && taxAmount > 0 && (
              <div style={F(13)} className="mb-1">
                <div className="flex justify-between">
                  <span>Tax (IGST)</span>
                  <span>{taxAmount.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* ═══════ PAYMENT ═══════ */}
            {docType !== "QUOTATION" && isFieldVisible("paymentMode") && (
              <div style={F(13)}>
                <span><strong>Payments</strong> {invoice.paymentMode || "Cash"} : {Number(invoice.grandTotal).toFixed(2)}</span>
              </div>
            )}

            {/* ═══════ UPI QR CODE ═══════ */}
            {docType !== "QUOTATION" && showQR && paymentSettings && upiQrDataUrl && (
              <div className="mt-3 mb-2 flex flex-col items-center text-center">
                <div className="font-semibold mb-1" style={F(13)}>Scan & Pay using any UPI App</div>
                <img src={upiQrDataUrl} alt="UPI QR Code" style={{ width: "140px", height: "140px" }} />
                <div className="mt-1.5" style={F(11)}>
                  <div>UPI ID: {paymentSettings.upiId}</div>
                  <div className="font-bold mt-0.5">Amount: ₹{Number(invoice.grandTotal).toFixed(2)}</div>
                </div>
              </div>
            )}

            {/* ═══════ DASHED DIVIDER ═══════ */}
            <div className="border-t border-dashed border-gray-400 my-4" />

            {/* ═══════ FOOTER ═══════ */}
            {template.footerMessage && (
              <div className="text-center text-gray-500" style={F(12)}>
                {template.footerMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
