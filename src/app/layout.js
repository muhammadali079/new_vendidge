// "use client";

// import { useState } from "react";
// import { Inter } from "next/font/google";
// import { usePathname } from "next/navigation";
// import Sidebar from "../components/sidebar/Sidebar";
// import Header from "../components/header/Header";
// import "./globals.css";

// const inter = Inter({
//   subsets: ["latin"],
//   variable: "--font-inter",
//   weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
// });

// export default function RootLayout({ children }) {
//   const pathname = usePathname();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [darkMode, setDarkMode] = useState(false);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

//   const isHomePage = pathname === "/" || pathname === "/superAdmin";

//   if (isHomePage) {
//     return (
//       <html lang="en">
//         <body className={`${inter.variable} antialiased`}>{children}</body>
//       </html>
//     );
//   }

//   return (
//     <html lang="en">
//       <body className={`${inter.variable} antialiased`}>
//         <div
//           className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}
//         >
//           <Sidebar
//             darkMode={darkMode}
//             sidebarCollapsed={sidebarCollapsed}
//             setSidebarCollapsed={setSidebarCollapsed}
//             sidebarOpen={sidebarOpen}
//             setSidebarOpen={setSidebarOpen}
//           />

//           <div
//             className={`transition-all duration-300 ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"}`}
//           >
//             <Header
//               darkMode={darkMode}
//               setDarkMode={setDarkMode}
//               setSidebarOpen={setSidebarOpen}
//             />

//             <main className="p-6">{children}</main>
//           </div>
//         </div>
//       </body>
//     </html>
//   );
// }
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// 1. New Viewport Export (Fixes the warnings)
export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// 2. Updated Metadata (Removed themeColor and viewport from here)
export const metadata = {
  title: "Vendidge",
  description: "Vendidge an FBR invoicing system",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vendidge",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/images/login/logos.png" />
      </head>
      <body className={`${inter.variable} antialiased h-full`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
