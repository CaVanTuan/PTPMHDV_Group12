"use client";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import api from "@/services/api";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNavBar = !pathname.startsWith("/admin");

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
    <html lang="en">
      <body className="relative">
        {showNavBar && <NavBar />}
        {children}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ top: "80px" }}
        />
      </body>
    </html>
  );
}
