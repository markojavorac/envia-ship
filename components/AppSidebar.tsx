"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import {
  Home,
  Calculator,
  Store,
  Truck,
  BarChart3,
  MapIcon,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("navigation");
  const { state } = useSidebar();
  const [user, setUser] = useState<{ id: string; username: string } | null>(
    null
  );

  const isLoginPage = pathname?.startsWith("/admin/login");
  const isAdminRoute = pathname?.startsWith("/admin") && !isLoginPage;

  const publicNavItems = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/calculator", label: t("calculator"), icon: Calculator },
    { href: "/marketplace", label: t("marketplace"), icon: Store },
  ];

  const adminNavItems = [
    { href: "/admin/dispatch", label: "Dispatcher", icon: Truck },
    { href: "/admin/reports", label: "Reports", icon: BarChart3 },
    { href: "/admin/driver-assist", label: "Driver Assist", icon: MapIcon },
  ];

  const navItems = isAdminRoute ? adminNavItems : publicNavItems;

  useEffect(() => {
    if (isAdminRoute) {
      checkSession();
    }
  }, [isAdminRoute, pathname]);

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

  if (isLoginPage) return null;

  return (
    <Sidebar collapsible="icon">
      {/* Header with Logo */}
      <SidebarHeader className="border-border border-b">
        <div className={cn(
          "flex items-center py-3",
          state === "collapsed" ? "justify-center px-2" : "justify-between px-3"
        )}>
          <Link href="/" className="flex items-center">
            {state === "collapsed" ? (
              <Image
                src="/envia-logo-icon.tiff"
                alt="ENVÍA"
                width={40}
                height={40}
                className="h-10 w-10"
                priority
              />
            ) : (
              <Image
                src="/envia-logo.png"
                alt="ENVÍA"
                width={120}
                height={40}
                className="h-auto w-[120px]"
                priority
              />
            )}
          </Link>
        </div>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {isAdminRoute ? "Admin Tools" : "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Toggle Admin/Store Link */}
        {!isAdminRoute ? (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin">
                      <LayoutDashboard className="h-5 w-5" />
                      <span>{t("adminDashboard")}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/">
                      <Store className="h-5 w-5" />
                      <span>{t("backToStore")}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer with Language + Theme + User */}
      <SidebarFooter className="border-border border-t">
        <SidebarMenu>
          {/* Language Switcher */}
          <SidebarMenuItem>
            <LanguageSwitcher variant="sidebar" collapsed={state === "collapsed"} />
          </SidebarMenuItem>

          {/* Theme Toggle */}
          <SidebarMenuItem>
            <ThemeToggle />
          </SidebarMenuItem>

          {/* Admin User Info */}
          {isAdminRoute && user && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip={user.username}>
                  <User className="h-4 w-4" />
                  {state !== "collapsed" && (
                    <span className="text-sm font-semibold">
                      {user.username}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                  <LogOut className="h-4 w-4" />
                  {state !== "collapsed" && <span>Logout</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}

          {/* Collapse/Expand Toggle - Always at Bottom */}
          <SidebarMenuItem>
            <SidebarTrigger className="w-full" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
