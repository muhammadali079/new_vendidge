// // "use client";

// // import React, { useState, useEffect, useCallback } from "react";
// // import { useRouter } from "next/navigation";
// // import {
// //   Plus,
// //   Search,
// //   Filter,
// //   Package,
// //   Edit3,
// //   Trash2,
// //   ArrowRight,
// //   Loader2,
// //   Building2,
// //   Check,
// //   ChevronDown,
// // } from "lucide-react";

// // export default function ConsultantProductLedger() {
// //   const router = useRouter();
// //   const [products, setProducts] = useState([]);
// //   const [allClients, setAllClients] = useState([]);
// //   const [selectedClients, setSelectedClients] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [showCreateModal, setShowCreateModal] = useState(false);
// //   const [targetClient, setTargetClient] = useState("");

// //   const consultantId =
// //     typeof window !== "undefined"
// //       ? sessionStorage.getItem("consultantId") ||
// //         sessionStorage.getItem("userId")
// //       : null;

// //   // 1. Initial Fetch: Clients & Products
// //   const initData = useCallback(async () => {
// //     try {
// //       const [clientsRes, prodRes] = await Promise.all([
// //         fetch(`/api/consultant/clients?consultantId=${consultantId}`),
// //         fetch(
// //           `/api/consultant/products?consultantId=${consultantId}&clients=${selectedClients.join(",")}`,
// //         ),
// //       ]);
// //       if (clientsRes.ok) setAllClients(await clientsRes.json());
// //       if (prodRes.ok) setProducts(await prodRes.json());
// //     } catch (err) {
// //       console.error(err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, [consultantId, selectedClients]);

// //   useEffect(() => {
// //     initData();
// //   }, [initData]);

// //   // 2. Context Switching Logic
// //   const handleEditProduct = (prod) => {
// //     sessionStorage.setItem("userId", prod.user_id);
// //     sessionStorage.setItem("sellerToken", prod.client_token || "");
// //     sessionStorage.setItem(
// //       "businesses",
// //       JSON.stringify(prod.all_client_locations || []),
// //     );
// //     sessionStorage.setItem("activeConsultantMode", "true");
// //     sessionStorage.setItem("consultantEditProductId", prod.id); // The Signal

// //     router.push("/products");
// //   };

// //   const handleCreateProduct = () => {
// //     const client = allClients.find((c) => c.id.toString() === targetClient);
// //     if (!client) return;

// //     sessionStorage.setItem("userId", client.id);
// //     sessionStorage.setItem("sellerToken", client.token || "");
// //     sessionStorage.setItem(
// //       "businesses",
// //       JSON.stringify(client.businesses || []),
// //     );
// //     sessionStorage.setItem("activeConsultantMode", "true");

// //     sessionStorage.removeItem("consultantEditProductId");

// //     console.log("Context set for client:", client);

// //     router.push("/products");
// //   };

// //   if (loading)
// //     return (
// //       <div className="flex h-screen items-center justify-center">
// //         <Loader2 className="animate-spin text-indigo-600" size={48} />
// //       </div>
// //     );

// //   return (
// //     <div className="max-w-7xl mx-auto p-6 space-y-6 font-bold">
// //       <div className="flex justify-between items-center">
// //         <div>
// //           <h1 className="text-3xl font-black text-slate-800">
// //             Agency Product Ledger
// //           </h1>
// //           <p className="text-slate-500">
// //             Managing {products.length} items across {allClients.length} clients
// //           </p>
// //         </div>
// //         <button
// //           onClick={() => setShowCreateModal(true)}
// //           className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg flex items-center gap-2 hover:bg-indigo-700 transition-all"
// //         >
// //           <Plus size={18} /> New Product
// //         </button>
// //       </div>

// //       {/* Filter Bar (Client Select) */}
// //       <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
// //         <Filter className="text-indigo-500 ml-2" size={20} />
// //         <div className="flex-1 flex gap-2 flex-wrap">
// //           {allClients.map((client) => (
// //             <button
// //               key={client.id}
// //               onClick={() =>
// //                 setSelectedClients((prev) =>
// //                   prev.includes(client.id)
// //                     ? prev.filter((id) => id !== client.id)
// //                     : [...prev, client.id],
// //                 )
// //               }
// //               className={`px-4 py-2 rounded-xl text-xs transition-all ${
// //                 selectedClients.includes(client.id)
// //                   ? "bg-indigo-600 text-white"
// //                   : "bg-slate-100 text-slate-600 hover:bg-slate-200"
// //               }`}
// //             >
// //               {client.business_name || client.seller_name}
// //             </button>
// //           ))}
// //         </div>
// //       </div>

