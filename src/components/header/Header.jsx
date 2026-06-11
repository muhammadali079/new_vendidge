"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUserStore } from "@/store/useUserStore";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Moon, Sun } from "lucide-react";
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

export default function Header({ darkMode, setDarkMode, setSidebarOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  const isSuperAdmin = pathname?.includes("/superAdmin");
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [openMenu, setOpenMenu] = useState(false);
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

  const role = userRole?.toLowerCase().trim();
  const type = userType?.toLowerCase().trim();

  const menuItems = useMemo(() => {
    const role = userRole?.toLowerCase().trim();
    const type = userType?.toLowerCase().trim();

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

    const baseBusinessMenu = [
      { icon: Users, label: "Customers", url: "/customer" },
      { icon: FileText, label: "Invoices", url: "/invoice" },
      { icon: Package, label: "Products", url: "/products" },
    ];

    if (role === "admin") {
      baseBusinessMenu.push(
        { icon: LayoutDashboard, label: "Analytics", url: "/dashboard" },
        { icon: UserCircle, label: "Manage Team", url: "/subUsers" },
      );
    }

    if (type === "self_managed" && role === "admin") {
      baseBusinessMenu.push({
        icon: ShieldAlert,
        label: "Agency Control",
        url: "/consultant_permissions",
      });
    }

    baseBusinessMenu.push({ icon: User, label: "Profile", url: "/profile" });

    return baseBusinessMenu;
  }, [userRole, userType]);
  const handleSignOut = () => {
    sessionStorage.clear();
    router.push("/");
  };

  return (
    <header className="shrink-0 z-30 bg-white border border-gray-200 shadow-md rounded-lg mt-3 mx-3">
      <div className="flex items-center justify-between pl-2 pr-3 py-3 gap-4">
        <Link href="/dashboard" className="shrink-0">
          <Image
            src="/images/sidebar/sidebarlogo.png"
            alt="Logo"
            width={521}
            height={421}
            className="xl:w-[200px] xl:h-[40px] w-[150px] h-[30px] object-contain"
          />
        </Link>

        {!isSuperAdmin && (
          <nav className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.url}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${pathname === item.url
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <item.icon className="w-4 h-4 shrink-0 hidden xl:block" />
                <span>{item.label}</span>
              </Link>
            ))}
            <Link
              href="/setting"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${pathname === "/setting"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <Settings className="w-4 h-4 shrink-0 hidden xl:block" />
              <span>Settings</span>
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-3">
          {!isSuperAdmin && (
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <div className="relative cursor-pointer">
            <div
              onClick={() => setOpenMenu(!openMenu)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user?.business_name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-800">
                  {user?.business_name || "User"}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.cnic_ntn || "email@example.com"}
                </p>
              </div>
            </div>
            {openMenu && (
              <div
                className={`absolute top-[52px] right-0 rounded-lg shadow-lg p-2 w-56 lg:w-full
                ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`}
              >
                <div className="block text-left">
                  <h3 className="font-semibold">Name:</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {user?.business_name}
                  </p>
                  <h3 className="font-semibold">NTN/CNIC:</h3>
                  <p className="text-sm text-gray-500 mb-2">{user?.cnic_ntn}</p>
                </div>
                <button
                  onClick={() => {
                    sessionStorage.setItem("userId", "");
                    sessionStorage.setItem("sellerProvince", "");
                    sessionStorage.setItem("sellerProvinceId", "");
                    sessionStorage.setItem("sellerBusinessName", "");
                    sessionStorage.setItem("sellerNTNCNIC", "");
                    sessionStorage.setItem("sellerAddress", "");
                    sessionStorage.setItem("sellerToken", "");
                    sessionStorage.setItem("activeConsultantMode", "");
                    sessionStorage.setItem("consultantEditInvoiceId", "");
                    sessionStorage.setItem("consultantEditProductId", "");
                    sessionStorage.setItem("consultantEditCustomerId", "");

                    logout();
                    router.push("/");
                  }}
                  className={`w-full px-3 py-2 bg-blue-600 rounded-md hover:bg-red-500 hover:text-white transition text-center ${darkMode ? "text-white" : "text-white"}`}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {mobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${mobileNavOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <span className="font-semibold text-gray-800">Menu</span>
          <button
            onClick={() => setMobileNavOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1 px-3 py-3">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.url}
              onClick={() => setMobileNavOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${pathname === item.url
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          ))}
          <Link
            href="/setting"
            onClick={() => setMobileNavOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${pathname === "/setting"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
