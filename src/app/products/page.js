// "use client";

// import { useState, useEffect } from "react";
// import {
//   Edit3,
//   Trash2,
//   Plus,
//   X,
//   Package,
//   Layers,
//   Hash,
//   DollarSign,
//   Settings,
//   Building2,
//   Check,
//   Box,
//   Calculator,
// } from "lucide-react";
// import { useRouter } from "next/navigation";

// export default function ProductPage({ darkMode }) {
//   const router = useRouter();
//   const [products, setProducts] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [isEdit, setIsEdit] = useState(false);

//   const [userBusinesses, setUserBusinesses] = useState(() => {
//     if (typeof window !== "undefined") {
//       const saved = sessionStorage.getItem("businesses");
//       return saved ? JSON.parse(saved) : [];
//     }
//     return [];
//   });
//   const [hsCodes, setHsCodes] = useState([]);
//   const [transTypeList, setTransTypeList] = useState([]);
//   const [uomList, setUomList] = useState([]);
//   const [rateOptions, setRateOptions] = useState([]);
//   const [sroOptions, setSroOptions] = useState([]);
//   const [sroItemOptions, setSroItemOptions] = useState([]);

//   const initialForm = {
//     id: null,
//     product_description: "",
//     hsCode: "",
//     unit: "",
//     internalUOM: "",
//     singleUnitPrice: "0",
//     fixedNotifiedValueOrRetailPrice: "0",
//     internalSinglePrice: "0",
//     furtherTax: "0",
//     extraTax: "0",
//     salesTaxWithheldAtSource: "0",
//     fedPayable: "0",
//     transactionTypeId: 0,
//     transactionType: "",
//     sroScheduleId: 0,
//     sroSchedule: "",
//     sroItemId: 0,
//     sroItemSerialNo: "",
//     rateId: 0,
//     rate: "",
//     rateDesc: "",
//     //  sellerBusinessId: 0,
//     allowed: true,
//   };

//   const [formData, setFormData] = useState(initialForm);
//   const [provinceId, setProvinceId] = useState(null);

//   useEffect(() => {
//     if (typeof window === "undefined") return;

//     const saved = sessionStorage.getItem("businesses");
//     if (!saved) return;

//     const parsed = JSON.parse(saved);

//     if (parsed?.length > 0) {
//       // console.log("parsed[0].id", parsed[0].id, typeof parsed[0].id);

//       setProvinceId(parsed[0].province_id);

//       setFormData((prev) => ({
//         ...prev,
//         sellerBusinessId: parsed[0].id,
//       }));
//     }
//   }, []);

//   const getFbrHeaders = () => {
//     const token = sessionStorage.getItem("sellerToken");
//     return { Authorization: `Bearer ${token}`, Accept: "application/json" };
//   };

//   const fetchProducts = async (userId) => {
//     setLoading(true);
//     try {
//       const res = await fetch(`/api/user-products?userId=${userId}`);
//       const data = await res.json();
//       // Map tinyint allowed back to boolean for UI
//       const formattedData = data.map((p) => ({
//         ...p,
//         allowed: p.allowed === 1,
//       }));
//       setProducts(Array.isArray(formattedData) ? formattedData : []);
//     } catch (err) {
//       console.error(err);
//     }
//     setLoading(false);
//   };
//   const loadFBRMasterData = async () => {
//     try {
//       const headers = getFbrHeaders();
//       const [hsRes, transRes, uomRes] = await Promise.all([
//         fetch("/api/fbr/hsCode", { headers }),
//         fetch("/api/fbr/TransactionType", { headers }),
//         fetch("/api/fbr/uom", { headers }),
//       ]);
//       setHsCodes(await hsRes.json());
//       setTransTypeList(await transRes.json());
//       setUomList(await uomRes.json());
//     } catch (err) {
//       console.error("FBR Master Data Failed:", err);
//     }
//   };

//   const fetchRates = async (transId, provId) => {
//     // console.log("caling rates");
//     const today = new Date().toISOString().split("T")[0];
//     try {
//       const res = await fetch(
//         `/api/fbr/rate?date=${today}&transTypeId=${transId}&provinceCode=${provId}`,
//         { headers: getFbrHeaders() },
//       );
//       const json = await res.json();
//       setRateOptions(json.data || []);
//       // console.log("rates data", json.data);
//       return json.data || [];
//     } catch (err) {
//       console.error(err);
//       return [];
//     }
//   };

//   const fetchSros = async (rateId, provId) => {
//     // console.log("caling sro schedule ");
//     const today = new Date().toISOString().split("T")[0];
//     try {
//       const res = await fetch(
//         `/api/fbr/sroScheduleNo?rateId=${rateId}&date=${today}&provinceCode=${provId}`,
//         { headers: getFbrHeaders() },
//       );
//       const json = await res.json();
//       setSroOptions(json.data || []);
//       return json.data || [];
//     } catch (err) {
//       console.error(err);
//       return [];
//     }
//   };

//   const fetchItems = async (sroId) => {
//     const today = new Date().toISOString().split("T")[0];
//     try {
//       const res = await fetch(`/api/fbr/sroItem?sroId=${sroId}&date=${today}`, {
//         headers: getFbrHeaders(),
//       });
//       const json = await res.json();
//       setSroItemOptions(json.data || []);
//       return json.data || [];
//     } catch (err) {
//       console.error(err);
//       return [];
//     }
//   };

//   const handleEditClick = async (product) => {
//     setIsEdit(true);
//     setFormData(product);
//     // console.log("product", product);
//     setShowForm(true);

//     // console.log("userBuseines ", userBusinesses);

//     const selectedBiz = userBusinesses.find(
//       (b) => Number(b.id) === Number(product.sellerBusinessId),
//     );
//     // console.log("selected biz", selectedBiz);

//     if (selectedBiz) {
//       const currentProvId = selectedBiz.province_id;
//       setProvinceId(currentProvId);