// //       {/* Product Table */}
// //       <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
// //         <table className="w-full text-left">
// //           <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase text-slate-400 tracking-widest font-black">
// //             <tr>
// //               <th className="px-6 py-4">Client Portfolio</th>
// //               <th className="px-6 py-4">Product / HS Code</th>
// //               <th className="px-6 py-4">Unit Price</th>
// //               <th className="px-6 py-4">Tax Mapping</th>
// //               <th className="px-6 py-4 text-right">Actions</th>
// //             </tr>
// //           </thead>
// //           <tbody className="divide-y divide-slate-50">
// //             {products.map((p) => (
// //               <tr key={p.id} className="hover:bg-slate-50 transition-colors">
// //                 <td className="px-6 py-5">
// //                   <div className="text-slate-800 text-sm font-black">
// //                     {p.seller_business_name}
// //                   </div>
// //                   <div className="text-[10px] text-slate-400">
// //                     NTN: {p.client_ntn}
// //                   </div>
// //                 </td>
// //                 <td className="px-6 py-5">
// //                   <div className="text-slate-700 text-sm font-bold">
// //                     {p.product_description}
// //                   </div>
// //                   <div className="text-[10px] font-mono text-indigo-500">
// //                     {p.hsCode}
// //                   </div>
// //                 </td>
// //                 <td className="px-6 py-5">
// //                   <div className="text-emerald-600 font-black">
// //                     Rs {Number(p.singleUnitPrice).toLocaleString()}
// //                   </div>
// //                   <div className="text-[9px] text-slate-400">UOM: {p.unit}</div>
// //                 </td>
// //                 <td className="px-6 py-5">
// //                   <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">
// //                     {p.rateDesc}
// //                   </span>
// //                 </td>
// //                 <td className="px-6 py-5 text-right">
// //                   <button
// //                     onClick={() => handleEditProduct(p)}
// //                     className="text-indigo-600 hover:underline uppercase text-xs"
// //                   >
// //                     Manage Inventory
// //                   </button>
// //                 </td>
// //               </tr>
// //             ))}
// //           </tbody>
// //         </table>
// //       </div>

// //       {/* CREATE MODAL */}
// //       {showCreateModal && (
// //         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
// //           <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
// //             <h2 className="text-2xl font-black text-slate-800 mb-6 tracking-tight">
// //               Select Client Workspace
// //             </h2>
// //             <select
// //               className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black mb-6 appearance-none shadow-inner"
// //               value={targetClient}
// //               onChange={(e) => setTargetClient(e.target.value)}
// //             >
// //               <option value="" disabled>
// //                 -- Choose Client Account --
// //               </option>
// //               {allClients.map((c) => (
// //                 <option key={c.id} value={c.id}>
// //                   {c.business_name || c.seller_name}
// //                 </option>
// //               ))}
// //             </select>
// //             <button
// //               onClick={handleCreateProduct}
// //               disabled={!targetClient}
// //               className={`w-full p-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all ${
// //                 targetClient
// //                   ? "bg-indigo-600 text-white shadow-lg"
// //                   : "bg-slate-100 text-slate-400 cursor-not-allowed"
// //               }`}
// //             >
// //               Open Catalog <ArrowRight size={20} />
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }
// "use client";

// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { useRouter } from "next/navigation";
// import {
//   Plus,
//   Filter,
//   Loader2,
//   Check,
//   ChevronDown,
//   PackageOpen,
//   ArrowRight,
//   Package,
// } from "lucide-react";

// export default function ConsultantProductLedger() {
//   const router = useRouter();
//   const dropdownRef = useRef(null);

//   // 1. Initialize state from sessionStorage to survive page reloads/navigation
//   const [selectedClients, setSelectedClients] = useState(() => {
//     if (typeof window !== "undefined") {
//       const saved = sessionStorage.getItem("consultant_selected_clients");
//       return saved ? JSON.parse(saved) : [];
//     }
//     return [];
//   });

//   const [products, setProducts] = useState([]);
//   const [allClients, setAllClients] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [fetchingProducts, setFetchingProducts] = useState(false);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [targetClient, setTargetClient] = useState("");
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

//   const consultantId =
//     typeof window !== "undefined"
//       ? sessionStorage.getItem("consultantId") ||
//         sessionStorage.getItem("userId")
//       : null;

