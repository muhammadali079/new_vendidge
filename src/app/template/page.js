// export default function FBRInvoicePage() {
//   const invoice = {
//     invoiceNumber: "INV-202601-0016",
//     date: "18-Jan-2026",
//     fbrInvoiceNumber: "6110196137679DIABSXED179925",
//     seller: {
//       name: "Test Product Rate Persistence",
//       cnic: "6110188932805",
//       strn: "123456789",
//       province: "Punjab",
//     },
//     buyer: {
//       name: "Taxpayer 3330318202735",
//       cnic: "3330318202735",
//       address: "asdfasdfadsfadfa",
//       province: "Capital Territory",
//       status: "Unregistered",
//     },
//     items: [
//       {
//         sr: 1,
//         hsCode: "0101.2100",
//         description: "Oxen",
//         qty: 10,
//         uom: "Numbers, pieces, units",
//         perUnitPrice: "35,000.00",
//         subTotal: "350,000.00",
//         discount: "-",
//         totalValue: "350,000.00",
//         saleType: "3rd Schedule Goods",
//         srNo: "N/A",
//         taxableValue: "MSRP 45,000.00 × 10\n450,000.00",
//         gst: { percent: "18%", value: "81,000.00" },
//         fTax: { percent: "4%", value: "18,000.00" },
//         fed: { percent: "0%", value: "0.00" },
//         extra: { percent: "0%", value: "0.00" },
//         totalTax: "99,000.00",
//         totalPlusTax: "449,000.00",
//       },
//     ],
//     totals: {
//       valueExclTax: "350,000.00",
//       totalGST: "81,000.00",
//       totalFurtherTax: "18,000.00",
//       grandTotal: "Rs449,000.00",
//       amountDue: "Rs449,000.00",
//     },
//     generated: "Generated: 04/02/2026, 11:49:09",
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-start justify-center py-8 px-4">
//       <div className="bg-white w-full max-w-3xl shadow-lg rounded-sm font-sans text-sm text-gray-800">
//         {/* Header */}
//         <div className="flex items-start justify-between px-8 pt-6 pb-4">
//           {/* Logo */}
//           <div className="flex items-center gap-2">
//             <div className="w-10 h-10 flex items-center justify-center">
//               <svg viewBox="0 0 40 40" className="w-10 h-10">
//                 <rect x="2" y="2" width="16" height="16" rx="2" fill="#1e3a5f" />
//                 <rect x="22" y="2" width="16" height="16" rx="2" fill="#1e3a5f" />
//                 <rect x="2" y="22" width="16" height="16" rx="2" fill="#1e3a5f" />
//                 <rect x="26" y="26" width="8" height="8" rx="1" fill="#1e3a5f" />
//               </svg>
//             </div>
//             <div>
//               <div className="font-bold text-gray-700 text-base leading-tight tracking-wide">DIGITAL</div>
//               <div className="font-bold text-gray-700 text-base leading-tight tracking-wide">INVOICING</div>
//             </div>
//           </div>

//           {/* Right side */}
//           <div className="text-right">
//             <div className="bg-blue-800 text-white text-xs font-bold px-4 py-1.5 rounded mb-2 inline-block">
//               FBR TAX INVOICE
//             </div>
//             <div className="text-xs text-gray-600">
//               Invoice #: <span className="font-semibold text-gray-800">{invoice.invoiceNumber}</span>
//             </div>
//             <div className="text-xs text-gray-600">
//               Date: <span className="font-bold text-gray-900">{invoice.date}</span>
//             </div>
//             <div className="mt-2 border border-green-500 rounded px-3 py-1.5 text-center bg-white">
//               <div className="text-green-700 text-[9px] font-bold uppercase tracking-wider">FBR Invoice Number</div>
//               <div className="text-green-600 text-xs font-mono font-semibold mt-0.5">{invoice.fbrInvoiceNumber}</div>
//             </div>
//           </div>
//         </div>

//         <hr className="border-blue-800 border-t-2 mx-6" />

