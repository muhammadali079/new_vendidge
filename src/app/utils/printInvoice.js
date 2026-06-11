// // src/app/utils/printInvoice.js
// import QRCode from "qrcode";

// export const handlePrintInvoice = async (
//   targetInvoice,
//   invoiceForm,
//   customers,
//   rows,
//   scenarioCodes,
//   invoices,
//   formatDateForInput,
//   formatNumber,
//   shouldShow,
//   shouldShowHeader,
// ) => {
//   try {
//     const sellerName = sessionStorage.getItem("sellerBusinessName") || "";
//     console.log("Seller Name from sessionStorage:", sellerName);
//     const sellerAddress = sessionStorage.getItem("sellerAddress") || "";
//     console.log("Seller Address from sessionStorage:", sellerAddress);
//     const sellerNTN = sessionStorage.getItem("sellerNTNCNIC") || "";
//     const sellerInvoiceNTN = sessionStorage.getItem("sellerInvoiceNTN");
//     console.log(
//       "Seller sellerInvoiceNTN from sessionStorage:",
//       sellerInvoiceNTN,
//     );

//     console.log("target invoice id", targetInvoice);
//     console.log("form invoice id", invoiceForm);

//     const invoiceNo = invoiceForm.invoiceNo || targetInvoice.invoice_no || "";
//     const invoiceDate =
//       formatDateForInput(invoiceForm.date || targetInvoice.invoice_date) || "";
//     const challanNo = invoiceForm.challanNo || targetInvoice.challanNo || "";
//     const challanNoLabel =
//       invoiceForm.challanNoLabel || targetInvoice.challanNoLabel || "";
//     const challanDateLabel =
//       invoiceForm.challanDateLabel || targetInvoice.challanDateLabel || "";
//     const challanDate =
//       formatDateForInput(
//         invoiceForm.challan_date || targetInvoice.challan_date,
//       ) || "";
//     const invoicePostDate =
//       formatDateForInput(
//         invoiceForm.invoice_posted_date || targetInvoice.invoice_posted_date,
//       ) || "";

//     // const customerName =
//     //   invoiceForm.customer.split(" - ")[0] || targetInvoice.customer_name || "";
//     const customerName =
//       invoiceForm.customer_name || targetInvoice.customer_name || "";
//     const isEvent = targetInvoice && targetInvoice.nativeEvent;

//     const activeCustomerId =
//       targetInvoice && !isEvent
//         ? targetInvoice.customer_id
//         : invoiceForm.customerId || invoiceForm.customer_id;

//     const customerAddress =
//       customers.find((c) => c.id === activeCustomerId)?.address || "";
//     const customerProvince =
//       invoiceForm.buyerProvince || targetInvoice.buyerProvince || "";
//     const customer = customers.find((c) => c.id === activeCustomerId);

//     const idLabel = customer?.ntn ? "NTN" : "CNIC";
//     const idValue = customer?.ntn || customer?.cnic || "";

//     const currency = "PKR";
//     const isProd =
//       document.cookie
//         .split("; ")
//         .find((row) => row.startsWith("isProd="))
//         ?.split("=")[1] === "1";
//     const invoiceMetaLabel = isProd ? "Transaction Type" : "Scenario";

//     let activeRows = [];
//     if (targetInvoice && targetInvoice.items) {
//       activeRows =
//         typeof targetInvoice.items === "string"
//           ? JSON.parse(targetInvoice.items)
//           : targetInvoice.items;
//     } else {
//       activeRows = rows;
//     }
//     const activeScenarioCode =
//       targetInvoice.scenario_code || invoiceForm.scenarioCode || "";
//     console.log("Active Scenario Code:", activeScenarioCode);
//     console.log("Scenario Codes List:", scenarioCodes);

//     const scenarioCodeDescription =
//       scenarioCodes.find((sc) => sc.code === activeScenarioCode)?.description ||
//       "";

//     const invoiceMetaValue = isProd
//       ? activeRows[0]?.TransactionType || "-"
//       : `${activeScenarioCode || "-"} - ${scenarioCodeDescription}`;

//     const footerEnvText =
//       process.env.NEXT_PUBLIC_INVOICE_FOOTER || "No Text from ENV.";
//     const tableRows = activeRows
//       .map((r, index) => {
//         const isThirdSchedule =
//           activeScenarioCode === "SN008" || activeScenarioCode === "SN027";
//         const taxRateDisplay = isThirdSchedule
//           ? `${r.rateDesc} on Retail:<br>${formatNumber(r.fixedNotifiedValueOrRetailPrice || 0)}`
//           : `(${r.rateDesc})`;

//         return `
//     <tr>
//         <td style="border:1px solid #000; padding:2px; text-align:center;">${index + 1}</td>
//         <td style="border:1px solid #000; padding:2px; text-align:center;">${r.hsCode}</td>
//         <td style="border:1px solid #000; padding:2px;">${r.description}</td>
//         ${shouldShow("SRO Schedule No.", r) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${r.sroScheduleNo || ""}</td>` : ""}
//         ${shouldShow("SRO Item Sr No.", r) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${r.sroItemSerialNo || ""}</td>` : ""}
//         <td style="border:1px solid #000; padding:2px; text-align:center;">${r.unit || ""}</td>
//         ${shouldShow("Internal UoM", r) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${r.internalUOM || ""}</td>` : ""}

//         <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.singleUnitPrice || 0)}</td>
//         ${shouldShow("Internal Single Unit", r) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.internalSinglePrice || 0)}</td>` : ""}
//         <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.qty || 0)}</td>
//         ${shouldShow("Internal Qty", r) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.internalQty || 0)}</td>` : ""}
//         <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.discount || 0)}</td>
//         <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.valueSalesExcludingST || 0)}</td>
//         ${shouldShow("Fixed Notified Value or Retail Price", r) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.fixedNotifiedValueOrRetailPrice || 0)}</td>` : ""}
//         <td style="border:1px solid #000; padding:2px; text-align:center; font-size:9px;">
//             ${taxRateDisplay}<br><strong>${formatNumber(r.salesTaxApplicable || 0)}</strong>
//         </td>
//         ${shouldShow("Extra Tax", r) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.extraTax || 0)}</td>` : ""}
//         ${shouldShow("Further Tax", r) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.furtherTax || 0)}</td>` : ""}
//         ${shouldShow("Federal Excise Duty", r) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.fedPayable || 0)}</td>` : ""}
//         ${shouldShow("Sales Tax With-Held at SOURCE", r) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.salesTaxWithheldAtSource || 0)}</td>` : ""}
//         <td style="border:1px solid #000; padding:2px; text-align:right;"><strong>${formatNumber(r.totalValues || r.valueInclTax || 0)}</strong></td>
//     </tr>`;
//       })
//       .join("");

//     const totalDisc = activeRows.reduce(
//       (sum, r) => sum + Number(r.discount || 0),
//       0,
//     );
//     const totalQty = activeRows.reduce((sum, r) => sum + Number(r.qty || 0), 0);
//     const totalFixednotifiedretailPrice = activeRows.reduce(
//       (sum, r) => sum + Number(r.fixedNotifiedValueOrRetailPrice || 0),
//       0,
//     );
//     const totalFedPayable = activeRows.reduce(
//       (sum, r) => sum + Number(r.fedPayable || 0),
//       0,
//     );
//     const totalFurthurTax = activeRows.reduce(
//       (sum, r) => sum + Number(r.furtherTax || 0),
//       0,
//     );
//     const totalExtraTax = activeRows.reduce(
//       (sum, r) => sum + Number(r.extraTax || 0),
//       0,
//     );
//     const totalSalesTaxWithheldAtSource = activeRows.reduce(
//       (sum, r) => sum + Number(r.salesTaxWithheldAtSource || 0),
//       0,
//     );
//     const totalExclTax = activeRows.reduce(
//       (sum, r) => sum + Number(r.valueSalesExcludingST || 0),
//       0,
//     );
//     const totalSaleTaxApplicable = activeRows.reduce(
//       (sum, r) => sum + Number(r.salesTaxApplicable || 0),
//       0,
//     );
//     const totalTax =
//       activeRows.reduce(
//         (sum, r) => sum + Number(r.salesTaxApplicable || 0),
//         0,
//       ) +
//       activeRows.reduce(
//         (sum, r) => sum + Number(r.salesTaxWithheldAtSource || 0),
//         0,
//       ) +
//       activeRows.reduce((sum, r) => sum + Number(r.extraTax || 0), 0) +
//       activeRows.reduce((sum, r) => sum + Number(r.furtherTax || 0), 0) +
//       activeRows.reduce((sum, r) => sum + Number(r.fedPayable || 0), 0);

//     const totalInclTax = totalExclTax + totalTax;

//     const totalInternalQty = activeRows.reduce(
//       (sum, r) => sum + Number(r.internalQty || 0),
//       0,
//     );
//     const totalInternalSingleUnitPrice = activeRows.reduce(
//       (sum, r) => sum + Number(r.internalSinglePrice || 0),
//       0,
//     );
//     const totalSingleUnitPrice = activeRows.reduce(
//       (sum, r) => sum + Number(r.singleUnitPrice || 0),
//       0,
//     );

//     const fbrInvoiceNo =
//       targetInvoice && !isEvent
//         ? targetInvoice.fbr_invoice_no
//         : invoices.find((inv) => inv.invoice_no === invoiceForm.invoiceNo)
//             ?.fbr_invoice_no || "";

//     let qrCodeUrl = "";

//     if (fbrInvoiceNo) {
//       qrCodeUrl = await QRCode.toDataURL(fbrInvoiceNo, {
//         width: 200,
//         margin: 1,
//       });
//     }
//     function imageToBase64(url) {
//       return new Promise((resolve, reject) => {
//         const img = new Image();
//         img.crossOrigin = "anonymous";
//         img.onload = function () {
//           const canvas = document.createElement("canvas");
//           canvas.width = img.width;
//           canvas.height = img.height;

//           const ctx = canvas.getContext("2d");
//           ctx.drawImage(img, 0, 0);

//           resolve(canvas.toDataURL("image/jpeg"));
//         };
//         img.onerror = reject;
//         img.src = url;
//       });
//     }
//     const fbrLogoUrl = await imageToBase64("/images/fbr_logo.png");

//     const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

//     let visibleColsBeforeQty = 3;
//     if (shouldShowHeader("SRO Schedule No.", activeRows))
//       visibleColsBeforeQty++;
//     if (shouldShowHeader("SRO Item Sr No.", activeRows)) visibleColsBeforeQty++;
//     visibleColsBeforeQty++;
//     if (shouldShowHeader("Internal UoM", activeRows)) visibleColsBeforeQty++;
//     visibleColsBeforeQty++;
//     if (shouldShowHeader("Internal Single Unit", activeRows))
//       visibleColsBeforeQty++;

