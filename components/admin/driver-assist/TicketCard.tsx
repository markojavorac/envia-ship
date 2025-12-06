"use client";

import { useState } from "react";
import {
  CheckCircle,
  Navigation,
  Loader2,
  Trash2,
  MapPin,
  ChevronDown,
  ChevronUp,
  Eye,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { DeliveryTicket } from "@/lib/admin/driver-assist-types";
import { getOrGeocodeCoordinates } from "@/lib/admin/driver-assist-geocoding";
import { openNavigation } from "@/lib/admin/driver-assist-navigation";
import { ViewTicketModal } from "./ViewTicketModal";

interface TicketCardProps {
  ticket: DeliveryTicket;
  onNavigate: (ticket: DeliveryTicket) => void;
  onComplete: (ticketId: string) => void;
  onDelete?: (ticketId: string) => void;
  onUpdateCoordinates?: (
    ticketId: string,
    originCoordinates: { lat: number; lng: number },
    destinationCoordinates: { lat: number; lng: number }
  ) => void;
}

/**
 * TicketCard - Full-width row display for delivery tickets
 * Shows consolidated from/to view with collapsible details
 */
export function TicketCard({
  ticket,
  onNavigate,
  onComplete,
  onDelete,
  onUpdateCoordinates,
}: TicketCardProps) {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleNavigate = async () => {
    setIsGeocoding(true);

    try {
      // Get or geocode coordinates
      const result = await getOrGeocodeCoordinates(ticket);

      if (!result.success || !result.origin || !result.destination) {
        toast.error(
          result.errors.length > 0 ? result.errors.join(", ") : "Failed to geocode addresses"
        );
        setIsGeocoding(false);
        return;
      }

      // Cache coordinates in ticket if not already cached
      if (onUpdateCoordinates && (!ticket.originCoordinates || !ticket.destinationCoordinates)) {
        onUpdateCoordinates(ticket.id, result.origin, result.destination);
      }

      // Open navigation
      const navApp = openNavigation({
        origin: result.origin,
        destination: result.destination,
        originName: ticket.originAddress,
        destinationName: ticket.destinationAddress,
      });

      toast.success(navApp === "waze" ? "Opening Waze..." : "Opening Google Maps...");

      // Call parent handler
      onNavigate(ticket);
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("Failed to open navigation. Please try again.");
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleComplete = () => {
    onComplete(ticket.id);
    toast.success("Ticket marked as complete");
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(ticket.id);
      toast.success("Ticket deleted");
    }
  };

  return (
    <>
      <Card
        className={cn("bg-card border-border transition-all", ticket.isCompleted && "opacity-50")}
      >
        <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          {/* Left Section: Ticket Info + Addresses */}
          <div className="min-w-0 flex-1">
            {/* Header: Ticket # + Status */}
            <div className="mb-1.5 flex items-center gap-2">
              {ticket.ticketNumber && (
                <span className="text-foreground shrink-0 text-xs font-bold">
                  #{ticket.ticketNumber}
                </span>
              )}
              {ticket.isCompleted && (
                // eslint-disable-next-line custom/no-admin-hardcoded-colors
                <Badge className="shrink-0 bg-green-500 text-white">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Done
                </Badge>
              )}
              <span className="text-muted-foreground truncate text-xs">
                {ticket.isCompleted && ticket.completedAt
                  ? `Completed ${formatDistanceToNow(ticket.completedAt, { addSuffix: true })}`
                  : `Created ${formatDistanceToNow(ticket.createdAt, { addSuffix: true })}`}
              </span>
            </div>

            {/* Addresses: Compact Vertical Stack */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="text-primary h-3.5 w-3.5 shrink-0" />
                <span className="text-muted-foreground text-xs font-medium">From:</span>
                <span className="text-foreground truncate text-xs">
                  {ticket.originAddress.length > 60
                    ? `${ticket.originAddress.slice(0, 60)}...`
                    : ticket.originAddress}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="text-destructive h-3.5 w-3.5 shrink-0" />
                <span className="text-muted-foreground text-xs font-medium">To:</span>
                <span className="text-foreground truncate text-xs">
                  {ticket.destinationAddress.length > 60
                    ? `${ticket.destinationAddress.slice(0, 60)}...`
                    : ticket.destinationAddress}
                </span>
              </div>
            </div>
          </div>

          {/* Right Section: Compact Action Buttons */}
          <div className="flex shrink-0 items-center gap-2">
            <Button
              onClick={handleNavigate}
              disabled={ticket.isCompleted || isGeocoding}
              size="sm"
              className="bg-primary hover:bg-primary/90 font-semibold text-white"
            >
              {isGeocoding ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Navigation className="mr-1.5 h-3.5 w-3.5" />
              )}
              {isGeocoding ? "Loading" : "Navigate"}
            </Button>

            {!ticket.isCompleted ? (
              <Button
                onClick={handleComplete}
                variant="outline"
                size="sm"
                className="border-green-500 font-semibold text-green-500 hover:bg-green-500/10"
              >
                <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                Done
              </Button>
            ) : (
              onDelete && (
                <Button
                  onClick={handleDelete}
                  variant="outline"
                  size="sm"
                  className="border-destructive text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )
            )}

            <Button
              onClick={() => setIsViewModalOpen(true)}
              variant="outline"
              size="sm"
              className="border-border text-foreground hover:bg-muted"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>

            {(ticket.recipientName || ticket.recipientPhone || ticket.notes) && (
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                {isExpanded ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Collapsible Details Section */}
        {isExpanded && (ticket.recipientName || ticket.recipientPhone || ticket.notes) && (
          <div className="border-border border-t px-4 pt-3 pb-4">
            <div className="grid gap-2 md:grid-cols-3">
              {ticket.recipientName && (
                <div>
                  <p className="text-muted-foreground text-xs font-semibold uppercase">Recipient</p>
                  <p className="text-foreground text-sm">{ticket.recipientName}</p>
                </div>
              )}
              {ticket.recipientPhone && (
                <div>
                  <p className="text-muted-foreground text-xs font-semibold uppercase">Phone</p>
                  <p className="text-foreground text-sm">{ticket.recipientPhone}</p>
                </div>
              )}
              {ticket.notes && (
                <div className="md:col-span-3">
                  <p className="text-muted-foreground text-xs font-semibold uppercase">Notes</p>
                  <p className="text-foreground text-sm">{ticket.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* View Ticket Modal */}
      <ViewTicketModal ticket={ticket} open={isViewModalOpen} onOpenChange={setIsViewModalOpen} />
    </>
  );
}
