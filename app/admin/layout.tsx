"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { AdminProvider } from "@/lib/admin/admin-context";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme();

  // Default admin section to dark mode
  useEffect(() => {
    setTheme("dark");
  }, [setTheme]);

  return <AdminProvider>{children}</AdminProvider>;
}
