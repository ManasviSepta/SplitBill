import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Copy,
  Receipt,
  Utensils,
  Calculator,
  ArrowRight,
} from "lucide-react";
import { ParticipantBreakdown } from "@/types/people";
import { ReceiptItem } from "@/types/review";
import { ParticipantAvatar } from "@/components/people/ParticipantAvatar";
import { useSplitStore } from "@/store/useSplitStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ParticipantBillingCardProps {
  breakdown: ParticipantBreakdown;
  receiptItems: ReceiptItem[];
  assignments: Record<string, string[]>;
  grandTotal: number;
}

export function ParticipantBillingCard({
  breakdown,
  receiptItems,
  assignments,
  grandTotal,
}: ParticipantBillingCardProps) {
  const {
    organizerId,
    organizerUPI,
    participants,
    participantPaidStatus,
    toggleParticipantPaid,
  } = useSplitStore();

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Determine if this participant is the active organizer
  const activeOrganizer =
    participants.find((p) => p.id === organizerId) ||
    participants.find((p) => p.isYou) ||
    participants[0];

  const isOrganizer = activeOrganizer?.id === breakdown.participantId;
  const isPaid = !!participantPaidStatus[breakdown.participantId];

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const defaultOrganizerUpi = activeOrganizer
    ? `${activeOrganizer.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@oksbi`
    : "organizer@upi";
  const effectiveUpiId = organizerUPI.trim() || defaultOrganizerUpi;

  // Dishes assigned to this participant with fraction calculation
  const assignedDishes = receiptItems
    .filter((item) => (assignments[item.id] || []).includes(breakdown.participantId))
    .map((item) => {
      const diners = assignments[item.id] || [];
      const numDiners = diners.length || 1;
      const shareAmount = item.totalPrice / numDiners;
      const shareFraction = numDiners === 1 ? "1x" : `1/${numDiners} share`;
      return {
        ...item,
        numDiners,
        shareAmount,
        shareFraction,
      };
    });

  const handleWhatsAppReminder = () => {
    const textLines = [
      `Hey ${breakdown.name}! 👋`,
      `Here is your bill breakdown from our meal at the restaurant:`,
      `💰 *Amount Due: ${formatCurrency(breakdown.grandTotal)}*`,
      `📱 Pay to *${activeOrganizer?.name || "Organizer"}* via UPI: *${effectiveUpiId}*`,
      `---------------------------------`,
      ...assignedDishes.map(
        (d) => `• ${d.name} (${d.shareFraction}): ${formatCurrency(d.shareAmount)}`
      ),
      `---------------------------------`,
      `Food Subtotal: ${formatCurrency(breakdown.foodSubtotal)}`,
      `Taxes & Service: ${formatCurrency(breakdown.taxShare + breakdown.serviceShare)}`,
      breakdown.discountShare > 0
        ? `Discount: -${formatCurrency(breakdown.discountShare)}`
        : "",
      `*Total Payable: ${formatCurrency(breakdown.grandTotal)}*`,
    ].filter(Boolean);

    const url = `https://wa.me/?text=${encodeURIComponent(textLines.join("\n"))}`;
    window.open(url, "_blank");
  };

  const handleCopyPersonalSummary = () => {
    const summary = `${breakdown.name}'s Share: ${formatCurrency(
      breakdown.grandTotal
    )} (Food: ${formatCurrency(breakdown.foodSubtotal)}, Taxes: ${formatCurrency(
      breakdown.taxShare + breakdown.serviceShare
    )}) -> Pay via UPI: ${effectiveUpiId}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      toast.success(`Copied settlement details for ${breakdown.name}`);
    }
  };

  const totalOwedByOthers = Math.max(0, grandTotal - breakdown.grandTotal);

  return (
    <div
      className={cn(
        "bg-white rounded-[24px] border shadow-soft p-6 sm:p-7 flex flex-col gap-5 transition-all",
        isOrganizer
          ? "border-emerald-300/80 bg-linear-to-b from-white to-emerald-50/20 shadow-md"
          : isPaid
          ? "border-emerald-200/80 bg-emerald-50/10"
          : "border-slate-200/90 hover:border-slate-300 hover:shadow-card-elevated"
      )}
    >
      {/* 1. Header: Avatar, Name, Status Badge, Payable Amount */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3.5 min-w-0">
          <ParticipantAvatar
            initials={breakdown.initials}
            avatarColor={breakdown.color}
            size="lg"
          />

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 truncate">
                {breakdown.name}
              </h3>

              {isOrganizer ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#16A34A] text-white">
                  <ShieldCheck className="w-3 h-3" />
                  <span>BILL ORGANIZER</span>
                </span>
              ) : (
                /* Payment Status Toggle Chip */
                <button
                  type="button"
                  onClick={() => toggleParticipantPaid(breakdown.participantId)}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full transition-all cursor-pointer",
                    isPaid
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200"
                      : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                  )}
                  title="Click to toggle payment status"
                >
                  {isPaid ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>PAID TO ORGANIZER</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>PENDING PAYMENT</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <span className="text-xs text-slate-500 font-medium mt-0.5">
              {assignedDishes.length} item{assignedDishes.length !== 1 ? "s" : ""} consumed •{" "}
              {breakdown.percentageOfBill}% of total meal
            </span>
          </div>
        </div>

        {/* Amount Highlight */}
        <div className="text-left sm:text-right bg-slate-50/80 border border-slate-200/80 rounded-2xl px-4 py-2 self-start sm:self-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            {isOrganizer ? "NET MEAL SHARE" : "AMOUNT TO PAY"}
          </span>
          <span className="text-2xl sm:text-3xl font-black text-[#16A34A] tracking-tight">
            {formatCurrency(breakdown.grandTotal)}
          </span>
        </div>
      </div>

      {/* 2. If Organizer: Highlight Collector Ledger Summary */}
      {isOrganizer && (
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch justify-between gap-4 text-xs">
          <div className="flex-1 bg-white border border-emerald-100 rounded-xl p-3 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              1. Full Restaurant Bill Paid
            </span>
            <span className="text-base font-black text-slate-900 mt-0.5 block">
              {formatCurrency(grandTotal)}
            </span>
          </div>

          <div className="flex items-center justify-center text-slate-400 font-bold px-1">
            <ArrowRight className="w-4 h-4 hidden sm:block text-emerald-500" />
            <span className="sm:hidden">-</span>
          </div>

          <div className="flex-1 bg-white border border-emerald-100 rounded-xl p-3 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
              2. To Collect from Diners
            </span>
            <span className="text-base font-black text-emerald-700 mt-0.5 block">
              {formatCurrency(totalOwedByOthers)}
            </span>
          </div>

          <div className="flex items-center justify-center text-slate-400 font-bold px-1">
            <ArrowRight className="w-4 h-4 hidden sm:block text-emerald-500" />
            <span className="sm:hidden">=</span>
          </div>

          <div className="flex-1 bg-white border border-emerald-200 rounded-xl p-3 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              3. Your Final Out of Pocket
            </span>
            <span className="text-base font-black text-[#16A34A] mt-0.5 block">
              {formatCurrency(breakdown.grandTotal)}
            </span>
          </div>
        </div>
      )}

      {/* 3. Items Eaten List */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-slate-400">
            <Utensils className="w-3 h-3 text-emerald-600" />
            <span>Items Eaten</span>
          </span>
          <span className="text-slate-400 font-medium">
            Food Subtotal: {formatCurrency(breakdown.foodSubtotal)}
          </span>
        </div>

        {assignedDishes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {assignedDishes.map((dish) => (
              <div
                key={dish.id}
                className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-slate-800 truncate">
                    {dish.name}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.2 rounded-md shrink-0">
                    {dish.shareFraction}
                  </span>
                </div>
                <span className="font-bold text-slate-900 font-mono shrink-0 ml-2">
                  {formatCurrency(dish.shareAmount)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic bg-slate-50 rounded-xl p-3">
            No items individually assigned.
          </p>
        )}
      </div>

      {/* 4. Detailed Cost Breakdown Table */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-2 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Food Subtotal ({breakdown.itemCount} items):</span>
          <span className="font-mono font-bold text-slate-800">
            {formatCurrency(breakdown.foodSubtotal)}
          </span>
        </div>

        {breakdown.taxShare > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>GST &amp; Taxes Share (Proportional):</span>
            <span className="font-mono font-bold text-slate-800">
              +{formatCurrency(breakdown.taxShare)}
            </span>
          </div>
        )}

        {breakdown.serviceShare > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>Service Charge Share:</span>
            <span className="font-mono font-bold text-slate-800">
              +{formatCurrency(breakdown.serviceShare)}
            </span>
          </div>
        )}

        {breakdown.discountShare > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>Bill Discount Share:</span>
            <span className="font-mono font-bold">
              -{formatCurrency(breakdown.discountShare)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-extrabold text-sm text-slate-900">
          <span>{isOrganizer ? "Your Net Out-of-Pocket:" : "Final Total Payable:"}</span>
          <span className="text-[#16A34A] text-base font-black">
            {formatCurrency(breakdown.grandTotal)}
          </span>
        </div>
      </div>

      {/* 5. View Calculation Accordion & WhatsApp Reminder Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Accordion Toggle */}
        <button
          type="button"
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer self-start"
        >
          <Calculator className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isDetailsOpen ? "Hide calculation math" : "View calculation math"}</span>
          {isDetailsOpen ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleCopyPersonalSummary}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Copy breakdown text"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Copy</span>
          </button>

          {!isOrganizer && (
            <button
              type="button"
              onClick={handleWhatsAppReminder}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Send WhatsApp Note</span>
            </button>
          )}
        </div>
      </div>

      {/* Expandable Calculation Math Details */}
      {isDetailsOpen && (
        <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 text-xs font-mono flex flex-col gap-2">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
            Fair Share Algorithm Breakdown
          </span>
          <p className="text-[11px] text-slate-300">
            • Food Subtotal Contribution: ₹{breakdown.foodSubtotal.toFixed(2)} (
            {breakdown.percentageOfBill}% of total items)
          </p>
          <p className="text-[11px] text-slate-300">
            • Tax Allocation: ({breakdown.percentageOfBill}% × GST Total) = ₹
            {breakdown.taxShare.toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-300">
            • Service Charge Allocation: ({breakdown.percentageOfBill}% × Service Total) = ₹
            {breakdown.serviceShare.toFixed(2)}
          </p>
          {breakdown.discountShare > 0 && (
            <p className="text-[11px] text-slate-300">
              • Discount Allocation: -({breakdown.percentageOfBill}% × Discount Total) = -₹
              {breakdown.discountShare.toFixed(2)}
            </p>
          )}
          <div className="pt-2 border-t border-slate-700 font-bold text-white flex justify-between">
            <span>Result:</span>
            <span>₹{breakdown.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
