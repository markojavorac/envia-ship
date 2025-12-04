"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PricingResult } from "@/lib/types";
import { Package, Calendar, Receipt, Bookmark, Phone } from "lucide-react";
import { saveQuote } from "@/lib/storage/quote-storage";
import { toast } from "sonner";

interface PricingResultsCardProps {
  result: PricingResult | null;
}

export default function PricingResultsCard({
  result,
}: PricingResultsCardProps) {
  if (!result) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-12 w-12 mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            Fill out the form to calculate shipping cost
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/30 bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-primary font-bold">
          <Receipt className="h-5 w-5" />
          Shipping Quote
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        {/* Total Price - Large and Prominent */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
            Total Cost
          </p>
          <p className="text-5xl font-bold text-primary mb-2">
            Q{result.totalPrice.toFixed(2)}
          </p>
          <Badge variant="secondary" className="text-xs">
            Guatemalan Quetzal
          </Badge>
        </div>

        {/* Estimated Delivery */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-background border">
          <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-semibold">Estimated Delivery</p>
            <p className="text-sm text-muted-foreground">
              {result.estimatedDelivery}
            </p>
          </div>
        </div>

        <Separator />

        {/* Breakdown */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Price Breakdown</h4>
          <div className="space-y-2">
            {result.breakdown.map((item, index) => (
              <div
                key={index}
                className="flex justify-between text-sm items-center"
              >
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Info note */}
        <div className="text-xs text-muted-foreground bg-background/50 p-3 rounded-lg border">
          <p>
            This is an estimated quote. Final pricing may vary based on actual
            package inspection and delivery requirements.
          </p>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => {
              // For now, we'll save a partial formData object
              // This will be properly connected when we add the calculator context
              saveQuote({}, result);
              toast.success("Quote saved!", {
                description: "Quote saved to your browser"
              });
            }}
          >
            <Bookmark className="h-4 w-4" />
            Save Quote
          </Button>

          <Button
            variant="outline"
            asChild
          >
            <a href="tel:2303-7676" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Sales
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