//     const savedOrientation =
//       localStorage.getItem("userPrintOrientation") || "landscape";
//     let headerHeight = 0;

//     if (shouldShow("Seller Name")) headerHeight += 25;
//     if (shouldShow("Seller Address")) headerHeight += 20;
//     if (shouldShow("Seller NTN")) headerHeight += 20;
//     headerHeight += 40;
//     headerHeight += 10;

//     const printContent = `
// <style>
//     @media print {
//         @page {
//            size: A4 ${savedOrientation} !important;
//             margin: 10mm;
//         }
//         html, body {
//             margin: 0;
//             padding: 0;
//         }

//         .master-table {
//             width: 100%;
//             border-collapse: collapse;
//         }
//        .header-spacer { height: ${headerHeight}px; }

//         .footer-spacer { height: 50px; }

//         .header-fixed {
//             position: fixed;
//             top: 0;
//             left: 0;
//             width: 100%;
//             height: ${headerHeight - 5}px;
//             background: white;
//             z-index: 2000;
//         }
//         .footer-fixed {
//             position: fixed;
//             bottom: 0;
//             left: 0;
//             width: 100%;
//             height: 45px;
//             background: white;
//             display: flex !important;
//             justify-content: space-between;
//             align-items: center;
//             z-index: 2000;
//             font-size: 12px
//         }
//         .page-counter-display::after {
//             font-weight: bold;
//         }
//         tr { page-break-inside: avoid !important; }
//         thead { display: table-header-group !important; }
//     }
//     @media screen {
//         .header-fixed, .footer-fixed { display: none; }
//     }
// </style>

// <div class="header-fixed">
//     <div style="text-align:center; font-weight:bold; font-size:16px; margin-top:5px;">
//          ${shouldShow("Seller Name") ? `${sellerName.toUpperCase()}` : ""}
//     </div>
//     <div style="text-align:center; font-size:11px;">
//           ${shouldShow("Seller Address") ? `${sellerAddress.toUpperCase()}` : ""}
//     </div>
//     <div style="text-align:center; font-size:11px; margin-bottom:12px;">
//         ${shouldShow("Seller NTN") ? `NTN No. ${sellerInvoiceNTN}` : ""}
//     </div>
//     <div style="text-align:center; font-weight:bold; font-size:14px; padding: 6px 0; margin: 0 10px; position: relative;">
//         SALES TAX INVOICE
//         <span class="page-counter-display" style="position: absolute; right: 10px; font-size: 10px;"></span>
//     </div>
// </div>

// <div class="footer-fixed">
//     <span style="padding-left:15px; font-style: italic;">${footerEnvText}</span>
//     <span class="page-counter-display" style="padding-right:15px; font-weight:bold;"></span>
// </div>

// <table class="master-table">
//     <thead>
//         <tr><td><div class="header-spacer">&nbsp;</div></td></tr>
//     </thead>
//     <tbody>
//         <tr><td>
//             <div style="font-family: Arial, sans-serif; font-size: 11px; padding: 0 10px;">

//                 <table style="width:100%; border-collapse:collapse; font-size:11px; margin-bottom:12px;">
//                     <tr>
//                         <td style="width:55%; vertical-align:top; border:1px solid #000; padding:6px;">
//                             <strong>Billing To:</strong><br>
//                             ${customerName}<br>
//                             Address: ${customerAddress || "Address not provided"}<br>
//                             Province: ${customerProvince}<br>
//                             ${idLabel}: ${idValue}
//                         </td>
//                         <td style="width:45%; vertical-align:top; border:1px solid #000; padding:6px;">
//             <table style="width:100%; border-collapse:collapse;">
//                 <tr><td style="width:40%;"><strong>Invoice Number</strong></td><td>${invoiceNo}</td></tr>
//                 <tr><td><strong>Date</strong></td><td>${invoiceDate}</td></tr>
//                 <tr><td><strong>Buyer Type</strong></td><td>${(targetInvoice && !targetInvoice.nativeEvent ? targetInvoice.buyerType : invoiceForm.buyerType) || ""}</td></tr>
//                 <tr><td><strong>Currency</strong></td><td>${currency || "PKR"}</td></tr>
//                 <tr><td><strong>${invoiceMetaLabel}</strong></td><td>${invoiceMetaValue}</td></tr>

//                 ${
//                   shouldShow("Challan No", invoiceForm)
//                     ? `
//                     <tr>
//                         <td><strong>${challanNoLabel}</strong></td>
//                         <td>${challanNo}</td>
//                     </tr>`
//                     : ""
//                 }

//                 ${
//                   shouldShow("Challan Date", invoiceForm)
//                     ? `
//                     <tr>
//                         <td><strong>${challanDateLabel}</strong></td>
//                         <td>${challanDate}</td>
//                     </tr>`
//                     : ""
//                 }

//                 ${
//                   shouldShow("Invoice Print Date", invoiceForm)
//                     ? `
//                     <tr>
//                         <td><strong>Invoice Post Date</strong></td>
//                         <td>${invoicePostDate}</td>
//                     </tr>`
//                     : ""
//                 }
//             </table>
//         </td>
//                     </tr>
//                 </table>

//                 <table style="width:100%; border-collapse:collapse; font-size:10px; margin-bottom:12px; border:1px solid #000;">
//                     <thead style="background:#d9d9d9; font-weight:bold;">
//                         <tr>
//                             <th style="border:1px solid #000; padding:2px; width:2%; text-align:center;">Sr No.</th>
//                             <th style="border:1px solid #000; padding:2px; width:4%; text-align:center;">HS Code</th>
//                             <th style="border:1px solid #000; padding:2px; width:13%; text-align:left;">Product Description</th>
//                             ${shouldShowHeader("SRO Schedule No.", activeRows) ? `<th style="border:1px solid #000; padding:2px; width:5%; text-align:center;">SRO Schedule No.</th>` : ""}
//                             ${shouldShowHeader("SRO Item Sr No.", activeRows) ? `<th style="border:1px solid #000; padding:2px; width:5%; text-align:center;">SRO Item Sr No.</th>` : ""}
//                             <th style="border:1px solid #000; padding:2px; width:6%; text-align:center;">FBR Unit</th>
//                             ${shouldShowHeader("Internal UoM", activeRows) ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">Internal UOM</th>` : ""}
//                             <th style="border:1px solid #000; padding:2px; width:5%; text-align:center;">FBR Price</th>
//                             ${shouldShowHeader("Internal Single Unit", activeRows) ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">Int. Price</th>` : ""}
//                             <th style="border:1px solid #000; padding:2px; width:5%; text-align:center;">FBR Qty</th>
//                             ${shouldShowHeader("Internal Qty", activeRows) ? `<th style="border:1px solid #000; padding:2px; width:4%; text-align:center;">Int. Qty</th>` : ""}
//                             <th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">Discount</th>
//                             <th style="border:1px solid #000; padding:2px; width:8%; text-align:center;">Excl. Tax</th>
//                             ${shouldShowHeader("Fixed Notified Value or Retail Price", activeRows) ? `<th style="border:1px solid #000; padding:2px; width:5%; text-align:center;">Retail Price</th>` : ""}
//                             <th style="border:1px solid #000; padding:2px; width:6%; text-align:center;">Sales Tax</th>
//                             ${shouldShowHeader("Extra Tax", activeRows) ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">Extra Tax</th>` : ""}
//                             ${shouldShowHeader("Further Tax", activeRows) ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">Further Tax</th>` : ""}
//                             ${shouldShowHeader("Federal Excise Duty", activeRows) ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">FED</th>` : ""}
//                             ${shouldShowHeader("Sales Tax With-Held at SOURCE", activeRows) ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">STWH</th>` : ""}
//                             <th style="border:1px solid #000; padding:2px; width:10%; text-align:right;">Total Incl. Tax</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         ${tableRows}
//                         <tr style="font-weight:bold; background:#f2f2f2;">
//                             <td colspan="${visibleColsBeforeQty}" style="border:1px solid #000; padding:6px; text-align:right;">Total Values</td>
//                             <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalQty)}</td>
//                             ${shouldShowHeader("Internal Qty", activeRows) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalInternalQty)}</td>` : ""}
//                             <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalDisc)}</td>
//                             <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalExclTax)}</td>
//                             ${shouldShowHeader("Fixed Notified Value or Retail Price", activeRows) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalFixednotifiedretailPrice)}</td>` : ""}
//                             <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalSaleTaxApplicable)}</td>

//                             ${shouldShowHeader("Extra Tax", activeRows) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalExtraTax)}</td>` : ""}
//                              ${shouldShowHeader("Further Tax", activeRows) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalFurthurTax)}</td>` : ""}
//                             ${shouldShowHeader("Federal Excise Duty", activeRows) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalFedPayable)}</td>` : ""}
//                             ${shouldShowHeader("Sales Tax With-Held at SOURCE", activeRows) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalSalesTaxWithheldAtSource)}</td>` : ""}
//                             <td style="border:1px solid #000; padding:2px; text-align:right;">${formatNumber(totalInclTax)}</td>
//                         </tr>
//                     </tbody>
//                 </table>

//                 ${
//                   fbrInvoiceNo
//                     ? `
//                 <div style="display:flex; align-items:center; justify-content:space-between; font-size:11px; margin-top:10px; width:100%; page-break-inside: avoid;">
//                     <div><strong>FBR INVOICE #:</strong> ${fbrInvoiceNo}</div>
//                     <div style="display:flex; align-items:center; gap:6px;">
//                         <img id="fbr-qr" src="${qrCodeUrl}" width="80" height="80" alt="QR" />
//                         <img id="fbr-logo" src="${fbrLogoUrl}" width="80" height="80" alt="Logo" />
//                     </div>
//                 </div>
//                 `
//                     : '<p style="text-align:center; font-style:italic;">Note: This Invoice is not verified from FBR</p>'
//                 }
//             </div>
//         </td></tr>
//     </tbody>
//     <tfoot>
//         <tr><td><div class="footer-spacer">&nbsp;</div></td></tr>
//     </tfoot>
// </table>
// `;
//     let printDiv = document.getElementById("print-invoice-container");
//     if (!printDiv) {
//       printDiv = document.createElement("div");
//       printDiv.id = "print-invoice-container";
//       printDiv.style.position = "absolute";
//       printDiv.style.left = "-9999px";
//       document.body.appendChild(printDiv);
//     }

//     printDiv.innerHTML = printContent;
//     const qrImg = printDiv.querySelector("#fbr-qr");

