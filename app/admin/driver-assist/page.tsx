"use client";

import { useState, useEffect } from "react";
import { Truck } from "lucide-react";
import { AdminPageTitle } from "@/components/admin/ui/AdminPageTitle";
import { AdminInfoBox } from "@/components/admin/ui/AdminInfoBox";
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
} from "@/lib/admin/driver-assist-storage";

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

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Loading tickets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AdminPageTitle
        title="Driver Assist"
        description="Manage delivery tickets and navigate to destinations"
      />

      {/* Info Box */}
      <AdminInfoBox variant="info">
        Upload ticket photos and enter addresses manually. Tap <strong>Navigate</strong> to open
        Waze or Google Maps with the route. Mark tickets as <strong>Done</strong> when delivered.
      </AdminInfoBox>

      {/* Add Ticket Button */}
      <AddTicketCard onClick={() => setIsAddDialogOpen(true)} />

      {/* Ticket List - Full Width Rows */}
      <div className="space-y-3">
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onNavigate={handleNavigate}
            onComplete={handleComplete}
            onDelete={handleDelete}
            onUpdateCoordinates={handleUpdateCoordinates}
          />
        ))}
      </div>

      {/* Empty State */}
      {tickets.length === 0 && (
        <div className="py-12 text-center">
          <Truck className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <p className="text-muted-foreground text-lg font-semibold">No tickets yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Click &quot;Add Ticket&quot; to get started
          </p>
        </div>
      )}

      {/* Add Ticket Dialog */}
      <AddTicketDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleSaveTicket}
      />
    </div>
  );
}
