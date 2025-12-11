"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, RefreshCw, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { AdminInfoBox } from "@/components/admin/ui/AdminInfoBox";
import type { DeliveryTicket } from "@/lib/admin/driver-assist-types";
import type { OptimizedRoute } from "@/lib/admin/route-types";
import { formatDistance, formatDuration, formatPercent } from "@/lib/admin/route-metrics";
import { toast } from "sonner";

interface ShareableUrlDisplayProps {
  url: string;
  tickets: DeliveryTicket[];
  optimizedRoute: OptimizedRoute;
  onCreateAnother: () => void;
}

/**
 * ShareableUrlDisplay - Display and copy shareable route URLs
 *
 * Shows generated URL with copy-to-clipboard functionality and route metadata preview.
 * Used in dispatcher utility to share optimized routes with drivers via WhatsApp.
 */
export function ShareableUrlDisplay({
  url,
  tickets,
  optimizedRoute,
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

  // Truncate address for display
  const truncate = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Check if URL is too long
  const urlTooLong = url.length > 2000;

  // Show first 3 stops and ellipsis if more
  const previewStops = tickets.slice(0, 3);
  const hasMoreStops = tickets.length > 3;

  return (
    <AdminCard title="Shareable Route URL" icon={ExternalLink}>
      <div className="space-y-4">
        {/* Success Message */}
        <AdminInfoBox variant="info">
          Route URL generated! Share with driver to load all {tickets.length} tickets in optimized
          order.
        </AdminInfoBox>

        {/* URL Warning (if too long) */}
        {urlTooLong && (
          <AdminInfoBox variant="warning">
            URL is very long ({url.length} characters). May not work in some messaging apps.
          </AdminInfoBox>
        )}

        {/* Route Metadata Preview */}
        <div className="bg-card border-border space-y-3 rounded-md border p-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-semibold uppercase">Route Preview</p>
            <span className="bg-primary/10 text-primary rounded px-2 py-1 font-mono text-xs">
              {tickets.length} stops
            </span>
          </div>

          {/* Optimization Summary */}
          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-muted-foreground text-xs">Saved</p>
                <p className="text-lg font-bold text-green-600">
                  {formatPercent(optimizedRoute.improvementPercent)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Distance</p>
                <p className="text-foreground text-sm font-semibold">
                  {formatDistance(optimizedRoute.totalDistance)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Time</p>
                <p className="text-foreground text-sm font-semibold">
                  {formatDuration(optimizedRoute.totalTime)}
                </p>
              </div>
            </div>
          </div>

          {/* Stop Preview */}
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Optimized sequence:</p>
            {previewStops.map((ticket, index) => (
              <div key={ticket.id} className="flex items-start gap-2 text-sm">
                <span className="bg-primary mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                  {index + 1}
                </span>
                <p className="text-foreground flex-1">{truncate(ticket.destinationAddress)}</p>
              </div>
            ))}
            {hasMoreStops && (
              <p className="text-muted-foreground pl-7 text-xs">
                ...and {tickets.length - 3} more {tickets.length - 3 === 1 ? "stop" : "stops"}
              </p>
            )}
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
              className="bg-card border-border text-foreground cursor-pointer font-mono text-xs"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              onClick={handleCopy}
              className={`shrink-0 ${
                copied
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-primary hover:bg-primary/90 text-white"
              }`}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            Share this link via WhatsApp. Driver can click to auto-load all {tickets.length} tickets
            in optimized order.
          </p>
        </div>

        {/* URL Stats */}
        <div className="text-muted-foreground border-border flex items-center justify-between border-t pt-2 text-xs">
          <span>URL Length: {url.length} characters</span>
          <span className={urlTooLong ? "font-semibold text-yellow-600" : ""}>
            {urlTooLong ? "⚠️ Very long" : "✓ Good"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={onCreateAnother}
            variant="outline"
            className="border-border text-foreground hover:bg-primary/5 flex-1"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Create New Route
          </Button>
        </div>
      </div>
    </AdminCard>
  );
}
