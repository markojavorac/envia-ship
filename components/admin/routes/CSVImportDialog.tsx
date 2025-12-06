/**
 * CSV Import Dialog Component
 *
 * Multi-step modal for importing addresses from CSV
 */

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { AdminInfoBox } from "@/components/admin/ui";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { RouteStop } from "@/lib/admin/route-types";
import {
  parseRouteCSV,
  validateStopCount,
  type CSVRow,
  type ParseResult,
} from "@/lib/admin/csv-parser";
import {
  batchGeocodeWithNotes,
  type GeocodeProgress,
  type BatchGeocodeResult,
} from "@/lib/admin/batch-geocode";

type Step = "upload" | "preview" | "geocoding" | "results";

interface CSVImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (stops: RouteStop[]) => void;
  currentStopCount: number;
  maxStops?: number;
}

export function CSVImportDialog({
  open,
  onClose,
  onImport,
  currentStopCount,
  maxStops = 25,
}: CSVImportDialogProps) {
  const [step, setStep] = useState<Step>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [geocodeProgress, setGeocodeProgress] = useState<GeocodeProgress>({
    current: 0,
    total: 0,
    currentAddress: "",
  });
  const [geocodeResult, setGeocodeResult] = useState<BatchGeocodeResult | null>(null);

  // Reset state when dialog closes
  const handleClose = () => {
    setStep("upload");
    setSelectedFile(null);
    setParseResult(null);
    setGeocodeProgress({ current: 0, total: 0, currentAddress: "" });
    setGeocodeResult(null);
    onClose();
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith(".csv")) {
      alert("Please select a CSV file");
      return;
    }

    setSelectedFile(file);

    // Parse CSV
    try {
      const result = await parseRouteCSV(file);
      setParseResult(result);

      if (result.success && result.data.length > 0) {
        setStep("preview");
      } else {
        alert(`Failed to parse CSV:\n${result.errors.join("\n")}`);
      }
    } catch (error) {
      console.error("CSV parsing error:", error);
      alert("Failed to parse CSV file");
    }
  };

  // Handle import confirmation
  const handleStartImport = async () => {
    if (!parseResult || parseResult.data.length === 0) return;

    // Validate stop count
    const validation = validateStopCount(currentStopCount, parseResult.data.length, maxStops);

    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    // Start geocoding
    setStep("geocoding");

    try {
      const result = await batchGeocodeWithNotes(parseResult.data, setGeocodeProgress);
      setGeocodeResult(result);
      setStep("results");
    } catch (error) {
      console.error("Batch geocoding error:", error);
      alert("Failed to geocode addresses");
      setStep("preview");
    }
  };

  // Handle final import
  const handleFinalImport = () => {
    if (!geocodeResult || geocodeResult.successful.length === 0) return;

    onImport(geocodeResult.successful);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">Import Addresses from CSV</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {step === "upload" && "Upload a CSV file with addresses to import"}
            {step === "preview" && "Review addresses before importing"}
            {step === "geocoding" && "Geocoding addresses..."}
            {step === "results" && "Import complete"}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: File Upload */}
        {step === "upload" && (
          <div className="space-y-4">
            <AdminInfoBox variant="info">
              Upload a CSV file with an <span className="font-semibold">address</span> column.
              Optional columns: <span className="font-semibold">notes</span>,{" "}
              <span className="font-semibold">zone</span>.
              <br />
              <br />
              Example:
              <pre className="bg-background border-border mt-2 rounded border p-2 text-xs">
                {`address,notes\n"6a Avenida, Zona 10, Guatemala City",Deliver to reception\n"Centro Comercial Arkadia",Call before arrival`}
              </pre>
            </AdminInfoBox>

            <div className="space-y-2">
              <label htmlFor="csv-file" className="text-foreground block text-sm font-semibold">
                Select CSV File
              </label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="bg-background border-border text-foreground file:text-foreground cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === "preview" && parseResult && (
          <div className="space-y-4">
            <div className="text-foreground flex items-center gap-2">
              <FileText className="text-primary h-5 w-5" />
              <span className="font-semibold">
                Found {parseResult.data.length} address
                {parseResult.data.length !== 1 ? "es" : ""}
              </span>
            </div>

            {/* Validation errors */}
            {parseResult.errors.length > 0 && (
              <AdminInfoBox variant="warning">
                <div className="space-y-1">
                  {parseResult.errors.slice(0, 5).map((error, index) => (
                    <div key={index} className="text-sm">
                      {error}
                    </div>
                  ))}
                  {parseResult.errors.length > 5 && (
                    <div className="text-sm">... and {parseResult.errors.length - 5} more</div>
                  )}
                </div>
              </AdminInfoBox>
            )}

            {/* Preview addresses */}
            <div className="border-border bg-background rounded-md border">
              <div className="border-border border-b p-3">
                <h4 className="text-foreground text-sm font-semibold">
                  Preview (first 5 addresses)
                </h4>
              </div>
              <div className="divide-border divide-y">
                {parseResult.data.slice(0, 5).map((row, index) => (
                  <div key={index} className="p-3">
                    <div className="text-foreground text-sm">{row.address}</div>
                    {row.notes && (
                      <div className="text-muted-foreground mt-1 text-xs">Note: {row.notes}</div>
                    )}
                  </div>
                ))}
              </div>
              {parseResult.data.length > 5 && (
                <div className="border-border text-muted-foreground border-t p-3 text-sm">
                  ... and {parseResult.data.length - 5} more address
                  {parseResult.data.length - 5 !== 1 ? "es" : ""}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep("upload")}
                className="border-border text-foreground hover:bg-muted"
              >
                Back
              </Button>
              <Button
                onClick={handleStartImport}
                className="bg-primary hover:bg-primary/90 flex-1 text-white"
              >
                <Upload className="mr-2 h-4 w-4" />
                Import & Geocode {parseResult.data.length} Address
                {parseResult.data.length !== 1 ? "es" : ""}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Geocoding Progress */}
        {step === "geocoding" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-foreground flex justify-between text-sm">
                <span>
                  Geocoding {geocodeProgress.current} of {geocodeProgress.total}
                </span>
                <span>{Math.round((geocodeProgress.current / geocodeProgress.total) * 100)}%</span>
              </div>
              <Progress value={(geocodeProgress.current / geocodeProgress.total) * 100} />
            </div>

            <div className="border-border bg-background rounded-md border p-3">
              <div className="text-muted-foreground text-sm">Current address:</div>
              <div className="text-foreground mt-1 text-sm font-medium">
                {geocodeProgress.currentAddress}
              </div>
            </div>

            <AdminInfoBox variant="info">
              Please wait while we geocode all addresses. This may take a few moments due to rate
              limiting (1 address per second).
            </AdminInfoBox>
          </div>
        )}

        {/* Step 4: Results */}
        {step === "results" && geocodeResult && (
          <div className="space-y-4">
            {/* Success count */}
            {geocodeResult.successful.length > 0 && (
              <AdminInfoBox variant="success">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold">
                    Successfully geocoded {geocodeResult.successful.length} address
                    {geocodeResult.successful.length !== 1 ? "es" : ""}
                  </span>
                </div>
              </AdminInfoBox>
            )}

            {/* Failed count */}
            {geocodeResult.failed.length > 0 && (
              <AdminInfoBox variant="error">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-semibold">
                      Failed to geocode {geocodeResult.failed.length} address
                      {geocodeResult.failed.length !== 1 ? "es" : ""}
                    </span>
                  </div>
                  <div className="max-h-32 space-y-1 overflow-y-auto text-sm">
                    {geocodeResult.failed.slice(0, 5).map((fail, index) => (
                      <div key={index}>
                        <span className="font-medium">{fail.address}</span>: {fail.error}
                      </div>
                    ))}
                    {geocodeResult.failed.length > 5 && (
                      <div>... and {geocodeResult.failed.length - 5} more</div>
                    )}
                  </div>
                </div>
              </AdminInfoBox>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-border text-foreground hover:bg-muted"
              >
                Cancel
              </Button>
              {geocodeResult.successful.length > 0 && (
                <Button
                  onClick={handleFinalImport}
                  className="bg-primary hover:bg-primary/90 flex-1 text-white"
                >
                  Add {geocodeResult.successful.length} Stop
                  {geocodeResult.successful.length !== 1 ? "s" : ""} to Route
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