//       if (product.transactionTypeId) {
//         // console.log("have trans id");
//         await fetchRates(product.transactionTypeId, currentProvId);
//         // console.log("AFTER fetchRates");
//         // console.log("rateId value:", product.rateId);
//         // console.log("rateId type:", typeof product.rateId);
//       }
//       if (product.rateId) {
//         // console.log("have rateId id");
//         await fetchSros(product.rateId, currentProvId);
//       }
//       if (product.sroScheduleId) {
//         // console.log("have sroScheduleId id");
//         await fetchItems(product.sroScheduleId);
//       }
//     }
//   };

//   useEffect(() => {
//     const userId =
//       Number(sessionStorage.getItem("parent_id")) ||
//       Number(sessionStorage.getItem("userId"));
//     // console.log("Fetched userId from sessionStorage:", userId);
//     if (userId) fetchProducts(userId);

//     const storedBusinesses = sessionStorage.getItem("businesses");
//     // console.log("Fetched businesses from sessionStorage:", storedBusinesses);
//     if (storedBusinesses) {
//       const parsedBusinesses = JSON.parse(storedBusinesses);
//       setUserBusinesses(parsedBusinesses);
//     }

//     loadFBRMasterData();
//   }, []);
//   useEffect(() => {
//     const isConsultant =
//       sessionStorage.getItem("activeConsultantMode") === "true";
//     const editId = sessionStorage.getItem("consultantEditProductId");

//     if (isConsultant) {
//       // FLOW A: EDIT EXISTING
//       if (editId && products.length > 0) {
//         const targetProduct = products.find(
//           (p) => p.id.toString() === editId.toString(),
//         );
//         if (targetProduct) {
//           handleEditClick(targetProduct); // Use the ACTUAL function from line 111
//         }
//       }
//       // FLOW B: CREATE NEW
//       else if (!editId) {
//         setIsEdit(false);
//         setFormData(initialForm); // Use ACTUAL initialForm from line 32
//         setShowForm(true);
//       }
//     }
//   }, [products]); // Trigger when products list is loaded
//   const handleBusinessChange = (bizId) => {
//     const selectedBiz = userBusinesses.find(
//       (b) => b.id.toString() === bizId.toString(),
//     );
//     if (selectedBiz) {
//       setProvinceId(selectedBiz.province_id);
//       setFormData((prev) => ({ ...prev, sellerBusinessId: bizId }));
//       if (formData.transactionTypeId)
//         fetchRates(formData.transactionTypeId, selectedBiz.province_id);
//     }
//   };

//   const handleTransactionChange = (typeId) => {
//     const type = transTypeList.find((t) => t.transactioN_TYPE_ID == typeId);
//     setFormData((prev) => ({
//       ...prev,
//       transactionTypeId: typeId,
//       transactionType: type?.transactioN_DESC.trim() || "",
//     }));
//     if (provinceId) fetchRates(typeId, provinceId);
//     // // console.log("province ", provinceId, typeId);
//   };
//   // useEffect(() => {
//   //   if (formData.transactionTypeId && provinceId) {
//   //     // console.log(
//   //       "Both ready! Fetching rates for:",
//   //       formData.transactionTypeId,
//   //       provinceId,
//   //     );
//   //     setRateOptions([]);
//   //     setSroOptions([]);
//   //     setSroItemOptions([]);
//   //     fetchRates(formData.transactionTypeId, provinceId);
//   //   }
//   //   // console.log("province ", provinceId, formData.transactionTypeId);
//   // }, [formData.transactionTypeId, provinceId]);
//   const handleRateChange = async (rateId) => {
//     const rate = rateOptions.find((r) => r.ratE_ID == rateId);
//     setFormData((prev) => ({
//       ...prev,
//       rateId: rateId,
//       rate: String(rate?.ratE_VALUE || ""),
//       rateDesc: rate?.ratE_DESC || "",
//     }));
//     if (provinceId) {
//       // setSroOptions([]);
//       // setSroItemOptions([]);
//       fetchSros(rateId, provinceId);
//     }
//   };

//   const handleSroChange = async (sroId) => {
//     const sro = sroOptions.find((s) => (s.srO_ID || s.id) == sroId);
//     setFormData((prev) => ({
//       ...prev,
//       sroScheduleId: sroId,
//       sroSchedule: sro?.srO_DESC || "",
//     }));
//     // setSroItemOptions([]);
//     fetchItems(sroId);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.transactionTypeId) {
//       alert("Please select Transaction type");
//       return;
//     }
//     if (!formData.rateId) {
//       alert("Please select Rate");
//       return;
//     }

//     if (
//       sroOptions.length > 0 &&
//       !formData.sroScheduleId &&
//       formData.sroScheduleId !== 0
//     ) {
//       alert("Please select SRO Schedule");
//       return;
//     }
//     if (
//       sroItemOptions.length > 0 &&
//       !formData.sroItemId &&
//       formData.sroItemId !== 0
//     ) {
//       alert("Please select SRO Item");
//       return;
//     }

//     // console.log("sellerBusinessId", formData.sellerBusinessId);
//     const userId =
//       Number(sessionStorage.getItem("parent_id")) ||
//       Number(sessionStorage.getItem("userId"));
//     const method = isEdit ? "PUT" : "POST";

//     const res = await fetch("/api/user-products", {
//       method,
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ ...formData, user_id: userId }),
//     });

//     if (res.ok) {
//       // console.log(sessionStorage.getItem("activeConsultantMode"));
//       if (sessionStorage.getItem("activeConsultantMode") === "true") {
//         router.push("/consultant/products"); // Redirect back
//       } else {
//         setShowForm(false);
//         fetchProducts(userId);
//         setFormData(initialForm);
//         // setProvinceId(null);
//       }
//     } else {
//       alert("Error saving product");
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!confirm("Are you sure you want to delete this product?")) return;
//     try {
//       const res = await fetch(`/api/user-products?id=${id}`, {
//         method: "DELETE",
//       });
//       if (res.ok) {
//         const userId =
//           Number(sessionStorage.getItem("parent_id")) ||
//           Number(sessionStorage.getItem("userId"));
//         fetchProducts(userId);
//       } else {
//         const data = await res.json();
//         alert(data.message || "Error deleting product");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleNumericInput = (field, value) => {
//     const val = value.replace(/[^0-9.]/g, "").replace(/(\..*?)\./g, "$1");
//     setFormData((prev) => ({ ...prev, [field]: val }));
//   };

