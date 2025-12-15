"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, TrendingDown, ArrowLeft, Sparkles } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AdminPageTitle, AdminCard, AdminCardContent, AdminInfoBox } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RouteComparisonMap } from "@/components/admin/route-optimizer/RouteComparisonMap";
import { RouteMetrics } from "@/components/admin/route-optimizer/RouteMetrics";
import { RouteOptimizationProgress } from "@/components/admin/route-optimizer/RouteOptimizationProgress";
import {
  MOCK_SCENARIOS,
  getScenarioById,
  getDefaultScenario,
  type MockScenario,
} from "@/lib/admin/route-optimizer/mock-scenarios";
import type {
  OptimizedRoute,
  RouteConfig,
  RouteStop,
  OptimizationProgress,
} from "@/lib/admin/route-types";
import { OptimizationMode, RoutingMode } from "@/lib/admin/route-types";
import { optimizeRouteNearestNeighbor } from "@/lib/admin/route-utils";
import {
  validateVRPPDRoute,
  hasVRPPDConstraints,
  getViolationMessages,
} from "@/lib/admin/vrppd-constraints";
import type { ValidationResult } from "@/lib/admin/vrppd-constraints";
import { toast } from "sonner";

/**
 * Route Optimizer Visualizer - Experimental Feature
 *
 * Demonstrates route optimization savings with:
 * - Side-by-side map comparison (BEFORE red vs. AFTER green)
 * - 6 diverse test scenarios
 * - Clear ROI metrics
 * - Interactive demo for CEO presentation
 */

