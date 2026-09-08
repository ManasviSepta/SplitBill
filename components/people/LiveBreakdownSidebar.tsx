import React from "react";
import { ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSplitStore } from "@/store/useSplitStore";
import { ParticipantTotalCard } from "./ParticipantTotalCard";
import { TaxDistributionCard } from "./TaxDistributionCard";
import { GradientButton } from "@/components/shared/GradientButton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function LiveBreakdownSidebar() {
  const navigate = useNavigate();
  const {
    charges,
    getParticipantBreakdown,
    getAllocationStats,
    setStep,
  } = useSplitStore();

  const breakdown = getParticipantBreakdown();
  const stats = getAllocationStats();

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleCalculateFinalSplit = () => {
    if (!stats.isFullyAllocated) {
      toast.warning(
        `${stats.unassignedItemsCount} item${
          stats.unassignedItemsCount > 1 ? "s" : ""
        } haven't been assigned yet. Tap diner avatars to assign all items.`,
        { duration: 4000 }
      );
      return;
    }

    setStep(5);
    navigate("/split");
  };

  return (
    <aside className="w-full lg:w-[360px] xl:w-[380px] shrink-0">
      <div className="bg-white rounded-[24px] border border-slate-200/90 shadow-card-elevated p-5 sm:p-6 sticky top-6 flex flex-col gap-5">
        {/* Header: Live Breakdown + Match Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" />
            <span className="font-extrabold text-xs uppercase tracking-wider text-slate-800">
              LIVE BREAKDOWN
            </span>
          </div>

          {stats.isFullyAllocated ? (
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>100% Matched</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>{stats.percentageAllocated}% Assigned</span>
            </div>
          )}
        </div>

        {/* Allocation Progress & Total */}
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200/70 p-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Allocated / Total</span>
            <div className="text-right">
              <span className="font-extrabold text-slate-900 text-sm">
                {formatCurrency(stats.allocatedSubtotal)}
              </span>
              <span className="text-slate-400"> / {formatCurrency(stats.totalSubtotal)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div
              style={{ width: `${stats.percentageAllocated}%` }}
              className={cn(
                "h-full rounded-full transition-all duration-300",
                stats.isFullyAllocated
                  ? "bg-gradient-to-r from-[#16A34A] to-[#22C55E]"
                  : "bg-amber-500"
              )}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>
              {stats.assignedItemsCount} of {stats.totalItems} items assigned
            </span>
            <span
              className={
                stats.unassignedItemsCount === 0
                  ? "text-emerald-700 font-bold"
                  : "text-amber-700 font-bold"
              }
            >
              {stats.unassignedItemsCount === 0
                ? "0 unassigned items"
                : `${stats.unassignedItemsCount} unassigned`}
            </span>
          </div>
        </div>

        {/* Participant Running Totals List */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            <span>Participants</span>
            <span>Subtotal + Taxes</span>
          </div>

          <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-1">
            {breakdown.map((p, idx) => (
              <ParticipantTotalCard
                key={p.participantId}
                participant={p}
                isTopShare={idx === 0}
              />
            ))}
          </div>
        </div>

        {/* Taxes & Service Charge Card */}
        <TaxDistributionCard charges={charges} />

        {/* Validation Warning if Incomplete */}
        {!stats.isFullyAllocated && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {stats.unassignedItemsCount} item
              {stats.unassignedItemsCount > 1 ? "s haven't" : " hasn't"} been assigned yet.
            </span>
          </div>
        )}

        {/* Primary CTA Button */}
        <GradientButton
          type="button"
          onClick={handleCalculateFinalSplit}
          disabled={!stats.isFullyAllocated}
          size="lg"
          className="w-full justify-center shadow-md font-bold tracking-tight text-sm py-3.5"
        >
          <span>Calculate Final Bill &amp; Split Taxes</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </GradientButton>
      </div>
    </aside>
  );
}
