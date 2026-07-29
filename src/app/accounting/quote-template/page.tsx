"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";

const templates = [
  { id: "standard", name: "Standard", desc: "Clean modern layout with color header band", preview: "standard" },
  { id: "classic", name: "Classic", desc: "Professional bordered layout — like tax invoices", preview: "classic" },
  { id: "minimal", name: "Minimal", desc: "Clean typography, no background colors", preview: "minimal" },
  { id: "split", name: "Split Header", desc: "Logo left · Company details right", preview: "split" },
];

const quickColors = ["#4b45d1","#e53e3e","#38a169","#d69e2e","#1a202c","#319795","#805ad5","#4fd1c5","#dd6b20","#e53e3e"];

export default function QuoteTemplatePage() {
  const [selectedTemplate, setSelectedTemplate] = useState("standard");
  const [headerColor, setHeaderColor] = useState("#4b45d1");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#333333");
  const [tagline, setTagline] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [footer, setFooter] = useState("");
  const [showLogo, setShowLogo] = useState(true);
  const [showHsn, setShowHsn] = useState(true);
  const [showDiscount, setShowDiscount] = useState(true);
  const [totalInWords, setTotalInWords] = useState(true);
  const [showTax, setShowTax] = useState(true);
  const [authSignature, setAuthSignature] = useState(true);
  const [splitTax, setSplitTax] = useState(true);

  const fmt = (v: number) => v.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Left Panel - Settings (scrollable) */}
      <div className="w-[480px] flex-shrink-0 overflow-y-auto p-6 border-r border-gray-200 bg-white">
        <h1 className="text-xl font-bold text-gray-800 mb-6">Quote Template Settings</h1>

        {/* Branch Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-blue-700">ℹ️ Branch Info (from Branch Master)</span>
            <button className="text-xs text-blue-600 hover:underline flex items-center gap-1">Edit <ExternalLink size={10} /></button>
          </div>
          <div className="text-sm space-y-1">
            <div><span className="text-gray-600">Name</span> <span className="font-medium ml-4">Only Coffee Vegetarian Restaurant</span></div>
            <div><span className="text-gray-600">Address</span> <span className="ml-4">S2H Foods And Enterprises Pvt Ltd Mahamaha Kulam, Kumbakonam- 612002 GSTIN: 33ABDCSS478H1Z4</span></div>
            <div><span className="text-gray-600">Phone</span></div>
            <div><span className="text-gray-600">GST No</span></div>
          </div>
          <p className="text-xs text-gray-500 mt-3">🖼️ Logo is loaded automatically from Branch Master cloud storage</p>
        </div>

        {/* Choose Template */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-800 mb-3">Choose Template</h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Standard */}
            <button onClick={() => setSelectedTemplate("standard")} className={`border-2 rounded-lg p-3 text-left transition-colors ${selectedTemplate === "standard" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
              <div className="bg-white border border-gray-200 rounded overflow-hidden mb-2 shadow-sm">
                <div className="flex items-center gap-1.5 px-2 py-1.5" style={{background: headerColor}}>
                  <div className="w-4 h-3 rounded-sm bg-white/30" />
                  <span className="text-white text-[7px] font-semibold">Your Company</span>
                </div>
                <div className="px-2 py-1">
                  <p className="text-[8px] font-bold" style={{color: headerColor}}>QUOTATION</p>
                  <p className="text-[5px] text-gray-400"># QT-0001</p>
                  <div className="mt-1 flex text-white text-[5px] font-semibold" style={{background: headerColor}}>
                    <span className="flex-1 px-1 py-0.5">Item</span>
                    <span className="px-1 py-0.5">Qty Rate Amt</span>
                  </div>
                  <div className="h-1 bg-gray-100 mt-0.5" />
                  <div className="h-1 bg-gray-100 mt-0.5 w-3/4" />
                  <div className="mt-1 h-1.5 rounded-sm" style={{background: headerColor}} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">Standard</span>
                {selectedTemplate === "standard" && <span className="text-blue-500">✓</span>}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Clean modern layout with color header band</p>
            </button>

            {/* Classic */}
            <button onClick={() => setSelectedTemplate("classic")} className={`border-2 rounded-lg p-3 text-left transition-colors ${selectedTemplate === "classic" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
              <div className="bg-white border border-gray-200 rounded overflow-hidden mb-2 shadow-sm p-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-5 h-4 border border-gray-300 rounded flex items-center justify-center text-[4px] text-gray-400">LOGO</div>
                  <div>
                    <p className="text-[8px] font-bold">QUOTATION</p>
                    <p className="text-[5px] text-gray-500">Company Name</p>
                  </div>
                </div>
                <div className="h-px bg-gray-300 my-0.5" />
                <p className="text-[5px] text-gray-400"># QT-0001  Date: 17/06/2026</p>
                <div className="flex gap-1 mt-1">
                  <div className="flex-1 border border-gray-300 rounded px-1 py-0.5">
                    <p className="text-[4px] text-gray-400">BILL TO</p>
                  </div>
                  <div className="flex-1 border border-gray-300 rounded px-1 py-0.5">
                    <p className="text-[4px] text-gray-400">SHIP TO</p>
                  </div>
                </div>
                <div className="mt-1 bg-gray-800 text-white text-[4px] px-1 py-0.5 flex gap-1">
                  <span className="flex-1">Item & Description</span><span>Qty Rate Amount</span>
                </div>
                <div className="h-1 bg-gray-100 mt-0.5" />
                <p className="text-right text-[5px] font-semibold mt-1">Total: ₹23,625</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">Classic</span>
                {selectedTemplate === "classic" && <span className="text-blue-500">✓</span>}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Professional bordered layout — like tax invoices</p>
            </button>

            {/* Minimal */}
            <button onClick={() => setSelectedTemplate("minimal")} className={`border-2 rounded-lg p-3 text-left transition-colors ${selectedTemplate === "minimal" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
              <div className="bg-white border border-gray-200 rounded overflow-hidden mb-2 shadow-sm p-2">
                <p className="text-[9px] font-bold">Company Name</p>
                <p className="text-[5px] text-gray-400">Address · Phone · GST</p>
                <div className="h-px bg-gray-800 my-1" />
                <p className="text-[9px] font-bold">QUOTATION</p>
                <p className="text-[5px] text-gray-400"># QT-0001  |  17/06/2026</p>
                <div className="h-px bg-gray-300 my-1" />
                <div className="flex text-[4px] text-gray-500 border-b border-gray-200 pb-0.5">
                  <span className="flex-1">Item</span><span>Qty</span><span className="ml-1">Rate</span><span className="ml-1">Amount</span>
                </div>
                <div className="h-1 bg-gray-100 mt-0.5" />
                <div className="h-1 bg-gray-100 mt-0.5 w-3/4" />
                <div className="h-px bg-gray-800 my-1" />
                <p className="text-right text-[5px] font-semibold">Total: ₹23,625</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">Minimal</span>
                {selectedTemplate === "minimal" && <span className="text-blue-500">✓</span>}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Clean typography, no background colors</p>
            </button>

            {/* Split Header */}
            <button onClick={() => setSelectedTemplate("split")} className={`border-2 rounded-lg p-3 text-left transition-colors ${selectedTemplate === "split" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
              <div className="bg-white border border-gray-200 rounded overflow-hidden mb-2 shadow-sm p-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-4 border border-gray-300 rounded flex items-center justify-center text-[4px] text-gray-400">LOGO</div>
                    <div>
                      <p className="text-[8px] font-bold">Company Name</p>
                      <p className="text-[5px] text-gray-400">Phone · GST</p>
                    </div>
                  </div>
                  <div className="px-1.5 py-0.5 rounded text-white text-[6px] font-bold" style={{background: headerColor}}>
                    <div>QUOTATION</div>
                    <div className="text-[4px] text-white/70"># QT-0001</div>
                  </div>
                </div>
                <div className="h-px bg-gray-300 mb-1" />
                <div className="border border-gray-300 rounded px-1 py-0.5 mb-1">
                  <p className="text-[4px] text-gray-400">BILL TO</p>
                  <p className="text-[5px]">Customer</p>
                </div>
                <div className="flex text-white text-[4px] font-semibold py-0.5 px-1" style={{background: headerColor}}>
                  <span className="flex-1">Item Qty Rate Amt</span>
                </div>
                <div className="h-1 bg-gray-100 mt-0.5" />
                <div className="h-1 bg-gray-100 mt-0.5 w-2/3" />
                <p className="text-right text-[5px] font-semibold mt-1" style={{color: headerColor}}>Total ₹23,625</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">Split Header</span>
                {selectedTemplate === "split" && <span className="text-blue-500">✓</span>}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Logo left · Company details right</p>
            </button>
          </div>
        </div>

        {/* Colors */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-800 mb-3">Colors</h2>
          <div className="grid grid-cols-3 gap-4 mb-3">
            <div>
              <label className="text-xs text-gray-600 block mb-1">Header / Accent</label>
              <div className="flex items-center gap-2"><input type="color" value={headerColor} onChange={e => setHeaderColor(e.target.value)} className="w-8 h-8 rounded border border-gray-300 cursor-pointer" /><input type="text" value={headerColor} onChange={e => setHeaderColor(e.target.value)} className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs" /></div>
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Background</label>
              <div className="flex items-center gap-2"><input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-8 h-8 rounded border border-gray-300 cursor-pointer" /><input type="text" value={bgColor} onChange={e => setBgColor(e.target.value)} className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs" /></div>
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Text</label>
              <div className="flex items-center gap-2"><input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-8 h-8 rounded border border-gray-300 cursor-pointer" /><input type="text" value={textColor} onChange={e => setTextColor(e.target.value)} className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs" /></div>
            </div>
          </div>
          <div className="flex items-center gap-1.5"><span className="text-xs text-gray-600 mr-1">Quick:</span>{quickColors.map((c,i) => (<button key={i} onClick={() => setHeaderColor(c)} className="w-5 h-5 rounded-full border border-gray-300" style={{background: c}} />))}</div>
        </div>

        {/* Custom Text */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-800 mb-3">Custom Text</h2>
          <div className="space-y-4">
            <div><label className="text-sm text-gray-700 mb-1 block">Tagline <span className="text-xs text-gray-400">(below company name)</span></label><input type="text" value={tagline} onChange={e => setTagline(e.target.value)} placeholder="e.g. Quality You Can Trust" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" /></div>
            <div><label className="text-sm text-gray-700 mb-1 block">Custom Note <span className="text-xs text-gray-400">(above line items)</span></label><textarea value={customNote} onChange={e => setCustomNote(e.target.value)} placeholder="e.g. Thank you for considering our services." rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none" /></div>
            <div><label className="text-sm text-gray-700 mb-1 block">Footer</label><textarea value={footer} onChange={e => setFooter(e.target.value)} placeholder="e.g. Payment due within 30 days." rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none" /></div>
          </div>
        </div>

        {/* Display Options */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-800 mb-3">Display Options</h2>
          <div className="grid grid-cols-2 gap-2">
            {[{l:"Show Logo",v:showLogo,s:setShowLogo},{l:"Show HSN/SAC column",v:showHsn,s:setShowHsn},{l:"Show Discount row",v:showDiscount,s:setShowDiscount},{l:"Total In Words",v:totalInWords,s:setTotalInWords},{l:"Show Tax row",v:showTax,s:setShowTax},{l:"Authorized Signature",v:authSignature,s:setAuthSignature},{l:"Split Tax (CGST + SGST)",v:splitTax,s:setSplitTax}].map(o => (
              <label key={o.l} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" checked={o.v} onChange={e => o.s(e.target.checked)} className="rounded" />{o.l}</label>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button onClick={() => alert("Settings saved!")} className="w-full py-3 bg-[#4caf85] text-white rounded-lg text-sm font-medium hover:bg-[#3d9a7e] flex items-center justify-center gap-2">💾 Save Settings</button>
      </div>

      {/* Right Panel - Live Preview (fixed) */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold text-gray-800">Live Preview</h2>
          <span className="text-sm text-gray-500">Updates as you type</span>
          <button className="ml-auto p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-200"><ExternalLink size={16} /></button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-3xl mx-auto" style={{background: bgColor}}>
          {/* Company Header */}
          <div className="p-6 flex items-center gap-4" style={{background: headerColor}}>
            {showLogo && <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center flex-shrink-0"><span className="font-bold text-lg" style={{color: headerColor}}>TB</span></div>}
            <div>
              <h3 className="text-white text-xl font-bold">Only Coffee Vegetarian Restaurant</h3>
              <p className="text-white/80 text-xs">S2H Foods And Enterprises Pvt Ltd Mahamaha Kulam, Kumbakonam- 612002 GSTIN: 33ABDCSS478H1Z4</p>
              {tagline && <p className="text-white/70 text-xs mt-1 italic">{tagline}</p>}
            </div>
          </div>

          <div className="p-6" style={{color: textColor}}>
            {/* Title */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold" style={{color: headerColor}}>QUOTATION</h2>
                <p className="text-sm mt-1"># QT-0001</p>
              </div>
              <div className="text-right">
                <p className="text-sm">Issue: 17/06/2026</p>
                <p className="text-sm">Valid: 17/07/2026</p>
                <span className="inline-block px-2 py-0.5 rounded text-xs font-bold mt-1 bg-gray-200">Draft</span>
              </div>
            </div>

            {customNote && <p className="text-sm italic mb-4 text-gray-600">{customNote}</p>}

            {/* Bill To */}
            <div className="mb-4"><p className="text-xs text-gray-500 uppercase">Bill To</p><p className="text-sm font-bold">Sample Customer</p></div>

            {/* Items Table */}
            <table className="w-full mb-6">
              <thead><tr style={{background: headerColor}} className="text-white">
                <th className="px-3 py-2 text-center text-xs font-semibold">#</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Item & Description</th>
                {showHsn && <th className="px-3 py-2 text-center text-xs font-semibold">HSN/SAC</th>}
                <th className="px-3 py-2 text-center text-xs font-semibold">Qty</th>
                <th className="px-3 py-2 text-right text-xs font-semibold">Rate</th>
                <th className="px-3 py-2 text-right text-xs font-semibold">Amount</th>
              </tr></thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2 text-sm text-center">1</td>
                  <td className="px-3 py-2 text-sm"><div className="font-medium">Website Design</div><div className="text-xs text-gray-500">Responsive UI</div></td>
                  {showHsn && <td className="px-3 py-2 text-sm text-center">52161559</td>}
                  <td className="px-3 py-2 text-sm text-center">1</td>
                  <td className="px-3 py-2 text-sm text-right">₹15,000</td>
                  <td className="px-3 py-2 text-sm text-right">₹15,000</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2 text-sm text-center">2</td>
                  <td className="px-3 py-2 text-sm font-medium">SEO Package</td>
                  {showHsn && <td className="px-3 py-2 text-sm text-center">52161559</td>}
                  <td className="px-3 py-2 text-sm text-center">1</td>
                  <td className="px-3 py-2 text-sm text-right">₹10,000</td>
                  <td className="px-3 py-2 text-sm text-right">₹10,000</td>
                </tr>
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-[280px] space-y-1.5">
                <div className="flex justify-between text-sm"><span>Sub Total</span><span>₹ 25,000</span></div>
                {showDiscount && <div className="flex justify-between text-sm"><span>Discount</span><span>- ₹ 2,500</span></div>}
                {showTax && splitTax && <>
                  <div className="flex justify-between text-sm"><span>CGST (6.00%)</span><span>₹ 1,350</span></div>
                  <div className="flex justify-between text-sm"><span>SGST (6.00%)</span><span>₹ 1,350</span></div>
                </>}
                {showTax && !splitTax && <div className="flex justify-between text-sm"><span>GST (12%)</span><span>₹ 2,700</span></div>}
                <div className="flex justify-between text-base font-bold border-t border-gray-300 pt-2"><span>Total</span><span style={{color: headerColor}}>₹ 23,625</span></div>
              </div>
            </div>

            {totalInWords && <p className="text-sm mt-4 text-gray-600">Total In Words: <em>Indian Rupee Twenty Three Thousand Six Hundred Twenty Five Only</em></p>}

            {footer && <p className="text-sm mt-4 text-gray-600 italic">{footer}</p>}

            {authSignature && <div className="flex justify-end mt-8"><div className="border border-gray-300 rounded px-8 py-4 text-center"><p className="text-xs text-gray-500">Authorized Signature</p></div></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
