// "use client";

// import { useEffect, useState } from "react";

// const FieldItem = ({
//   f,
//   isHeader,
//   isUserDefined,
//   saving,
//   changeField,
//   changeDisplayName,
//   resetFieldName,
//   setHasChanges,
//   getSelected,
// }) => {
//   const options = isHeader ? ["show", "hide"] : ["show", "conditional", "hide"];

//   //const [localName, setLocalName] = useState(f.user_defined_display_name ?? "");
//   const [prevPropName, setPrevPropName] = useState(f.user_defined_display_name);
//   const [localName, setLocalName] = useState(f.user_defined_display_name ?? "");

//   // useEffect(() => {
//   //   setLocalName(f.user_defined_display_name ?? "");
//   // }, [f.user_defined_display_name]);
//   if (f.user_defined_display_name !== prevPropName) {
//     setPrevPropName(f.user_defined_display_name);
//     setLocalName(f.user_defined_display_name ?? "");
//   }

//   const handleInputChange = (e) => {
//     const value = e.target.value;
//     setLocalName(value);
//     // Now this won't cause focus loss because the component won't remount
//     if (value !== (f.user_defined_display_name ?? "")) {
//       setHasChanges(true);
//     }
//   };

//   return (
//     <div className="flex justify-between items-center p-4 border-b last:border-0 hover:bg-gray-50 transition">
//       <span className="text-gray-700 font-medium">{f.name}</span>

//       {isUserDefined ? (
//         <div className="flex items-center gap-2 w-full max-w-md">
//           <input
//             type="text"
//             value={localName}
//             placeholder="Custom display name"
//             onChange={handleInputChange}
//             onBlur={() => changeDisplayName(f.id, localName)}
//             disabled={saving}
//             className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
//           />
//           {localName && (
//             <button
//               type="button"
//               onMouseDown={(e) => e.preventDefault()}
//               onClick={() => resetFieldName(f.id)}
//               disabled={saving}
//               className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
//             >
//               Reset
//             </button>
//           )}
//         </div>
//       ) : null}

//       <div className="flex gap-4">
//         {options.map((opt) => (
//           <label
//             key={opt}
//             className="flex items-center gap-1 cursor-pointer text-sm"
//           >
//             <input
//               type="radio"
//               name={`field-${f.id}`}
//               className="accent-blue-600 w-4 h-4"
//               checked={getSelected(f) === opt}
//               onChange={() => changeField(f.id, opt)}
//               disabled={saving}
//             />
//             <span className={opt === "hide" ? "text-red-600" : "text-gray-600"}>
//               {opt === "conditional"
//                 ? "If Value"
//                 : opt.charAt(0).toUpperCase() + opt.slice(1)}
//             </span>
//           </label>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default function SettingsPage() {
//   const [fields, setFields] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [hasChanges, setHasChanges] = useState(false);
//   const [orientation, setOrientation] = useState("landscape");

//   const loadSettings = async () => {
//     const userId =
//       Number(sessionStorage.getItem("parent_id")) ||
//       Number(sessionStorage.getItem("userId"));

//     if (!userId) return;

//     setLoading(true);
//     try {
//       const savedOrientation =
//         localStorage.getItem("userPrintOrientation") || "landscape";
//       setOrientation(savedOrientation);
//       const res = await fetch(`/api/userChoosableFields?userId=${userId}`);
//       const data = await res.json();
//       setFields(data);
//       setHasChanges(false);
//     } catch (err) {
//       console.error("Fetch error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadSettings();
//   }, []);

//   const getSelected = (f) => {
//     if (f.hide === 1) return "hide";
//     if (f.show === 0 && f.show_if_value === 1) return "conditional";
//     return "show";
//   };

//   const changeField = (fieldId, option) => {
//     setFields((prev) =>
//       prev.map((f) => {
//         if (f.id !== fieldId) return f;
//         let payload;
//         if (option === "show") payload = { show: 1, show_if_value: 0, hide: 0 };
//         else if (option === "conditional")
//           payload = { show: 0, show_if_value: 1, hide: 0 };
//         else payload = { show: 0, show_if_value: 0, hide: 1 };
//         return { ...f, ...payload };
//       }),
//     );
//     setHasChanges(true);
//   };

//   const handleOrientationChange = (value) => {
//     setOrientation(value);
//     localStorage.setItem("userPrintOrientation", value);
//   };