//         {/* Seller & Buyer Info */}
//         <div className="grid grid-cols-2 gap-4 mx-6 mt-4">
//           {/* Seller */}
//           <div className="border border-gray-200 rounded p-3">
//             <div className="text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-2">Seller Information</div>
//             <div className="font-semibold text-gray-900 text-sm">{invoice.seller.name}</div>
//             <div className="text-xs text-gray-600 mt-1">
//               CNIC: <span className="font-medium text-gray-800">{invoice.seller.cnic}</span>
//             </div>
//             <div className="text-xs text-gray-600">
//               STRN: <span className="font-medium text-gray-800">{invoice.seller.strn}</span>
//             </div>
//             <div className="text-xs text-gray-600">Province: {invoice.seller.province}</div>
//           </div>

//           {/* Buyer */}
//           <div className="border border-gray-200 rounded p-3">
//             <div className="text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-2">Buyer Information</div>
//             <div className="font-semibold text-gray-900 text-sm">{invoice.buyer.name}</div>
//             <div className="text-xs text-gray-600 mt-1">
//               CNIC: <span className="font-medium text-gray-800">{invoice.buyer.cnic}</span>
//             </div>
//             <div className="text-xs text-gray-600">Address: {invoice.buyer.address}</div>
//             <div className="text-xs text-gray-600">Province: {invoice.buyer.province}</div>
//             <div className="text-xs text-gray-600">
//               Status: <span className="text-red-600 font-semibold">{invoice.buyer.status}</span>
//             </div>
//           </div>
//         </div>

