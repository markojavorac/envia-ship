"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { RouteStop, RouteConfig, OptimizedRoute, OptimizationMode } from "@/lib/admin/route-types";
import { optimizeRouteNearestNeighbor } from "@/lib/admin/route-utils";
import { RouteBuilderForm } from "@/components/admin/routes/RouteBuilderForm";
import { RouteStopsList } from "@/components/admin/routes/RouteStopsList";
import { OptimizedRouteView } from "@/components/admin/routes/OptimizedRouteView";
import { CSVImportButton } from "@/components/admin/routes/CSVImportButton";
import { Sparkles, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MAX_STOPS = 25;

export default function RoutePlannerPage() {
  // Route configuration state
  const [config, setConfig] = useState<RouteConfig>({
    isRoundTrip: true,
    optimizationMode: OptimizationMode.NEAREST_NEIGHBOR,
  });

  // Stops state
  const [stops, setStops] = useState<RouteStop[]>([]);

  // Optimized route state
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);

  // Loading state
  const [isOptimizing, setIsOptimizing] = useState(false);

  const { toast } = useToast();

  // Can optimize if we have at least 2 stops
  const canOptimize = stops.length >= 2;

  const handleAddStop = (stop: RouteStop) => {
    setStops((prev) => [...prev, stop]);
    // Clear optimized route when stops change
    setOptimizedRoute(null);
  };

  const handleDeleteStop = (stopId: string) => {
    setStops((prev) => prev.filter((s) => s.id !== stopId));
    // Clear optimized route when stops change
    setOptimizedRoute(null);
  };

  const handleClearAllStops = () => {
    setStops([]);
    setOptimizedRoute(null);
  };

  const handleOptimizeRoute = async () => {
    if (!canOptimize) {
      toast({
        title: "Not enough stops",
        description: "Add at least 2 stops to optimize the route.",
        variant: "destructive",
      });
      return;
    }

    setIsOptimizing(true);

    try {
      // Call async optimization function (uses OSRM for road routing)
      const result = await optimizeRouteNearestNeighbor(stops, config);
      setOptimizedRoute(result);

      toast({
        title: "Route Optimized! 🎉",
        description: `Found an optimized route saving ${result.distanceSaved.toFixed(
          1
        )} km and ${result.timeSaved} minutes.`,
      });
    } catch (error) {
      console.error("Optimization error:", error);
      toast({
        title: "Optimization Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleReset = () => {
    setStops([]);
    setConfig({
      isRoundTrip: true,
      optimizationMode: OptimizationMode.NEAREST_NEIGHBOR,
    });
    setOptimizedRoute(null);
  };

  const handleSaveTemplate = () => {
    toast({
      title: "Coming Soon",
      description: "Template saving will be available in the next update.",
    });
  };

  const handleCSVImport = (importedStops: RouteStop[]) => {
    setStops((prev) => [...prev, ...importedStops]);
    // Clear optimized route when stops change
    setOptimizedRoute(null);

    toast({
      title: "Import Successful",
      description: `Added ${importedStops.length} stop${
        importedStops.length !== 1 ? "s" : ""
      } to route.`,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Mobile Header */}
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger />
        <h1 className="text-foreground text-xl font-bold">Route Planner</h1>
      </div>

      {/* Desktop Header */}
      <div className="hidden items-center justify-between md:flex">
        <div>
          <h1 className="text-foreground text-2xl font-bold md:text-3xl">Route Planner</h1>
          <p className="text-muted-foreground mt-1">
            Optimize delivery routes for maximum efficiency
          </p>
        </div>

        {/* Reset button */}
        {(stops.length > 0 || optimizedRoute) && (
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="border-border border-2"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        )}
      </div>

      {/* Grid layout for desktop */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column - Input */}
        <div className="space-y-4">
          {/* Route Builder Form */}
          <RouteBuilderForm
            config={config}
            onConfigChange={setConfig}
            onAddStop={handleAddStop}
            currentStopCount={stops.length}
            maxStops={MAX_STOPS}
          />

          {/* CSV Import Button */}
          <div className="flex justify-center">
            <CSVImportButton
              onImport={handleCSVImport}
              currentStopCount={stops.length}
              maxStops={MAX_STOPS}
              disabled={stops.length >= MAX_STOPS}
            />
          </div>

          {/* Stops List */}
          <RouteStopsList
            stops={stops}
            onDelete={handleDeleteStop}
            onClearAll={handleClearAllStops}
            maxStops={MAX_STOPS}
          />

          {/* Optimize Button */}
          <Button
            type="button"
            onClick={handleOptimizeRoute}
            disabled={!canOptimize || isOptimizing}
            className="bg-primary hover:bg-primary/90 h-12 w-full text-lg font-semibold text-white"
          >
            {isOptimizing ? (
              <>
                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white" />
                Optimizing Route...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Optimize Route
              </>
            )}
          </Button>

          {!canOptimize && (
            <p className="text-muted-foreground -mt-2 text-center text-sm">
              Add at least 2 stops to optimize
            </p>
          )}
        </div>

        {/* Right Column - Results */}
        <div className="space-y-4">
          {optimizedRoute ? (
            <OptimizedRouteView
              optimizedRoute={optimizedRoute}
              onSaveTemplate={handleSaveTemplate}
            />
          ) : (
            // Empty state
            <div className="flex h-full min-h-[400px] items-center justify-center">
              <div className="text-muted-foreground text-center">
                <Sparkles className="mx-auto mb-4 h-16 w-16" />
                <p className="text-lg font-medium">No route optimized yet</p>
                <p className="mt-2 text-sm">
                  Add stops and click &ldquo;Optimize Route&rdquo; to see results
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
