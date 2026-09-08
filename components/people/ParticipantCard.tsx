import React from "react";
import { Trash2, Utensils, Shield } from "lucide-react";
import { Participant } from "@/types/people";
import { ParticipantAvatar } from "./ParticipantAvatar";
import { cn } from "@/lib/utils";

interface ParticipantCardProps {
  participant: Participant;
  assignedDishesCount: number;
  onRemove?: () => void;
  canRemove?: boolean;
}

export function ParticipantCard({
  participant,
  assignedDishesCount,
  onRemove,
  canRemove = true,
}: ParticipantCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-4 flex items-center justify-between gap-3 transition-all hover:border-slate-300 hover:shadow-card-elevated group">
      <div className="flex items-center gap-3 min-w-0">
        <ParticipantAvatar
          initials={participant.avatarInitials}
          color={participant.color}
          size="md"
        />

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-slate-900 truncate">
              {participant.name}
            </span>
            {participant.isYou && (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Shield className="w-2.5 h-2.5" />
                <span>You (Organizer)</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span className="inline-flex items-center gap-1">
              <Utensils className="w-3 h-3 text-slate-400" />
              <span>
                {assignedDishesCount} dish{assignedDishesCount !== 1 ? "es" : ""}{" "}
                assigned
              </span>
            </span>
            {participant.upiId && (
              <>
                <span>•</span>
                <span className="text-[11px] font-mono text-slate-400 truncate">
                  {participant.upiId}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Remove Action */}
      {canRemove && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          title={`Remove ${participant.name}`}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0 opacity-80 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
