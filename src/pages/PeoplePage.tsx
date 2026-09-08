import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, Clock } from "lucide-react";
import { useSplitStore } from "@/store/useSplitStore";

export function PeoplePage() {
  const setStep = useSplitStore((state) => state.setStep);
  const charges = useSplitStore((state) => state.charges);

  useEffect(() => {
    setStep(3);
  }, [setStep]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto py-12 px-4">
      <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6 shadow-xs">
        <Users className="w-8 h-8 text-[#16A34A]" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
        Step 3: Add People
      </h1>
      <p className="text-sm text-slate-500 mt-2 leading-relaxed">
        Bill confirmed at{" "}
        <span className="font-bold text-slate-900">
          ₹{charges.grandTotal.toFixed(2)}
        </span>
        . In Phase 3, you will tag friends (Aarav, Priya, Rohan, Sneha) and assign individual items to each person.
      </p>

      <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
        <Clock className="w-3.5 h-3.5" />
        <span>Phase 3 Coming Next</span>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <Link
          to="/review"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Review Bill</span>
        </Link>
      </div>
    </div>
  );
}
