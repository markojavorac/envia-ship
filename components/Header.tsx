"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
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
  Home,
  Calculator,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("navigation");

  // Detect if we're in admin section
  const isAdminRoute = pathname?.startsWith("/admin");

  // User-facing navigation links
  const userNavigationLinks = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/calculator", label: t("calculator"), icon: Calculator },
    { href: "/marketplace", label: t("marketplace"), icon: Store },
  ];

  // Admin navigation links
  const adminNavigationLinks = [
    { href: "/admin", label: t("adminDashboard"), icon: BarChart3 },
    { href: "/admin/orders", label: t("orders"), icon: Package },
    { href: "/admin/dispatch", label: t("dispatch"), icon: Truck },
    { href: "/admin/products", label: t("products"), icon: ShoppingBag },
    { href: "/admin/driver-assist", label: t("driverAssist"), icon: Truck },
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
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Toggle between Admin Dashboard and Back to Store */}
          {isAdminRoute ? (
            <Link
              href="/"
              className="text-foreground hover:text-primary transition-colors"
              aria-label={t("backToStore")}
            >
              <Store className="h-5 w-5" />
            </Link>
          ) : (
            <Link
              href="/admin"
              className="hover:text-primary text-white transition-colors"
              aria-label={t("adminDashboard")}
            >
              <LayoutDashboard className="h-5 w-5" />
            </Link>
          )}

          {/* Call to Action Button */}
          <Button asChild className="bg-primary hover:bg-primary/90 font-semibold text-white">
            <Link href={isAdminRoute ? "#" : "/contact"}>
              {isAdminRoute ? t("itHelp") : t("contact")}
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

            {/* Language Switcher (Mobile) */}
            <div className="py-3">
              <LanguageSwitcher />
            </div>

            {/* Toggle Admin/Store Link (Mobile) */}
            {isAdminRoute ? (
              <Link
                href="/"
                className="text-foreground hover:text-primary flex items-center gap-2 py-3 font-bold transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Store className="h-4 w-4" />
                {t("backToStore")}
              </Link>
            ) : (
              <Link
                href="/admin"
                className="hover:text-primary flex items-center gap-2 py-3 font-bold text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard className="h-4 w-4" />
                {t("adminDashboard")}
              </Link>
            )}

            <Button
              asChild
              className="bg-primary hover:bg-primary/90 mt-4 w-full font-semibold text-white"
            >
              <Link href={isAdminRoute ? "#" : "/contact"} onClick={() => setMobileMenuOpen(false)}>
                {isAdminRoute ? t("itHelp") : t("contact")}
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
