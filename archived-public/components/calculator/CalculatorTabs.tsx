"use client";

import { useState } from "react";
import { Sparkles, Calculator } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalculatorProvider } from "@/contexts/CalculatorContext";
import AIPackageAnalyzer from "./AIPackageAnalyzer";
import ShippingCalculatorForm from "./ShippingCalculatorForm";
import type { ShippingFormValues } from "@/lib/validations/shipping-schema";

export default function CalculatorTabs() {
  const [activeTab, setActiveTab] = useState("ai");
  const [aiFormData, setAiFormData] = useState<Partial<ShippingFormValues>>({});

  const handleAnalysisComplete = (data: Partial<ShippingFormValues>) => {
    setAiFormData(data);
    setActiveTab("manual");
  };

  return (
    <CalculatorProvider>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-2">
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Analysis
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai">
          <AIPackageAnalyzer onAnalysisComplete={handleAnalysisComplete} />
        </TabsContent>

        <TabsContent value="manual">
          <ShippingCalculatorForm initialValues={aiFormData} />
        </TabsContent>
      </Tabs>
    </CalculatorProvider>
  );
}