//   // 2. Persist selection changes to sessionStorage
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       sessionStorage.setItem(
//         "consultant_selected_clients",
//         JSON.stringify(selectedClients),
//       );
//     }
//   }, [selectedClients]);

//   // Initial Fetch: Clients only
//   useEffect(() => {
//     const fetchClients = async () => {
//       try {
//         const res = await fetch(
//           `/api/consultant/clients?consultantId=${consultantId}`,
//         );
//         if (res.ok) setAllClients(await res.json());
//       } catch (err) {
//         console.error(err);
//       }
//       setLoading(false);
//     };
//     if (consultantId) fetchClients();
//   }, [consultantId]);

//   // Conditional Product Fetching
//   const fetchProducts = useCallback(async () => {
//     if (selectedClients.length === 0) {
//       setProducts([]);
//       return;
//     }

//     setFetchingProducts(true);
//     try {
//       const res = await fetch(
//         `/api/consultant/products?consultantId=${consultantId}&clients=${selectedClients.join(",")}`,
//       );
//       if (res.ok) setProducts(await res.json());
//     } catch (err) {
//       console.error(err);
//     }
//     setFetchingProducts(false);
//   }, [consultantId, selectedClients]);

//   useEffect(() => {
//     fetchProducts();
//   }, [fetchProducts]);

//   // Selection Handlers
//   const handleToggleAll = () => {
//     if (selectedClients.length === allClients.length) {
//       setSelectedClients([]);
//     } else {
//       setSelectedClients(allClients.map((c) => c.id));
//     }
//   };

//   // Close dropdown on outside click
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target))
//         setIsDropdownOpen(false);
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // Context Switching Logic
//   const handleEditProduct = (prod) => {
//     sessionStorage.setItem("userId", prod.user_id);
//     sessionStorage.setItem("sellerToken", prod.client_token || "");
//     sessionStorage.setItem(
//       "businesses",
//       JSON.stringify(prod.all_client_locations || []),
//     );
//     sessionStorage.setItem("activeConsultantMode", "true");
//     sessionStorage.setItem("consultantEditProductId", prod.id);
//     router.push("/products");
//   };

//   const handleCreateProduct = () => {
//     const client = allClients.find((c) => c.id.toString() === targetClient);
//     if (!client) return;
//     sessionStorage.setItem("userId", client.id);
//     sessionStorage.setItem("sellerToken", client.token || "");
//     sessionStorage.setItem(
//       "businesses",
//       JSON.stringify(client.businesses || []),
//     );
//     sessionStorage.setItem("activeConsultantMode", "true");
//     sessionStorage.removeItem("consultantEditProductId");
//     router.push("/products");
//   };

//   if (loading)
//     return (
//       <div className="flex h-screen items-center justify-center">
//         <Loader2 className="animate-spin text-indigo-600" size={48} />
//       </div>
//     );

//   return (
//     <div className="max-w-7xl mx-auto p-6 space-y-6 font-bold">
//       <div className="flex justify-between items-end">
//         <div>
//           <h1 className="text-3xl font-black text-slate-800 tracking-tight">
//             Agency Product Ledger
//           </h1>
//           <p
//             className="text-indigo-600 italic text-sm mt-1"
//             style={{ color: "#4f46e5" }}
//           >
//             {selectedClients.length > 0
//               ? `${products.length} Records Found Across Selected Clients`
//               : "Awaiting Client Selection"}
//           </p>
//         </div>
//         <button
//           onClick={() => setShowCreateModal(true)}
//           className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black shadow-lg flex items-center gap-2 hover:bg-indigo-700 transition-all hover:scale-[1.02]"
//         >
//           <Plus size={20} /> New Product
//         </button>
//       </div>

//       {/* FILTER BAR */}
//       <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4 z-30 relative">
//         <div className="relative min-w-[320px]" ref={dropdownRef}>
//           <button
//             onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//             className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl hover:border-indigo-300 transition-all"
//           >
//             <div className="flex items-center gap-3">
//               <Filter size={18} className="text-indigo-500" />
//               <span className="text-slate-700 text-sm font-black">
//                 {selectedClients.length === 0
//                   ? "No Client Selected"
//                   : selectedClients.length === allClients.length
//                     ? "All Portfolios Selected"
//                     : `${selectedClients.length} Portfolios Selected`}
//               </span>
//             </div>
//             <ChevronDown
//               size={18}
//               className={`text-slate-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
//             />
//           </button>

//           {isDropdownOpen && (
//             <div className="absolute top-full left-0 mt-3 w-80 bg-white border border-slate-200 rounded-[1.5rem] shadow-2xl z-50 overflow-hidden">
//               <div
//                 onClick={handleToggleAll}
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

