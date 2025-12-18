"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, MapPin, Truck, Database, Play } from "lucide-react";
import type { RouteStop } from "@/lib/admin/route-types";
import type { FleetConfig, FleetSolution } from "@/lib/admin/fleet-types";
import { optimizeFleetClarkeWright } from "@/lib/admin/fleet-optimizer/clarke-wright";
import { createFleet } from "@/lib/admin/fleet-optimizer/vehicle-presets";
import { getDemoScenario } from "@/lib/admin/fleet-optimizer/demo-data";
import { DEFAULT_SIMULATION_CONFIG } from "@/lib/admin/fleet-optimizer/simulation-types";
import { FleetConfigForm } from "@/components/admin/fleet-optimizer/FleetConfigForm";
import { FleetMetrics } from "@/components/admin/fleet-optimizer/FleetMetrics";
import { GraphVisualization } from "@/components/admin/fleet-optimizer/GraphVisualization";
import { RouteDetailsTable } from "@/components/admin/fleet-optimizer/RouteDetailsTable";
import { SimulationControls } from "@/components/admin/fleet-optimizer/SimulationControls";
import { LiveStatusPanel } from "@/components/admin/fleet-optimizer/LiveStatusPanel";
import { FleetSimulationMap } from "@/components/admin/fleet-optimizer/FleetSimulationMap";
import { SimulationConfigPanel } from "@/components/admin/fleet-optimizer/SimulationConfigPanel";
import { StopInput } from "@/components/admin/fleet-optimizer/StopInput";
import { RouteStopsList } from "@/components/admin/routes/RouteStopsList";
import { CSVImportButton } from "@/components/admin/routes/CSVImportButton";
import { AdminInfoBox } from "@/components/admin/ui";
import { useFleetSimulation } from "@/hooks/useFleetSimulation";

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

  // Simulation mode state
  const [simulationMode, setSimulationMode] = useState(false);

  // Simulation hook
  const {
    simState,
    isInitialized,
    activeVehicles,
    availableVehicles,
    start,
    pause,
    setSpeed,
    toggleTicketGeneration,
    manualReoptimize,
  } = useFleetSimulation({
    solution: simulationMode ? solution : null,
    config: DEFAULT_SIMULATION_CONFIG,
    depot: fleetConfig.depot,
    fleetConfig,
  });

  // Can optimize if we have vehicles and at least 2 stops
  const canOptimize = fleetConfig.vehicles.length > 0 && stops.length >= 2;

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

  const handleLoadTestFleet = () => {
    // Generate larger test data for simulation
    const {
      generateLoadTestStops,
      generateLoadTestFleet,
    } = require("@/lib/admin/fleet-optimizer/load-test-data");

    const testStops = generateLoadTestStops(30); // 30 stops
    const testFleet = generateLoadTestFleet("small", fleetConfig.depot); // 5 vehicles

    setStops(testStops);
    setFleetConfig(testFleet);
    setSolution(null);

    toast({
      title: "Test Fleet Loaded",
      description: `Generated 5 vehicles and 30 stops for simulation testing`,
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
      <header className="border-border bg-background sticky top-0 z-10 flex h-16 items-center gap-4 border-b px-4 md:px-6">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-foreground text-2xl font-bold">Fleet Optimizer</h1>
          <p className="text-muted-foreground text-sm">
            Experimental • Graph-based multi-vehicle routing
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 space-y-6 p-4 pb-20 md:p-6 md:pb-6">
        {/* Info Banner - Less aggressive */}
        <div className="border-primary bg-primary/5 rounded-lg border-l-4 p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="text-foreground font-semibold">
                Experimental: Graph-Based Fleet Optimization
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Multi-vehicle routing with Clarke-Wright algorithm • Supports capacity constraints
                and pickup/dropoff sequencing
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
              <h2 className="text-foreground flex items-center gap-2 text-xl font-bold">
                <MapPin className="text-primary h-5 w-5" />
                Delivery Stops
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
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
                <Database className="mr-2 h-4 w-4" />
                Load Demo Data
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadTestFleet}
                className="font-semibold"
              >
                <Truck className="mr-2 h-4 w-4" />
                Load Test Fleet
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
          <div className="border-border bg-muted/20 flex flex-col items-center gap-3 border-y py-6">
            <Button
              size="lg"
              onClick={handleOptimizeFleet}
              disabled={!canOptimize || isOptimizing}
              className="bg-primary hover:bg-primary/90 px-8 font-semibold text-white shadow-lg transition-shadow hover:shadow-xl"
            >
              {isOptimizing ? (
                <>
                  <span className="mr-2 animate-spin">⏳</span>
                  Optimizing Fleet...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Optimize {stops.length} Stops Across {fleetConfig.vehicles.length} Vehicles
                </>
              )}
            </Button>
            {!canOptimize && stops.length < 2 && (
              <p className="text-muted-foreground text-sm">Add at least 2 stops to optimize</p>
            )}
          </div>
        )}

        {/* Results */}
        {solution && !simulationMode && (
          <div className="space-y-6">
            <div className="border-border border-t pt-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-foreground text-xl font-bold">Optimization Results</h2>
                <Button
                  onClick={() => {
                    setSimulationMode(true);
                    setTimeout(() => start(), 100);
                  }}
                  className="bg-primary hover:bg-primary/90 font-semibold text-white"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Real-Time Simulation
                </Button>
              </div>
            </div>

            {/* Metrics */}
            <FleetMetrics solution={solution} />

            {/* Graph Visualization */}
            <GraphVisualization graph={solution.graph} height={500} />

            {/* Route Details */}
            <RouteDetailsTable solution={solution} />
          </div>
        )}

        {/* Simulation Mode */}
        {solution && simulationMode && simState && (
          <div className="space-y-4">
            <div className="border-border border-t pt-6">
              <h2 className="text-foreground mb-4 text-xl font-bold">Real-Time Fleet Simulation</h2>
            </div>

            {/* Controls and Metrics - Tighter spacing */}
            <div className="space-y-4">
              {/* Simulation Controls */}
              <SimulationControls
                simState={simState}
                onStart={start}
                onPause={pause}
                onSpeedChange={setSpeed}
                onToggleTicketGeneration={toggleTicketGeneration}
                onManualReoptimize={manualReoptimize}
              />

              {/* Live Status and Metrics */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <FleetMetrics solution={solution} />
                </div>
                <div className="space-y-4 lg:col-span-1">
                  <SimulationConfigPanel simState={simState} config={DEFAULT_SIMULATION_CONFIG} />
                  <LiveStatusPanel simState={simState} />
                </div>
              </div>
            </div>

            {/* Visual separator */}
            <div className="border-border border-t pt-6">
              {/* Tabs: Graph View vs Map View */}
              <Tabs defaultValue="graph" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="graph">Graph View</TabsTrigger>
                  <TabsTrigger value="map">Map View</TabsTrigger>
                </TabsList>

                <TabsContent value="graph" className="mt-4">
                  <GraphVisualization graph={solution.graph} height={500} />
                </TabsContent>

                <TabsContent value="map" className="mt-4">
                  <FleetSimulationMap simState={simState} depot={fleetConfig.depot} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Route Details */}
            <RouteDetailsTable solution={solution} />
          </div>
        )}

        {/* Empty State */}
        {!solution && stops.length === 0 && (
          <div className="border-border bg-muted/20 flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-16">
            <div className="bg-primary/10 mb-4 rounded-full p-4">
              <Truck className="text-primary h-12 w-12" />
            </div>
            <h3 className="text-foreground mb-2 text-xl font-bold">Ready to Optimize Your Fleet</h3>
            <p className="text-muted-foreground mb-4 max-w-md text-center">
              Add delivery stops below to see multi-vehicle routing in action. The algorithm will
              automatically distribute stops across your fleet.
            </p>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1">
                <span className="bg-primary h-2 w-2 rounded-full"></span>
                {fleetConfig.vehicles.length} vehicles configured
              </span>
              <span>•</span>
              <span>
                Capacity: {fleetConfig.vehicles.reduce((sum, v) => sum + v.packageCapacity, 0)}{" "}
                packages
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