//   const saveChanges = async () => {
//     const userId =
//       Number(sessionStorage.getItem("parent_id")) ||
//       Number(sessionStorage.getItem("userId"));
//     setSaving(true);
//     console.log(
//       fields[fields.length - 2].id,
//       fields[fields.length - 2].user_defined_display_name,
//     );
//     try {
//       await Promise.all(
//         fields.map((f) =>
//           fetch("/api/userChoosableFields", {
//             method: "PUT",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               id: f.id,
//               userId,
//               user_defined_display_name: f.user_defined_display_name,
//               show: f.show,
//               show_if_value: f.show_if_value,
//               hide: f.hide,
//             }),
//           }),
//         ),
//       );
//       setHasChanges(false);
//       alert("Settings updated successfully!");
//     } catch (err) {
//       alert("Failed to save settings.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-64">
//         <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//         <p className="mt-4 text-gray-500 font-medium">
//           Loading your settings...
//         </p>
//       </div>
//     );
//   }

//   const getDisplayName = (f) =>
//     f.user_defined_display_name?.trim() ? f.user_defined_display_name : f.name;

//   const changeDisplayName = (fieldId, value) => {
//     setFields((prev) =>
//       prev.map((f) =>
//         f.id === fieldId ? { ...f, user_defined_display_name: value } : f,
//       ),
//     );
//     setHasChanges(true);
//   };

//   const resetFieldName = (fieldId) => {
//     setFields((prev) =>
//       prev.map((f) =>
//         f.id === fieldId ? { ...f, user_defined_display_name: null } : f,
//       ),
//     );
//     setHasChanges(true);
//   };

//   const rowFields = fields.slice(0, 10);
//   const headerFields = fields.slice(10, 14);
//   const userDefinedFields = fields.slice(14);

//   return (
//     <div className="relative max-w-4xl mx-auto py-8 px-4">
//       <div className="flex justify-between items-center mb-6 bg-white p-4 sticky top-0 z-10 border-b shadow-sm rounded-t-lg">
//         <h2 className="text-xl font-bold text-gray-800">Field Visibility</h2>

//         {hasChanges && (
//           <div className="flex gap-2">
//             <button
//               onClick={loadSettings}
//               disabled={saving}
//               className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={saveChanges}
//               disabled={saving}
//               className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 shadow-md transition-all flex items-center gap-2"
//             >
//               {saving ? (
//                 <>
//                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                   Saving...
//                 </>
//               ) : (
//                 "Save Changes"
//               )}
//             </button>
//           </div>
//         )}
//       </div>

//       <div className="space-y-6">
//         <section className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
//           <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
//             <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">
//               Default Print Orientation
//             </h3>
//           </div>
//           <div className="p-6 flex gap-10">
//             <label className="flex items-center gap-3 cursor-pointer group">
//               <input
//                 type="radio"
//                 name="orientation"
//                 value="portrait"
//                 checked={orientation === "portrait"}
//                 onChange={(e) => handleOrientationChange(e.target.value)}
//                 className="w-5 h-5 accent-blue-600"
//               />
//               <div className="flex flex-col">
//                 <span className="font-semibold text-gray-800">Portrait</span>
//                 <span className="text-xs text-gray-500 italic">
//                   Standard Vertical
//                 </span>
//               </div>
//             </label>

//             <label className="flex items-center gap-3 cursor-pointer group">
//               <input
//                 type="radio"
//                 name="orientation"
//                 value="landscape"
//                 checked={orientation === "landscape"}
//                 onChange={(e) => handleOrientationChange(e.target.value)}
//                 className="w-5 h-5 accent-blue-600"
//               />
//               <div className="flex flex-col">
//                 <span className="font-semibold text-gray-800">Landscape</span>
//                 <span className="text-xs text-gray-500 italic">
//                   Wide View (Recommended)
//                 </span>
//               </div>
//             </label>
//           </div>
//         </section>
//         <section className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
//           <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
//             <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">
//               Invoice Print Row Fields
//             </h3>
//             <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
//               {rowFields.length} Fields
//             </span>
//           </div>

//           <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
//             {rowFields.map((f) => (
//               <FieldItem
//                 key={f.id}
//                 f={f}
//                 isHeader={false}
//                 saving={saving}
//                 changeField={changeField}
//                 changeDisplayName={changeDisplayName}
//                 resetFieldName={resetFieldName}
//                 setHasChanges={setHasChanges}
//                 getSelected={getSelected}
//               />
//             ))}
//           </div>
//         </section>
//         <section className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
//           <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
//             <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">
//               Invoice Print Header
//             </h3>
//             <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
//               {headerFields.length} Fields
//             </span>
//           </div>

