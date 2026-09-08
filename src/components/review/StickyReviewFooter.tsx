import React from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSplitStore } from "@/store/useSplitStore";
import { GradientButton } from "@/components/shared/GradientButton";

interface StickyReviewFooterProps {
  itemCount: number;
  grandTotal: number;
}

export function StickyReviewFooter({ itemCount, grandTotal }: StickyReviewFooterProps) {
  const navigate = useNavigate();
  const resetReceipt = useSplitStore((state) => state.resetReceipt);
  const setStep = useSplitStore((state) => state.setStep);

  const handleReupload = () => {
    resetReceipt();
    navigate("/");
  };

  const handleContinue = () => {
    setStep(3);
    navigate("/people");
  };

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="sticky bottom-4 z-30 w-full mt-8">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-card-elevated p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Re-upload button */}
        <button
          type="button"
          onClick={handleReupload}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-[13px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer self-start sm:self-center"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Re-upload Receipt</span>
        </button>

        {/* Center: Info Badge */}
        <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-slate-600 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            <span>{itemCount} items extracted</span>
          </div>
          <span className="text-slate-300">|</span>
          <div>
            Grand total:{" "}
            <span className="font-extrabold text-slate-900">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>

        {/* Right: Confirm & Add People CTA */}
        <GradientButton
          type="button"
          onClick={handleContinue}
          size="md"
          className="w-full sm:w-auto font-bold tracking-tight text-xs sm:text-sm px-6"
        >
          <span>Confirm Bill & Add People</span>
          <ArrowRight className="w-4 h-4" />
        </GradientButton>
      </div>
    </div>
  );
}
