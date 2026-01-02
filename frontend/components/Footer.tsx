"use client";

import { useEffect, useState } from "react";

// Chỉ render năm ở client
function FooterYear() {
  const [year, setYear] = useState<number>(0);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return <span>{year}</span>;
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-10 pb-6 font-['Times_New_Roman']">
      {/* Liên hệ */}
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h4 className="text-white text-lg font-semibold mb-3">Liên hệ</h4>

        <p className="text-gray-400 text-sm">
          Cửa hàng phụ kiện thời trang
        </p>
        <p className="text-gray-400 text-sm">
          Địa chỉ: Bắc Từ Liêm, Hà Nội
        </p>
        <p className="text-gray-400 text-sm mb-4">
          Email: PTPMDVGroup12.vn
        </p>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-700 pt-4 mt-6 text-center text-sm text-gray-500">
        <p>
          © <FooterYear /> Website bán phụ kiện thời trang – Đồ án chuyên ngành
        </p>
        <p>
          Xây dựng bằng React & ASP.NET Core
        </p>
      </div>
    </footer>
  );
}
