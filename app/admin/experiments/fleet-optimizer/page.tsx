"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, MapPin, Truck, Database } from "lucide-react";
import type { RouteStop } from "@/lib/admin/route-types";
import type { FleetConfig, FleetSolution } from "@/lib/admin/fleet-types";
import { optimizeFleetClarkeWright } from "@/lib/admin/fleet-optimizer/clarke-wright";
import { createFleet } from "@/lib/admin/fleet-optimizer/vehicle-presets";
import { getDemoScenario } from "@/lib/admin/fleet-optimizer/demo-data";
import { FleetConfigForm } from "@/components/admin/fleet-optimizer/FleetConfigForm";
import { FleetMetrics } from "@/components/admin/fleet-optimizer/FleetMetrics";
import { GraphVisualization } from "@/components/admin/fleet-optimizer/GraphVisualization";
import { RouteDetailsTable } from "@/components/admin/fleet-optimizer/RouteDetailsTable";
import { StopInput } from "@/components/admin/fleet-optimizer/StopInput";
import { RouteStopsList } from "@/components/admin/routes/RouteStopsList";
import { CSVImportButton } from "@/components/admin/routes/CSVImportButton";
import { AdminInfoBox } from "@/components/admin/ui";

const MAX_STOPS = 50;

export default function FleetOptimizerPage() {
  const { toast } = useToast();

  // Fleet configuration state
  const [fleetConfig, setFleetConfig] = useState<FleetConfig>({
    vehicles: createFleet([
      { typeId: "van", count: 2 },
      { typeId: "truck", count: 1 },
    ]),
    depot: {
      id: "depot-1",
      address: "ENVÍA Oficina Central, 12 Calle 1-25, Zona 10",
      coordinates: { lat: 14.5995, lng: -90.5155 },
      zone: "zona-10",
    },
    returnToDepot: true,
  });

  // Stops state
  const [stops, setStops] = useState<RouteStop[]>([]);

  // Solution state
  const [solution, setSolution] = useState<FleetSolution | null>(null);

  // Loading state
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Can optimize if we have vehicles and at least 2 stops
  const canOptimize =
    fleetConfig.vehicles.length > 0 && stops.length >= 2;

  const handleAddStop = (stop: RouteStop) => {
    if (stops.length >= MAX_STOPS) {
      toast({
        title: "Maximum stops reached",
        description: `Cannot add more than ${MAX_STOPS} stops`,
        variant: "destructive",
      });
      return;
    }

    setStops((prev) => [...prev, stop]);
    setSolution(null); // Clear solution when stops change
  };

  const handleDeleteStop = (stopId: string) => {
    setStops((prev) => prev.filter((s) => s.id !== stopId));
    setSolution(null);
  };

  const handleClearAllStops = () => {
    setStops([]);
    setSolution(null);
  };

  const handleImportStops = (imported: RouteStop[]) => {
    if (imported.length > MAX_STOPS) {
      toast({
        title: "Too many stops",
        description: `Imported ${imported.length} stops, but maximum is ${MAX_STOPS}`,
        variant: "destructive",
      });
      return;
    }

    setStops(imported);
    setSolution(null);
  };

  const handleLoadDemoData = () => {
    const demoStops = getDemoScenario("medium"); // 15 stops
    setStops(demoStops);
    setSolution(null);
    toast({
      title: "Demo Data Loaded",
      description: `Added ${demoStops.length} sample delivery stops across Guatemala City`,
    });
  };

  const handleOptimizeFleet = async () => {
    if (!canOptimize) {
      toast({
        title: "Cannot optimize",
        description: "Add at least 2 stops and 1 vehicle",
        variant: "destructive",
      });
      return;
    }

    setIsOptimizing(true);

    try {
      const result = await optimizeFleetClarkeWright(stops, fleetConfig);
      setSolution(result);

      toast({
        title: "Fleet Optimized! 🎉",
        description: `${result.vehiclesUsed} vehicles assigned, ${result.totalDistance.toFixed(1)}km total distance`,
      });
    } catch (error) {
      console.error("Optimization error:", error);
      toast({
        title: "Optimization failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 md:px-6">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            Fleet Optimizer
          </h1>
          <p className="text-sm text-muted-foreground">
            Experimental • Graph-based multi-vehicle routing
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 space-y-6 pb-20 md:pb-6">
        {/* Info Banner - Less aggressive */}
        <div className="rounded-lg border-l-4 border-primary bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-foreground">Experimental: Graph-Based Fleet Optimization</p>
              <p className="text-sm text-muted-foreground mt-1">
                Multi-vehicle routing with Clarke-Wright algorithm • Supports capacity constraints and pickup/dropoff sequencing
              </p>
            </div>
          </div>
        </div>

        {/* Fleet Configuration */}
        <FleetConfigForm config={fleetConfig} onChange={setFleetConfig} />

        {/* Stops Input */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Delivery Stops
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Add stops manually or import from CSV • Max {MAX_STOPS} stops
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadDemoData}
                className="font-semibold"
              >
                <Database className="h-4 w-4 mr-2" />
                Load Demo Data
              </Button>
              <CSVImportButton onImport={handleImportStops} />
            </div>
          </div>

          <StopInput
            onAddStop={handleAddStop}
            disabled={stops.length >= MAX_STOPS}
            maxStops={MAX_STOPS}
            currentCount={stops.length}
          />

          <RouteStopsList
            stops={stops}
            onDeleteStop={handleDeleteStop}
            onClearAll={handleClearAllStops}
            maxStops={MAX_STOPS}
          />
        </div>

        {/* Optimize Button */}
        {stops.length > 0 && (
          <div className="flex flex-col items-center gap-3 py-6 border-y border-border bg-muted/20">
            <Button
              size="lg"
              onClick={handleOptimizeFleet}
              disabled={!canOptimize || isOptimizing}
              className="bg-primary text-white hover:bg-primary/90 font-semibold px-8 shadow-lg hover:shadow-xl transition-shadow"
            >
              {isOptimizing ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Optimizing Fleet...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Optimize {stops.length} Stops Across {fleetConfig.vehicles.length} Vehicles
                </>
              )}
            </Button>
            {!canOptimize && stops.length < 2 && (
              <p className="text-sm text-muted-foreground">
                Add at least 2 stops to optimize
              </p>
            )}
          </div>
        )}

        {/* Results */}
        {solution && (
          <div className="space-y-6">
            <div className="border-t border-border pt-6">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Optimization Results
              </h2>
            </div>

            {/* Metrics */}
            <FleetMetrics solution={solution} />

            {/* Graph Visualization */}
            <GraphVisualization graph={solution.graph} height={500} />

            {/* Route Details */}
            <RouteDetailsTable solution={solution} />
          </div>
        )}

        {/* Empty State */}
        {!solution && stops.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-border rounded-lg bg-muted/20">
            <div className="bg-primary/10 rounded-full p-4 mb-4">
              <Truck className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Ready to Optimize Your Fleet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Add delivery stops below to see multi-vehicle routing in action. The algorithm will automatically distribute stops across your fleet.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                {fleetConfig.vehicles.length} vehicles configured
              </span>
              <span>•</span>
              <span>Capacity: {fleetConfig.vehicles.reduce((sum, v) => sum + v.packageCapacity, 0)} packages</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
