import React from "react";
import { Utensils, FileText, Code2, Sparkles } from "lucide-react";
import { RestaurantInfo } from "@/types/review";

interface RestaurantHeaderProps {
  restaurant: RestaurantInfo;
  onViewScan: () => void;
}

export function RestaurantHeader({ restaurant, onViewScan }: RestaurantHeaderProps) {
  return (
    <div className="bg-white rounded-[24px] border border-slate-200/90 shadow-soft p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Left: Info & Icon */}
      <div className="flex items-start sm:items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
          <Utensils className="w-6 h-6 text-[#16A34A]" />
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {restaurant.name}
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-emerald-600 fill-emerald-600/30" />
              OCR {restaurant.ocrAccuracy}
            </span>
          </div>

          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1">
            {restaurant.location} • {restaurant.timestamp} • {restaurant.billNumber}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <button
          type="button"
          onClick={onViewScan}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs transition-colors cursor-pointer"
        >
          <FileText className="w-4 h-4 text-slate-500" />
          <span>View Scan</span>
        </button>

        <button
          type="button"
          onClick={onViewScan}
          className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          title="Toggle receipt preview"
        >
          <Code2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
