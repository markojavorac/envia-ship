/* eslint-disable custom/no-admin-hardcoded-colors */
"use client";

import { useState, useRef } from "react";
import { Plus, Upload, X, Loader2, FileText, Sparkles, Edit, MapPin } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AddressAutocomplete } from "@/components/admin/routes/AddressAutocomplete";
import type { Coordinates } from "@/lib/admin/driver-assist-types";
import { toast } from "sonner";

interface AddTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (ticketData: {
    ticketNumber?: string;
    originAddress: string;
    destinationAddress: string;
    originCoordinates?: Coordinates;
    destinationCoordinates?: Coordinates;
    recipientName?: string;
    recipientPhone?: string;
    notes?: string;
    ticketImageUrl?: string;
  }) => void;
}

/**
 * AddTicketDialog - AI-powered ticket upload with drag-and-drop
 * Automatically analyzes ENVÍA tickets and extracts all fields
 */
export function AddTicketDialog({ open, onOpenChange, onSave }: AddTicketDialogProps) {
  // Shared form state (persisted across tabs)
  const [ticketNumber, setTicketNumber] = useState("");
  const [originAddress, setOriginAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [originCoordinates, setOriginCoordinates] = useState<Coordinates | null>(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState<Coordinates | null>(null);
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Manual entry state
  const [manualOriginInput, setManualOriginInput] = useState("");
  const [manualDestinationInput, setManualDestinationInput] = useState("");

  // AI analysis state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<"manual" | "ai">("manual");

  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle AI analysis with confirmation if manual data exists
   */
  const handleAIAnalysisWithConfirmation = async (base64Data: string, mimeType: string) => {
    // Check if manual form has data
    const hasManualData =
      originAddress || destinationAddress || recipientName || recipientPhone || notes;

    if (hasManualData) {
      const confirmed = window.confirm(
        "AI analysis will overwrite your current form data. Continue?"
      );
      if (!confirmed) return;
    }

    await analyzeTicket(base64Data, mimeType);
  };

  /**
   * Analyze ticket image/PDF with AI and auto-fill fields
   */
  const analyzeTicket = async (base64Data: string, mimeType: string) => {
    setIsAnalyzing(true);
    toast.info("Analyzing ticket...");

    try {
      // Extract base64 data without prefix
      const base64Content = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;

      const response = await fetch("/api/admin/analyze-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: {
            data: base64Content,
            mimeType,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze ticket");
      }

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || "Failed to extract ticket data");
        return;
      }

      // Auto-fill form fields
      if (result.ticketNumber) setTicketNumber(result.ticketNumber);
      if (result.originAddress) setOriginAddress(result.originAddress);
      if (result.destinationAddress) setDestinationAddress(result.destinationAddress);
      if (result.recipientName) setRecipientName(result.recipientName);
      if (result.recipientPhone) setRecipientPhone(result.recipientPhone);
      if (result.notes) setNotes(result.notes);

      toast.success("Ticket analyzed! Review the details below.");
    } catch (error) {
      console.error("Ticket analysis error:", error);
      toast.error("Failed to analyze ticket. Please enter details manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Handle file selection (from input or drag-and-drop)
   */
  const processFile = async (file: File) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only images (JPG, PNG) and PDFs are allowed");
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return;
    }

    // Warn if file is large
    if (file.size > 2 * 1024 * 1024) {
      toast.warning("Large files may impact storage. Consider using smaller images.");
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setPreviewUrl(base64String);

      // Automatically trigger AI analysis with confirmation
      await handleAIAnalysisWithConfirmation(base64String, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  /**
   * Drag-and-drop handlers
   */
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleRemoveImage = () => {
    // Only clear AI-specific state, keep form data
    setPreviewUrl(null);
    setIsAnalyzing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Don't clear form fields - let user decide
    toast.info("Image removed. Form data preserved.");
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!originAddress.trim()) {
      newErrors.origin = "Origin address is required";
    }

    if (!destinationAddress.trim()) {
      newErrors.destination = "Destination address is required";
    }

    if (
      originAddress.trim() &&
      destinationAddress.trim() &&
      originAddress.trim().toLowerCase() === destinationAddress.trim().toLowerCase()
    ) {
      newErrors.destination = "Origin and destination cannot be the same";
    }

    // Manual mode specific: warn if no coordinates (non-blocking)
    if (activeTab === "manual" && (!originCoordinates || !destinationCoordinates)) {
      toast.info("Tip: Select addresses from dropdown for accurate routing", {
        duration: 3000,
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    onSave({
      ticketNumber: ticketNumber.trim() || undefined,
      originAddress: originAddress.trim(),
      destinationAddress: destinationAddress.trim(),
      originCoordinates: originCoordinates || undefined,
      destinationCoordinates: destinationCoordinates || undefined,
      recipientName: recipientName.trim() || undefined,
      recipientPhone: recipientPhone.trim() || undefined,
      notes: notes.trim() || undefined,
      ticketImageUrl: previewUrl || undefined,
    });

    // Reset form
    resetForm();
    toast.success("Ticket added successfully");
  };

  const resetForm = () => {
    // Shared form state
    setTicketNumber("");
    setOriginAddress("");
    setDestinationAddress("");
    setOriginCoordinates(null);
    setDestinationCoordinates(null);
    setRecipientName("");
    setRecipientPhone("");
    setNotes("");
    setErrors({});

    // Manual entry state
    setManualOriginInput("");
    setManualDestinationInput("");

    // AI analysis state
    setPreviewUrl(null);
    setIsAnalyzing(false);
    setIsDragging(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Reset to manual tab
    setActiveTab("manual");
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Plus className="text-primary h-5 w-5" />
            Add Delivery Ticket
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter ticket details manually or upload for AI analysis
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="manual"
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "manual" | "ai")}
        >
          <TabsList className="w-full">
            <TabsTrigger value="manual" className="flex-1">
              <Edit className="mr-2 h-4 w-4" />
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex-1">
              <Sparkles className="mr-2 h-4 w-4" />
              AI Analysis
            </TabsTrigger>
          </TabsList>

          {/* Manual Entry Tab */}
          <TabsContent value="manual" className="space-y-4">
            {/* Ticket Number */}
            <div>
              <Label htmlFor="manual-ticketNumber" className="text-foreground font-semibold">
                Ticket Number
              </Label>
              <Input
                id="manual-ticketNumber"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                placeholder="e.g., DTLNO1251452370"
                className="bg-card border-border focus:border-primary text-foreground mt-1"
              />
            </div>

            {/* Origin Address - AUTOCOMPLETE */}
            <div>
              <Label htmlFor="manual-origin" className="text-foreground font-semibold">
                Origin Address *
              </Label>
              <AddressAutocomplete
                value={manualOriginInput}
                onChange={(value) => setManualOriginInput(value)}
                onSelect={(result) => {
                  setOriginAddress(result.displayName);
                  setOriginCoordinates(result.coordinates);
                  setManualOriginInput(result.displayName);
                }}
                placeholder="e.g., 2a. Avenida 18-21, Zona 10..."
                className="mt-1"
              />
              {errors.origin && <p className="text-destructive mt-1 text-xs">{errors.origin}</p>}
              {originCoordinates && (
                <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                  <MapPin className="h-3 w-3" />
                  Coordinates saved
                </p>
              )}
            </div>

            {/* Destination Address - AUTOCOMPLETE */}
            <div>
              <Label htmlFor="manual-destination" className="text-foreground font-semibold">
                Destination Address *
              </Label>
              <AddressAutocomplete
                value={manualDestinationInput}
                onChange={(value) => setManualDestinationInput(value)}
                onSelect={(result) => {
                  setDestinationAddress(result.displayName);
                  setDestinationCoordinates(result.coordinates);
                  setManualDestinationInput(result.displayName);
                }}
                placeholder="e.g., 3AV 10-80 ZONA 10..."
                className="mt-1"
              />
              {errors.destination && (
                <p className="text-destructive mt-1 text-xs">{errors.destination}</p>
              )}
              {destinationCoordinates && (
                <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                  <MapPin className="h-3 w-3" />
                  Coordinates saved
                </p>
              )}
            </div>

            {/* Recipient Name */}
            <div>
              <Label htmlFor="manual-recipientName" className="text-foreground font-semibold">
                Recipient Name
              </Label>
              <Input
                id="manual-recipientName"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g., MISHELL MACARIO"
                className="bg-card border-border focus:border-primary text-foreground mt-1"
              />
            </div>

            {/* Recipient Phone */}
            <div>
              <Label htmlFor="manual-recipientPhone" className="text-foreground font-semibold">
                Recipient Phone
              </Label>
              <Input
                id="manual-recipientPhone"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="e.g., 36076628"
                className="bg-card border-border focus:border-primary text-foreground mt-1"
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="manual-notes" className="text-foreground font-semibold">
                Package Details / Notes
              </Label>
              <Textarea
                id="manual-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Package details, special instructions..."
                rows={2}
                className="bg-card border-border focus:border-primary text-foreground mt-1"
              />
            </div>
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value="ai" className="space-y-4">
            {/* Drag-and-Drop Upload Area */}
            <div>
              <Label className="text-foreground font-semibold">
                Ticket Upload {!previewUrl && "*"}
              </Label>
              {!previewUrl ? (
                <div
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => !isAnalyzing && fileInputRef.current?.click()}
                  className={`mt-2 cursor-pointer rounded-md border-2 border-dashed p-8 transition-all ${
                    isDragging
                      ? "border-primary bg-primary/10 scale-105"
                      : "border-border hover:border-primary/50 bg-card"
                  } ${isAnalyzing ? "cursor-not-allowed opacity-50" : ""} `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    disabled={isAnalyzing}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center text-center">
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="text-primary mb-2 h-12 w-12 animate-spin" />
                        <p className="text-foreground font-semibold">Analyzing Ticket...</p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          Extracting ticket data with AI
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="bg-primary/10 mb-3 rounded-full p-4">
                          <Upload className="text-primary h-8 w-8" />
                        </div>
                        <p className="text-foreground font-semibold">
                          {isDragging ? "Drop ticket here" : "Upload Ticket Photo or PDF"}
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          Drag and drop or click to select
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          Supports JPG, PNG, PDF (max 10MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative mt-2">
                  <Image
                    src={previewUrl}
                    alt="Ticket Preview"
                    width={400}
                    height={300}
                    className="w-full rounded-md object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveImage}
                    disabled={isAnalyzing}
                    className="absolute top-2 right-2"
                  >
                    <X className="mr-1 h-4 w-4" />
                    Remove & Reset
                  </Button>
                  {isAnalyzing && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/50">
                      <div className="text-center">
                        <Loader2 className="mx-auto mb-2 h-12 w-12 animate-spin text-white" />
                        <p className="font-semibold text-white">Analyzing...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Ticket Fields - Auto-filled by AI, editable by user */}
            {previewUrl && !isAnalyzing && (
              <>
                <div className="border-border border-t pt-4">
                  <p className="text-foreground mb-3 text-sm font-semibold">
                    Review & Edit Extracted Data
                  </p>
                </div>

                {/* Ticket Number */}
                <div>
                  <Label htmlFor="ticketNumber" className="text-foreground font-semibold">
                    Ticket Number
                  </Label>
                  <Input
                    id="ticketNumber"
                    value={ticketNumber}
                    onChange={(e) => setTicketNumber(e.target.value)}
                    placeholder="e.g., DTLNO1251452370"
                    className="bg-card border-border focus:border-primary text-foreground mt-1"
                  />
                </div>

                {/* Origin Address */}
                <div>
                  <Label htmlFor="origin" className="text-foreground font-semibold">
                    Origin Address *
                  </Label>
                  <Textarea
                    id="origin"
                    value={originAddress}
                    onChange={(e) => setOriginAddress(e.target.value)}
                    placeholder="e.g., 2a. Avenida 18-21, Zona 10..."
                    rows={3}
                    className="bg-card border-border focus:border-primary text-foreground mt-1"
                  />
                  {errors.origin && (
                    <p className="text-destructive mt-1 text-xs">{errors.origin}</p>
                  )}
                </div>

                {/* Destination Address */}
                <div>
                  <Label htmlFor="destination" className="text-foreground font-semibold">
                    Destination Address *
                  </Label>
                  <Textarea
                    id="destination"
                    value={destinationAddress}
                    onChange={(e) => setDestinationAddress(e.target.value)}
                    placeholder="e.g., 3AV 10-80 ZONA 10..."
                    rows={3}
                    className="bg-card border-border focus:border-primary text-foreground mt-1"
                  />
                  {errors.destination && (
                    <p className="text-destructive mt-1 text-xs">{errors.destination}</p>
                  )}
                </div>

                {/* Recipient Name */}
                <div>
                  <Label htmlFor="recipientName" className="text-foreground font-semibold">
                    Recipient Name
                  </Label>
                  <Input
                    id="recipientName"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g., MISHELL MACARIO"
                    className="bg-card border-border focus:border-primary text-foreground mt-1"
                  />
                </div>

                {/* Recipient Phone */}
                <div>
                  <Label htmlFor="recipientPhone" className="text-foreground font-semibold">
                    Recipient Phone
                  </Label>
                  <Input
                    id="recipientPhone"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="e.g., 36076628"
                    className="bg-card border-border focus:border-primary text-foreground mt-1"
                  />
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes" className="text-foreground font-semibold">
                    Package Details / Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Package details, special instructions..."
                    rows={2}
                    className="bg-card border-border focus:border-primary text-foreground mt-1"
                  />
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isAnalyzing}
            className="border-border text-foreground"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isAnalyzing || !originAddress.trim() || !destinationAddress.trim()}
            className="bg-primary hover:bg-primary/90 font-semibold text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