//   if (loading && products.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen">
//         <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
//         <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
//           Syncing Inventory...
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div
//       className={`min-h-screen px-4 py-8 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}
//     >
//       <div className="max-w-6xl mx-auto">
//         {/* --- HEADER --- */}
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
//           <div>
//             <h1 className="text-3xl font-black tracking-tight text-slate-800">
//               Product Management
//             </h1>
//             <p className="text-slate-500 font-medium">
//               Catalog and manage your business inventory
//             </p>
//           </div>
//           <button
//             onClick={() => {
//               setIsEdit(false);
//               setFormData({
//                 ...initialForm,
//                 sellerBusinessId:
//                   userBusinesses.length > 0 ? userBusinesses[0].id : 0,
//               });
//               // setProvinceId(null);
//               setRateOptions([]);
//               setSroOptions([]);
//               setSroItemOptions([]);
//               setShowForm(true);
//             }}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
//           >
//             <Plus size={18} /> New Product
//           </button>
//         </div>

//         {/* --- PRODUCT LIST --- */}
//         <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm overflow-hidden">
//           <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2">
//             <Package size={18} /> Inventory Items
//           </h2>

//           <div className="overflow-x-auto">
//             <table className="w-full text-sm text-left whitespace-nowrap">
//               <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
//                 <tr>
//                   <th className="px-4 py-4 ml-2">ID</th>
//                   <th className="px-4 py-4">Product Description</th>
//                   <th className="px-4 py-4">HS Code</th>
//                   <th className="px-4 py-4">Unit Price</th>
//                   <th className="px-4 py-4">Rate</th>
//                   <th className="px-4 py-4">Status</th>
//                   <th className="px-4 py-4 text-center">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {products.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan="7"
//                       className="py-10 text-center text-slate-400 font-bold uppercase text-xs tracking-widest"
//                     >
//                       No Products Registered
//                     </td>
//                   </tr>
//                 ) : (
//                   products.map((p) => (
//                     <tr
//                       key={p.id}
//                       className="group hover:bg-slate-50 transition-colors"
//                     >
//                       <td className="px-4 py-5 font-black text-blue-600 text-xs">
//                         #{p.id}
//                       </td>
//                       <td className="px-4 py-5 font-bold text-slate-800">
//                         {p.product_description}
//                       </td>
//                       <td className="px-4 py-5 font-mono text-xs text-slate-500">
//                         {p.hsCode}
//                       </td>
//                       <td className="px-4 py-5 font-semibold text-emerald-600">
//                         Rs {Number(p.singleUnitPrice).toLocaleString()}
//                       </td>
//                       <td className="px-4 py-5">
//                         <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
//                           {p.rateDesc || "Standard"}
//                         </span>
//                       </td>
//                       <td className="px-4 py-5">
//                         <span
//                           className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${p.allowed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
//                         >
//                           {p.allowed ? "Active" : "Inactive"}
//                         </span>
//                       </td>
//                       <td className="px-4 py-5">
//                         <div className="flex justify-center gap-3">
//                           <button
//                             onClick={() => handleEditClick(p)}
//                             className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
//                           >
//                             <Edit3 size={18} />
//                           </button>
//                           <button
//                             onClick={() => handleDelete(p.id)}
//                             className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
//                           >
//                             <Trash2 size={18} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </section>
//       </div>

//       {/* --- MODAL FORM --- */}
//       {showForm && (
//         <div className="fixed inset-0 backdrop-blur-md bg-slate-900/40 z-50 flex items-center justify-center px-4 py-6">
//           <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-10 w-full max-w-5xl max-h-full overflow-y-auto custom-scroll">
//             <div className="flex justify-between items-center mb-8 sticky top-0 bg-white z-10 pb-4 border-b">
//               <h2 className="text-2xl font-black text-slate-800">
//                 {isEdit ? `Edit Product #${formData.id}` : "Add New Product"}
//               </h2>
//               <button
//                 onClick={() => {
//                   if (
//                     sessionStorage.getItem("activeConsultantMode") === "true"
//                   ) {
//                     router.push("/consultant/products");
//                   } else {
//                     setShowForm(false);
//                   }
//                 }}
//                 className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 p-2 rounded-full"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-8">
//               {/* --- BUSINESS SECTION --- */}
//               {/* <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
//                 <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 tracking-widest flex items-center gap-2">
//                   <Building2 size={12} /> Origin Business Entity *
//                 </label>
//                 <select
//                   className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-800 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
//                   value={formData.sellerBusinessId}
//                   onChange={(e) => handleBusinessChange(e.target.value)}
//                   required
//                 >
//                   <option value="">Select Business</option>
//                   {userBusinesses.map((biz) => (
//                     <option key={biz.id} value={biz.id}>
//                       {biz.business_name}
//                     </option>
//                   ))}
//                 </select>
//               </div> */}

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 {/* --- BASIC INFO --- */}
//                 <div className="space-y-5">
//                   <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
//                     <Package size={16} /> General Info
//                   </h3>

//                   <div>
//                     <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
//                       Product Description *
//                     </label>
//                     <input
//                       className="w-full p-3 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
//                       value={formData.product_description}
//                       onChange={(e) =>
//                         setFormData({
//                           ...formData,
//                           product_description: e.target.value,
//                         })
//                       }
//                       required
//                     />
//                   </div>

