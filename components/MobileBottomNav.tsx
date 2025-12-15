"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Truck,
  BarChart3,
  MapIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const isLoginPage = pathname?.startsWith("/admin/login");

  const navItems = [
    { href: "/admin/dispatch", icon: Truck, label: "Dispatch" },
    { href: "/admin/reports", icon: BarChart3, label: "Reports" },
    { href: "/admin/driver-assist", icon: MapIcon, label: "Assist" },
  ];

  if (isLoginPage) return null;

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden h-16",
        "flex items-center justify-around border-t shadow-lg",
        "bg-card border-border"
      )}
      role="navigation"
      aria-label="Mobile navigation"
    >
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors min-h-[44px] min-w-[44px]",
            pathname === item.href
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label={item.label}
          aria-current={pathname === item.href ? "page" : undefined}
        >
          <item.icon className="h-6 w-6" />
          <span className="text-xs font-medium">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