//       {/* TABLE */}
//       <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
//         <table className="w-full text-left">
//           <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase text-slate-400 tracking-widest font-black">
//             <tr>
//               <th className="px-8 py-5">Client Portfolio</th>
//               <th className="px-8 py-5">Product Identity</th>
//               <th className="px-8 py-5">Pricing</th>
//               <th className="px-8 py-5 text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-50">
//             {selectedClients.length === 0 ? (
//               <tr>
//                 <td
//                   colSpan="4"
//                   className="py-32 text-center text-slate-400 font-bold italic text-sm"
//                   style={{ color: "#4f46e5" }}
//                 >
//                   Please choose one or more clients to load the ledger.
//                 </td>
//               </tr>
//             ) : products.length === 0 && !fetchingProducts ? (
//               <tr>
//                 <td colSpan="4" className="py-24 text-center">
//                   <div className="flex flex-col items-center space-y-2">
//                     <PackageOpen size={48} className="text-slate-200" />
//                     <p className="text-slate-400 font-black italic">
//                       No products registered for selected clients.
//                     </p>
//                   </div>
//                 </td>
//               </tr>
//             ) : (
//               products.map((p) => (
//                 <tr
//                   key={p.id}
//                   className="hover:bg-slate-50/80 transition-colors group"
//                 >
//                   <td className="px-8 py-6">
//                     <div className="text-slate-800 text-sm font-black">
//                       {p.seller_business_name}
//                     </div>
//                     <div className="text-[10px] text-slate-400">
//                       NTN: {p.client_ntn}
//                     </div>
//                   </td>
//                   <td className="px-8 py-6">
//                     <div className="text-slate-700 text-sm font-bold">
//                       {p.product_description}
//                     </div>
//                     <div className="text-[10px] font-mono font-black text-indigo-500 mt-1 uppercase">
//                       HS: {p.hsCode}
//                     </div>
//                   </td>
//                   <td className="px-8 py-6 text-emerald-600 font-black">
//                     Rs {Number(p.singleUnitPrice).toLocaleString()}
//                   </td>
//                   <td className="px-8 py-6 text-right">
//                     <button
//                       onClick={() => handleEditProduct(p)}
//                       className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
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

//       {showCreateModal && (
//         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
//             <h2 className="text-2xl font-black text-slate-800 mb-6 tracking-tight">
//               Select Client Workspace
//             </h2>
//             <select
//               className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black mb-6 appearance-none shadow-inner"
//               value={targetClient}
//               onChange={(e) => setTargetClient(e.target.value)}
//             >
//               <option value="" disabled>
//                 -- Choose Client Account --
//               </option>
//               {allClients.map((c) => (
//                 <option key={c.id} value={c.id}>
//                   {c.business_name || c.seller_name}
//                 </option>
//               ))}
//             </select>
//             <button
//               onClick={handleCreateProduct}
//               disabled={!targetClient}
//               className={`w-full p-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all ${
//                 targetClient
//                   ? "bg-indigo-600 text-white shadow-lg"
//                   : "bg-slate-100 text-slate-400 cursor-not-allowed"
//               }`}
//             >
//               Open Catalog <ArrowRight size={20} />
//             </button>
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
  Filter,
  Loader2,
  Check,
  ChevronDown,
  PackageOpen,
  ArrowRight,
  Package,
  Edit3,
  ShieldAlert,
} from "lucide-react";

