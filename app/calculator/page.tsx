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
      <section className="bg-secondary py-8 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-full">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold tracking-tight text-white md:text-3xl">
                  Shipping Calculator
                </h1>
                <p className="text-sm text-white/80">
                  Get instant shipping quotes for Guatemala City
                </p>
              </div>
            </div>

            {/* Quick Guide Cards */}
            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
              <Card className="border-primary/30 border-2 bg-card/10">
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="bg-primary/20 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                    <Package className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-semibold text-white">Package Details</h3>
                    <p className="text-xs text-white/70">
                      Enter dimensions (L×W×H) and weight in kg
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/30 border-2 bg-card/10">
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="bg-primary/20 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                    <MapPin className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-semibold text-white">Locations</h3>
                    <p className="text-xs text-white/70">
                      Select pickup and drop-off zones in Guatemala City
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/30 border-2 bg-card/10">
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="bg-primary/20 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                    <Zap className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-semibold text-white">Service Type</h3>
                    <p className="text-xs text-white/70">
                      Choose Express, Standard, or International
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Form Section */}
      <section className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            {/* Calculator Form with AI Analysis */}
            <CalculatorTabs />

            <Separator className="bg-border my-8 opacity-30" />

            {/* Info Section */}
            <Card className="border-secondary/25 border-2 bg-card">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                    <Info className="text-primary h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <h2 className="text-foreground text-lg font-semibold">
                      How Our Calculator Works
                    </h2>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>
                        <strong className="text-secondary">Dimensional Weight:</strong> We calculate
                        both actual weight and dimensional weight (L × W × H ÷ 5000) and charge
                        based on whichever is greater.
                      </p>
                      <div>
                        <p className="text-secondary mb-2 font-semibold">Service Types:</p>
                        <div className="grid gap-2">
                          <div className="bg-primary/10 border-primary flex items-start gap-2 rounded-lg border-l-2 p-2">
                            <strong className="text-primary">Express:</strong>
                            <span>1-2 day delivery within Guatemala City</span>
                          </div>
                          <div className="bg-primary/10 border-primary flex items-start gap-2 rounded-lg border-l-2 p-2">
                            <strong className="text-primary">Standard:</strong>
                            <span>3-5 day reliable delivery</span>
                          </div>
                          <div className="bg-secondary/10 border-secondary flex items-start gap-2 rounded-lg border-l-2 p-2">
                            <strong className="text-secondary">International:</strong>
                            <span>5-10 day cross-border shipping</span>
                          </div>
                        </div>
                      </div>
                      <p>
                        <strong className="text-secondary">Base Rate:</strong> Starting at Q15 per
                        kg with a minimum charge of Q25 per shipment.
                      </p>
                      <p className="bg-primary/10 border-primary/30 rounded-lg border p-3 text-xs italic">
                        All prices are in GTQ (Guatemalan Quetzal). This is an MVP calculator for
                        demonstration purposes. Contact us for official quotes.
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
