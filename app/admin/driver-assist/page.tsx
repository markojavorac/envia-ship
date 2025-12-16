"use client";

import { useState, useEffect } from "react";
import { Truck, RefreshCcw, User } from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AdminPageTitle } from "@/components/admin/ui/AdminPageTitle";
import { AddTicketCard } from "@/components/admin/driver-assist/AddTicketCard";
import { AddTicketDialog } from "@/components/admin/driver-assist/AddTicketDialog";
import { TicketCard } from "@/components/admin/driver-assist/TicketCard";
import { TicketConfirmationDialog } from "@/components/admin/driver-assist/TicketConfirmationDialog";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { DeliveryTicket, Coordinates } from "@/lib/admin/driver-assist-types";
import {
  loadTickets,
  addTicket,
  updateTicket,
  completeTicket,
  deleteTicket,
  startNavigation,
} from "@/lib/admin/driver-assist-storage";
import { toast } from "sonner";
import { decodeUrlToTicket } from "@/lib/admin/ticket-url-encoding";
import { decodeUrlToRoute } from "@/lib/admin/multi-ticket-url-encoding";

/**
 * Driver Assist Page
 *
 * Helps drivers process delivery tickets by:
 * - Uploading ticket photos (optional)
 * - Entering origin/destination addresses manually
 * - Generating Waze/Google Maps navigation links
 * - Tracking ticket completion
 * - Persisting tickets across sessions via localStorage
 */