//         {/* Items Table */}
//         <div className="mx-6 mt-4">
//           <table className="w-full border-collapse text-xs">
//             <thead>
//               <tr className="bg-blue-800 text-white">
//                 <th className="px-2 py-2 text-left font-semibold">Sr</th>
//                 <th className="px-2 py-2 text-left font-semibold">HS Code</th>
//                 <th className="px-2 py-2 text-left font-semibold">Description</th>
//                 <th className="px-2 py-2 text-right font-semibold">Qty</th>
//                 <th className="px-2 py-2 text-left font-semibold">UOM</th>
//                 <th className="px-2 py-2 text-right font-semibold">Per Unit Price</th>
//                 <th className="px-2 py-2 text-right font-semibold">Sub Total</th>
//                 <th className="px-2 py-2 text-right font-semibold">Discount</th>
//                 <th className="px-2 py-2 text-right font-semibold">Total Value</th>
//               </tr>
//             </thead>
//             <tbody>
//               {invoice.items.map((item) => (
//                 <>
//                   <tr key={item.sr} className="border-b border-gray-200">
//                     <td className="px-2 py-2 align-top">{item.sr}</td>
//                     <td className="px-2 py-2 align-top text-blue-600">{item.hsCode}</td>
//                     <td className="px-2 py-2 align-top">{item.description}</td>
//                     <td className="px-2 py-2 align-top text-right">{item.qty}</td>
//                     <td className="px-2 py-2 align-top">{item.uom}</td>
//                     <td className="px-2 py-2 align-top text-right">{item.perUnitPrice}</td>
//                     <td className="px-2 py-2 align-top text-right">{item.subTotal}</td>
//                     <td className="px-2 py-2 align-top text-right">{item.discount}</td>
//                     <td className="px-2 py-2 align-top text-right font-semibold bg-yellow-50">{item.totalValue}</td>
//                   </tr>
//                   {/* Tax row */}
//                   <tr key={`${item.sr}-tax`} className="bg-gray-50 border-b border-gray-200 text-[10px]">
//                     <td className="px-2 py-1.5" colSpan={2}>
//                       <div className="text-gray-500">Sale Type</div>
//                       <div className="font-medium text-gray-700">{item.saleType}</div>
//                     </td>
//                     <td className="px-2 py-1.5">
//                       <div className="text-gray-500">SR #</div>
//                       <div className="font-medium text-gray-700">{item.srNo}</div>
//                     </td>
//                     <td className="px-2 py-1.5" colSpan={2}>
//                       <div className="text-gray-500">Taxable Value</div>
//                       <div className="font-medium text-gray-700 whitespace-pre-line">{item.taxableValue}</div>
//                     </td>
//                     <td className="px-2 py-1.5 text-center">
//                       <div className="text-gray-500">GST</div>
//                       <div className="font-medium">{item.gst.percent}</div>
//                       <div className="text-gray-700">{item.gst.value}</div>
//                     </td>
//                     <td className="px-2 py-1.5 text-center">
//                       <div className="text-gray-500">F.Tax</div>
//                       <div className="font-medium">{item.fTax.percent}</div>
//                       <div className="text-gray-700">{item.fTax.value}</div>
//                     </td>
//                     <td className="px-2 py-1.5 text-center">
//                       <div className="text-gray-500">FED</div>
//                       <div className="font-medium">{item.fed.percent}</div>
//                       <div className="text-gray-700">{item.fed.value}</div>
//                     </td>
//                     <td className="px-2 py-1.5">
//                       <div className="flex gap-4 justify-end">
//                         <div className="text-center">
//                           <div className="text-gray-500">Extra</div>
//                           <div className="font-medium">{item.extra.percent}</div>
//                           <div className="text-gray-700">{item.extra.value}</div>
//                         </div>
//                         <div className="text-center">
//                           <div className="text-green-700 font-semibold">Total Tax</div>
//                           <div className="text-green-700 font-bold">{item.totalTax}</div>
//                         </div>
//                         <div className="text-center">
//                           <div className="text-blue-800 font-semibold">Total + Tax</div>
//                           <div className="text-blue-800 font-bold">{item.totalPlusTax}</div>
//                         </div>
//                       </div>
//                     </td>
//                   </tr>
//                 </>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Bottom: QR + Totals */}
//         <div className="mx-6 mt-4 flex gap-6 items-start">
//           {/* QR / FBR Verified */}
//           <div className="border-2 border-green-500 rounded p-3 flex items-center gap-3 min-w-[200px]">
//             <div>
//               <div className="flex items-center gap-1 mb-2">
//                 <span className="text-green-500 text-base">✔</span>
//                 <span className="text-green-700 text-[10px] font-bold uppercase tracking-wider">FBR Verified Invoice</span>
//               </div>
//               {/* QR Code placeholder */}
//               <div className="w-20 h-20 bg-gray-100 border border-gray-300 flex items-center justify-center">
//                 <svg viewBox="0 0 80 80" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
//                   {/* Simple QR-like pattern */}
//                   <rect width="80" height="80" fill="white" />
//                   <rect x="4" y="4" width="24" height="24" fill="none" stroke="black" strokeWidth="3" />
//                   <rect x="8" y="8" width="16" height="16" fill="black" />
//                   <rect x="52" y="4" width="24" height="24" fill="none" stroke="black" strokeWidth="3" />
//                   <rect x="56" y="8" width="16" height="16" fill="black" />
//                   <rect x="4" y="52" width="24" height="24" fill="none" stroke="black" strokeWidth="3" />
//                   <rect x="8" y="56" width="16" height="16" fill="black" />
//                   <rect x="32" y="4" width="4" height="4" fill="black" />
//                   <rect x="40" y="4" width="4" height="4" fill="black" />
//                   <rect x="48" y="4" width="4" height="4" fill="black" />
//                   <rect x="32" y="12" width="4" height="4" fill="black" />
//                   <rect x="32" y="20" width="4" height="4" fill="black" />
//                   <rect x="40" y="20" width="4" height="4" fill="black" />
//                   <rect x="32" y="32" width="4" height="4" fill="black" />
//                   <rect x="40" y="32" width="4" height="4" fill="black" />
//                   <rect x="48" y="32" width="4" height="4" fill="black" />
//                   <rect x="56" y="32" width="4" height="4" fill="black" />
//                   <rect x="64" y="32" width="4" height="4" fill="black" />
//                   <rect x="72" y="32" width="4" height="4" fill="black" />
//                   <rect x="32" y="40" width="4" height="4" fill="black" />
//                   <rect x="44" y="40" width="4" height="4" fill="black" />
//                   <rect x="52" y="40" width="4" height="4" fill="black" />
//                   <rect x="60" y="40" width="4" height="4" fill="black" />
//                   <rect x="36" y="48" width="4" height="4" fill="black" />
//                   <rect x="48" y="48" width="4" height="4" fill="black" />
//                   <rect x="56" y="48" width="4" height="4" fill="black" />
//                   <rect x="64" y="48" width="4" height="4" fill="black" />
//                   <rect x="32" y="56" width="4" height="4" fill="black" />
//                   <rect x="40" y="56" width="4" height="4" fill="black" />
//                   <rect x="52" y="56" width="4" height="4" fill="black" />
//                   <rect x="68" y="56" width="4" height="4" fill="black" />
//                   <rect x="36" y="64" width="4" height="4" fill="black" />
//                   <rect x="44" y="64" width="4" height="4" fill="black" />
//                   <rect x="60" y="64" width="4" height="4" fill="black" />
//                   <rect x="72" y="64" width="4" height="4" fill="black" />
//                   <rect x="32" y="72" width="4" height="4" fill="black" />
//                   <rect x="48" y="72" width="4" height="4" fill="black" />
//                   <rect x="64" y="72" width="4" height="4" fill="black" />
//                 </svg>
//               </div>
//               <div className="mt-1 text-[8px] text-gray-500 text-center">Scan to verify</div>
//               <div className="text-[8px] text-blue-600 font-mono text-center break-all mt-0.5">
//                 {invoice.fbrInvoiceNumber}
//               </div>
//             </div>
//             {/* FBR Digital logo */}
//             <div className="flex flex-col items-center justify-center">
//               <div className="bg-blue-700 rounded p-2 flex flex-col items-center">
//                 <div className="text-white text-[10px] font-bold">FBR</div>
//                 <div className="text-blue-300 text-[9px] font-bold">DIGITAL</div>
//               </div>
//             </div>
//           </div>

