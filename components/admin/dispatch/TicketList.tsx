/**
 * TicketList Component
 *
 * Displays collection of tickets before route optimization.
 * Shows destination addresses and allows deletion.
 */

import { X, MapPin, Package } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AdminCard, AdminCardContent } from "@/components/admin/ui/AdminCard";
import type { DeliveryTicket } from "@/lib/admin/driver-assist-types";
import { cn } from "@/lib/utils";

interface TicketListProps {
  tickets: DeliveryTicket[];
  onDeleteTicket: (ticketId: string) => void;
}

export function TicketList({ tickets, onDeleteTicket }: TicketListProps) {
  const t = useTranslations("admin.dispatch");

  return (
    <AdminCard title={t("deliveryTickets")} icon={Package}>
      <AdminCardContent>
        <div className="space-y-3">
          {tickets.map((ticket, index) => (
          <div
            key={ticket.id}
            className={cn(
              "flex items-center gap-3 rounded-lg border-2 p-4 transition-all",
              "bg-card border-border hover:border-primary/30"
            )}
          >
            {/* Sequence Number */}
            <div className="flex-shrink-0">
              <div className="bg-secondary text-secondary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
                {index + 1}
              </div>
            </div>

            {/* Ticket Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <MapPin className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-sm font-semibold">
                    {ticket.destinationAddress}
                  </p>
                  {ticket.recipientName && (
                    <p className="text-muted-foreground text-xs">
                      {ticket.recipientName}
                      {ticket.ticketNumber && ` • ${ticket.ticketNumber}`}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Delete Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteTicket(ticket.id)}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="border-border mt-6 border-t pt-4">
          <p className="text-muted-foreground text-sm">
            {t("totalTickets")}:{" "}
            <span className="text-foreground font-semibold">
              {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
            </span>
          </p>
        </div>
      </AdminCardContent>
    </AdminCard>
  );
}
