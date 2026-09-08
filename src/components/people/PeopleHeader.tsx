import React from "react";
import { Users, UserPlus } from "lucide-react";

export function PeopleHeader({ count }: { count: number }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div className="flex flex-col">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
          <Users className="w-3.5 h-3.5" />
          <span>STEP 3 OF 5 • ADD PEOPLE</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Who&apos;s sharing this meal?
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Add your dining companions. Next, you&apos;ll tag who ordered or shared each dish.
        </p>
      </div>

      {/* Diners Count Badge */}
      <div className="self-start sm:self-center inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
        <span>{count} Diners Added</span>
      </div>
    </div>
  );
}
