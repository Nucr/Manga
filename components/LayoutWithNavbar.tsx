"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import React from "react";

export default function LayoutWithNavbar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNavbar = pathname !== "/";
  return (
    <>
      {showNavbar && <Navbar />}
      {children}
      <Toaster position="top-right" />
    </>
  );
} 