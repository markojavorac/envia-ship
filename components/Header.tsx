"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, LayoutDashboard, Store, BarChart3, Package, ShoppingBag, type LucideIcon } from "lucide-react";
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
    { href: "/admin/products", label: "Products", icon: ShoppingBag },
  ];

  const navigationLinks = isAdminRoute ? adminNavigationLinks : userNavigationLinks;

  return (
    <header
      className={`sticky top-0 z-50 w-full shadow-md ${
        isAdminRoute
          ? 'bg-[hsl(217,33%,17%)] border-b border-[hsl(215,20%,35%)]'
          : 'bg-secondary'
      }`}
      data-theme={isAdminRoute ? 'admin' : undefined}
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
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navigationLinks.map((link) => {
            const Icon = ('icon' in link && link.icon) ? (link.icon as LucideIcon) : null;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 transition-colors font-bold text-sm ${
                  isAdminRoute
                    ? `text-foreground hover:text-primary ${isActive ? 'text-primary' : ''}`
                    : 'text-white hover:text-primary'
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Admin & Contact - Desktop */}
        <div className="hidden md:flex items-center gap-4">
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
              className="text-white hover:text-primary transition-colors"
              aria-label="Admin Dashboard"
            >
              <LayoutDashboard className="h-5 w-5" />
            </Link>
          )}

          {/* Call to Action Button */}
          <Button asChild className="bg-primary text-white hover:bg-primary/90 font-semibold">
            <Link href={isAdminRoute ? "#" : "/contact"}>
              {isAdminRoute ? "IT Help" : "Contact"}
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`md:hidden transition-colors ${
            isAdminRoute ? 'text-foreground hover:text-primary' : 'text-white hover:text-primary'
          }`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden ${
            isAdminRoute
              ? 'bg-[hsl(217,33%,17%)] border-b border-[hsl(215,20%,35%)]'
              : 'bg-secondary'
          }`}
        >
          <nav className="container mx-auto flex flex-col px-4 py-4 gap-2">
            {navigationLinks.map((link) => {
              const Icon = ('icon' in link && link.icon) ? (link.icon as LucideIcon) : null;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 transition-colors font-bold py-3 ${
                    isAdminRoute ? 'text-foreground hover:text-primary' : 'text-white hover:text-primary'
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
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-bold py-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Store className="h-4 w-4" />
                Back to Store
              </Link>
            ) : (
              <Link
                href="/admin"
                className="flex items-center gap-2 text-white hover:text-primary transition-colors font-bold py-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin
              </Link>
            )}

            <Button
              asChild
              className="mt-4 bg-primary text-white hover:bg-primary/90 font-semibold w-full"
            >
              <Link
                href={isAdminRoute ? "#" : "/contact"}
                onClick={() => setMobileMenuOpen(false)}
              >
                {isAdminRoute ? "IT Help" : "Contact"}
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
