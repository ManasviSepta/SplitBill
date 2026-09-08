import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, UtensilsCrossed, AlertCircle, Users, Check } from "lucide-react";
import { useSplitStore } from "@/store/useSplitStore";
import { AssignmentFilters } from "@/components/assign/AssignmentFilters";
import { AssignmentCard } from "@/components/assign/AssignmentCard";
import { LiveBreakdownSidebar } from "@/components/assign/LiveBreakdownSidebar";
import { ParticipantAvatar } from "@/components/people/ParticipantAvatar";
import { cn } from "@/lib/utils";

export function AssignItemsPage() {
  const {
    setStep,
    restaurant,
    receiptItems,
    participants,
    assignments,
    itemFilter,
    selectedParticipantFilter,
    setSelectedParticipantFilter,
  } = useSplitStore();

  useEffect(() => {
    setStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [setStep]);

  // Filter items based on tab and active diner selection
  const filteredItems = useMemo(() => {
    return receiptItems.filter((item) => {
      const assigned = assignments[item.id] || [];

      // 1. Filter by participant if one is clicked
      if (selectedParticipantFilter && !assigned.includes(selectedParticipantFilter)) {
        return false;
      }

      // 2. Filter by tab
      if (itemFilter === "assigned") {
        return assigned.length > 0;
      }
      if (itemFilter === "unassigned") {
        return assigned.length === 0;
      }
      if (itemFilter === "shared") {
        return assigned.length > 1;
      }

      return true;
    });
  }, [receiptItems, assignments, itemFilter, selectedParticipantFilter]);

  const selectedDinerName = participants.find(
    (p) => p.id === selectedParticipantFilter
  )?.name;

  // Dishes assigned count for active diner chips
  const getDishesCount = (pId: string) => {
    let count = 0;
    Object.values(assignments).forEach((diners) => {
      if (diners.includes(pId)) count += 1;
    });
    return count;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Top Breadcrumb & Context */}
      <div className="mb-5 flex items-center justify-between text-xs font-semibold text-slate-500">
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
            Step 4 of 5 • {participants.length} Diners • {receiptItems.length} Dishes
          </span>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* Left Column: Line Items Assignment (~65%) */}
        <div className="flex-1 w-full flex flex-col gap-5">
          {/* Header */}
          <div className="flex flex-col">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
              <Users className="w-3.5 h-3.5" />
              <span>STEP 4 OF 5 • DISH ALLOCATION</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Assign Items
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Tap diner avatars under each dish to assign or share. Tap multiple avatars to split equally.
            </p>
          </div>

          {/* Quick Diners Filter Strip */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="uppercase tracking-wider text-[11px]">
                FILTER BY DINER
              </span>
              <span className="text-[11px] text-slate-400">
                Click a diner to filter dishes
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {participants.map((p) => {
                const count = getDishesCount(p.id);
                const isSelected = selectedParticipantFilter === p.id;

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      setSelectedParticipantFilter(isSelected ? null : p.id)
                    }
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none",
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/90"
                    )}
                  >
                    <ParticipantAvatar
                      initials={p.avatarInitials}
                      color={p.color}
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
                      {count}
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
                  Clear filter
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <AssignmentFilters />

          {/* Active Filter Notice */}
          {selectedParticipantFilter && (
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
              <span className="font-medium">
                Filtering items assigned to or shared with{" "}
                <strong className="font-bold">{selectedDinerName}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedParticipantFilter(null)}
                className="font-bold text-emerald-700 hover:text-emerald-900 underline ml-2 cursor-pointer"
              >
                Show all
              </button>
            </div>
          )}

          {/* Item Assignment Cards List */}
          <div className="flex flex-col gap-3.5">
            {filteredItems.map((item) => (
              <AssignmentCard
                key={item.id}
                item={item}
                participants={participants}
                assignedDinerIds={assignments[item.id] || []}
              />
            ))}

            {/* Empty State */}
            {filteredItems.length === 0 && (
              <div className="p-10 rounded-[22px] border border-dashed border-slate-300 bg-white text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">
                  No items match this filter
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Try switching tabs or resetting the diner selection above.
                </p>
                {selectedParticipantFilter && (
                  <button
                    type="button"
                    onClick={() => setSelectedParticipantFilter(null)}
                    className="mt-3 text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline"
                  >
                    Reset Diner Filter
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Validation / Helper Notice */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 mt-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <p className="font-semibold text-amber-950 mb-0.5">
                Dynamic Proportional Tax &amp; Discount Pro-Rating
              </p>
              Taxes (GST, VAT), service charges, and discounts are dynamically
              pro-rated to each person based on their share of the subtotal.
              Check the live breakdown on the right to review running totals.
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Live Breakdown Sidebar (~35%) */}
        <LiveBreakdownSidebar />
      </div>
    </div>
  );
}
