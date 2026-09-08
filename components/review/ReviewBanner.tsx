import React from "react";
import { AlertCircle, AlertTriangle, ArrowDown, CheckCircle } from "lucide-react";
import { ReceiptItem } from "@/types/review";

interface ReviewBannerProps {
  flaggedItems: ReceiptItem[];
  hasDiscrepancy?: boolean;
  discrepancyWarning?: string | null;
  onJumpToRow?: (itemId?: string) => void;
}

export function ReviewBanner({
  flaggedItems,
  hasDiscrepancy,
  discrepancyWarning,
  onJumpToRow,
}: ReviewBannerProps) {
  // If there's a mathematical difference between receipt total and calculated sum
  if (hasDiscrepancy) {
    return (
      <div className="bg-amber-50 border border-amber-200/90 rounded-[20px] p-4 sm:p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
          </div>

          <div className="flex flex-col">
            <h2 className="text-xs sm:text-sm font-bold text-amber-950">
              Total recalculated from receipt
            </h2>
            <p className="text-[11px] sm:text-xs text-amber-800 font-medium mt-0.5">
              {discrepancyWarning || "The sum of line items + taxes differs slightly from the printed total. Please review values."}
            </p>
          </div>
        </div>

        {flaggedItems.length > 0 && (
          <button
            type="button"
            onClick={() => onJumpToRow?.(flaggedItems[0]?.id)}
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 hover:underline transition-colors shrink-0 cursor-pointer self-end sm:self-center"
          >
            <span>Review flagged items</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  // If there are genuine low/med confidence rows
  if (flaggedItems.length > 0) {
    const itemNames = flaggedItems
      .map((i) => `"${i.name}" (${i.confidenceScore}%)`)
      .slice(0, 3)
      .join(", ");

    return (
      <div className="bg-[#FEF2F2] border border-red-200/80 rounded-[20px] p-4 sm:p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-700 text-white flex items-center justify-center shrink-0 shadow-xs">
            <AlertCircle className="w-4 h-4 stroke-[2.5]" />
          </div>

          <div className="flex flex-col">
            <h2 className="text-xs sm:text-sm font-bold text-red-950">
              Review {flaggedItems.length} item{flaggedItems.length > 1 ? "s" : ""} with flagged OCR confidence
            </h2>
            <p className="text-[11px] sm:text-xs text-red-800/90 font-medium mt-0.5">
              {itemNames} had lower scan confidence. Verify prices before splitting.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onJumpToRow?.(flaggedItems[0]?.id)}
          className="inline-flex items-center gap-1 text-xs font-bold text-red-800 hover:text-red-950 hover:underline transition-colors shrink-0 cursor-pointer self-end sm:self-center"
        >
          <span>Jump to row</span>
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // If all rows are clear, show subtle green verification check
  return (
    <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-[18px] px-4 py-2.5 flex items-center justify-between gap-2 shadow-2xs">
      <div className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0" />
        <span className="text-xs font-semibold text-emerald-900">
          All extracted items verified with high OCR confidence.
        </span>
      </div>
      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
        Ready to Split
      </span>
    </div>
  );
}
