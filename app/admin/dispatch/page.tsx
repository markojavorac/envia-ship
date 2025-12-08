"use client";

import { useState } from "react";
import { Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageTitle } from "@/components/admin/ui/AdminPageTitle";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { AdminInfoBox } from "@/components/admin/ui/AdminInfoBox";
import { AddTicketDialog } from "@/components/admin/driver-assist/AddTicketDialog";
import { ShareableUrlDisplay } from "@/components/admin/dispatch/ShareableUrlDisplay";
import { encodeTicketToUrl, isUrlTooLong } from "@/lib/admin/ticket-url-encoding";
import type { DeliveryTicket } from "@/lib/admin/driver-assist-types";

/**
 * Dispatcher Utility Page
 *
 * Allows dispatchers to create shareable ticket URLs for drivers.
 * Workflow:
 * 1. Create ticket (upload image + AI analysis, or manual entry)
 * 2. Generate shareable URL with encoded ticket data
 * 3. Copy URL and share via WhatsApp
 * 4. Driver clicks URL → ticket auto-loads into their queue
 */
export default function DispatcherUtilityPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [currentTicket, setCurrentTicket] = useState<DeliveryTicket | null>(null);

  const handleSaveTicket = (ticketData: {
    ticketNumber?: string;
    originAddress: string;
    destinationAddress: string;
    recipientName?: string;
    recipientPhone?: string;
    notes?: string;
    ticketImageUrl?: string;
  }) => {
    // Create temporary ticket object for URL generation
    const ticket: DeliveryTicket = {
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

    // Generate shareable URL
    const url = encodeTicketToUrl(ticket);

    setCurrentTicket(ticket);
    setGeneratedUrl(url);
    setIsAddDialogOpen(false);
  };

  const handleCreateAnother = () => {
    setCurrentTicket(null);
    setGeneratedUrl(null);
    setIsAddDialogOpen(true);
  };

  const handleReset = () => {
    setCurrentTicket(null);
    setGeneratedUrl(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageTitle
        title="Dispatcher Utility"
        description="Create shareable ticket links for drivers"
        actions={
          !generatedUrl && (
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          )
        }
      />

      {/* Instructions (when no URL generated) */}
      {!generatedUrl && (
        <AdminCard title="How It Works" icon={Send}>
          <div className="space-y-3">
            <AdminInfoBox variant="info">
              Create a delivery ticket and generate a shareable URL for your drivers. They can
              click the link from WhatsApp to automatically load the ticket into their queue.
            </AdminInfoBox>

            <ol className="space-y-2 text-sm text-foreground">
              <li className="flex items-start gap-2">
                <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  <strong>Create a ticket</strong> - Upload a photo or manually enter delivery
                  details
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  <strong>Copy the generated URL</strong> - A shareable link will be created
                  automatically
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  <strong>Send via WhatsApp</strong> - Share the link with your driver
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  4
                </span>
                <span>
                  <strong>Driver clicks link</strong> - Ticket automatically loads into their queue
                </span>
              </li>
            </ol>

            <div className="pt-4">
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Ticket
              </Button>
            </div>
          </div>
        </AdminCard>
      )}

      {/* Generated URL Display */}
      {generatedUrl && currentTicket && (
        <ShareableUrlDisplay
          url={generatedUrl}
          ticketNumber={currentTicket.ticketNumber}
          originAddress={currentTicket.originAddress}
          destinationAddress={currentTicket.destinationAddress}
          onCreateAnother={handleCreateAnother}
        />
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