export default function ConsultantProductLedger() {
  const router = useRouter();
  const dropdownRef = useRef(null);

  // --- 1. PERMISSION STATE ---
  const [perms, setPerms] = useState({});

  useEffect(() => {
    const stored = JSON.parse(sessionStorage.getItem("permissions") || "{}");
    setPerms(stored);
  }, []);

  const [selectedClients, setSelectedClients] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("consultant_selected_clients");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [products, setProducts] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingProducts, setFetchingProducts] = useState(false);
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
        "consultant_selected_clients",
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
      }
      setLoading(false);
    };
    if (consultantId) fetchClients();
  }, [consultantId]);

  const fetchProducts = useCallback(async () => {
    if (selectedClients.length === 0) {
      setProducts([]);
      return;
    }

    setFetchingProducts(true);
    try {
      const res = await fetch(
        `/api/consultant/products?consultantId=${consultantId}&clients=${selectedClients.join(",")}`,
      );
      if (res.ok) setProducts(await res.json());
    } catch (err) {
      console.error(err);
    }
    setFetchingProducts(false);
  }, [consultantId, selectedClients]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleToggleAll = () => {
    if (selectedClients.length === allClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(allClients.map((c) => c.id));
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- 2. PERMISSION GUARDED REDIRECTION ---
  const handleEditProduct = (prod) => {
    // Check if consultant has at least view or edit permission
    if (perms.can_view_product === 0 && perms.can_edit_product === 0) {
      alert(
        "Access Denied: You do not have permission to view or manage products.",
      );
      return;
    }

    sessionStorage.setItem("userId", prod.user_id);
    sessionStorage.setItem("sellerToken", prod.client_token || "");
    sessionStorage.setItem(
      "businesses",
      JSON.stringify(prod.all_client_locations || []),
    );
    sessionStorage.setItem("activeConsultantMode", "true");
    sessionStorage.setItem("consultantEditProductId", prod.id);
    router.push("/products");
  };

  const handleCreateProduct = () => {
    // Guard: Creation check
    if (perms.can_create_product === 0) {
      alert(
        "Access Denied: You do not have permission to register new products.",
      );
      return;
    }

    const client = allClients.find((c) => c.id.toString() === targetClient);
    if (!client) return;
    sessionStorage.setItem("userId", client.id);
    sessionStorage.setItem("sellerToken", client.token || "");
    sessionStorage.setItem(
      "businesses",
      JSON.stringify(client.businesses || []),
    );
    sessionStorage.setItem("activeConsultantMode", "true");
    sessionStorage.removeItem("consultantEditProductId");
    router.push("/products");
  };

  // --- 3. UI GUARD: PAGE ACCESS ---
  if (perms.can_view_product === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-400">
        <ShieldAlert size={48} className="mb-4 opacity-20" />
        <p className="font-black uppercase tracking-widest text-xs">
          Access Denied: Product Ledger Restricted
        </p>
      </div>
    );
  }

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 font-bold">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Agency Product Ledger
          </h1>
          <p
            className="text-indigo-600 italic text-sm mt-1"
            style={{ color: "#4f46e5" }}
          >
            {selectedClients.length > 0
              ? `${products.length} Records Found Across Selected Clients`
              : "Awaiting Client Selection"}
          </p>
        </div>

        {/* Guard: Only show "New Product" if can_create is 1 */}
        {perms.can_create_product === 1 && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black shadow-lg flex items-center gap-2 hover:bg-indigo-700 transition-all hover:scale-[1.02]"
          >
            <Plus size={20} /> New Product
          </button>
        )}
      </div>

      {/* FILTER BAR (Unchanged) */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4 z-30 relative">
        <div className="relative min-w-[320px]" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl hover:border-indigo-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <Filter size={18} className="text-indigo-500" />
              <span className="text-slate-700 text-sm font-black">
                {selectedClients.length === 0
                  ? "No Client Selected"
                  : selectedClients.length === allClients.length
                    ? "All Portfolios Selected"
                    : `${selectedClients.length} Portfolios Selected`}
              </span>
            </div>
            <ChevronDown
              size={18}
              className={`text-slate-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-3 w-80 bg-white border border-slate-200 rounded-[1.5rem] shadow-2xl z-50 overflow-hidden">
              <div
                onClick={handleToggleAll}
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

      {/* TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase text-slate-400 tracking-widest font-black">
            <tr>
              <th className="px-8 py-5">Client Portfolio</th>
              <th className="px-8 py-5">Product Identity</th>
              <th className="px-8 py-5">Pricing</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {selectedClients.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="py-32 text-center text-slate-400 font-bold italic text-sm"
                  style={{ color: "#4f46e5" }}
                >
                  Please choose one or more clients to load the ledger.
                </td>
              </tr>
            ) : products.length === 0 && !fetchingProducts ? (
              <tr>
                <td colSpan="4" className="py-24 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <PackageOpen size={48} className="text-slate-200" />
                    <p className="text-slate-400 font-black italic">
                      No products registered for selected clients.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="text-slate-800 text-sm font-black">
                      {p.seller_business_name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      NTN: {p.client_ntn}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-slate-700 text-sm font-bold">
                      {p.product_description}
                    </div>
                    <div className="text-[10px] font-mono font-black text-indigo-500 mt-1 uppercase">
                      HS: {p.hsCode}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-emerald-600 font-black">
                    Rs {Number(p.singleUnitPrice).toLocaleString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    {/* Guard: Label change based on edit perm */}
                    <button
                      onClick={() => handleEditProduct(p)}
                      className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
                    >
                      {perms.can_edit_product === 1 ? "Manage" : "View Details"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-black text-slate-800 mb-6 tracking-tight">
              Select Client Workspace
            </h2>
            <select
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black mb-6 appearance-none shadow-inner"
              value={targetClient}
              onChange={(e) => setTargetClient(e.target.value)}
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
              onClick={handleCreateProduct}
              disabled={!targetClient}
              className={`w-full p-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all ${
                targetClient
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              Open Catalog <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
