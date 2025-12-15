interface ConfidenceIndicatorProps {
  confidence: number; // 0-1
  label?: string;
}

export default function ConfidenceIndicator({ confidence, label }: ConfidenceIndicatorProps) {
  const percentage = Math.round(confidence * 100);
  const color =
    confidence >= 0.7 ? "bg-green-500" : confidence >= 0.4 ? "bg-yellow-500" : "bg-red-500";

  // Use data attribute to pass percentage to CSS
  return (
    <div className="space-y-1">
      {label && <p className="text-muted-foreground text-xs">{label}</p>}
      <div className="flex items-center gap-2">
        <div className="bg-muted relative h-2 flex-1 overflow-hidden rounded-full">
          <div
            className={`h-full ${color} transition-all`}
            data-percentage={percentage}
            // eslint-disable-next-line custom/no-inline-styles
            style={{ width: `${percentage}%` } as React.CSSProperties}
          />
        </div>
        <span className="text-muted-foreground text-xs font-semibold">{percentage}%</span>
      </div>
    </div>
  );
}
