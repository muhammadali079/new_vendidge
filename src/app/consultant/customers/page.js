// "use client";

// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { useRouter } from "next/navigation";
// import {
//   Plus,
//   Users,
//   Filter,
//   ArrowRight,
//   Loader2,
//   ChevronDown,
//   Check,
//   UserPlus,
//   Search,
// } from "lucide-react";

// export default function ConsultantCustomerLedger() {
//   const router = useRouter();
//   const dropdownRef = useRef(null);

//   // --- 1. PERSISTED STATE INITIALIZATION ---
//   const [selectedClients, setSelectedClients] = useState(() => {
//     if (typeof window !== "undefined") {
//       const saved = sessionStorage.getItem("customer_selected_clients");
//       return saved ? JSON.parse(saved) : [];
//     }
//     return [];
//   });

//   const [customers, setCustomers] = useState([]);
//   const [allClients, setAllClients] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [fetchingCustomers, setFetchingCustomers] = useState(false);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [targetClient, setTargetClient] = useState("");
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

//   const consultantId =
//     typeof window !== "undefined"
//       ? sessionStorage.getItem("consultantId") ||
//         sessionStorage.getItem("userId")
//       : null;

//   // --- 2. PERSISTENCE EFFECT ---
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       sessionStorage.setItem(
//         "customer_selected_clients",
//         JSON.stringify(selectedClients),
//       );
//     }
//   }, [selectedClients]);

//   // Fetch initial clients list
//   useEffect(() => {
//     const fetchClients = async () => {
//       try {
//         const res = await fetch(
//           `/api/consultant/clients?consultantId=${consultantId}`,
//         );
//         if (res.ok) setAllClients(await res.json());
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     if (consultantId) fetchClients();
//   }, [consultantId]);

//   // --- 3. CONDITIONAL DATA FETCHING ---
//   const fetchCustomers = useCallback(async () => {
//     if (selectedClients.length === 0) {
//       setCustomers([]);
//       return;
//     }

//     setFetchingCustomers(true);
//     try {
//       const res = await fetch(
//         `/api/consultant/customers?consultantId=${consultantId}&clients=${selectedClients.join(",")}`,
//       );
//       if (res.ok) setCustomers(await res.json());
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setFetchingCustomers(false);
//     }
//   }, [consultantId, selectedClients]);

//   useEffect(() => {
//     fetchCustomers();
//   }, [fetchCustomers]);

//   // --- 4. SELECTION HANDLERS ---
//   const handleToggleAllClients = () => {
//     if (selectedClients.length === allClients.length) {
//       setSelectedClients([]);
//     } else {
//       setSelectedClients(allClients.map((c) => c.id));
//     }
//   };

//   const handleHijackCustomer = (item, isNew = false) => {
//     sessionStorage.setItem("userId", isNew ? item.id : item.user_id);
//     sessionStorage.setItem(
//       "sellerToken",
//       item.client_token || item.token || "",
//     );
//     sessionStorage.setItem(
//       "businesses",
//       JSON.stringify(
//         isNew ? item.locations || [] : item.all_client_businesses || [],
//       ),
//     );
//     sessionStorage.setItem("activeConsultantMode", "true");

//     if (isNew) sessionStorage.removeItem("consultantEditCustomerId");
//     else sessionStorage.setItem("consultantEditCustomerId", item.id);

//     router.push("/customer");
//   };

//   if (loading)
//     return (
//       <div className="flex h-screen items-center justify-center">
//         <Loader2 className="animate-spin text-indigo-600" size={48} />
//       </div>
//     );

//   return (
//     <div className="max-w-7xl mx-auto p-6 space-y-6 font-bold text-slate-900">
//       {/* HEADER SECTION */}
//       <div className="flex justify-between items-end">
//         <div>
//           <h1 className="text-3xl font-black text-slate-800 tracking-tight">
//             Agency Customer Ledger
//           </h1>
//           <p
//             className="text-indigo-600 italic text-sm mt-1"
//             style={{ color: "#4f46e5" }}
//           >
//             {selectedClients.length > 0
//               ? `${customers.length} Tax Entities Found`
//               : "Awaiting Selection"}
//           </p>
//         </div>
//         <button
//           onClick={() => setShowCreateModal(true)}
//           className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black shadow-lg flex items-center gap-2 hover:bg-indigo-700 transition-all hover:scale-[1.02]"
//         >
//           <UserPlus size={18} /> Register Customer
//         </button>
//       </div>

//       {/* FILTER BAR */}
//       <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4 z-30 relative">
//         <div className="relative min-w-[320px]" ref={dropdownRef}>
//           <button
//             onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//             className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl"
//           >
//             <div className="flex items-center gap-3">
//               <Filter size={18} className="text-indigo-500" />
//               <span className="text-slate-700 text-sm font-black">
//                 {selectedClients.length === 0
//                   ? "No Client Selected"
//                   : selectedClients.length === allClients.length
//                     ? "All Portfolios Active"
//                     : `${selectedClients.length} Portfolios Selected`}
//               </span>
//             </div>
//             <ChevronDown
//               size={18}
//               className={`text-slate-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
//             />
//           </button>

//           {isDropdownOpen && (
//             <div className="absolute top-full left-0 mt-3 w-80 bg-white border border-slate-200 rounded-[1.5rem] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
//               <div
//                 onClick={handleToggleAllClients}
//                 className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-indigo-50 transition-colors group"
//               >
//                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-600">
//                   {selectedClients.length === allClients.length
//                     ? "Deselect All"
//                     : "Select All Portfolios"}
//                 </span>
//                 <div
//                   className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedClients.length === allClients.length ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-300"}`}
//                 >
//                   {selectedClients.length === allClients.length && (
//                     <Check size={16} strokeWidth={4} />
//                   )}
//                 </div>
//               </div>

//               <div className="max-h-64 overflow-y-auto p-2 custom-scroll">
//                 {allClients.map((c) => (
//                   <div
//                     key={c.id}
//                     onClick={() =>
//                       setSelectedClients((prev) =>
//                         prev.includes(c.id)
//                           ? prev.filter((id) => id !== c.id)
//                           : [...prev, c.id],
//                       )
//                     }
//                     className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl cursor-pointer group transition-colors"
//                   >
//                     <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 truncate pr-4">
//                       {c.business_name || c.seller_name}
//                     </span>
//                     <div
//                       className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${selectedClients.includes(c.id) ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-200"}`}
//                     >
//                       {selectedClients.includes(c.id) && (
//                         <Check size={14} strokeWidth={4} />
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* CUSTOMER TABLE */}
//       <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
//         <table className="w-full text-left">
//           <thead className="bg-slate-50 border-b text-[10px] uppercase text-slate-400 tracking-widest font-black">
//             <tr>
//               <th className="px-8 py-5">Client Portfolio</th>
//               <th className="px-8 py-5">Customer Identity</th>
//               <th className="px-8 py-5">Status</th>
//               <th className="px-8 py-5 text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-50">
//             {selectedClients.length === 0 ? (
//               /* EMPTY STATE: NO CLIENT SELECTED */
//               <tr>
//                 <td colSpan="4" className="py-32 px-8">
//                   <div className="flex flex-col items-center text-center space-y-4">
//                     <div className="h-20 w-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-400 border-2 border-indigo-100 border-dashed">
//                       <Users size={32} />
//                     </div>
//                     <div>
//                       <h3 className="text-xl font-black text-slate-800">
//                         Portfolio Unselected
//                       </h3>
//                       <p
//                         className="text-slate-400 font-bold italic text-sm mt-1 max-w-xs mx-auto"
//                         style={{ color: "#4f46e5" }}
//                       >
//                         Please choose one or more clients from the filter to
//                         view registered tax entities.
//                       </p>
//                     </div>
//                   </div>
//                 </td>
//               </tr>
//             ) : customers.length === 0 && !fetchingCustomers ? (
//               <tr>
//                 <td
//                   colSpan="4"
//                   className="py-24 text-center text-slate-400 font-black italic"
//                 >
//                   No customers found for the selected portfolios.
//                 </td>
//               </tr>
//             ) : (
//               customers.map((c) => (
//                 <tr
//                   key={c.id}
//                   className="hover:bg-slate-50/80 transition-colors group"
//                 >
//                   <td className="px-8 py-6">
//                     <div className="text-slate-800 text-sm font-black">
//                       {c.seller_name}
//                     </div>
//                     <div className="text-[10px] text-slate-400">
//                       NTN: {c.seller_ntn}
//                     </div>
//                   </td>
//                   <td className="px-8 py-6">
//                     <div className="text-slate-700 text-sm font-bold">
//                       {c.customer_name}
//                     </div>
//                     <div className="text-[10px] font-mono font-black text-indigo-500 uppercase tracking-tighter">
//                       NTN: {c.ntn}
//                     </div>
//                   </td>
//                   <td className="px-8 py-6">
//                     <span
//                       className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${c.allowed ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"}`}
//                     >
//                       {c.allowed ? "Active" : "Blocked"}
//                     </span>
//                   </td>
//                   <td className="px-8 py-6 text-right">
//                     <button
//                       onClick={() => handleHijackCustomer(c)}
//                       className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-md group-hover:scale-105"
//                     >
//                       Manage
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* CREATE MODAL */}
//       {showCreateModal && (
//         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 border border-slate-100">
//             <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">
//               Open Directory
//             </h2>
//             <p className="text-slate-400 text-sm font-bold mb-8">
//               Choose a client profile to begin registering a new tax entity.
//             </p>