//           <div className="bg-white">
//             {headerFields.map((f) => (
//               <FieldItem
//                 key={f.id}
//                 f={f}
//                 isHeader={true}
//                 saving={saving}
//                 changeField={changeField}
//                 changeDisplayName={changeDisplayName}
//                 resetFieldName={resetFieldName}
//                 setHasChanges={setHasChanges}
//                 getSelected={getSelected}
//               />
//             ))}
//           </div>
//         </section>
//         <section className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
//           <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
//             <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">
//               User Defined Fields
//             </h3>
//             <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
//               {userDefinedFields.length} Fields
//             </span>
//           </div>

//           <div className="bg-white">
//             {userDefinedFields.map((f) => (
//               <FieldItem
//                 key={f.id}
//                 f={f}
//                 isHeader={true}
//                 isUserDefined={true}
//                 saving={saving}
//                 changeField={changeField}
//                 changeDisplayName={changeDisplayName}
//                 resetFieldName={resetFieldName}
//                 setHasChanges={setHasChanges}
//                 getSelected={getSelected}
//               />
//             ))}
//           </div>
//         </section>
//       </div>
//       {saving && (
//         <div className="fixed inset-0 bg-white/20 z-50 cursor-wait"></div>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { Lock, ShieldAlert } from "lucide-react";

// Mapping of UI field names to your SQL schema permission columns
const FIELD_PERM_MAP = {
  "Internal Single Unit": "can_edit_print_internal_single_unit",
  "Internal Qty": "can_edit_print_internal_qty",
  "Fixed Notified Value or Retail Price": "can_edit_print_retail_price",
  "Extra Tax": "can_edit_print_extra_tax",
  "Further Tax": "can_edit_print_furthur_tax",
  "Federal Excise Duty": "can_edit_print_fed_payable",
  "Sales Tax With-Held at SOURCE": "can_edit_print_sales_tax",
  "Seller Name": "can_edit_print_seller_name",
  "Seller Address": "can_edit_print_seller_address",
  "Seller NTN": "can_edit_print_seller_ntn",
  "Invoice Print Date": "can_edit_print_invoice_date",
  "Challan No": "can_edit_print_challan_no",
  "Challan Date": "can_edit_print_challan_date",
};

