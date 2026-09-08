import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { ReceiptItem } from "@/types/review";
import { Participant } from "@/types/people";
import { ParticipantAvatar } from "@/components/people/ParticipantAvatar";
import { useSplitStore } from "@/store/useSplitStore";
import { cn } from "@/lib/utils";

interface AssignmentCardProps {
  item: ReceiptItem;
  participants: Participant[];
  assignedDinerIds: string[];
}

export function AssignmentCard({
  item,
  participants,
  assignedDinerIds,
}: AssignmentCardProps) {
  const { toggleItemParticipant } = useSplitStore();

  const isNonVeg =
    item.name.toLowerCase().includes("chicken") ||
    item.name.toLowerCase().includes("wings") ||
    item.name.toLowerCase().includes("bbq") ||
    item.name.toLowerCase().includes("meat") ||
    item.name.toLowerCase().includes("lamb");

  return (
    <div className="bg-white rounded-[22px] border border-slate-200/90 shadow-soft p-5 sm:p-6 flex flex-col gap-4 transition-all hover:shadow-card-elevated">
      {/* Top Header: Qty, Name, Veg/Non-Veg, Price */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Quantity Badge */}
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 shrink-0 mt-0.5">
            {item.quantity}x
          </span>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Veg / Non-Veg Indicator */}
              {isNonVeg ? (
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-xs bg-rose-50 border border-rose-300 text-rose-700">
                  NON-VEG
                </span>
              ) : (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 ring-2 ring-emerald-100" />
              )}

              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                {item.name}
              </h3>
            </div>

            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {item.category || "Line Item"}
            </p>
          </div>
        </div>

        {/* Price */}
        <div className="text-right shrink-0">
          <span className="text-lg sm:text-xl font-black text-slate-900">
            ₹{item.totalPrice.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Assigned Diners Section */}
      <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
        <div className="flex items-center justify-between flex-wrap gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Assigned Diners
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            Tap one or more people who shared this item.
          </span>
        </div>

        {/* Participants Pill/Avatar Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {participants.map((p) => {
            const isAssigned = assignedDinerIds.includes(p.id);

            return (
              <motion.button
                key={p.id}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleItemParticipant(item.id, p.id)}
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer select-none",
                  isAssigned
                    ? "bg-emerald-50/80 border-emerald-500 text-emerald-950 shadow-2xs ring-1 ring-emerald-400/50"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                )}
                title={`${isAssigned ? "Unassign" : "Assign"} ${p.name}`}
              >
                <div className="relative shrink-0">
                  <ParticipantAvatar
                    initials={p.avatarInitials || p.initials || ""}
                    avatarColor={p.avatarColor || p.color}
                    size="xs"
                  />
                  {isAssigned && (
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#16A34A] text-white flex items-center justify-center text-[8px] font-black ring-1 ring-white shadow-2xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <span className="truncate max-w-[120px]">{p.name}</span>
              </motion.button>
            );
          })}

          {participants.length === 0 && (
            <span className="text-xs text-amber-600 font-medium italic">
              No participants added. Go back to Add People.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
