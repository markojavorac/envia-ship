/**
 * CSV Import Button Component
 *
 * Button that triggers the CSV import dialog
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { CSVImportDialog } from "./CSVImportDialog";
import { RouteStop } from "@/lib/admin/route-types";

interface CSVImportButtonProps {
  /** Callback when import is complete */
  onImport: (stops: RouteStop[]) => void;
  /** Number of stops currently in the route */
  currentStopCount: number;
  /** Maximum number of stops allowed */
  maxStops?: number;
  /** Disabled state */
  disabled?: boolean;
}

export function CSVImportButton({
  onImport,
  currentStopCount,
  maxStops = 25,
  disabled = false,
}: CSVImportButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleImport = (stops: RouteStop[]) => {
    onImport(stops);
    setDialogOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        disabled={disabled}
        className="border-primary text-primary hover:bg-primary/5 bg-card border-2 font-semibold"
      >
        <Upload className="mr-2 h-4 w-4" />
        Import CSV
      </Button>

      <CSVImportDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onImport={handleImport}
        currentStopCount={currentStopCount}
        maxStops={maxStops}
      />
    </>
  );
}
