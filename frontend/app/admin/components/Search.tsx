"use client";
import { useState, useEffect } from "react";

interface SearchInputProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  debounceTime?: number;
}

function removeVietnameseTones(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export default function SearchInput({ placeholder = "Tìm kiếm...", onSearch, debounceTime = 300 }: SearchInputProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(removeVietnameseTones(value).toLowerCase());
    }, debounceTime);

    return () => clearTimeout(handler);
  }, [value, onSearch, debounceTime]);

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      className="border rounded px-2 py-1 w-full"
    />
  );
}
