"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { AdminInfoBox } from "@/components/admin/ui/AdminInfoBox";
import { toast } from "sonner";

interface ShareableUrlDisplayProps {
  url: string;
  ticketNumber?: string;
  originAddress: string;
  destinationAddress: string;
  onCreateAnother: () => void;
}

/**
 * ShareableUrlDisplay - Display and copy shareable ticket URLs
 *
 * Shows generated URL with copy-to-clipboard functionality and ticket metadata preview.
 * Used in dispatcher utility to share tickets with drivers via WhatsApp.
 */
export function ShareableUrlDisplay({
  url,
  ticketNumber,
  originAddress,
  destinationAddress,
  onCreateAnother,
}: ShareableUrlDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("URL copied to clipboard!");

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
      toast.error("Failed to copy URL to clipboard");
    }
  };

  // Truncate address for display (max 60 chars)
  const truncate = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Check if URL is too long
  const urlTooLong = url.length > 2000;

  return (
    <AdminCard title="Shareable URL" icon={ExternalLink}>
      <div className="space-y-4">
        {/* URL Warning (if too long) */}
        {urlTooLong && (
          <AdminInfoBox variant="warning">
            URL is very long ({url.length} characters). Consider creating ticket without image for
            easier sharing.
          </AdminInfoBox>
        )}

        {/* Ticket Metadata Preview */}
        <div className="bg-card rounded-md border border-border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Ticket Preview
            </p>
            {ticketNumber && (
              <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                {ticketNumber}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div>
              <p className="text-xs text-muted-foreground">From:</p>
              <p className="text-sm text-foreground font-medium">{truncate(originAddress)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">To:</p>
              <p className="text-sm text-foreground font-medium">
                {truncate(destinationAddress)}
              </p>
            </div>
          </div>
        </div>

        {/* URL Display & Copy */}
        <div className="space-y-2">
          <Label htmlFor="shareable-url" className="text-foreground font-semibold">
            Shareable Link
          </Label>
          <div className="flex gap-2">
            <Input
              id="shareable-url"
              value={url}
              readOnly
              className="bg-card border-border text-foreground font-mono text-xs cursor-pointer"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              onClick={handleCopy}
              className={`shrink-0 ${
                copied
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-primary hover:bg-primary/90 text-white"
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Share this link via WhatsApp. Driver can click to auto-load the ticket.
          </p>
        </div>

        {/* URL Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
          <span>URL Length: {url.length} characters</span>
          <span className={urlTooLong ? "text-yellow-600 font-semibold" : ""}>
            {urlTooLong ? "⚠️ Very long" : "✓ Good"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={onCreateAnother}
            variant="outline"
            className="flex-1 border-border text-foreground hover:bg-primary/5"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Create Another Ticket
          </Button>
        </div>
      </div>
    </AdminCard>
  );
}