//           {/* Totals */}
//           <div className="flex-1">
//             <table className="w-full text-sm">
//               <tbody>
//                 <tr className="border-b border-gray-100">
//                   <td className="py-2 text-gray-600">Total Value (Excl. Tax)</td>
//                   <td className="py-2 text-right font-medium">{invoice.totals.valueExclTax}</td>
//                 </tr>
//                 <tr className="border-b border-gray-100">
//                   <td className="py-2 text-gray-600">Total GST</td>
//                   <td className="py-2 text-right font-medium">{invoice.totals.totalGST}</td>
//                 </tr>
//                 <tr className="border-b border-gray-200">
//                   <td className="py-2 text-gray-600">Total Further Tax</td>
//                   <td className="py-2 text-right font-medium">{invoice.totals.totalFurtherTax}</td>
//                 </tr>
//                 <tr className="bg-blue-800 text-white">
//                   <td className="py-2.5 px-3 font-bold text-sm">Grand Total</td>
//                   <td className="py-2.5 px-3 text-right font-bold text-base">{invoice.totals.grandTotal}</td>
//                 </tr>
//                 <tr>
//                   <td className="py-2 text-red-600 font-semibold">Amount Due</td>
//                   <td className="py-2 text-right text-red-600 font-bold">{invoice.totals.amountDue}</td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="mx-6 mt-4 mb-4 flex justify-between items-end border-t border-gray-200 pt-3">
//           <div className="text-xs font-semibold text-gray-700">{invoice.seller.name}</div>
//           <div className="text-right text-[10px] text-gray-500">
//             <div>{invoice.generated}</div>
//             <div>This is a computer-generated document</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

