import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Utensils,
  ChevronDown,
  ChevronUp,
  Calculator,
} from "lucide-react";
import { ParticipantBreakdown } from "@/types/people";
import { ReceiptItem } from "@/types/review";
import { ParticipantAvatar } from "@/components/people/ParticipantAvatar";
import { useSplitStore } from "@/store/useSplitStore";
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
  const { organizerId, participants } = useSplitStore();
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine if this participant is the active organizer
  const activeOrganizer =
    participants.find((p) => p.id === organizerId) ||
    participants.find((p) => p.isYou) ||
    participants[0];

  const isOrganizer = activeOrganizer?.id === breakdown.participantId;

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "bg-white rounded-[24px] border shadow-soft p-5 sm:p-6 flex flex-col gap-4 transition-all hover:shadow-card-elevated",
        isOrganizer
          ? "border-emerald-300/80 bg-linear-to-b from-white to-emerald-50/10 shadow-sm"
          : "border-slate-200/90 hover:border-slate-300"
      )}
    >
      {/* 1. Header: Avatar, Name, Role Badge, Final Amount */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
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

              {isOrganizer && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#16A34A] text-white">
                  <ShieldCheck className="w-3 h-3" />
                  <span>PAID THE RESTAURANT</span>
                </span>
              )}
            </div>

            <span className="text-xs text-slate-500 font-medium mt-0.5">
              {assignedDishes.length} item{assignedDishes.length !== 1 ? "s" : ""} consumed •{" "}
              {breakdown.percentageOfBill}% of total meal
            </span>
          </div>
        </div>

        {/* Final Amount Owed / Share */}
        <div className="text-left sm:text-right bg-slate-50/80 border border-slate-200/80 rounded-2xl px-4 py-2 self-start sm:self-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            {isOrganizer ? "NET SHARE" : "AMOUNT TO PAY"}
          </span>
          <span className="text-2xl sm:text-3xl font-black text-[#16A34A] tracking-tight">
            {formatCurrency(breakdown.grandTotal)}
          </span>
        </div>
      </div>

      {/* 2. Items Eaten List */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-slate-400">
            <Utensils className="w-3 h-3 text-emerald-600" />
            <span>Items Eaten</span>
          </span>
          <span className="text-slate-400 font-medium text-[11px]">
            Subtotal: {formatCurrency(breakdown.foodSubtotal)}
          </span>
        </div>

        {assignedDishes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {assignedDishes.map((dish) => (
              <div
                key={dish.id}
                className="flex items-center justify-between bg-slate-50 border border-slate-200/70 rounded-xl px-3 py-2 text-xs"
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
          <p className="text-xs text-slate-400 italic bg-slate-50 rounded-xl p-2.5">
            No items individually assigned.
          </p>
        )}
      </div>

      {/* 3. Detailed Cost Breakdown Table (Food, GST, Service, Discount, Final Amount) */}
      <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-2 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Food Subtotal ({breakdown.itemCount} items):</span>
          <span className="font-mono font-bold text-slate-800">
            {formatCurrency(breakdown.foodSubtotal)}
          </span>
        </div>

        {breakdown.taxShare > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>GST Share (Proportional):</span>
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
            <span>Discount Share:</span>
            <span className="font-mono font-bold">
              -{formatCurrency(breakdown.discountShare)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-extrabold text-sm text-slate-900">
          <span>{isOrganizer ? "Net Out-of-Pocket Share:" : "Final Payable Amount:"}</span>
          <span className="text-[#16A34A] text-base font-black">
            {formatCurrency(breakdown.grandTotal)}
          </span>
        </div>
      </div>

      {/* 4. Accordion: View Billing Calculation Details */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <Calculator className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isExpanded ? "Hide calculation breakdown" : "View calculation details"}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 bg-slate-900 text-slate-200 rounded-xl p-3.5 text-xs font-mono flex flex-col gap-1.5 overflow-hidden"
            >
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                Fair Share Algorithm
              </span>
              <p className="text-[11px] text-slate-300">
                • Food share: ₹{breakdown.foodSubtotal.toFixed(2)} ({breakdown.percentageOfBill}% of meal)
              </p>
              <p className="text-[11px] text-slate-300">
                • Tax allocation: ({breakdown.percentageOfBill}% × GST) = ₹{breakdown.taxShare.toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-300">
                • Service fee: ({breakdown.percentageOfBill}% × Service) = ₹{breakdown.serviceShare.toFixed(2)}
              </p>
              {breakdown.discountShare > 0 && (
                <p className="text-[11px] text-slate-300">
                  • Discount: -({breakdown.percentageOfBill}% × Discount) = -₹{breakdown.discountShare.toFixed(2)}
                </p>
              )}
              <div className="pt-1.5 border-t border-slate-700 font-bold text-white flex justify-between">
                <span>Total Reconciled:</span>
                <span className="text-emerald-400">₹{breakdown.grandTotal.toFixed(2)}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
