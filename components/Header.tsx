"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  LayoutDashboard,
  Store,
  BarChart3,
  Package,
  ShoppingBag,
  Truck,
  MapIcon,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Detect if we're in admin section
  const isAdminRoute = pathname?.startsWith("/admin");

  // User-facing navigation links
  const userNavigationLinks = [
    { href: "/", label: "Home" },
    { href: "/calculator", label: "Calculator" },
    { href: "/marketplace", label: "Marketplace" },
  ];

  // Admin navigation links
  const adminNavigationLinks = [
    { href: "/admin", label: "Dashboard", icon: BarChart3 },
    { href: "/admin/orders", label: "Orders", icon: Package },
    { href: "/admin/dispatch", label: "Dispatch", icon: Truck },
    { href: "/admin/products", label: "Products", icon: ShoppingBag },
    { href: "/admin/driver-assist", label: "Driver Assist", icon: Truck },
  ];

  const navigationLinks = isAdminRoute ? adminNavigationLinks : userNavigationLinks;

  return (
    <header
      className={`sticky top-0 z-50 w-full shadow-md ${
        isAdminRoute ? "border-b border-[hsl(215,20%,35%)] bg-[hsl(217,33%,17%)]" : "bg-secondary"
      }`}
      data-theme={isAdminRoute ? "admin" : undefined}
    >
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/envia-logo.png"
            alt="ENVÍA"
            width={120}
            height={40}
            className="h-auto w-[120px]"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
          {navigationLinks.map((link) => {
            const Icon = "icon" in link && link.icon ? (link.icon as LucideIcon) : null;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                  isAdminRoute
                    ? `text-foreground hover:text-primary ${isActive ? "text-primary" : ""}`
                    : "hover:text-primary text-white"
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Admin & Contact - Desktop */}
        <div className="hidden items-center gap-4 md:flex">
          {/* Toggle between Admin Dashboard and Back to Store */}
          {isAdminRoute ? (
            <Link
              href="/"
              className="text-foreground hover:text-primary transition-colors"
              aria-label="Back to Store"
            >
              <Store className="h-5 w-5" />
            </Link>
          ) : (
            <Link
              href="/admin"
              className="hover:text-primary text-white transition-colors"
              aria-label="Admin Dashboard"
            >
              <LayoutDashboard className="h-5 w-5" />
            </Link>
          )}

          {/* Call to Action Button */}
          <Button asChild className="bg-primary hover:bg-primary/90 font-semibold text-white">
            <Link href={isAdminRoute ? "#" : "/contact"}>
              {isAdminRoute ? "IT Help" : "Contact"}
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`transition-colors md:hidden ${
            isAdminRoute ? "text-foreground hover:text-primary" : "hover:text-primary text-white"
          }`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden ${
            isAdminRoute
              ? "border-b border-[hsl(215,20%,35%)] bg-[hsl(217,33%,17%)]"
              : "bg-secondary"
          }`}
        >
          <nav className="container mx-auto flex flex-col gap-2 px-4 py-4">
            {navigationLinks.map((link) => {
              const Icon = "icon" in link && link.icon ? (link.icon as LucideIcon) : null;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 py-3 font-bold transition-colors ${
                    isAdminRoute
                      ? "text-foreground hover:text-primary"
                      : "hover:text-primary text-white"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {link.label}
                </Link>
              );
            })}

            {/* Toggle Admin/Store Link (Mobile) */}
            {isAdminRoute ? (
              <Link
                href="/"
                className="text-foreground hover:text-primary flex items-center gap-2 py-3 font-bold transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Store className="h-4 w-4" />
                Back to Store
              </Link>
            ) : (
              <Link
                href="/admin"
                className="hover:text-primary flex items-center gap-2 py-3 font-bold text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin
              </Link>
            )}

            <Button
              asChild
              className="bg-primary hover:bg-primary/90 mt-4 w-full font-semibold text-white"
            >
              <Link href={isAdminRoute ? "#" : "/contact"} onClick={() => setMobileMenuOpen(false)}>
                {isAdminRoute ? "IT Help" : "Contact"}
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
