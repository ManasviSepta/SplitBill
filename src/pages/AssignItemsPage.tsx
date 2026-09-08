import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Utensils, CheckCircle2, AlertCircle } from "lucide-react";
import { useSplitStore } from "@/store/useSplitStore";
import { AssignmentCard } from "@/components/assign/AssignmentCard";
import { ParticipantAvatar } from "@/components/people/ParticipantAvatar";
import { GradientButton } from "@/components/shared/GradientButton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AssignItemsPage() {
  const navigate = useNavigate();
  const {
    setStep,
    restaurant,
    receiptItems,
    participants,
    assignments,
    selectedParticipantFilter,
    setSelectedParticipantFilter,
  } = useSplitStore();

  useEffect(() => {
    setStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [setStep]);

  // Filter items by selected participant if active
  const displayedItems = selectedParticipantFilter
    ? receiptItems.filter((item) =>
        (assignments[item.id] || []).includes(selectedParticipantFilter)
      )
    : receiptItems;

  const selectedDinerName = participants.find(
    (p) => p.id === selectedParticipantFilter
  )?.name;

  // Assignment statistics (counts only, no monetary calculations)
  const totalItems = receiptItems.length;
  const assignedItemsCount = receiptItems.filter(
    (item) => (assignments[item.id] || []).length > 0
  ).length;
  const unassignedItemsCount = totalItems - assignedItemsCount;
  const isFullyAssigned = totalItems > 0 && unassignedItemsCount === 0;

  const handleCalculateFinalSplit = () => {
    if (!isFullyAssigned) {
      toast.warning(
        `Please assign all items before continuing. ${unassignedItemsCount} item${
          unassignedItemsCount > 1 ? "s" : ""
        } remaining.`,
        { duration: 4000 }
      );
      return;
    }

    setStep(5);
    navigate("/split");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6 pb-28">
      {/* Top Breadcrumb & Context */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <Link
          to="/people"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
          <span>Back to Add People</span>
        </Link>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px]">
          <span className="font-bold text-slate-800">{restaurant.name}</span>
          <span>•</span>
          <span>
            Step 4 of 5 • {participants.length} Diners • {totalItems} Dishes
          </span>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
          <Utensils className="w-3.5 h-3.5" />
          <span>STEP 4 OF 5 • ASSIGN DISHES</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Assign Items
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Tag who shared each dish. Tap multiple people on a dish to share it equally.
        </p>
      </div>

      {/* Warning if fewer than 2 participants */}
      {participants.length < 2 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              You need at least 2 dining companions to split items.
            </span>
          </div>
          <Link
            to="/people"
            className="font-bold text-amber-950 underline shrink-0 hover:text-amber-800 cursor-pointer"
          >
            Add Diners →
          </Link>
        </div>
      )}

      {/* Diners Filter Bar (Optional Quick Filter) */}
      {participants.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-3.5 sm:p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span className="uppercase tracking-wider text-[11px]">
              DINERS AT THIS MEAL
            </span>
            <span className="text-[11px] text-slate-400">
              {selectedParticipantFilter ? "Filter active" : "Click to view a diner's dishes"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {participants.map((p) => {
              const isSelected = selectedParticipantFilter === p.id;
              const assignedCount = receiptItems.filter((item) =>
                (assignments[item.id] || []).includes(p.id)
              ).length;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    setSelectedParticipantFilter(isSelected ? null : p.id)
                  }
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none",
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/90"
                  )}
                >
                  <ParticipantAvatar
                    initials={p.avatarInitials || p.initials || ""}
                    avatarColor={p.avatarColor || p.color}
                    size="xs"
                  />
                  <span>{p.name}</span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-white text-slate-600 border border-slate-200"
                    )}
                  >
                    {assignedCount}
                  </span>
                </button>
              );
            })}

            {selectedParticipantFilter && (
              <button
                type="button"
                onClick={() => setSelectedParticipantFilter(null)}
                className="text-xs font-bold text-[#16A34A] hover:underline px-2 cursor-pointer"
              >
                Clear filter (Show all)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active Filter Notice */}
      {selectedParticipantFilter && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
          <span className="font-medium">
            Viewing items assigned to{" "}
            <strong className="font-bold">{selectedDinerName}</strong>
          </span>
          <button
            type="button"
            onClick={() => setSelectedParticipantFilter(null)}
            className="font-bold text-emerald-700 hover:text-emerald-900 underline ml-2 cursor-pointer"
          >
            Show all items
          </button>
        </div>
      )}

      {/* Expanded Receipt Item Cards List (Full Width) */}
      <div className="flex flex-col gap-4">
        {displayedItems.map((item) => (
          <AssignmentCard
            key={item.id}
            item={item}
            participants={participants}
            assignedDinerIds={assignments[item.id] || []}
          />
        ))}

        {displayedItems.length === 0 && (
          <div className="p-12 rounded-[24px] border border-dashed border-slate-300 bg-white text-center flex flex-col items-center justify-center">
            <h3 className="font-bold text-slate-800 text-sm">
              No items match this filter
            </h3>
            <button
              type="button"
              onClick={() => setSelectedParticipantFilter(null)}
              className="mt-3 text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline"
            >
              Reset Diner Filter
            </button>
          </div>
        )}
      </div>

      {/* Single Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-3.5 px-4 sm:px-6 shadow-card-elevated">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Assignment Status (No monetary figures) */}
          <div className="flex items-center gap-3 text-xs">
            {isFullyAssigned ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <span>All {totalItems} items assigned</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 font-medium text-slate-600">
                <span className="font-bold text-slate-800">
                  {assignedItemsCount} of {totalItems} items assigned
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-amber-700 font-bold">
                  {unassignedItemsCount} remaining unassigned
                </span>
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          <GradientButton
            type="button"
            onClick={handleCalculateFinalSplit}
            disabled={!isFullyAssigned}
            size="md"
            className="w-full sm:w-auto font-bold text-xs sm:text-sm px-7 py-3 disabled:opacity-50 cursor-pointer shadow-soft"
          >
            <span>Calculate Final Bill Split</span>
            <ArrowRight className="w-4 h-4" />
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
