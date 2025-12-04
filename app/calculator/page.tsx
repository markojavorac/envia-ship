import type { Metadata } from "next";
import { Calculator, Package, MapPin, Zap, Info } from "lucide-react";
import CalculatorTabs from "@/components/calculator/CalculatorTabs";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Shipping Calculator | ENVÍA de Guatemala",
  description:
    "Calculate shipping costs for your packages in Guatemala City. Get instant quotes for Express, Standard, and International delivery services.",
};

export default function CalculatorPage() {
  return (
    <div className="flex flex-col">
      {/* Vibrant Intro Section */}
      <section className="text-white py-8 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full flex items-center justify-center bg-primary">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl font-heading text-white">
                  Shipping Calculator
                </h1>
                <p className="text-sm text-white/80">
                  Get instant shipping quotes for Guatemala City
                </p>
              </div>
            </div>

            {/* Quick Guide Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
              <Card className="border-2 bg-white/10 border-primary/30">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/20">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white mb-1">Package Details</h3>
                    <p className="text-xs text-white/70">Enter dimensions (L×W×H) and weight in kg</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 bg-white/10 border-primary/30">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/20">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white mb-1">Locations</h3>
                    <p className="text-xs text-white/70">Select pickup and drop-off zones in Guatemala City</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 bg-white/10 border-primary/30">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/20">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white mb-1">Service Type</h3>
                    <p className="text-xs text-white/70">Choose Express, Standard, or International</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Form Section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            {/* Calculator Form with AI Analysis */}
            <CalculatorTabs />

            <Separator className="my-8 bg-border opacity-30" />

            {/* Info Section */}
            <Card className="border-2 bg-white border-secondary/25">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10">
                    <Info className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <h2 className="text-lg font-semibold text-secondary">
                      How Our Calculator Works
                    </h2>
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>
                        <strong className="text-secondary">Dimensional Weight:</strong> We calculate both
                        actual weight and dimensional weight (L × W × H ÷ 5000) and
                        charge based on whichever is greater.
                      </p>
                      <div>
                        <p className="font-semibold mb-2 text-secondary">Service Types:</p>
                        <div className="grid gap-2">
                          <div className="flex items-start gap-2 p-2 rounded-lg border-l-2 bg-primary/10 border-primary">
                            <strong className="text-primary">Express:</strong>
                            <span>1-2 day delivery within Guatemala City</span>
                          </div>
                          <div className="flex items-start gap-2 p-2 rounded-lg border-l-2 bg-primary/10 border-primary">
                            <strong className="text-primary">Standard:</strong>
                            <span>3-5 day reliable delivery</span>
                          </div>
                          <div className="flex items-start gap-2 p-2 rounded-lg border-l-2 bg-secondary/10 border-secondary">
                            <strong className="text-secondary">International:</strong>
                            <span>5-10 day cross-border shipping</span>
                          </div>
                        </div>
                      </div>
                      <p>
                        <strong className="text-secondary">Base Rate:</strong> Starting at Q15 per kg with a
                        minimum charge of Q25 per shipment.
                      </p>
                      <p className="text-xs italic p-3 rounded-lg border bg-primary/10 border-primary/30">
                        All prices are in GTQ (Guatemalan Quetzal). This is an MVP
                        calculator for demonstration purposes. Contact us for
                        official quotes.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
