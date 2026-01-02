"use client";

import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import api from "@/services/api";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showLayout = !pathname.startsWith("/admin");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    api.get("/api/auth/debug-claims")
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("userChanged"));
      });
  }, []);

  return (
    <html lang="vi">
      <body className="relative font-sans flex flex-col min-h-screen">
        {showLayout && <NavBar />}

        {/* Nội dung chính */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        {showLayout && <Footer />}

        <ToastContainer
          position="top-right"
          autoClose={3000}
          style={{ top: "80px" }}
        />
      </body>
    </html>
  );
}
