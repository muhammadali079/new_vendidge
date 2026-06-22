"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  ChevronDown,
  Check,
  X,
  ArrowRight,
  Loader2,
  Trash2,
  ShieldCheck,
  Send,
  Printer,
  AlertCircle,
} from "lucide-react";

// --- PROJECT UTILITIES ---
import { getFbrPayload } from "../../utils/fbrPayload";
import {
  handlePrintInvoice,
  handleBatchPrintInvoices,
} from "../../utils/printInvoice";

export default function ConsultantMasterInvoices() {
  const router = useRouter();
  const [perms, setPerms] = useState({});

  useEffect(() => {
    const stored = JSON.parse(sessionStorage.getItem("permissions") || "{}");
    setPerms(stored);
  }, []);

  // --- DATA & UI STATES ---
  const [invoices, setInvoices] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [scenarioCodes, setScenarioCodes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingInvoices, setIsFetchingInvoices] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [minUnpostedInvoiceNo, setMinUnpostedInvoiceNo] = useState(null);

  // --- FILTER & SELECTION STATES ---
  const [selectedClients, setSelectedClients] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("master_selected_clients");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [selectedInvoices, setSelectedInvoices] = useState([]);

  const [dateRange, setDateRange] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("master_date_range");
      if (saved) return JSON.parse(saved);
    }
    return {
      start: "2026-01-01",
      end: new Date().toISOString().split("T")[0],
    };
  });
  useEffect(() => {
    sessionStorage.setItem(
      "master_selected_clients",
      JSON.stringify(selectedClients),
    );
  }, [selectedClients]);

  useEffect(() => {
    sessionStorage.setItem("master_date_range", JSON.stringify(dateRange));
  }, [dateRange]);

  const [searchQuery, setSearchQuery] = useState("");

  // --- ERROR MODAL STATES ---
  const [selectedError, setSelectedError] = useState(null);
  const [isLoadingError, setIsLoadingError] = useState(null);

  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [targetClientForInvoice, setTargetClientForInvoice] = useState("");

  // --- 1. INITIAL FETCH: Clients, Scenarios, and Customers ---
  useEffect(() => {
    const initLedger = async () => {
      const consultantId =
        sessionStorage.getItem("consultantId") ||
        sessionStorage.getItem("userId");
      if (!consultantId) return;

      try {
        const [clientsRes, scRes] = await Promise.all([
          fetch(`/api/consultant/clients?consultantId=${consultantId}`),
          fetch("/api/scenarioCodes"),
        ]);

        if (clientsRes.ok) setAllClients(await clientsRes.json());
        if (scRes.ok) setScenarioCodes((await scRes.json()).scenarioCodes);
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };
    initLedger();
  }, []);

  // --- 2. DATA FETCH: Master Ledger (Agency View) ---
  const fetchMasterInvoices = useCallback(async () => {
    if (selectedClients.length === 0) {
      setInvoices([]);
      setIsFetchingInvoices(false);
      return;
    }
    setIsFetchingInvoices(true);
    const consultantId =
      sessionStorage.getItem("consultantId") ||
      sessionStorage.getItem("userId");
    try {
      const params = new URLSearchParams({
        consultantId,
        clients: selectedClients.join(","),
        startDate: dateRange.start,
        endDate: dateRange.end,
        search: searchQuery,
      });
      const res = await fetch(`/api/consultant/invoices?${params.toString()}`);
      if (res.ok) {
        const result = await res.json();
        setInvoices(result.data || []);
        if (result.userMinUnpostedInvoiceNo) {
          console.log(
            "Min Unposted Invoice No:",
            result.userMinUnpostedInvoiceNo,
          );
          setMinUnpostedInvoiceNo(result.userMinUnpostedInvoiceNo);
        }
      }
    } catch (err) {
      console.error("Ledger fetch error:", err);
    } finally {
      setIsFetchingInvoices(false);
    }
  }, [selectedClients, dateRange, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => fetchMasterInvoices(), 500);
    return () => clearTimeout(timer);
  }, [fetchMasterInvoices]);

  // --- 3. HELPERS & FORMATTERS (Shared with page.js) ---
  const formatDateForInput = (value) => {
    if (!value) return "";
    const d = new Date(value);
    return isNaN(d) ? "" : d.toISOString().split("T")[0];
  };

  const formatNumber = (num) =>
    Number(num).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const shouldShow = (fieldName, row = null, form = null) => {
    const f = fields.find((f) => f.name === fieldName);
    console.log("field", fieldName, fields, f);
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
          default:
            return false;
        }
      });
    }

    return true;
  };

  const handlePrintDirectly = async (inv) => {
    // Use existing items and user info already in the invoice object from the route
    // setupContextAndRoute(
    //   allClients.find((c) => c.id === inv.user_id),
    //   inv.invoice_no,
    // );
     let freshCustomersList = customers;
     let freshFieldsList = fields;

    console.log(
      "Invoice for printing:",
      inv.address || "",
      inv.province || "",
      inv.province_id || "",
      inv.seller_invoice_ntn || "",
    );

    sessionStorage.setItem("sellerAddress", inv.address || "");
    sessionStorage.setItem("sellerProvince", inv.province || "");
    sessionStorage.setItem("sellerProvinceId", inv.province_id || "");
    sessionStorage.setItem("sellerInvoiceNTN", inv.seller_invoice_ntn || "");
    sessionStorage.setItem("sellerBusinessName", inv.sellerBusinessName || "");
    const custRes = await fetch(`/api/customer?userId=${inv.user_id}`);
    if (custRes.ok){
      const data = await custRes.json();
      freshCustomersList = data; 
      setCustomers(data);
    } 
    const fieldRes = await fetch(
      `/api/userChoosableFields?userId=${Number(sessionStorage.getItem("userId"))}&role=${sessionStorage.getItem("role")}`,
    );
    if (fieldRes.ok) {
        const data = await fieldRes.json();
      freshFieldsList = data; 
      setFields(data);
    }
    const mockForm = {
      invoiceNo: inv.invoice_no,
      date: inv.invoice_date,
      customer: inv.customer_name,
      customerId: inv.customer_id,
      buyerProvince: inv.buyerProvince,
      challanNo: inv.challanNo,
      challan_date: inv.challanDate,
      invoice_posted_date: inv.invoice_posted_date,
    };
    console.log("inv cusotmer ", inv.customer_name);

    await handlePrintInvoice(
      inv, // targetInvoice
      inv, // invoiceForm
      freshCustomersList, // Metadata from your Consultant state
      inv.items || [], // Pre-hydrated items
      scenarioCodes,
      invoices,
      formatDateForInput,
      formatNumber,
      shouldShow,
      shouldShowHeader,
      freshFieldsList,
    );
  };
  const handleBatchPrint = async () => {
    if (selectedInvoices.length === 0) return;

    const selectedObjs = invoices.filter((inv) =>
      selectedInvoices.includes(inv.id),
    );

    console.dir(invoices);

    // 1. Set seller context from the first selected invoice
    // This ensures the batch print header uses the correct seller info
    const firstInv = selectedObjs[0];
    sessionStorage.setItem("sellerAddress", firstInv.address || "");
    sessionStorage.setItem("sellerProvince", firstInv.province || "");
    sessionStorage.setItem("sellerProvinceId", firstInv.province_id || "");
    sessionStorage.setItem(
      "sellerInvoiceNTN",
      firstInv.seller_invoice_ntn || "",
    );
    sessionStorage.setItem(
      "sellerBusinessName",
      firstInv.sellerBusinessName || "",
    );

    // 2. Fetch specific metadata for this client context
    // We use Promise.all to fetch both customers and fields in parallel for speed
    try {
      const [custRes, fieldRes] = await Promise.all([
        fetch(`/api/customer?userId=${firstInv.user_id}`),
        fetch(
          `/api/userChoosableFields?userId=${Number(sessionStorage.getItem("userId"))}&role=${sessionStorage.getItem("role")}`,
        ),
      ]);

      let batchCustomers = customers;
      if (custRes.ok) {
        batchCustomers = await custRes.json();
        setCustomers(batchCustomers);
      }

      let freshFields = fields;
      if (fieldRes.ok) {
         freshFields = await fieldRes.json();
        setFields(freshFields);
      }

      // 3. Call Batch Print with CORRECT parameter sequence
      // The utility requires 'invoices' as the 4th argument to resolve FBR numbers
      await handleBatchPrintInvoices(
        selectedObjs, // targetInvoices
        batchCustomers, // customers
        scenarioCodes, // scenarioCodes
        invoices, // ADDED: full invoices list (missing in your snippet)
        formatDateForInput,
        formatNumber,
        shouldShow,
        shouldShowHeader,
        freshFields,
      );
    } catch (error) {
      console.error("Batch print preparation failed:", error);
      alert("Failed to prepare batch print metadata.");
    }
  };

  const handleErrorClick = async (invoiceId) => {
    setIsLoadingError(invoiceId);
    try {
      const response = await fetch(`/api/invoices-error?id=${invoiceId}`);
      const data = await response.json();
      setSelectedError(
        typeof data.errorData === "string"
          ? JSON.parse(data.errorData)
          : data.errorData,
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingError(null);
    }
  };

  const handleDelete = async (invoiceId) => {
    if (
      !confirm("Confirm permanent deletion? This re-indexes invoice numbers.")
    )
      return;
    setProcessingId(invoiceId);
    try {
      // Uses DELETE method on CRUD route
      const res = await fetch(`/api/invoices-crud?invoiceId=${invoiceId}`, {
        method: "DELETE",
      });
      if (res.ok) fetchMasterInvoices();
    } catch (err) {
      console.error(err);
    }
    setProcessingId(null);
  };

  // --- 5. BATCH LOGIC ---

  const canBatchValidate = useMemo(
    () =>
      selectedInvoices.length > 0 &&
      invoices
        .filter((inv) => selectedInvoices.includes(inv.id))
        .every((inv) => ["Pending", "Failed"].includes(inv.status)),
    [selectedInvoices, invoices],
  );

  const handleValidateDirectly = async (inv) => {
    setProcessingId(inv.id);
    try {
      // Replicate the exact 'invoiceToSubmit' structure from endUser-invoice page
      const invoiceToSubmit = {
       
        userId: Number(inv.user_id),
        invoiceNo: inv.invoice_no,
        internal_inv_ref_no : inv.internal_inv_ref_no,
        date: formatDateForInput(inv.invoice_date),
        customer: inv.customer_name,
        customerId: inv.customer_id,
        buyerProvince: inv.buyerProvince,
        sellerBusinessId: inv.sellerBusinessId,
        sellerBusinessName: inv.business_name || inv.sellerBusinessName,
        sellerProvince: inv.province || inv.sellerProvince || "",
        sellerProvinceId: Number(inv.province_id || inv.sellerProvinceId) || 0,
        sellerAddress: inv.address || inv.sellerBusinessAddress || "",
        sellerNTNCNIC: inv.seller_ntn || "",
        scenarioCode: inv.scenario_code,
        scenarioCodeId: inv.scenario_code_id,
        saleType: inv.saleType,
        fbrInvoiceRefNo: inv.fbrInvoiceRefNo || "",
        buyerType: inv.buyerType,
        challanNo: inv.challanNo || "",
        challanDate: inv.challanDate || "",
        exclTax: inv.exclTax || "0.0",
        tax: inv.tax || "0.0",
        inclTax: inv.inclTax || "0.0",
        // Map items exactly as done in endUser-invoice page rows.map
        items: (inv.items || []).map((item) => ({
          hsCode: item.hsCode,
          description: item.description,
          productId: item.productId,
          product_description: item.product_description,
          singleUnitPrice: item.singleUnitPrice,
          qty: item.qty,
          rateId: Number(item.rateId) || 0,
          rate:
            item.rate === undefined || item.rate === null
              ? ""
              : String(item.rate),
          rateDesc: item.rateDesc,
          unit: item.unit,
          totalValues: item.totalValues,
          valueSalesExcludingST: item.valueSalesExcludingST,
          fixedNotifiedValueOrRetailPrice:
            item.fixedNotifiedValueOrRetailPrice || "0.00",
          salesTaxApplicable: item.salesTaxApplicable,
          salesTaxWithheldAtSource: item.salesTaxWithheldAtSource || "0.00",
          extraTax: item.extraTax || "0.00",
          furtherTax: item.furtherTax || "0.00",
          sroScheduleNo: item.sroScheduleNo || "",
          sroScheduleId: Number(item.sroScheduleId) || 0,
          fedPayable: item.fedPayable || "0.00",
          discount: item.discount || "0.00",
          TransactionTypeId: Number(item.TransactionTypeId) || 0,
          TransactionType: item.TransactionType,
          sroItemSerialNo: item.sroItemSerialNo || "",
          sroItemId: Number(item.sroItemId) || 0,
          internalQty: Number(item.internalQty) || 0,
          internalSinglePrice: Number(item.internalSinglePrice) || 0,
          internalUOM: item.internalUOM || "",
        })),
      };

      const res = await fetch("/api/invoices-crud", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${inv.client_token}`,
        },
        body: JSON.stringify({
          invoiceId: inv.id,
          toValidate: true,
          ...invoiceToSubmit,
        }),
      });

      if (res.ok) {
      } else {
        const errorData = await res.json();
        console.warn("Validation error:", errorData.message);
        handleErrorClick(inv.id);
      }
    } catch (err) {
      console.error("Network error during validation:", err);
    } finally {
      setProcessingId(null);
      fetchMasterInvoices();
    }
  };

  const handleBatchValidate = async () => {
    if (!confirm(`Validate ${selectedInvoices.length} selected invoices?`))
      return;

    setIsBatchProcessing(true);
    const selectedObjs = invoices.filter((inv) =>
      selectedInvoices.includes(inv.id),
    );

    for (const inv of selectedObjs) {
      await handleValidateDirectly(inv);
    }

    setIsBatchProcessing(false);
    setSelectedInvoices([]);
  };

  // --- 6. CONTEXT & ROUTING (HIJACK) ---

  const setupContextAndRoute = (client, invoiceId = null) => {
    console.log("client ", client);
    sessionStorage.setItem("parent_id", client.parent_id);
    sessionStorage.setItem("userId", client.id);
    sessionStorage.setItem("sellerToken", client.token || "");
    sessionStorage.setItem("sellerProvince", client.province || "");
    sessionStorage.setItem("sellerProvinceId", client.provinceId || "");
    console.log("locations:", client.locations || []);
    sessionStorage.setItem(
      "businesses",
      JSON.stringify(client.businesses || []),
    );
    sessionStorage.setItem(
      "sellerBusinessName",
      client.sellerBusinessName || client.seller_name || "",
    );
    sessionStorage.setItem(
      "sellerNTNCNIC",
      client.cnic_ntn || client.invoice_ntn || "",
    );
    sessionStorage.setItem("activeConsultantMode", "true");

    if (invoiceId) sessionStorage.setItem("consultantEditInvoiceId", invoiceId);
    else sessionStorage.removeItem("consultantEditInvoiceId");

    router.push("/invoice");
  };

  const proceedToCreateInvoice = () => {
    const client = allClients.find(
      (c) => c.id.toString() === targetClientForInvoice,
    );
    if (client) setupContextAndRoute(client);
  };

  const handleToggleAllClients = () => {
    if (selectedClients.length === allClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(allClients.map((c) => c.id));
    }
  };

  const handleDateChange = (type, value) => {
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Karachi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    let { start, end } = dateRange;

    // Rule: No future dates allowed
    const safeValue = value > today ? today : value;

    if (type === "start") {
      start = safeValue;
      // Rule: End date cannot be before start date
      if (start > end) end = start;
    } else {
      end = safeValue;
      // Rule: Start date cannot be after end date
      if (end < start) start = end;
    }

    setDateRange({ start, end });
  };

  const [provinces, setProvinces] = useState([]);
  const [fields, setFields] = useState([]);
  const getFbrHeaders = () => {
    const token = sessionStorage.getItem("sellerToken");
    return token
      ? { Authorization: `Bearer ${token}`, Accept: "application/json" }
      : { Accept: "application/json" };
  };
  useEffect(() => {
    const loadMetadata = async () => {
      const [provRes] = await Promise.all([
        fetch("/api/fbr/provinces", { headers: getFbrHeaders() }),
      ]);
      if (provRes.ok) setProvinces((await provRes.json()).data);
    };
    loadMetadata();
  }, []);

  // --- REWRITTEN ACTION FUNCTIONS ---
  const canBatchPost = useMemo(() => {
    if (selectedInvoices.length === 0) return false;

    const selectedObjs = invoices.filter((inv) =>
      selectedInvoices.includes(inv.id),
    );

    // 1. All selected must be 'Validated'
    const allValidated = selectedObjs.every(
      (inv) => inv.status === "Validated",
    );
    if (!allValidated) return false;

    // 2. Group selection by userId to validate sequence per client
    const groupedByClient = selectedObjs.reduce((acc, inv) => {
      if (!acc[inv.user_id]) acc[inv.user_id] = [];
      acc[inv.user_id].push(inv);
      return acc;
    }, {});

    // 3. Validate Sequence for every client in the selection
    for (const userId in groupedByClient) {
      const clientSelected = groupedByClient[userId].sort(
        (a, b) => a.invoice_no - b.invoice_no,
      );
      const minUnposted = clientSelected[0].minUnpostedForUser; // From updated route

      // Does the selection start exactly at the next expected number?
      if (clientSelected[0].invoice_no !== minUnposted) return false;

      // Is the selection contiguous? (No gaps like 2 and 4 while 3 is missing)
      for (let i = 0; i < clientSelected.length; i++) {
        if (clientSelected[i].invoice_no !== minUnposted + i) {
          return false; // Gap found in sequence
        }
      }
    }

    return true;
  }, [selectedInvoices, invoices]);

  const handlePostToFBRDirectly = async (inv) => {
    if (!confirm("Post this invoice to FBR?")) return;
    setProcessingId(inv.id);

    try {
      let freshCustomersList = customers;
      const custRes = await fetch(`/api/customer?userId=${inv.user_id}`);
      if (custRes.ok) {
       const data = await custRes.json();
      freshCustomersList = data; 
      setCustomers(data);
      }
      sessionStorage.setItem("sellerAddress", inv.address || "");
      sessionStorage.setItem("sellerProvince", inv.province || "");
      sessionStorage.setItem("sellerProvinceId", inv.province_id || "");
      sessionStorage.setItem("sellerInvoiceNTN", inv.seller_invoice_ntn || "");
      sessionStorage.setItem("sellerNTNCNIC", inv.seller_ntn || "");
      sessionStorage.setItem(
        "sellerBusinessName",
        inv.business_name || inv.sellerBusinessName || "",
      );
      sessionStorage.setItem("businesses", JSON.stringify(inv.locations || []));

      // 2. DETECT PRODUCTION MODE
      const isProd =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("isProd="))
          ?.split("=")[1] === "1";

      // 3. GENERATE PAYLOAD (Matches EndUser logic exactly)
      // This utility handles the specific key order and SNxxx logic
      const payload = getFbrPayload(
        inv, // Matches targetInvoice structure
        inv.items || [], // Pre-hydrated items from updated route
        isProd,
        freshCustomersList,
        formatDateForInput,
      );

      // 4. EXECUTE POST
      const res = await fetch("/api/fbr/postInvoiceToFBR", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${inv.client_token || sessionStorage.getItem("sellerToken")}`,
        },
        body: JSON.stringify({
          ...payload, // Payload with correct FBR key order
          userId: inv.user_id,
          invoiceId: inv.id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Success: Refresh to update minUnpostedForUser
        fetchMasterInvoices();
      } else {
        alert(data.message || "FBR Rejected Invoice");
        fetchMasterInvoices();
      }
    } catch (err) {
      console.error("Post Error:", err);
    } finally {
      setProcessingId(null);
    }
  };


  const handleBatchPost = async () => {
    if (selectedInvoices.length === 0) return;
    if (!confirm(`Post ${selectedInvoices.length} invoices to FBR?`)) return;

    setIsBatchProcessing(true);

    // 1. Sort by invoice_no ASC to respect FBR sequence
    const selectedObjs = invoices
      .filter((inv) => selectedInvoices.includes(inv.id))
      .sort((a, b) => a.invoice_no - b.invoice_no);
    console.log(
      "Batch Post Selected Invoices (Sorted):",
      selectedObjs.map((inv) => `${inv.invoice_no} (User ${inv.user_id})`),
    );
    // 2. Process Sequentially
    for (const inv of selectedObjs) {
      if (
        inv.status === "Validated" &&
        inv.invoice_no === inv.minUnpostedForUser
      ) {
        try {
          // Reusing the direct handler for consistent sessionStorage/payload setup
          await handlePostToFBRDirectly(inv);

          // Re-fetch or locally update to ensure next loop sees new sequence
          // In a real batch, you might want to wait for state refresh
        } catch (err) {
          console.error(`Batch stopped at Invoice ${inv.invoice_no}`);
          break; // Stop batch on first failure to maintain sequence integrity
        }
      }
    }

    setIsBatchProcessing(false);
    setSelectedInvoices([]);
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
        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border transition-all ${map[status] || "bg-gray-100 text-gray-700"}`}
      >
        {status}
        {isLoadingError === invId && status === "Failed" && (
          <span className="ml-2 animate-spin inline-block">...</span>
        )}
      </span>
    );
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );

  return (
    <div className="max-w-8xl mx-auto space-y-6 pb-20 p-6 font-bold">
      {/* HEADER & BATCH ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Agency Master Ledger
          </h1>
          <p className="text-slate-500 font-medium">
            Bulk FBR validation and management.
          </p>
        </div>
        <div className="flex gap-3">
          {selectedInvoices.length > 0 && (
            <div className="flex gap-2 animate-in slide-in-from-right-2">
              {canBatchValidate && (
                <button
                  onClick={handleBatchValidate}
                  disabled={isBatchProcessing}
                  className="bg-indigo-50 text-indigo-600 px-4 py-3 rounded-2xl font-black border border-indigo-100 flex items-center gap-2 hover:bg-indigo-100 transition-all"
                >
                  <ShieldCheck size={18} />{" "}
                  {isBatchProcessing
                    ? "Processing..."
                    : `Validate (${selectedInvoices.length})`}
                </button>
              )}
              {canBatchPost && (
                <button
                  onClick={handleBatchPost}
                  disabled={isBatchProcessing}
                  className="bg-emerald-50 text-emerald-600 px-4 py-3 rounded-2xl font-black border border-emerald-100 flex items-center gap-2 hover:bg-emerald-100 transition-all"
                >
                  <Send size={18} />
                  {isBatchProcessing
                    ? "Posting..."
                    : `Post to FBR (${selectedInvoices.length})`}
                </button>
              )}
              <button
                onClick={handleBatchPrint}
                className="bg-slate-800 text-white px-4 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-slate-900 transition-all"
              >
                <Printer size={18} /> Print Batch
              </button>
            </div>
          )}
          {perms.can_create_invoice === 1 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg"
            >
              <Plus size={18} /> New Invoice
            </button>
          )}
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex flex-wrap lg:flex-nowrap items-center gap-4 z-20 relative">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search Invoice No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
          />
        </div>
        <div className="relative min-w-[250px]" ref={dropdownRef}>
          <button
            onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-300"
          >
            <div className="flex items-center gap-2 truncate">
              <Filter size={16} className="text-indigo-500" />
              <span className="text-slate-700 text-sm truncate font-black">
                {selectedClients.length === 0
                  ? "No Clients"
                  : selectedClients.length === allClients.length
                    ? "All Portfolios"
                    : `${selectedClients.length} Portfolios`}
              </span>
            </div>
            <ChevronDown size={16} className="text-slate-400" />
          </button>

          {isClientDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              {/* SELECT ALL OPTION */}
              <div
                onClick={handleToggleAllClients}
                className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-indigo-50 group"
              >
                <span className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-600">
                  {selectedClients.length === allClients.length
                    ? "Deselect All"
                    : "Select All Clients"}
                </span>
                <div
                  className={`h-5 w-5 rounded-md border-2 transition-all flex items-center justify-center ${selectedClients.length === allClients.length ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 bg-white"}`}
                >
                  {selectedClients.length === allClients.length && (
                    <Check size={14} strokeWidth={4} />
                  )}
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto p-2">
                {allClients.map((c) => (
                  <div
                    key={c.id}
                    onClick={() =>
                      setSelectedClients((prev) =>
                        prev.includes(c.id)
                          ? prev.filter((id) => id !== c.id)
                          : [...prev, c.id],
                      )
                    }
                    className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group"
                  >
                    <span className="text-sm text-slate-600 font-bold group-hover:text-slate-900 truncate pr-2">
                      {c.business_name || c.seller_name}
                    </span>
                    <div
                      className={`h-5 w-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${selectedClients.includes(c.id) ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-200 bg-white"}`}
                    >
                      {selectedClients.includes(c.id) && (
                        <Check size={14} strokeWidth={4} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-inner">
          <Calendar className="text-slate-400 ml-2" size={18} />
          <input
            type="date"
            max={new Date().toISOString().split("T")[0]}
            value={dateRange.start}
            onChange={(e) => handleDateChange("start", e.target.value)}
            className="bg-transparent border-none p-2 text-xs outline-none font-black text-indigo-600"
          />
          <span className="text-slate-300 font-black px-1">—</span>
          <input
            type="date"
            max={new Date().toISOString().split("T")[0]}
            value={dateRange.end}
            onChange={(e) => handleDateChange("end", e.target.value)}
            className="bg-transparent border-none p-2 text-xs outline-none font-black text-indigo-600"
          />
        </div>
      </div>

      {/* LEDGER TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase text-slate-400 tracking-widest font-black">
            <tr>
              <th className="px-6 py-4 w-10">
                <input
                  type="checkbox"
                  checked={
                    selectedInvoices.length === invoices.length &&
                    invoices.length > 0
                  }
                  onChange={(e) =>
                    setSelectedInvoices(
                      e.target.checked ? invoices.map((i) => i.id) : [],
                    )
                  }
                />
              </th>
              <th className="px-6 py-4">Client Portfolio</th>
              <th className="px-6 py-4">Invoice #</th>
              <th className="px-6 py-4">FBR Status</th>
              <th className="px-6 py-4">Total (PKR)</th>
              <th className="px-6 py-4 text-center">FBR Actions</th>
              <th className="px-6 py-4 text-right">Workspaces</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {selectedClients.length === 0 ? (
              /* NO CLIENT SELECTED STATE */
              <tr>
                <td colSpan="7" className="p-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-20 w-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-400 border-2 border-indigo-100 border-dashed">
                      <Filter size={32} />
                    </div>
                    <div className="max-w-xs">
                      <h4 className="text-slate-800 font-black text-lg">
                        No Portfolio Selected
                      </h4>
                      <p
                        className="text-slate-400 font-bold italic text-sm mt-2"
                        style={{ color: "#4f46e5" }}
                      >
                        Please select at least one client portfolio from the
                        filter above to load the master ledger.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : invoices.length === 0 && !isFetchingInvoices ? (
              /* NO INVOICES FOUND STATE */
              <tr>
                <td
                  colSpan="7"
                  className="p-20 text-center text-slate-400 font-bold italic text-sm"
                >
                  No invoices found for the selected criteria.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className={`hover:bg-slate-50 transition-all ${processingId === inv.id ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.includes(inv.id)}
                      onChange={() =>
                        setSelectedInvoices((prev) =>
                          prev.includes(inv.id)
                            ? prev.filter((id) => id !== inv.id)
                            : [...prev, inv.id],
                        )
                      }
                    />
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-slate-700 text-sm font-black">
                      {inv.sellerBusinessName || "N/A"}
                    </div>
                    <div className="text-[10px] text-slate-400 tracking-tighter">
                      {inv.ntn_cnic}
                    </div>
                  </td>
                  <td className="px-6 py-5 font-black text-indigo-600">
                    {inv.invoice_no}
                  </td>
                  <td className="px-6 py-5">
                    {processingId === inv.id
                      ? getStatusBadge("Processing", inv.id)
                      : getStatusBadge(inv.status, inv.id)}
                  </td>
                  <td className="px-6 py-5 font-black text-slate-900">
                    Rs {Number(inv.inclTax).toLocaleString()}
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-4">
                      {/* PRIMARY ACTION SLOT (Validate OR Post) */}
                      <div className="w-10 flex justify-center items-center">
                        {/* 1. VALIDATE: Shown for Pending or Failed */}
                        {inv.status === "Pending" || inv.status === "Failed" ? (
                          <button
                            disabled={processingId === inv.id}
                            onClick={() => handleValidateDirectly(inv)}
                            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                            title="Validate"
                          >
                            {processingId === inv.id ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <ShieldCheck size={16} />
                            )}
                          </button>
                        ) : /* 2. POST: Shown ONLY if Validated AND it's the next in line */
                          inv.status === "Validated" &&
                            inv.invoice_no === inv.minUnpostedForUser ? (
                            <button
                              disabled={processingId === inv.id}
                              onClick={() => handlePostToFBRDirectly(inv)}
                              className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                              title="Post to FBR"
                            >
                              {processingId === inv.id ? (
                                <Loader2 className="animate-spin" size={16} />
                              ) : (
                                <Send size={16} />
                              )}
                            </button>
                          ) : (
                            /* Placeholder to keep Print button in place if neither action is valid */
                            <div className="w-8" />
                          )}
                      </div>

                      {/* PERMANENT PRINT SLOT */}
                      <button
                        onClick={() => handlePrintDirectly(inv)}
                        className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-800 hover:text-white transition-all shadow-sm"
                        title="Print"
                      >
                        <Printer size={16} />
                      </button>
                    </div>
                  </td>
                  {/* <td className="px-6 py-5 text-right flex items-center justify-end gap-3">
                    <button
                      onClick={() =>
                        setupContextAndRoute(
                          allClients.find((c) => c.id === inv.user_id),
                          inv.invoice_no,
                        )
                      }
                      className="text-indigo-600 font-black text-xs hover:underline uppercase"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="text-red-500 font-black text-xs hover:underline uppercase"
                    >
                      Delete
                    </button>
                  </td> */}
                  <td className="px-6 py-5 text-right flex items-center justify-end gap-3">
                    {/* HIDE ACTION COMPLETELY if both perms are 0 */}
                    {(perms.can_edit_invoice === 1 ||
                      perms.can_view_invoice === 1) && (
                        <button
                          onClick={() =>
                            setupContextAndRoute(
                              allClients.find((c) => c.id === inv.user_id),
                              inv.invoice_no,
                            )
                          }
                          className="text-indigo-600 font-black text-xs hover:underline uppercase"
                        >
                          {/* Label changes based on Edit vs View permission */}
                          {perms.can_edit_invoice === 1 &&
                            inv.status !== "Success"
                            ? "Edit"
                            : "View"}
                        </button>
                      )}

                    {/* SILENT GUARD: Only show Delete if allowed */}
                    {perms.can_delete_invoice === 1 && (
                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="text-red-500 font-black text-xs hover:underline uppercase"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ERROR DETAILS MODAL */}
      {selectedError && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-bold">
          <div className="bg-white rounded-[2.5rem] max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b flex justify-between items-center bg-red-50">
              <h3 className="text-xl font-black text-red-800 flex items-center gap-2">
                <AlertCircle /> FBR Error Log
              </h3>
              <button
                onClick={() => setSelectedError(null)}
                className="text-slate-400 hover:text-red-600"
              >
                <X />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-0">
              <table className="w-full text-left font-bold text-sm">
                <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-black tracking-widest border-b">
                  <tr>
                    <th className="px-6 py-3">Code</th>
                    <th className="px-6 py-3">FBR Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedError.map((err, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 font-black text-red-600">
                        {err.errorCode}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{err.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE INVOICE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-black text-slate-800 mb-6 font-bold tracking-tight">
              Select Client Workspace
            </h2>
            <select
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black mb-6 appearance-none shadow-inner"
              value={targetClientForInvoice}
              onChange={(e) => setTargetClientForInvoice(e.target.value)}
            >
              <option value="" disabled>
                -- Choose Client Account --
              </option>
              {allClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.business_name || c.seller_name}
                </option>
              ))}
            </select>
            <button
              onClick={proceedToCreateInvoice}
              disabled={!targetClientForInvoice}
              className={`w-full p-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all ${targetClientForInvoice ? "bg-indigo-600 text-white shadow-lg" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
            >
              Open Portfolio <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
