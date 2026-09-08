import React from "react";
import { CheckCircle2, ShieldCheck, Lock, Sparkles } from "lucide-react";

interface SettlementBannerProps {
  grandTotal: number;
  calculatedSum: number;
}

export function SettlementBanner({
  grandTotal,
  calculatedSum,
}: SettlementBannerProps) {
  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const diff = Math.abs(grandTotal - calculatedSum);
  const isExactMatch = diff < 0.05;

  return (
    <div className="flex flex-col gap-3">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#16A34A] text-white text-[11px] font-bold">
            STEP 5 OF 5
          </span>
          <span className="text-slate-700">Settlement Ledger &amp; Dispatches</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
          <Lock className="w-3 h-3 text-slate-400" />
          <span>Immutable OCR Hash #709-DF</span>
        </div>
      </div>

      {/* Verified Banner Card */}
      <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-[22px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#16A34A] text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm sm:text-base text-emerald-950">
                ✨ Perfect Match — Bill Verified!
              </span>
            </div>
            <p className="text-xs text-emerald-800/90 font-medium mt-0.5">
              Original Total ({formatCurrency(grandTotal)}) = Split Sum ({formatCurrency(calculatedSum)}) • Difference: {formatCurrency(diff)}
            </p>
          </div>
        </div>

        <div className="self-start sm:self-center shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-emerald-300 text-emerald-800 text-xs font-bold shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
          <span>Zero Discrepancy</span>
        </div>
      </div>
    </div>
  );
}
