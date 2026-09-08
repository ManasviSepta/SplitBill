import React from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { AllocationStats } from "@/types/people";
import { cn } from "@/lib/utils";

interface AllocationProgressProps {
  stats: AllocationStats;
  totalBill: number;
}

export function AllocationProgress({ stats, totalBill }: AllocationProgressProps) {
  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const remaining = Math.max(0, totalBill - stats.allocatedSubtotal);

  return (
    <div className="flex flex-col gap-2.5">
      {/* Top Labels */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-500">
          Allocated:{" "}
          <strong className="text-slate-800">
            {formatCurrency(stats.allocatedSubtotal)}
          </strong>
        </span>
        <span className="font-semibold text-slate-500">
          Remaining:{" "}
          <strong className={remaining > 0 ? "text-amber-600" : "text-emerald-600"}>
            {formatCurrency(remaining)}
          </strong>
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
        <div
          style={{ width: `${Math.min(100, stats.percentageAllocated)}%` }}
          className={cn(
            "h-full rounded-full transition-all duration-500",
            stats.isFullyAllocated
              ? "bg-[#16A34A]"
              : "bg-gradient-to-r from-emerald-500 to-amber-500"
          )}
        />
      </div>

      {/* Status Line */}
      <div className="flex items-center justify-between text-[11px] font-medium pt-0.5">
        <span className="text-slate-500">
          {stats.assignedItemsCount} of {stats.totalItems} items assigned
        </span>

        {stats.isFullyAllocated ? (
          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>100% Assigned</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            <span>{stats.unassignedItemsCount} unassigned</span>
          </span>
        )}
      </div>
    </div>
  );
}
