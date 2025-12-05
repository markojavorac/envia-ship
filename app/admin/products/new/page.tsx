import { ProductOnboardingWizard } from "@/components/admin/ProductOnboardingWizard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add New Product | Admin - Envia Ship",
  description: "Add a new product to the marketplace using AI-powered onboarding",
};

export default function NewProductPage() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Add New Product</h1>
        <p className="text-muted-foreground">
          Upload product photos and let AI generate your listing automatically
        </p>
      </div>

      {/* Wizard */}
      <ProductOnboardingWizard />
    </div>
  );
}
