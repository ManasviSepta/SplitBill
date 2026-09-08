import React from "react";
import { Link } from "react-router-dom";
import { HelpCircle, ChevronRight } from "lucide-react";
import { VerticalStepper } from "./VerticalStepper";
import { useSplitStore } from "@/store/useSplitStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { useLocation } from "react-router-dom";

export function Sidebar() {
  const currentStep = useSplitStore((state) => state.currentStep);
  const location = useLocation();

  const stepRoutes: Record<string, number> = {
    "/": 1,
    "/review": 2,
    "/people": 3,
    "/assign-items": 4,
    "/split": 5,
  };

  const effectiveStep = stepRoutes[location.pathname] || currentStep;

  const stepLabels: Record<number, string> = {
    1: "Upload Receipt",
    2: "Review Bill",
    3: "Add People",
    4: "Assign Items",
    5: "Split Result",
  };

  return (
    <>
      {/* Desktop Sidebar: Fixed Left */}
      <aside className="hidden md:flex flex-col justify-between w-64 h-screen fixed left-0 top-0 bg-white border-r border-slate-200/90 p-6 z-40">
        <div className="flex flex-col">
          {/* Top: Logo Only (No v2.4 AI badge) */}
          <Link
            to="/"
            className="flex items-center gap-2.5 pb-8 border-b border-slate-100 group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#16A34A] text-white flex items-center justify-center font-bold text-lg shadow-xs group-hover:scale-105 transition-transform">
              <span>₹</span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl text-slate-900 tracking-tight leading-none">
                SplitBill
              </span>
              <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                Fair & Smart Splitting
              </span>
            </div>
          </Link>

          {/* Stepper Section */}
          <div className="mt-8">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Workflow Steps
            </span>
            <VerticalStepper className="mt-2" />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs text-slate-600 font-medium">
            <span>Currency</span>
            <span className="font-semibold text-slate-800">INR (₹)</span>
          </div>

          <button
            type="button"
            onClick={() =>
              toast.info("Need assistance? Upload your restaurant receipt image to begin.", {
                duration: 4000,
              })
            }
            className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors p-1.5 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Need Help?</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header: Compact Progress */}
      <div className="md:hidden sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#16A34A] text-white flex items-center justify-center font-bold text-sm">
            ₹
          </div>
          <span className="font-extrabold text-lg text-slate-900">SplitBill</span>
        </Link>

        {/* Mobile Step Badge */}
        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-semibold">
          <span>Step {effectiveStep} of 5:</span>
          <span className="font-bold">{stepLabels[effectiveStep] || "Workflow"}</span>
        </div>
      </div>
    </>
  );
}