//                   <div className="relative group">
//                     <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
//                       HS Code *
//                     </label>
//                     <input
//                       className="w-full p-3 bg-slate-50 border-none rounded-2xl font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//                       value={formData.hsCode}
//                       onChange={(e) =>
//                         setFormData({ ...formData, hsCode: e.target.value })
//                       }
//                       required
//                     />
//                     <div className="absolute z-10 bg-white border border-slate-100 w-full mt-1 rounded-2xl shadow-xl max-h-40 overflow-y-auto hidden group-focus-within:block">
//                       {hsCodes
//                         .filter((h) => h.hS_CODE.includes(formData.hsCode))
//                         .map((h) => (
//                           <div
//                             key={h.hS_CODE}
//                             onMouseDown={() =>
//                               setFormData({ ...formData, hsCode: h.hS_CODE })
//                             }
//                             className="p-3 hover:bg-slate-50 cursor-pointer text-xs font-bold border-b border-slate-50 last:border-none"
//                           >
//                             {h.hS_CODE} -{" "}
//                             <span className="text-slate-400 font-medium">
//                               {h.description}
//                             </span>
//                           </div>
//                         ))}
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
//                         FBR UoM *
//                       </label>
//                       <select
//                         className="w-full p-3 bg-slate-50 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//                         value={formData.unit}
//                         onChange={(e) =>
//                           setFormData({ ...formData, unit: e.target.value })
//                         }
//                         required
//                       >
//                         <option value="">Select Unit</option>
//                         {uomList.map((u) => (
//                           <option key={u.uom_ID} value={u.description}>
//                             {u.description}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
//                         Internal UoM
//                       </label>
//                       <input
//                         className="w-full p-3 bg-slate-50 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//                         placeholder="e.g. Box, Dozen"
//                         value={formData.internalUOM}
//                         onChange={(e) =>
//                           setFormData({
//                             ...formData,
//                             internalUOM: e.target.value,
//                           })
//                         }
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* --- PRICING --- */}
//                 <div className="space-y-5">
//                   <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
//                     <DollarSign size={16} /> Pricing Structure
//                   </h3>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 tracking-widest">
//                         Single Unit Price *
//                       </label>
//                       <input
//                         type="text"
//                         required
//                         className="w-full p-3 bg-emerald-50/50 border-none rounded-2xl font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 outline-none"
//                         placeholder="0.00"
//                         value={
//                           formData.singleUnitPrice == 0
//                             ? ""
//                             : formData.singleUnitPrice
//                         }
//                         onChange={(e) =>
//                           handleNumericInput("singleUnitPrice", e.target.value)
//                         }
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 tracking-widest text-nowrap">
//                         Internal Unit Price
//                       </label>
//                       <input
//                         type="text"
//                         className="w-full p-3 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
//                         placeholder="0.00"
//                         value={formData.internalSinglePrice}
//                         onChange={(e) =>
//                           handleNumericInput(
//                             "internalSinglePrice",
//                             e.target.value,
//                           )
//                         }
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 tracking-widest">
//                       Fixed Notified Value / Retail Price
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full p-3 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
//                       placeholder="0.00"
//                       value={
//                         formData.transactionTypeId === "23" &&
//                         Number(formData.fixedNotifiedValueOrRetailPrice) === 0
//                           ? ""
//                           : formData.fixedNotifiedValueOrRetailPrice
//                       }
//                       required={formData.transactionTypeId == "23"}
//                       onChange={(e) =>
//                         handleNumericInput(
//                           "fixedNotifiedValueOrRetailPrice",
//                           e.target.value,
//                         )
//                       }
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* --- EXTRA TAXES --- */}
//               <section className="bg-orange-50/30 border border-orange-100 rounded-[2rem] p-6">
//                 <h3 className="text-sm font-black text-orange-600 uppercase tracking-widest mb-4 flex items-center gap-2">
//                   <Calculator size={18} /> Additional Levies & Taxes
//                 </h3>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   <div>
//                     <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
//                       Further Tax %
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full p-3 bg-white border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-orange-500 outline-none"
//                       placeholder="0.00"
//                       value={formData.furtherTax}
//                       onChange={(e) =>
//                         handleNumericInput("furtherTax", e.target.value)
//                       }
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
//                       Extra Tax %
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full p-3 bg-white border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-orange-500 outline-none"
//                       placeholder="0.00"
//                       value={formData.extraTax}
//                       onChange={(e) =>
//                         handleNumericInput("extraTax", e.target.value)
//                       }
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
//                       ST Withheld %
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full p-3 bg-white border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-orange-500 outline-none"
//                       placeholder="0.00"
//                       value={formData.salesTaxWithheldAtSource}
//                       onChange={(e) =>
//                         handleNumericInput(
//                           "salesTaxWithheldAtSource",
//                           e.target.value,
//                         )
//                       }
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
//                       FED Payable %
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full p-3 bg-white border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-orange-500 outline-none"
//                       placeholder="0.00"
//                       value={formData.fedPayable}
//                       onChange={(e) =>
//                         handleNumericInput("fedPayable", e.target.value)
//                       }
//                     />
//                   </div>
//                 </div>
//               </section>

//               {/* --- FBR COMPLIANCE --- */}
//               <section className="bg-white border border-slate-200 rounded-[2rem] p-6 relative overflow-hidden shadow-sm hover:border-blue-200 transition-all">
//                 <div className="absolute top-0 left-0 w-2 h-full bg-blue-500" />
//                 <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
//                   <Settings size={18} /> FBR Mapping *
//                 </h2>

