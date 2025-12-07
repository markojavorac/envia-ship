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
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { DeliveryTicket } from "@/lib/admin/driver-assist-types";
import { getOrGeocodeCoordinates } from "@/lib/admin/driver-assist-geocoding";
import { openNavigation } from "@/lib/admin/driver-assist-navigation";
import { ViewTicketModal } from "./ViewTicketModal";
import { NumberBadge } from "./NumberBadge";

interface TicketCardProps {
  ticket: DeliveryTicket;
  ticketNumber: number;
  variant?: "default" | "up-next";
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
  ticketNumber,
  variant = "default",
  onNavigate,
  onComplete,
  onDelete,
  onUpdateCoordinates,
}: TicketCardProps) {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

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
    if (isCompleting) return; // Prevent double-clicks

    setIsCompleting(true);
    toast.success("Ticket marked as complete");

    // Wait for animation to complete before updating state
    setTimeout(() => {
      onComplete(ticket.id);
    }, 500); // Match animation duration
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(ticket.id);
      toast.success("Ticket deleted");
    }
  };

  const isUpNext = variant === "up-next";

  // Animation variants for completion
  const completionVariants = {
    initial: { x: 0, opacity: 1, scale: 1 },
    completing: {
      x: 100,
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <>
      <motion.div
        initial="initial"
        animate={isCompleting ? "completing" : "initial"}
        variants={completionVariants}
        className="relative"
      >
        {/* Success flash overlay */}
        <AnimatePresence>
          {isCompleting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="pointer-events-none absolute inset-0 z-50 rounded-lg bg-green-500"
              // eslint-disable-next-line custom/no-admin-hardcoded-colors
            />
          )}
        </AnimatePresence>

        <Card
          className={cn(
            "border-border transition-all",
            isUpNext && "bg-primary border-primary border-4 shadow-lg",
            !isUpNext && "bg-card border-2 shadow-md hover:shadow-lg",
            ticket.isCompleted && !isUpNext && "opacity-50",
            isCompleting && "pointer-events-none"
          )}
        >
          <div
            className={cn(
              "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-3",
              isUpNext ? "p-4" : "p-3"
            )}
          >
            {/* Number Badge */}
            <NumberBadge
              number={ticketNumber}
              size={isUpNext ? "lg" : "sm"}
              variant={ticket.isCompleted ? "muted" : isUpNext ? "inverse" : "default"}
            />

            {/* Left Section: Ticket Info + Addresses */}
            <div className="min-w-0 flex-1">
              {/* Header: Ticket # + Status */}
              <div className="mb-1.5 flex items-center gap-2">
                {ticket.ticketNumber && (
                  <span
                    className={cn(
                      "shrink-0 font-bold",
                      isUpNext ? "text-sm text-white" : "text-foreground text-xs"
                    )}
                  >
                    #{ticket.ticketNumber}
                  </span>
                )}
                {ticket.isCompleted && (
                  <Badge
                    // eslint-disable-next-line custom/no-admin-hardcoded-colors
                    className={cn("shrink-0 bg-green-500 text-white", isUpNext && "text-sm")}
                  >
                    <CheckCircle className={cn(isUpNext ? "mr-1 h-4 w-4" : "mr-1 h-3 w-3")} />
                    Done
                  </Badge>
                )}
                <span
                  className={cn(
                    "truncate",
                    isUpNext ? "text-sm text-white/80" : "text-muted-foreground text-xs"
                  )}
                >
                  {ticket.isCompleted && ticket.completedAt
                    ? `Completed ${formatDistanceToNow(ticket.completedAt, { addSuffix: true })}`
                    : `Created ${formatDistanceToNow(ticket.createdAt, { addSuffix: true })}`}
                </span>
              </div>

              {/* Addresses: Compact Vertical Stack */}
              <div className={cn(isUpNext ? "space-y-2" : "space-y-1")}>
                <div className="flex items-center gap-1.5">
                  <MapPin
                    className={cn(
                      "shrink-0",
                      isUpNext ? "h-4 w-4 text-white" : "text-primary h-3.5 w-3.5"
                    )}
                  />
                  <span
                    className={cn(
                      "font-medium",
                      isUpNext ? "text-sm text-white/90" : "text-muted-foreground text-xs"
                    )}
                  >
                    From:
                  </span>
                  <span
                    className={cn(
                      "truncate",
                      isUpNext ? "text-sm text-white" : "text-foreground text-xs"
                    )}
                  >
                    {ticket.originAddress.length > 60
                      ? `${ticket.originAddress.slice(0, 60)}...`
                      : ticket.originAddress}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin
                    className={cn(
                      "shrink-0",
                      isUpNext ? "h-4 w-4 text-white" : "text-destructive h-3.5 w-3.5"
                    )}
                  />
                  <span
                    className={cn(
                      "font-medium",
                      isUpNext ? "text-sm text-white/90" : "text-muted-foreground text-xs"
                    )}
                  >
                    To:
                  </span>
                  <span
                    className={cn(
                      "truncate",
                      isUpNext ? "text-sm text-white" : "text-foreground text-xs"
                    )}
                  >
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
                size={isUpNext ? "default" : "sm"}
                className="bg-primary hover:bg-primary/90 font-semibold text-white"
              >
                {isGeocoding ? (
                  <Loader2
                    className={cn("animate-spin", isUpNext ? "mr-2 h-4 w-4" : "mr-1.5 h-3.5 w-3.5")}
                  />
                ) : (
                  <Navigation className={cn(isUpNext ? "mr-2 h-4 w-4" : "mr-1.5 h-3.5 w-3.5")} />
                )}
                {isGeocoding ? "Loading" : "Navigate"}
              </Button>

              {!ticket.isCompleted ? (
                <Button
                  onClick={handleComplete}
                  variant="outline"
                  size={isUpNext ? "default" : "sm"}
                  className="border-green-500 font-semibold text-green-500 hover:bg-green-500/10"
                >
                  <CheckCircle className={cn(isUpNext ? "mr-2 h-4 w-4" : "mr-1.5 h-3.5 w-3.5")} />
                  Done
                </Button>
              ) : (
                onDelete && (
                  <Button
                    onClick={handleDelete}
                    variant="outline"
                    size={isUpNext ? "default" : "sm"}
                    className="border-destructive text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className={cn(isUpNext ? "h-4 w-4" : "h-3.5 w-3.5")} />
                  </Button>
                )
              )}

              <Button
                onClick={() => setIsViewModalOpen(true)}
                variant="outline"
                size={isUpNext ? "default" : "sm"}
                className="border-border text-foreground hover:bg-muted"
              >
                <Eye className={cn(isUpNext ? "h-4 w-4" : "h-3.5 w-3.5")} />
              </Button>

              {(ticket.recipientName || ticket.recipientPhone || ticket.notes) && (
                <Button
                  onClick={() => setIsExpanded(!isExpanded)}
                  variant="ghost"
                  size={isUpNext ? "default" : "sm"}
                  className={cn(
                    isUpNext
                      ? "text-white hover:bg-white/20 hover:text-white"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isExpanded ? (
                    <ChevronUp className={cn(isUpNext ? "h-4 w-4" : "h-3.5 w-3.5")} />
                  ) : (
                    <ChevronDown className={cn(isUpNext ? "h-4 w-4" : "h-3.5 w-3.5")} />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Collapsible Details Section */}
          {isExpanded && (ticket.recipientName || ticket.recipientPhone || ticket.notes) && (
            <div
              className={cn(
                "border-t px-4 pt-3 pb-4",
                isUpNext ? "border-white/20" : "border-border"
              )}
            >
              <div className="grid gap-2 md:grid-cols-3">
                {ticket.recipientName && (
                  <div>
                    <p
                      className={cn(
                        "text-xs font-semibold uppercase",
                        isUpNext ? "text-white/80" : "text-muted-foreground"
                      )}
                    >
                      Recipient
                    </p>
                    <p className={cn("text-sm", isUpNext ? "text-white" : "text-foreground")}>
                      {ticket.recipientName}
                    </p>
                  </div>
                )}
                {ticket.recipientPhone && (
                  <div>
                    <p
                      className={cn(
                        "text-xs font-semibold uppercase",
                        isUpNext ? "text-white/80" : "text-muted-foreground"
                      )}
                    >
                      Phone
                    </p>
                    <p className={cn("text-sm", isUpNext ? "text-white" : "text-foreground")}>
                      {ticket.recipientPhone}
                    </p>
                  </div>
                )}
                {ticket.notes && (
                  <div className="md:col-span-3">
                    <p
                      className={cn(
                        "text-xs font-semibold uppercase",
                        isUpNext ? "text-white/80" : "text-muted-foreground"
                      )}
                    >
                      Notes
                    </p>
                    <p className={cn("text-sm", isUpNext ? "text-white" : "text-foreground")}>
                      {ticket.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* View Ticket Modal */}
      <ViewTicketModal ticket={ticket} open={isViewModalOpen} onOpenChange={setIsViewModalOpen} />
    </>
  );
}