//             <div className="relative mb-8">
//               <select
//                 className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-black appearance-none outline-none focus:border-indigo-500 transition-all"
//                 value={targetClient}
//                 onChange={(e) => setTargetClient(e.target.value)}
//               >
//                 <option value="" disabled>
//                   -- Select Client Workspace --
//                 </option>
//                 {allClients.map((cl) => (
//                   <option key={cl.id} value={cl.id}>
//                     {cl.business_name || cl.seller_name}
//                   </option>
//                 ))}
//               </select>
//               <ChevronDown
//                 className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
//                 size={20}
//               />
//             </div>

//             <div className="flex gap-3">
//               <button
//                 onClick={() => setShowCreateModal(false)}
//                 className="flex-1 p-4 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() =>
//                   handleHijackCustomer(
//                     allClients.find((cl) => cl.id.toString() === targetClient),
//                     true,
//                   )
//                 }
//                 disabled={!targetClient}
//                 className={`flex-[2] p-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all ${
//                   targetClient
//                     ? "bg-indigo-600 text-white shadow-xl hover:bg-indigo-700"
//                     : "bg-slate-100 text-slate-300 cursor-not-allowed"
//                 }`}
//               >
//                 Enter Workspace <ArrowRight size={22} />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Users,
  Filter,
  ArrowRight,
  Loader2,
  ChevronDown,
  Check,
  UserPlus,
  Search,
} from "lucide-react";