//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                   <div>
//                     <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 tracking-widest">
//                       Trans. Type *
//                     </label>
//                     <select
//                       required
//                       className="w-full p-3 bg-slate-50 border-none rounded-2xl font-bold text-xs focus:ring-2 focus:ring-blue-500 outline-none"
//                       value={formData.transactionTypeId}
//                       onChange={(e) => handleTransactionChange(e.target.value)}
//                     >
//                       <option value="">Select Type</option>
//                       {transTypeList.map((t) => (
//                         <option
//                           key={t.transactioN_TYPE_ID}
//                           value={t.transactioN_TYPE_ID}
//                         >
//                           {t.transactioN_DESC}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 tracking-widest">
//                       Tax Rate *
//                     </label>
//                     <select
//                       required
//                       disabled={!formData.transactionTypeId}
//                       className="w-full p-3 bg-slate-50 border-none rounded-2xl font-bold text-xs focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
//                       value={formData.rateId}
//                       onChange={(e) => handleRateChange(e.target.value)}
//                     >
//                       <option value="">Select Rate</option>
//                       {rateOptions.map((r) => (
//                         <option key={r.ratE_ID} value={r.ratE_ID}>
//                           {r.ratE_DESC}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 tracking-widest">
//                       SRO Schedule
//                     </label>
//                     <select
//                       disabled={!formData.rateId}
//                       className="w-full p-3 bg-slate-50 border-none rounded-2xl font-bold text-xs focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
//                       value={
//                         formData.sroScheduleId === 0 || !formData.sroScheduleId
//                           ? ""
//                           : formData.sroScheduleId
//                       }
//                       onChange={(e) => handleSroChange(e.target.value)}
//                       required={sroOptions.length > 0}
//                     >
//                       <option value="">Select SRO</option>
//                       {sroOptions.map((s) => (
//                         <option key={s.srO_ID || s.id} value={s.srO_ID || s.id}>
//                           {s.srO_DESC}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 tracking-widest">
//                       SRO Item
//                     </label>
//                     <select
//                       disabled={!formData.sroScheduleId}
//                       className="w-full p-3 bg-slate-50 border-none rounded-2xl font-bold text-xs focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
//                       value={formData.sroItemId}
//                       required={
//                         !!formData.sroScheduleId && sroItemOptions.length > 0
//                       }
//                       onChange={(e) =>
//                         setFormData({
//                           ...formData,
//                           sroItemId: e.target.value,
//                           sroItemSerialNo:
//                             sroItemOptions.find(
//                               (i) => (i.srO_ITEM_ID || i.id) == e.target.value,
//                             )?.srO_ITEM_DESC || "",
//                         })
//                       }
//                     >
//                       <option value="">Select Item</option>
//                       {sroItemOptions.map((i) => (
//                         <option
//                           key={i.srO_ITEM_ID || i.id}
//                           value={i.srO_ITEM_ID || i.id}
//                         >
//                           {i.srO_ITEM_DESC}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//               </section>

//               {/* --- STATUS --- */}
//               <section className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
//                 <div>
//                   <h4 className="font-bold text-slate-800">Product Status</h4>
//                   <p className="text-xs text-slate-500">
//                     Determine if this product is allowed to be added to new
//                     invoices.
//                   </p>
//                 </div>
//                 <label className="relative inline-flex items-center cursor-pointer">
//                   <input
//                     type="checkbox"
//                     className="sr-only peer"
//                     checked={formData.allowed}
//                     onChange={(e) =>
//                       setFormData({ ...formData, allowed: e.target.checked })
//                     }
//                   />
//                   <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
//                   <span className="ml-3 text-sm font-bold text-slate-700">
//                     {formData.allowed ? "Allowed" : "Blocked"}
//                   </span>
//                 </label>
//               </section>

