"use client";

import { useState, useEffect } from "react";
import { Truck, Sparkles } from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AdminPageTitle } from "@/components/admin/ui/AdminPageTitle";
import { AddTicketCard } from "@/components/admin/driver-assist/AddTicketCard";
import { AddTicketDialog } from "@/components/admin/driver-assist/AddTicketDialog";
import { TicketCard } from "@/components/admin/driver-assist/TicketCard";
import type { DeliveryTicket } from "@/lib/admin/driver-assist-types";
import {
  loadTickets,
  addTicket,
  updateTicket,
  completeTicket,
  deleteTicket,
  loadMockTickets,
} from "@/lib/admin/driver-assist-storage";
import { toast } from "sonner";

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

  // Load tickets from localStorage on mount
  useEffect(() => {
    const loaded = loadTickets();
    setTickets(loaded);
    setIsLoading(false);
  }, []);

  const handleSaveTicket = (ticketData: {
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

    const updated = addTicket(newTicket);
    setTickets(updated);
    setIsAddDialogOpen(false);
  };

  const handleNavigate = (ticket: DeliveryTicket) => {
    // Navigation is handled in TicketCard component
    // This is just a callback for tracking purposes
    console.log("Navigating to ticket:", ticket.id);
  };

  const handleComplete = (ticketId: string) => {
    const updated = completeTicket(ticketId);
    setTickets(updated);
  };

  const handleDelete = (ticketId: string) => {
    const updated = deleteTicket(ticketId);
    setTickets(updated);
  };

  const handleUpdateCoordinates = (
    ticketId: string,
    originCoordinates: { lat: number; lng: number },
    destinationCoordinates: { lat: number; lng: number }
  ) => {
    const updated = updateTicket(ticketId, {
      originCoordinates,
      destinationCoordinates,
    });
    setTickets(updated);
  };

  const handleLoadMockData = () => {
    const mockTickets = loadMockTickets();
    setTickets(mockTickets);
    toast.success("Loaded 5 mock delivery tickets");
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
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()); // FIFO - oldest first

  const completedTickets = tickets
    .filter((t) => t.isCompleted)
    .sort((a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0)); // Most recent first

  return (
    <div className="space-y-2">
      <AdminPageTitle
        title={t("title")}
        actions={
          <Button
            onClick={handleLoadMockData}
            variant="outline"
            size="sm"
            className="border-border text-foreground hover:bg-muted"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {t("loadMockData")}
          </Button>
        }
      />

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
                    <div
                      // eslint-disable-next-line custom/no-admin-hardcoded-colors, custom/no-inline-styles
                      className="pointer-events-none absolute inset-0 rounded-lg bg-black transition-opacity duration-200"
                      style={{
                        opacity: darknessLevel,
                        zIndex: 10,
                      }}
                    />
                    <TicketCard
                      ticket={ticket}
                      ticketNumber={index + 2}
                      variant="default"
                      onNavigate={handleNavigate}
                      onComplete={handleComplete}
                      onDelete={handleDelete}
                      onUpdateCoordinates={handleUpdateCoordinates}
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
    </div>
  );
}
