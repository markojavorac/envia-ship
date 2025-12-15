"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { ShippingFormValues } from "@/lib/validations/shipping-schema";

interface CalculatorContextType {
  formData: Partial<ShippingFormValues>;
  setFormData: (data: Partial<ShippingFormValues>) => void;
  updateFormData: (data: Partial<ShippingFormValues>) => void;
}

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const [formData, setFormDataState] = useState<Partial<ShippingFormValues>>({});

  const setFormData = (data: Partial<ShippingFormValues>) => {
    setFormDataState(data);
  };

  const updateFormData = (data: Partial<ShippingFormValues>) => {
    setFormDataState((prev) => ({ ...prev, ...data }));
  };

  return (
    <CalculatorContext.Provider value={{ formData, setFormData, updateFormData }}>
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculator() {
  const context = useContext(CalculatorContext);
  if (!context) {
    throw new Error("useCalculator must be used within CalculatorProvider");
  }
  return context;
}
