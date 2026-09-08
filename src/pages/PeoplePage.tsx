import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, UserPlus, Users, Plus, AlertCircle, Sparkles } from "lucide-react";
import { useSplitStore } from "@/store/useSplitStore";
import { PeopleHeader } from "@/components/people/PeopleHeader";
import { ParticipantCard } from "@/components/people/ParticipantCard";
import { GradientButton } from "@/components/shared/GradientButton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const COLOR_OPTIONS = [
  "#16A34A", // Emerald
  "#3B82F6", // Blue
  "#EF4444", // Coral
  "#8B5CF6", // Purple
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#14B8A6", // Teal
];

export function PeoplePage() {
  const navigate = useNavigate();
  const {
    participants,
    assignments,
    addParticipant,
    removeParticipant,
    setStep,
    restaurant,
  } = useSplitStore();

  const [nameInput, setNameInput] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[1]);

  useEffect(() => {
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [setStep]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      toast.error("Please enter a friend's name");
      return;
    }

    addParticipant(nameInput.trim(), selectedColor);
    toast.success(`Added ${nameInput.trim()}`);
    setNameInput("");

    // Rotate color
    const nextIdx = (COLOR_OPTIONS.indexOf(selectedColor) + 1) % COLOR_OPTIONS.length;
    setSelectedColor(COLOR_OPTIONS[nextIdx]);
  };

  const handleContinue = () => {
    if (participants.length < 2) {
      toast.warning("Please add at least 2 participants to split the bill");
      return;
    }
    setStep(4);
    navigate("/assign-items");
  };

  const getDishesCount = (participantId: string) => {
    let count = 0;
    Object.values(assignments).forEach((diners) => {
      if (diners.includes(participantId)) count += 1;
    });
    return count;
  };

  const canContinue = participants.length >= 2;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <Link
          to="/review"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
          <span>Back to Review Bill</span>
        </Link>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px]">
          <span className="font-bold text-slate-800">{restaurant.name}</span>
          <span>•</span>
          <span>Step 3 of 5</span>
        </div>
      </div>

      {/* Header */}
      <PeopleHeader count={participants.length} />

      {/* Friend Input Card */}
      <div className="bg-white rounded-[24px] border border-slate-200/90 shadow-soft p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          <UserPlus className="w-4 h-4 text-emerald-600" />
          <span>Add Dining Companion</span>
        </div>

        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full flex items-center bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
            <Users className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Type friend's name (e.g. Priya, Rohan, Sneha) and hit Enter"
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />

            {/* Color Swatches */}
            <div className="flex items-center gap-1.5 ml-2 shrink-0">
              {COLOR_OPTIONS.slice(0, 6).map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  style={{ backgroundColor: color }}
                  className={cn(
                    "w-4 h-4 rounded-full transition-transform cursor-pointer",
                    selectedColor === color
                      ? "scale-125 ring-2 ring-slate-800 ring-offset-1"
                      : "opacity-70 hover:opacity-100"
                  )}
                  title="Choose avatar accent color"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Friend</span>
          </button>
        </form>

        <p className="text-[11px] text-slate-400">
          Tip: Add everyone who will participate in paying for dishes or drinks.
        </p>
      </div>

      {/* Active Participants Grid Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
          <div className="flex items-center gap-2">
            <span className="uppercase tracking-wider">ACTIVE PARTICIPANTS</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[11px]">
              {participants.length} People
            </span>
          </div>

          {!canContinue && (
            <span className="text-amber-600 font-medium">
              Add at least 1 more person to split
            </span>
          )}
        </div>

        {/* Grid of Participant Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {participants.map((participant) => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              assignedDishesCount={getDishesCount(participant.id)}
              canRemove={!participant.isYou && participants.length > 1}
              onRemove={() => {
                removeParticipant(participant.id);
                toast.info(`Removed ${participant.name}`);
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom CTA Card */}
      <div className="bg-white rounded-[22px] border border-slate-200/90 shadow-soft p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#16A34A] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm text-slate-900">
              Ready to assign dishes?
            </span>
            <span className="text-xs text-slate-500">
              {participants.length} diners ready. Next step: Tag who ate what.
            </span>
          </div>
        </div>

        <GradientButton
          type="button"
          onClick={handleContinue}
          disabled={!canContinue}
          size="md"
          className="w-full sm:w-auto font-bold text-xs sm:text-sm px-6 py-3 disabled:opacity-50 cursor-pointer"
        >
          <span>Continue to Assign Items</span>
          <ArrowRight className="w-4 h-4" />
        </GradientButton>
      </div>
    </div>
  );
}
