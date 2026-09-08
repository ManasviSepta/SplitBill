import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, User, Sliders, AlertCircle, Check } from "lucide-react";
import { ReceiptItem } from "@/types/review";
import { Participant } from "@/types/people";
import { ParticipantAvatar } from "@/components/people/ParticipantAvatar";
import { CustomSplitModal } from "./CustomSplitModal";
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
  const { toggleItemParticipant, assignAllToItem } = useSplitStore();
  const [showCustomModal, setShowCustomModal] = useState(false);

  const numDiners = assignedDinerIds.length;
  const isSharedWithAll = numDiners === participants.length && participants.length > 0;
  const isUnassigned = numDiners === 0;
  const isSingleDiner = numDiners === 1;

  const perPersonAmount =
    numDiners > 0 ? (item.totalPrice / numDiners).toFixed(2) : item.totalPrice.toFixed(2);

  const singleDinerName = isSingleDiner
    ? participants.find((p) => p.id === assignedDinerIds[0])?.name
    : "";

  const isNonVeg =
    item.name.toLowerCase().includes("chicken") ||
    item.name.toLowerCase().includes("wings") ||
    item.name.toLowerCase().includes("bbq") ||
    item.name.toLowerCase().includes("meat") ||
    item.name.toLowerCase().includes("lamb");

  return (
    <div className="bg-white rounded-[22px] border border-slate-200/90 shadow-soft p-5 flex flex-col gap-3.5 transition-all hover:shadow-card-elevated">
      {/* Top Header: Qty, Name, Veg/Non-Veg, Prices */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          {/* Quantity Badge */}
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 shrink-0 mt-0.5">
            {item.quantity}x
          </span>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Veg / Non-Veg Indicator */}
              {isNonVeg ? (
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-xs bg-rose-50 border border-rose-300 text-rose-700">
                  NON-VEG
                </span>
              ) : (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 ring-2 ring-emerald-100" />
              )}

              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                {item.name}
              </h3>
            </div>

            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {item.category} • Standard diner portion
            </p>
          </div>
        </div>

        {/* Prices */}
        <div className="text-right shrink-0">
          <span className="text-base sm:text-lg font-black text-slate-900">
            ₹{item.totalPrice.toFixed(2)}
          </span>
          <p className="text-[11px] text-slate-400 font-medium">
            ₹{item.unitPrice.toFixed(2)} each
          </p>
        </div>
      </div>

      {/* Middle Status Strip */}
      {isUnassigned ? (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs font-semibold text-amber-900">
          <div className="flex items-center gap-1.5 text-amber-800">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>UNASSIGNED • Tap avatars below to assign diners</span>
          </div>
          <button
            type="button"
            onClick={() => assignAllToItem(item.id)}
            className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            Assign All
          </button>
        </div>
      ) : isSingleDiner ? (
        <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs font-semibold text-emerald-900">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>ASSIGNED TO 1 PERSON</span>
            <span className="text-slate-400">•</span>
            <span className="font-bold">₹{perPersonAmount} total</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
            {singleDinerName} only
          </span>
        </div>
      ) : (
        <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-emerald-900">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>
              {isSharedWithAll ? "SHARED WITH EVERYONE" : `SHARED BY ${numDiners} PEOPLE`}
            </span>
            <span className="text-slate-400">•</span>
            <span className="font-bold">₹{perPersonAmount} / person</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => assignAllToItem(item.id)}
              className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold hover:underline cursor-pointer"
            >
              {isSharedWithAll ? "Unshare All" : "Share with all"}
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => setShowCustomModal(true)}
              className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
            >
              <Sliders className="w-3 h-3 text-slate-400" />
              <span>Custom Split</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Row: Assigned Diners Avatar Buttons */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-500 shrink-0">
          Assigned Diners:
        </span>

        {/* Clickable Avatars List */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {participants.map((p) => {
            const isAssigned = assignedDinerIds.includes(p.id);

            return (
              <motion.button
                key={p.id}
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleItemParticipant(item.id, p.id)}
                className={cn(
                  "relative rounded-full p-0.5 transition-all duration-200 cursor-pointer select-none",
                  isAssigned
                    ? "ring-2 ring-offset-1 ring-emerald-500 scale-105"
                    : "opacity-40 hover:opacity-80"
                )}
                title={`${isAssigned ? "Remove" : "Assign"} ${p.name}`}
              >
                <ParticipantAvatar
                  initials={p.avatarInitials}
                  color={p.color}
                  size="sm"
                  isActive={isAssigned}
                />
                {isAssigned && (
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-[#16A34A] text-white flex items-center justify-center text-[7px] font-bold ring-1 ring-white">
                    <Check className="w-2 h-2 stroke-[3]" />
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Custom Split Modal */}
      {showCustomModal && (
        <CustomSplitModal
          isOpen={showCustomModal}
          onClose={() => setShowCustomModal(false)}
          item={item}
          participants={participants}
          assignedParticipantIds={assignedDinerIds}
          onSaveShares={(shares) => {
            // Can be expanded to store custom percentage weights
          }}
        />
      )}
    </div>
  );
}
