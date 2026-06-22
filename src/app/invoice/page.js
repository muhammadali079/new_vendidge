"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import QRCode from "qrcode";
import {
  DocumentArrowDownIcon,
  CloudArrowDownIcon,
} from "@heroicons/react/24/solid";
import { getFbrPayload } from "../utils/fbrPayload";
import {
  handlePrintInvoice,
  handleBatchPrintInvoices,
} from "../utils/printInvoice";
import { useRouter } from "next/navigation";
import { Layers, Check, Settings, Calculator, Trash2 } from "lucide-react";

export default function InvoicePage({ darkMode }) {
  // const searchParams = useSearchParams();
  const router = useRouter();
  // const isConsultantMode = searchParams.get("mode") === "consultant";
  const [isConsultantMode, setIsConsultantMode] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [hsCodes, setHsCodes] = useState([]);
  const [uomList, setUomList] = useState([]);
  const [saleTypeList, setSaleTypeList] = useState([]);
  const [transTypeList, setTransTypeList] = useState([]);
  const [scenarioCodeToTransactionType, setScenarioCodeToTransactionType] =
    useState([]);
  const [latestInvoice, setLatestInvoice] = useState(null);
  const [scenarioCodes, setScenarioCodes] = useState([]);
  const [scenarioSearch, setScenarioSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [HSCodeLoading, setHsCodeLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [minUnpostedInvoiceNo, setMinUnpostedInvoiceNo] = useState(null);
  const [openActionId, setOpenActionId] = useState(null);
  const apiCache = useRef({
    hsCodes: null,
    uomList: null,
    transTypeList: null,
    rates: {},
    sros: {},
    sroItems: {},
  });
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNo: "",
    internal_inv_ref_no: "",
    date: "",
    customer: "",
    customerId: 0,
    buyerProvince: "",
    sellerBusinessId: 0,
    sellerBusinessName: "",
    sellerProvinceId: 0,
    sellerProvince: "",
    sellerAddress: "",
    scenarioCode: "",
    scenarioCodeId: 0,
    saleType: "",
    buyerType: "",
    registrationNo: "",
    fbrInvoiceRefNo: "",
    exclTax: 0,
    tax: 0,
    inclTax: 0,
    tax236H: 0,
    grandTotal: 0,
    status: "",
    challanNo: "",
    challanNoLabel: "",
    challan_date: "",
    challanDateLabel: "",
    invoice_posted_date: "",
    items: [
      {
        hsCode: "",
        productId: null,
        product_description: "",
        description: "",
        qty: "",
        rateId: 0,
        rate: "",
        rateDesc: "",
        unit: "",
        singleUnitPrice: "",
        totalValues: "",
        valueSalesExcludingST: "",
        fixedNotifiedValueOrRetailPrice: "",
        salesTaxApplicable: "",
        salesTaxWithheldAtSource: "",
        extraTax: "",
        furtherTax: "",
        sroScheduleNo: "",
        fedPayable: "",
        discount: "",
        TransactionTypeId: 0,
        TransactionType: "",
        sroItemSerialNo: "",
      },
    ],
  });
  const [invoices, setInvoices] = useState([]);

  // const [page, setPage] = useState(1);
  // const [pageSize] = useState(10);
  // Helper to format any date consistently to YYYY-MM-DD in PKT timezone
  const getFormattedDate = (date) => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Karachi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  const todayStr = getFormattedDate(new Date());

  const [startDate, setStartDate] = useState(() => {
    const editId =
      typeof window !== "undefined" &&
      sessionStorage.getItem("consultantEditInvoiceId");

    let d;
    if (editId) {
      d = new Date("2020-04-19T19:17:35");
    } else {
      d = new Date();
      d.setMonth(d.getMonth() - 1);
    }

    return getFormattedDate(d);
  });

  const [endDate, setEndDate] = useState(() => {
    return todayStr;
  });
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [hasChanged, setHasChanged] = useState(false);

  const [processingInvoiceId, setProcessingInvoiceId] = useState(null);
  const [selectedError, setSelectedError] = useState(null);
  const [isLoadingError, setIsLoadingError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fields, setFields] = useState([]);

  const [buyerRegistrationType, setBuyerRegistrationType] = useState("");

  const emptyRow = {
    hsCode: "",
    description: "",
    productId: null,
    product_description: "",
    qty: "",
    rateId: 0,
    rate: "",
    rateDesc: "",
    unit: "",
    singleUnitPrice: "",
    totalValues: "",
    valueSalesExcludingST: "",
    fixedNotifiedValueOrRetailPrice: "",
    salesTaxApplicable: "",
    salesTaxWithheldAtSource: "",
    extraTax: "",
    furtherTax: "",
    sroScheduleNo: "",
    sroScheduleId: "",
    sroOptions: [],
    sroItemOptions: [],
    sroItemSerialNo: "",
    sroItemId: "",
    fedPayable: "",
    discount: "",
    TransactionTypeId: 0,
    TransactionType: "",
    internalSinglePrice: 0,
    internalQty: 0,
    internalUOM: "",
  };

  const [permissions, setPermissions] = useState({
    can_view_invoice: 0,
    can_create_invoice: 0,
    can_edit_invoice: 0,
    can_delete_invoice: 0,
    can_post_invoice: 0,
  });
  const [userBusinesses, setUserBusinesses] = useState([]);

  useEffect(() => {
   
    const storedPerms = sessionStorage.getItem("permissions");
    const storedBusinesses = sessionStorage.getItem("businesses");
    if (storedPerms) {
      try {
        setPermissions(JSON.parse(storedPerms));
        console.log(JSON.parse(storedPerms));
      } catch (e) {
        console.error("Failed to parse permissions", e);
      }
    }
    if (storedBusinesses) {
      try {
        const parsedBiz = JSON.parse(storedBusinesses);
        setUserBusinesses(parsedBiz);

        if (parsedBiz.length > 0 && !isEditMode) {
          const firstBiz = parsedBiz[0];
          console.log("first biz", firstBiz);
          setInvoiceForm((prev) => ({
            ...prev,
            sellerBusinessId: firstBiz.id,
            sellerBusinessName: firstBiz.business_name,
            sellerAddress: firstBiz.address || "",
            sellerProvinceId: firstBiz.province_id,
            sellerProvince: firstBiz.province || "",
            sellerAddress: firstBiz.address || "",
          }));
        }
      } catch (e) {
        console.error("Failed to parse businesses", e);
      }
    }
  }, []);

  useEffect(() => {
    const isConsultant =
      sessionStorage.getItem("activeConsultantMode") === "true";
    const editId = sessionStorage.getItem("consultantEditInvoiceId");

    console.log("Consultant mode:", isConsultant, "Edit ID signal:", editId);

    if (isConsultant) {
      setIsConsultantMode(true);

      if (!editId) {
        setShowForm(true);
        setIsEditMode(false);
        setIsReadOnly(false);
        setEditingInvoiceId(null);
        getMinDate();
        console.log("mid date ", minDate);

        setInvoiceForm((prev) => ({
          ...prev,
          invoiceNo: "",
          date: minDate || getFormattedDate(new Date()),
          customer: "",
          customerId: 0,
          buyerProvince: "",
          sellerProvince:
            sessionStorage.getItem("sellerProvince") ||
            prev.sellerProvince ||
            "",
          sellerProvinceId: sessionStorage.getItem("sellerProvinceId")
            ? String(sessionStorage.getItem("sellerProvinceId"))
            : prev.sellerProvinceId || "",
          scenarioCode: null,
          scenarioCodeId: 0,
          saleType: "",
          registrationNo: "",
          items: [{ ...emptyRow, rowId: genRowId() }],
        }));
        setRows([{ ...emptyRow, rowId: genRowId() }]);
      }
    }
  }, [invoices]);

  useEffect(() => {
    const editId = sessionStorage.getItem("consultantEditInvoiceId");
    console.log("Checking for edit signal. Found ID:", editId);
    console.log("Current invoices in state:", invoices);

    // Once the invoice list is fetched from /api/invoices-crud, find the match
    if (editId && invoices.length > 0) {
      const targetInvoice = invoices.find(
        (inv) => inv.invoice_no.toString() === editId.toString(),
      );
      console.log("Looking for invoice ID:", editId, "Found:", targetInvoice);
      console.log("user perm ", permissions);
      if (targetInvoice) {
        setIsEditMode(true);
        setIsReadOnly(true);
        // Trigger YOUR actual function (Line ~940) that loads data and opens the form
        handleViewInvoice(targetInvoice);

        // Clean up the signal so the form doesn't re-open on every page refresh
        //   sessionStorage.removeItem("consultantEditInvoiceId");
      }
    }
  }, [invoices]);

  const genRowId = () => `${Date.now()}_${Math.floor(Math.random() * 100000)}`;

  const getFbrHeaders = () => {
    const token = sessionStorage.getItem("sellerToken");
    return token
      ? { Authorization: `Bearer ${token}`, Accept: "application/json" }
      : { Accept: "application/json" };
  };

  const [rows, setRows] = useState([{ ...emptyRow, rowId: genRowId() }]);

  const setRowFieldsById = (rowId, changes) => {
    setRows((prev) =>
      prev.map((r) => (r.rowId === rowId ? { ...r, ...changes } : r)),
    );
  };

  useEffect(() => {
    async function fetchScenarioCodes() {
      try {
        const res = await fetch("/api/scenarioCodes");
        const data = await res.json();
        setScenarioCodes(data.scenarioCodes);
      } catch (err) {
        console.warn("Failed to fetch scenario codes:", err);
      }
    }

    async function fetchCustomers() {
      try {
        const userId =
          Number(sessionStorage.getItem("parent_id")) ||
          Number(sessionStorage.getItem("userId"));
        const res = await fetch(`/api/customer?userId=${userId}`);
        const data = await res.json();
        console.log("Fetched customers:", data);
        setCustomers(data);
      } catch (err) {
        console.warn("Failed to fetch customers:", err);
      }
    }

    async function fetchUserChooseableFields() {
      try {
        const userId = Number(sessionStorage.getItem("userId"));
        const userRole = sessionStorage.getItem("role");
        const res = await fetch(
          `/api/userChoosableFields?userId=${userId}&role=${userRole}`,
        );
        const data = await res.json();
        setFields(data);
      } catch (err) {
        console.warn("Failed to fetch userChoosableFields:", err);
      }
    }
    // console.log("hs code ", hsCodes);
    // console.log("uom list ", uomList);
    fetchUserChooseableFields();
    fetchScenarioCodes();
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (showForm && !isEditMode) {
      const fetchLatestInvoice = async () => {
        let nextInvoiceNo = "";
        try {
          const userId =
            sessionStorage.getItem("parentId") ||
            sessionStorage.getItem("userId");
          if (!userId) return;
          const res = await fetch(`/api/latestInvoiceNo?user_id=${userId}`);
          const data = await res.json();

          const currentLatest = data.latestInvoice;
          const isNumeric =
            currentLatest !== null &&
            currentLatest !== "" &&
            !isNaN(Number(currentLatest));

          // 2. Calculate the next number (default to 1 if no previous invoice exists)
          nextInvoiceNo = isNumeric
            ? Number(currentLatest) + 1
            : data.latestInvoice;
          console.log("latest invoice no", nextInvoiceNo);
          setLatestInvoice(nextInvoiceNo);
          setInvoiceForm((prev) => ({
            ...prev,
            internal_inv_ref_no: nextInvoiceNo,
          }));
        } catch (err) {
          console.warn("Failed to fetch latest invoice:", err);
          setLatestInvoice(data.latestInvoice);
          setInvoiceForm((prev) => ({
            ...prev,
            internal_inv_ref_no: data.latestInvoice,
          }));
        }
      };
      fetchLatestInvoice();
    }
    if (showForm) {
      const fetchMasterData = async () => {
        try {
          if (apiCache.current.hsCodes && apiCache.current.hsCodes.length > 0) {
            setHsCodes(apiCache.current.hsCodes);
            setUomList(apiCache.current.uomList);
            setTransTypeList(apiCache.current.transTypeList);
            return;
          }
          const headers = getFbrHeaders();
          const [
            hsResponse,
            uomResponse,
            transTypeResponse,
            saleTypeResponse,
            scenarioCodeToTransactionTypeResponse,
          ] = await Promise.all([
            fetch("/api/fbr/hsCode", { headers }),
            fetch("/api/fbr/uom", { headers }),
            fetch("/api/fbr/TransactionType", { headers }),
            fetch("/api/fbr/saleType", { headers }),
            fetch("/api/scenarioCodeToTransactionType"),
          ]);

          if (
            !hsResponse.ok ||
            !uomResponse.ok ||
            !transTypeResponse.ok ||
            !saleTypeResponse.ok
          ) {
            throw new Error("Master Data API failed");
          }

          const hsData = await hsResponse.json();
          const uomData = await uomResponse.json();
          const transTypeData = await transTypeResponse.json();
          const saleTypeData = await saleTypeResponse.json();
          const scenarioCodeToTransactionTypeData =
            await scenarioCodeToTransactionTypeResponse.json();

          apiCache.current.hsCodes = Array.isArray(hsData) ? hsData : [];
          apiCache.current.uomList = Array.isArray(uomData) ? uomData : [];
          apiCache.current.transTypeList = Array.isArray(transTypeData)
            ? transTypeData
            : [];

          setHsCodes(apiCache.current.hsCodes);
          setUomList(apiCache.current.uomList);
          setTransTypeList(apiCache.current.transTypeList);
          setSaleTypeList(Array.isArray(saleTypeData) ? saleTypeData : []);
          setScenarioCodeToTransactionType(
            Array.isArray(scenarioCodeToTransactionTypeData)
              ? scenarioCodeToTransactionTypeData
              : scenarioCodeToTransactionTypeData.scenarioCodeToTransactionType ||
                  [],
          );
        } catch (err) {
          console.warn("Failed to load Master Data:", err);
          setHsCodes([]);
          setUomList([]);
          setTransTypeList([]);
        }
      };
      fetchMasterData();
    }
  }, [showForm, isEditMode]);

  // Replace the old useEffect depending on [page]
  useEffect(() => {
    fetchInvoices();
  }, [startDate, endDate]);

  //   const fetchInvoices = async () => {
  //     setLoading(true);

  //     const userId =
  //       Number(sessionStorage.getItem("parent_id")) ||
  //       Number(sessionStorage.getItem("userId"));
  //     console.log("Fetching invoices for userId:", userId);
  //     // console.log('type of ', typeof userId);
  //     try {
  //       const res = await fetch(
  //         `/api/invoices-crud?page=${page}&pageSize=${pageSize}&userId=${userId}`,
  //       );
  //       const data = await res.json();
  //       console.log("Fetched invoices data:", data);
  //       setInvoices(data.data || []);
  //     } catch (err) {
  //       console.warn("Failed to load invoices", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  // --- UPDATED FETCH FUNCTION ---
  const fetchInvoices = async () => {
    setLoading(true);
    const userId =
      Number(sessionStorage.getItem("parent_id")) ||
      Number(sessionStorage.getItem("userId"));

    try {
      const res = await fetch(
        `/api/invoices-crud?userId=${userId}&startDate=${startDate}&endDate=${endDate}`,
      );
      const data = await res.json();
      console.log(
        "Fetched invoices data:",
        data.data[0],
        "minUnpostedInvoiceNo:",
        data.minUnpostedInvoiceNo,
      );
      setInvoices(data.data || []);
      setMinUnpostedInvoiceNo(data.minUnpostedInvoiceNo);
      setSelectedInvoices([]); // Clear selection when data refreshes
    } catch (err) {
      console.warn("Failed to load invoices", err);
    } finally {
      setLoading(false);
    }
  };

  // --- MULTI-SELECT LOGIC ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedInvoices(invoices.map((inv) => inv.id));
    } else {
      setSelectedInvoices([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedInvoices((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // --- BATCH CRITERIA EVALUATION ---
  const selectedInvObjects = invoices.filter((inv) =>
    selectedInvoices.includes(inv.id),
  );
  const sortedSelectedForPost = [...selectedInvObjects].sort(
    (a, b) => a.invoice_no - b.invoice_no,
  );

  // Batch Validate: ALL selected must be Pending or Failed
  const canBatchValidate =
    selectedInvoices.length > 0 &&
    selectedInvObjects.every((inv) =>
      ["Pending", "Failed"].includes(inv.status),
    );

  // Batch Post: ALL selected must be Validated
  let isContiguousFromMinUnposted = false;
  const allSelectedAreValidated =
    selectedInvoices.length > 0 &&
    sortedSelectedForPost.every((inv) => inv.status === "Validated");

  if (allSelectedAreValidated && minUnpostedInvoiceNo !== null) {
    isContiguousFromMinUnposted = true;
    console.log("Min Unposted Invoice No:", sortedSelectedForPost);
    for (let i = 0; i < sortedSelectedForPost.length; i++) {
      if (sortedSelectedForPost[i].invoice_no !== minUnpostedInvoiceNo + i) {
        isContiguousFromMinUnposted = false;
        break;
      }
    }
  }

  const canBatchPost = isContiguousFromMinUnposted;

  // Batch Print: At least 1 selected (Any status is fine for printing)
  const canBatchPrint = selectedInvoices.length > 0;

  // --- BATCH ACTION HANDLERS ---
  const handleBatchValidate = async () => {
    if (
      !confirm(
        `Are you sure you want to validate ${selectedInvoices.length} invoices?`,
      )
    )
      return;
    setIsBatchProcessing(true);
    try {
      for (const inv of selectedInvObjects) {
        await validateInvoiceDirectly(inv); // Reusing your existing function
      }
      alert("Batch validation complete!");
    } catch (err) {
      console.error("Batch validation error", err);
    } finally {
      setIsBatchProcessing(false);
      fetchInvoices();
    }
  };

  const handleBatchPostToFBR = async () => {
    if (
      !confirm(
        `Are you sure you want to post ${selectedInvoices.length} invoices to FBR?`,
      )
    )
      return;
    setIsBatchProcessing(true);
    console.log("Selected invoices for FBR posting:", selectedInvoices);
    selectedInvoices.sort((a, b) => a - b); // Ensure they're sorted by invoice_no
    try {
      for (const id of selectedInvoices) {
        console.log("Posting invoice to FBR:", id);
        await postInvoiceToFBR(id);
      }
      alert("Batch FBR Posting complete!");
    } catch (err) {
      console.error("Batch FBR error", err);
    } finally {
      setIsBatchProcessing(false);
      fetchInvoices();
    }
  };
  const printMultipleInvoices = async (targetInvoices) => {
    try {
      await handleBatchPrintInvoices(
        targetInvoices,
        customers,
        scenarioCodes,
        invoices,
        formatDateForInput,
        formatNumber,
        shouldShow,
        shouldShowHeader,
        fields,
      );
    } catch (err) {
      console.warn("Batch print failed:", err);
      alert("Failed to generate batch print view.");
    }
  };

  // Update your batch print handler
  const handleBatchPrint = async () => {
    if (selectedInvObjects.length === 0) return;

    // Pass the entire array of selected invoices to print them in one go
    await printMultipleInvoices(selectedInvObjects);
  };
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const userId =
          Number(sessionStorage.getItem("parent_id")) ||
          Number(sessionStorage.getItem("userId"));
        const res = await fetch(`/api/user-products?userId=${userId}`); // Using the API we created earlier
        const data = await res.json();
        setAllProducts(data);
      } catch (err) {
        console.warn("Failed to fetch products:", err);
      }
    }
    fetchProducts();
  }, [showForm]);

  const handleProductSelect = async (index, product) => {
    const currentProvId =
      Number(invoiceForm.sellerProvinceId) ||
      (userBusinesses.length > 0 ? Number(userBusinesses[0].province_id) : 0);
    console.log("product selected ", product.sroItemId);
    console.log("currentProvId selected ", currentProvId);
    setRows((prevRows) => {
      const newRows = [...prevRows];
      const row = {
        ...newRows[index],
        productId: product.id,
        hsCode: product.hsCode,
        product_description: product.product_description, // UPDATED field name
        description: product.product_description,
        singleUnitPrice: product.singleUnitPrice,
        unit: product.unit,
        internalSinglePrice: product.internalSinglePrice,
        internalUOM: product.internalUOM || "",

        // --- NEWLY ADDED TAX & RETAIL FIELDS ---
        fixedNotifiedValueOrRetailPrice:
          product.fixedNotifiedValueOrRetailPrice || "",
        furtherTax: product.furtherTax || "",
        extraTax: product.extraTax || "",
        salesTaxWithheldAtSource: product.salesTaxWithheldAtSource || "",
        fedPayable: product.fedPayable || "",

        // Pre-fill FBR Mapping
        TransactionTypeId: product.transactionTypeId,
        TransactionType: product.transactionType,
        rateId: product.rateId,
        rate: product.rate,
        rateDesc: product.rateDesc,
        sroScheduleId: product.sroScheduleId,
        sroScheduleNo: product.sroSchedule,
        sroItemId: product.sroItemId,
        sroItemSerialNo: product.sroItemSerialNo,
      };

      // Trigger the cascade to populate the dropdown options (arrays) for this row
      setTimeout(async () => {
        // 1. Load Rates
        await fetchSalesTaxRate(index, currentProvId, row);

        // 2. Load SRO Schedules based on the product's rate
        if (product.rateId) {
          await fetchSroScheduleOptions(index, row);
        }

        // 3. Load SRO Items based on the product's SRO
        if (product.sroScheduleId) {
          await fetchSroItemOptions(index, row);
        }
      }, 0);

      const calculatedRow = calculateRow(row, invoiceForm.tax236H);
      newRows[index] = calculatedRow;

      // Update Bottom Totals
      updateInvoiceTotals(newRows);
      return newRows;
    });
    setHasChanged(true);
  };
  // Helper to safely parse numbers
  const n = (v) => {
    const parsed = parseFloat(v);
    return isNaN(parsed) ? 0 : parsed;
  };

  const calculateRow = (row, tax236HRate) => {
    const qty = n(row.qty);
    const price = n(row.singleUnitPrice);
    const discountPct = n(row.discount);

    const grossValue = qty * price;
    const discountAmount = (grossValue * discountPct) / 100;
    const valueExcl = grossValue - discountAmount;

    const retailPricePerUnit = n(row.fixedNotifiedValueOrRetailPrice);
    const retailPriceTotal = retailPricePerUnit * qty;

    const rateVal = n(String(row.rate).replace(/[^0-9.]/g, ""));
    const baseSalesTax = (valueExcl * rateVal) / 100;

    const furtherTaxAmt = (valueExcl * n(row.furtherTax)) / 100;
    const extraTaxAmt = (valueExcl * n(row.extraTax)) / 100;
    const fedAmt = (valueExcl * n(row.fedPayable)) / 100;
    const withheldAmt = (valueExcl * n(row.salesTaxWithheldAtSource)) / 100;

    // 236H tax: applied on excl. value using the invoice-level percentage
    const rate236H = tax236HRate !== undefined ? n(tax236HRate) : 0;

    const totalTaxPerRow = baseSalesTax + furtherTaxAmt + extraTaxAmt + fedAmt;
    // totalValues (incl tax) includes 236H so the row reflects the full amount
    const totalInclTax = valueExcl + totalTaxPerRow;
    const tax236HAmt = (totalInclTax * rate236H) / 100;

    return {
      ...row,
      valueSalesExcludingST: valueExcl.toFixed(4),

      calculatedFurtherTax: furtherTaxAmt,
      calculatedExtraTax: extraTaxAmt,
      calculatedFed: fedAmt,
      calculatedWithheld: withheldAmt,
      calculated236H: tax236HAmt,
      salesTaxApplicable: totalTaxPerRow.toFixed(4),
      totalValues: totalInclTax.toFixed(4),
      // Update the retail total field as requested
      retailPriceTotal: retailPriceTotal.toFixed(4),
    };
  };
  const updateInvoiceTotals = (allRows) => {
    let totalQty = 0;
    let totalExcl = 0;
    let totalTax = 0;
    let totalFurther = 0;
    let totalExtra = 0;
    let totalWithheld = 0;
    let totalFed = 0;
    let totalIncl = 0;
    let total236H = 0;

    allRows.forEach((r) => {
      const qty = n(r.qty);
      const exclValue = n(r.valueSalesExcludingST);

      // 1. Core values
      totalQty += qty;
      totalExcl += exclValue;
      totalTax += n(r.salesTaxApplicable); // Already a calculated value

      // 2. Calculate actual monetary value from tax percentages
      const rowFurtherAmt = (parseInt(exclValue) * n(r.furtherTax)) / 100;
      const rowExtraAmt = (parseInt(exclValue) * n(r.extraTax)) / 100;
      const rowWithheldAmt =
        (parseInt(exclValue) * n(r.salesTaxWithheldAtSource)) / 100;
      const rowFedAmt = (parseInt(exclValue) * n(r.fedPayable)) / 100;

      // 3. Accumulate calculated monetary values into totals
      totalFurther += rowFurtherAmt;
      totalExtra += rowExtraAmt;
      totalWithheld += rowWithheldAmt;
      totalFed += rowFedAmt;
      console.log("row", r, "236H amt ", n(r.calculated236H));
      // 4. Accumulate 236H tax amount per row (uses stored calculated value if available)
      total236H += n(r.calculated236H);

      // 5. Accumulate Total Inclusive value (already includes 236H per row)
      totalIncl += n(r.totalValues);
    });

    // grandTotal = inclTax (which already includes 236H per row)
    const grandTotal = totalIncl + total236H;

    setInvoiceForm((prev) => ({
      ...prev,
      totalProducts: allRows.length,
      totalQty: totalQty.toFixed(4),
      exclTax: totalExcl.toFixed(4),
      tax: totalTax.toFixed(4),
      totalFurtherTax: totalFurther.toFixed(4),
      totalExtraTax: totalExtra.toFixed(4),
      totalSalesTaxWithheld: totalWithheld.toFixed(4),
      totalFedPayable: totalFed.toFixed(4),
      inclTax: totalIncl.toFixed(4), // incl tax without 236H
      total236HTax: total236H.toFixed(4), // 236H tax amount total
      grandTotal: grandTotal.toFixed(4), // final grand total
    }));
  };

  let today;
  let minDate;

  function getMinDate() {
    today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Karachi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    minDate = "";

    const successInvoices = invoices;

    if (successInvoices.length > 0) {
      const lastInvoice = successInvoices.reduce((latest, inv) => {
        const invDate = new Date(inv.invoice_date);
        return invDate > new Date(latest.invoice_date) ? inv : latest;
      }, successInvoices[0]);

      const d = new Date(lastInvoice.invoice_date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");

      minDate = `${year}-${month}-${day}`;
      console.log("minDate", minDate);
    } else {
      minDate = "";
      // console.log("else case minDate", minDate);
    }
  }

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch("/api/fbr/provinces", {
          headers: getFbrHeaders(),
        });
        const json = await res.json();
        setProvinces(json.data || []);
      } catch (err) {
        console.warn(err);
      }
    };

    fetchProvinces();
  }, []);

  const fetchSalesTaxRate = async (
    index,
    provinceOverride,
    rowOverride,
    dateOverride,
  ) => {
    const date = dateOverride ?? invoiceForm.date;
    const row = rowOverride ?? rows[index];
    const transTypeId = row?.TransactionTypeId;

    // Resolve province
    const provCandidate = provinceOverride ?? invoiceForm.sellerProvinceId;
    console.log(
      `rate -> province: ${provCandidate} , transaction type: ${transTypeId}`,
    );
    if (!date || !transTypeId || !provCandidate) return;

    const cacheKey = `${date}-${transTypeId}-${provCandidate}`;

    try {
      let rates;
      if (apiCache.current.rates[cacheKey]) {
        rates = apiCache.current.rates[cacheKey];
      } else {
        const apiUrl = `/api/fbr/rate?date=${date}&transTypeId=${transTypeId}&provinceCode=${provCandidate}`;
        const response = await fetch(apiUrl, { headers: getFbrHeaders() });
        if (!response.ok) throw new Error("API Error");
        const json = await response.json();
        rates = Array.isArray(json.data) ? json.data : [];
        apiCache.current.rates[cacheKey] = rates; // Save to cache
      }

      if (rates.length > 0) {
        const existingRate = rates.find(
          (r) => String(r.ratE_ID) === String(row.rateId),
        );
        const r = existingRate || rates[0]; // Default to first rate
        setRows((prev) =>
          prev.map((item, i) =>
            i === index
              ? {
                  ...item,
                  rateOptions: rates,
                  rate: String(r.ratE_VALUE ?? r.ratE_ID ?? ""),
                  rateId: r.ratE_ID ?? 0,
                  rateDesc: r.ratE_DESC ?? "",
                }
              : item,
          ),
        );

        fetchSroScheduleOptions(
          index,
          { ...row, rateId: r.ratE_ID },
          date,
          provCandidate,
        );
      }
    } catch (err) {
      console.error("Rate fetch failed", err);
    }
  };

  useEffect(() => {
    // Re-fetch rates for all rows when date or seller province id changes
    // NOTE: intentionally do NOT depend on rows.length so adding a new row doesn't trigger re-fetch for existing rows.
    if (!invoiceForm.date || !invoiceForm.sellerProvinceId) {
      // console.log("Date or seller province id missing, skipping rate fetch", invoiceForm.date, invoiceForm.sellerProvinceId);
      return;
    }
    rows.forEach((r, idx) => {
      if (r && (r.TransactionTypeId || r.TransactionType))
        fetchSalesTaxRate(idx);
    });
  }, [invoiceForm.date, invoiceForm.sellerProvinceId]);

  const fetchSroScheduleOptions = async (
    index,
    rowOverride,
    dateOverride,
    provinceOverride,
  ) => {
    const row = rowOverride ?? rows[index];
    const date = dateOverride ?? invoiceForm.date;
    const rateId = row?.rateId;
    const provCode = provinceOverride ?? invoiceForm.sellerProvinceId;

    if (!date || !rateId || !provCode) return;

    const cacheKey = `${date}-${rateId}-${provCode}`;

    try {
      let opts;
      if (apiCache.current.sros[cacheKey]) {
        opts = apiCache.current.sros[cacheKey];
      } else {
        const response = await fetch(
          `/api/fbr/sroScheduleNo?rateId=${rateId}&date=${date}&provinceCode=${provCode}`,
          { headers: getFbrHeaders() },
        );
        const json = await response.json();
        console.log("sro ", json);
        opts = Array.isArray(json.data) ? json.data : [];
        apiCache.current.sros[cacheKey] = opts;
      }

      if (opts.length > 0) {
        const existingSro = opts.find(
          (o) =>
            String(o.sro_id ?? o.srO_ID ?? o.id) === String(row.sroScheduleId),
        );
        const o = existingSro || opts[0];
        console.log(o);
        const sroId = o.sro_id ?? o.srO_ID ?? o.id;

        setRows((prev) =>
          prev.map((item, i) =>
            i === index
              ? {
                  ...item,
                  sroOptions: opts,
                  sroScheduleNo: String(o.srO_DESC || ""),
                  sroScheduleId: String(sroId),
                }
              : item,
          ),
        );

        // CASCADE: Call Item fetch immediately
        fetchSroItemOptions(index, { ...row, sroScheduleId: sroId }, date);
      }
    } catch (err) {
      console.error("SRO fetch failed", err);
    }
  };

  const fetchSroItemOptions = async (index, rowOverride, dateOverride) => {
    const date = dateOverride ?? invoiceForm.date;
    const rowId = rowOverride?.rowId ?? rows[index]?.rowId ?? genRowId();
    const sroId =
      rowOverride?.sroScheduleId ?? rows[index]?.sroScheduleId ?? "";

    if (!date || !sroId) {
      // console.warn('Missing date or sroId for SRO items fetch');
      setRowFieldsById(rowId, {
        sroItemOptions: [],
        sroItemId: "",
        sroItemSerialNo: "",
      });
      return;
    }

    const formattedDate = new Date(date)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/ /g, "-");

    try {
      const apiUrl = `/api/fbr/sroItem?sroId=${sroId}&date=${date}`;
      const response = await fetch(apiUrl, { headers: getFbrHeaders() });
      if (!response.ok)
        throw new Error(`SRO Item API error: ${response.status}`);

      const json = await response.json();
      const opts = Array.isArray(json.data) ? json.data : [];

      setRowFieldsById(rowId, { sroItemOptions: opts });

      if (opts.length === 0) {
        setRowFieldsById(rowId, {
          sroItemOptions: [],
          sroItemId: "",
          sroItemSerialNo: "",
        });
      } else if (opts.length === 1) {
        const o = opts[0];
        const idVal = o.srO_ITEM_ID ?? o.id ?? null;
        const serial = o.srO_ITEM_DESC ?? String(o);
        setRowFieldsById(rowId, {
          sroItemOptions: opts,
          sroItemId: String(idVal),
          sroItemSerialNo: String(serial),
        });
      } else {
        const existing =
          rowOverride?.sroItemId ??
          rows[index]?.sroItemId ??
          rows[index]?.sroItemSerialNo;
        const found = opts.find(
          (o) =>
            String(o.srO_ITEM_ID ?? o.id) === String(existing) ||
            String(o.srO_ITEM_DESC) === String(existing),
        );
        if (found) {
          const idVal = found.srO_ITEM_ID ?? found.id;
          setRowFieldsById(rowId, {
            sroItemId: String(idVal),
            sroItemSerialNo: found.srO_ITEM_DESC ?? String(found),
          });
        } else {
          setRowFieldsById(rowId, { sroItemId: "", sroItemSerialNo: "" });
        }
      }
    } catch (err) {
      console.warn("Failed to fetch SRO items:", err);
      setRowFieldsById(rowId, { sroItemOptions: [] });
    }
  };
  const postInvoiceToFBR = async (invoiceId) => {
    console.log("Posting invoice to FBR:", invoiceId);
    if (!window.confirm("Post this invoice to FBR?")) return;

    setProcessingInvoiceId(invoiceId);

    try {
      const invoice = invoices.find((inv) => inv.id === invoiceId);
      if (!invoice) throw new Error("Invoice not found");

      let items = [];
      // let buyerRegistrationType = "unregistered";
      try {
        items = invoice.items || [];
      } catch {
        throw new Error("Invalid invoice items JSON");
      }
      console.log("Invoice items:", items);
      const value = document.cookie
        .split("; ")
        .find((row) => row.startsWith("isProd="))
        ?.split("=")[1];
      // console.log("isProd flag from cookies:", value, typeof value);

      const isProd = value === "1";
      // console.log("isProd flag after normalize:", isProd, typeof isProd);
      const payload = getFbrPayload(
        invoice,
        items,
        isProd,
        customers,
        formatDateForInput,
      );

      console.log("FINAL FBR PAYLOAD", payload);
      const payloadWithIds = {
        ...payload,
        userId: sessionStorage.getItem("userId"),
        invoiceId: invoiceId,
      };
      const res = await fetch("/api/fbr/postInvoiceToFBR", {
        method: "POST",
        headers: {
          ...getFbrHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payloadWithIds),
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        console.warn("FBR ERROR:", data);
        throw new Error(data?.message || "FBR rejected invoice");
      }
      console.log("FBR RESPONSE:", data);
      const message =
        data?.fbrResponse?.validationResponse?.invoiceStatuses?.[0]?.error ||
        data?.fbrResponse?.validationResponse?.error;
      if (message !== undefined && message !== null && message !== "") {
        alert(`Invoice result: ${message}`);
      }
    } catch (err) {
      // console.warn("Error posting invoice to FBR:", err.message);
    } finally {
      setProcessingInvoiceId(null);
      fetchInvoices();
      console.log("min date from use post invocie to fbr");
      getMinDate();
    }
  };

  const deleteInvoice = async (invoiceId) => {
    if (!confirm("Delete this invoice? This action is permanent.")) return;
    setProcessingInvoiceId(invoiceId);
    try {
      const res = await fetch(`/api/invoices-crud?invoiceId=${invoiceId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.warn("Failed to delete invoice:", data);
        return;
      }
      fetchInvoices();
      //console.log("min date from delete invoice");
      getMinDate();
    } catch (err) {
      console.warn("Error deleting invoice:", err);
    } finally {
      setProcessingInvoiceId(null);
    }
  };
  const handleErrorClick = async (invoiceId) => {
    setIsLoadingError(invoiceId);
    try {
      // Replace with your actual API endpoint
      const response = await fetch(`/api/invoices-error?id=${invoiceId}`);
      const data = await response.json();

      const rawData = data.errorData;

      const parsed =
        typeof rawData === "string" ? JSON.parse(rawData) : rawData;

      //  console.log("Parsed error data:", parsed);
      setSelectedError(parsed);
    } catch (e) {
      console.error("Fetch error:", e);
      alert("Failed to load error details.");
    } finally {
      setIsLoadingError(null);
    }
  };
  const getStatusBadge = (status, invId) => {
    const map = {
      Failed:
        "bg-red-100 text-red-700 cursor-pointer hover:bg-red-200 border border-red-300",
      Pending: "bg-yellow-100 text-yellow-700",
      Validated: "bg-indigo-100 text-indigo-700",
      Success: "bg-green-100 text-green-700",
      Processing: "bg-blue-100 text-blue-700",
    };

    return (
      <span
        onClick={() => (status === "Failed" ? handleErrorClick(invId) : null)}
        className={`px-3 py-1 rounded-full text-xs font-semibold relative ${map[status]}`}
      >
        {status}
        {/* Small loading spinner inside badge if clicking */}
        {isLoadingError === invId && status === "Failed" && (
          <span className="ml-2 animate-spin inline-block">...</span>
        )}
      </span>
    );
  };

  const handleViewInvoice = (inv) => {
    try {
      const customerDisplay = inv.customer_name
        ? `${inv.customer_name} - ${inv.ntn || ""}`
        : "";

      const matchedScenario = scenarioCodes.find(
        (s) =>
          s.code === inv.scenario_code ||
          s.id === inv.scenario_code ||
          s.id === inv.scenario_code_id,
      );
      const scenarioDisplay = matchedScenario
        ? `${matchedScenario.code} - ${matchedScenario.description}`
        : inv.scenario_code || "";

      // Resolve any stored province code/label to the province description used by the select
      const resolveProvinceDesc = (val) => {
        if (val === undefined || val === null || val === "") return "";
        const vStr = String(val).trim();
        const matched = provinces.find(
          (p) =>
            String(p.stateProvinceCode) === vStr ||
            String(p.id) === vStr ||
            (p.stateProvinceDesc || "").trim() === vStr,
        );
        return matched
          ? matched.stateProvinceDesc
          : typeof val === "string"
            ? val
            : "";
      };
      // console.log("view inv", inv.scenario_code);
      const currentScenario = inv.scenario_code;
      // console.log("status", inv.status);
      // console.log("no", inv.challanNo);
      // console.log("date", inv.challanDate);
      // console.log("posted", inv.posted);

      const rawItems = inv.items
        ? typeof inv.items === "string"
          ? JSON.parse(inv.items)
          : inv.items
        : [];
      const itemsArray = Array.isArray(rawItems) ? rawItems : [];

      // Now .reduce() will work because itemsArray is guaranteed to be an Array
      const totalQty = itemsArray.reduce(
        (sum, r) => sum + Number(r.qty || 0),
        0,
      );
      const totalExclTax = itemsArray.reduce(
        (sum, r) => sum + Number(r.valueSalesExcludingST || 0),
        0,
      );
      const totalTax = itemsArray.reduce(
        (sum, r) => sum + Number(r.salesTaxApplicable || 0),
        0,
      );
      const totalFurther = itemsArray.reduce(
        (sum, r) => sum + Number(r.furtherTax || 0),
        0,
      );
      const totalExtra = itemsArray.reduce(
        (sum, r) => sum + Number(r.extraTax || 0),
        0,
      );
      const totalWithheld = itemsArray.reduce(
        (sum, r) => sum + Number(r.salesTaxWithheldAtSource || 0),
        0,
      );
      const totalFed = itemsArray.reduce(
        (sum, r) => sum + Number(r.fedPayable || 0),
        0,
      );
      const totalInclTax = itemsArray.reduce(
        (sum, r) => sum + Number(r.totalValues || 0),
        0,
      );
      const rate236HValue = Number(inv.tax236H || 0);
      let total236HAmt = 0;
      // itemsArray.forEach((item) => {
      //   const exclVal = Number(item.valueSalesExcludingST || 0);
      //   total236HAmt += (exclVal * rate236HValue) / 100;
      // });
      total236HAmt += (totalInclTax * rate236HValue) / 100;
      const calculatedGrandTotal = totalInclTax + total236HAmt;
      inv.exclTax = totalExclTax.toFixed(4);
      inv.tax = totalTax.toFixed(4);
      inv.inclTax = totalInclTax.toFixed(4);
      console.log("inv:", inv);

      const defaultBiz = userBusinesses.length > 0 ? userBusinesses[0] : null;

      setInvoiceForm((prev) => ({
        ...prev,
        invoiceNo: inv.invoice_no || "",
        internal_inv_ref_no: inv.internal_inv_ref_no || "",
        date: formatDateForInput(inv.invoice_date) || "",
        customer: customerDisplay || prev.customer,
        customerId: inv.customer_id || prev.customerId,
        //scenarioCode: inv.scenario_code,
        scenarioCode: currentScenario,
        scenarioCodeId: inv.scenarioCodeId,
        buyerProvince: resolveProvinceDesc(
          inv.buyerProvince ?? inv.province ?? "",
        ),
        sellerProvince: inv.sellerProvince ?? "",
        sellerProvinceId: inv.sellerProvinceId,
        sellerBusinessId: inv.sellerBusinessId || defaultBiz?.id || null,
        sellerBusinessName:
          inv.sellerBusinessName || defaultBiz?.business_name || "",
        sellerAddress: defaultBiz ? defaultBiz.address : "",
        saleType: inv.saleType,
        //registrationNo: inv.registrationNo || prev.registrationNo,
        buyerType: inv.buyerType,
        // Ensure FBR reference is loaded from whichever column name is present
        fbrInvoiceRefNo: inv.fbrInvoiceRefNo ?? "",
        status: inv.status || "",
        challan_date: formatDateForInput(inv.challanDate) || "",
        challanDateLabel: inv.challanDateLabel || "",
        challanNo: inv.challanNo || "",
        challanNoLabel: inv.challanNoLabel || "",
        totalProducts: itemsArray.length,
        totalQty: totalQty.toFixed(4),
        exclTax: totalExclTax.toFixed(4),
        tax: totalTax.toFixed(4),
        tax236H: inv.tax236H || "0.00",
        totalFurtherTax: totalFurther.toFixed(4),
        totalExtraTax: totalExtra.toFixed(4),
        totalSalesTaxWithheld: totalWithheld.toFixed(4),
        totalFedPayable: totalFed.toFixed(4),
        inclTax: totalInclTax.toFixed(4),
        total236HTax: total236HAmt.toFixed(4),
        grandTotal: calculatedGrandTotal.toFixed(4),
      }));

      setCustomerSearch(customerDisplay);
      setScenarioSearch(scenarioDisplay);

      try {
        const items = inv.items
          ? typeof inv.items === "string"
            ? JSON.parse(inv.items)
            : inv.items
          : [];

        // Ensure rate is preserved as string so inputs/selects show the stored value
        const sanitized =
          Array.isArray(items) && items.length
            ? items.map((r) => {
                // FIXED: Move matchedProduct inside the map so 'r' is defined
                const matchedProduct = allProducts.find(
                  (p) =>
                    // 1. Basic Identifiers
                    String(p.hsCode) === String(r.hsCode) &&
                    String(p.product_name).trim().toLowerCase() ===
                      String(r.description).trim().toLowerCase() &&
                    // 2. Transaction Type
                    Number(p.transactionTypeId) ===
                      Number(r.TransactionTypeId || r.transaction_type_id) &&
                    // 3. Tax Rate
                    Number(p.rateId) === Number(r.rateId || r.rate_id) &&
                    // 4. SRO Schedule
                    String(p.sroScheduleId) ===
                      String(r.sroScheduleId || r.sro_id || r.srO_ID || "") &&
                    // 5. SRO Item
                    String(p.sroItemId) ===
                      String(
                        r.sroItemId || r.srO_ITEM_ID || r.sro_item_id || "",
                      ),
                );
                console.log("matched product ", matchedProduct);
                return {
                  ...emptyRow,
                  ...r,
                  productId: matchedProduct?.id || null, // Links to your new searchable dropdown
                  rowId: r.rowId ?? genRowId(),
                  rate:
                    r.rate === undefined || r.rate === null
                      ? ""
                      : String(r.rate),
                  rateId: r.rateId ?? r.rate_id ?? 0,
                  rateDesc: r.rateDesc ?? r.rate_desc ?? "",
                  salesTaxApplicable: r.salesTaxApplicable ?? 0,
                  TransactionTypeId:
                    r.TransactionTypeId ?? r.TransactionTypeId ?? 0,
                  TransactionType: r.TransactionType ?? r.TransactionType ?? "",
                  sroOptions: r.sroOptions ?? [],
                  sroScheduleId: String(
                    r.sroScheduleId ?? r.sro_id ?? r.srO_ID ?? "",
                  ),
                  sroScheduleNo: String(r.sroScheduleNo ?? ""),
                  sroItemOptions: r.sroItemOptions ?? [],
                  sroItemId: String(
                    r.sroItemId ?? r.srO_ITEM_ID ?? r.sro_item_id ?? "",
                  ),
                  sroItemSerialNo:
                    r.sroItemSerialNo ?? r.sro_item_serial_no ?? "",
                  rateOptions: r.rateOptions ?? [],
                };
              })
            : [{ ...emptyRow, rowId: genRowId() }];
        // ensure existing sanitized rows include a stable rowId
        const enriched = sanitized.map((s) => ({
          ...s,
          rowId: s.rowId ?? genRowId(),
          scenarioCode: currentScenario,
        }));
        setRows(enriched);

        // Proactively fetch rate options and SRO options using the sanitized rows so edit mode displays
        // the appropriate selects/values immediately.
        const sellerProvDesc = resolveProvinceDesc(inv.sellerProvince ?? "");
        const invDateStr = formatDateForInput(inv.invoice_date) || "";

        setTimeout(() => {
          sanitized.forEach((r, idx) => {
            if (r.TransactionType || r.TransactionTypeId) {
              fetchSalesTaxRate(
                idx,
                inv.sellerProvinceId ?? inv.sellerProvince ?? undefined,
                r,
                invDateStr,
              ).catch((err) => console.warn("fetchSalesTaxRate error", err));
            }

            // If we already have SRO IDs in edit mode, avoid making extra API calls — just populate option arrays so selects render the stored values
            if (r.rate || r.rateId) {
              if (r.sroScheduleId) {
                // ensure there's at least one option so the select can show the value without calling API
                if (!r.sroOptions || r.sroOptions.length === 0) {
                  const opt = {
                    sroScheduleNo: r.sroScheduleNo ?? String(r.sroScheduleId),
                    sro_id: r.sroScheduleId,
                  };
                  setRowFieldsById(r.rowId, { sroOptions: [opt] });
                }
              } else {
                // only fetch schedules if we don't already have an id/option
                fetchSroScheduleOptions(
                  idx,
                  r,
                  invDateStr,
                  inv.sellerProvinceId ?? inv.sellerProvince ?? undefined,
                ).catch((err) =>
                  console.warn("fetchSroScheduleOptions error", err),
                );
              }

              // For SRO items: prefer existing options/ids, otherwise fetch
              if (r.sroScheduleId) {
                if (
                  r.sroItemId &&
                  (!r.sroItemOptions || r.sroItemOptions.length === 0) &&
                  r.sroItemSerialNo
                ) {
                  setRowFieldsById(r.rowId, {
                    sroItemOptions: [
                      {
                        srO_ITEM_ID: r.sroItemId,
                        srO_ITEM_DESC: r.sroItemSerialNo,
                      },
                    ],
                    sroItemId: String(r.sroItemId),
                    sroItemSerialNo: r.sroItemSerialNo,
                  });
                } else if (!r.sroItemOptions || r.sroItemOptions.length === 0) {
                  fetchSroItemOptions(idx, r, invDateStr).catch((err) =>
                    console.warn("fetchSroItemOptions error", err),
                  );
                }
              }
            }
          });
        }, 0);
      } catch (e) {
        setRows([{ ...emptyRow, rowId: genRowId() }]);
      }

      setShowForm(true);
      if (permissions.can_edit_invoice === 1) {
        setIsEditMode(true);
      } else {
        setIsEditMode(false);
      }

      setEditingInvoiceId(inv.id);
      setIsReadOnly(
        inv.status === "Success" || permissions.can_edit_invoice === 0,
      );
    } catch (err) {
      console.warn("Error opening invoice from row:", err);
    }
  };

  const exportToExcel = () => {
    if (rows.length === 0) return;

    const data = rows.map((r) => ({
      "Invoice No": r.invoiceNo,
      Date: r.date,
      "Customer Type": r.customerType,
      "Customer Name": r.customerName,
      "CNIC / NTN": r.customerCnicNtn,
      "Scenario Code": r.scenarioCode,
      "FBR INV No": r.fbrInvNo,
      Amount: r.amount,
      "Sales Tax": r.salesTax,
      Total: r.total,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoices");

    ws["!cols"] = [
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
      { wch: 22 },
      { wch: 16 },
      { wch: 14 },
      { wch: 14 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
    ];

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), "Invoices.xlsx");
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    // console.log("Form change:", name, value);

    if (name === "sellerProvince" || name === "sellerProvinceId") {
      // resolve province id and description when possible
      const v = String(value ?? "").trim();
      const matched = provinces.find(
        (p) =>
          String(p.stateProvinceCode) === v ||
          String(p.id) === v ||
          (p.stateProvinceDesc || "").trim().toLowerCase() === v.toLowerCase(),
      );
      const sellerProvDesc = matched
        ? matched.stateProvinceDesc
        : name === "sellerProvince"
          ? value
          : matched
            ? matched.stateProvinceDesc
            : "";
      const sellerProvId = matched
        ? Number(matched.stateProvinceCode ?? matched.id ?? 0)
        : isFinite(Number(value))
          ? Number(value)
          : 0;

      setInvoiceForm((prev) => ({
        ...prev,
        sellerProvince: sellerProvDesc,
        sellerProvinceId: sellerProvId,
      }));

      // re-fetch rates and SROs for all rows
      setTimeout(() => {
        rows.forEach((r, idx) => {
          if (r && (r.TransactionTypeId || r.TransactionType))
            fetchSalesTaxRate(idx);
          if (r && (r.rateId || r.rate)) fetchSroScheduleOptions(idx);
        });
      }, 0);
    }
    //else {
    //     // console.log("Form change:", name, value);
    //     setInvoiceForm(prev => ({ ...prev, [name]: value }));
    // }
    else {
      setInvoiceForm((prev) => {
        const updatedForm = { ...prev, [name]: value };

        // Clear FBR Invoice Ref No if saleType is changed away from "Debit Note"
        if (name === "saleType" && value !== "Debit Note") {
          updatedForm.fbrInvoiceRefNo = "";
        }
        if (name === "tax236H") {
          // Recalculate all rows with the new 236H rate and update totals
          setRows((prevRows) => {
            const updatedRows = prevRows.map((r) => calculateRow(r, value));
            updateInvoiceTotals(updatedRows);
            return updatedRows;
          });
        }

        return updatedForm;
      });
    }
  };

  const handleInvoiceSubmit = async (e, toValidate = false) => {
    console.log("Submitting invoice...");
    // e.preventDefault();
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    setIsSubmitting(true);
    const validateAllInternalValues = () => {
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const internalQty = parseFloat(r.internalQty || 0);
        const internalPrice = parseFloat(r.internalSinglePrice || 0);
        if (internalQty === 0 && internalPrice === 0) {
          continue;
        }
        const exclTax = parseFloat(r.valueSalesExcludingST || r.exclTax || 0);

        const calculatedTotal = internalPrice * internalQty;

        if (Math.abs(calculatedTotal - exclTax) > 0.01) {
          alert(
            `Validation Error at Row ${i + 1}:\n` +
              `Internal Total (${calculatedTotal.toFixed(4)}) does not match Excl. Tax (${exclTax.toFixed(4)})`,
          );
          return false;
        }
      }
      return true;
    };
    if (!validateAllInternalValues()) {
      setIsSubmitting(false);
      return;
    }
    const userId =
      Number(sessionStorage.getItem("parent_id")) ||
      Number(sessionStorage.getItem("userId"));
    let invoiceToSubmit = {
      userId: Number(userId),
      invoiceNo: invoiceForm.invoiceNo,
      internal_inv_ref_no: invoiceForm.internal_inv_ref_no,
      date: invoiceForm.date,
      customer: invoiceForm.customer,
      customerId: invoiceForm.customerId,
      buyerProvince: invoiceForm.buyerProvince,
      sellerBusinessId: invoiceForm.sellerBusinessId,
      sellerBusinessName: invoiceForm.sellerBusinessName,
      sellerProvince: invoiceForm.sellerProvince || "",
      sellerProvinceId: Number(invoiceForm.sellerProvinceId) || 0,
      sellerAddress: invoiceForm.sellerAddress || "",
      sellerNTNCNIC: sessionStorage.getItem("sellerNTNCNIC") || "",
      scenarioCode: invoiceForm.scenarioCode || "",
      scenarioCodeId: invoiceForm.scenarioCodeId || 0,
      saleType: invoiceForm.saleType,
      fbrInvoiceRefNo: invoiceForm.fbrInvoiceRefNo,
      //registrationNo: Number(invoiceForm.registrationNo),
      buyerType: invoiceForm.buyerType,
      challanNo: invoiceForm.challanNo,
      challanDate: invoiceForm.challan_date,
      exclTax: invoiceForm.exclTax || "0.0",
      tax: invoiceForm.tax || "0.0",
      inclTax: invoiceForm.inclTax || "0.0",
      tax236H: invoiceForm.tax236H || "0.0",
      grandTotal: invoiceForm.grandTotal || "0.0",
      items: rows.map((row) => ({
        hsCode: row.hsCode,
        description: row.description,
        productId: row.productId,
        product_description: row.product_description,
        singleUnitPrice: row.singleUnitPrice,
        qty: row.qty,
        // store rate as a string to preserve formats (e.g., '18%', 'RS-18', '18/SQ')
        rateId: Number(row.rateId) || 0,
        rate:
          row.rate === undefined || row.rate === null ? "" : String(row.rate),
        rateDesc: row.rateDesc,
        unit: row.unit,
        totalValues: row.totalValues,
        valueSalesExcludingST: row.valueSalesExcludingST,
        fixedNotifiedValueOrRetailPrice: row.fixedNotifiedValueOrRetailPrice,
        salesTaxApplicable: row.salesTaxApplicable,
        salesTaxWithheldAtSource: row.salesTaxWithheldAtSource,
        extraTax: row.extraTax,
        furtherTax: row.furtherTax,
        sroScheduleNo: row.sroScheduleNo,
        sroScheduleId: Number(row.sroScheduleId) || 0,
        // sroScheduleNoId: Number(row.sroScheduleNoId ?? row.sroScheduleId) || 0,
        fedPayable: row.fedPayable,
        discount: row.discount,
        TransactionTypeId: Number(row.TransactionTypeId) || 0,
        TransactionType: row.TransactionType,
        sroItemSerialNo: row.sroItemSerialNo,
        sroItemId: Number(row.sroItemId) || 0,
        internalQty: Number(row.internalQty) || 0,
        internalSinglePrice: Number(row.internalSinglePrice) || 0,
        internalUOM: row.internalUOM || "",
      })),
    };
    const value = document.cookie
      .split("; ")
      .find((row) => row.startsWith("isProd="))
      ?.split("=")[1];
    //   console.log("isProd flag from cookies:", value, typeof value);

    const isProd = value === "1";

    console.log("Invoice to Validate:", toValidate);
    console.log("Invoice to submit:", invoiceToSubmit);

    // console.log(sessionStorage.getItem("sellerProvince"));
    // console.log(sessionStorage.getItem("sellerBusinessName"));
    // console.log(sessionStorage.getItem("sellerNTNCNIC"));
    // console.log(sessionStorage.getItem("sellerAddress"));
    function isEmpty(value) {
      return value === null || value === undefined || value === "";
    }

    if (
      isEmpty(sessionStorage.getItem("sellerNTNCNIC")) ||
      userBusinesses.length === 0
    ) {
      alert("user info is missing, Please add info in Profile Screen");
      return;
    }

    try {
      // console.log("isEdit mode ", isEditMode, " editingInvoiceId ", editingInvoiceId);
      if (isEditMode && editingInvoiceId) {
        const res = await fetch("/api/invoices-crud", {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...getFbrHeaders() },
          body: JSON.stringify({
            invoiceId: editingInvoiceId,
            toValidate: toValidate,
            ...invoiceToSubmit,
          }),
        });

        const data = await res.json();
        //  alert(`${data.message}`);
        if (res.ok) {
          //setShowForm(false);
          //  setIsEditMode(false);
          console.log("ok");
          setHasChanged(false);
          setIsReadOnly(false);
          getMinDate();
          const newStatus = toValidate ? "Validated" : "Pending";
          setInvoiceForm((prev) => ({
            ...prev,
            status: newStatus,
          }));
          //    await fetchInvoices();
        } else {
          console.log("not ok");
          console.warn("Error updating invoice:", data);
          setInvoiceForm((prev) => ({
            ...prev,
            status: "Failed",
          }));
          //  await fetchInvoices();
        }
        //  console.log('status', invoiceForm.status);
      } else {
        const res = await fetch("/api/invoices-crud", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getFbrHeaders() },
          body: JSON.stringify(invoiceToSubmit),
        });

        const data = await res.json();
        // alert(`${data.message}`);
        if (res.ok) {
          setInvoiceForm({
            invoiceNo: "",
            date: "",
            customer: "",
            customerId: null,
            buyerProvince: "",
            sellerProvince: "",
            sellerProvinceId: 0,
            scenarioCode: "",
            scenarioCodeId: null,
            saleType: "",
            // registrationNo: "",
            buyerType: "",
            fbrInvoiceRefNo: "",
            exclTax: 0,
            tax: 0,
            inclTax: 0,
            tax236H: 0,
            grandTotal: 0,
            items: [
              {
                hsCode: "",
                description: "",
                singleUnitPrice: "",
                qty: "",
                rateId: 0,
                rate: "",
                rateDesc: "",
                unit: "",
                totalValues: "",
                valueSalesExcludingST: "",
                fixedNotifiedValueOrRetailPrice: "",
                salesTaxApplicable: "",
                salesTaxWithheldAtSource: "",
                extraTax: "",
                furtherTax: "",
                sroScheduleNo: "",
                sroScheduleId: "",
                sroOptions: [],
                sroItemOptions: [],
                sroItemSerialNo: "",
                sroItemId: "",
                fedPayable: "",
                discount: "",
                TransactionTypeId: 0,
                TransactionType: "",
                internalQty: 0,
                internalSinglePrice: 0,
                internalUOM: "",
              },
            ],
          });

          setRows([{ ...emptyRow, rowId: genRowId() }]);
          setCustomerSearch("");
          setScenarioSearch("");
          setShowForm(false);
          fetchInvoices();
          setHasChanged(false);
          //  console.log("min date from submit to DB");
          getMinDate();
        } else {
          console.warn("Error saving invoice:");
        }
      }
    } catch (err) {
      console.warn("Network error:", err);
    } finally {
      if (isConsultantMode) {
        sessionStorage.setItem(
          "userId",
          sessionStorage.getItem("consultantId"),
        );
        if (sessionStorage.getItem("parentConsultantId")) {
          sessionStorage.setItem(
            "parent_id",
            sessionStorage.getItem("parentConsultantId"),
          );
        }
        router.push("/consultant/invoices");
      }

      setIsSubmitting(false);
    }
  };

  const shouldShow = (fieldName, row = null, form = null) => {
    const f = fields.find((f) => f.name === fieldName);
    if (!f) return true;

    if (f.show === 1) return true;
    if (f.hide === 1) return false;
    if (f.show_if_value === 1) {
      switch (fieldName) {
        case "SRO Schedule No.":
          return !!row.sroScheduleNo;
        case "SRO Item Sr No.":
          return !!row.sroItemSerialNo;
        case "Internal UoM":
          return !!row.internalUOM;
        case "Internal Single Unit":
          return (
            !!row.internalSinglePrice && Number(row.internalSinglePrice) !== 0
          );
        case "Internal Qty":
          return !!row.internalQty && Number(row.internalQty) !== 0;
        case "Fixed Notified Value or Retail Price":
          return !!row.fixedNotifiedValueOrRetailPrice;
        case "Extra Tax":
          return !!row.extraTax && Number(row.extraTax) !== 0;
        case "Further Tax":
          return !!row.furtherTax && Number(row.furtherTax) !== 0;
        case "Federal Excise Duty":
          return !!row.fedPayable && Number(row.fedPayable) !== 0;
        case "Discount":
          return !!row.discount && Number(row.discount) !== 0;
        case "Sales Tax With-Held at SOURCE":
          return !!row.salesTaxWithheldAtSource;
        case "Seller Name":
          return sessionStorage.getItem("sellerBusinessName") || "";
        case "Seller Address":
          return sessionStorage.getItem("sellerAddress") || "";
        case "Seller NTN":
          return sessionStorage.getItem("sellerInvoiceNTN");
        case "Challan No":
          return form.challanNo || "";
        case "Challan Date":
          return form.challanDate || "";
        case "Invoice Print Date":
          return form.invoicePostDate || "";
        case "236H Tax":
          return !!row.tax236H && parseFloat(row.tax236H) !== 0.0;
        case "Grand Total":
          return !!row.grandTotal && parseFloat(row.grandTotal) !== 0.0;
        default:
          return true;
      }
    }
    return true;
  };

  const shouldShowHeader = (fieldName, activeRows) => {
    const f = fields.find((f) => f.name === fieldName);
    if (!f) return true;

    if (f.show === 1) return true;
    if (f.hide === 1) return false;
    if (f.show_if_value === 1) {
      return activeRows.find((row) => {
        switch (fieldName) {
          case "SRO Schedule No.":
            return !!row.sroScheduleNo;
          case "SRO Item Sr No.":
            return !!row.sroItemSerialNo;
          case "Internal UoM":
            return !!row.internalUOM;
          case "Internal Single Unit":
            return (
              !!row.internalSinglePrice && Number(row.internalSinglePrice) !== 0
            );
          case "Internal Qty":
            return !!row.internalQty && Number(row.internalQty) !== 0;
          case "Fixed Notified Value or Retail Price":
            return (
              !!row.fixedNotifiedValueOrRetailPrice &&
              Number(row.fixedNotifiedValueOrRetailPrice) !== 0
            );
          case "Extra Tax":
            return !!row.extraTax && Number(row.extraTax) !== 0;
          case "Further Tax":
            return !!row.furtherTax && Number(row.furtherTax) !== 0;
          case "Federal Excise Duty":
            return !!row.fedPayable && Number(row.fedPayable) !== 0;
          case "Discount":
            return !!row.discount && Number(row.discount) !== 0;
          case "Sales Tax With-Held at SOURCE":
            return (
              !!row.salesTaxWithheldAtSource &&
              Number(row.salesTaxWithheldAtSource) !== 0
            );
          case "236H Tax":
            return !!row.tax236H && parseFloat(row.tax236H) !== 0.0;
          case "Grand Total":
            return !!row.grandTotal && parseFloat(row.grandTotal) !== 0.0;
          default:
            return false;
        }
      });
    }

    return true;
  };

  const printInvoice = async (targetInvoice) => {
    try {
      await handlePrintInvoice(
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
      );
    } catch (err) {
      console.warn("Print failed:", err);
      alert("Failed to generate print view.\nUse Ctrl+P to print manually.");
    }
  };

  const formatNumber = (num, fractionDigits = 0) => {
    return Number(num).toLocaleString("en-US", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
  };
  const handleInputChange = useCallback(
    (index, name, value) => {
      setRows((prevRows) => {
        const newRows = [...prevRows];
        const row = { ...newRows[index], [name]: value };

        const fourDecimalFields = [
          "singleUnitPrice",
          "qty",
          "fixedNotifiedValueOrRetailPrice",
          "discount",
          "internalQty",
          "internalSinglePrice",
        ];
        const twoDecimalFields = [
          "salesTaxWithheldAtSource",
          "extraTax",
          "furtherTax",
          "fedPayable",
        ];

        // Decimal validation
        if (fourDecimalFields.includes(name)) {
          const decimalMatch = String(value).match(/\.(\d*)/);
          if (decimalMatch && decimalMatch[1].length > 4) {
            value = value.slice(0, value.indexOf(".") + 5);
          }
          row[name] = String(value)
            .replace(/[^0-9.]/g, "")
            .replace(/(\..*?)\./g, "$1");
        } else if (twoDecimalFields.includes(name)) {
          const decimalMatch = String(value).match(/\.(\d*)/);
          if (decimalMatch && decimalMatch[1].length > 2) {
            value = value.slice(0, value.indexOf(".") + 3);
          }
          row[name] = String(value)
            .replace(/[^0-9.]/g, "")
            .replace(/(\..*?)\./g, "$1");
        }

        const productFieldsToDecouple = [
          "singleUnitPrice",
          "fixedNotifiedValueOrRetailPrice",
          "salesTaxWithheldAtSource",
          "extraTax",
          "furtherTax",
          "fedPayable",
          "internalSinglePrice",
          "internalUOM",
          "TransactionType",
          "TransactionTypeId",
          "rateId",
          "rate",
          "sroScheduleId",
          "sroScheduleNo",
          "sroItemId",
          "sroItemSerialNo",
          "hsCode",
          "unit",
        ];

        if (
          productFieldsToDecouple.includes(name) &&
          newRows[index].productId
        ) {
          let isChanged = false;
          const oldValue = newRows[index][name]; // Get the old value before change

          const numericFields = [
            "singleUnitPrice",
            "fixedNotifiedValueOrRetailPrice",
            "salesTaxWithheldAtSource",
            "extraTax",
            "furtherTax",
            "fedPayable",
            "internalSinglePrice",
          ];

          // Mathematically compare numbers (so 150 === 150.0000 doesn't trigger a wipe)
          if (numericFields.includes(name)) {
            if (Number(oldValue || 0) !== Number(value || 0)) {
              isChanged = true;
            }
          } else {
            if (String(oldValue || "").trim() !== String(value || "").trim()) {
              isChanged = true;
            }
          }

          // if (isChanged) {
          //   row.productId = null;
          //   row.product_description = "";
          // }
        }
        // HS Code
        if (name === "hsCode") {
          const hs = hsCodes.find((h) => h.hS_CODE === value);
          row.description = hs ? hs.description : "";
        }

        // TransactionType
        if (name === "TransactionType" || name === "TransactionTypeId") {
          const valStr = String(value).trim().toLowerCase();
          let found = null;
          if (name === "TransactionTypeId") {
            found = transTypeList.find(
              (t) => String(t.transactioN_TYPE_ID) === valStr,
            );
          } else {
            found = transTypeList.find(
              (t) =>
                String(t.transactioN_TYPE_ID) === valStr ||
                (t.transactioN_DESC || "").trim().toLowerCase() === valStr,
            );
          }
          if (found) {
            row.TransactionTypeId = found.transactioN_TYPE_ID;
            row.TransactionType = found.transactioN_DESC;
          } else {
            if (name === "TransactionTypeId")
              row.TransactionTypeId = Number(value) || 0;
            else row.TransactionType = value;
          }

          // async fetch tax rates
          setTimeout(
            () => fetchSalesTaxRate(index, invoiceForm.sellerProvinceId, row),
            0,
          );
        }

        const templateFields = [
          "rateId",
          "rate",
          "sroScheduleId",
          "sroScheduleNo",
          "sroItemId",
          "sroItemSerialNo",
        ];
        if (templateFields.includes(name) && row.productId) {
          row.productId = null; // Decouple from Product Master
        }
        // Rate
        if (name === "rate" || name === "rateId") {
          const opts = row.rateOptions ?? [];
          let found = null;
          if (name === "rateId") {
            found = opts.find(
              (o) =>
                String(o.ratE_ID) === String(value) ||
                String(o.ratE_VALUE) === String(value),
            );
          } else {
            found = opts.find(
              (o) =>
                String(o.ratE_VALUE) === String(value) ||
                String(o.ratE_ID) === String(value) ||
                String(o.ratE_DESC) === String(value),
            );
          }
          if (found) {
            row.rateId = found.ratE_ID;
            row.rate = String(
              found.ratE_VALUE ?? found.ratE_ID ?? found.ratE_DESC,
            );
            row.rateDesc = found.ratE_DESC ?? "";
          } else {
            if (name === "rateId") row.rateId = Number(value) || 0;
            else row.rate = value;
          }

          // clear dependent SRO selection
          row.sroOptions = [];
          row.sroScheduleNo = "";
          row.sroScheduleId = "";
          row.sroItemOptions = [];
          row.sroItemId = "";
          row.sroItemSerialNo = "";
          // row.productId = null;
          // row.product_description = "";

          // async fetch SRO schedules
          setTimeout(
            () =>
              fetchSroScheduleOptions(
                index,
                row,
                undefined,
                invoiceForm.sellerProvinceId ??
                  invoiceForm.sellerProvince ??
                  undefined,
              ),
            0,
          );
        }

        // SRO Schedule
        if (name === "sroScheduleNo" || name === "sroScheduleId") {
          const opts = row.sroOptions ?? [];
          let found = null;
          if (name === "sroScheduleId") {
            found = opts.find(
              (o) => String(o.sro_id ?? o.srO_ID ?? o.id) === String(value),
            );
          } else {
            found = opts.find(
              (o) =>
                String(o.sroScheduleNo ?? o.sro_id ?? o.id) === String(value) ||
                String(o.srO_DESC ?? "").trim() === String(value).trim(),
            );
          }

          if (found) {
            const idStr = String(
              found.sro_id ?? found.srO_ID ?? found.id ?? "",
            );
            row.sroScheduleId = idStr;
            row.sroScheduleNoId = idStr;
            row.sroScheduleNo = found.sroScheduleNo ?? found.srO_DESC ?? idStr;
          } else {
            if (name === "sroScheduleId") {
              row.sroScheduleId = String(value);
              //  row.sroScheduleNoId = String(value);
            }
            if (name === "sroScheduleNo") row.sroScheduleNo = value;
          }

          // clear dependent items
          row.sroItemOptions = [];
          row.sroItemId = "";
          row.sroItemSerialNo = "";
          // row.productId = null;
          // row.product_description = "";

          // async fetch SRO items
          setTimeout(() => fetchSroItemOptions(index, row, undefined), 0);
        }

        // SRO Item
        if (name === "sroItemId" || name === "sroItemSerialNo") {
          const opts = row.sroItemOptions ?? [];
          let found = null;
          if (name === "sroItemId")
            found = opts.find(
              (o) => String(o.srO_ITEM_ID ?? o.id) === String(value),
            );
          else
            found = opts.find(
              (o) =>
                String(o.srO_ITEM_DESC ?? "").trim() === String(value).trim(),
            );

          if (found) {
            row.sroItemId = Number(found.srO_ITEM_ID ?? found.id) || 0;
            row.sroItemSerialNo = found.srO_ITEM_DESC ?? "";
          } else {
            if (name === "sroItemId") row.sroItemId = Number(value) || 0;
            if (name === "sroItemSerialNo") row.sroItemSerialNo = value;
          }
          row.productId = null;
          row.product_description = "";
        }

        // Recalculate row values
        newRows[index] = calculateRow(row, invoiceForm.tax236H);

        // Recalculate totals (delegates to shared helper so 236H is always included)
        updateInvoiceTotals(newRows);

        return newRows;
      });
    },
    [invoiceForm],
  );

  const addRow = () => {
    const newRow = { ...emptyRow, rowId: genRowId() };
    if (invoiceForm.scenarioCode) {
      const mapping = scenarioCodeToTransactionType.find(
        (m) =>
          String(m.scenario_code).trim().toUpperCase() ===
          String(invoiceForm.scenarioCode).trim().toUpperCase(),
      );
      if (mapping) {
        const targetDesc = mapping.transaction_desc;
        const targetId = transTypeList.find(
          (t) => t.transactioN_DESC === targetDesc,
        )?.transactioN_TYPE_ID;
        newRow.TransactionType = targetDesc;
        newRow.TransactionTypeId = targetId || 0;
      }
    }
    const newIndex = rows.length;
    setRows((prev) => [...prev, newRow]);
    // Trigger fetch for the new row
    setTimeout(() => fetchSalesTaxRate(newIndex, undefined, newRow), 0);
  };
  const removeRow = (index) => setRows(rows.filter((_, i) => i !== index));

  getMinDate();

  const formatDateForInput = (value) => {
    if (!value) return "";

    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    const d = new Date(value);
    if (isNaN(d)) return "";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const validateInvoiceDirectly = async (inv) => {
    setProcessingInvoiceId(inv.id);
    try {
      const userId = sessionStorage.getItem("userId");

      // Ensure items are parsed from string to Array to match form behavior
      let itemsArray = [];
      try {
        itemsArray =
          typeof inv.items === "string"
            ? JSON.parse(inv.items)
            : inv.items || [];
      } catch (e) {
        console.error("Item parsing failed", e);
      }

      // Exact structure of invoiceToSubmit as per your reference
      const invoiceToSubmit = {
        userId: Number(userId),
        invoiceNo: inv.invoice_no,
        date: formatDateForInput(inv.invoice_date),
        customer: inv.customer_name,
        customerId: inv.customer_id,
        buyerProvince: inv.buyerProvince,
        sellerProvince:
          inv.sellerProvince || sessionStorage.getItem("sellerProvince") || "",
        sellerProvinceId:
          Number(inv.sellerProvinceId) ||
          Number(sessionStorage.getItem("sellerProvinceId") || 0),
        sellerBusinessName: sessionStorage.getItem("sellerBusinessName") || "",
        sellerNTNCNIC: sessionStorage.getItem("sellerNTNCNIC") || "",
        sellerAddress: sessionStorage.getItem("sellerAddress") || "",
        scenarioCode: inv.scenario_code,
        scenarioCodeId: inv.scenario_code_id,
        saleType: inv.saleType,
        fbrInvoiceRefNo: inv.fbrInvoiceRefNo,
        buyerType: inv.buyerType,
        internal_inv_ref_no: inv.internal_inv_ref_no,
        items: itemsArray.map((row) => ({
          hsCode: row.hsCode,
          description: row.description,
          singleUnitPrice: row.singleUnitPrice,
          qty: row.qty,
          rateId: Number(row.rateId) || 0,
          rate:
            row.rate === undefined || row.rate === null ? "" : String(row.rate),
          rateDesc: row.rateDesc,
          unit: row.unit,
          totalValues: row.totalValues,
          valueSalesExcludingST: row.valueSalesExcludingST,
          fixedNotifiedValueOrRetailPrice: row.fixedNotifiedValueOrRetailPrice,
          salesTaxApplicable: row.salesTaxApplicable,
          salesTaxWithheldAtSource: row.salesTaxWithheldAtSource,
          extraTax: row.extraTax,
          furtherTax: row.furtherTax,
          sroScheduleNo: row.sroScheduleNo,
          sroScheduleId: Number(row.sroScheduleId) || 0,
          sroScheduleNoId:
            Number(row.sroScheduleNoId ?? row.sroScheduleId) || 0,
          fedPayable: row.fedPayable,
          discount: row.discount,
          TransactionTypeId: Number(row.TransactionTypeId) || 0,
          TransactionType: row.TransactionType,
          sroItemSerialNo: row.sroItemSerialNo,
          sroItemId: Number(row.sroItemId) || 0,
        })),
      };

      // Exact body structure and order
      const res = await fetch("/api/invoices-crud", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getFbrHeaders() },
        body: JSON.stringify({
          invoiceId: inv.id, // Equivalent to editingInvoiceId
          toValidate: true, // Equivalent to toValidate
          ...invoiceToSubmit, // Spread the object
        }),
      });

      const data = await res.json();
      // alert(`${data.message}`);
      fetchInvoices();
    } catch (err) {
      console.warn("Direct validation error:", err);
    } finally {
      setProcessingInvoiceId(null);
    }
  };

  const handleBusinessChange = (e) => {
    const bizId = e.target.value;
    const selectedBiz = userBusinesses.find(
      (b) => b.id.toString() === bizId.toString(),
    );

    if (selectedBiz) {
      // Find the province object to get the description (e.g., "Punjab")
      const provinceObj = provinces.find(
        (p) => p.stateProvinceCode === selectedBiz.province_id,
      );
      console.log(
        "busines",
        selectedBiz.business_name,
        "province",
        provinceObj?.stateProvinceDesc,
        "address",
        selectedBiz.address,
      );
      setInvoiceForm((prev) => ({
        ...prev,
        sellerBusinessId: bizId,
        sellerBusinessName: selectedBiz.business_name,
        sellerProvinceId: selectedBiz.province_id,
        sellerProvince: provinceObj?.stateProvinceDesc || "",
        sellerAddress: selectedBiz.address,
      }));
    } else {
      setInvoiceForm((prev) => ({
        ...prev,
        sellerBusinessId: "",
        sellerProvinceId: "",
        sellerProvince: "",
        sellerAddress: "",
      }));
    }
    setHasChanged(true);
  };
  const invoiceStats = useMemo(() => {
    let total = 0,
      validated = 0,
      pending = 0,
      failed = 0;
    let sumExcl = 0,
      sumTax = 0,
      sumIncl = 0;

    invoices.forEach((inv) => {
      total++;
      if (inv.status === "Validated") validated++;
      else if (inv.status === "Pending") pending++;
      else if (inv.status === "Failed") failed++;

      // Safely parse items to calculate financial totals
      const items =
        typeof inv.items === "string" ? JSON.parse(inv.items) : inv.items || [];

      items.forEach((r) => {
        sumExcl += Number(r.valueSalesExcludingST || 0);

        // Sum all tax fields
        const rowTax =
          Number(r.salesTaxApplicable || 0) +
          Number(r.salesTaxWithheldAtSource || 0) +
          Number(r.extraTax || 0) +
          Number(r.furtherTax || 0) +
          Number(r.fedPayable || 0);
        sumTax += rowTax;

        sumIncl += Number(r.totalValues || r.valueInclTax || 0);
      });
    });

    return { total, validated, pending, failed, sumExcl, sumTax, sumIncl };
  }, [invoices]);

  const selectAllRef = useRef(null);

  useEffect(() => {
    if (selectAllRef.current) {
      // It is indeterminate if at least 1 is selected, but NOT all of them
      const isIndeterminate =
        selectedInvoices.length > 0 &&
        selectedInvoices.length < invoices.length;

      selectAllRef.current.indeterminate = isIndeterminate;
    }
  }, [selectedInvoices, invoices]);

  const [menuConfig, setMenuConfig] = useState({
    open: false,
    id: null,
    top: 0,
    left: 0,
  });

  const toggleMenu = (e, invId) => {
    e.stopPropagation();
    if (menuConfig.id === invId) {
      setMenuConfig({ open: false, id: null, top: 0, left: 0 });
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuConfig({
        open: true,
        id: invId,
        top: rect.bottom - 50,
        left: rect.left - 195,
      });
    }
  };

  // Close when clicking anywhere else
  useEffect(() => {
    const close = () =>
      setMenuConfig({ open: false, id: null, top: 0, left: 0 });
    window.addEventListener("click", close);
    window.addEventListener("scroll", close, true);

    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("scroll", close, true);
    };
  }, []);

  return (
    <>
      <div className=" flex flex-col min-h-[85vh] mt-4">
        {!isConsultantMode && (
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-[24px] md:text-3xl font-bold">Invoice Table</h1>

            <div className="flex gap-3">
              {permissions.can_create_invoice === 1 && (
                <button
                  onClick={() => {
                    setShowForm(true);
                    setIsEditMode(false);
                    setIsReadOnly(false);
                    setEditingInvoiceId(null);
                    const defaultBiz =
                      userBusinesses.length > 0 ? userBusinesses[0] : null;
                    setInvoiceForm({
                      invoiceNo: "",
                      date: minDate,
                      customer: "",
                      customerId: 0,
                      buyerProvince: "",
                      sellerBusinessId: defaultBiz ? defaultBiz.id : 0,
                      sellerBusinessName: defaultBiz
                        ? defaultBiz.business_name
                        : "",
                      sellerAddress: defaultBiz ? defaultBiz.address : "",
                      sellerProvinceId: Number(defaultBiz?.province_id || 0),
                      sellerProvince: defaultBiz?.province || "",
                      scenarioCode: null,
                      scenarioCodeId: 0,
                      saleType: "",
                      registrationNo: "",
                      items: [{ ...emptyRow, rowId: genRowId() }],
                    });
                    setRows([{ ...emptyRow, rowId: genRowId() }]);
                    setCustomerSearch("");
                    setScenarioSearch("");
                    setHasChanged(false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1 rounded-lg"
                >
                  +
                </button>
              )}

              <button
                onClick={exportToExcel}
                className="bg-blue-600 hover:bg-green-700 text-white px-3 py-1  rounded-lg flex items-center gap-2"
              >
                <DocumentArrowDownIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 backdrop-blur-xs bg-black/30 z-50 flex items-center justify-center px-3">
            <div
              className={`${darkMode ? "bg-gray-900" : "bg-white"} rounded-xl shadow-lg p-6 w-full max-w-8xl h-[90vh] overflow-y-auto custom-scroll`}
            >
              {HSCodeLoading ? (
                <div className="flex justify-center items-center h-164">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <form onSubmit={handleInvoiceSubmit} className="">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">
                      {isEditMode
                        ? isReadOnly
                          ? "View Invoice"
                          : "Edit Invoice"
                        : "Add Invoice"}
                    </h2>
                    <div className="flex gap-4 items-center">
                      {!isReadOnly && (
                        <>
                          {hasChanged ? (
                            <button
                              // type="submit"
                              // disabled={isSubmitting}
                              type="button"
                              disabled={isSubmitting} // Disable during request
                              onClick={() => handleInvoiceSubmit(null, false)}
                              className={`px-4 py-2 rounded-md font-semibold flex items-center gap-2 transition-all 
                                                                 ${
                                                                   isSubmitting
                                                                     ? "bg-gray-400 cursor-not-allowed text-white"
                                                                     : "bg-blue-600 hover:bg-blue-700 text-white active:scale-95 shadow-sm"
                                                                 }`}
                            >
                              {isSubmitting ? (
                                <svg
                                  className="animate-spin h-5 w-5 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                              ) : (
                                <DocumentArrowDownIcon className="h-6 w-6" />
                              )}
                              {isSubmitting ? "Saving..." : "Save"}
                            </button>
                          ) : (
                            invoiceForm.status != "Validated" &&
                            isEditMode && (
                              <button
                                type="button"
                                disabled={isSubmitting} // Disable during request
                                onClick={() => handleInvoiceSubmit(null, true)}
                                className={`px-4 py-2 rounded-md font-semibold flex items-center gap-2 transition-all 
                                                                     ${
                                                                       isSubmitting
                                                                         ? "bg-gray-400 cursor-not-allowed text-white"
                                                                         : "bg-green-600 hover:bg-green-700 text-white active:scale-95"
                                                                     }`}
                              >
                                {isSubmitting ? (
                                  <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                ) : (
                                  <DocumentArrowDownIcon className="h-6 w-6" />
                                )}
                                {isSubmitting ? "Validating..." : "Validate"}
                              </button>
                            )
                          )}
                          {invoiceForm.status === "Failed" && (
                            <button
                              type="button"
                              disabled={isLoadingError} // Prevent multiple clicks
                              onClick={() => handleErrorClick(editingInvoiceId)}
                              className={`px-4 py-2 rounded-md font-semibold flex items-center gap-2 transition-all shadow-sm
                                                            ${
                                                              isLoadingError
                                                                ? "bg-gray-400 cursor-not-allowed text-white"
                                                                : "bg-red-600 hover:bg-red-700 text-white active:scale-95"
                                                            }`}
                            >
                              {isLoadingError ? (
                                // Simple Spinner SVG
                                <svg
                                  className="animate-spin h-5 w-5 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                              ) : (
                                <DocumentArrowDownIcon className="h-6 w-6" />
                              )}

                              {isLoadingError
                                ? "Loading..."
                                : "View Error Details"}
                            </button>
                          )}
                          {invoiceForm.status === "Validated" &&
                            !hasChanged && (
                              <span className="px-4 py-2 rounded-md font-semibold flex items-center gap-2 bg-green-600 text-white w-fit">
                                {/* Optional: Adds a checkmark icon to match your style */}
                                Validation Success
                              </span>
                            )}
                        </>
                      )}

                      {isReadOnly && (
                        <button
                          type="button"
                          disabled
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-semibold flex items-center gap-2 cursor-not-allowed"
                        >
                          <DocumentArrowDownIcon className="h-6 w-6" />
                          Read-only
                        </button>
                      )}
                      {(isEditMode || isReadOnly) && (
                        <button
                          type="button"
                          onClick={printInvoice}
                          className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md font-semibold"
                        >
                          Print
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (isConsultantMode) {
                            sessionStorage.removeItem("activeConsultantMode"); // Clear the flag
                            sessionStorage.setItem(
                              "userId",
                              sessionStorage.getItem("consultantId"),
                            );
                            if (sessionStorage.getItem("parentConsultantId")) {
                              sessionStorage.setItem(
                                "parent_id",
                                sessionStorage.getItem("parentConsultantId"),
                              );
                            }
                            router.push("/consultant/invoices"); // Kick back to ledger
                          } else {
                            setShowForm(false);
                            setIsEditMode(false);
                            setIsReadOnly(false);
                            setEditingInvoiceId(null);
                            setCustomerSearch("");
                            setScenarioSearch("");
                            setHasChanged(false);
                            fetchInvoices();
                          }
                          console.log(
                            "Form closed, reset states. isConsultantMode mode:",
                            isConsultantMode,
                          );
                          // setInvoiceForm(null);
                        }}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Int. Invoice No *
                      </label>
                      <input
                        type="text"
                        name="internal_inv_ref_no"
                        value={invoiceForm.internal_inv_ref_no}
                        onChange={(e) => {
                          const canEdit =
                            !isEditMode &&
                            (Number(latestInvoice) === 1 ||
                              isNaN(Number(latestInvoice)));
                          if (canEdit) {
                            console.log("can edit invoce no");

                            setInvoiceForm((prev) => ({
                              ...prev,
                              internal_inv_ref_no: e.target.value,
                            }));
                            setHasChanged(true);
                          }
                        }}
                        onBlur={() => {
                          const canEdit =
                            !isEditMode && Number(latestInvoice) === 1;
                          if (
                            canEdit &&
                            (!invoiceForm.internal_inv_ref_no ||
                              invoiceForm.internal_inv_ref_no === "")
                          ) {
                            setInvoiceForm((prev) => ({
                              ...prev,
                              internal_inv_ref_no: "1",
                            }));
                            setHasChanged(true);
                          }
                        }}
                        className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                        required
                        readOnly={
                          isEditMode ||
                          isReadOnly ||
                          (Number(latestInvoice) !== 1 &&
                            !isNaN(Number(latestInvoice)))
                        }
                      />
                      {Number(latestInvoice) !== 1 &&
                        !isNaN(Number(latestInvoice)) &&
                        !isEditMode && (
                          <p className="text-red-500 text-sm mt-1">
                            Inv no. auto-assigned cannot be changed.
                          </p>
                        )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={invoiceForm.date || today}
                        //onChange={handleFormChange}
                        onChange={(e) => {
                          handleFormChange(e);
                          setHasChanged(true);
                        }}
                        className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                        min={minDate}
                        max={today}
                        required
                        readOnly={isReadOnly}
                      />
                    </div>
                    <div className="relative w-full group">
                      <label className="block text-sm font-medium mb-1">
                        Customer *
                      </label>

                      <input
                        type="text"
                        value={customerSearch}
                        onChange={(e) => {
                          setCustomerSearch(e.target.value);
                          setHasChanged(true);
                        }}
                        placeholder="Search customer..."
                        className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                        readOnly={isReadOnly}
                        required
                      />

                      <div className="absolute left-0 right-0 top-full -mt-px bg-white border rounded-md max-h-40 overflow-y-auto z-50 shadow-lg hidden group-focus-within:block">
                        {customers
                          .filter(
                            (c) =>
                              c.allowed === true &&
                              `${c.locations[0]?.business_name} - ${c.ntn || c.cnic}`
                                .toLowerCase()
                                .includes(customerSearch.toLowerCase()),
                          )
                          .map((c) => {
                            const displayValue = `${c.locations[0]?.business_name} - ${c.ntn || c.cnic}`;
                            const regNoToUse = c.ntn || c.cnic || "";

                            return (
                              <div
                                key={c.id}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                onMouseDown={async () => {
                                  const headers = getFbrHeaders();
                                  setInvoiceForm((prev) => ({
                                    ...prev,
                                    customerId: c.id,
                                    customer: displayValue,
                                    buyerProvince:
                                      c.locations[0]?.province_name ||
                                      c.buyerProvince ||
                                      "",

                                    // registrationNo: regNoToUse,
                                  }));
                                  setCustomerSearch(displayValue);
                                  setHasChanged(true);
                                  if (regNoToUse) {
                                    try {
                                      const response = await fetch(
                                        `/api/fbr/registrationType?regNo=${encodeURIComponent(regNoToUse)}`,
                                        { headers },
                                      );

                                      if (response.ok) {
                                        const regTypeData =
                                          await response.json();
                                        console.log(
                                          " reg type ",
                                          regTypeData?.REGISTRATION_TYPE,
                                        );
                                        setInvoiceForm((prev) => ({
                                          ...prev,
                                          buyerType:
                                            regTypeData?.REGISTRATION_TYPE ||
                                            "",
                                        }));
                                      }
                                    } catch (err) {
                                      console.warn(
                                        "Registration type fetch failed:",
                                        err,
                                      );
                                    }
                                  }
                                }}
                              >
                                {displayValue}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Customer Province *
                      </label>

                      {isReadOnly ? (
                        <>
                          <input
                            type="text"
                            value={invoiceForm.buyerProvince || ""}
                            className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                            readOnly
                          />
                          <input
                            type="hidden"
                            name="buyerProvince"
                            value={invoiceForm.buyerProvince || ""}
                          />
                        </>
                      ) : (
                        <select
                          name="buyerProvince"
                          value={invoiceForm.buyerProvince || ""}
                          onChange={(e) => {
                            handleFormChange(e);
                            setHasChanged(true);
                          }}
                          className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                          required
                          disabled={loading}
                        >
                          <option value="">Select Province</option>

                          {loading && (
                            <option value="" disabled>
                              Loading provinces...
                            </option>
                          )}

                          {provinces.map((prov) => (
                            <option
                              key={prov.stateProvinceCode}
                              value={prov.stateProvinceDesc}
                            >
                              {prov.stateProvinceDesc}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Seller Province *
                      </label>

                      {isReadOnly ? (
                        <>
                          <input
                            type="text"
                            value={
                              provinces.find(
                                (p) =>
                                  p.stateProvinceCode ==
                                  invoiceForm.sellerProvinceId,
                              )?.stateProvinceDesc || ""
                            }
                            className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                            readOnly
                          />
                          <input
                            type="hidden"
                            name="sellerProvinceId"
                            value={invoiceForm.sellerProvinceId || ""}
                          />
                        </>
                      ) : (
                        <select
                          name="sellerProvinceId"
                          value={invoiceForm.sellerProvinceId || ""}
                          onChange={(e) => {
                            handleFormChange(e);
                            setHasChanged(true);
                          }}
                          className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                          required
                          disabled={loading}
                        >
                          <option value="">Select Province</option>

                          {loading && (
                            <option value="" disabled>
                              Loading provinces...
                            </option>
                          )}

                          {provinces.map((prov) => (
                            <option
                              key={prov.stateProvinceCode}
                              value={prov.stateProvinceCode}
                            >
                              {prov.stateProvinceDesc}
                            </option>
                          ))}
                        </select>
                      )}
                      <input
                        type="hidden"
                        name="sellerProvince"
                        value={invoiceForm.sellerProvince || ""}
                      />
                    </div>
                    {/* <div>
                      <label className="block text-sm font-medium mb-2">
                        Seller Business *
                      </label>

                      {isReadOnly ? (
                        <input
                          type="text"
                          value={invoiceForm.sellerBusinessName || ""}
                          className="w-full border border-[#B0B0B0] rounded-md p-2 bg-gray-100 text-[#4E4E4E]"
                          readOnly
                        />
                      ) : (
                        <select
                          name="sellerBusinessId"
                          value={invoiceForm.sellerBusinessId || ""}
                          onChange={handleBusinessChange}
                          className="w-full border border-[#B0B0B0] rounded-md p-2 bg-white text-[#4E4E4E] focus:border-[#5AB3E8] focus:ring-1 focus:ring-[#5AB3E8] transition-all duration-300 outline-none"
                          required
                          disabled={loading}
                        >
                          <option value="">Select Business</option>
                          {userBusinesses.map((biz) => (
                            <option key={biz.id} value={biz.id}>
                              {biz.business_name}
                            </option>
                          ))}
                        </select>
                      )}

                      <input
                        type="hidden"
                        name="sellerProvinceId"
                        value={invoiceForm.sellerProvinceId || ""}
                      />
                      <input
                        type="hidden"
                        name="sellerProvince"
                        value={invoiceForm.sellerProvince || ""}
                      />
                      <input
                        type="hidden"
                        name="sellerAddress"
                        value={invoiceForm.sellerAddress || ""}
                      />
                    </div> */}
                    {document.cookie
                      .split("; ")
                      .find((row) => row.startsWith("isProd="))
                      ?.split("=")[1] != "1" && (
                      <div className="relative w-full group">
                        <label className="block text-sm font-medium mb-1">
                          Scenario Code
                        </label>

                        <input
                          type="text"
                          value={
                            invoiceForm.scenarioCode
                              ? `${invoiceForm.scenarioCode} - ${
                                  scenarioCodes.find(
                                    (s) => s.code === invoiceForm.scenarioCode,
                                  )?.description || ""
                                }`
                              : ""
                          }
                          placeholder="Select scenario code..."
                          className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                          readOnly={true} // allow click but prevent typing if you want
                          onClick={(e) => e.currentTarget.focus()} // focus triggers dropdown via group-focus-within
                          required
                        />

                        <div className="absolute left-0 right-0 top-full -mt-px bg-white border rounded-md max-h-40 overflow-y-auto z-50 shadow-lg hidden group-focus-within:block">
                          {!isReadOnly &&
                            scenarioCodes.map((s) => (
                              <div
                                key={s.id}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                onMouseDown={(e) => {
                                  e.preventDefault(); // prevent input blur
                                  const selectedCode = s.code;
                                  const selectedId = s.id;

                                  // save only code
                                  setInvoiceForm((prev) => ({
                                    ...prev,
                                    scenarioCodeId: selectedId,
                                    scenarioCode: selectedCode,
                                  }));
                                  setHasChanged(true);
                                }}
                              >
                                {s.code} - {s.description}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    <div className="relative w-full group">
                      <label className="block text-sm font-medium mb-1">
                        Sale Type
                      </label>

                      <div className="relative">
                        <input
                          type="text"
                          name="saleType"
                          value={invoiceForm.saleType || ""}
                          onChange={(e) => {
                            handleFormChange(e);
                            setHasChanged(true);
                          }}
                          placeholder="Select or type sale type..."
                          className={`
                          className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                                                         ${
                                                           isReadOnly
                                                             ? "bg-gray-50 text-gray-700 cursor-default"
                                                             : "bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                         }
                                             `}
                          readOnly={true}
                          //  onFocus={(e) => !isReadOnly && e.target.select()}
                          required
                        />

                        {!isReadOnly && (
                          <div
                            className="
                                                    absolute top-full left-0 w-full mt-1
                                                    bg-white border border-gray-300 rounded-md 
                                                    max-h-60 overflow-y-auto shadow-lg z-50
                                                    hidden group-focus-within:block
                                                    "
                          >
                            {saleTypeList.map((item) => (
                              <div
                                key={item.docTypeId}
                                className={`
                                                                px-4 py-2.5 text-sm cursor-pointer
                                                                hover:bg-blue-50 transition-colors
                                                                ${
                                                                  item.docDescription ===
                                                                  invoiceForm.saleType
                                                                    ? "bg-blue-100 font-medium text-blue-800"
                                                                    : "text-gray-800"
                                                                }
                                                            `}
                                onMouseDown={(e) => {
                                  e.preventDefault(); // prevents input blur before selection
                                  setInvoiceForm((prev) => ({
                                    ...prev,
                                    saleType: item.docDescription,
                                  }));
                                  setHasChanged(true);
                                  // Optional: blur to close dropdown immediately after pick
                                  // e.currentTarget.closest('input')?.blur();
                                }}
                              >
                                {item.docDescription}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Buyer Registration Type *
                      </label>
                      <select
                        name="buyerType"
                        value={invoiceForm.buyerType || ""}
                        onChange={(e) => {
                          handleFormChange(e);
                          setHasChanged(true);
                        }}
                        className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                        required
                        disabled={isReadOnly}
                      >
                        <option value="">Select Buyer Registration Type</option>
                        <option value="Registered">Registered</option>
                        <option value="Unregistered">Unregistered</option>
                      </select>
                    </div>
                    {invoiceForm.saleType === "Debit Note" && (
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          FBR Invoice Ref No
                        </label>
                        <input
                          type="text"
                          name="fbrInvoiceRefNo"
                          value={invoiceForm.fbrInvoiceRefNo || ""}
                          onChange={handleFormChange}
                          className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                          placeholder="Enter FBR Invoice Ref No"
                          readOnly={isReadOnly}
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Challan No
                      </label>
                      <input
                        type="text"
                        name="challanNo"
                        value={invoiceForm.challanNo || ""}
                        onChange={(e) => {
                          handleFormChange(e);
                          setHasChanged(true);
                        }}
                        className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                        placeholder="Enter Challan No"
                        readOnly={isReadOnly}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Challan Date{" "}
                      </label>
                      <input
                        type="date"
                        name="challan_date"
                        value={invoiceForm.challan_date}
                        //onChange={handleFormChange}
                        onChange={(e) => {
                          handleFormChange(e);
                          setHasChanged(true);
                        }}
                        className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                        readOnly={isReadOnly}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Tax 236H %
                      </label>
                      <input
                        type="text"
                        name="tax236H"
                        value={invoiceForm.tax236H || ""}
                        onChange={(e) => {
                          if (isReadOnly) return;

                          let val = e.target.value;

                          // 1. Clean the input (allow only numbers and a single decimal point)
                          const cleaned = val
                            .replace(/[^0-9.]/g, "")
                            .replace(/(\..*?)\./g, "$1");

                          // 2. Enforce max 2 decimal places
                          const decimalMatch = cleaned.match(/\.(\d*)/);
                          if (decimalMatch && decimalMatch[1].length > 2) {
                            return;
                          }

                          // 3. Pass the actual CLEANED value to the handler
                          handleFormChange({
                            target: { name: "tax236H", value: cleaned },
                          });
                          setHasChanged(true);
                        }}
                        onBlur={() => {
                          if (isReadOnly) return;

                          let current = String(
                            invoiceForm.tax236H || "",
                          ).trim();

                          // If empty or invalid, default back to 0.00
                          if (current === "" || isNaN(Number(current))) {
                            handleFormChange({
                              target: { name: "tax236H", value: "0.00" },
                            });
                            setHasChanged(true);
                            return;
                          }

                          // Format valid numbers to 2 decimal places on blur
                          const num = Number(current);
                          if (num >= 0) {
                            handleFormChange({
                              target: {
                                name: "tax236H",
                                value: num.toFixed(4),
                              },
                            });
                          } else {
                            handleFormChange({
                              target: { name: "tax236H", value: "0.00" },
                            });
                          }
                          setHasChanged(true);
                        }}
                        className="w-full border rounded-md px-3 py-2"
                        inputMode="decimal"
                        pattern="[0-9]*\.?[0-9]*"
                        placeholder="0.00"
                        readOnly={isReadOnly}
                      />
                    </div>
                  </div>
                  <div
                    className="relative bg-white rounded-xl shadow overflow-x-auto custom-scroll mt-6"
                    style={{
                      minHeight: "500px",
                      maxHeight: "500px",
                      overflowY: "auto",
                    }}
                  >
                    <table className="w-full text-sm min-w-max">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 font-semibold">
                            Select Product
                          </th>
                          <th className="px-4 py-3 font-semibold">HS Code</th>
                          <th className="px-4 py-3 font-semibold">
                            Description
                          </th>
                          <th className="px-4 py-3 font-semibold">
                            Single Unit Price
                          </th>
                          <th className="px-4 py-3 font-semibold">Qty</th>
                          <th className="px-4 py-3 font-semibold">
                            Transaction Type
                          </th>
                          <th className="px-4 py-3 font-semibold">Rate</th>
                          <th className="px-4 py-3 font-semibold">Unit</th>
                          <th className="px-4 py-3 font-semibold">
                            Total Values
                          </th>
                          <th className="px-4 py-3 font-semibold">
                            Value Sales Excl. ST
                          </th>
                          <th className="px-4 py-3 font-semibold">
                            Fixed Notified / Retail Price %
                          </th>
                          <th className="px-4 py-3 font-semibold">
                            Sales Tax Applicable
                          </th>
                          <th className="px-4 py-3 font-semibold">
                            Sales Tax Withheld %
                          </th>
                          <th className="px-4 py-3 font-semibold">Extra Tax</th>
                          <th className="px-4 py-3 font-semibold">
                            Further Tax %
                          </th>
                          <th className="px-4 py-3 font-semibold">
                            SRO Schedule No
                          </th>
                          <th className="px-4 py-3 font-semibold">
                            FED Payable %
                          </th>
                          <th className="px-4 py-3 font-semibold">
                            Discount %
                          </th>
                          {/* <th className="px-4 py-3 font-semibold">Sale Type</th> */}
                          <th className="px-4 py-3 font-semibold">
                            SRO Item Serial No
                          </th>
                          <th className="px-4 py-3 font-semibold">
                            Internal Qty
                          </th>
                          <th className="px-4 py-3 font-semibold">
                            Internal Single Unit Price
                          </th>
                          <th className="px-4 py-3 font-semibold">
                            Internal UOM
                          </th>
                          {/* <th className="px-4 py-3 font-semibold">Actions</th> */}
                          <th
                            className="px-4 py-3 font-semibold"
                            style={{
                              position: "sticky",
                              right: 0,
                              background: "white",
                              zIndex: 10,
                            }}
                          >
                            Remove
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, index) => (
                          <tr key={index} className="bg-white relative">
                            <td className="px-4 py-3 whitespace-nowrap relative group">
                              <input
                                type="text"
                                placeholder="Search product..."
                                className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                                value={row.product_description || ""}
                                onChange={(e) => {
                                  handleInputChange(
                                    index,
                                    "product_description",
                                    e.target.value,
                                  );
                                  setHasChanged(true);
                                }}
                                readOnly={isReadOnly}
                              />
                              {/* Dropdown Logic: Filtered by Row's TransactionType (which comes from Scenario Code) */}
                              <div className="absolute top-full left-0 right-0 bg-white border rounded-md max-h-48 overflow-y-auto z-50 shadow-2xl hidden group-focus-within:block">
                                {allProducts
                                  .filter((p) => {
                                    // REMOVED: TransactionType filter
                                    const matchesSearch = (
                                      p.product_description || ""
                                    )
                                      .toLowerCase()
                                      .includes(
                                        (
                                          row.product_description || ""
                                        ).toLowerCase(),
                                      );
                                    return matchesSearch;
                                  })
                                  .map((p) => (
                                    <div
                                      key={p.id}
                                      className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                                      onMouseDown={() =>
                                        handleProductSelect(index, p)
                                      }
                                    >
                                      <div className="font-bold text-gray-800">
                                        {p.product_description} {/* UPDATED */}
                                      </div>
                                      <div className="text-[10px] text-gray-500 flex justify-between">
                                        <span>HS: {p.hsCode}</span>
                                        <span className="text-blue-600 font-bold">
                                          PKR {p.singleUnitPrice}
                                        </span>
                                      </div>
                                    </div>
                                  ))}

                                {/* {allProducts.filter(
                                  (p) =>
                                    String(p.transactionType)
                                      .trim()
                                      .toLowerCase() ===
                                    String(row.TransactionType)
                                      .trim()
                                      .toLowerCase(),
                                ).length === 0 && (
                                  <div className="p-3 text-xs text-red-500 italic">
                                    No products found for{" "}
                                    {row.TransactionType || "this scenario"}.
                                  </div>
                                )} */}
                              </div>
                            </td>
                            {/* HS Code with dropdown */}

                            <td className="px-4 py-3 whitespace-nowrap relative">
                              <input
                                type="text"
                                value={row.hsCode}
                                readOnly
                                onChange={(e) => {
                                  handleInputChange(
                                    index,
                                    "hsCode",
                                    e.target.value,
                                  );
                                  setHasChanged(true);
                                }}
                                placeholder="Search HS Code..."
                                className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                                onFocus={(e) => {
                                  const dropdown = e.target.nextSibling;
                                  if (dropdown)
                                    dropdown.style.display = "block";
                                }}
                                onBlur={(e) => {
                                  const dropdown = e.target.nextSibling;
                                  setTimeout(() => {
                                    if (dropdown)
                                      dropdown.style.display = "none";
                                  }, 10);
                                }}
                              />
                              <div
                                className="absolute top-full left-0 right-0 bg-white border rounded-md max-h-40 overflow-y-auto z-50 shadow-lg"
                                style={{ display: "none" }}
                              >
                                {hsCodes
                                  .filter((h) =>
                                    `${h.hS_CODE} - ${h.description}`
                                      .toLowerCase()
                                      .includes(row.hsCode.toLowerCase()),
                                  )
                                  .map((h) => (
                                    <div
                                      key={h.hS_CODE}
                                      className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                                      onMouseDown={() => {
                                        handleInputChange(
                                          index,
                                          "hsCode",
                                          h.hS_CODE,
                                        );
                                        setHasChanged(true);
                                      }}
                                    >
                                      {h.hS_CODE} - {h.description}
                                    </div>
                                  ))}
                              </div>
                            </td>
                            {/* Description (auto-filled) */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                name="description"
                                readOnly
                                value={row.description}
                                onChange={(e) => {
                                  handleInputChange(
                                    index,
                                    "description",
                                    e.target.value,
                                  );
                                  setHasChanged(true);
                                }}
                                className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                              />
                            </td>
                            {/* Single Unit Price */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="text"
                                name="singleUnitPrice"
                                readOnly={
                                  isReadOnly ||
                                  permissions.can_edit_single_unit_price === 0
                                }
                                value={row.singleUnitPrice ?? ""}
                                // onChange={(e) => handleInputChange(index, "qty", e.target.value)}
                                onChange={(e) => {
                                  if (isReadOnly) return;

                                  let val = e.target.value;

                                  const decimalMatch = val.match(/\.(\d*)/);
                                  const hasDecimal = decimalMatch !== null;
                                  const decimalDigits = hasDecimal
                                    ? decimalMatch[1].length
                                    : 0;

                                  if (decimalDigits > 4) return;

                                  const cleaned = val
                                    .replace(/[^0-9.]/g, "")
                                    .replace(/(\..*?)\./g, "$1");

                                  handleInputChange(
                                    index,
                                    "singleUnitPrice",
                                    cleaned,
                                  );
                                  setHasChanged(true);
                                }}
                                onBlur={() => {
                                  if (isReadOnly) return;

                                  let current = (
                                    row.singleUnitPrice ?? ""
                                  ).trim();

                                  if (current === "") {
                                    handleInputChange(
                                      index,
                                      "singleUnitPrice",
                                      "1",
                                    );
                                    setHasChanged(true);
                                    return;
                                  }

                                  const num = Number(current);
                                  if (!isNaN(num) && num >= 0) {
                                    handleInputChange(
                                      index,
                                      "singleUnitPrice",
                                      num.toString(),
                                    );
                                    setHasChanged(true);
                                  } else {
                                    handleInputChange(
                                      index,
                                      "singleUnitPrice",
                                      "1",
                                    );
                                    setHasChanged(true);
                                  }
                                }}
                                className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                                inputMode="decimal"
                                pattern="[0-9]*\.?[0-9]*"
                                placeholder="1.0000"
                              />
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="text"
                                name="qty"
                                // value={row.qty}
                                value={row.qty ?? ""}
                                // onChange={(e) => handleInputChange(index, "qty", e.target.value)}
                                onChange={(e) => {
                                  if (isReadOnly) return;

                                  let val = e.target.value;

                                  const decimalMatch = val.match(/\.(\d*)/);
                                  const hasDecimal = decimalMatch !== null;
                                  const decimalDigits = hasDecimal
                                    ? decimalMatch[1].length
                                    : 0;

                                  if (decimalDigits > 4) return;

                                  const cleaned = val
                                    .replace(/[^0-9.]/g, "")
                                    .replace(/(\..*?)\./g, "$1");

                                  handleInputChange(index, "qty", cleaned);
                                  setHasChanged(true);
                                }}
                                onBlur={() => {
                                  if (isReadOnly) return;

                                  let current = (row.qty ?? "").trim();

                                  if (current === "") {
                                    handleInputChange(index, "qty", "1.0000");
                                    setHasChanged(true);
                                    return;
                                  }

                                  const num = Number(current);
                                  if (!isNaN(num) && num >= 0) {
                                    handleInputChange(
                                      index,
                                      "qty",
                                      num.toString(),
                                    );
                                    setHasChanged(true);
                                  } else {
                                    handleInputChange(index, "qty", "1.0000");
                                    setHasChanged(true);
                                  }
                                }}
                                className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                                readOnly={isReadOnly}
                                inputMode="decimal"
                                pattern="[0-9]*\.?[0-9]*"
                                placeholder="1.0000"
                              />
                            </td>

                            {/* <td className="px-4 py-3 whitespace-nowrap relative group">
                              <input
                                type="text"
                                name="TransactionType"
                                readOnly={
                                  isReadOnly ||
                                  permissions.can_edit_transaction_type === 0
                                }
                                value={row.TransactionType}
                                onChange={(e) => {
                                  handleInputChange(
                                    index,
                                    "TransactionType",
                                    e.target.value,
                                  );
                                  setHasChanged(true);
                                }}
                                placeholder="Select Transaction Type..."
                                className="w-full border rounded px-2 py-1"
                              />
                            </td> */}
                            <td className="px-4 py-3 whitespace-nowrap relative group">
                              <input
                                type="text"
                                name="TransactionType"
                                // 1. Apply strict permission check
                                readOnly
                                value={row.TransactionType || ""}
                                onChange={(e) => {
                                  handleInputChange(
                                    index,
                                    "TransactionType",
                                    e.target.value,
                                  );
                                  setHasChanged(true);
                                }}
                                placeholder="Select Transaction Type..."
                                // 2. Visual feedback for locked fields
                                className={`w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all

                                   ${
                                     isReadOnly ||
                                     permissions.can_edit_transaction_type === 0
                                       ? "bg-slate-100 cursor-not-allowed text-slate-500"
                                       : "bg-white text-slate-800"
                                   }`}
                              />

                              {/* 3. The Dropdown Menu (only shows if allowed to edit) */}
                              {!(
                                isReadOnly ||
                                permissions.can_edit_transaction_type === 0
                              ) && (
                                <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-md max-h-48 overflow-y-auto z-[100] shadow-2xl hidden group-focus-within:block">
                                  {transTypeList
                                    // .filter((t) =>
                                    //   (t.transactioN_DESC || "")
                                    //     .toLowerCase()
                                    //     .includes(
                                    //       (
                                    //         row.TransactionType || ""
                                    //       ).toLowerCase(),
                                    //     ),
                                    // )
                                    .map((t) => (
                                      <div
                                        key={t.transactioN_TYPE_ID} // Unique key prop
                                        className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                                        onMouseDown={() => {
                                          // Ensure we pass the ID to handle the cascade (Rates, SROs)
                                          handleInputChange(
                                            index,
                                            "TransactionTypeId",
                                            t.transactioN_TYPE_ID,
                                          );
                                          setHasChanged(true);
                                        }}
                                      >
                                        {t.transactioN_DESC}
                                      </div>
                                    ))}
                                  {/* Helper if no matches found */}
                                  {transTypeList.length === 0 && (
                                    <div className="px-3 py-2 text-xs text-slate-400 italic">
                                      No types loaded...
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>

                            {/* Rate */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              {row.rateOptions && row.rateOptions.length > 0 ? (
                                <select
                                  value={row.rateId ?? ""}
                                  onChange={(e) => {
                                    handleInputChange(
                                      index,
                                      "rateId",
                                      e.target.value,
                                    );
                                    setHasChanged(true);
                                  }}
                                  className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                                  readOnly={
                                    isReadOnly ||
                                    permissions.can_edit_rate === 0
                                  }
                                >
                                  <option value="">Select Rate</option>
                                  {row.rateOptions.map((opt) => (
                                    <option
                                      key={
                                        opt.ratE_ID ??
                                        opt.ratE_VALUE ??
                                        opt.ratE_DESC
                                      }
                                      value={opt.ratE_ID ?? opt.ratE_VALUE}
                                    >
                                      {opt.ratE_DESC ??
                                        String(opt.ratE_VALUE ?? opt.ratE_ID)}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  name="rate"
                                  value={row.rate ?? ""}
                                  onChange={(e) => {
                                    handleInputChange(
                                      index,
                                      "rate",
                                      e.target.value,
                                    );
                                    setHasChanged(true);
                                  }}
                                  className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                                  readOnly
                                />
                              )}

                              {/* Hidden inputs to keep IDs & descriptions present in the DOM/form */}
                              <input
                                type="hidden"
                                name={`rows[${index}].rateId`}
                                value={row.rateId ?? 0}
                              />
                              <input
                                type="hidden"
                                name={`rows[${index}].rateDesc`}
                                value={row.rateDesc ?? ""}
                              />
                              <input
                                type="hidden"
                                name={`rows[${index}].TransactionTypeId`}
                                value={row.TransactionTypeId ?? 0}
                              />
                            </td>

                            {/* Unit with dropdown */}
                            <td className="px-4 py-3 whitespace-nowrap relative group">
                              <input
                                type="text"
                                name="unit"
                                value={row.unit}
                                onChange={(e) => {
                                  handleInputChange(
                                    index,
                                    "unit",
                                    e.target.value,
                                  );
                                  setHasChanged(true);
                                }}
                                placeholder="Select UOM..."
                                className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                                readOnly
                              />
                              <div className="absolute top-full left-0 right-0 bg-white border rounded-md max-h-40 overflow-y-auto z-50 shadow-lg hidden group-focus-within:block">
                                {uomList.map((u) => (
                                  <div
                                    key={u.uom_ID}
                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                    onMouseDown={() =>
                                      handleInputChange(
                                        index,
                                        "unit",
                                        u.description,
                                      )
                                    }
                                  >
                                    {u.description}
                                  </div>
                                ))}
                              </div>
                            </td>

                            {/* Total Values */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="text"
                                name="totalValues"
                                value={row.totalValues}
                                className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                                readOnly
                              />
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="number"
                                name="valueSalesExcludingST"
                                value={row.valueSalesExcludingST}
                                className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                                readOnly
                              />
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="text"
                                name="fixedNotifiedValueOrRetailPrice"
                                // value={row.qty}
                                value={
                                  row.fixedNotifiedValueOrRetailPrice ?? ""
                                }
                                // onChange={(e) => handleInputChange(index, "qty", e.target.value)}
                                onChange={(e) => {
                                  if (isReadOnly) return;

                                  let val = e.target.value;

                                  const decimalMatch = val.match(/\.(\d*)/);
                                  const hasDecimal = decimalMatch !== null;
                                  const decimalDigits = hasDecimal
                                    ? decimalMatch[1].length
                                    : 0;

                                  if (decimalDigits > 4) return;

                                  const cleaned = val
                                    .replace(/[^0-9.]/g, "")
                                    .replace(/(\..*?)\./g, "$1");

                                  handleInputChange(
                                    index,
                                    "fixedNotifiedValueOrRetailPrice",
                                    cleaned,
                                  );
                                  setHasChanged(true);
                                }}
                                onBlur={() => {
                                  if (isReadOnly) return;

                                  let current = (
                                    row.fixedNotifiedValueOrRetailPrice ?? ""
                                  ).trim();

                                  if (current === "") {
                                    handleInputChange(
                                      index,
                                      "fixedNotifiedValueOrRetailPrice",
                                      "0",
                                    );
                                    setHasChanged(true);
                                    return;
                                  }
                                  const num = Number(current);
                                  if (!isNaN(num) && num >= 0) {
                                    handleInputChange(
                                      index,
                                      "fixedNotifiedValueOrRetailPrice",
                                      num.toString(),
                                    );
                                    setHasChanged(true);
                                  } else {
                                    handleInputChange(
                                      index,
                                      "fixedNotifiedValueOrRetailPrice",
                                      "0",
                                    );
                                    setHasChanged(true);
                                  }
                                }}
                                className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                                readOnly={
                                  isReadOnly ||
                                  permissions.can_edit_retail_price === 0
                                }
                                inputMode="decimal"
                                pattern="[0-9]*\.?[0-9]*"
                                placeholder="1.0000"
                              />
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="number"
                                name="salesTaxApplicable"
                                value={row.salesTaxApplicable}
                                className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                                readOnly
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="text"
                                name="salesTaxWithheldAtSource"
                                value={row.salesTaxWithheldAtSource ?? ""}
                                onChange={(e) => {
                                  if (
                                    isReadOnly ||
                                    permissions.can_edit_sales_tax === 0
                                  )
                                    return;

                                  const input = e.target;
                                  const start = input.selectionStart;
                                  let val = input.value;

                                  if (
                                    val.length > 1 &&
                                    val.startsWith("0") &&
                                    val[1] !== "."
                                  ) {
                                    val = val.substring(1);
                                  }

                                  handleInputChange(
                                    index,
                                    "salesTaxWithheldAtSource",
                                    val,
                                  );
                                  setHasChanged(true);

                                  window.requestAnimationFrame(() => {
                                    const adj =
                                      val.length < input.value.length ? -1 : 0;
                                    input.setSelectionRange(
                                      start + adj,
                                      start + adj,
                                    );
                                  });
                                }}
                                onBlur={() => {
                                  if (isReadOnly) return;
                                  let current = (
                                    row.salesTaxWithheldAtSource ?? ""
                                  ).trim();

                                  if (
                                    current === "" ||
                                    isNaN(Number(current))
                                  ) {
                                    handleInputChange(
                                      index,
                                      "salesTaxWithheldAtSource",
                                      "0",
                                    );
                                  } else {
                                    handleInputChange(
                                      index,
                                      "salesTaxWithheldAtSource",
                                      Number(current).toString(),
                                    );
                                  }
                                  setHasChanged(true);
                                }}
                                className={`w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all

                                   ${
                                     isReadOnly ||
                                     permissions.can_edit_sales_tax === 0
                                       ? "bg-slate-50 text-slate-400"
                                       : "bg-white text-slate-800 focus:ring-1 focus:ring-blue-500 outline-none"
                                   }`}
                                readOnly={
                                  isReadOnly ||
                                  permissions.can_edit_sales_tax === 0
                                }
                                inputMode="decimal"
                                pattern="[0-9]*\.?[0-9]*"
                                placeholder="0.00"
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="text"
                                name="extraTax"
                                value={row.extraTax ?? ""}
                                onChange={(e) => {
                                  if (
                                    isReadOnly ||
                                    permissions.can_edit_extra_tax === 0
                                  )
                                    return;

                                  const input = e.target;
                                  const start = input.selectionStart;
                                  let val = input.value;
                                  if (
                                    val.length > 1 &&
                                    val.startsWith("0") &&
                                    val[1] !== "."
                                  ) {
                                    val = val.substring(1);
                                  }

                                  handleInputChange(index, "extraTax", val);
                                  setHasChanged(true);

                                  window.requestAnimationFrame(() => {
                                    const adj =
                                      val.length < input.value.length ? -1 : 0;
                                    input.setSelectionRange(
                                      start + adj,
                                      start + adj,
                                    );
                                  });
                                }}
                                onBlur={() => {
                                  if (isReadOnly) return;
                                  let current = (row.extraTax ?? "").trim();

                                  if (
                                    current === "" ||
                                    isNaN(Number(current))
                                  ) {
                                    handleInputChange(index, "extraTax", "0");
                                  } else {
                                    handleInputChange(
                                      index,
                                      "extraTax",
                                      Number(current).toString(),
                                    );
                                  }
                                  setHasChanged(true);
                                }}
                                className={`w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all

                                  ${
                                    isReadOnly ||
                                    permissions.can_edit_extra_tax === 0
                                      ? "bg-slate-50 text-slate-400"
                                      : "bg-white text-slate-800 focus:ring-1 focus:ring-blue-500 outline-none"
                                  }`}
                                readOnly={
                                  isReadOnly ||
                                  permissions.can_edit_extra_tax === 0
                                }
                                inputMode="decimal"
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="text"
                                name="furtherTax"
                                value={row.furtherTax ?? ""}
                                onChange={(e) => {
                                  if (
                                    isReadOnly ||
                                    permissions.can_edit_furthur_tax === 0
                                  )
                                    return;

                                  const input = e.target;
                                  const start = input.selectionStart;
                                  let val = input.value;

                                  if (
                                    val.length > 1 &&
                                    val.startsWith("0") &&
                                    val[1] !== "."
                                  ) {
                                    val = val.substring(1);
                                  }

                                  handleInputChange(index, "furtherTax", val);
                                  setHasChanged(true);

                                  window.requestAnimationFrame(() => {
                                    const adj =
                                      val.length < input.value.length ? -1 : 0;
                                    input.setSelectionRange(
                                      start + adj,
                                      start + adj,
                                    );
                                  });
                                }}
                                onBlur={() => {
                                  if (isReadOnly) return;
                                  let current = (row.furtherTax ?? "").trim();

                                  if (
                                    current === "" ||
                                    isNaN(Number(current))
                                  ) {
                                    handleInputChange(index, "furtherTax", "0");
                                  } else {
                                    handleInputChange(
                                      index,
                                      "furtherTax",
                                      Number(current).toString(),
                                    );
                                  }
                                  setHasChanged(true);
                                }}
                                className={`w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all

                                  ${
                                    isReadOnly ||
                                    permissions.can_edit_furthur_tax === 0
                                      ? "bg-slate-50 text-slate-400 cursor-not-allowed"
                                      : "bg-white text-slate-800 focus:ring-1 focus:ring-blue-500 outline-none"
                                  }`}
                                readOnly={
                                  isReadOnly ||
                                  permissions.can_edit_furthur_tax === 0
                                }
                                inputMode="decimal"
                                pattern="[0-9]*\.?[0-9]*"
                                placeholder="0.00"
                              />
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                              {/* {row.sroOptions && row.sroOptions.length > 0 ? ( */}
                              {Array.isArray(row.sroOptions) &&
                              row.sroOptions.length > 0 ? (
                                <select
                                  key={`select-${row.rateId}`} // 👈 force re-mount when rate changes
                                  value={row.sroScheduleId ?? ""}
                                  onChange={(e) => {
                                    handleInputChange(
                                      index,
                                      "sroScheduleId",
                                      e.target.value,
                                    );
                                    setHasChanged(true);
                                  }}
                                  className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                                  readOnly={
                                    isReadOnly ||
                                    permissions.can_edit_sro_schedule === 0
                                  }
                                >
                                  <option value="">Select SRO</option>
                                  {row.sroOptions.map((opt) => {
                                    const key =
                                      opt.sro_id ?? opt.srO_ID ?? opt.id;
                                    const label =
                                      opt.srO_DESC ??
                                      opt.sroScheduleNo ??
                                      String(opt);
                                    const value = String(key);
                                    return (
                                      <option key={key} value={value}>
                                        {label}
                                      </option>
                                    );
                                  })}
                                </select>
                              ) : (
                                <input
                                  key={`input-${row.rateId}`} // 👈 force re-mount
                                  name="sroScheduleNo"
                                  value={row.sroScheduleNo ?? ""}
                                  onChange={(e) => {
                                    handleInputChange(
                                      index,
                                      "sroScheduleNo",
                                      e.target.value,
                                    );
                                    setHasChanged(true);
                                  }}
                                  className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                                  readOnly
                                />
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="text"
                                name="fedPayable"
                                value={row.fedPayable ?? ""}
                                // Standard behavior: click anywhere to edit without auto-highlighting everything
                                onChange={(e) => {
                                  if (
                                    isReadOnly ||
                                    permissions.can_edit_fed_payable === 0
                                  )
                                    return;

                                  const input = e.target;
                                  const start = input.selectionStart; // 1. Capture cursor position
                                  let val = input.value;

                                  // 2. SMART ZERO HANDLING:
                                  // Removes the leading '0' if you type a number at the start of '0.00'
                                  if (
                                    val.length > 1 &&
                                    val.startsWith("0") &&
                                    val[1] !== "."
                                  ) {
                                    val = val.substring(1);
                                  }

                                  // 3. Update parent state
                                  handleInputChange(index, "fedPayable", val);
                                  setHasChanged(true);

                                  // 4. RESTORE CURSOR:
                                  // requestAnimationFrame ensures the blinking cursor stays exactly where you are typing
                                  window.requestAnimationFrame(() => {
                                    const adj =
                                      val.length < input.value.length ? -1 : 0;
                                    input.setSelectionRange(
                                      start + adj,
                                      start + adj,
                                    );
                                  });
                                }}
                                onBlur={() => {
                                  if (isReadOnly) return;
                                  let current = (row.fedPayable ?? "").trim();

                                  // 5. Normalize value on exit
                                  if (
                                    current === "" ||
                                    isNaN(Number(current))
                                  ) {
                                    handleInputChange(
                                      index,
                                      "fedPayable",
                                      "0.00",
                                    );
                                  } else {
                                    handleInputChange(
                                      index,
                                      "fedPayable",
                                      Number(current).toString(),
                                    );
                                  }
                                  setHasChanged(true);
                                }}
                                className={`w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all

                                  ${
                                    isReadOnly ||
                                    permissions.can_edit_fed_payable === 0
                                      ? "bg-slate-50 text-slate-400 cursor-not-allowed"
                                      : "bg-white text-slate-800 focus:ring-1 focus:ring-blue-500 outline-none"
                                  }`}
                                readOnly={
                                  isReadOnly ||
                                  permissions.can_edit_fed_payable === 0
                                }
                                inputMode="decimal"
                                pattern="[0-9]*\.?[0-9]*"
                                placeholder="0.00"
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="text"
                                name="discount"
                                value={row.discount ?? ""}
                                // Standard behavior: click anywhere to edit without the "select-all" bypass
                                onChange={(e) => {
                                  if (isReadOnly) return;

                                  const input = e.target;
                                  const start = input.selectionStart; // 1. Capture cursor position
                                  let val = input.value;

                                  // 2. SMART ZERO HANDLING:
                                  // Removes the '0' if you type a digit at the start of '0.0000'
                                  if (
                                    val.length > 1 &&
                                    val.startsWith("0") &&
                                    val[1] !== "."
                                  ) {
                                    val = val.substring(1);
                                  }

                                  // 3. Update state
                                  handleInputChange(index, "discount", val);
                                  setHasChanged(true);

                                  // 4. RESTORE CURSOR:
                                  // requestAnimationFrame keeps the blinking cursor exactly where you are typing
                                  window.requestAnimationFrame(() => {
                                    const adj =
                                      val.length < input.value.length ? -1 : 0;
                                    input.setSelectionRange(
                                      start + adj,
                                      start + adj,
                                    );
                                  });
                                }}
                                onBlur={() => {
                                  if (isReadOnly) return;
                                  let current = (row.discount ?? "").trim();

                                  // 5. Normalize value on exit
                                  if (
                                    current === "" ||
                                    isNaN(Number(current))
                                  ) {
                                    handleInputChange(
                                      index,
                                      "discount",
                                      "0.0000",
                                    );
                                  } else {
                                    handleInputChange(
                                      index,
                                      "discount",
                                      Number(current).toString(),
                                    );
                                  }
                                  setHasChanged(true);
                                }}
                                className={`w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all

                                   ${
                                     isReadOnly
                                       ? "bg-slate-50 text-slate-400"
                                       : "bg-white text-slate-800 focus:ring-1 focus:ring-blue-500 outline-none"
                                   }`}
                                readOnly={isReadOnly}
                                inputMode="decimal"
                                pattern="[0-9]*\.?[0-9]*"
                                placeholder="0.0000"
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {row.sroItemOptions &&
                              row.sroItemOptions.length > 0 ? (
                                <select
                                  value={row.sroItemId ?? ""}
                                  onChange={(e) => {
                                    handleInputChange(
                                      index,
                                      "sroItemId",
                                      e.target.value,
                                    );
                                    setHasChanged(true);
                                  }}
                                  className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                                  readOnly={
                                    isReadOnly ||
                                    permissions.can_edit_sro_item === 0
                                  }
                                >
                                  <option value="">Select Item</option>
                                  {row.sroItemOptions.map((opt) => {
                                    const key = opt.srO_ITEM_ID ?? opt.id;
                                    return (
                                      <option key={key} value={String(key)}>
                                        {opt.srO_ITEM_DESC ?? String(opt)}
                                      </option>
                                    );
                                  })}
                                </select>
                              ) : (
                                <input
                                  name="sroItemSerialNo"
                                  value={row.sroItemSerialNo ?? ""}
                                  onChange={(e) => {
                                    handleInputChange(
                                      index,
                                      "sroItemSerialNo",
                                      e.target.value,
                                    );
                                    setHasChanged(true);
                                  }}
                                  className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                                  readOnly={
                                    isReadOnly ||
                                    permissions.can_edit_sro_item === 0
                                  }
                                />
                              )}

                              <input
                                type="hidden"
                                name={`rows[${index}].sroItemId`}
                                value={row.sroItemId ?? ""}
                              />
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="text"
                                name="internalQty"
                                // value={row.qty}
                                value={row.internalQty ?? ""}
                                // onChange={(e) => handleInputChange(index, "qty", e.target.value)}
                                onChange={(e) => {
                                  if (isReadOnly) return;

                                  let val = e.target.value;

                                  const decimalMatch = val.match(/\.(\d*)/);
                                  const hasDecimal = decimalMatch !== null;
                                  const decimalDigits = hasDecimal
                                    ? decimalMatch[1].length
                                    : 0;

                                  if (decimalDigits > 4) return;

                                  const cleaned = val
                                    .replace(/[^0-9.]/g, "")
                                    .replace(/(\..*?)\./g, "$1");

                                  handleInputChange(
                                    index,
                                    "internalQty",
                                    cleaned,
                                  );
                                  setHasChanged(true);
                                }}
                                onBlur={() => {
                                  if (isReadOnly) return;

                                  let current = (row.internalQty ?? "").trim();

                                  if (current === "") {
                                    handleInputChange(
                                      index,
                                      "internalQty",
                                      "0.0000",
                                    );
                                    setHasChanged(true);
                                    return;
                                  }

                                  const num = Number(current);
                                  if (!isNaN(num) && num >= 0) {
                                    handleInputChange(
                                      index,
                                      "internalQty",
                                      num.toString(),
                                    );
                                    setHasChanged(true);
                                  } else {
                                    handleInputChange(
                                      index,
                                      "internalQty",
                                      "0.0000",
                                    );
                                    setHasChanged(true);
                                  }
                                }}
                                className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                                readOnly={isReadOnly}
                                inputMode="decimal"
                                pattern="[0-9]*\.?[0-9]*"
                                placeholder="1.0000"
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="text"
                                name="internalSinglePrice"
                                // value={row.qty}
                                value={row.internalSinglePrice ?? ""}
                                // onChange={(e) => handleInputChange(index, "qty", e.target.value)}
                                onChange={(e) => {
                                  if (isReadOnly) return;

                                  let val = e.target.value;

                                  const decimalMatch = val.match(/\.(\d*)/);
                                  const hasDecimal = decimalMatch !== null;
                                  const decimalDigits = hasDecimal
                                    ? decimalMatch[1].length
                                    : 0;

                                  if (decimalDigits > 4) return;

                                  const cleaned = val
                                    .replace(/[^0-9.]/g, "")
                                    .replace(/(\..*?)\./g, "$0");

                                  handleInputChange(
                                    index,
                                    "internalSinglePrice",
                                    cleaned,
                                  );
                                  setHasChanged(true);
                                }}
                                onBlur={() => {
                                  if (isReadOnly) return;

                                  let current = (
                                    row.internalSinglePrice ?? ""
                                  ).trim();

                                  if (current === "") {
                                    handleInputChange(
                                      index,
                                      "internalSinglePrice",
                                      "0.0000",
                                    );
                                    setHasChanged(true);
                                    return;
                                  }

                                  const num = Number(current);
                                  if (!isNaN(num) && num >= 0) {
                                    handleInputChange(
                                      index,
                                      "internalSinglePrice",
                                      num.toString(),
                                    );
                                    setHasChanged(true);
                                  } else {
                                    handleInputChange(
                                      index,
                                      "internalSinglePrice",
                                      "0.0000",
                                    );
                                    setHasChanged(true);
                                  }
                                }}
                                className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                                readOnly={
                                  isReadOnly ||
                                  permissions.can_edit_internal_single_unit_price ===
                                    0
                                }
                                inputMode="decimal"
                                pattern="[0-9]*\.?[0-9]*"
                                placeholder="1.0000"
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                name="internalUOM"
                                value={row.internalUOM ?? ""}
                                onChange={(e) => {
                                  handleInputChange(
                                    index,
                                    "internalUOM",
                                    e.target.value,
                                  );
                                  setHasChanged(true);
                                }}
                                className="w-full px-4 py-3 bg-slate-50 rounded-lg outline-none shadow-md focus:shadow-blue-200 transition-all"
                                readOnly={
                                  isReadOnly ||
                                  permissions.can_edit_internal_uom === 0
                                }
                              />
                            </td>
                            <td
                              className="px-4 py-3 whitespace-nowrap text-center"
                              style={{
                                position: "sticky",
                                right: 0,
                                background: "white",
                                zIndex: 10,
                              }}
                            >
                              <button
                                type="button"
                                className={`bg-red-500 text-white px-3 py-1 rounded 
                                  ${isReadOnly ? "opacity-50 cursor-not-allowed" : ""}`}
                                onClick={() => {
                                  if (!isReadOnly) {
                                    removeRow(index);
                                    setHasChanged(true);
                                  }
                                }}
                                disabled={isReadOnly}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    {/* Add Row Button */}
                    <button
                      type="button"
                      onClick={() => {
                        addRow();
                        setHasChanged(true);
                      }}
                      disabled={isReadOnly}
                      className={`h-8 px-3 text-sm rounded bg-blue-600 text-white ${isReadOnly ? "opacity-50 cursor-not-allowed" : ""} `}
                    >
                      Add Row
                    </button>

                    {/* Totals */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-11 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">
                          Total Products
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                          {invoiceForm.totalProducts || rows.length}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">
                          Total Qty
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                          {invoiceForm.totalQty || "0.0000"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">
                          Excl Tax
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                          {invoiceForm.exclTax || "0.00"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">
                          Sales Tax
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                          {invoiceForm.tax || "0.00"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">
                          Further Tax
                        </span>
                        <span className="text-sm font-bold text-orange-600">
                          {invoiceForm.totalFurtherTax || "0.00"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">
                          Extra Tax
                        </span>
                        <span className="text-sm font-bold text-orange-600">
                          {invoiceForm.totalExtraTax || "0.00"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">
                          ST Withheld
                        </span>
                        <span className="text-sm font-bold text-orange-600">
                          {invoiceForm.totalSalesTaxWithheld || "0.00"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">
                          FED Payable
                        </span>
                        <span className="text-sm font-bold text-orange-600">
                          {invoiceForm.totalFedPayable || "0.00"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">
                          236H Tax
                        </span>
                        <span className="text-sm font-bold text-purple-600">
                          {invoiceForm.total236HTax || "0.00"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">
                          Incl. Tax
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                          {invoiceForm.inclTax || "0.00"}
                        </span>
                      </div>
                      <div className="flex flex-col md:col-span-4 lg:col-span-1 lg:text-right border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-4 pt-3 lg:pt-0">
                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">
                          Grand Total
                        </span>
                        <span className="text-lg font-black text-blue-600 leading-none mt-1">
                          {invoiceForm.grandTotal || "0.00"}
                        </span>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        <div className="overflow-x-auto custom-scroll">
          <div className="flex flex-col md:flex-row justify-between items-center p-4 rounded-lg shadow-md mb-4 gap-4">
            <div className="flex gap-4 items-center w-full md:w-auto">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  max={endDate || todayStr}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border rounded px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  max={todayStr}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border rounded px-3 py-1.5 text-sm"
                />
              </div>
              {/* <button
                onClick={fetchInvoices}
                className="mt-5 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 font-medium text-sm"
              >
                Filter
              </button> */}
            </div>

            <div className="flex gap-2 w-full md:w-auto justify-end mt-4 md:mt-0 items-end">
              {canBatchValidate && (
                <button
                  onClick={handleBatchValidate}
                  disabled={isBatchProcessing}
                  className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                >
                  {isBatchProcessing
                    ? "Validating..."
                    : `Validate Selected (${selectedInvoices.length})`}
                </button>
              )}
              {canBatchPost && (
                <button
                  onClick={handleBatchPostToFBR}
                  disabled={isBatchProcessing}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                >
                  {isBatchProcessing
                    ? "Posting..."
                    : `Post Selected to FBR (${selectedInvoices.length})`}
                </button>
              )}
              {canBatchPrint && (
                <button
                  onClick={handleBatchPrint}
                  className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                >
                  Print Selected ({selectedInvoices.length})
                </button>
              )}
            </div>
          </div>
          {/* Removed pb-64 and min-height */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto custom-scroll">
            <table className="min-w-max text-sm text-left">
              <thead className="bg-gray-200 border-b border-slate-100">
                <tr>
                  <th className="p-4">
                    {/* Fixed "Select All" Alignment */}
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <input
                        type="checkbox"
                        ref={selectAllRef}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                        onChange={handleSelectAll}
                        checked={
                          invoices.length > 0 &&
                          selectedInvoices.length === invoices.length
                        }
                      />
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        Select All
                      </span>
                    </div>
                  </th>
                  {/* {[
                    "Int. Inv. Ref No.",
                    "Inv. Date",
                    "Created Date",
                    "P/O No.",
                    "P/O Date",
                    "Buyer",
                    "Items",
                    "Excl. Tax",
                    "Tax",
                    "Other Taxes",
                    "Total",
                    "Status",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))} */}
                  {[
                    { label: "Int. Inv. Ref No.", width: "130px" },
                    { label: "Inv. Date", width: "110px" },
                    { label: "Created Date", width: "120px" },
                    {
                      label:
                        fields.find((f) => f.name === "Challan No")
                          ?.user_defined_display_name || "Challan No.",
                      width: "100px",
                    },
                    {
                      label:
                        fields.find((f) => f.name === "Challan Date")
                          ?.user_defined_display_name || "Challan Date",
                      width: "110px",
                    },
                    { label: "Buyer", width: "200px" },
                    { label: "Items", width: "80px" },
                    { label: "Excl. Tax", width: "120px" },
                    { label: "Tax", width: "100px" },
                    { label: "Other Taxes", width: "120px" },
                    { label: "Total", width: "120px" },
                    { label: "Status", width: "110px" },
                    { label: "Action", width: "100px" },
                  ].map((h) => (
                    <th
                      key={h.label}
                      style={{ minWidth: h.width }}
                      className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-wider whitespace-nowrap"
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => {
                  const totalQty =
                    inv.items?.reduce(
                      (sum, item) => sum + Number(item.qty || 0),
                      0,
                    ) || 0;
                  // const otherTaxesSum =
                  //   inv.items?.reduce(
                  //     (sum, item) =>
                  //       sum +
                  //       Number(item.fedPayable || 0) +
                  //       Number(item.furtherTax || 0) +
                  //       Number(item.extraTax || 0) +
                  //       Number(item.calculated236H || 0),
                  //     0,
                  //   ) || 0;
                  const otherTaxesSum =
                    inv.items?.reduce((sum, item) => {
                      // Get the base row monetary value
                      const exclVal = Number(item.valueSalesExcludingST || 0);

                      // Convert percentage rates to actual monetary amounts
                      const fedAmt =
                        (exclVal * Number(item.fedPayable || 0)) / 100;
                      const furtherAmt =
                        (exclVal * Number(item.furtherTax || 0)) / 100;
                      const extraAmt =
                        (exclVal * Number(item.extraTax || 0)) / 100;

                      // Calculate 236H monetary amount using the invoice-level percentage
                      const rate236H = Number(inv.tax236H || 0);
                      const tax236HAmt = (inv.total * rate236H) / 100;

                      // Add them all up cleanly
                      return sum + fedAmt + furtherAmt + extraAmt + tax236HAmt;
                    }, 0) || 0;

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-blue-600"
                          checked={selectedInvoices.includes(inv.id)}
                          onChange={() => handleSelectRow(inv.id)}
                        />
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap font-mono text-xs text-slate-500">
                        {inv.internal_inv_ref_no || "-"}
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        {inv.invoice_date
                          ? formatDateForInput(inv.invoice_date)
                          : "-"}
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap text-slate-400 text-xs">
                        {inv.invoice_created_date
                          ? formatDateForInput(inv.invoice_created_date)
                          : "-"}
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap font-bold">
                        {inv.challanNo || "-"}
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        {inv.challanDate
                          ? formatDateForInput(inv.challanDate)
                          : "-"}
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap font-bold text-blue-600">
                        {inv.customer_name + " - " + inv.ntn || "-"}
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap font-bold">
                        {totalQty}
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        {/* {Number(inv.exclTax).toLocaleString()} */}
                        {Number(
                          String(inv.exclTax).replace(/,/g, ""),
                        ).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        {Number(
                          String(inv.tax).replace(/,/g, ""),
                        ).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap font-bold text-orange-600">
                        {otherTaxesSum.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap font-black">
                        {Number(
                          String(inv.inclTax || 0).replace(/,/g, ""),
                        ).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        {getStatusBadge(inv.status, inv.id)}
                      </td>

                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={(e) => toggleMenu(e, inv.id)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            menuConfig.id === inv.id
                              ? "bg-blue-600 text-white shadow-lg"
                              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                          }`}
                        >
                          Actions {menuConfig.id === inv.id ? "▴" : "▾"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          {menuConfig.open &&
  (() => {
    const currentInv = invoices.find((i) => i.id === menuConfig.id);
    if (!currentInv) return null;

    // Evaluates if either this specific row is executing OR a batch loop is live
    const isUiLocked = 
      currentInv.status === "Processing" || 
      processingInvoiceId === currentInv.id || 
      isBatchProcessing;

    return (
      <div
        style={{ top: menuConfig.top, left: menuConfig.left }}
        className="fixed w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[999] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-2 space-y-1">
          
          {/* VIEW DETAILS */}
          <button
            onClick={() => {
              if (isUiLocked) return;
              handleViewInvoice(currentInv);
              setMenuConfig({ open: false, id: null, top: 0, left: 0 });
            }}
            disabled={isUiLocked}
            className={`w-full text-left px-4 py-2.5 text-[11px] font-bold text-slate-700 hover:bg-blue-50 rounded-lg flex items-center gap-3 transition-opacity ${
              isUiLocked ? "opacity-40 cursor-not-allowed" : ""
            }`}
          >
            <Layers size={14} /> View Details
          </button>

          {/* VALIDATE INVOICE */}
          {["Pending", "Failed"].includes(currentInv.status) && (
            <button
              onClick={async () => {
                if (isUiLocked) return;
                setMenuConfig({ open: false, id: null, top: 0, left: 0 });
                // Reuses your existing individual inline validate function
                if (typeof validateInvoiceDirectly === "function") {
                  await validateInvoiceDirectly(currentInv);
                }
              }}
              disabled={isUiLocked}
              className={`w-full text-left px-4 py-2.5 text-[11px] font-bold text-amber-600 hover:bg-amber-50 rounded-lg flex items-center gap-3 transition-opacity ${
                isUiLocked ? "opacity-40 cursor-not-allowed" : ""
              }`}
            >
              <Calculator size={14} /> Validate Invoice
            </button>
          )}

          {/* POST TO FBR */}
          {currentInv.status === "Validated" &&
            permissions.can_post_invoice === 1 &&
            minUnpostedInvoiceNo == currentInv.invoice_no && (
              <button
                onClick={async () => {
                  if (isUiLocked) return;
                  setMenuConfig({ open: false, id: null, top: 0, left: 0 });
                  await postInvoiceToFBR(currentInv.id);
                }}
                disabled={isUiLocked}
                className={`w-full text-left px-4 py-2.5 text-[11px] font-bold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-3 transition-opacity ${
                  isUiLocked ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                <Check size={14} /> Post to FBR
              </button>
            )}

          {/* PRINT INVOICE */}
          <button
            onClick={async () => {
              if (isUiLocked) return;
              setMenuConfig({ open: false, id: null, top: 0, left: 0 });
              try {
                // await handlePrintInvoice(
                //   currentInv,
                //   customers,
                //   scenarioCodes,
                //   invoices,
                //   formatDateForInput,
                //   formatNumber,
                //   shouldShow,
                //   shouldShowHeader,
                //   fields,
                // );
                await  printInvoice(currentInv)
              } catch (printErr) {
                console.error("Print Error:", printErr);
              }
            }}
            disabled={isUiLocked}
            className={`w-full text-left px-4 py-2.5 text-[11px] font-bold text-slate-700 hover:bg-blue-50 rounded-lg flex items-center gap-3 transition-opacity ${
              isUiLocked ? "opacity-40 cursor-not-allowed" : ""
            }`}
          >
            <Settings size={14} /> Print Invoice
          </button>

          {/* DELETE INVOICE */}
          {["Pending", "Failed", "Validated"].includes(currentInv.status) &&
            permissions.can_delete_invoice === 1 && (
              <button
                onClick={async () => {
                  if (isUiLocked) return;
                  setMenuConfig({ open: false, id: null, top: 0, left: 0 });
                  await deleteInvoice(currentInv.id);
                }}
                disabled={isUiLocked}
                className={`w-full text-left px-4 py-2.5 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-3 transition-opacity border-t border-slate-100 pt-2 ${
                  isUiLocked ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                <Trash2 size={14} /> Delete Invoice
              </button>
            )}

        </div>
      </div>
    );
  })()}
          </div>
        </div>
        {selectedError && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-gray-200">
              {/* Header */}
              <div className="p-5 border-b flex justify-between items-center bg-red-50">
                <div>
                  <h3 className="text-xl font-bold text-red-800">
                    Validation Errors
                  </h3>
                  <p className="text-sm text-red-600">
                    Please correct the following issues and re-submit.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedError(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors text-3xl leading-none"
                >
                  &times;
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-0 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-gray-50 shadow-sm">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold uppercase text-gray-500 border-b">
                        Item
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold uppercase text-gray-500 border-b">
                        Code
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold uppercase text-gray-500 border-b">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Array.isArray(selectedError) ? (
                      selectedError.map((err, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-red-50/30 transition-colors"
                        >
                          <td className="px-6 py-4 align-top">
                            <span className="inline-flex items-center justify-center bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-1 rounded">
                              {err.itemSNo || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 align-top">
                            <code className="text-xs font-mono font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                              {err.errorCode}
                            </code>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 leading-relaxed">
                            {err.error}
                            {err.status === "Invalid" && (
                              <span className="ml-2 text-[10px] uppercase font-bold text-orange-500">
                                [{err.status}]
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-10 text-center text-gray-500 italic"
                        >
                          No detailed error information available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="p-4 border-t bg-gray-50 flex justify-end">
                <button
                  onClick={() => setSelectedError(null)}
                  className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all active:scale-95 shadow-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="sticky -bottom-4 mt-auto z-40 bg-white border-t border-gray-200 py-3 flex flex-wrap justify-between md:justify-start gap-4 text-sm shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
        <div className="flex gap-2 bg-gray-50 border border-gray-200 rounded-lg p-2 shadow-sm">
          <div className="px-3 py-1 bg-gray-200 text-gray-800 rounded font-medium">
            Total: {invoiceStats.total}
          </div>
          <div className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded font-medium">
            Validated: {invoiceStats.validated}
          </div>
          <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded font-medium">
            Pending: {invoiceStats.pending}
          </div>
          <div className="px-3 py-1 bg-red-100 text-red-800 rounded font-medium">
            Failed: {invoiceStats.failed}
          </div>
        </div>

        {/* Financial Totals */}
        <div className="flex gap-4 bg-gray-50 border border-gray-200 rounded-lg p-2 shadow-sm px-4">
          <div className="flex flex-col justify-center">
            <span className="text-[10px] text-gray-500 uppercase font-bold leading-none">
              Excl. Tax
            </span>
            <span className="font-semibold text-gray-800">
              {invoiceStats.sumExcl.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="w-px bg-gray-300 my-1"></div>
          <div className="flex flex-col justify-center">
            <span className="text-[10px] text-gray-500 uppercase font-bold leading-none">
              Tax
            </span>
            <span className="font-semibold text-gray-800">
              {invoiceStats.sumTax.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="w-px bg-gray-300 my-1"></div>
          <div className="flex flex-col justify-center">
            <span className="text-[10px] text-gray-500 uppercase font-bold leading-none">
              Incl. Tax
            </span>
            <span className="font-bold text-blue-600">
              {invoiceStats.sumIncl.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
