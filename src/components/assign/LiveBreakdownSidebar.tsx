import React from "react";
import { ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSplitStore } from "@/store/useSplitStore";
import { ParticipantTotalCard } from "./ParticipantTotalCard";
import { TaxDistributionCard } from "./TaxDistributionCard";
import { AllocationProgress } from "./AllocationProgress";
import { GradientButton } from "@/components/shared/GradientButton";
import { toast } from "sonner";

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

  const handleCalculateFinalSplit = () => {
    if (!stats.isFullyAllocated) {
      toast.warning(
        `${stats.unassignedItemsCount} item${
          stats.unassignedItemsCount > 1 ? "s" : ""
        } haven't been assigned yet. Tap diner avatars to assign all items before finalizing.`,
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
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>{stats.unassignedItemsCount} unassigned</span>
            </div>
          )}
        </div>

        {/* Allocation Progress Bar */}
        <AllocationProgress stats={stats} totalBill={charges.subtotal} />

        {/* Participant Running Totals List */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span className="uppercase tracking-wider">RUNNING TOTALS</span>
            <span className="text-[11px] text-slate-400 font-medium">
              Ranked by share
            </span>
          </div>

          <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
            {breakdown.map((p, idx) => (
              <ParticipantTotalCard
                key={p.participantId}
                participant={p}
                isTopShare={idx === 0}
              />
            ))}
          </div>
        </div>

        {/* Tax & Service Proportional Distribution Card */}
        <TaxDistributionCard charges={charges} />

        {/* Bottom CTA Button */}
        <div className="pt-2 flex flex-col gap-2">
          <GradientButton
            type="button"
            onClick={handleCalculateFinalSplit}
            disabled={!stats.isFullyAllocated}
            size="lg"
            className="w-full font-bold text-xs sm:text-sm py-3.5 shadow-soft flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>Calculate Final Bill Split</span>
            <ArrowRight className="w-4 h-4" />
          </GradientButton>

          {!stats.isFullyAllocated && (
            <p className="text-[11px] text-center text-amber-700 font-medium">
              Assign all {stats.unassignedItemsCount} remaining dish
              {stats.unassignedItemsCount > 1 ? "es" : ""} to proceed
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