export default function ConsultantCustomerLedger() {
  const router = useRouter();
  const dropdownRef = useRef(null);

  // Initialize permissions state
  const [perms, setPerms] = useState({});

  useEffect(() => {
    // Load granular permissions from sessionStorage
    const stored = JSON.parse(sessionStorage.getItem("permissions") || "{}");
    setPerms(stored);
  }, []);

  const [selectedClients, setSelectedClients] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("customer_selected_clients");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [customers, setCustomers] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingCustomers, setFetchingCustomers] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [targetClient, setTargetClient] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const consultantId =
    typeof window !== "undefined"
      ? sessionStorage.getItem("consultantId") ||
        sessionStorage.getItem("userId")
      : null;

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "customer_selected_clients",
        JSON.stringify(selectedClients),
      );
    }
  }, [selectedClients]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch(
          `/api/consultant/clients?consultantId=${consultantId}`,
        );
        if (res.ok) setAllClients(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (consultantId) fetchClients();
  }, [consultantId]);

  const fetchCustomers = useCallback(async () => {
    if (selectedClients.length === 0) {
      setCustomers([]);
      return;
    }

    setFetchingCustomers(true);
    try {
      const res = await fetch(
        `/api/consultant/customers?consultantId=${consultantId}&clients=${selectedClients.join(",")}`,
      );
      if (res.ok) setCustomers(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingCustomers(false);
    }
  }, [consultantId, selectedClients]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleToggleAllClients = () => {
    if (selectedClients.length === allClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(allClients.map((c) => c.id));
    }
  };

  // Permission Guarded Workspace Redirection
  const handleHijackCustomer = (item, isNew = false) => {
    // Block access if consultant lacks both view and edit perms for management
    if (
      !isNew &&
      perms.can_view_customer === 0 &&
      perms.can_edit_customer === 0
    ) {
      alert("Access Denied for Customer Management.");
      return;
    }

    // Block access if consultant lacks creation perms for new registrations
    if (isNew && perms.can_create_customer === 0) {
      alert("You do not have permission to register new customers.");
      return;
    }

    // Set context for the target client workspace
    sessionStorage.setItem("userId", isNew ? item.id : item.user_id);
    sessionStorage.setItem(
      "sellerToken",
      item.client_token || item.token || "",
    );
    sessionStorage.setItem(
      "businesses",
      JSON.stringify(
        isNew ? item.locations || [] : item.all_client_businesses || [],
      ),
    );

    // Enable mode to allow returning to this ledger
    sessionStorage.setItem("activeConsultantMode", "true");

    if (isNew) sessionStorage.removeItem("consultantEditCustomerId");
    else sessionStorage.setItem("consultantEditCustomerId", item.id);

    router.push("/customer");
  };

  // UI Guard: Check if allowed to view the Customer Ledger module
  if (perms.can_view_customer === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-slate-400">
        <Users size={48} className="opacity-20 mb-4" />
        <p className="font-black uppercase tracking-widest text-xs">
          Access Denied: Customer Ledger Restricted
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 font-bold text-slate-900">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Agency Customer Ledger
          </h1>
          <p
            className="text-indigo-600 italic text-sm mt-1"
            style={{ color: "#4f46e5" }}
          >
            {selectedClients.length > 0
              ? `${customers.length} Tax Entities Found`
              : "Awaiting Selection"}
          </p>
        </div>

        {/* Permission Guard: Register Customer button visibility */}
        {perms.can_create_customer === 1 && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black shadow-lg flex items-center gap-2 hover:bg-indigo-700 transition-all hover:scale-[1.02]"
          >
            <UserPlus size={18} /> Register Customer
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4 z-30 relative">
        <div className="relative min-w-[320px]" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl"
          >
            <div className="flex items-center gap-3">
              <Filter size={18} className="text-indigo-500" />
              <span className="text-slate-700 text-sm font-black">
                {selectedClients.length === 0
                  ? "No Client Selected"
                  : selectedClients.length === allClients.length
                    ? "All Portfolios Active"
                    : `${selectedClients.length} Portfolios Selected`}
              </span>
            </div>
            <ChevronDown
              size={18}
              className={`text-slate-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-3 w-80 bg-white border border-slate-200 rounded-[1.5rem] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div
                onClick={handleToggleAllClients}
                className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-indigo-50 transition-colors group"
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-600">
                  {selectedClients.length === allClients.length
                    ? "Deselect All"
                    : "Select All Portfolios"}
                </span>
                <div
                  className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedClients.length === allClients.length ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-300"}`}
                >
                  {selectedClients.length === allClients.length && (
                    <Check size={16} strokeWidth={4} />
                  )}
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto p-2 custom-scroll">
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
                    className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl cursor-pointer group transition-colors"
                  >
                    <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 truncate pr-4">
                      {c.business_name || c.seller_name}
                    </span>
                    <div
                      className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${selectedClients.includes(c.id) ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-200"}`}
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
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b text-[10px] uppercase text-slate-400 tracking-widest font-black">
            <tr>
              <th className="px-8 py-5">Client Portfolio</th>
              <th className="px-8 py-5">Customer Identity</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {selectedClients.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-32 px-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="h-20 w-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-400 border-2 border-indigo-100 border-dashed">
                      <Users size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800">
                        Portfolio Unselected
                      </h3>
                      <p
                        className="text-slate-400 font-bold italic text-sm mt-1 max-w-xs mx-auto"
                        style={{ color: "#4f46e5" }}
                      >
                        Please choose one or more clients from the filter to
                        view registered tax entities.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : customers.length === 0 && !fetchingCustomers ? (
              <tr>
                <td
                  colSpan="4"
                  className="py-24 text-center text-slate-400 font-black italic"
                >
                  No customers found for the selected portfolios.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="text-slate-800 text-sm font-black">
                      {c.seller_name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      NTN: {c.seller_ntn}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-slate-700 text-sm font-bold">
                      {c.customer_name}
                    </div>
                    <div className="text-[10px] font-mono font-black text-indigo-500 uppercase tracking-tighter">
                      NTN: {c.ntn}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${c.allowed ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"}`}
                    >
                      {c.allowed ? "Active" : "Blocked"}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {/* Action text switches to "View Details" if edit perm is missing */}
                    <button
                      onClick={() => handleHijackCustomer(c)}
                      className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-md group-hover:scale-105"
                    >
                      {perms.can_edit_customer === 1
                        ? "Manage"
                        : "View Details"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 border border-slate-100">
            <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">
              Open Directory
            </h2>
            <p className="text-slate-400 text-sm font-bold mb-8">
              Choose a client profile to begin registering a new tax entity.
            </p>

            <div className="relative mb-8">
              <select
                className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-black appearance-none outline-none focus:border-indigo-500 transition-all"
                value={targetClient}
                onChange={(e) => setTargetClient(e.target.value)}
              >
                <option value="" disabled>
                  -- Select Client Workspace --
                </option>
                {allClients.map((cl) => (
                  <option key={cl.id} value={cl.id}>
                    {cl.business_name || cl.seller_name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={20}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 p-4 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleHijackCustomer(
                    allClients.find((cl) => cl.id.toString() === targetClient),
                    true,
                  )
                }
                disabled={!targetClient}
                className={`flex-[2] p-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all ${
                  targetClient
                    ? "bg-indigo-600 text-white shadow-xl hover:bg-indigo-700"
                    : "bg-slate-100 text-slate-300 cursor-not-allowed"
                }`}
              >
                Enter Workspace <ArrowRight size={22} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
