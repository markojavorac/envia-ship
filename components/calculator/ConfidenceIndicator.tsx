interface ConfidenceIndicatorProps {
  confidence: number; // 0-1
  label?: string;
}

export default function ConfidenceIndicator({
  confidence,
  label,
}: ConfidenceIndicatorProps) {
  const percentage = Math.round(confidence * 100);
  const color =
    confidence >= 0.7
      ? "bg-green-500"
      : confidence >= 0.4
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className="space-y-1">
      {label && <p className="text-xs text-muted-foreground">{label}</p>}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${color} transition-all`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-muted-foreground">
          {percentage}%
        </span>
      </div>
    </div>
  );
}