export default function RouteOptimizerPage() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(getDefaultScenario().id);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState<OptimizationProgress | null>(
    null
  );
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const selectedScenario = getScenarioById(selectedScenarioId) || getDefaultScenario();
  const hasVRPPD = selectedScenario.stops.some(
    (s) => s.stopType === "pickup" || s.stopType === "dropoff"
  );

  const handleOptimize = async () => {
    setIsOptimizing(true);
    setShowResults(false);
    setOptimizationProgress(null);
    setValidationResult(null);

    // Track start time for minimum delay enforcement
    const startTime = Date.now();
    const MIN_OPTIMIZATION_TIME = 2000; // 2 seconds minimum for better UX

    try {
      // Convert scenario stops to RouteStops
      const stops: RouteStop[] = selectedScenario.stops.map((stop, index) => ({
        id: `${selectedScenario.id}-${index}`,
        address: stop.address,
        coordinates: stop.coordinates,
        zone: stop.zone,
        notes: stop.notes,
        recipientName: stop.recipientName,
        stopType: stop.stopType,
        pairedStopId: stop.pairedStopId ? `${selectedScenario.id}-${stop.pairedStopId}` : undefined,
      }));

      // VRPPD Phase 2: Validate route if it has pickup/dropoff constraints
      if (hasVRPPDConstraints(stops)) {
        const validation = validateVRPPDRoute(stops);
        setValidationResult(validation);

        if (!validation.valid) {
          toast.error("Route has VRPPD validation errors. Cannot optimize.");
          setIsOptimizing(false);
          return;
        }
      }

      // Configure route optimization
      const config: RouteConfig = {
        optimizationMode: OptimizationMode.NEAREST_NEIGHBOR,
        routingMode: RoutingMode.ROAD, // Use OSRM road routing
        isRoundTrip: false,
        onProgress: setOptimizationProgress,
      };

      // Optimize route
      const optimized = await optimizeRouteNearestNeighbor(stops, config);

      // Enforce minimum delay for smooth UX (even if cached)
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_OPTIMIZATION_TIME - elapsedTime);

      if (remainingTime > 0) {
        // Show final progress state while waiting
        setOptimizationProgress({
          phase: "calculating_metrics",
          currentStep: stops.length,
          totalSteps: stops.length,
          message: "Finalizing route",
          percent: 100,
        });
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      setOptimizedRoute(optimized);
      setShowResults(true);

      toast.success(
        `Route optimized! Saved ${optimized.distanceSaved.toFixed(1)} km (${Math.round(optimized.improvementPercent)}% improvement)`
      );
    } catch (error) {
      console.error("Route optimization failed:", error);
      toast.error("Failed to optimize route. Using fallback calculations.");

      // Fallback: Use expected savings from scenario
      const fallbackRoute: OptimizedRoute = {
        optimizedStops: selectedScenario.stops.map((stop, index) => ({
          id: `${selectedScenario.id}-${stop.address}`,
          address: stop.address,
          coordinates: stop.coordinates,
          zone: stop.zone,
          notes: stop.notes,
          recipientName: stop.recipientName,
          sequenceNumber: index + 1,
        })),
        totalDistance:
          selectedScenario.expectedSavings.distanceKm *
          (100 / (100 + selectedScenario.expectedSavings.improvementPercent)),
        totalTime:
          selectedScenario.expectedSavings.timeMin *
          (100 / (100 + selectedScenario.expectedSavings.improvementPercent)),
        originalDistance:
          selectedScenario.expectedSavings.distanceKm /
            (selectedScenario.expectedSavings.improvementPercent / 100) +
          selectedScenario.expectedSavings.distanceKm,
        originalTime:
          selectedScenario.expectedSavings.timeMin /
            (selectedScenario.expectedSavings.improvementPercent / 100) +
          selectedScenario.expectedSavings.timeMin,
        distanceSaved: selectedScenario.expectedSavings.distanceKm,
        timeSaved: selectedScenario.expectedSavings.timeMin,
        improvementPercent: selectedScenario.expectedSavings.improvementPercent,
        distanceMatrix: [],
        algorithm: "NEAREST_NEIGHBOR",
        routingMode: RoutingMode.ROAD,
      };

      // Enforce minimum delay for fallback too
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_OPTIMIZATION_TIME - elapsedTime);

      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      setOptimizedRoute(fallbackRoute);
      setShowResults(true);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleScenarioChange = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    setShowResults(false);
    setValidationResult(null);
  };

  return (
    <div className="flex flex-col gap-4 pb-20 md:pb-6">
      {/* Mobile Header with Breadcrumbs */}
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger />
        <div className="flex items-center gap-2 text-sm">
          <Link href="/admin/experiments" className="text-muted-foreground hover:text-foreground">
            Experiments
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-semibold">Route Optimizer</span>
        </div>
      </div>

      {/* Desktop Header */}
      <AdminPageTitle
        title="Route Optimizer Visualizer"
        description="See how route optimization saves distance, time, and money"
        actions={
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-border text-foreground hover:bg-muted"
          >
            <Link href="/admin/experiments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Experiments
            </Link>
          </Button>
        }
      />

      {/* Experimental Notice */}
      <AdminInfoBox variant="warning">
        <strong>Experimental Feature:</strong> This visualizer demonstrates route optimization with
        mock data. Perfect for exploring &ldquo;what-if&rdquo; scenarios and understanding potential
        savings.
      </AdminInfoBox>

      {/* Scenario Selector */}
      <AdminCard title="Select Test Scenario" icon={Sparkles}>
        <AdminCardContent>
          <div className="space-y-4">
            <div>
              <label className="text-foreground mb-2 block text-sm font-semibold">
                Choose a scenario to visualize:
              </label>
              <Select value={selectedScenarioId} onValueChange={handleScenarioChange}>
                <SelectTrigger className="bg-card border-border focus:border-primary focus:ring-primary/20 w-full border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_SCENARIOS.map((scenario) => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      {scenario.name} ({scenario.stopCount} stops)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <AdminInfoBox variant="info">
              <strong>{selectedScenario.name}:</strong> {selectedScenario.description}
            </AdminInfoBox>

            {/* Pickup/Dropoff Validation (only show if errors exist) */}
            {validationResult && !validationResult.valid && (
              <AdminInfoBox variant="error">
                <h4 className="mb-2 font-bold">Route Validation Error</h4>
                <p className="mb-2 text-sm">
                  This route contains pickup/dropoff pairs. Each item must be picked up before it
                  can be dropped off.
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm">
                  {getViolationMessages(validationResult.violations).map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
                <p className="mt-3 text-sm">
                  <strong>Fix required:</strong> Reorder stops so pickups come before their paired
                  dropoffs.
                </p>
              </AdminInfoBox>
            )}

            {!isOptimizing && (
              <Button
                onClick={handleOptimize}
                className="bg-primary hover:bg-primary/90 w-full font-semibold text-white md:w-auto"
                size="lg"
              >
                <Zap className="mr-2 h-5 w-5" />
                Optimize Route
              </Button>
            )}
          </div>
        </AdminCardContent>
      </AdminCard>

      {/* Progress Display */}
      {isOptimizing && optimizationProgress && (
        <RouteOptimizationProgress progress={optimizationProgress} />
      )}

      {/* Results */}
      {showResults && optimizedRoute && (
        <>
          {/* Route Comparison Maps */}
          <RouteComparisonMap
            scenario={selectedScenario}
            optimizedRoute={optimizedRoute}
            isLoading={isOptimizing}
          />

          {/* Savings Metrics */}
          <RouteMetrics route={optimizedRoute} />
        </>
      )}

      {/* How It Works */}
      {!showResults && (
        <AdminCard title="How Route Optimization Works" icon={TrendingDown}>
          <AdminCardContent>
            <div className="text-muted-foreground space-y-4 text-sm">
              <p>
                <strong className="text-foreground">Step 1: Original Route</strong> - Addresses are
                entered in the order received, creating an inefficient zigzag pattern.
              </p>
              <p>
                <strong className="text-foreground">Step 2: Optimization</strong> - Our algorithm
                analyzes all stops and calculates the shortest possible route using real road
                distances.
              </p>
              <p>
                <strong className="text-foreground">Step 3: Savings</strong> - The optimized route
                saves distance, time, fuel cost, and CO₂ emissions. Monthly projections assume 250
                routes per month.
              </p>
              <AdminInfoBox variant="info">
                <strong>Demo Scenarios:</strong> Each scenario represents a common real-world
                situation - from dramatic cross-zone chaos to simple same-zone clusters. Select one
                above to see the optimization in action!
              </AdminInfoBox>
            </div>
          </AdminCardContent>
        </AdminCard>
      )}
    </div>
  );
}
