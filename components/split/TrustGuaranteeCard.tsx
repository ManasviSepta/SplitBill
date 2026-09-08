import React from "react";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

interface TrustGuaranteeCardProps {
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
}

export function TrustGuaranteeCard({
  isDrawerOpen,
  onToggleDrawer,
}: TrustGuaranteeCardProps) {
  return (
    <div className="rounded-[22px] bg-emerald-50/60 border border-emerald-200/80 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        {/* Sigma Badge */}
        <div className="w-10 h-10 rounded-xl bg-[#16A34A] text-white flex items-center justify-center font-black text-xl shrink-0 shadow-xs">
          Σ
        </div>

        <div className="flex flex-col">
          <h3 className="font-extrabold text-sm sm:text-base text-emerald-950 tracking-tight">
            Transparent Mathematical Trust Guarantee
          </h3>
          <p className="text-xs text-emerald-900/80 leading-relaxed mt-1 max-w-2xl">
            SplitBill distributes overheads (GST, municipal charges, service commissions, and flat discounts) on a strictly proportional basis according to every individual&apos;s net dish consumption. No rounded pennies get lost.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleDrawer}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline shrink-0 cursor-pointer"
      >
        <span>{isDrawerOpen ? "Close Proof Drawer" : "Open Full Calculation Proof Drawer"}</span>
        {isDrawerOpen ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ArrowRight className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}
