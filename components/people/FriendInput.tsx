import React, { useState } from "react";
import { UserPlus, Plus, X, UserCheck } from "lucide-react";
import { useSplitStore } from "@/store/useSplitStore";
import { ParticipantAvatar } from "./ParticipantAvatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const COLOR_OPTIONS = [
  "#16A34A", // Emerald
  "#3B82F6", // Blue
  "#EF4444", // Coral
  "#8B5CF6", // Purple
  "#F59E0B", // Amber
];

export function FriendInput() {
  const {
    participants,
    assignments,
    selectedParticipantFilter,
    addParticipant,
    removeParticipant,
    setSelectedParticipantFilter,
  } = useSplitStore();

  const [nameInput, setNameInput] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      toast.error("Please enter a friend's name");
      return;
    }

    addParticipant(nameInput.trim(), selectedColor);
    toast.success(`Added ${nameInput.trim()} to diners`);
    setNameInput("");
    // Rotate to next color
    const nextIdx = (COLOR_OPTIONS.indexOf(selectedColor) + 1) % COLOR_OPTIONS.length;
    setSelectedColor(COLOR_OPTIONS[nextIdx]);
  };

  // Count assigned dishes per participant
  const getDishesCount = (participantId: string) => {
    let count = 0;
    Object.values(assignments).forEach((diners) => {
      if (diners.includes(participantId)) count += 1;
    });
    return count;
  };

  return (
    <div className="bg-white rounded-[24px] border border-slate-200/90 shadow-soft p-5 sm:p-6 flex flex-col gap-5">
      {/* Input Row */}
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full flex items-center bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
          <UserPlus className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Enter friend's name, phone, or UPI ID (e.g. rohan@upi)"
            className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />

          {/* Color Picker Swatches */}
          <div className="flex items-center gap-1.5 ml-2 shrink-0">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                style={{ backgroundColor: color }}
                className={cn(
                  "w-3.5 h-3.5 rounded-full transition-transform cursor-pointer",
                  selectedColor === color
                    ? "scale-125 ring-2 ring-slate-800 ring-offset-1"
                    : "opacity-70 hover:opacity-100"
                )}
                title="Select avatar color"
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Friend</span>
        </button>
      </form>

      {/* Active Diners Row Header */}
      <div className="flex flex-col gap-3 pt-1 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="uppercase tracking-wider">ACTIVE DINERS</span>
            <span className="px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
              {participants.length}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Tap avatar below an item to toggle
          </span>
        </div>

        {/* Participant Chips Horizontal Scroll */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
          {participants.map((p) => {
            const count = getDishesCount(p.id);
            const isFilterActive = selectedParticipantFilter === p.id;

            return (
              <div
                key={p.id}
                onClick={() =>
                  setSelectedParticipantFilter(isFilterActive ? null : p.id)
                }
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer select-none group",
                  isFilterActive
                    ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200"
                    : "bg-slate-50/80 hover:bg-slate-100 border-slate-200/90"
                )}
              >
                <ParticipantAvatar
                  initials={p.avatarInitials}
                  color={p.color}
                  size="sm"
                />

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 tracking-tight">
                    {p.name}
                  </span>
                  {p.isYou && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-xs bg-emerald-100 text-emerald-800">
                      You
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-medium text-slate-500 bg-white/90 border border-slate-200 px-1.5 py-0.2 rounded-full">
                  {count} {count === 1 ? "dish" : "dishes"}
                </span>

                {/* Remove button if not You and > 1 diner */}
                {!p.isYou && participants.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeParticipant(p.id);
                      toast.info(`Removed ${p.name}`);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-red-500 transition-opacity"
                    title="Remove diner"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {selectedParticipantFilter && (
            <button
              type="button"
              onClick={() => setSelectedParticipantFilter(null)}
              className="text-xs font-semibold text-[#16A34A] hover:underline px-2 cursor-pointer"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
