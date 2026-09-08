import React from "react";
import { ConfidenceLevel } from "@/types/review";
import { cn } from "@/lib/utils";

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  score?: number;
  className?: string;
}

export function ConfidenceBadge({ level, score, className }: ConfidenceBadgeProps) {
  const configs = {
    high: {
      label: score ? `${score}%` : "High ≥95%",
      styles: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    },
    med: {
      label: score ? `${score}%` : "Med 80–94%",
      styles: "bg-amber-50 text-amber-700 border-amber-200/80",
    },
    low: {
      label: score ? `${score}%` : "Low <80%",
      styles: "bg-rose-50 text-rose-700 border-rose-200/80",
    },
  };

  const config = configs[level] || configs.high;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border",
        config.styles,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export function ConfidenceLegend() {
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
      <span className="text-slate-400">Confidence:</span>
      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-md font-semibold">
        High ≥95%
      </span>
      <span className="bg-amber-50 text-amber-700 border border-amber-200/80 px-2 py-0.5 rounded-md font-semibold">
        Med 80–94%
      </span>
      <span className="bg-rose-50 text-rose-700 border border-rose-200/80 px-2 py-0.5 rounded-md font-semibold">
        Low &lt;80%
      </span>
    </div>
  );
}
