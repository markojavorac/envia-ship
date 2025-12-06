"use client";

import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AddTicketCardProps {
  onClick: () => void;
}

/**
 * AddTicketCard - Horizontal button-style card that opens the add ticket dialog
 * Shows a plus icon and prompts the user to add a new delivery ticket
 */
export function AddTicketCard({ onClick }: AddTicketCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "border-border bg-card cursor-pointer border-2 border-dashed",
        "hover:border-primary hover:bg-primary/5 transition-colors"
      )}
    >
      <CardContent className="flex items-center gap-4 py-6">
        <div className="bg-primary rounded-xl p-3">
          {/* eslint-disable-next-line custom/no-admin-hardcoded-colors */}
          <Plus className="h-6 w-6 text-white" />
        </div>
        <div>
          <span className="text-foreground block text-lg font-bold">Add New Ticket</span>
          <span className="text-muted-foreground block text-sm">
            Upload ticket photo or enter delivery details manually
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
