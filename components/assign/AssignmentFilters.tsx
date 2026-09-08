import React from "react";
import { CheckCheck } from "lucide-react";
import { useSplitStore } from "@/store/useSplitStore";
import { cn } from "@/lib/utils";

export function AssignmentFilters() {
  const {
    receiptItems,
    assignments,
    itemFilter,
    setItemFilter,
    assignAllToItem,
  } = useSplitStore();

  const totalItems = receiptItems.length;

  const assignedCount = receiptItems.filter(
    (i) => (assignments[i.id]?.length || 0) > 0
  ).length;

  const unassignedCount = totalItems - assignedCount;

  const sharedCount = receiptItems.filter(
    (i) => (assignments[i.id]?.length || 0) > 1
  ).length;

  const handleSelectAllEveryone = () => {
    receiptItems.forEach((item) => {
      assignAllToItem(item.id);
    });
  };

  const filters = [
    { id: "all", label: "All Items", count: totalItems },
    { id: "assigned", label: "Assigned", count: assignedCount },
    { id: "unassigned", label: "Unassigned", count: unassignedCount },
    { id: "shared", label: "Shared Items", count: sharedCount },
  ] as const;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 my-2">
      {/* Title */}
      <div className="flex items-center gap-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Line Items &amp; Split Mode
        </h2>
        <span className="text-xs font-semibold text-slate-400">
          ({totalItems} items)
        </span>
      </div>

      {/* Filter Tabs & Quick Action */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setItemFilter(f.id)}
              className={cn(
                "px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer",
                itemFilter === f.id
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <span>{f.label}</span>
              <span className="ml-1 text-[10px] opacity-70">({f.count})</span>
            </button>
          ))}
        </div>

        {/* Quick Split All With Everyone */}
        <button
          type="button"
          onClick={handleSelectAllEveryone}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
          title="Toggle sharing all items with all diners"
        >
          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Split All Equally</span>
        </button>
      </div>
    </div>
  );
}