//     if (qrImg) {
//       await new Promise((resolve) => {
//         if (qrImg.complete) return resolve();
//         qrImg.onload = resolve;
//         qrImg.onerror = resolve;
//       });
//     }

//     printDiv.offsetHeight;

//     window.print();

//     setTimeout(() => {
//       printDiv.innerHTML = "";
//     }, 3000);
//   } catch (err) {
//     console.warn("Print failed:", err);
//     alert("Failed to generate print view.\nUse Ctrl+P to print manually.");
//   }
// };

// export const handleBatchPrintInvoices = async (
//   targetInvoices,
//   customers,
//   scenarioCodes,
//   invoices,
//   formatDateForInput,
//   formatNumber,
//   shouldShow,
//   shouldShowHeader,
// ) => {
//   try {
//     // --- 1. GLOBAL VARIABLES (Apply to all invoices) ---
//     const sellerName = sessionStorage.getItem("sellerBusinessName") || "";
//     const sellerAddress = sessionStorage.getItem("sellerAddress") || "";
//     const sellerNTN = sessionStorage.getItem("sellerNTNCNIC") || "";
//     const sellerInvoiceNTN = sessionStorage.getItem("sellerInvoiceNTN");
//     const currency = "PKR";
//     const isProd =
//       document.cookie
//         .split("; ")
//         .find((row) => row.startsWith("isProd="))
//         ?.split("=")[1] === "1";
//     const invoiceMetaLabel = isProd ? "Transaction Type" : "Scenario";
//     const footerEnvText =
//       process.env.NEXT_PUBLIC_INVOICE_FOOTER || "No Text from ENV.";

//     function imageToBase64(url) {
//       return new Promise((resolve, reject) => {
//         const img = new Image();
//         img.crossOrigin = "anonymous";
//         img.onload = function () {
//           const canvas = document.createElement("canvas");
//           canvas.width = img.width;
//           canvas.height = img.height;
//           const ctx = canvas.getContext("2d");
//           ctx.drawImage(img, 0, 0);
//           resolve(canvas.toDataURL("image/jpeg"));
//         };
//         img.onerror = reject;
//         img.src = url;
//       });
//     }
//     const fbrLogoUrl = await imageToBase64("/images/fbr_logo.png");
//     const savedOrientation =
//       localStorage.getItem("userPrintOrientation") || "landscape";

//     let headerHeight = 0;
//     if (sellerName) headerHeight += 25;
//     if (sellerAddress) headerHeight += 20;
//     if (sellerInvoiceNTN) headerHeight += 20;
//     headerHeight += 50;

//     let allInvoicesHtml = "";

//     // --- 2. LOOP THROUGH EACH INVOICE ---
//     for (let i = 0; i < targetInvoices.length; i++) {
//       const targetInvoice = targetInvoices[i];

//       // Mock form object so `shouldShow` evaluates correctly for batch items
//       const mockForm = {
//         challanNo: targetInvoice.challanNo || "",
//         challanDate:
//           formatDateForInput(
//             targetInvoice.challanDate || targetInvoice.challan_date,
//           ) || "",
//         invoicePostDate:
//           formatDateForInput(targetInvoice.invoice_posted_date) || "",
//       };

//       const invoiceNo = targetInvoice.invoice_no || "";
//       const invoiceDate = formatDateForInput(targetInvoice.invoice_date) || "";
//       const challanNoLabel = targetInvoice.challanNoLabel || "Challan No";
//       const challanDateLabel = targetInvoice.challanDateLabel || "Challan Date";
//       // const customerName = (targetInvoice.customer_name || "").split(" - ")[0];
//       console.log("target invoice customer ", targetInvoice.customer_name);
//       const customerName = targetInvoice.customer_name || "";

//       const activeCustomerId = targetInvoice.customer_id;
//       const customer = customers.find((c) => c.id === activeCustomerId);
//       const customerAddress = customer?.address || "";
//       const customerProvince = targetInvoice.buyerProvince || "";
//       const idLabel = customer?.ntn?.length === 7 ? "NTN" : "CNIC";
//       const idValue = customer?.ntn || "";

//       const activeRows =
//         typeof targetInvoice.items === "string"
//           ? JSON.parse(targetInvoice.items)
//           : targetInvoice.items || [];
//       const activeScenarioCode = targetInvoice.scenario_code || "";
//       const scenarioCodeDescription =
//         scenarioCodes.find((sc) => sc.code === activeScenarioCode)
//           ?.description || "";
//       const invoiceMetaValue = isProd
//         ? activeRows[0]?.TransactionType || "-"
//         : `${activeScenarioCode || "-"} - ${scenarioCodeDescription}`;

//       let visibleColsBeforeQty = 3;
//       if (shouldShowHeader("SRO Schedule No.", activeRows))
//         visibleColsBeforeQty++;
//       if (shouldShowHeader("SRO Item Sr No.", activeRows))
//         visibleColsBeforeQty++;
//       visibleColsBeforeQty++;
//       if (shouldShowHeader("Internal UoM", activeRows)) visibleColsBeforeQty++;
//       visibleColsBeforeQty++;
//       if (shouldShowHeader("Internal Single Unit", activeRows))
//         visibleColsBeforeQty++;

//       const tableRows = activeRows
//         .map((r, index) => {
//           const isThirdSchedule =
//             activeScenarioCode === "SN008" || activeScenarioCode === "SN027";
//           const taxRateDisplay = isThirdSchedule
//             ? `${r.rateDesc} on Retail:<br>${formatNumber(r.fixedNotifiedValueOrRetailPrice || 0)}`
//             : `(${r.rateDesc})`;

//           return `
//                 <tr>
//                     <td style="border:1px solid #000; padding:2px; text-align:center;">${index + 1}</td>
//                     <td style="border:1px solid #000; padding:2px; text-align:center;">${r.hsCode}</td>
//                     <td style="border:1px solid #000; padding:2px;">${r.description}</td>
//                     ${shouldShow("SRO Schedule No.", r, mockForm) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${r.sroScheduleNo || ""}</td>` : ""}
//                     ${shouldShow("SRO Item Sr No.", r, mockForm) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${r.sroItemSerialNo || ""}</td>` : ""}
//                     <td style="border:1px solid #000; padding:2px; text-align:center;">${r.unit || ""}</td>
//                     ${shouldShow("Internal UoM", r, mockForm) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${r.internalUOM || ""}</td>` : ""}
//                     <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.singleUnitPrice || 0)}</td>
//                     ${shouldShow("Internal Single Unit", r, mockForm) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.internalSinglePrice || 0)}</td>` : ""}
//                     <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.qty || 0)}</td>
//                     ${shouldShow("Internal Qty", r, mockForm) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.internalQty || 0)}</td>` : ""}
//                     <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.discount || 0)}</td>
//                     <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.valueSalesExcludingST || 0)}</td>
//                     ${shouldShow("Fixed Notified Value or Retail Price", r, mockForm) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.fixedNotifiedValueOrRetailPrice || 0)}</td>` : ""}
//                     <td style="border:1px solid #000; padding:2px; text-align:center; font-size:9px;">
//                         ${taxRateDisplay}<br><strong>${formatNumber(r.salesTaxApplicable || 0)}</strong>
//                     </td>
//                     ${shouldShow("Extra Tax", r, mockForm) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.extraTax || 0)}</td>` : ""}
//                     ${shouldShow("Further Tax", r, mockForm) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.furtherTax || 0)}</td>` : ""}
//                     ${shouldShow("Federal Excise Duty", r, mockForm) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.fedPayable || 0)}</td>` : ""}
//                     ${shouldShow("Sales Tax With-Held at SOURCE", r, mockForm) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.salesTaxWithheldAtSource || 0)}</td>` : ""}
//                     <td style="border:1px solid #000; padding:2px; text-align:right;"><strong>${formatNumber(r.totalValues || r.valueInclTax || 0)}</strong></td>
//                 </tr>`;
//         })
//         .join("");

//       const totalDisc = activeRows.reduce(
//         (sum, r) => sum + Number(r.discount || 0),
//         0,
//       );
//       const totalQty = activeRows.reduce(
//         (sum, r) => sum + Number(r.qty || 0),
//         0,
//       );
//       const totalFixednotifiedretailPrice = activeRows.reduce(
//         (sum, r) => sum + Number(r.fixedNotifiedValueOrRetailPrice || 0),
//         0,
//       );
//       const totalFedPayable = activeRows.reduce(
//         (sum, r) => sum + Number(r.fedPayable || 0),
//         0,
//       );
//       const totalFurthurTax = activeRows.reduce(
//         (sum, r) => sum + Number(r.furtherTax || 0),
//         0,
//       );
//       const totalExtraTax = activeRows.reduce(
//         (sum, r) => sum + Number(r.extraTax || 0),
//         0,
//       );
//       const totalSalesTaxWithheldAtSource = activeRows.reduce(
//         (sum, r) => sum + Number(r.salesTaxWithheldAtSource || 0),
//         0,
//       );
//       const totalExclTax = activeRows.reduce(
//         (sum, r) => sum + Number(r.valueSalesExcludingST || 0),
//         0,
//       );
//       const totalSaleTaxApplicable = activeRows.reduce(
//         (sum, r) => sum + Number(r.salesTaxApplicable || 0),
//         0,
//       );
//       const totalTax =
//         totalSaleTaxApplicable +
//         totalSalesTaxWithheldAtSource +
//         totalExtraTax +
//         totalFurthurTax +
//         totalFedPayable;
//       const totalInclTax = totalExclTax + totalTax;
//       const totalInternalQty = activeRows.reduce(
//         (sum, r) => sum + Number(r.internalQty || 0),
//         0,
//       );

//       const fbrInvoiceNo = targetInvoice.fbr_invoice_no || "";
//       let qrCodeUrl = "";
//       if (fbrInvoiceNo) {
//         qrCodeUrl = await QRCode.toDataURL(fbrInvoiceNo, {
//           width: 200,
//           margin: 1,
//         });
//       }

//       // ADD PAGE BREAK BEFORE EVERY INVOICE EXCEPT THE VERY FIRST ONE
//       const pageBreak = i > 0 ? "page-break-before: always;" : "";

