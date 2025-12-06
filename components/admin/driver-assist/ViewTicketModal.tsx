"use client";

import { FileText, MapPin, User, Phone, FileImage } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { DeliveryTicket } from "@/lib/admin/driver-assist-types";

interface ViewTicketModalProps {
  ticket: DeliveryTicket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * ViewTicketModal - Full ticket details in modal overlay
 * Shows all ticket information including optional image
 */
export function ViewTicketModal({ ticket, open, onOpenChange }: ViewTicketModalProps) {
  if (!ticket) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileText className="text-primary h-5 w-5" />
            <DialogTitle className="text-foreground">
              {ticket.ticketNumber ? `Ticket #${ticket.ticketNumber}` : "Delivery Ticket"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            {ticket.isCompleted
              ? `Completed ${formatDistanceToNow(ticket.completedAt!, { addSuffix: true })}`
              : `Created ${formatDistanceToNow(ticket.createdAt, { addSuffix: true })}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Badge */}
          {ticket.isCompleted && (
            <div>
              {/* eslint-disable-next-line custom/no-admin-hardcoded-colors */}
              <Badge className="bg-green-500 text-white">Completed</Badge>
            </div>
          )}

          {/* Ticket Image */}
          {ticket.ticketImageUrl && (
            <div>
              <Label className="text-foreground mb-2 flex items-center gap-1 text-sm font-semibold">
                <FileImage className="h-4 w-4" />
                Ticket Photo
              </Label>
              <div className="bg-muted relative aspect-video overflow-hidden rounded-lg">
                <Image src={ticket.ticketImageUrl} alt="Ticket" fill className="object-contain" />
              </div>
            </div>
          )}

          {/* Addresses */}
          <div className="space-y-3">
            <div>
              <Label className="text-foreground mb-1 flex items-center gap-1 text-sm font-semibold">
                <MapPin className="text-primary h-4 w-4" />
                Origin Address
              </Label>
              <p className="text-foreground bg-muted rounded-md p-3 text-sm">
                {ticket.originAddress}
              </p>
            </div>

            <div>
              <Label className="text-foreground mb-1 flex items-center gap-1 text-sm font-semibold">
                <MapPin className="text-destructive h-4 w-4" />
                Destination Address
              </Label>
              <p className="text-foreground bg-muted rounded-md p-3 text-sm">
                {ticket.destinationAddress}
              </p>
            </div>
          </div>

          {/* Recipient Information */}
          {(ticket.recipientName || ticket.recipientPhone) && (
            <div className="border-border rounded-lg border p-4">
              <Label className="text-foreground mb-3 flex items-center gap-1 text-sm font-semibold">
                <User className="h-4 w-4" />
                Recipient Information
              </Label>
              <div className="space-y-2">
                {ticket.recipientName && (
                  <div className="flex items-center gap-2">
                    <User className="text-muted-foreground h-3 w-3" />
                    <span className="text-foreground text-sm">{ticket.recipientName}</span>
                  </div>
                )}
                {ticket.recipientPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="text-muted-foreground h-3 w-3" />
                    <span className="text-foreground text-sm">{ticket.recipientPhone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {ticket.notes && (
            <div>
              <Label className="text-foreground mb-1 text-sm font-semibold">Notes</Label>
              <p className="text-foreground bg-muted rounded-md p-3 text-sm">{ticket.notes}</p>
            </div>
          )}

          {/* Coordinates (if geocoded) */}
          {(ticket.originCoordinates || ticket.destinationCoordinates) && (
            <div className="border-border rounded-lg border p-4">
              <Label className="text-foreground mb-2 text-sm font-semibold">
                Geocoded Coordinates
              </Label>
              <div className="text-muted-foreground space-y-1 font-mono text-xs">
                {ticket.originCoordinates && (
                  <div>
                    Origin: {ticket.originCoordinates.lat.toFixed(6)},{" "}
                    {ticket.originCoordinates.lng.toFixed(6)}
                  </div>
                )}
                {ticket.destinationCoordinates && (
                  <div>
                    Destination: {ticket.destinationCoordinates.lat.toFixed(6)},{" "}
                    {ticket.destinationCoordinates.lng.toFixed(6)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