export default function DriverAssistPage() {
  const t = useTranslations("admin.driverAssist");
  const [tickets, setTickets] = useState<DeliveryTicket[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingTicket, setPendingTicket] = useState<DeliveryTicket | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    role: "driver" | "admin";
  } | null>(null);
  const [routeId, setRouteId] = useState<string | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Fetch current user session
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.driver) {
          setCurrentUser({
            name: data.driver.name,
            role: data.driver.role,
          });
        }
      })
      .catch(() => setCurrentUser(null));
  }, []);

  // Load tickets from API on mount
  useEffect(() => {
    const loadTicketsFromAPI = async () => {
      try {
        const loaded = loadTickets();
        setTickets(loaded);
      } catch (error) {
        console.error("Error loading tickets:", error);
        toast.error("Failed to load tickets");
      } finally {
        setIsLoading(false);
      }
    };

    loadTicketsFromAPI();
  }, []);

  // Load route from database if routeId is provided
  useEffect(() => {
    if (typeof window === "undefined" || isLoading) return;

    const params = new URLSearchParams(window.location.search);
    const routeIdParam = params.get("routeId");

    if (routeIdParam) {
      setIsLoadingRoute(true);
      setRouteId(routeIdParam);

      fetch(`/api/routes/${routeIdParam}`)
        .then(async (res) => {
          if (res.status === 403) {
            setAuthError("This route is not assigned to you");
            toast.error("Access denied: This route is not assigned to you");
            return null;
          }
          if (!res.ok) {
            throw new Error("Failed to load route");
          }
          return res.json();
        })
        .then((data) => {
          if (data?.route) {
            const routeTickets = data.route.tickets;
            // Add tickets from route to state
            setTickets(routeTickets);
            toast.success(`Loaded route with ${routeTickets.length} tickets`);
            // Clear URL parameter
            window.history.replaceState({}, "", "/admin/driver-assist");
          }
        })
        .catch((error) => {
          console.error("Failed to load route:", error);
          toast.error("Failed to load route from database");
          window.history.replaceState({}, "", "/admin/driver-assist");
        })
        .finally(() => {
          setIsLoadingRoute(false);
        });
    }
  }, [isLoading]);

  // URL parameter detection for shared tickets/routes from dispatcher (backward compatibility)
  useEffect(() => {
    // Skip if on server-side or still loading
    if (typeof window === "undefined" || isLoading) return;

    const params = new URLSearchParams(window.location.search);
    const ticketParam = params.get("ticket"); // Single ticket
    const routeParam = params.get("route"); // Multiple tickets (route) - OLD FORMAT
    const routeIdParam = params.get("routeId"); // Skip if new format is present

    // Skip if new routeId format is present
    if (routeIdParam) return;

    // Handle old route URL format (multiple tickets) - DEPRECATED
    if (routeParam) {
      try {
        const decodedTickets = decodeUrlToRoute(routeParam);

        if (!decodedTickets || decodedTickets.length === 0) {
          toast.error("Invalid route URL");
          window.history.replaceState({}, "", "/admin/driver-assist");
          return;
        }

        // Add all tickets from route (preserving optimized sequence)
        let addedCount = 0;
        for (const ticket of decodedTickets) {
          // Check for duplicates
          const isDuplicate = tickets.some(
            (t) =>
              (t.ticketNumber && ticket.ticketNumber && t.ticketNumber === ticket.ticketNumber) ||
              (t.originAddress === ticket.originAddress &&
                t.destinationAddress === ticket.destinationAddress)
          );

          if (!isDuplicate) {
            try {
              const created = addTicket(ticket);
              setTickets((prev) => [created, ...prev]);
              addedCount++;
            } catch (error) {
              console.error("Error adding ticket:", error);
            }
          }
        }

        if (addedCount > 0) {
          toast.success(
            `Added ${addedCount} ${addedCount === 1 ? "ticket" : "tickets"} from optimized route`
          );
          toast.warning(
            "Note: This is an old format route URL. Please use the new dispatcher to create routes.",
            { duration: 5000 }
          );
        } else {
          toast.warning("All tickets from this route are already in your queue");
        }

        // Clear URL parameter
        window.history.replaceState({}, "", "/admin/driver-assist");
        return;
      } catch (error) {
        console.error("Failed to load route from URL:", error);
        toast.error("Failed to load route from URL");
        window.history.replaceState({}, "", "/admin/driver-assist");
        return;
      }
    }

    // Handle single ticket URL (backward compatibility)
    if (ticketParam) {
      try {
        const decoded = decodeUrlToTicket(ticketParam);

        if (!decoded) {
          toast.error("Invalid ticket URL");
          window.history.replaceState({}, "", "/admin/driver-assist");
          return;
        }

        // Check for duplicates by ticket number or exact address match
        const isDuplicate = tickets.some(
          (t) =>
            (t.ticketNumber && decoded.ticketNumber && t.ticketNumber === decoded.ticketNumber) ||
            (t.originAddress === decoded.originAddress &&
              t.destinationAddress === decoded.destinationAddress)
        );

        if (isDuplicate) {
          toast.warning("This ticket is already in your queue");
          window.history.replaceState({}, "", "/admin/driver-assist");
          return;
        }

        // Show confirmation dialog
        setPendingTicket(decoded);
        setIsConfirmationOpen(true);

        // Clear URL parameter
        window.history.replaceState({}, "", "/admin/driver-assist");
      } catch (error) {
        console.error("Failed to load ticket from URL:", error);
        toast.error("Failed to load ticket from URL");
        window.history.replaceState({}, "", "/admin/driver-assist");
      }
    }
  }, [tickets, isLoading]); // Run when tickets or loading state changes

  // Handle confirmation dialog actions
  const handleConfirmTicket = async () => {
    if (!pendingTicket) return;

    try {
      const created = addTicket(pendingTicket);
      setTickets((prev) => [created, ...prev]);

      toast.success(
        pendingTicket.ticketNumber
          ? `Ticket ${pendingTicket.ticketNumber} added to queue`
          : "Ticket added from dispatcher"
      );
    } catch (error) {
      console.error("Error adding ticket:", error);
      toast.error("Failed to add ticket");
    }

    setPendingTicket(null);
    setIsConfirmationOpen(false);
  };

  const handleCancelTicket = () => {
    setPendingTicket(null);
    setIsConfirmationOpen(false);
  };

  const handleSaveTicket = async (ticketData: {
    ticketNumber?: string;
    originAddress: string;
    destinationAddress: string;
    originCoordinates?: Coordinates;
    destinationCoordinates?: Coordinates;
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
      originCoordinates: ticketData.originCoordinates,
      destinationCoordinates: ticketData.destinationCoordinates,
      recipientName: ticketData.recipientName,
      recipientPhone: ticketData.recipientPhone,
      notes: ticketData.notes,
      ticketImageUrl: ticketData.ticketImageUrl,
      isCompleted: false,
      createdAt: new Date(),
    };

    try {
      const created = addTicket(newTicket);
      setTickets((prev) => [created, ...prev]);
      setIsAddDialogOpen(false);
      toast.success("Ticket created successfully");
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("Failed to create ticket");
    }
  };

  const handleNavigate = (ticket: DeliveryTicket) => {
    // Navigation is handled in TicketCard component
    // This is just a callback for tracking purposes
    console.log("Navigating to ticket:", ticket.id);
  };

  const handleComplete = async (ticketId: string) => {
    // Optimistic update
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId ? { ...t, isCompleted: true, completedAt: new Date() } : t
      )
    );

    try {
      const updated = completeTicket(ticketId);
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
      toast.success("Ticket completed");
    } catch (error) {
      console.error("Error completing ticket:", error);
      toast.error("Failed to complete ticket");
      // Revert optimistic update
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, isCompleted: false, completedAt: undefined } : t
        )
      );
    }
  };

  const handleDelete = async (ticketId: string) => {
    // Optimistic update
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));

    try {
      deleteTicket(ticketId);
      toast.success("Ticket deleted");
    } catch (error) {
      console.error("Error deleting ticket:", error);
      toast.error("Failed to delete ticket");
      // Reload tickets to restore deleted ticket
      const loaded = loadTickets();
      setTickets(loaded);
    }
  };

  const handleUpdateCoordinates = async (
    ticketId: string,
    originCoordinates: { lat: number; lng: number },
    destinationCoordinates: { lat: number; lng: number }
  ) => {
    // Optimistic update
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, originCoordinates, destinationCoordinates } : t))
    );

    try {
      updateTicket(ticketId, {
        originCoordinates,
        destinationCoordinates,
      });
    } catch (error) {
      console.error("Error updating coordinates:", error);
      toast.error("Failed to update coordinates");
      // Revert optimistic update
      const loaded = loadTickets();
      setTickets(loaded);
    }
  };

  const handleUpdateNavigationStart = async (ticketId: string) => {
    // Optimistic update
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, navigationStartedAt: new Date() } : t))
    );

    try {
      const updated = startNavigation(ticketId);
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
    } catch (error) {
      console.error("Error starting navigation:", error);
      toast.error("Failed to start navigation timer");
      // Revert optimistic update
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, navigationStartedAt: undefined } : t))
      );
    }
  };

  const handleLoadMockData = async () => {
    try {
      const loaded = loadTickets();
      setTickets(loaded);
      toast.success("Tickets reloaded from database");
    } catch (error) {
      console.error("Error reloading tickets:", error);
      toast.error("Failed to reload tickets");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Loading tickets...</p>
      </div>
    );
  }

  // Split tickets into pending and completed, sorted by creation date
  const pendingTickets = tickets
    .filter((t) => !t.isCompleted)
    .sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0)); // FIFO - oldest first

  const completedTickets = tickets
    .filter((t) => t.isCompleted)
    .sort((a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0)); // Most recent first

  return (
    <div className="flex flex-col gap-4">
      {/* Mobile Header */}
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger />
        <h1 className="text-foreground text-xl font-bold">{t("title")}</h1>
      </div>

      {/* Desktop Header */}
      <AdminPageTitle title={t("title")} />

      {/* LOGGED IN USER INFO */}
      {currentUser && (
        <div className="border-primary/30 bg-card flex items-center gap-2 rounded-lg border px-4 py-2">
          <User className="text-primary h-5 w-5" />
          <div className="flex items-baseline gap-2">
            <span className="text-foreground font-semibold">{currentUser.name}</span>
            <span className="text-muted-foreground text-xs">
              ({currentUser.role === "admin" ? "Admin" : "Driver"})
            </span>
          </div>
        </div>
      )}

      {/* AUTHORIZATION ERROR */}
      {authError && (
        <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-4">
          <h3 className="text-destructive mb-2 font-semibold">Access Denied</h3>
          <p className="text-destructive/80 text-sm">{authError}</p>
          <p className="text-muted-foreground mt-2 text-xs">
            This route is assigned to a different driver. Please contact your dispatcher if you
            believe this is an error.
          </p>
        </div>
      )}

      {/* LOADING ROUTE */}
      {isLoadingRoute && (
        <div className="bg-card flex items-center justify-center gap-3 rounded-lg border p-8">
          <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
          <span className="text-muted-foreground">Loading route...</span>
        </div>
      )}

      {/* STICKY "UP NEXT" SECTION */}
      <AnimatePresence mode="wait">
        {pendingTickets.length > 0 && (
          <motion.div
            key={pendingTickets[0].id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-background sticky top-16 z-10 pb-3"
          >
            <h3 className="text-primary mb-1.5 text-xs font-bold tracking-wide uppercase">
              {t("upNext")}
            </h3>
            <TicketCard
              ticket={pendingTickets[0]}
              ticketNumber={1}
              variant="up-next"
              onNavigate={handleNavigate}
              onComplete={handleComplete}
              onDelete={handleDelete}
              onUpdateCoordinates={handleUpdateCoordinates}
              onUpdateNavigationStart={handleUpdateNavigationStart}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* REMAINING PENDING TICKETS */}
      {pendingTickets.length > 1 && (
        <div className="space-y-2">
          <h3 className="text-muted-foreground text-sm font-semibold">{t("queue")}</h3>
          <div className="relative">
            {pendingTickets.slice(1).map((ticket, index) => {
              const totalCards = pendingTickets.slice(1).length;
              const zIndex = totalCards - index;
              const VISIBLE_HEIGHT = 28; // px of each card visible (more overlap)
              const darknessLevel = Math.min(index * 0.15, 0.6); // Progressive darkening

              return (
                <div
                  key={ticket.id}
                  className="relative"
                  // eslint-disable-next-line custom/no-inline-styles
                  style={{
                    zIndex,
                    marginTop: index === 0 ? "0" : `-${VISIBLE_HEIGHT}px`,
                  }}
                >
                  <div
                    className="relative rounded-lg transition-all duration-200"
                    // eslint-disable-next-line custom/no-inline-styles
                    style={{
                      boxShadow:
                        index === 0
                          ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 140, 0, 0.2)"
                          : `0 ${15 - index * 3}px ${20 - index * 3}px -3px rgba(0, 0, 0, ${0.15 - index * 0.02})`,
                    }}
                  >
                    {/* Progressive darkening overlay for stacked effect - requires dynamic opacity */}
                    {/* eslint-disable custom/no-inline-styles, custom/no-admin-hardcoded-colors */}
                    <div
                      className="pointer-events-none absolute inset-0 rounded-lg bg-black transition-opacity duration-200"
                      style={{
                        opacity: darknessLevel,
                        zIndex: 10,
                      }}
                    />
                    {/* eslint-enable custom/no-inline-styles, custom/no-admin-hardcoded-colors */}
                    <TicketCard
                      ticket={ticket}
                      ticketNumber={index + 2}
                      variant="default"
                      onNavigate={handleNavigate}
                      onComplete={handleComplete}
                      onDelete={handleDelete}
                      onUpdateCoordinates={handleUpdateCoordinates}
                      onUpdateNavigationStart={handleUpdateNavigationStart}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* COMPLETED TICKETS */}
      {completedTickets.length > 0 && (
        <div className="space-y-2 pt-6">
          <h3 className="text-muted-foreground text-sm font-semibold">Completed</h3>
          {completedTickets.map((ticket, index) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              ticketNumber={index + 1}
              variant="default"
              onNavigate={handleNavigate}
              onComplete={handleComplete}
              onDelete={handleDelete}
              onUpdateCoordinates={handleUpdateCoordinates}
              onUpdateNavigationStart={handleUpdateNavigationStart}
            />
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {tickets.length === 0 && (
        <div className="py-12 text-center">
          <Truck className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <p className="text-muted-foreground text-lg font-semibold">No tickets yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Click &quot;Add Ticket&quot; to get started
          </p>
        </div>
      )}

      {/* ADD TICKET BUTTON - MOVED TO BOTTOM */}
      <AddTicketCard onClick={() => setIsAddDialogOpen(true)} />

      {/* Add Ticket Dialog */}
      <AddTicketDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleSaveTicket}
      />

      {/* Ticket Confirmation Dialog (from dispatcher URL) */}
      <TicketConfirmationDialog
        open={isConfirmationOpen}
        ticket={pendingTicket}
        onConfirm={handleConfirmTicket}
        onCancel={handleCancelTicket}
      />
    </div>
  );
}
