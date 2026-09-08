import React from "react";
import { X } from "lucide-react";
import { Participant } from "@/types/people";
import { ParticipantAvatar } from "./ParticipantAvatar";
import { cn } from "@/lib/utils";

interface ParticipantChipProps {
  participant: Participant;
  dishCount?: number;
  isSelected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  showRemove?: boolean;
  className?: string;
}

export function ParticipantChip({
  participant,
  dishCount,
  isSelected = false,
  onClick,
  onRemove,
  showRemove = false,
  className,
}: ParticipantChipProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full text-xs font-semibold transition-all select-none border",
        onClick ? "cursor-pointer" : "cursor-default",
        isSelected
          ? "bg-slate-900 text-white border-slate-900 shadow-xs"
          : "bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50",
        className
      )}
    >
      <ParticipantAvatar
        initials={participant.avatarInitials}
        color={participant.color}
        size="xs"
      />
      <span className="truncate max-w-[120px]">{participant.name}</span>

      {dishCount !== undefined && (
        <span
          className={cn(
            "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
            isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
          )}
        >
          {dishCount}
        </span>
      )}

      {showRemove && !participant.isYou && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
