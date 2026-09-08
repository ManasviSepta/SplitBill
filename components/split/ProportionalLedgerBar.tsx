import React from "react";
import { Info } from "lucide-react";
import { ParticipantBreakdown } from "@/types/people";

interface ProportionalLedgerBarProps {
  breakdown: ParticipantBreakdown[];
  onToggleAlgorithmMath: () => void;
}

export function ProportionalLedgerBar({
  breakdown,
  onToggleAlgorithmMath,
}: ProportionalLedgerBarProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-5 flex flex-col gap-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Proportional Split Ledger</span>
        </div>

        <button
          type="button"
          onClick={onToggleAlgorithmMath}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
        >
          <span>View Algorithm Math</span>
          <Info className="w-3 h-3" />
        </button>
      </div>

      {/* Multi-segment Stacked Bar */}
      <div className="w-full h-3 rounded-full overflow-hidden bg-slate-100 flex">
        {breakdown.map((p) => {
          if (p.percentageOfBill <= 0) return null;
          return (
            <div
              key={p.participantId}
              style={{
                width: `${p.percentageOfBill}%`,
                backgroundColor: p.color,
              }}
              title={`${p.name}: ${p.percentageOfBill}%`}
              className="h-full transition-all hover:opacity-90"
            />
          );
        })}
      </div>

      {/* Legend Dots */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-medium text-slate-600">
        {breakdown.map((p) => (
          <div key={p.participantId} className="flex items-center gap-1.5">
            <span
              style={{ backgroundColor: p.color }}
              className="w-2 h-2 rounded-full shrink-0"
            />
            <span>
              {p.name}
              {p.isYou ? " (You)" : ""}:{" "}
              <strong className="text-slate-800">{p.percentageOfBill}%</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
