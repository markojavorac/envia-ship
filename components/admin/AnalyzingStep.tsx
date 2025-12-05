import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyzingStepProps {
  onComplete?: () => void;
}

interface Step {
  id: string;
  label: string;
  duration: number; // milliseconds
}

const ANALYSIS_STEPS: Step[] = [
  { id: "detecting", label: "Detecting product type", duration: 1200 },
  { id: "reading", label: "Reading labels and text", duration: 1500 },
  { id: "measuring", label: "Estimating dimensions", duration: 1000 },
  { id: "generating", label: "Generating descriptions", duration: 1800 },
  { id: "pricing", label: "Suggesting pricing", duration: 800 },
];

export function AnalyzingStep({ onComplete }: AnalyzingStepProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (currentStepIndex >= ANALYSIS_STEPS.length) {
      // All steps complete
      if (onComplete) {
        setTimeout(onComplete, 500);
      }
      return;
    }

    const currentStep = ANALYSIS_STEPS[currentStepIndex];
    const timer = setTimeout(() => {
      setCompletedSteps((prev) => new Set([...prev, currentStep.id]));
      setCurrentStepIndex((prev) => prev + 1);
    }, currentStep.duration);

    return () => clearTimeout(timer);
  }, [currentStepIndex, onComplete]);

  const currentStep = ANALYSIS_STEPS[currentStepIndex];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="h-16 w-16 rounded-md bg-primary flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Analyzing your product photos</h3>
        <p className="text-sm text-muted-foreground">
          Our AI is extracting product information and generating descriptions
        </p>
      </div>

      {/* Progress Steps */}
      <Card className="bg-card border-border rounded-md">
        <CardContent className="pt-4 pb-4 px-4">
          <div className="space-y-3">
            {ANALYSIS_STEPS.map((step, index) => {
              const isCompleted = completedSteps.has(step.id);
              const isCurrent = currentStep?.id === step.id;

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded transition-all",
                    isCurrent && "bg-primary/5"
                  )}
                >
                  {/* Status Icon */}
                  <div
                    className={cn(
                      "flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center transition-colors",
                      isCompleted
                        ? "bg-green-500"
                        : isCurrent
                          ? "bg-primary"
                          : "bg-muted border border-border"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4 text-white" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 text-white animate-spin" />
                    ) : (
                      <span className="text-xs text-muted-foreground">{index + 1}</span>
                    )}
                  </div>

                  {/* Step Label */}
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isCompleted
                        ? "text-green-500"
                        : isCurrent
                          ? "text-primary"
                          : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                    {isCompleted && " ✓"}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{Math.round((completedSteps.size / ANALYSIS_STEPS.length) * 100)}%</span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(completedSteps.size / ANALYSIS_STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
