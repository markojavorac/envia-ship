"use client";

import { useState } from "react";
import { Plus, Send, Sparkles, ArrowLeft, Share2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageTitle } from "@/components/admin/ui/AdminPageTitle";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { AdminInfoBox } from "@/components/admin/ui/AdminInfoBox";
import { AddTicketDialog } from "@/components/admin/driver-assist/AddTicketDialog";
import { ShareableUrlDisplay } from "@/components/admin/dispatch/ShareableUrlDisplay";
import { TicketList } from "@/components/admin/dispatch/TicketList";
import { RouteOptimizationResults } from "@/components/admin/dispatch/RouteOptimizationResults";
import type { DeliveryTicket } from "@/lib/admin/driver-assist-types";
import type { OptimizedRoute, RouteConfig, RoutingMode } from "@/lib/admin/route-types";
import { OptimizationMode } from "@/lib/admin/route-types";
import { optimizeRouteNearestNeighbor } from "@/lib/admin/route-utils";
import { encodeRouteToUrl } from "@/lib/admin/multi-ticket-url-encoding";
import { generateDemoTickets } from "@/lib/admin/demo-routes";
import { toast } from "sonner";

/**
 * Dispatcher Utility Page - Route Optimization & URL Sharing
 *
 * Three-state workflow:
 * 1. TICKET_COLLECTION: Add/manage tickets
 * 2. OPTIMIZATION_RESULTS: View optimized route & metrics
 * 3. URL_SHARING: Share route via URL
 */

type PageState = "TICKET_COLLECTION" | "OPTIMIZATION_RESULTS" | "URL_SHARING";

