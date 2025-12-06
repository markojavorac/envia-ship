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

export default function PricingResultsCard({ result }: PricingResultsCardProps) {
  if (!result) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="text-muted-foreground/50 mb-3 h-12 w-12" />
          <p className="text-muted-foreground text-sm">
            Fill out the form to calculate shipping cost
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 border-2 bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-primary flex items-center gap-2 text-lg font-bold">
          <Receipt className="h-5 w-5" />
          Shipping Quote
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0">
        {/* Total Price - Large and Prominent */}
        <div className="py-4 text-center">
          <p className="text-muted-foreground mb-2 text-xs tracking-wide uppercase">Total Cost</p>
          <p className="text-primary mb-2 text-5xl font-bold">Q{result.totalPrice.toFixed(2)}</p>
          <Badge variant="secondary" className="text-xs">
            Guatemalan Quetzal
          </Badge>
        </div>

        {/* Estimated Delivery */}
        <div className="bg-background flex items-center gap-3 rounded-lg border p-3">
          <Calendar className="text-primary h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-semibold">Estimated Delivery</p>
            <p className="text-muted-foreground text-sm">{result.estimatedDelivery}</p>
          </div>
        </div>

        <Separator />

        {/* Breakdown */}
        <div>
          <h4 className="mb-3 text-sm font-semibold">Price Breakdown</h4>
          <div className="space-y-2">
            {result.breakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Info note */}
        <div className="text-muted-foreground bg-background/50 rounded-lg border p-3 text-xs">
          <p>
            This is an estimated quote. Final pricing may vary based on actual package inspection
            and delivery requirements.
          </p>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => {
              // For now, we'll save a partial formData object
              // This will be properly connected when we add the calculator context
              saveQuote({}, result);
              toast.success("Quote saved!", {
                description: "Quote saved to your browser",
              });
            }}
          >
            <Bookmark className="h-4 w-4" />
            Save Quote
          </Button>

          <Button variant="outline" asChild>
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
