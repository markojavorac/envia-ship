"use client";

import { CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { DeliveryTicket } from "@/lib/admin/driver-assist-types";

interface TicketConfirmationDialogProps {
  open: boolean;
  ticket: DeliveryTicket | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * TicketConfirmationDialog - Confirm adding shared ticket to queue
 *
 * Shows ticket details from dispatcher and asks driver to confirm
 * before adding it to their delivery queue.
 *
 * Supports English/Spanish via next-intl.
 */
export function TicketConfirmationDialog({
  open,
  ticket,
  onConfirm,
  onCancel,
}: TicketConfirmationDialogProps) {
  const t = useTranslations("admin.driverAssist.confirmation");

  if (!ticket) return null;

  // Truncate long addresses for preview
  const truncate = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="bg-card border-border max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <CheckCircle className="text-primary h-5 w-5" />
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Ticket Image Preview (if available) */}
          {ticket.ticketImageUrl && (
            <div className="rounded-md border border-border overflow-hidden">
              <Image
                src={ticket.ticketImageUrl}
                alt="Ticket Preview"
                width={600}
                height={400}
                className="w-full object-cover max-h-64"
              />
            </div>
          )}

          {/* Ticket Details */}
          <div className="bg-card rounded-md border border-border p-4 space-y-3">
            {/* Ticket Number */}
            {ticket.ticketNumber && (
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase">
                  {t("ticketNumber")}
                </Label>
                <p className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded inline-block mt-1">
                  {ticket.ticketNumber}
                </p>
              </div>
            )}

            {/* Origin Address */}
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase text-foreground">
                {t("origin")}
              </Label>
              <p className="text-sm text-foreground font-medium mt-1">{ticket.originAddress}</p>
            </div>

            {/* Destination Address */}
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase text-foreground">
                {t("destination")}
              </Label>
              <p className="text-sm text-foreground font-medium mt-1">
                {ticket.destinationAddress}
              </p>
            </div>

            {/* Recipient Info */}
            {(ticket.recipientName || ticket.recipientPhone) && (
              <div className="border-t border-border pt-3 space-y-2">
                {ticket.recipientName && (
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase text-foreground">
                      {t("recipient")}
                    </Label>
                    <p className="text-sm text-foreground">{ticket.recipientName}</p>
                  </div>
                )}
                {ticket.recipientPhone && (
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase text-foreground">
                      {t("phone")}
                    </Label>
                    <p className="text-sm font-mono text-foreground">{ticket.recipientPhone}</p>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {ticket.notes && (
              <div className="border-t border-border pt-3">
                <Label className="text-xs font-semibold text-muted-foreground uppercase text-foreground">
                  {t("notes")}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">{ticket.notes}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-border text-foreground hover:bg-muted"
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-primary hover:bg-primary/90 text-white font-semibold"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {t("addToQueue")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