//               {/* --- ACTIONS --- */}
//               <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-white pb-2">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     if (
//                       sessionStorage.getItem("activeConsultantMode") === "true"
//                     ) {
//                       router.push("/consultant/products");
//                     } else {
//                       setShowForm(false);
//                     }
//                   }}
//                   className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
//                 >
//                   <Check size={18} />{" "}
//                   {isEdit ? "Update Product" : "Save Product"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import {
  Edit3,
  Trash2,
  Plus,
  X,
  Package,
  Layers,
  Hash,
  DollarSign,
  Settings,
  Building2,
  Check,
  Box,
  Calculator,
  ShieldAlert, // Added for restricted access view
  Eye, // Added for read-only view icon
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProductPage({ darkMode }) {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // --- 1. PERMISSION & HIERARCHY STATES ---
  const [perms, setPerms] = useState({});
  const [isSelfManaged, setIsSelfManaged] = useState(false);
  const [isFormReadOnly, setIsFormReadOnly] = useState(false);

  useEffect(() => {
    const storedPerms = JSON.parse(
      sessionStorage.getItem("permissions") || "{}",
    );
    const type = sessionStorage.getItem("user_type");
    setPerms(storedPerms);
    setIsSelfManaged(type === "self_managed");
  }, []);
  // ----------------------------------------

  const [userBusinesses, setUserBusinesses] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("businesses");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [hsCodes, setHsCodes] = useState([]);
  const [transTypeList, setTransTypeList] = useState([]);
  const [uomList, setUomList] = useState([]);
  const [rateOptions, setRateOptions] = useState([]);
  const [sroOptions, setSroOptions] = useState([]);
  const [sroItemOptions, setSroItemOptions] = useState([]);

  const initialForm = {
    id: null,
    product_description: "",
    hsCode: "",
    unit: "",
    internalUOM: "",
    singleUnitPrice: "0",
    fixedNotifiedValueOrRetailPrice: "0",
    internalSinglePrice: "0",
    furtherTax: "0",
    extraTax: "0",
    salesTaxWithheldAtSource: "0",
    fedPayable: "0",
    transactionTypeId: 0,
    transactionType: "",
    sroScheduleId: 0,
    sroSchedule: "",
    sroItemId: 0,
    sroItemSerialNo: "",
    rateId: 0,
    rate: "",
    rateDesc: "",
    allowed: true,
  };

  const [formData, setFormData] = useState(initialForm);
  const [provinceId, setProvinceId] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = sessionStorage.getItem("businesses");
    if (!saved) return;
    const parsed = JSON.parse(saved);
    if (parsed?.length > 0) {
      setProvinceId(parsed[0].province_id);
      setFormData((prev) => ({
        ...prev,
        sellerBusinessId: parsed[0].id,
      }));
    }
  }, []);

  const getFbrHeaders = () => {
    const token = sessionStorage.getItem("sellerToken");
    return { Authorization: `Bearer ${token}`, Accept: "application/json" };
  };

  const fetchProducts = async (userId) => {
    // Permission Guard: View
    if (perms.can_view_product === 0) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/user-products?userId=${userId}`);
      const data = await res.json();
      const formattedData = data.map((p) => ({
        ...p,
        allowed: p.allowed === 1,
      }));
      setProducts(Array.isArray(formattedData) ? formattedData : []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const loadFBRMasterData = async () => {
    try {
      const headers = getFbrHeaders();
      const [hsRes, transRes, uomRes] = await Promise.all([
        fetch("/api/fbr/hsCode", { headers }),
        fetch("/api/fbr/TransactionType", { headers }),
        fetch("/api/fbr/uom", { headers }),
      ]);
      setHsCodes(await hsRes.json());
      setTransTypeList(await transRes.json());
      setUomList(await uomRes.json());
    } catch (err) {
      console.error("FBR Master Data Failed:", err);
    }
  };

  const fetchRates = async (transId, provId) => {
    const today = new Date().toISOString().split("T")[0];
    try {
      const res = await fetch(
        `/api/fbr/rate?date=${today}&transTypeId=${transId}&provinceCode=${provId}`,
        { headers: getFbrHeaders() },
      );
      const json = await res.json();
      setRateOptions(json.data || []);
      return json.data || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const fetchSros = async (rateId, provId) => {
    const today = new Date().toISOString().split("T")[0];
    try {
      const res = await fetch(
        `/api/fbr/sroScheduleNo?rateId=${rateId}&date=${today}&provinceCode=${provId}`,
        { headers: getFbrHeaders() },
      );
      const json = await res.json();
      setSroOptions(json.data || []);
      return json.data || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const fetchItems = async (sroId) => {
    const today = new Date().toISOString().split("T")[0];
    try {
      const res = await fetch(`/api/fbr/sroItem?sroId=${sroId}&date=${today}`, {
        headers: getFbrHeaders(),
      });
      const json = await res.json();
      setSroItemOptions(json.data || []);
      return json.data || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const handleEditClick = async (product) => {
    // Logic: Form opens if view=1, read-only if edit=0
    setIsEdit(true);
    setIsFormReadOnly(perms.can_edit_product === 0);
    setFormData(product);
    setShowForm(true);

    const selectedBiz = userBusinesses.find(
      (b) => Number(b.id) === Number(product.sellerBusinessId),
    );

    if (selectedBiz) {
      const currentProvId = selectedBiz.province_id;
      setProvinceId(currentProvId);
      if (product.transactionTypeId)
        await fetchRates(product.transactionTypeId, currentProvId);
      if (product.rateId) await fetchSros(product.rateId, currentProvId);
      if (product.sroScheduleId) await fetchItems(product.sroScheduleId);
    }
  };

  useEffect(() => {
    const isConsultant =
      sessionStorage.getItem("activeConsultantMode") === "true";
    const editId = sessionStorage.getItem("consultantEditProductId");

    if (isConsultant && products.length > 0) {
      if (editId) {
        // FLOW A: Redirected here to EDIT/VIEW an existing product
        const targetProduct = products.find(
          (p) => p.id.toString() === editId.toString(),
        );
        if (targetProduct) handleEditClick(targetProduct);
      } else {
        // FLOW B: Redirected here to CREATE a new product
        setIsEdit(false);
        setIsFormReadOnly(false); // Enable fields for creation
        setFormData({
          ...initialForm,
          sellerBusinessId:
            userBusinesses.length > 0 ? userBusinesses[0].id : 0,
        });
        setShowForm(true);
      }
    }
  }, [products]);

  useEffect(() => {
    const userId =
      Number(sessionStorage.getItem("parent_id")) ||
      Number(sessionStorage.getItem("userId"));
    if (userId) fetchProducts(userId);
    const storedBusinesses = sessionStorage.getItem("businesses");
    if (storedBusinesses) {
      const parsedBusinesses = JSON.parse(storedBusinesses);
      setUserBusinesses(parsedBusinesses);
    }
    loadFBRMasterData();
  }, [perms.can_view_product]); // Re-fetch when permissions load

  const handleTransactionChange = (typeId) => {
    if (isFormReadOnly) return;
    const type = transTypeList.find((t) => t.transactioN_TYPE_ID == typeId);
    setFormData((prev) => ({
      ...prev,
      transactionTypeId: typeId,
      transactionType: type?.transactioN_DESC.trim() || "",
    }));
    if (provinceId) fetchRates(typeId, provinceId);
  };

  const handleRateChange = async (rateId) => {
    if (isFormReadOnly) return;
    const rate = rateOptions.find((r) => r.ratE_ID == rateId);
    setFormData((prev) => ({
      ...prev,
      rateId: rateId,
      rate: String(rate?.ratE_VALUE || ""),
      rateDesc: rate?.ratE_DESC || "",
    }));
    if (provinceId) fetchSros(rateId, provinceId);
  };

  const handleSroChange = async (sroId) => {
    if (isFormReadOnly) return;
    const sro = sroOptions.find((s) => (s.srO_ID || s.id) == sroId);
    setFormData((prev) => ({
      ...prev,
      sroScheduleId: sroId,
      sroSchedule: sro?.srO_DESC || "",
    }));
    fetchItems(sroId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFormReadOnly) return;

    if (!formData.transactionTypeId) {
      alert("Please select Transaction type");
      return;
    }
    if (!formData.rateId) {
      alert("Please select Rate");
      return;
    }

    const userId =
      Number(sessionStorage.getItem("parent_id")) ||
      Number(sessionStorage.getItem("userId"));
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch("/api/user-products", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, user_id: userId }),
    });

    if (res.ok) {
      if (sessionStorage.getItem("activeConsultantMode") === "true") {
        router.push("/consultant/products");
      } else {
        setShowForm(false);
        fetchProducts(userId);
        setFormData(initialForm);
      }
    } else {
      alert("Error saving product");
    }
  };

  const handleDelete = async (id) => {
    if (perms.can_delete_product === 0) return; // Permission Guard
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/user-products?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const userId =
          Number(sessionStorage.getItem("parent_id")) ||
          Number(sessionStorage.getItem("userId"));
        fetchProducts(userId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNumericInput = (field, value) => {
    if (isFormReadOnly) return;
    const val = value.replace(/[^0-9.]/g, "").replace(/(\..*?)\./g, "$1");
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  // UI Guard: Access Restriction
  if (!loading && perms.can_view_product === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-400">
        <ShieldAlert size={48} />
        <p className="mt-4 font-bold uppercase tracking-widest">
          Access Denied
        </p>
        <p className="text-xs">
          You do not have permission to view the product catalog.
        </p>
      </div>
    );
  }

  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
          Syncing Inventory...
        </p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen px-4 py-8 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}
    >
      <div className="max-w-6xl mx-auto">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-800">
              Product Management
            </h1>
            <p className="text-slate-500 font-medium">
              Catalog and manage your business inventory
            </p>
          </div>
          {/* Permission Guard: Create */}
          {perms.can_create_product === 1 && (
            <button
              onClick={() => {
                setIsEdit(false);
                setIsFormReadOnly(false);
                setFormData({
                  ...initialForm,
                  sellerBusinessId:
                    userBusinesses.length > 0 ? userBusinesses[0].id : 0,
                });
                setRateOptions([]);
                setSroOptions([]);
                setSroItemOptions([]);
                setShowForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
            >
              <Plus size={18} /> New Product
            </button>
          )}
        </div>

        {/* --- PRODUCT LIST --- */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm overflow-hidden">
          <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Package size={18} /> Inventory Items
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-4 py-4 ml-2">ID</th>
                  <th className="px-4 py-4">Description</th>
                  <th className="px-4 py-4">HS Code</th>
                  <th className="px-4 py-4">Unit Price</th>
                  <th className="px-4 py-4">Rate</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-10 text-center text-slate-400 font-bold uppercase text-xs tracking-widest"
                    >
                      No Products Registered
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr
                      key={p.id}
                      className="group hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-5 font-black text-blue-600 text-xs">
                        #{p.id}
                      </td>
                      <td className="px-4 py-5 font-bold text-slate-800">
                        {p.product_description}
                      </td>
                      <td className="px-4 py-5 font-mono text-xs text-slate-500">
                        {p.hsCode}
                      </td>
                      <td className="px-4 py-5 font-semibold text-emerald-600">
                        Rs {Number(p.singleUnitPrice).toLocaleString()}
                      </td>
                      <td className="px-4 py-5">
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                          {p.rateDesc || "Standard"}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${p.allowed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                        >
                          {p.allowed ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleEditClick(p)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          >
                            {perms.can_edit_product === 1 ? (
                              <Edit3 size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                          {/* Permission Guard: Delete */}
                          {perms.can_delete_product === 1 && (
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* --- MODAL FORM --- */}
      {showForm && (
        <div className="fixed inset-0 backdrop-blur-md bg-slate-900/40 z-50 flex items-center justify-center px-4 py-6">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-10 w-full max-w-5xl max-h-full overflow-y-auto custom-scroll">
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-white z-10 pb-4 border-b">
              <h2 className="text-2xl font-black text-slate-800">
                {isFormReadOnly
                  ? "View Product Details"
                  : isEdit
                    ? `Edit Product #${formData.id}`
                    : "Add New Product"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 p-2 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* --- BASIC INFO --- */}
                <div className="space-y-5">
                  <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                    <Package size={16} /> General Info
                  </h3>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                      Product Description *
                    </label>
                    <input
                      readOnly={isFormReadOnly}
                      className={`w-full p-3 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none ${isFormReadOnly ? "bg-gray-100 text-gray-500" : "bg-slate-50"}`}
                      value={formData.product_description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          product_description: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="relative group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                      HS Code *
                    </label>
                    <input
                      readOnly={isFormReadOnly}
                      className={`w-full p-3 border-none rounded-2xl font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none ${isFormReadOnly ? "bg-gray-100 text-gray-500" : "bg-slate-50"}`}
                      value={formData.hsCode}
                      onChange={(e) =>
                        setFormData({ ...formData, hsCode: e.target.value })
                      }
                      required
                    />
                    {!isFormReadOnly && (
                      <div className="absolute z-10 bg-white border border-slate-100 w-full mt-1 rounded-2xl shadow-xl max-h-40 overflow-y-auto hidden group-focus-within:block">
                        {hsCodes
                          .filter((h) => h.hS_CODE.includes(formData.hsCode))
                          .map((h) => (
                            <div
                              key={h.hS_CODE}
                              onMouseDown={() =>
                                setFormData({ ...formData, hsCode: h.hS_CODE })
                              }
                              className="p-3 hover:bg-slate-50 cursor-pointer text-xs font-bold border-b border-slate-50 last:border-none"
                            >
                              {h.hS_CODE} -{" "}
                              <span className="text-slate-400 font-medium">
                                {h.description}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                        FBR UoM *
                      </label>
                      <select
                        disabled={isFormReadOnly}
                        className={`w-full p-3 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none ${isFormReadOnly ? "bg-gray-100 text-gray-500" : "bg-slate-50"}`}
                        value={formData.unit}
                        onChange={(e) =>
                          setFormData({ ...formData, unit: e.target.value })
                        }
                        required
                      >
                        <option value="">Select Unit</option>
                        {uomList.map((u) => (
                          <option key={u.uom_ID} value={u.description}>
                            {u.description}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                        Internal UoM
                      </label>
                      <input
                        readOnly={isFormReadOnly}
                        className={`w-full p-3 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none ${isFormReadOnly ? "bg-gray-100 text-gray-500" : "bg-slate-50"}`}
                        placeholder="e.g. Box, Dozen"
                        value={formData.internalUOM}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            internalUOM: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* --- PRICING --- */}
                <div className="space-y-5">
                  <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                    <DollarSign size={16} /> Pricing
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 tracking-widest">
                        Single Unit Price *
                      </label>
                      <input
                        readOnly={isFormReadOnly}
                        type="text"
                        className={`w-full p-3 border-none rounded-2xl font-bold focus:ring-2 outline-none ${isFormReadOnly ? "bg-gray-100 text-gray-500" : "bg-emerald-50/50 text-emerald-700 focus:ring-emerald-500"}`}
                        value={
                          formData.singleUnitPrice == 0
                            ? ""
                            : formData.singleUnitPrice
                        }
                        onChange={(e) =>
                          handleNumericInput("singleUnitPrice", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 tracking-widest">
                        Internal Price
                      </label>
                      <input
                        readOnly={isFormReadOnly}
                        type="text"
                        className={`w-full p-3 border-none rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none ${isFormReadOnly ? "bg-gray-100 text-gray-500" : "bg-slate-50"}`}
                        value={formData.internalSinglePrice}
                        onChange={(e) =>
                          handleNumericInput(
                            "internalSinglePrice",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 tracking-widest">
                      Fixed / Retail Price
                    </label>
                    <input
                      readOnly={isFormReadOnly}
                      type="text"
                      className={`w-full p-3 border-none rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none ${isFormReadOnly ? "bg-gray-100 text-gray-500" : "bg-slate-50"}`}
                      value={
                        formData.transactionTypeId === "23" &&
                        Number(formData.fixedNotifiedValueOrRetailPrice) === 0
                          ? ""
                          : formData.fixedNotifiedValueOrRetailPrice
                      }
                      required={formData.transactionTypeId == "23"}
                      onChange={(e) =>
                        handleNumericInput(
                          "fixedNotifiedValueOrRetailPrice",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* --- TAXES --- */}
              <section className="bg-orange-50/30 border border-orange-100 rounded-[2rem] p-6">
                <h3 className="text-sm font-black text-orange-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Calculator size={18} /> Additional Taxes
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    "furtherTax",
                    "extraTax",
                    "salesTaxWithheldAtSource",
                    "fedPayable",
                  ].map((field) => (
                    <div key={field}>
                      <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1">
                        {field.replace(/([A-Z])/g, " $1")} %
                      </label>
                      <input
                        readOnly={isFormReadOnly}
                        type="text"
                        className={`w-full p-3 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-orange-500 outline-none ${isFormReadOnly ? "bg-gray-100 text-gray-500" : "bg-white"}`}
                        value={formData[field]}
                        onChange={(e) =>
                          handleNumericInput(field, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* --- FBR MAPPING --- */}
              <section className="bg-white border border-slate-200 rounded-[2rem] p-6 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-500" />
                <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Settings size={18} /> FBR Mapping *
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 tracking-widest">
                      Trans. Type *
                    </label>
                    <select
                      disabled={isFormReadOnly}
                      className={`w-full p-3 border-none rounded-2xl font-bold text-xs focus:ring-2 focus:ring-blue-500 outline-none ${isFormReadOnly ? "bg-gray-100 text-gray-500" : "bg-slate-50"}`}
                      value={formData.transactionTypeId}
                      onChange={(e) => handleTransactionChange(e.target.value)}
                      required
                    >
                      <option value="">Select Type</option>
                      {transTypeList.map((t) => (
                        <option
                          key={t.transactioN_TYPE_ID}
                          value={t.transactioN_TYPE_ID}
                        >
                          {t.transactioN_DESC}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 tracking-widest">
                      Tax Rate *
                    </label>
                    <select
                      disabled={isFormReadOnly || !formData.transactionTypeId}
                      className={`w-full p-3 border-none rounded-2xl font-bold text-xs focus:ring-2 focus:ring-blue-500 outline-none ${isFormReadOnly ? "bg-gray-100 text-gray-500" : "bg-slate-50"}`}
                      value={formData.rateId}
                      onChange={(e) => handleRateChange(e.target.value)}
                      required
                    >
                      <option value="">Select Rate</option>
                      {rateOptions.map((r) => (
                        <option key={r.ratE_ID} value={r.ratE_ID}>
                          {r.ratE_DESC}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 tracking-widest">
                      SRO Schedule
                    </label>
                    <select
                      disabled={isFormReadOnly || !formData.rateId}
                      className={`w-full p-3 border-none rounded-2xl font-bold text-xs focus:ring-2 focus:ring-blue-500 outline-none ${isFormReadOnly ? "bg-gray-100 text-gray-500" : "bg-slate-50"}`}
                      value={formData.sroScheduleId || ""}
                      onChange={(e) => handleSroChange(e.target.value)}
                      required={sroOptions.length > 0}
                    >
                      <option value="">Select SRO</option>
                      {sroOptions.map((s) => (
                        <option key={s.srO_ID || s.id} value={s.srO_ID || s.id}>
                          {s.srO_DESC}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 tracking-widest">
                      SRO Item
                    </label>
                    <select
                      disabled={isFormReadOnly || !formData.sroScheduleId}
                      className={`w-full p-3 border-none rounded-2xl font-bold text-xs focus:ring-2 focus:ring-blue-500 outline-none ${isFormReadOnly ? "bg-gray-100 text-gray-500" : "bg-slate-50"}`}
                      value={formData.sroItemId}
                      required={
                        !!formData.sroScheduleId && sroItemOptions.length > 0
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sroItemId: e.target.value,
                          sroItemSerialNo:
                            sroItemOptions.find(
                              (i) => (i.srO_ITEM_ID || i.id) == e.target.value,
                            )?.srO_ITEM_DESC || "",
                        })
                      }
                    >
                      <option value="">Select Item</option>
                      {sroItemOptions.map((i) => (
                        <option
                          key={i.srO_ITEM_ID || i.id}
                          value={i.srO_ITEM_ID || i.id}
                        >
                          {i.srO_ITEM_DESC}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* --- STATUS --- */}
              <section className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Product Status</h4>
                  <p className="text-xs text-slate-500">
                    Enable/Disable product usage in invoices.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    disabled={isFormReadOnly}
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.allowed}
                    onChange={(e) =>
                      setFormData({ ...formData, allowed: e.target.checked })
                    }
                  />
                  <div
                    className={`w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${isFormReadOnly ? "opacity-50" : "peer-checked:bg-emerald-500"}`}
                  ></div>
                </label>
              </section>

              <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-white pb-2">
                <button
                  type="button"
                  onClick={() => {
                    if (
                      sessionStorage.getItem("activeConsultantMode") === "true"
                    ) {
                      router.push("/consultant/products");
                    } else {
                      setShowForm(false);
                    }
                  }}
                  className="bg-white border border-slate-200 px-6 py-3 rounded-xl font-bold"
                >
                  Cancel
                </button>
                {!isFormReadOnly && (
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    <Check size={18} />{" "}
                    {isEdit ? "Update Product" : "Save Product"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
