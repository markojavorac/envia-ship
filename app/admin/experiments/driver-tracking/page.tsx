"use client";

import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AdminPageTitle, AdminInfoBox } from "@/components/admin/ui";
import dynamic from "next/dynamic";

// Dynamically import map component to avoid SSR issues with MapLibre GL
const DriverTrackingMap = dynamic(
  () => import("@/components/admin/driver-tracking/DriverTrackingMap"),
  {
    ssr: false,
    loading: () => (
      <div className="bg-muted/50 flex h-[calc(100vh-12rem)] items-center justify-center md:h-[calc(100vh-10rem)]">
        <div className="text-center">
          <div className="border-primary inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
          <p className="text-muted-foreground mt-4 text-sm">Loading map...</p>
        </div>
      </div>
    ),
  }
);

export default function DriverTrackingPage() {
  return (
    <div className="flex flex-col gap-6 pb-20 md:pb-0">
      {/* Mobile Header with Breadcrumbs */}
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger />
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/admin/experiments"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Experiments
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-semibold">Driver Tracking</span>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <AdminPageTitle
          title="Driver Tracking Map"
          description="Real-time driver locations and route monitoring (experimental)"
        />
      </div>

      {/* Info Banner */}
      <AdminInfoBox variant="warning">
        <strong>Experimental Feature:</strong> This is a mock simulation with generated data.
        Real-time tracking requires GPS integration.
      </AdminInfoBox>

      {/* Map Component (full height) */}
      <div className="-mx-4 flex-1 md:-mx-6">
        <DriverTrackingMap />
      </div>
    </div>
  );
}