//       // Generate HTML structure for THIS specific invoice
//       allInvoicesHtml += `
//             <div style="${pageBreak}">
//                 <table class="master-table">
//                     <thead>
//                         <tr><td><div class="header-spacer">&nbsp;</div></td></tr>
//                     </thead>
//                     <tbody>
//                         <tr><td>
//                             <div style="font-family: Arial, sans-serif; font-size: 11px; padding: 0 10px;">
//                                 <table style="width:100%; border-collapse:collapse; font-size:11px; margin-bottom:12px;">
//                                     <tr>
//                                         <td style="width:55%; vertical-align:top; border:1px solid #000; padding:6px;">
//                                             <strong>Billing To:</strong><br>
//                                             ${customerName}<br>
//                                             Address: ${customerAddress || "Address not provided"}<br>
//                                             Province: ${customerProvince}<br>
//                                             ${idLabel}: ${idValue}
//                                         </td>
//                                         <td style="width:45%; vertical-align:top; border:1px solid #000; padding:6px;">
//                                             <table style="width:100%; border-collapse:collapse;">
//                                                 <tr><td style="width:40%;"><strong>Invoice Number</strong></td><td>${invoiceNo}</td></tr>
//                                                 <tr><td><strong>Date</strong></td><td>${invoiceDate}</td></tr>
//                                                 <tr><td><strong>Buyer Type</strong></td><td>${targetInvoice.buyerType || ""}</td></tr>
//                                                 <tr><td><strong>Currency</strong></td><td>${currency || "PKR"}</td></tr>
//                                                 <tr><td><strong>${invoiceMetaLabel}</strong></td><td>${invoiceMetaValue}</td></tr>
//                                                 ${shouldShow("Challan No", null, mockForm) ? `<tr><td><strong>${challanNoLabel}</strong></td><td>${mockForm.challanNo}</td></tr>` : ""}
//                                                 ${shouldShow("Challan Date", null, mockForm) ? `<tr><td><strong>${challanDateLabel}</strong></td><td>${mockForm.challanDate}</td></tr>` : ""}
//                                                 ${shouldShow("Invoice Print Date", null, mockForm) ? `<tr><td><strong>Invoice Post Date</strong></td><td>${mockForm.invoicePostDate}</td></tr>` : ""}
//                                             </table>
//                                         </td>
//                                     </tr>
//                                 </table>

//                                 <table style="width:100%; border-collapse:collapse; font-size:10px; margin-bottom:12px; border:1px solid #000;">
//                                     <thead style="background:#d9d9d9; font-weight:bold;">
//                                         <tr>
//                                             <th style="border:1px solid #000; padding:2px; width:2%; text-align:center;">Sr No.</th>
//                                             <th style="border:1px solid #000; padding:2px; width:4%; text-align:center;">HS Code</th>
//                                             <th style="border:1px solid #000; padding:2px; width:13%; text-align:left;">Product Description</th>
//                                             ${shouldShowHeader("SRO Schedule No.", activeRows) ? `<th style="border:1px solid #000; padding:2px; width:5%; text-align:center;">SRO Schedule No.</th>` : ""}
//                                             ${shouldShowHeader("SRO Item Sr No.", activeRows) ? `<th style="border:1px solid #000; padding:2px; width:5%; text-align:center;">SRO Item Sr No.</th>` : ""}
//                                             <th style="border:1px solid #000; padding:2px; width:6%; text-align:center;">FBR Unit</th>
//                                             ${shouldShowHeader("Internal UoM", activeRows) ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">Internal UOM</th>` : ""}
//                                             <th style="border:1px solid #000; padding:2px; width:5%; text-align:center;">FBR Price</th>
//                                             ${shouldShowHeader("Internal Single Unit", activeRows) ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">Int. Price</th>` : ""}
//                                             <th style="border:1px solid #000; padding:2px; width:5%; text-align:center;">FBR Qty</th>
//                                             ${shouldShowHeader("Internal Qty", activeRows) ? `<th style="border:1px solid #000; padding:2px; width:4%; text-align:center;">Int. Qty</th>` : ""}
//                                             <th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">Discount</th>
//                                             <th style="border:1px solid #000; padding:2px; width:8%; text-align:center;">Excl. Tax</th>
//                                             ${shouldShowHeader("Fixed Notified Value or Retail Price", activeRows) ? `<th style="border:1px solid #000; padding:2px; width:5%; text-align:center;">Retail Price</th>` : ""}
//                                             <th style="border:1px solid #000; padding:2px; width:6%; text-align:center;">Sales Tax</th>
//                                             ${shouldShowHeader("Extra Tax", activeRows) ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">Extra Tax</th>` : ""}
//                                             ${shouldShowHeader("Further Tax", activeRows) ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">Further Tax</th>` : ""}
//                                             ${shouldShowHeader("Federal Excise Duty", activeRows) ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">FED</th>` : ""}
//                                             ${shouldShowHeader("Sales Tax With-Held at SOURCE", activeRows) ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">STWH</th>` : ""}
//                                             <th style="border:1px solid #000; padding:2px; width:10%; text-align:right;">Total Incl. Tax</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         ${tableRows}
//                                         <tr style="font-weight:bold; background:#f2f2f2;">
//                                             <td colspan="${visibleColsBeforeQty}" style="border:1px solid #000; padding:6px; text-align:right;">Total Values</td>
//                                             <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalQty)}</td>
//                                             ${shouldShowHeader("Internal Qty", activeRows) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalInternalQty)}</td>` : ""}
//                                             <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalDisc)}</td>
//                                             <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalExclTax)}</td>
//                                             ${shouldShowHeader("Fixed Notified Value or Retail Price", activeRows) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalFixednotifiedretailPrice)}</td>` : ""}
//                                             <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalSaleTaxApplicable)}</td>
//                                             ${shouldShowHeader("Extra Tax", activeRows) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalExtraTax)}</td>` : ""}
//                                             ${shouldShowHeader("Further Tax", activeRows) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalFurthurTax)}</td>` : ""}
//                                             ${shouldShowHeader("Federal Excise Duty", activeRows) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalFedPayable)}</td>` : ""}
//                                             ${shouldShowHeader("Sales Tax With-Held at SOURCE", activeRows) ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalSalesTaxWithheldAtSource)}</td>` : ""}
//                                             <td style="border:1px solid #000; padding:2px; text-align:right;">${formatNumber(totalInclTax)}</td>
//                                         </tr>
//                                     </tbody>
//                                 </table>

//                                 ${
//                                   fbrInvoiceNo
//                                     ? `
//                                 <div style="display:flex; align-items:center; justify-content:space-between; font-size:11px; margin-top:10px; width:100%; page-break-inside: avoid;">
//                                     <div><strong>FBR INVOICE #:</strong> ${fbrInvoiceNo}</div>
//                                     <div style="display:flex; align-items:center; gap:6px;">
//                                         <img class="fbr-img-wait" src="${qrCodeUrl}" width="80" height="80" alt="QR" />
//                                         <img class="fbr-img-wait" src="${fbrLogoUrl}" width="80" height="80" alt="Logo" />
//                                     </div>
//                                 </div>
//                                 `
//                                     : '<p style="text-align:center; font-style:italic;">Note: This Invoice is not verified from FBR</p>'
//                                 }
//                             </div>
//                         </td></tr>
//                     </tbody>
//                     <tfoot>
//                         <tr><td><div class="footer-spacer">&nbsp;</div></td></tr>
//                     </tfoot>
//                 </table>
//             </div>`;
//     } // End of Invoice Loop

//     // --- 3. COMBINE EVERYTHING AND PRINT ---
//     const finalPrintContent = `
//         <style>
//             @media print {
//                 @page { size: A4 ${savedOrientation} !important; margin: 10mm; }
//                 html, body { margin: 0; padding: 0; }
//                 .master-table { width: 100%; border-collapse: collapse; }
//                 .header-spacer { height: ${headerHeight}px; }
//                 .footer-spacer { height: 50px; }
//                 .header-fixed {
//                     position: fixed; top: 0; left: 0; width: 100%; height: ${headerHeight - 5}px;
//                     background: white; z-index: 2000;
//                 }
//                 .footer-fixed {
//                     position: fixed; bottom: 0; left: 0; width: 100%; height: 45px;
//                     background: white; display: flex !important; justify-content: space-between;
//                     align-items: center; z-index: 2000; font-size: 12px;
//                 }
//                 .page-counter-display::after { font-weight: bold; }
//                 tr { page-break-inside: avoid !important; }
//                 thead { display: table-header-group !important; }
//             }
//             @media screen { .header-fixed, .footer-fixed { display: none; } }
//         </style>

//        <div class="header-fixed">
//     <div style="text-align:center; font-weight:bold; font-size:16px; margin-top:5px;">
//          ${shouldShow("Seller Name") ? `${sellerName.toUpperCase()}` : ""}
//     </div>
//     <div style="text-align:center; font-size:11px;">
//           ${shouldShow("Seller Address") ? `${sellerAddress.toUpperCase()}` : ""}
//     </div>
//     <div style="text-align:center; font-size:11px; margin-bottom:12px;">
//         ${shouldShow("Seller NTN") ? `NTN No. ${sellerInvoiceNTN}` : ""}
//     </div>
//     <div style="text-align:center; font-weight:bold; font-size:14px; padding: 6px 0; margin: 0 10px; position: relative;">
//         SALES TAX INVOICE
//         <span class="page-counter-display" style="position: absolute; right: 10px; font-size: 10px;"></span>
//     </div>
// </div>

//         <div class="footer-fixed">
//             <span style="padding-left:15px; font-style: italic;">${footerEnvText}</span>
//             <span class="page-counter-display" style="padding-right:15px; font-weight:bold;"></span>
//         </div>

//         ${allInvoicesHtml}
//         `;

//     let printDiv = document.getElementById("print-invoice-container");
//     if (!printDiv) {
//       printDiv = document.createElement("div");
//       printDiv.id = "print-invoice-container";
//       printDiv.style.position = "absolute";
//       printDiv.style.left = "-9999px";
//       document.body.appendChild(printDiv);
//     }

//     printDiv.innerHTML = finalPrintContent;

//     // Wait for all QR codes and Logos to load before firing print
//     const images = printDiv.querySelectorAll(".fbr-img-wait");
//     const imagePromises = Array.from(images).map((img) => {
//       return new Promise((resolve) => {
//         if (img.complete) return resolve();
//         img.onload = resolve;
//         img.onerror = resolve;
//       });
//     });

//     await Promise.all(imagePromises);

//     // Force browser to recalculate styles
//     printDiv.offsetHeight;

//     window.print();

//     // Cleanup
//     setTimeout(() => {
//       printDiv.innerHTML = "";
//     }, 3000);
//   } catch (err) {
//     console.warn("Batch Print failed:", err);
//     alert(
//       "Failed to generate batch print view.\nUse Ctrl+P to print manually.",
//     );
//   }
// };

// src/app/utils/printInvoice.js
import QRCode from "qrcode";