const FieldItem = ({
  f,
  isHeader,
  isUserDefined,
  saving,
  changeField,
  changeDisplayName,
  resetFieldName,
  setHasChanges,
  getSelected,
  isLocked, // Hierarchy lock status
}) => {
  const options = isHeader ? ["show", "hide"] : ["show", "conditional", "hide"];
  const [prevPropName, setPrevPropName] = useState(f.user_defined_display_name);
  const [localName, setLocalName] = useState(f.user_defined_display_name ?? "");

  if (f.user_defined_display_name !== prevPropName) {
    setPrevPropName(f.user_defined_display_name);
    setLocalName(f.user_defined_display_name ?? "");
  }

  const handleInputChange = (e) => {
    if (isLocked) return;
    const value = e.target.value;
    setLocalName(value);
    if (value !== (f.user_defined_display_name ?? "")) {
      setHasChanges(true);
    }
  };

  return (
    <div
      className={`flex justify-between items-center p-4 border-b last:border-0 transition ${isLocked ? "bg-gray-50 opacity-60" : "hover:bg-gray-50"}`}
    >
      <div className="flex flex-col">
        <span
          className={`font-medium ${isLocked ? "text-gray-400" : "text-gray-700"}`}
        >
          {f.name}
        </span>
        {isLocked && (
          <span className="text-[9px] font-black text-blue-500 uppercase flex items-center gap-1">
            <Lock size={10} /> Restricted by Admin
          </span>
        )}
      </div>

      {isUserDefined ? (
        <div className="flex items-center gap-2 w-full max-w-md">
          <input
            type="text"
            value={localName}
            placeholder="Custom display name"
            onChange={handleInputChange}
            onBlur={() => !isLocked && changeDisplayName(f.id, localName)}
            disabled={saving || isLocked}
            className={`w-full px-3 py-2 shadow-md rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${isLocked ? "bg-white cursor-not-allowed" : ""}`}
          />
          {localName && !isLocked && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => resetFieldName(f.id)}
              disabled={saving}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
            >
              Reset
            </button>
          )}
        </div>
      ) : null}

      <div className="flex gap-4">
        {options.map((opt) => (
          <label
            key={opt}
            className={`flex items-center gap-1 text-sm ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            <input
              type="radio"
              name={`field-${f.id}`}
              className="accent-blue-600 w-4 h-4"
              checked={getSelected(f) === opt}
              onChange={() => !isLocked && changeField(f.id, opt)}
              disabled={saving || isLocked}
            />
            <span className={opt === "hide" ? "text-red-600" : "text-gray-600"}>
              {opt === "conditional"
                ? "If Value"
                : opt.charAt(0).toUpperCase() + opt.slice(1)}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default function SettingsPage() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [orientation, setOrientation] = useState("landscape");

  // --- 1. PERMISSION INTEGRATION ---
  const [perms, setPerms] = useState({});
  const [isSelfManaged, setIsSelfManaged] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedPerms = JSON.parse(
      sessionStorage.getItem("permissions") || "{}",
    );
    const type = sessionStorage.getItem("user_type");
    setPerms(storedPerms);
    setIsSelfManaged(type === "self_managed");
  }, []);

  const isOrientationLocked =
    !isSelfManaged && perms.can_edit_print_orientation === 0;

  const getFieldLockStatus = (fieldName) => {
    if (isSelfManaged) return false;
    console.log("field name ", fieldName);
    const permKey = FIELD_PERM_MAP[fieldName];
    console.log("permKey ", permKey);
    console.log("perm", perms[permKey]);

    return permKey ? perms[permKey] === 0 : false;
  };
  // -----------------------------------------------

  const loadSettings = async () => {
    const userId = Number(sessionStorage.getItem("userId"));
    if (!userId) return;

    setLoading(true);
    try {
      const savedOrientation =
        localStorage.getItem("userPrintOrientation") || "landscape";
      setOrientation(savedOrientation);
      const res = await fetch(
        `/api/userChoosableFields?userId=${userId}&role=${sessionStorage.getItem("role")}`,
      );
      const data = await res.json();
      console.log("data fields", data);
      setFields(data);
      setHasChanges(false);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const getSelected = (f) => {
    if (f.hide === 1) return "hide";
    if (f.show === 0 && f.show_if_value === 1) return "conditional";
    return "show";
  };

  const changeField = (fieldId, option) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id !== fieldId) return f;
        let payload;
        if (option === "show") payload = { show: 1, show_if_value: 0, hide: 0 };
        else if (option === "conditional")
          payload = { show: 0, show_if_value: 1, hide: 0 };
        else payload = { show: 0, show_if_value: 0, hide: 1 };
        return { ...f, ...payload };
      }),
    );
    setHasChanges(true);
  };

  const changeDisplayName = (fieldId, value) => {
    setFields((prev) =>
      prev.map((f) =>
        f.id === fieldId ? { ...f, user_defined_display_name: value } : f,
      ),
    );
    setHasChanges(true);
  };

  const resetFieldName = (fieldId) => {
    setFields((prev) =>
      prev.map((f) =>
        f.id === fieldId ? { ...f, user_defined_display_name: null } : f,
      ),
    );
    setHasChanges(true);
  };

  const handleOrientationChange = (value) => {
    if (isOrientationLocked) return;
    setOrientation(value);
    localStorage.setItem("userPrintOrientation", value);
  };

  const saveChanges = async () => {
    const userId =
      Number(sessionStorage.getItem("parent_id")) ||
      Number(sessionStorage.getItem("userId"));
    setSaving(true);
    try {
      await Promise.all(
        fields.map((f) =>
          fetch("/api/userChoosableFields", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: f.id,
              userId,
              user_defined_display_name: f.user_defined_display_name,
              show: f.show,
              show_if_value: f.show_if_value,
              hide: f.hide,
            }),
          }),
        ),
      );
      setHasChanges(false);
      alert("Settings updated successfully!");
    } catch (err) {
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium">Loading settings...</p>
      </div>
    );
  }

  const rowFields = fields.slice(0, 10);
  const headerFields = fields.slice(10, 14);
  const userDefinedFields = fields.slice(14);

  return (
    <div className="relative">
      <div className="flex justify-between bg-gray-50 -top-5 items-center mb-6 p-4 sticky z-10 border-b">
        <h2 className="text-[24px] md:text-3xl font-bold text-gray-800 bg-gray-50">
          Field Visibility & Printing
        </h2>

        {hasChanges && (
          <div className="flex gap-2">
            <button
              onClick={loadSettings}
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={saveChanges}
              disabled={saving}
              className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 shadow-md transition-all"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* --- PRINT ORIENTATION --- */}
        <section
          className={`bg-white rounded-lg shadow-md overflow-hidden ${isOrientationLocked ? "opacity-75" : ""}`}
        >
          <div className="bg-gray-200 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">
                Default Orientation
              </h3>
              {isOrientationLocked && (
                <span className="text-[10px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                  <Lock size={10} className="inline mr-1" /> Restricted
                </span>
              )}
            </div>
          </div>
          <div className="p-6 flex gap-10">
            <label
              className={`flex items-center gap-3 ${isOrientationLocked ? "cursor-not-allowed" : "cursor-pointer group"}`}
            >
              <input
                disabled={isOrientationLocked}
                type="radio"
                name="orientation"
                value="portrait"
                checked={orientation === "portrait"}
                onChange={(e) => handleOrientationChange(e.target.value)}
                className="w-5 h-5 accent-blue-600"
              />
              <div className="flex flex-col">
                <span
                  className={`font-semibold ${isOrientationLocked ? "text-gray-400" : "text-gray-800"}`}
                >
                  Portrait
                </span>
                <span className="text-xs text-gray-500 italic">
                  Vertical Layout
                </span>
              </div>
            </label>

            <label
              className={`flex items-center gap-3 ${isOrientationLocked ? "cursor-not-allowed" : "cursor-pointer group"}`}
            >
              <input
                disabled={isOrientationLocked}
                type="radio"
                name="orientation"
                value="landscape"
                checked={orientation === "landscape"}
                onChange={(e) => handleOrientationChange(e.target.value)}
                className="w-5 h-5 accent-blue-600"
              />
              <div className="flex flex-col">
                <span
                  className={`font-semibold ${isOrientationLocked ? "text-gray-400" : "text-gray-800"}`}
                >
                  Landscape
                </span>
                <span className="text-xs text-gray-500 italic">Wide View</span>
              </div>
            </label>
          </div>
        </section>

        {/* --- ROW FIELDS --- */}
        <section className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-200 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">
              Invoice Print Row Fields
            </h3>
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
              {rowFields.length} Fields
            </span>
          </div>
          <div className="max-h-96 overflow-y-auto custom-scroll">
            {rowFields.map((f) => (
              <FieldItem
                key={f.id}
                f={f}
                isHeader={false}
                saving={saving}
                changeField={changeField}
                changeDisplayName={changeDisplayName}
                resetFieldName={resetFieldName}
                setHasChanges={setHasChanges}
                getSelected={getSelected}
                isLocked={getFieldLockStatus(f.name)}
              />
            ))}
          </div>
        </section>

        {/* --- HEADER FIELDS --- */}
        <section className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-200 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">
              Invoice Print Header
            </h3>
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
              {headerFields.length} Fields
            </span>
          </div>
          <div className="bg-white">
            {headerFields.map((f) => (
              <FieldItem
                key={f.id}
                f={f}
                isHeader={true}
                saving={saving}
                changeField={changeField}
                changeDisplayName={changeDisplayName}
                resetFieldName={resetFieldName}
                setHasChanges={setHasChanges}
                getSelected={getSelected}
                isLocked={getFieldLockStatus(f.name)}
              />
            ))}
          </div>
        </section>

        {/* --- USER DEFINED FIELDS --- */}
        <section className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-200 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">
              Custom Labels
            </h3>
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
              {userDefinedFields.length} Fields
            </span>
          </div>
          <div className="bg-white">
            {userDefinedFields.map((f) => (
              <FieldItem
                key={f.id}
                f={f}
                isHeader={true}
                isUserDefined={true}
                saving={saving}
                changeField={changeField}
                changeDisplayName={changeDisplayName}
                resetFieldName={resetFieldName}
                setHasChanges={setHasChanges}
                getSelected={getSelected}
                isLocked={getFieldLockStatus(f.name)}
              />
            ))}
          </div>
        </section>
      </div>
      {saving && (
        <div className="fixed inset-0 bg-white/20 z-50 cursor-wait"></div>
      )}
    </div>
  );
}
