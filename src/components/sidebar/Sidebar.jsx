// 'use client';

// import Image from 'next/image';
// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react'; // Added useState

// import {
//     Wallet, Users, FileText, Settings, HelpCircle,
//     ChevronLeft, ChevronRight, X, Package
// } from 'lucide-react';

// export default function Sidebar({ darkMode, sidebarCollapsed, setSidebarCollapsed, sidebarOpen, setSidebarOpen }) {
//     const pathname = usePathname();
//     const router = useRouter();

//     // 1. Add state for role to avoid SSR errors
//     const [userRole, setUserRole] = useState(null);
//     useEffect(() => {
//         if (typeof window !== "undefined") {
//             const userId = sessionStorage.getItem("userId");
//             const role = sessionStorage.getItem("role");
//             const currentPath = window.location.pathname; // or use 'pathname' from usePathname()

//             setUserRole(role);

//             // 1. Define Public Routes (where the guard should NOT run)
//             if (currentPath === '/' || currentPath === '/superAdmin' || currentPath === '/superAdmin/homepage') {
//                 return;
//             }

//             // 2. If no user, send to login
//             if (!userId) {
//                 router.push('/');
//                 return;
//             }

//             // 3. Role-based restrictions
//             const restrictedForSubUsers = ['/dashboard', '/profile', '/superAdmin'];
//             if (role === "sub_user" && restrictedForSubUsers.includes(currentPath)) {
//                 if (userId){
//                      router.push('/invoice'); // Redirect to their allowed homepage, NOT the login page
//                 }else{
//                      router.push('/'); // Redirect to their allowed homepage, NOT the login page
//                 }

//             }
//         }
//     }, [router]); // Added pathname to dependency to re-check on navigation

//     // 2. Filter menu items based on the state role
//     const menuItems = [
//         // { icon: Wallet, label: 'Dashboard', url: '/dashboard' },
//         { icon: Users, label: 'Customer', url: '/customer' },
//         { icon: FileText, label: 'Invoice', url: '/invoice' },
//         // { icon: FileText, label: 'Profile', url: '/profile' },
//         // Use userRole state here
//         ...(userRole === "admin" ? [{ icon: Users, label: 'Sub Users', url: '/subUsers' }, { icon: Wallet, label: 'Dashboard', url: '/dashboard' }, { icon: FileText, label: 'Profile', url: '/profile' },{ icon: Package, label: 'Products', url: '/products' },] : []),
//     ].filter(Boolean); // Cleans up false/null values

//     const bottomItems = [
//         { icon: Settings, label: 'Settings', url: '/setting' },
//         {
//             icon: HelpCircle,
//             label: 'Help',
//             url: "https://wa.me/923249464726?text=Assalam%20O%20Alaikum,%20I%20want%20to%20Subscribe%20Vendidge",
//             external: true
//         },
//     ];

//     return (
//         <>
//             {sidebarOpen && (
//                 <div
//                     className="fixed inset-0 bg-black/30 z-40 lg:hidden"
//                     onClick={() => setSidebarOpen(false)}
//                 />
//             )}

//             <aside
//                 className={`fixed top-0 left-0 z-50 h-full transition-all duration-300
//                 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r ${darkMode ? 'border-gray-800' : 'border-gray-200'}
//                 ${sidebarCollapsed ? 'w-20' : 'w-64'}
//                 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
//             >
//                 <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} flex items-center justify-between py-4 px-5 border-b border-gray-200 dark:border-gray-700`}>
//                     <div className="flex-1 flex justify-start lg:justify-center">
//                         <Link href="/dashboard">
//                             <Image
//                                 src={darkMode ? "/images/login/logos.png" : "/images/sidebar/sidebarlogo.png"}
//                                 alt="Logo"
//                                 width={521}
//                                 height={421}
//                                 className="w-20 h-10 lg:w-225 lg:h-13 object-contain"
//                             />
//                         </Link>
//                     </div>
//                     <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
//                         <X className="w-6 h-6" />
//                     </button>
//                 </div>

//                 <nav className="p-4 space-y-1 flex-1">
//                     {menuItems.map((item) => (
//                         <Link
//                             key={item.label}
//                             href={item.url}
//                             className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${pathname === item.url
//                                 ? 'bg-blue-600 text-white'
//                                 : darkMode
//                                     ? 'hover:bg-gray-800'
//                                     : 'hover:bg-gray-100'
//                                 }`}
//                         >
//                             <item.icon className="w-5 h-5 shrink-0" />
//                             {!sidebarCollapsed && <span>{item.label}</span>}
//                         </Link>
//                     ))}
//                 </nav>

//                 <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
//                     {bottomItems.map((item) => (
//                         <Link
//                             key={item.label}
//                             href={item.url}
//                             className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${pathname === item.url
//                                 ? 'bg-blue-600 text-white'
//                                 : darkMode
//                                     ? 'hover:bg-gray-800'
//                                     : 'hover:bg-gray-100'
//                                 }`}
//                         >
//                             <item.icon className="w-5 h-5 shrink-0" />
//                             {!sidebarCollapsed && <span>{item.label}</span>}
//                         </Link>
//                     ))}

