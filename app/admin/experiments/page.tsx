"use client";

import Link from "next/link";
import { Calculator, MapPin, ArrowRight, Zap, Map, Truck } from "lucide-react";
import { AdminPageTitle, AdminCard, AdminCardContent } from "@/components/admin/ui";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

// Experiment registry (scalable for future additions)
const EXPERIMENTS = [
  {
    id: "calculator",
    title: "Shipping Calculator",
    description:
      "AI-powered package analysis with instant shipping quotes. Test dimensional weight calculations and service pricing.",
    icon: Calculator,
    href: "/admin/experiments/calculator",
    status: "active" as const,
  },
  {
    id: "driver-tracking",
    title: "Driver Tracking Map",
    description:
      "Real-time driver locations with route monitoring and status updates. Mock simulation for testing map features.",
    icon: MapPin,
    href: "/admin/experiments/driver-tracking",
    status: "active" as const,
  },
  {
    id: "route-optimizer",
    title: "Route Optimizer Visualizer",
    description:
      "See route optimization savings with before/after map comparison. Test with 6 diverse scenarios showing distance, time, and fuel cost reductions.",
    icon: Zap,
    href: "/admin/experiments/route-optimizer",
    status: "active" as const,
  },
  {
    id: "zone-heatmap",
    title: "Zone Heat Map Dashboard",
    description:
      "Visualize delivery zones with order volume, revenue, and performance metrics. Polygon-based heatmap with time-based analytics for strategic planning.",
    icon: Map,
    href: "/admin/experiments/zone-heatmap",
    status: "active" as const,
  },
  {
    id: "fleet-optimizer",
    title: "Fleet Optimizer",
    description:
      "Graph-based multi-vehicle routing with capacity constraints. Clarke-Wright algorithm assigns stops across multiple vehicles with interactive network visualization.",
    icon: Truck,
    href: "/admin/experiments/fleet-optimizer",
    status: "active" as const,
  },
];

export default function ExperimentsPage() {
  return (
    <div className="flex flex-col gap-6 pb-20 md:pb-6">
      {/* Mobile Header */}
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger />
        <h1 className="text-foreground text-xl font-bold">Experiments</h1>
      </div>

      {/* Desktop Header */}
      <AdminPageTitle
        title="Experiments"
        description="Test and preview new features before they go live"
      />

      {/* Experiments Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {EXPERIMENTS.map((experiment) => (
          <AdminCard key={experiment.id} hoverable>
            <AdminCardContent className="p-6">
              <div className="flex flex-col gap-4">
                {/* Icon */}
                <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-xl">
                  <experiment.icon className="text-primary h-7 w-7" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-foreground mb-2 text-lg font-bold">{experiment.title}</h3>
                  <p className="text-muted-foreground text-sm">{experiment.description}</p>
                </div>

                {/* Action */}
                <Button
                  asChild
                  className="bg-primary hover:bg-primary/90 w-full font-semibold text-white"
                >
                  <Link href={experiment.href}>
                    Try It
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </AdminCardContent>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