export default function FBRInvoicePage() {
  const invoice = {
    invoiceNumber: "INV-202601-0016",
    date: "18-Jan-2026",
    fbrInvoiceNumber: "6110196137679DIABSXED179925",
    seller: {
      name: "Test Product Rate Persistence",
      cnic: "6110188932805",
      strn: "123456789",
      province: "Punjab",
    },
    buyer: {
      name: "Taxpayer 3330318202735",
      cnic: "3330318202735",
      address: "asdfasdfadsfadfa",
      province: "Capital Territory",
      status: "Unregistered",
    },
    items: [
      {
        sr: 1,
        hsCode: "0101.2100",
        description: "Oxen",
        qty: 10,
        uom: "Numbers, pieces, units",
        perUnitPrice: "35,000.00",
        subTotal: "350,000.00",
        discount: "-",
        totalValue: "350,000.00",
        saleType: "3rd Schedule Goods",
        srNo: "N/A",
        taxableValue: "MSRP 45,000.00 × 10\n450,000.00",
        gst: { percent: "18%", value: "81,000.00" },
        fTax: { percent: "4%", value: "18,000.00" },
        fed: { percent: "0%", value: "0.00" },
        extra: { percent: "0%", value: "0.00" },
        totalTax: "99,000.00",
        totalPlusTax: "449,000.00",
      },
    ],
    totals: {
      valueExclTax: "350,000.00",
      totalGST: "81,000.00",
      totalFurtherTax: "18,000.00",
      grandTotal: "Rs449,000.00",
      amountDue: "Rs449,000.00",
    },
    generated: "Generated: 04/02/2026, 11:49:09",
  };

  return (
    <>
      <style>{`
        @page {
          size: A4 portrait;
          margin: 10mm 12mm;
        }

        @media print {
          html, body {
            width: 210mm;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .screen-wrapper {
            background: white !important;
            padding: 0 !important;
            min-height: unset !important;
          }
          .invoice-card {
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          /* Force color backgrounds */
          .thead-blue th {
            background-color: #1e40af !important;
            color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .grand-total-row td {
            background-color: #1e40af !important;
            color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .fbr-badge-inner {
            background-color: #1d4ed8 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .total-value-cell {
            background-color: #fefce8 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .tax-subrow {
            background-color: #f9fafb !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }

        @media screen {
          .screen-wrapper {
            background: #f3f4f6;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 2rem 1rem;
          }
        }
      `}</style>

      <div className="screen-wrapper">
        {/* Print Button */}
        <div className="no-print" style={{ marginBottom: 16, display: "flex", gap: 12 }}>
          <button
            onClick={() => window.print()}
            style={{
              backgroundColor: "#1e40af",
              color: "white",
              padding: "8px 20px",
              borderRadius: 4,
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            🖨️ Print / Save as PDF
          </button>
        </div>

        {/* Invoice */}
        <div
          className="invoice-card"
          style={{
            backgroundColor: "white",
            boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
            borderRadius: 2,
            fontFamily: "Arial, Helvetica, sans-serif",
            color: "#1f2937",
            width: "210mm",
            fontSize: 11,
            lineHeight: 1.45,
          }}
        >
          {/* ── HEADER ── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "18px 28px 12px" }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg viewBox="0 0 40 40" style={{ width: 36, height: 36 }}>
                <rect x="2" y="2" width="16" height="16" rx="2" fill="#1e3a5f" />
                <rect x="22" y="2" width="16" height="16" rx="2" fill="#1e3a5f" />
                <rect x="2" y="22" width="16" height="16" rx="2" fill="#1e3a5f" />
                <rect x="26" y="26" width="8" height="8" rx="1" fill="#1e3a5f" />
              </svg>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#374151", letterSpacing: 1 }}>DIGITAL</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#374151", letterSpacing: 1 }}>INVOICING</div>
              </div>
            </div>

            {/* Right info */}
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  backgroundColor: "#1e40af",
                  color: "white",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "4px 12px",
                  borderRadius: 3,
                  display: "inline-block",
                  marginBottom: 5,
                }}
              >
                FBR TAX INVOICE
              </div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>
                Invoice #: <span style={{ fontWeight: 600, color: "#111827" }}>{invoice.invoiceNumber}</span>
              </div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>
                Date: <span style={{ fontWeight: 700, color: "#111827" }}>{invoice.date}</span>
              </div>
              <div
                style={{
                  marginTop: 6,
                  border: "1.5px solid #16a34a",
                  borderRadius: 4,
                  padding: "4px 10px",
                  textAlign: "center",
                }}
              >
                <div style={{ color: "#15803d", fontSize: 8, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" }}>
                  FBR Invoice Number
                </div>
                <div style={{ color: "#16a34a", fontSize: 10, fontFamily: "monospace", fontWeight: 600, marginTop: 1 }}>
                  {invoice.fbrInvoiceNumber}
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 2, backgroundColor: "#1e3a5f", margin: "0 22px" }} />

          {/* ── SELLER & BUYER ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "12px 22px 0" }}>
            {[
              { label: "Seller Information", fields: [
                { label: null, value: invoice.seller.name, bold: true, size: 12 },
                { label: "CNIC", value: invoice.seller.cnic },
                { label: "STRN", value: invoice.seller.strn },
                { label: "Province", value: invoice.seller.province },
              ]},
              { label: "Buyer Information", fields: [
                { label: null, value: invoice.buyer.name, bold: true, size: 12 },
                { label: "CNIC", value: invoice.buyer.cnic },
                { label: "Address", value: invoice.buyer.address },
                { label: "Province", value: invoice.buyer.province },
                { label: "Status", value: invoice.buyer.status, red: true },
              ]},
            ].map((section) => (
              <div key={section.label} style={{ border: "1px solid #e5e7eb", borderRadius: 4, padding: "9px 11px" }}>
                <div style={{ color: "#1d4ed8", fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 5 }}>
                  {section.label}
                </div>
                {section.fields.map((f, i) => (
                  <div key={i} style={{ fontSize: f.size || 10, marginTop: i === 0 ? 0 : 2 }}>
                    {f.label ? (
                      <span style={{ color: "#6b7280" }}>
                        {f.label}:{" "}
                        <span style={{ fontWeight: f.bold ? 600 : 500, color: f.red ? "#dc2626" : "#111827" }}>
                          {f.value}
                        </span>
                      </span>
                    ) : (
                      <span style={{ fontWeight: 600, color: "#111827" }}>{f.value}</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* ── ITEMS TABLE ── */}
          <div style={{ margin: "12px 22px 0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
              <thead>
                <tr className="thead-blue">
                  {[
                    { label: "Sr", align: "left" },
                    { label: "HS Code", align: "left" },
                    { label: "Description", align: "left" },
                    { label: "Qty", align: "right" },
                    { label: "UOM", align: "left" },
                    { label: "Per Unit Price", align: "right" },
                    { label: "Sub Total", align: "right" },
                    { label: "Discount", align: "right" },
                    { label: "Total Value", align: "right" },
                  ].map((col) => (
                    <th
                      key={col.label}
                      style={{
                        padding: "6px 6px",
                        textAlign: col.align,
                        fontWeight: 600,
                        backgroundColor: "#1e40af",
                        color: "white",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <>
                    <tr key={item.sr} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "6px 6px", verticalAlign: "top" }}>{item.sr}</td>
                      <td style={{ padding: "6px 6px", verticalAlign: "top", color: "#2563eb" }}>{item.hsCode}</td>
                      <td style={{ padding: "6px 6px", verticalAlign: "top" }}>{item.description}</td>
                      <td style={{ padding: "6px 6px", verticalAlign: "top", textAlign: "right" }}>{item.qty}</td>
                      <td style={{ padding: "6px 6px", verticalAlign: "top" }}>{item.uom}</td>
                      <td style={{ padding: "6px 6px", verticalAlign: "top", textAlign: "right" }}>{item.perUnitPrice}</td>
                      <td style={{ padding: "6px 6px", verticalAlign: "top", textAlign: "right" }}>{item.subTotal}</td>
                      <td style={{ padding: "6px 6px", verticalAlign: "top", textAlign: "right" }}>{item.discount}</td>
                      <td className="total-value-cell" style={{ padding: "6px 6px", verticalAlign: "top", textAlign: "right", fontWeight: 600, backgroundColor: "#fefce8" }}>
                        {item.totalValue}
                      </td>
                    </tr>

                    {/* Tax sub-row */}
                    <tr key={`${item.sr}-tax`} className="tax-subrow" style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: 9 }}>
                      <td style={{ padding: "5px 6px" }} colSpan={2}>
                        <div style={{ color: "#9ca3af" }}>Sale Type</div>
                        <div style={{ fontWeight: 500, color: "#374151" }}>{item.saleType}</div>
                      </td>
                      <td style={{ padding: "5px 6px" }}>
                        <div style={{ color: "#9ca3af" }}>SR #</div>
                        <div style={{ fontWeight: 500 }}>{item.srNo}</div>
                      </td>
                      <td style={{ padding: "5px 6px" }} colSpan={2}>
                        <div style={{ color: "#9ca3af" }}>Taxable Value</div>
                        <div style={{ fontWeight: 500, color: "#374151", whiteSpace: "pre-line" }}>{item.taxableValue}</div>
                      </td>
                      <td style={{ padding: "5px 6px", textAlign: "center" }}>
                        <div style={{ color: "#9ca3af" }}>GST</div>
                        <div style={{ fontWeight: 600 }}>{item.gst.percent}</div>
                        <div>{item.gst.value}</div>
                      </td>
                      <td style={{ padding: "5px 6px", textAlign: "center" }}>
                        <div style={{ color: "#9ca3af" }}>F.Tax</div>
                        <div style={{ fontWeight: 600 }}>{item.fTax.percent}</div>
                        <div>{item.fTax.value}</div>
                      </td>
                      <td style={{ padding: "5px 6px", textAlign: "center" }}>
                        <div style={{ color: "#9ca3af" }}>FED</div>
                        <div style={{ fontWeight: 600 }}>{item.fed.percent}</div>
                        <div>{item.fed.value}</div>
                      </td>
                      <td style={{ padding: "5px 6px" }}>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ color: "#9ca3af" }}>Extra</div>
                            <div style={{ fontWeight: 600 }}>{item.extra.percent}</div>
                            <div>{item.extra.value}</div>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ color: "#15803d", fontWeight: 600 }}>Total Tax</div>
                            <div style={{ color: "#15803d", fontWeight: 700 }}>{item.totalTax}</div>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ color: "#1e40af", fontWeight: 600 }}>Total + Tax</div>
                            <div style={{ color: "#1e40af", fontWeight: 700 }}>{item.totalPlusTax}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── BOTTOM: QR + TOTALS ── */}
          <div style={{ display: "flex", gap: 20, margin: "14px 22px 0", alignItems: "flex-start" }}>
            {/* FBR Verified */}
            <div
              style={{
                border: "2px solid #16a34a",
                borderRadius: 5,
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                minWidth: 195,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 5 }}>
                  <span style={{ color: "#16a34a", fontSize: 12, fontWeight: 700 }}>✔</span>
                  <span style={{ color: "#15803d", fontSize: 8, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
                    FBR Verified Invoice
                  </span>
                </div>
                <svg viewBox="0 0 80 80" style={{ width: 70, height: 70 }} xmlns="http://www.w3.org/2000/svg">
                  <rect width="80" height="80" fill="white" />
                  <rect x="4" y="4" width="24" height="24" fill="none" stroke="black" strokeWidth="3" />
                  <rect x="8" y="8" width="16" height="16" fill="black" />
                  <rect x="52" y="4" width="24" height="24" fill="none" stroke="black" strokeWidth="3" />
                  <rect x="56" y="8" width="16" height="16" fill="black" />
                  <rect x="4" y="52" width="24" height="24" fill="none" stroke="black" strokeWidth="3" />
                  <rect x="8" y="56" width="16" height="16" fill="black" />
                  <rect x="32" y="4" width="4" height="4" fill="black" />
                  <rect x="40" y="4" width="4" height="4" fill="black" />
                  <rect x="48" y="4" width="4" height="4" fill="black" />
                  <rect x="32" y="12" width="4" height="4" fill="black" />
                  <rect x="32" y="20" width="4" height="4" fill="black" />
                  <rect x="40" y="20" width="4" height="4" fill="black" />
                  <rect x="32" y="32" width="4" height="4" fill="black" />
                  <rect x="40" y="32" width="4" height="4" fill="black" />
                  <rect x="48" y="32" width="4" height="4" fill="black" />
                  <rect x="56" y="32" width="4" height="4" fill="black" />
                  <rect x="64" y="32" width="4" height="4" fill="black" />
                  <rect x="72" y="32" width="4" height="4" fill="black" />
                  <rect x="32" y="40" width="4" height="4" fill="black" />
                  <rect x="44" y="40" width="4" height="4" fill="black" />
                  <rect x="52" y="40" width="4" height="4" fill="black" />
                  <rect x="60" y="40" width="4" height="4" fill="black" />
                  <rect x="36" y="48" width="4" height="4" fill="black" />
                  <rect x="48" y="48" width="4" height="4" fill="black" />
                  <rect x="56" y="48" width="4" height="4" fill="black" />
                  <rect x="64" y="48" width="4" height="4" fill="black" />
                  <rect x="32" y="56" width="4" height="4" fill="black" />
                  <rect x="40" y="56" width="4" height="4" fill="black" />
                  <rect x="52" y="56" width="4" height="4" fill="black" />
                  <rect x="68" y="56" width="4" height="4" fill="black" />
                  <rect x="36" y="64" width="4" height="4" fill="black" />
                  <rect x="44" y="64" width="4" height="4" fill="black" />
                  <rect x="60" y="64" width="4" height="4" fill="black" />
                  <rect x="72" y="64" width="4" height="4" fill="black" />
                  <rect x="32" y="72" width="4" height="4" fill="black" />
                  <rect x="48" y="72" width="4" height="4" fill="black" />
                  <rect x="64" y="72" width="4" height="4" fill="black" />
                </svg>
                <div style={{ marginTop: 2, fontSize: 8, color: "#9ca3af", textAlign: "center" }}>Scan to verify</div>
                <div style={{ fontSize: 7, color: "#2563eb", fontFamily: "monospace", textAlign: "center", wordBreak: "break-all", marginTop: 1 }}>
                  {invoice.fbrInvoiceNumber}
                </div>
              </div>
              <div
                className="fbr-badge-inner"
                style={{
                  backgroundColor: "#1d4ed8",
                  borderRadius: 5,
                  padding: "6px 8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div style={{ color: "white", fontSize: 11, fontWeight: 700 }}>FBR</div>
                <div style={{ color: "#93c5fd", fontSize: 9, fontWeight: 700 }}>DIGITAL</div>
              </div>
            </div>

            {/* Totals */}
            <div style={{ flex: 1 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "7px 4px", color: "#6b7280" }}>Total Value (Excl. Tax)</td>
                    <td style={{ padding: "7px 4px", textAlign: "right", fontWeight: 500 }}>{invoice.totals.valueExclTax}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "7px 4px", color: "#6b7280" }}>Total GST</td>
                    <td style={{ padding: "7px 4px", textAlign: "right", fontWeight: 500 }}>{invoice.totals.totalGST}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "7px 4px", color: "#6b7280" }}>Total Further Tax</td>
                    <td style={{ padding: "7px 4px", textAlign: "right", fontWeight: 500 }}>{invoice.totals.totalFurtherTax}</td>
                  </tr>
                  <tr className="grand-total-row">
                    <td style={{ padding: "8px 10px", backgroundColor: "#1e40af", color: "white", fontWeight: 700, fontSize: 12 }}>
                      Grand Total
                    </td>
                    <td style={{ padding: "8px 10px", backgroundColor: "#1e40af", textAlign: "right", color: "white", fontWeight: 700, fontSize: 14 }}>
                      {invoice.totals.grandTotal}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "7px 4px", color: "#dc2626", fontWeight: 600 }}>Amount Due</td>
                    <td style={{ padding: "7px 4px", textAlign: "right", color: "#dc2626", fontWeight: 700 }}>
                      {invoice.totals.amountDue}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div
            style={{
              margin: "14px 22px 16px",
              paddingTop: 10,
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>{invoice.seller.name}</div>
            <div style={{ textAlign: "right", fontSize: 9, color: "#9ca3af" }}>
              <div>{invoice.generated}</div>
              <div>This is a computer-generated document</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}