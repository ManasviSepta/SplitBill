import React from "react";
import { Link2, MessageSquare, Download, UtensilsCrossed } from "lucide-react";
import { RestaurantInfo } from "@/types/review";
import { toast } from "sonner";

interface RestaurantSummaryProps {
  restaurant: RestaurantInfo;
  grandTotal: number;
  peopleCount: number;
  itemCount: number;
  onCopyAllUPI: () => void;
  onShareWhatsApp: () => void;
  onDownloadReceipt: () => void;
}

export function RestaurantSummary({
  restaurant,
  grandTotal,
  peopleCount,
  itemCount,
  onCopyAllUPI,
  onShareWhatsApp,
  onDownloadReceipt,
}: RestaurantSummaryProps) {
  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-[24px] border border-slate-200/90 shadow-soft p-6 sm:p-7 flex flex-col gap-6">
      {/* Top Header & Total */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-600" />
            <span>DINING EXPENSE REPORT • {currentDate}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {restaurant.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            • {peopleCount} People • {itemCount} Line Items • Verified by SplitBill Engine
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            TOTAL BILL SETTLED
          </span>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight text-[#16A34A]">
            {formatCurrency(grandTotal)}
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onCopyAllUPI}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer"
        >
          <Link2 className="w-4 h-4 text-emerald-600" />
          <span>Copy All UPI Links</span>
        </button>

        <button
          type="button"
          onClick={onShareWhatsApp}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <span>Share on WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={onDownloadReceipt}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Download Receipt</span>
        </button>
      </div>
    </div>
  );
}
