"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  User,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { toast } from "sonner";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("navigation");

  // Detect if we're in admin section (exclude login page)
  const isAdminRoute = pathname?.startsWith("/admin") && !pathname.startsWith("/admin/login");

  // Check session on mount
  useEffect(() => {
    if (isAdminRoute) {
      checkSession();
    }
  }, [isAdminRoute]);

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setUser(data.user);
        }
      }
    } catch (error) {
      console.error("Session check failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        toast.success("Logged out successfully");
        setUser(null);
        router.push("/admin/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
  };

  // User-facing navigation links
  const userNavigationLinks = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/calculator", label: t("calculator"), icon: Calculator },
    { href: "/marketplace", label: t("marketplace"), icon: Store },
  ];

  // Admin navigation links (all users see all links - no auth)
  const adminNavigationLinks = [
    { href: "/admin/dispatch", label: "Dispatcher", icon: Truck },
    { href: "/admin/reports", label: "Reports", icon: BarChart3 },
    { href: "/admin/driver-assist", label: "Driver Assist", icon: MapIcon },
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

          {/* Admin User Menu */}
          {isAdminRoute && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-foreground hover:text-primary hover:bg-card"
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm font-semibold">{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card text-foreground">
                <DropdownMenuLabel className="text-foreground">Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Toggle between Admin Dashboard and Back to Store (Non-Admin Routes) */}
          {!isAdminRoute && (
            <>
              <Link
                href="/admin"
                className="hover:text-primary text-white transition-colors"
                aria-label={t("adminDashboard")}
              >
                <LayoutDashboard className="h-5 w-5" />
              </Link>

              {/* Call to Action Button */}
              <Button asChild className="bg-primary hover:bg-primary/90 font-semibold text-white">
                <Link href="/contact">{t("contact")}</Link>
              </Button>
            </>
          )}
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

            {/* Admin User Info (Mobile) */}
            {isAdminRoute && user && (
              <div className="text-foreground py-3 border-t border-border">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <User className="h-4 w-4" />
                  {user.username}
                </div>
              </div>
            )}

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

            {/* Admin Logout Button (Mobile) */}
            {isAdminRoute && user && (
              <Button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="bg-destructive hover:bg-destructive/90 mt-4 w-full font-semibold text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}

            {/* Contact Button (Non-Admin) */}
            {!isAdminRoute && (
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 mt-4 w-full font-semibold text-white"
              >
                <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                  {t("contact")}
                </Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