export const handlePrintInvoice = async (
  targetInvoice,
  invoiceForm,
  customers,
  rows,
  scenarioCodes,
  invoices,
  formatDateForInput,
  formatNumber,
  shouldShow,
  shouldShowHeader,
  fields,
) => {
  try {
    const sellerName = sessionStorage.getItem("sellerBusinessName") || "";
    console.log("Seller Name from sessionStorage:", sellerName);
    const sellerAddress = sessionStorage.getItem("sellerAddress") || "";
    console.log("Seller Address from sessionStorage:", sellerAddress);
    const sellerNTN = sessionStorage.getItem("sellerNTNCNIC") || "";
    const sellerInvoiceNTN = sessionStorage.getItem("sellerInvoiceNTN");
    console.log(
      "Seller sellerInvoiceNTN from sessionStorage:",
      sellerInvoiceNTN,
    );

    console.log("target invoice id", targetInvoice);
    console.log("form invoice id", invoiceForm);
    console.log("customer ", customers);

    const invoiceNo = invoiceForm.invoiceNo || targetInvoice.invoice_no || "";
    const invoiceDate =
      formatDateForInput(invoiceForm.date || targetInvoice.invoice_date) || "";
    const challanNo = invoiceForm.challanNo || targetInvoice.challanNo || "";
    const challanNoLabel =
      fields.find((f) => f.name === "Challan No")?.user_defined_display_name ||
      "Challan No.";
    const challanDateLabel =
      fields.find((f) => f.name === "Challan Date")
        ?.user_defined_display_name || "Challan Date";
    const tax236HLabel =
      fields.find((f) => f.name === "236H Tax")?.user_defined_display_name ||
      "236H Tax";
    const grandTotalLabel =
      fields.find((f) => f.name === "Grand Total")?.user_defined_display_name ||
      "Grand Total";
    const challanDate =
      formatDateForInput(
        invoiceForm.challan_date || targetInvoice.challan_date,
      ) || "";
    const invoicePostDate =
      formatDateForInput(
        invoiceForm.invoice_posted_date || targetInvoice.invoice_posted_date,
      ) || "";

    const customerName =
      invoiceForm.customer.split(" - ")[0] || targetInvoice.customer_name || "";
    const isEvent = targetInvoice && targetInvoice.nativeEvent;

    const activeCustomerId =
      targetInvoice && !isEvent
        ? targetInvoice.customer_id
        : invoiceForm.customerId || invoiceForm.customer_id;

    const customerAddress =
      customers.find((c) => c.id === activeCustomerId)?.locations?.[0]
        ?.address || "";
    const customerProvince =
      invoiceForm.buyerProvince || targetInvoice.buyerProvince || "";
    const customer = customers.find((c) => c.id === activeCustomerId);

    const idLabel = customer?.ntn ? "NTN" : "CNIC";
    const idValue = customer?.ntn || customer?.cnic || "";

    const currency = "PKR";
    const isProd =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("isProd="))
        ?.split("=")[1] === "1";
    const invoiceMetaLabel = isProd ? "Transaction Type" : "Scenario";

    let activeRows = [];
    if (targetInvoice && targetInvoice.items) {
      activeRows =
        typeof targetInvoice.items === "string"
          ? JSON.parse(targetInvoice.items)
          : targetInvoice.items;
    } else {
      activeRows = rows;
    }
    const activeScenarioCode =
      targetInvoice.scenario_code || invoiceForm.scenarioCode || "";
    console.log("Active Scenario Code:", activeScenarioCode);
    console.log("Scenario Codes List:", scenarioCodes);

    const tax236HRateDisplay = `(${targetInvoice.tax236H || invoiceForm.tax236H || 0}%)`;

    const hasTax236H = shouldShowHeader("236H Tax", activeRows);
    const hasGrandTotal = shouldShowHeader("Grand Total", activeRows);

    const scenarioCodeDescription =
      scenarioCodes.find((sc) => sc.code === activeScenarioCode)?.description ||
      "";

    const invoiceMetaValue = isProd
      ? activeRows[0]?.TransactionType || "-"
      : `${activeScenarioCode || "-"} - ${scenarioCodeDescription}`;

    const footerEnvText =
      process.env.NEXT_PUBLIC_INVOICE_FOOTER || "No Text from ENV.";

    // 1. Determine column visibility based on entire active set
    const hasSroSchedule = shouldShowHeader("SRO Schedule No.", activeRows);
    const hasSroItem = shouldShowHeader("SRO Item Sr No.", activeRows);
    const hasInternalUom = shouldShowHeader("Internal UoM", activeRows);
    const hasInternalSingleUnit = shouldShowHeader(
      "Internal Single Unit",
      activeRows,
    );
    const hasInternalQty = shouldShowHeader("Internal Qty", activeRows);
    const hasRetailPrice = shouldShowHeader(
      "Fixed Notified Value or Retail Price",
      activeRows,
    );
    const hasExtraTax = shouldShowHeader("Extra Tax", activeRows);
    const hasFurtherTax = shouldShowHeader("Further Tax", activeRows);
    const hasFed = shouldShowHeader("Federal Excise Duty", activeRows);
    const hasStwh = shouldShowHeader(
      "Sales Tax With-Held at SOURCE",
      activeRows,
    );

    const tableRows = activeRows
      .map((r, index) => {
        const isThirdSchedule =
          activeScenarioCode === "SN008" || activeScenarioCode === "SN027";
        const taxRateDisplay = isThirdSchedule
          ? `${r.rateDesc} on Retail:<br>${formatNumber(r.fixedNotifiedValueOrRetailPrice || 0)}`
          : `(${r.rateDesc})`;

        return `
    <tr>
        <td style="border:1px solid #000; padding:2px; text-align:center;">${index + 1}</td>
        <td style="border:1px solid #000; padding:2px; text-align:center;">${r.hsCode}</td>
        <td style="border:1px solid #000; padding:2px;">${r.description}</td>
        
        ${hasSroSchedule ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${r.sroScheduleNo || ""}</td>` : ""}
        ${hasSroItem ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${r.sroItemSerialNo || ""}</td>` : ""}
        
        <td style="border:1px solid #000; padding:2px; text-align:center;">${r.unit || ""}</td>
        
        ${hasInternalUom ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${r.internalUOM || ""}</td>` : ""}
        <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.singleUnitPrice || 0)}</td>
        ${hasInternalSingleUnit ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${r.internalSinglePrice ? formatNumber(r.internalSinglePrice) : ""}</td>` : ""}
        
        <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.qty || 0)}</td>
        
        ${hasInternalQty ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${r.internalQty ? formatNumber(r.internalQty) : ""}</td>` : ""}
        <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.discount || 0)}</td>
        <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.valueSalesExcludingST || 0)}</td>
        
        ${hasRetailPrice ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${r.fixedNotifiedValueOrRetailPrice ? formatNumber(r.fixedNotifiedValueOrRetailPrice) : ""}</td>` : ""}
        
        <td style="border:1px solid #000; padding:2px; text-align:center; font-size:9px;">
            ${taxRateDisplay}<br><strong>${formatNumber(r.salesTaxApplicable || 0, 2)}</strong>
        </td>
        
        ${hasExtraTax ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${r.extraTax ? formatNumber(r.extraTax) : ""}</td>` : ""}
        ${hasFurtherTax ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${r.furtherTax ? formatNumber(r.furtherTax) : ""}</td>` : ""}
        ${hasFed ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${r.fedPayable ? formatNumber(r.fedPayable) : ""}</td>` : ""}
        ${hasStwh ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${r.salesTaxWithheldAtSource ? formatNumber(r.salesTaxWithheldAtSource) : ""}</td>` : ""}
        <td style="border:1px solid #000; padding:2px; text-align:right;"><strong>${formatNumber(r.totalValues || r.valueInclTax || 0, 2)}</strong></td>
         <td style="border:1px solid #000; padding:2px; text-align:center; font-size:9px;">
            ${tax236HRateDisplay}<br><strong>${formatNumber((r.valueSalesExcludingST * targetInvoice.tax236H) / 100 || 0, 2)}</strong>
        </td>
        ${
          hasGrandTotal
            ? `<td style="border:1px solid #000; padding:2px; text-align:center;">
      ${formatNumber(
        Number(r.totalValues || r.valueInclTax || 0) +
          (Number(targetInvoice.tax236H || 0) *
            Number(r.valueSalesExcludingST || 0)) /
            100,
        2,
      )}
     </td>`
            : ""
        }
    </tr>`;
      })
      .join("");

    const totalDisc = activeRows.reduce(
      (sum, r) => sum + Number(r.discount || 0),
      0,
    );
    const totalQty = activeRows.reduce((sum, r) => sum + Number(r.qty || 0), 0);
    const totalFixednotifiedretailPrice = activeRows.reduce(
      (sum, r) => sum + Number(r.fixedNotifiedValueOrRetailPrice || 0),
      0,
    );
    const totalFedPayable = activeRows.reduce(
      (sum, r) => sum + Number(r.fedPayable || 0),
      0,
    );
    const totalFurthurTax = activeRows.reduce(
      (sum, r) => sum + Number(r.furtherTax || 0),
      0,
    );
    const totalExtraTax = activeRows.reduce(
      (sum, r) => sum + Number(r.extraTax || 0),
      0,
    );
    const totalSalesTaxWithheldAtSource = activeRows.reduce(
      (sum, r) => sum + Number(r.salesTaxWithheldAtSource || 0),
      0,
    );
    const totalExclTax = activeRows.reduce(
      (sum, r) => sum + Number(r.valueSalesExcludingST || 0),
      0,
    );
    const totalSaleTaxApplicable = activeRows.reduce(
      (sum, r) => sum + Number(r.salesTaxApplicable || 0),
      0,
    );
    const totalTax =
      activeRows.reduce(
        (sum, r) => sum + Number(r.salesTaxApplicable || 0),
        0,
      ) +
      activeRows.reduce(
        (sum, r) => sum + Number(r.salesTaxWithheldAtSource || 0),
        0,
      ) +
      activeRows.reduce((sum, r) => sum + Number(r.extraTax || 0), 0) +
      activeRows.reduce((sum, r) => sum + Number(r.furtherTax || 0), 0) +
      activeRows.reduce((sum, r) => sum + Number(r.fedPayable || 0), 0);

    const totalInclTax = totalExclTax + totalTax;
    const totalTax236H = activeRows.reduce(
      (sum, r) =>
        sum +
        (Number(targetInvoice.tax236H || 0) *
          Number(r.valueSalesExcludingST || 0)) /
          100,
      0,
    );
    const totalGrandTotal = totalInclTax + totalTax236H;

    const totalInternalQty = activeRows.reduce(
      (sum, r) => sum + Number(r.internalQty || 0),
      0,
    );

    const fbrInvoiceNo =
      targetInvoice && !isEvent
        ? targetInvoice.fbr_invoice_no
        : invoices.find((inv) => inv.invoice_no === invoiceForm.invoiceNo)
            ?.fbr_invoice_no || "";

    let qrCodeUrl = "";

    if (fbrInvoiceNo) {
      qrCodeUrl = await QRCode.toDataURL(fbrInvoiceNo, {
        width: 200,
        margin: 1,
      });
    }
    function imageToBase64(url) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = function () {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);

          resolve(canvas.toDataURL("image/jpeg"));
        };
        img.onerror = reject;
        img.src = url;
      });
    }
    const fbrLogoUrl = await imageToBase64("/images/fbr_logo.png");

    let visibleColsBeforeQty = 3;
    if (hasSroSchedule) visibleColsBeforeQty++;
    if (hasSroItem) visibleColsBeforeQty++;
    visibleColsBeforeQty++;
    if (hasInternalUom) visibleColsBeforeQty++;
    visibleColsBeforeQty++;
    if (hasInternalSingleUnit) visibleColsBeforeQty++;

    const savedOrientation =
      localStorage.getItem("userPrintOrientation") || "landscape";
    let headerHeight = 0;

    if (shouldShow("Seller Name")) headerHeight += 25;
    if (shouldShow("Seller Address")) headerHeight += 20;
    if (shouldShow("Seller NTN")) headerHeight += 20;
    headerHeight += 40;
    headerHeight += 10;

    const printContent = `
<style>
    @media print {
        @page {
           size: A4 ${savedOrientation} !important;
            margin: 10mm;
        }
        html, body {
            margin: 0;
            padding: 0;
        }
       
        .master-table {
            width: 100%;
            border-collapse: collapse;
        }
       .header-spacer { height: ${headerHeight}px; }

        .footer-spacer { height: 50px; }

        .header-fixed {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: ${headerHeight - 5}px;
            background: white;
            z-index: 2000;
        }
        .footer-fixed {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 45px;
            background: white;      
            display: flex !important;
            justify-content: space-between;
            align-items: center;
            z-index: 2000;
            font-size: 12px
        }
        .page-counter-display::after {
            font-weight: bold;
        }
        tr { page-break-inside: avoid !important; }
        thead { display: table-header-group !important; }
    }
    @media screen {
        .header-fixed, .footer-fixed { display: none; }
    }
</style>

<div class="header-fixed">
    <div style="text-align:center; font-weight:bold; font-size:16px; margin-top:5px;">
         ${shouldShow("Seller Name") ? `${sellerName.toUpperCase()}` : ""}
    </div>
    <div style="text-align:center; font-size:11px;">
          ${shouldShow("Seller Address") ? `${sellerAddress.toUpperCase()}` : ""}
    </div>
    <div style="text-align:center; font-size:11px; margin-bottom:12px;">
        ${shouldShow("Seller NTN") ? `NTN No. ${sellerInvoiceNTN}` : ""}
    </div>
    <div style="text-align:center; font-weight:bold; font-size:14px; padding: 6px 0; margin: 0 10px; position: relative;">
        SALES TAX INVOICE
        <span class="page-counter-display" style="position: absolute; right: 10px; font-size: 10px;"></span>
    </div>
</div>

<div class="footer-fixed">
    <span style="padding-left:15px; font-style: italic;">${footerEnvText}</span>
    <span class="page-counter-display" style="padding-right:15px; font-weight:bold;"></span>
</div>

<table class="master-table">
    <thead>
        <tr><td><div class="header-spacer">&nbsp;</div></td></tr>
    </thead>
    <tbody>
        <tr><td>
            <div style="font-family: Arial, sans-serif; font-size: 11px; padding: 0 10px;">
                
                <table style="width:100%; border-collapse:collapse; font-size:11px; margin-bottom:12px;">
                    <tr>
                        <td style="width:55%; vertical-align:top; border:1px solid #000; padding:6px;">
                            <strong>Billing To:</strong><br>
                            ${customerName}<br>
                            Address: ${customerAddress || "Address not provided"}<br>
                            Province: ${customerProvince}<br>
                            ${idLabel}: ${idValue}
                        </td>
                        <td style="width:45%; vertical-align:top; border:1px solid #000; padding:6px;">
            <table style="width:100%; border-collapse:collapse;">
                <tr><td style="width:40%;"><strong>Invoice Number</strong></td><td>${invoiceNo}</td></tr>
                <tr><td><strong>Date</strong></td><td>${invoiceDate}</td></tr>
                <tr><td><strong>Buyer Type</strong></td><td>${(targetInvoice && !targetInvoice.nativeEvent ? targetInvoice.buyerType : invoiceForm.buyerType) || ""}</td></tr>
                <tr><td><strong>Currency</strong></td><td>${currency || "PKR"}</td></tr>
                <tr><td><strong>${invoiceMetaLabel}</strong></td><td>${invoiceMetaValue}</td></tr>
                
                ${
                  shouldShow("Challan No", invoiceForm)
                    ? `
                    <tr>
                        <td><strong>${challanNoLabel}</strong></td>
                        <td>${challanNo}</td>
                    </tr>`
                    : ""
                }
                
                ${
                  shouldShow("Challan Date", invoiceForm)
                    ? `
                    <tr>
                        <td><strong>${challanDateLabel}</strong></td>
                        <td>${challanDate}</td>
                    </tr>`
                    : ""
                }
                
                ${
                  shouldShow("Invoice Print Date", invoiceForm)
                    ? `
                    <tr>
                        <td><strong>Invoice Post Date</strong></td>
                        <td>${invoicePostDate}</td>
                    </tr>`
                    : ""
                }
            </table>
        </td>
                    </tr>
                </table>

                <table style="width:100%; border-collapse:collapse; font-size:10px; margin-bottom:12px; border:1px solid #000;">
                    <thead style="background:#d9d9d9; font-weight:bold;">
                        <tr>
                            <th style="border:1px solid #000; padding:2px; width:2%; text-align:center;">Sr No.</th>
                            <th style="border:1px solid #000; padding:2px; width:4%; text-align:center;">HS Code</th>
                            <th style="border:1px solid #000; padding:2px; width:13%; text-align:left;">Product Description</th>
                            ${hasSroSchedule ? `<th style="border:1px solid #000; padding:2px; width:5%; text-align:center;">SRO Schedule No.</th>` : ""}
                            ${hasSroItem ? `<th style="border:1px solid #000; padding:2px; width:5%; text-align:center;">SRO Item Sr No.</th>` : ""}
                            <th style="border:1px solid #000; padding:2px; width:6%; text-align:center;">FBR Unit</th>
                            ${hasInternalUom ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">Internal UOM</th>` : ""}
                            <th style="border:1px solid #000; padding:2px; width:5%; text-align:center;">FBR Price</th>
                            ${hasInternalSingleUnit ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">Int. Price</th>` : ""}
                            <th style="border:1px solid #000; padding:2px; width:5%; text-align:center;">FBR Qty</th>
                            ${hasInternalQty ? `<th style="border:1px solid #000; padding:2px; width:4%; text-align:center;">Int. Qty</th>` : ""}
                            <th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">Discount</th>
                            <th style="border:1px solid #000; padding:2px; width:8%; text-align:center;">Excl. Tax</th>
                            ${hasRetailPrice ? `<th style="border:1px solid #000; padding:2px; width:5%; text-align:center;">Retail Price</th>` : ""}
                            <th style="border:1px solid #000; padding:2px; width:6%; text-align:center;">Sales Tax</th>
                            ${hasExtraTax ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">Extra Tax</th>` : ""}
                            ${hasFurtherTax ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">Further Tax</th>` : ""}
                            ${hasFed ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">FED</th>` : ""}
                            ${hasStwh ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">STWH</th>` : ""}   
                            <th style="border:1px solid #000; padding:2px; width:10%; text-align:right;">Total Incl. Tax</th>
                            ${hasTax236H ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">${tax236HLabel}</th>` : ""}
                             ${hasGrandTotal ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">${grandTotalLabel}</th>` : ""}
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                        <tr style="font-weight:bold; background:#f2f2f2;">
                            <td colspan="${visibleColsBeforeQty}" style="border:1px solid #000; padding:6px; text-align:right;">Total Values</td>
                            <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalQty)}</td>
                            ${hasInternalQty ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalInternalQty)}</td>` : ""}
                            <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalDisc)}</td>
                            <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalExclTax)}</td>
                            ${hasRetailPrice ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalFixednotifiedretailPrice)}</td>` : ""}
                            <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalSaleTaxApplicable, 2)}</td>
            
                            ${hasExtraTax ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalExtraTax)}</td>` : ""}
                            ${hasFurtherTax ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalFurthurTax)}</td>` : ""}
                            ${hasFed ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalFedPayable)}</td>` : ""}
                            ${hasStwh ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalSalesTaxWithheldAtSource)}</td>` : ""}
                            <td style="border:1px solid #000; padding:2px; text-align:right;">${formatNumber(totalInclTax, 2)}</td>
                             ${hasTax236H ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">${formatNumber(totalTax236H)}</th>` : ""}
                                            ${hasGrandTotal ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">${formatNumber(totalGrandTotal)}</th>` : ""}
                        </tr>
                    </tbody>
                </table>

                ${
                  fbrInvoiceNo
                    ? `
                <div style="display:flex; align-items:center; justify-content:space-between; font-size:11px; margin-top:10px; width:100%; page-break-inside: avoid;">
                    <div><strong>FBR INVOICE #:</strong> ${fbrInvoiceNo}</div>
                    <div style="display:flex; align-items:center; gap:6px;">
                        <img id="fbr-qr" src="${qrCodeUrl}" width="80" height="80" alt="QR" />
                        <img id="fbr-logo" src="${fbrLogoUrl}" width="80" height="80" alt="Logo" />
                    </div>
                </div>
                `
                    : '<p style="text-align:center; font-style:italic;">Note: This Invoice is not verified from FBR</p>'
                }
            </div>
        </td></tr>
    </tbody>
    <tfoot>
        <tr><td><div class="footer-spacer">&nbsp;</div></td></tr>
    </tfoot>
</table>
`;
    let printDiv = document.getElementById("print-invoice-container");
    if (!printDiv) {
      printDiv = document.createElement("div");
      printDiv.id = "print-invoice-container";
      printDiv.style.position = "absolute";
      printDiv.style.left = "-9999px";
      document.body.appendChild(printDiv);
    }

    printDiv.innerHTML = printContent;
    const qrImg = printDiv.querySelector("#fbr-qr");

    if (qrImg) {
      await new Promise((resolve) => {
        if (qrImg.complete) return resolve();
        qrImg.onload = resolve;
        qrImg.onerror = resolve;
      });
    }

    printDiv.offsetHeight;

    window.print();

    setTimeout(() => {
      printDiv.innerHTML = "";
    }, 3000);
  } catch (err) {
    console.warn("Print failed:", err);
    alert("Failed to generate print view.\nUse Ctrl+P to print manually.");
  }
};

export const handleBatchPrintInvoices = async (
  targetInvoices,
  customers,
  scenarioCodes,
  invoices,
  formatDateForInput,
  formatNumber,
  shouldShow,
  shouldShowHeader,
  fields,
) => {
  try {
    const sellerName = sessionStorage.getItem("sellerBusinessName") || "";
    const sellerAddress = sessionStorage.getItem("sellerAddress") || "";
    const sellerInvoiceNTN = sessionStorage.getItem("sellerInvoiceNTN");
    const currency = "PKR";
    const isProd =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("isProd="))
        ?.split("=")[1] === "1";
    const invoiceMetaLabel = isProd ? "Transaction Type" : "Scenario";
    const footerEnvText =
      process.env.NEXT_PUBLIC_INVOICE_FOOTER || "No Text from ENV.";

    function imageToBase64(url) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = function () {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/jpeg"));
        };
        img.onerror = reject;
        img.src = url;
      });
    }
    const fbrLogoUrl = await imageToBase64("/images/fbr_logo.png");
    const savedOrientation =
      localStorage.getItem("userPrintOrientation") || "landscape";

    let headerHeight = 0;
    if (sellerName) headerHeight += 25;
    if (sellerAddress) headerHeight += 20;
    if (sellerInvoiceNTN) headerHeight += 20;
    headerHeight += 50;

    let allInvoicesHtml = "";

    for (let i = 0; i < targetInvoices.length; i++) {
      const targetInvoice = targetInvoices[i];
      console.log("Processing invoice:", targetInvoice);

      const mockForm = {
        challanNo: targetInvoice.challanNo || "",
        challanDate:
          formatDateForInput(
            targetInvoice.challanDate || targetInvoice.challan_date,
          ) || "",
        invoicePostDate:
          formatDateForInput(targetInvoice.invoice_posted_date) || "",
      };

      const invoiceNo = targetInvoice.invoice_no || "";
      const invoiceDate = formatDateForInput(targetInvoice.invoice_date) || "";
      const challanNoLabel =
        fields.find((f) => f.name === "Challan No")
          ?.user_defined_display_name || "Challan No.";
      const challanDateLabel =
        fields.find((f) => f.name === "Challan Date")
          ?.user_defined_display_name || "Challan Date";
      const tax236HLabel =
        fields.find((f) => f.name === "236H Tax")?.user_defined_display_name ||
        "236H Tax";
      const grandTotalLabel =
        fields.find((f) => f.name === "Grand Total")
          ?.user_defined_display_name || "Grand Total";
      console.log("target invoice customer ", targetInvoice.customer_name);
      const customerName = targetInvoice.customer_name || "";

      const activeCustomerId = targetInvoice.customer_id;
      const customer = customers.find((c) => c.id === activeCustomerId);
      //const customerAddress = customer?.address || "";
      const customerAddress = customer?.locations?.[0]?.address || "";
      const customerProvince = targetInvoice.buyerProvince || "";
      const idLabel = customer?.ntn?.length === 7 ? "NTN" : "CNIC";
      const idValue = customer?.ntn || "";

      const activeRows =
        typeof targetInvoice.items === "string"
          ? JSON.parse(targetInvoice.items)
          : targetInvoice.items || [];
      const activeScenarioCode = targetInvoice.scenario_code || "";
      const scenarioCodeDescription =
        scenarioCodes.find((sc) => sc.code === activeScenarioCode)
          ?.description || "";
      const invoiceMetaValue = isProd
        ? activeRows[0]?.TransactionType || "-"
        : `${activeScenarioCode || "-"} - ${scenarioCodeDescription}`;

      // Batch specific structural visibility targets
      const hasSroSchedule = shouldShowHeader("SRO Schedule No.", activeRows);
      const hasSroItem = shouldShowHeader("SRO Item Sr No.", activeRows);
      const hasInternalUom = shouldShowHeader("Internal UoM", activeRows);
      const hasInternalSingleUnit = shouldShowHeader(
        "Internal Single Unit",
        activeRows,
      );
      const hasInternalQty = shouldShowHeader("Internal Qty", activeRows);
      const hasRetailPrice = shouldShowHeader(
        "Fixed Notified Value or Retail Price",
        activeRows,
      );
      const hasExtraTax = shouldShowHeader("Extra Tax", activeRows);
      const hasFurtherTax = shouldShowHeader("Further Tax", activeRows);
      const hasFed = shouldShowHeader("Federal Excise Duty", activeRows);
      const hasStwh = shouldShowHeader(
        "Sales Tax With-Held at SOURCE",
        activeRows,
      );
      const tax236HRateDisplay = `(${targetInvoice.tax236H || 0}%)`;
      const hasTax236H = shouldShowHeader("236H Tax", activeRows);
      const hasGrandTotal = shouldShowHeader("Grand Total", activeRows);

      let visibleColsBeforeQty = 3;
      if (hasSroSchedule) visibleColsBeforeQty++;
      if (hasSroItem) visibleColsBeforeQty++;
      visibleColsBeforeQty++;
      if (hasInternalUom) visibleColsBeforeQty++;
      visibleColsBeforeQty++;
      if (hasInternalSingleUnit) visibleColsBeforeQty++;

      const tableRows = activeRows
        .map((r, index) => {
          const isThirdSchedule =
            activeScenarioCode === "SN008" || activeScenarioCode === "SN027";
          const taxRateDisplay = isThirdSchedule
            ? `${r.rateDesc} on Retail:<br>${formatNumber(r.fixedNotifiedValueOrRetailPrice || 0)}`
            : `(${r.rateDesc})`;

          return `
                <tr>
                    <td style="border:1px solid #000; padding:2px; text-align:center;">${index + 1}</td>
                    <td style="border:1px solid #000; padding:2px; text-align:center;">${r.hsCode}</td>
                    <td style="border:1px solid #000; padding:2px;">${r.description}</td>
                    
                    ${hasSroSchedule ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${r.sroScheduleNo || ""}</td>` : ""}
                    ${hasSroItem ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${r.sroItemSerialNo || ""}</td>` : ""}
                    
                    <td style="border:1px solid #000; padding:2px; text-align:center;">${r.unit || ""}</td>
                    
                    ${hasInternalUom ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${r.internalUOM || ""}</td>` : ""}
                    <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.singleUnitPrice || 0)}</td>
                    ${hasInternalSingleUnit ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${r.internalSinglePrice ? formatNumber(r.internalSinglePrice) : ""}</td>` : ""}
                    
                    <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.qty || 0)}</td>
                    
                    ${hasInternalQty ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${r.internalQty ? formatNumber(r.internalQty) : ""}</td>` : ""}
                    <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.discount || 0)}</td>
                    <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(r.valueSalesExcludingST || 0)}</td>
                    
                    ${hasRetailPrice ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${r.fixedNotifiedValueOrRetailPrice ? formatNumber(r.fixedNotifiedValueOrRetailPrice) : ""}</td>` : ""}
                    
                    <td style="border:1px solid #000; padding:2px; text-align:center; font-size:9px;">
                        ${taxRateDisplay}<br><strong>${formatNumber(r.salesTaxApplicable || 0, 2)}</strong>
                    </td>
                    
                    ${hasExtraTax ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${r.extraTax ? formatNumber(r.extraTax) : ""}</td>` : ""}
                    ${hasFurtherTax ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${r.furtherTax ? formatNumber(r.furtherTax) : ""}</td>` : ""}
                    ${hasFed ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${r.fedPayable ? formatNumber(r.fedPayable) : ""}</td>` : ""}
                    ${hasStwh ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${r.salesTaxWithheldAtSource ? formatNumber(r.salesTaxWithheldAtSource) : ""}</td>` : ""}
                    <td style="border:1px solid #000; padding:2px; text-align:right;"><strong>${formatNumber(r.totalValues || r.valueInclTax || 0, 2)}</strong></td>
                    ${hasTax236H ? `<td style="border:1px solid #000; padding:2px; text-align:center;"> ${tax236HRateDisplay}<br><strong>${formatNumber((targetInvoice.tax236H * r.valueSalesExcludingST) / 100 || 0, 2)}</strong></td>` : ""}
                    ${
                      hasGrandTotal
                        ? `<td style="border:1px solid #000; padding:2px; text-align:center;">
                        ${formatNumber(
                          Number(r.totalValues || r.valueInclTax || 0) +
                            (Number(targetInvoice.tax236H || 0) *
                              Number(r.valueSalesExcludingST || 0)) /
                              100,
                          2,
                        )}
                      </td>`
                        : ""
                    }
                    
                </tr>`;
        })
        .join("");

      const totalDisc = activeRows.reduce(
        (sum, r) => sum + Number(r.discount || 0),
        0,
      );
      const totalQty = activeRows.reduce(
        (sum, r) => sum + Number(r.qty || 0),
        0,
      );
      const totalFixednotifiedretailPrice = activeRows.reduce(
        (sum, r) => sum + Number(r.fixedNotifiedValueOrRetailPrice || 0),
        0,
      );
      const totalFedPayable = activeRows.reduce(
        (sum, r) => sum + Number(r.fedPayable || 0),
        0,
      );
      const totalFurthurTax = activeRows.reduce(
        (sum, r) => sum + Number(r.furtherTax || 0),
        0,
      );
      const totalExtraTax = activeRows.reduce(
        (sum, r) => sum + Number(r.extraTax || 0),
        0,
      );
      const totalSalesTaxWithheldAtSource = activeRows.reduce(
        (sum, r) => sum + Number(r.salesTaxWithheldAtSource || 0),
        0,
      );
      const totalExclTax = activeRows.reduce(
        (sum, r) => sum + Number(r.valueSalesExcludingST || 0),
        0,
      );
      const totalSaleTaxApplicable = activeRows.reduce(
        (sum, r) => sum + Number(r.salesTaxApplicable || 0),
        0,
      );
      const totalTax236H = activeRows.reduce(
        (sum, r) =>
          sum +
          (Number(targetInvoice.tax236H || 0) *
            Number(r.valueSalesExcludingST || 0)) /
            100,
        0,
      );
      const totalTax =
        totalSaleTaxApplicable +
        totalSalesTaxWithheldAtSource +
        totalExtraTax +
        totalFurthurTax +
        totalFedPayable;
      const totalInclTax = totalExclTax + totalTax;
      const totalInternalQty = activeRows.reduce(
        (sum, r) => sum + Number(r.internalQty || 0),
        0,
      );
      const totalGrandTotal = totalInclTax + totalTax236H;

      const fbrInvoiceNo = targetInvoice.fbr_invoice_no || "";
      let qrCodeUrl = "";
      if (fbrInvoiceNo) {
        qrCodeUrl = await QRCode.toDataURL(fbrInvoiceNo, {
          width: 200,
          margin: 1,
        });
      }

      const pageBreak = i > 0 ? "page-break-before: always;" : "";

      allInvoicesHtml += `
            <div style="${pageBreak}">
                <table class="master-table">
                    <thead>
                        <tr><td><div class="header-spacer">&nbsp;</div></td></tr>
                    </thead>
                    <tbody>
                        <tr><td>
                            <div style="font-family: Arial, sans-serif; font-size: 11px; padding: 0 10px;">
                                <table style="width:100%; border-collapse:collapse; font-size:11px; margin-bottom:12px;">
                                    <tr>
                                        <td style="width:55%; vertical-align:top; border:1px solid #000; padding:6px;">
                                            <strong>Billing To:</strong><br>
                                            ${customerName}<br>
                                            Address: ${customerAddress || "Address not provided"}<br>
                                            Province: ${customerProvince}<br>
                                            ${idLabel}: ${idValue}
                                        </td>
                                        <td style="width:45%; vertical-align:top; border:1px solid #000; padding:6px;">
                                            <table style="width:100%; border-collapse:collapse;">
                                                <tr><td style="width:40%;"><strong>Invoice Number</strong></td><td>${invoiceNo}</td></tr>
                                                <tr><td><strong>Date</strong></td><td>${invoiceDate}</td></tr>
                                                <tr><td><strong>Buyer Type</strong></td><td>${targetInvoice.buyerType || ""}</td></tr>
                                                <tr><td><strong>Currency</strong></td><td>${currency || "PKR"}</td></tr>
                                                <tr><td><strong>${invoiceMetaLabel}</strong></td><td>${invoiceMetaValue}</td></tr>
                                                ${shouldShow("Challan No", null, mockForm) ? `<tr><td><strong>${challanNoLabel}</strong></td><td>${mockForm.challanNo}</td></tr>` : ""}
                                                ${shouldShow("Challan Date", null, mockForm) ? `<tr><td><strong>${challanDateLabel}</strong></td><td>${mockForm.challanDate}</td></tr>` : ""}
                                                ${shouldShow("Invoice Print Date", null, mockForm) ? `<tr><td><strong>Invoice Post Date</strong></td><td>${mockForm.invoicePostDate}</td></tr>` : ""}
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <table style="width:100%; border-collapse:collapse; font-size:10px; margin-bottom:12px; border:1px solid #000;">
                                    <thead style="background:#d9d9d9; font-weight:bold;">
                                        <tr>
                                            <th style="border:1px solid #000; padding:2px; width:2%; text-align:center;">Sr No.</th>
                                            <th style="border:1px solid #000; padding:2px; width:4%; text-align:center;">HS Code</th>
                                            <th style="border:1px solid #000; padding:2px; width:13%; text-align:left;">Product Description</th>
                                            ${hasSroSchedule ? `<th style="border:1px solid #000; padding:2px; width:5%; text-align:center;">SRO Schedule No.</th>` : ""}
                                            ${hasSroItem ? `<th style="border:1px solid #000; padding:2px; width:5%; text-align:center;">SRO Item Sr No.</th>` : ""}
                                            <th style="border:1px solid #000; padding:2px; width:6%; text-align:center;">FBR Unit</th>
                                            ${hasInternalUom ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">Internal UOM</th>` : ""}
                                            <th style="border:1px solid #000; padding:2px; width:5%; text-align:center;">FBR Price</th>
                                            ${hasInternalSingleUnit ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">Int. Price</th>` : ""}
                                            <th style="border:1px solid #000; padding:2px; width:5%; text-align:center;">FBR Qty</th>
                                            ${hasInternalQty ? `<th style="border:1px solid #000; padding:2px; width:4%; text-align:center;">Int. Qty</th>` : ""}
                                            <th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">Discount</th>
                                            <th style="border:1px solid #000; padding:2px; width:8%; text-align:center;">Excl. Tax</th>
                                            ${hasRetailPrice ? `<th style="border:1px solid #000; padding:2px; width:5%; text-align:center;">Retail Price</th>` : ""}
                                            <th style="border:1px solid #000; padding:2px; width:6%; text-align:center;">Sales Tax</th>
                                            ${hasExtraTax ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">Extra Tax</th>` : ""}
                                            ${hasFurtherTax ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">Further Tax</th>` : ""}
                                            ${hasFed ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">FED</th>` : ""}
                                            ${hasStwh ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">STWH</th>` : ""}
                                            <th style="border:1px solid #000; padding:2px; width:10%; text-align:right;">Total Incl. Tax</th>
                                            ${hasTax236H ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">${tax236HLabel}</th>` : ""}
                                            ${hasGrandTotal ? `<th style="border:1px solid #000; padding:2px; width:3%; text-align:center;">${grandTotalLabel}</th>` : ""}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${tableRows}
                                        <tr style="font-weight:bold; background:#f2f2f2;">
                                            <td colspan="${visibleColsBeforeQty}" style="border:1px solid #000; padding:6px; text-align:right;">Total Values</td>
                                            <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalQty)}</td>
                                            ${hasInternalQty ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalInternalQty)}</td>` : ""}
                                            <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalDisc)}</td>
                                            <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalExclTax)}</td>
                                            ${hasRetailPrice ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalFixednotifiedretailPrice)}</td>` : ""}
                                            <td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalSaleTaxApplicable)}</td>
                                            ${hasExtraTax ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalExtraTax)}</td>` : ""}
                                            ${hasFurtherTax ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalFurthurTax)}</td>` : ""}
                                            ${hasFed ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalFedPayable)}</td>` : ""}
                                            ${hasStwh ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalSalesTaxWithheldAtSource)}</td>` : ""}
                                            <td style="border:1px solid #000; padding:2px; text-align:right;">${formatNumber(totalInclTax)}</td>
                                            ${hasTax236H ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalTax236H)}</td>` : ""}
                                            ${hasGrandTotal ? `<td style="border:1px solid #000; padding:2px; text-align:center;">${formatNumber(totalGrandTotal)}</td>` : ""}
                                        </tr>
                                    </tbody>
                                </table>

                                ${
                                  fbrInvoiceNo
                                    ? `
                                <div style="display:flex; align-items:center; justify-content:space-between; font-size:11px; margin-top:10px; width:100%; page-break-inside: avoid;">
                                    <div><strong>FBR INVOICE #:</strong> ${fbrInvoiceNo}</div>
                                    <div style="display:flex; align-items:center; gap:6px;">
                                        <img class="fbr-img-wait" src="${qrCodeUrl}" width="80" height="80" alt="QR" />
                                        <img class="fbr-img-wait" src="${fbrLogoUrl}" width="80" height="80" alt="Logo" />
                                    </div>
                                </div>
                                `
                                    : '<p style="text-align:center; font-style:italic;">Note: This Invoice is not verified from FBR</p>'
                                }
                            </div>
                        </td></tr>
                    </tbody>
                    <tfoot>
                        <tr><td><div class="footer-spacer">&nbsp;</div></td></tr>
                    </tfoot>
                </table>
            </div>`;
    } // End of Invoice Loop

    const finalPrintContent = `
        <style>
            @media print {
                @page { size: A4 ${savedOrientation} !important; margin: 10mm; }
                html, body { margin: 0; padding: 0; }
                .master-table { width: 100%; border-collapse: collapse; }
                .header-spacer { height: ${headerHeight}px; }
                .footer-spacer { height: 50px; }
                .header-fixed {
                    position: fixed; top: 0; left: 0; width: 100%; height: ${headerHeight - 5}px;
                    background: white; z-index: 2000;
                }
                .footer-fixed {
                    position: fixed; bottom: 0; left: 0; width: 100%; height: 45px;
                    background: white; display: flex !important; justify-content: space-between;
                    align-items: center; z-index: 2000; font-size: 12px;
                }
                .page-counter-display::after { font-weight: bold; }
                tr { page-break-inside: avoid !important; }
                thead { display: table-header-group !important; }
            }
            @media screen { .header-fixed, .footer-fixed { display: none; } }
        </style>

       <div class="header-fixed">
    <div style="text-align:center; font-weight:bold; font-size:16px; margin-top:5px;">
         ${shouldShow("Seller Name") ? `${sellerName.toUpperCase()}` : ""}
    </div>
    <div style="text-align:center; font-size:11px;">
          ${shouldShow("Seller Address") ? `${sellerAddress.toUpperCase()}` : ""}
    </div>
    <div style="text-align:center; font-size:11px; margin-bottom:12px;">
        ${shouldShow("Seller NTN") ? `NTN No. ${sellerInvoiceNTN}` : ""}
    </div>
    <div style="text-align:center; font-weight:bold; font-size:14px; padding: 6px 0; margin: 0 10px; position: relative;">
        SALES TAX INVOICE
        <span class="page-counter-display" style="position: absolute; right: 10px; font-size: 10px;"></span>
    </div>
</div>

        <div class="footer-fixed">
            <span style="padding-left:15px; font-style: italic;">${footerEnvText}</span>
            <span class="page-counter-display" style="padding-right:15px; font-weight:bold;"></span>
        </div>

        ${allInvoicesHtml}
        `;

    let printDiv = document.getElementById("print-invoice-container");
    if (!printDiv) {
      printDiv = document.createElement("div");
      printDiv.id = "print-invoice-container";
      printDiv.style.position = "absolute";
      printDiv.style.left = "-9999px";
      document.body.appendChild(printDiv);
    }

    printDiv.innerHTML = finalPrintContent;

    const images = printDiv.querySelectorAll(".fbr-img-wait");
    const imagePromises = Array.from(images).map((img) => {
      return new Promise((resolve) => {
        if (img.complete) return resolve();
        img.onload = resolve;
        img.onerror = resolve;
      });
    });

    await Promise.all(imagePromises);

    printDiv.offsetHeight;

    window.print();

    setTimeout(() => {
      printDiv.innerHTML = "";
    }, 3000);
  } catch (err) {
    console.warn("Batch Print failed:", err);
    alert(
      "Failed to generate batch print view.\nUse Ctrl+P to print manually.",
    );
  }
};