export default function DispatcherUtilityPage() {
  const [pageState, setPageState] = useState<PageState>("TICKET_COLLECTION");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [tickets, setTickets] = useState<DeliveryTicket[]>([]);
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // === TICKET MANAGEMENT === //

  const handleAddTicket = (ticketData: {
    ticketNumber?: string;
    originAddress: string;
    destinationAddress: string;
    recipientName?: string;
    recipientPhone?: string;
    notes?: string;
    ticketImageUrl?: string;
  }) => {
    const newTicket: DeliveryTicket = {
      id: crypto.randomUUID(),
      ticketNumber: ticketData.ticketNumber,
      originAddress: ticketData.originAddress,
      destinationAddress: ticketData.destinationAddress,
      recipientName: ticketData.recipientName,
      recipientPhone: ticketData.recipientPhone,
      notes: ticketData.notes,
      ticketImageUrl: ticketData.ticketImageUrl,
      isCompleted: false,
      createdAt: new Date(),
    };

    setTickets((prev) => [...prev, newTicket]);
    setIsAddDialogOpen(false);
    toast.success(`Ticket ${ticketData.ticketNumber || "added"} to route`);
  };

  const handleDeleteTicket = (ticketId: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    toast.success("Ticket removed");
  };

  const handleLoadDemoData = () => {
    const demoTickets = generateDemoTickets();
    setTickets(demoTickets);
    toast.success(`Loaded ${demoTickets.length} demo delivery tickets`);
  };

  // === ROUTE OPTIMIZATION === //

  const handleOptimizeRoute = async () => {
    if (tickets.length < 2) {
      toast.error("Add at least 2 tickets to optimize a route");
      return;
    }

    setIsOptimizing(true);

    try {
      // Convert tickets to RouteStops
      const stops = tickets.map((ticket) => ({
        id: ticket.id,
        address: ticket.destinationAddress,
        coordinates: ticket.destinationCoordinates || {
          lat: 14.6,
          lng: -90.52,
        }, // Fallback to Guatemala City center
        notes: ticket.notes,
      }));

      // Configure route optimization
      const config: RouteConfig = {
        optimizationMode: OptimizationMode.NEAREST_NEIGHBOR,
        routingMode: RoutingMode.ROAD, // Use OSRM road routing
        isRoundTrip: false,
      };

      // Optimize route
      const optimized = await optimizeRouteNearestNeighbor(stops, config);

      // Reorder tickets based on optimized sequence
      const optimizedTickets = optimized.optimizedStops
        .map((stop) => tickets.find((t) => t.id === stop.id))
        .filter((t): t is DeliveryTicket => t !== undefined);

      setTickets(optimizedTickets);
      setOptimizedRoute(optimized);
      setPageState("OPTIMIZATION_RESULTS");

      toast.success(
        `Route optimized! Saved ${optimized.distanceSaved.toFixed(1)} km (${Math.round(optimized.improvementPercent)}%)`
      );
    } catch (error) {
      console.error("Route optimization failed:", error);
      toast.error("Failed to optimize route. Please try again.");
    } finally {
      setIsOptimizing(false);
    }
  };

  // === URL SHARING === //

  const handleShareRoute = () => {
    if (!optimizedRoute) {
      toast.error("No optimized route to share");
      return;
    }

    try {
      const url = encodeRouteToUrl(tickets, optimizedRoute);
      setGeneratedUrl(url);
      setPageState("URL_SHARING");
      toast.success("Route URL generated successfully");
    } catch (error) {
      console.error("Failed to generate route URL:", error);
      toast.error("Failed to generate shareable URL");
    }
  };

  // === NAVIGATION === //

  const handleBackToCollection = () => {
    setPageState("TICKET_COLLECTION");
    setOptimizedRoute(null);
  };

  const handleCreateNewRoute = () => {
    setTickets([]);
    setOptimizedRoute(null);
    setGeneratedUrl(null);
    setPageState("TICKET_COLLECTION");
    toast.success("Ready to create new route");
  };

  // === RENDER === //

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageTitle
        title={
          pageState === "TICKET_COLLECTION"
            ? "Route Dispatcher"
            : pageState === "OPTIMIZATION_RESULTS"
              ? "Optimization Results"
              : "Share Route"
        }
        description={
          pageState === "TICKET_COLLECTION"
            ? "Create and optimize delivery routes"
            : pageState === "OPTIMIZATION_RESULTS"
              ? "Review optimized route and savings"
              : "Copy URL to share with driver"
        }
        actions={
          pageState === "TICKET_COLLECTION" ? (
            <div className="flex gap-2">
              <Button
                onClick={handleLoadDemoData}
                variant="outline"
                size="sm"
                className="border-border text-foreground hover:bg-muted"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Load Demo
              </Button>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-primary hover:bg-primary/90 font-semibold text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Ticket
              </Button>
            </div>
          ) : pageState === "OPTIMIZATION_RESULTS" ? (
            <Button
              onClick={handleBackToCollection}
              variant="outline"
              size="sm"
              className="border-border text-foreground hover:bg-muted"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Edit Tickets
            </Button>
          ) : null
        }
      />

      {/* STATE 1: TICKET COLLECTION */}
      {pageState === "TICKET_COLLECTION" && (
        <>
          {tickets.length === 0 ? (
            <AdminCard title="Get Started" icon={Send}>
              <div className="space-y-3">
                <AdminInfoBox variant="info">
                  Create an optimized delivery route by adding 5-7 tickets. The system will
                  calculate the most efficient sequence and generate a shareable URL for your
                  driver.
                </AdminInfoBox>

                <ol className="text-foreground space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="bg-primary mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                      1
                    </span>
                    <span>
                      <strong>Add tickets</strong> - Upload photos or enter delivery details
                      manually
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                      2
                    </span>
                    <span>
                      <strong>Optimize route</strong> - System calculates most efficient delivery
                      sequence
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                      3
                    </span>
                    <span>
                      <strong>Share with driver</strong> - Generate URL and send via WhatsApp
                    </span>
                  </li>
                </ol>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleLoadDemoData}
                    size="lg"
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/5 flex-1 border-2 font-semibold"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Load Demo Data
                  </Button>
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 flex-1 font-semibold text-white"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add First Ticket
                  </Button>
                </div>
              </div>
            </AdminCard>
          ) : (
            <>
              {/* Ticket List */}
              <TicketList tickets={tickets} onDeleteTicket={handleDeleteTicket} />

              {/* Optimize Button */}
              <AdminCard>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-foreground text-lg font-semibold">
                      Ready to optimize route
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"} in route
                      {tickets.length < 2 && " (need at least 2)"}
                    </p>
                  </div>
                  <Button
                    onClick={handleOptimizeRoute}
                    disabled={tickets.length < 2 || isOptimizing}
                    className="bg-primary hover:bg-primary/90 font-semibold text-white"
                    size="lg"
                  >
                    {isOptimizing ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Optimizing...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        Optimize Route
                      </>
                    )}
                  </Button>
                </div>
              </AdminCard>
            </>
          )}
        </>
      )}

      {/* STATE 2: OPTIMIZATION RESULTS */}
      {pageState === "OPTIMIZATION_RESULTS" && optimizedRoute && (
        <>
          <RouteOptimizationResults route={optimizedRoute} tickets={tickets} />

          {/* Share Route Button */}
          <AdminCard>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-foreground text-lg font-semibold">Share optimized route</h3>
                <p className="text-muted-foreground text-sm">
                  Generate URL to send to driver via WhatsApp
                </p>
              </div>
              <Button
                onClick={handleShareRoute}
                className="bg-primary hover:bg-primary/90 font-semibold text-white"
                size="lg"
              >
                <Share2 className="mr-2 h-5 w-5" />
                Generate URL
              </Button>
            </div>
          </AdminCard>
        </>
      )}

      {/* STATE 3: URL SHARING */}
      {pageState === "URL_SHARING" && generatedUrl && optimizedRoute && (
        <>
          <ShareableUrlDisplay
            url={generatedUrl}
            tickets={tickets}
            optimizedRoute={optimizedRoute}
            onCreateAnother={handleCreateNewRoute}
          />
        </>
      )}

      {/* Add Ticket Dialog */}
      <AddTicketDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddTicket}
      />
    </div>
  );
}
