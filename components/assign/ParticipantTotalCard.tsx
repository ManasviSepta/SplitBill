import React from "react";
import { ParticipantBreakdown } from "@/types/people";
import { ParticipantAvatar } from "@/components/people/ParticipantAvatar";

interface ParticipantTotalCardProps {
  participant: ParticipantBreakdown;
  isTopShare?: boolean;
}

export function ParticipantTotalCard({
  participant,
  isTopShare = false,
}: ParticipantTotalCardProps) {
  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getDishesPreview = () => {
    if (participant.itemCount === 0) return "No dishes assigned yet";
    const firstTwo = participant.itemNames
      .slice(0, 2)
      .map((name) => name.split(" ")[0])
      .join(", ");
    const remaining = participant.itemCount - 2;
    if (remaining > 0) {
      return `${participant.itemCount} items (${firstTwo}, +${remaining})`;
    }
    return `${participant.itemCount} items (${firstTwo})`;
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 transition-all hover:bg-slate-50">
      {/* Left: Avatar & Name */}
      <div className="flex items-center gap-2.5 min-w-0">
        <ParticipantAvatar
          initials={participant.initials}
          color={participant.color}
          size="md"
        />

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
              {participant.name}
            </span>
            {participant.isYou && (
              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-xs bg-emerald-100 text-emerald-800">
                You
              </span>
            )}
            {isTopShare && participant.grandTotal > 0 && (
              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-xs bg-emerald-100 text-emerald-800">
                TOP SHARE
              </span>
            )}
          </div>

          <span className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
            {getDishesPreview()}
          </span>
        </div>
      </div>

      {/* Right: Amount & Percentage */}
      <div className="text-right shrink-0 ml-2">
        <span className="font-black text-xs sm:text-sm text-slate-900 block">
          {formatCurrency(participant.grandTotal)}
        </span>
        <span className="text-[10px] text-slate-400 font-semibold">
          {participant.percentageOfBill}% of bill
        </span>
      </div>
    </div>
  );
}
