import React, { useState } from "react";
import { ChevronDown, ChevronUp, Copy, MessageSquare, Shield, Check } from "lucide-react";
import { ParticipantBreakdown } from "@/types/people";
import { ReceiptItem } from "@/types/review";
import { ParticipantAvatar } from "@/components/people/ParticipantAvatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ParticipantAmountCardProps {
  breakdown: ParticipantBreakdown;
  receiptItems: ReceiptItem[];
  assignments: Record<string, string[]>;
  isTopShare?: boolean;
  grandTotal: number;
}

export function ParticipantAmountCard({
  breakdown,
  receiptItems,
  assignments,
  isTopShare = false,
  grandTotal,
}: ParticipantAmountCardProps) {
  const [isExpanded, setIsExpanded] = useState(breakdown.isYou || false);

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Extract detailed dishes assigned to this participant
  const participantDishes = receiptItems
    .filter((item) => (assignments[item.id] || []).includes(breakdown.participantId))
    .map((item) => {
      const diners = assignments[item.id] || [];
      const count = diners.length || 1;
      const share = item.totalPrice / count;
      const fractionLabel = count === 1 ? "1 portion" : `1/${count} portion`;
      return {
        item,
        portionCount: count,
        fractionLabel,
        personalCost: share,
      };
    });

  const handleCopyUPI = () => {
    const upiLink = `upi://pay?pa=${breakdown.initials.toLowerCase()}@bank&pn=${encodeURIComponent(
      breakdown.name
    )}&am=${breakdown.grandTotal}&cu=INR`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(upiLink);
      toast.success(`UPI link copied for ${breakdown.name}`);
    }
  };

  const handleWhatsAppReminder = () => {
    const text = `Hey ${breakdown.name}, your share for the meal is ${formatCurrency(
      breakdown.grandTotal
    )}. Please UPI when you get a chance!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const collectAmount = Math.max(0, grandTotal - breakdown.grandTotal);

  return (
    <div className="bg-white rounded-[22px] border border-slate-200/90 shadow-soft overflow-hidden transition-all hover:border-slate-300 hover:shadow-card-elevated">
      {/* Top Main Row */}
      <div className="p-5 flex flex-col gap-3.5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <ParticipantAvatar
              initials={breakdown.initials}
              color={breakdown.color}
              size="md"
            />

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                  {breakdown.name}
                </span>

                {breakdown.isYou && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#16A34A] text-white">
                    <Shield className="w-2.5 h-2.5" />
                    <span>YOU (ORGANIZER)</span>
                  </span>
                )}

                {isTopShare && !breakdown.isYou && (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    TOP SHARE
                  </span>
                )}
              </div>

              <span className="text-xs text-slate-400 font-medium mt-0.5">
                {breakdown.isYou
                  ? "Direct payer of master restaurant card"
                  : `${breakdown.name.toLowerCase().replace(/\s+/g, ".")}@upi • ${breakdown.itemCount} items`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {breakdown.isYou ? "YOUR SHARE" : "CALCULATED DUE"}
              </span>
              <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {formatCurrency(breakdown.grandTotal)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer ml-1"
              title={isExpanded ? "Collapse details" : "Expand details"}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Breakdown Badges Strip */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5">
          <span>Food: {formatCurrency(breakdown.foodSubtotal)}</span>
          <span className="text-slate-300">•</span>
          <span>+ GST: +{formatCurrency(breakdown.taxShare)}</span>
          <span className="text-slate-300">•</span>
          <span>+ Service: +{formatCurrency(breakdown.serviceShare)}</span>
          {breakdown.discountShare > 0 && (
            <>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700">
                - Disc: -{formatCurrency(breakdown.discountShare)}
              </span>
            </>
          )}
        </div>

        {/* Dish Portion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {participantDishes.map((d) => (
            <span
              key={d.item.id}
              className="inline-flex items-center text-[11px] font-medium bg-slate-100 border border-slate-200/80 text-slate-700 px-2 py-0.5 rounded-lg"
            >
              {d.item.name} ({d.portionCount === 1 ? "1" : `1/${d.portionCount}`})
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        {!breakdown.isYou && (
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCopyUPI}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy UPI Pay Link ({formatCurrency(breakdown.grandTotal)})</span>
            </button>

            <button
              type="button"
              onClick={handleWhatsAppReminder}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Reminder</span>
            </button>
          </div>
        )}
      </div>

      {/* Expanded Detailed Calculation Table */}
      {isExpanded && (
        <div className="bg-slate-50/70 border-t border-slate-200/80 p-5 flex flex-col gap-4 animate-in fade-in duration-200">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            ITEMIZED PROPORTIONAL BREAKDOWN
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-left font-semibold">
                  <th className="pb-2">Item Name</th>
                  <th className="pb-2">Fraction</th>
                  <th className="pb-2 text-right">Dish Total</th>
                  <th className="pb-2 text-right">Personal Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60">
                {participantDishes.map((d) => (
                  <tr key={d.item.id} className="text-slate-700">
                    <td className="py-2 font-medium">{d.item.name}</td>
                    <td className="py-2 text-slate-500">{d.fractionLabel}</td>
                    <td className="py-2 text-right font-medium text-slate-500">
                      {formatCurrency(d.item.totalPrice)}
                    </td>
                    <td className="py-2 text-right font-bold text-slate-900">
                      {formatCurrency(d.personalCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subtotal & Taxes Breakdown List */}
          <div className="border-t border-slate-200 pt-3 flex flex-col gap-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Raw Food Subtotal:</span>
              <span className="font-bold text-slate-900">
                {formatCurrency(breakdown.foodSubtotal)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Proportional GST + Taxes:</span>
              <span className="font-semibold">
                +{formatCurrency(breakdown.taxShare)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Proportional Service Fee:</span>
              <span className="font-semibold">
                +{formatCurrency(breakdown.serviceShare)}
              </span>
            </div>
            {breakdown.discountShare > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Proportional Discount:</span>
                <span>-{formatCurrency(breakdown.discountShare)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-slate-200 font-black text-slate-900 text-sm">
              <span>Net Share Obligation:</span>
              <span className="text-[#16A34A]">
                {formatCurrency(breakdown.grandTotal)}
              </span>
            </div>
          </div>

          {/* Organizer Collect Note */}
          {breakdown.isYou && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
              <Check className="w-4 h-4 text-[#16A34A] shrink-0" />
              <span>
                Since you paid the master restaurant card ({formatCurrency(grandTotal)}),
                you will collect <strong>{formatCurrency(collectAmount)}</strong> from dining companions.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
