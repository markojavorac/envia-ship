"use client";

import { useState } from "react";
import { CheckCircle, Navigation, Loader2, Trash2, MapPin, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { DeliveryTicket } from "@/lib/admin/driver-assist-types";
import { getOrGeocodeCoordinates } from "@/lib/admin/driver-assist-geocoding";
import { openNavigation } from "@/lib/admin/driver-assist-navigation";
import { NumberBadge } from "./NumberBadge";
import { NavigationTimer } from "./NavigationTimer";

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
  onUpdateNavigationStart?: (ticketId: string) => void;
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
  onUpdateNavigationStart,
}: TicketCardProps) {
  const t = useTranslations("admin.driverAssist");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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

      // Record navigation start time (only if not already set)
      if (onUpdateNavigationStart && !ticket.navigationStartedAt) {
        onUpdateNavigationStart(ticket.id);
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
            "bg-card transition-all",
            // eslint-disable-next-line custom/no-admin-hardcoded-colors
            isUpNext && "border-4 border-[#FF8C00] shadow-lg",
            !isUpNext && "border-border border-2 shadow-md hover:shadow-lg",
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
            {/* Top Section: Number Badge + Ticket ID + Timestamp */}
            <div className="flex min-w-0 flex-1 items-start gap-3">
              {/* Number Badge */}
              <NumberBadge
                number={ticketNumber}
                size={isUpNext ? "lg" : "sm"}
                variant={ticket.isCompleted ? "muted" : isUpNext ? "default" : "default"}
              />

              {/* Ticket Info + Addresses */}
              <div className="min-w-0 flex-1">
                {/* Header: Ticket # + Timestamp + Status on same line */}
                <div className="mb-1.5 flex items-center gap-2">
                  {ticket.ticketNumber && (
                    <span
                      className={cn(
                        "shrink-0 font-bold",
                        isUpNext ? "text-primary text-sm" : "text-foreground text-xs"
                      )}
                    >
                      #{ticket.ticketNumber}
                    </span>
                  )}
                  <span
                    className={cn(
                      "truncate",
                      isUpNext ? "text-muted-foreground text-sm" : "text-muted-foreground text-xs"
                    )}
                  >
                    {ticket.isCompleted && ticket.completedAt
                      ? `${t("done")} ${formatDistanceToNow(ticket.completedAt, { addSuffix: true })}`
                      : `${t("created")} ${formatDistanceToNow(ticket.createdAt, { addSuffix: true })}`}
                  </span>

                  {/* Navigation Timer - Active tickets */}
                  {ticket.navigationStartedAt && !ticket.isCompleted && (
                    <NavigationTimer
                      navigationStartedAt={ticket.navigationStartedAt}
                      variant={isUpNext ? "large" : "inline"}
                      className="ml-auto"
                    />
                  )}

                  {/* Completed badge with timer */}
                  {ticket.isCompleted && (
                    <div className="ml-auto flex items-center gap-2">
                      <Badge
                        // eslint-disable-next-line custom/no-admin-hardcoded-colors
                        className={cn("shrink-0 bg-green-500 text-white", isUpNext && "text-sm")}
                      >
                        <CheckCircle className={cn(isUpNext ? "mr-1 h-4 w-4" : "mr-1 h-3 w-3")} />
                        {t("done")}
                      </Badge>
                      {ticket.navigationStartedAt && ticket.completedAt && (
                        <NavigationTimer
                          navigationStartedAt={ticket.navigationStartedAt}
                          completedAt={ticket.completedAt}
                          variant="inline"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Addresses: Compact Vertical Stack */}
                <div className={cn("w-full", isUpNext ? "space-y-2" : "space-y-1")}>
                  <div className="flex w-full min-w-0 items-center gap-1.5">
                    <MapPin
                      className={cn("text-primary shrink-0", isUpNext ? "h-4 w-4" : "h-3.5 w-3.5")}
                    />
                    <span
                      className={cn(
                        "text-muted-foreground font-medium",
                        isUpNext ? "text-sm" : "text-xs"
                      )}
                    >
                      {t("from")}
                    </span>
                    <span
                      className={cn("text-foreground min-w-0 flex-1 truncate", isUpNext ? "text-sm" : "text-xs")}
                    >
                      {ticket.originAddress}
                    </span>
                  </div>
                  <div className="flex w-full min-w-0 items-center gap-1.5">
                    <MapPin
                      className={cn(
                        "text-destructive shrink-0",
                        isUpNext ? "h-4 w-4" : "h-3.5 w-3.5"
                      )}
                    />
                    <span
                      className={cn(
                        "text-muted-foreground font-medium",
                        isUpNext ? "text-sm" : "text-xs"
                      )}
                    >
                      {t("to")}
                    </span>
                    <span
                      className={cn("text-foreground min-w-0 flex-1 truncate", isUpNext ? "text-sm" : "text-xs")}
                    >
                      {ticket.destinationAddress}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section: 3-Button Layout */}
            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:min-w-0">
              {/* Navigate Button - Orange/Primary */}
              <Button
                onClick={handleNavigate}
                disabled={ticket.isCompleted || isGeocoding}
                size={isUpNext ? "default" : "sm"}
                className={cn(
                  "bg-primary hover:bg-primary/90 w-full font-semibold text-white sm:w-auto",
                  isUpNext && "text-base"
                )}
              >
                {isGeocoding ? (
                  <Loader2
                    className={cn("mr-2", isUpNext ? "h-5 w-5" : "h-4 w-4", "animate-spin")}
                  />
                ) : (
                  <Navigation className={cn("mr-2", isUpNext ? "h-5 w-5" : "h-4 w-4")} />
                )}
                {isGeocoding ? "..." : t("navigate")}
              </Button>

              {/* Done/Delete Button - Green */}
              {!ticket.isCompleted ? (
                <Button
                  onClick={handleComplete}
                  size={isUpNext ? "default" : "sm"}
                  // eslint-disable-next-line custom/no-admin-hardcoded-colors
                  className={cn(
                    "w-full bg-green-600 font-semibold text-white hover:bg-green-700 sm:w-auto",
                    isUpNext && "text-base"
                  )}
                >
                  <CheckCircle className={cn("mr-2", isUpNext ? "h-5 w-5" : "h-4 w-4")} />
                  {t("done")}
                </Button>
              ) : (
                onDelete && (
                  <Button
                    onClick={handleDelete}
                    size={isUpNext ? "default" : "sm"}
                    // eslint-disable-next-line custom/no-admin-hardcoded-colors
                    className={cn(
                      "w-full bg-red-600 font-semibold text-white hover:bg-red-700 sm:w-auto",
                      isUpNext && "text-base"
                    )}
                  >
                    <Trash2 className={cn("mr-2", isUpNext ? "h-5 w-5" : "h-4 w-4")} />
                    {t("delete")}
                  </Button>
                )
              )}

              {/* Info Button - Navy/Secondary */}
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                size={isUpNext ? "default" : "sm"}
                className={cn(
                  "bg-secondary hover:bg-secondary/90 w-full font-semibold text-white sm:w-auto",
                  isUpNext && "text-base"
                )}
              >
                <Info className={cn("mr-2", isUpNext ? "h-5 w-5" : "h-4 w-4")} />
                {t("info")}
              </Button>
            </div>
          </div>

          {/* Collapsible Details Section - All Ticket Info */}
          {isExpanded && (
            <div
              className={cn(
                "border-t px-4 pt-3 pb-4",
                isUpNext ? "border-white/20" : "border-border"
              )}
            >
              <div className="space-y-4">
                {/* Recipient & Phone */}
                {(ticket.recipientName || ticket.recipientPhone) && (
                  <div className="grid gap-2 md:grid-cols-2">
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
                  </div>
                )}

                {/* Notes */}
                {ticket.notes && (
                  <div>
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

                {/* Coordinates */}
                {(ticket.originCoordinates || ticket.destinationCoordinates) && (
                  <div>
                    <p
                      className={cn(
                        "mb-2 text-xs font-semibold uppercase",
                        isUpNext ? "text-white/80" : "text-muted-foreground"
                      )}
                    >
                      Coordinates
                    </p>
                    <div className="grid gap-2 md:grid-cols-2">
                      {ticket.originCoordinates && (
                        <div>
                          <p
                            className={cn(
                              "text-xs",
                              isUpNext ? "text-white/60" : "text-muted-foreground"
                            )}
                          >
                            Origin
                          </p>
                          <p
                            className={cn(
                              "font-mono text-xs",
                              isUpNext ? "text-white" : "text-foreground"
                            )}
                          >
                            {ticket.originCoordinates.lat.toFixed(6)},{" "}
                            {ticket.originCoordinates.lng.toFixed(6)}
                          </p>
                        </div>
                      )}
                      {ticket.destinationCoordinates && (
                        <div>
                          <p
                            className={cn(
                              "text-xs",
                              isUpNext ? "text-white/60" : "text-muted-foreground"
                            )}
                          >
                            Destination
                          </p>
                          <p
                            className={cn(
                              "font-mono text-xs",
                              isUpNext ? "text-white" : "text-foreground"
                            )}
                          >
                            {ticket.destinationCoordinates.lat.toFixed(6)},{" "}
                            {ticket.destinationCoordinates.lng.toFixed(6)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Ticket Photo */}
                {ticket.ticketImageUrl && (
                  <div>
                    <p
                      className={cn(
                        "mb-2 text-xs font-semibold uppercase",
                        isUpNext ? "text-white/80" : "text-muted-foreground"
                      )}
                    >
                      Ticket Photo
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element, custom/no-inline-styles */}
                    <img
                      src={ticket.ticketImageUrl}
                      alt="Delivery ticket"
                      className="w-full max-w-md rounded-lg border-2"
                      style={{
                        borderColor: isUpNext ? "rgba(255,255,255,0.2)" : "hsl(var(--border))",
                      }}
                    />
                  </div>
                )}

                {/* Show message if no additional info */}
                {!ticket.recipientName &&
                  !ticket.recipientPhone &&
                  !ticket.notes &&
                  !ticket.ticketImageUrl &&
                  !ticket.originCoordinates &&
                  !ticket.destinationCoordinates && (
                    <p
                      className={cn(
                        "text-sm italic",
                        isUpNext ? "text-white/60" : "text-muted-foreground"
                      )}
                    >
                      No additional information available
                    </p>
                  )}
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </>
  );
}
