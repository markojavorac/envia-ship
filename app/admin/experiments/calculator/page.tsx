"use client";

import { Info } from "lucide-react";
import { AdminPageTitle, AdminCard, AdminCardContent, AdminInfoBox } from "@/components/admin/ui";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import CalculatorTabs from "@/components/calculator/CalculatorTabs";
import Link from "next/link";

export default function ExperimentalCalculatorPage() {
  return (
    <div className="flex flex-col gap-6 pb-20 md:pb-6">
      {/* Mobile Header with Breadcrumbs */}
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger />
        <div className="flex items-center gap-2 text-sm">
          <Link href="/admin/experiments" className="text-muted-foreground hover:text-foreground">
            Experiments
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-semibold">Shipping Calculator</span>
        </div>
      </div>

      {/* Desktop Header */}
      <AdminPageTitle
        title="Shipping Calculator"
        description="AI-powered package analysis and shipping cost estimation"
      />

      {/* Info Banner */}
      <AdminInfoBox variant="warning">
        <strong>Experimental Feature:</strong> This calculator is for testing purposes. All pricing
        and AI analysis results are estimates and should be verified before providing to customers.
      </AdminInfoBox>

      {/* Calculator Interface */}
      <div className="mx-auto w-full max-w-3xl">
        <CalculatorTabs />

        <Separator className="my-8" />

        {/* How It Works */}
        <AdminCard icon={Info} title="How This Calculator Works">
          <AdminCardContent>
            <div className="text-muted-foreground space-y-3 text-sm">
              <p>
                <strong className="text-foreground">Dimensional Weight:</strong> We calculate both
                actual weight and dimensional weight (L × W × H ÷ 5000) and charge based on
                whichever is greater.
              </p>
              <div>
                <p className="text-foreground mb-2 font-semibold">Service Types:</p>
                <div className="grid gap-2">
                  <AdminInfoBox variant="info">
                    <strong>Express:</strong> 1-2 day delivery within Guatemala City
                  </AdminInfoBox>
                  <AdminInfoBox variant="info">
                    <strong>Standard:</strong> 3-5 day reliable delivery
                  </AdminInfoBox>
                  <AdminInfoBox variant="info">
                    <strong>International:</strong> 5-10 day cross-border shipping
                  </AdminInfoBox>
                </div>
              </div>
              <p>
                <strong className="text-foreground">Base Rate:</strong> Starting at Q15 per kg with
                a minimum charge of Q25 per shipment.
              </p>
            </div>
          </AdminCardContent>
        </AdminCard>
      </div>
    </div>
  );
}
