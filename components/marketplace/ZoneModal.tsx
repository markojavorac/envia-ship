"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MapPin, Package } from "lucide-react";
import { GUATEMALA_ZONES } from "@/lib/types";
import { useMarketplace } from "@/contexts/MarketplaceContext";

export function ZoneModal() {
  const { showZoneModal, setShowZoneModal, setUserZone } = useMarketplace();
  const [selectedZone, setSelectedZone] = useState<string>("");

  const handleConfirm = () => {
    if (selectedZone) {
      setUserZone(selectedZone);
    }
  };

  return (
    <Dialog open={showZoneModal} onOpenChange={setShowZoneModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-secondary">
            Welcome to Marketplace
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Select your delivery zone to see accurate shipping estimates for all products
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-secondary">
              Delivery Zone
            </label>
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger className="w-full bg-white border-2 border-gray-200 focus:border-primary focus:ring-primary/20">
                <SelectValue placeholder="Select your zone..." />
              </SelectTrigger>
              <SelectContent>
                {GUATEMALA_ZONES.map((zone) => (
                  <SelectItem key={zone.value} value={zone.value}>
                    {zone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-4">
            <div className="flex gap-3">
              <Package className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-secondary">
                  Why do we need this?
                </p>
                <p className="text-xs text-gray-600">
                  Your zone helps us calculate accurate shipping costs and delivery times for each product. You can change it anytime.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowZoneModal(false)}
            className="flex-1 border-2 border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Browse Without Zone
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedZone}
            className="flex-1 bg-primary text-white hover:bg-primary/90 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