//                     <button
//                         onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
//                         className={`w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-lg transition ${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
//                             }`}
//                     >
//                         {sidebarCollapsed ? (
//                             <ChevronRight className="w-5 h-5 shrink-0" />
//                         ) : (
//                             <ChevronLeft className="w-5 h-5 shrink-0" />
//                         )}
//                         {!sidebarCollapsed && <span>Collapse</span>}
//                     </button>
//                 </div>
//             </aside>
//         </>
//     );
// }

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import {
  Wallet,
  Users,
  FileText,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Package,
  LayoutDashboard,
  Receipt,
  UserCircle,
  ShieldCheck,
  User,
  LogOut,
  ShieldAlert,
} from "lucide-react";

export default function Sidebar({
  darkMode,
  sidebarCollapsed,
  setSidebarCollapsed,
  sidebarOpen,
  setSidebarOpen,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userId = sessionStorage.getItem("userId");
      const userType = sessionStorage.getItem("userType");
      const role = sessionStorage.getItem("role");
      console.log("user role and type ", role, userType);
      setUserRole(role);
      setUserType(userType);

      if (window.location.pathname === "/" || !userId) return;
    }
  }, []);

  // Ensure these values are normalized (lowercase and trimmed) to prevent matching errors
  const role = userRole?.toLowerCase().trim();
  const type = userType?.toLowerCase().trim();

  const menuItems = useMemo(() => {
    const role = userRole?.toLowerCase().trim();
    const type = userType?.toLowerCase().trim();

    // --- 1. CONSULTANT SIDE LOGIC ---
    if (
      role === "consultant" ||
      role === "admin_consultant" ||
      role === "sub_consultant"
    ) {
      const baseConsultantMenu = [
        { icon: LayoutDashboard, label: "Dashboard", url: "/consultant" },
        {
          icon: Receipt,
          label: "Master Invoices",
          url: "/consultant/invoices",
        },
        { icon: Package, label: "Products", url: "/consultant/products" },
        { icon: Users, label: "Customers", url: "/consultant/customers" },
      ];

      // Sub-Consultants are strictly blocked from management and profile
      if (role !== "sub_consultant") {
        baseConsultantMenu.push(
          {
            icon: UserCircle,
            label: "Sub-Consultants",
            url: "/consultant/sub-consultants",
          },
          {
            icon: ShieldCheck,
            label: "Permissions",
            url: "/consultant/user-permissions",
          },
          { icon: User, label: "Profile", url: "/consultant/profile" },
        );
      }
      return baseConsultantMenu;
    }

    // --- 2. BUSINESS SIDE LOGIC (Admin & Sub-Users) ---
    const baseBusinessMenu = [
      { icon: Users, label: "Customers", url: "/customer" },
      { icon: FileText, label: "Invoices", url: "/invoice" },
      { icon: Package, label: "Products", url: "/products" },
    ];

    // ALL Admins (Managed or Self-Managed) must see these
    if (role === "admin") {
      baseBusinessMenu.push(
        { icon: LayoutDashboard, label: "Analytics", url: "/dashboard" },
        { icon: UserCircle, label: "Manage Team", url: "/subUsers" },
      );
    }

    // ONLY Self-Managed Admins see Agency Control
    if (type === "self_managed" && role === "admin") {
      baseBusinessMenu.push({
        icon: ShieldAlert,
        label: "Agency Control",
        url: "/consultant_permissions",
      });
    }

    // Everyone on business side sees their own profile
    baseBusinessMenu.push({ icon: User, label: "Profile", url: "/profile" });

    return baseBusinessMenu;
  }, [userRole, userType]); // Re-renders automatically when these values change
  const handleSignOut = () => {
    sessionStorage.clear();
    router.push("/");
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full transition-all duration-300 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-r ${sidebarCollapsed ? "w-20" : "w-64"} ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* RESTORED LOGO SECTION */}
        <div
          className={`flex items-center justify-between py-4 px-5 border-b ${darkMode ? "border-gray-700" : "border-gray-100"}`}
        >
          <div className="flex-1 flex justify-start lg:justify-center">
            <Link
              href={userRole === "consultant" ? "/consultant" : "/dashboard"}
            >
              <Image
                src={
                  darkMode
                    ? "/images/login/logos.png"
                    : "/images/sidebar/sidebarlogo.png"
                }
                alt="Logo"
                width={521}
                height={421}
                className={`${sidebarCollapsed ? "w-10" : "w-32"} h-10 object-contain`}
              />
            </Link>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.url}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                pathname === item.url
                  ? "bg-blue-600 text-white shadow-md"
                  : darkMode
                    ? "hover:bg-gray-700 text-gray-300"
                    : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* UNIFIED BOTTOM SECTION */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-1">
          <Link
            href="/setting"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${pathname === "/setting" ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-600"}`}
          >
            <Settings className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span>Settings</span>}
          </Link>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
