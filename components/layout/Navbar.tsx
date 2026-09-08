import React, { useState } from "react";
import { HelpCircle, Plus, ChevronDown, Menu, X } from "lucide-react";
import { ProgressStepper } from "./ProgressStepper";
import { APP_VERSION, STEPPER_ITEMS } from "@/lib/mock-data";
import { useSplitStore } from "@/store/useSplitStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentStep = useSplitStore((state) => state.currentStep);
  const setStep = useSplitStore((state) => state.setStep);

  const handleHelpClick = () => {
    toast.info("Need help? Drop your bill receipt or use the sample Olive Bistro bill to test the flow!", {
      duration: 3500,
    });
  };

  const handlePlusClick = () => {
    toast.success("Ready to add another bill or expense item!", {
      duration: 3000,
    });
  };

  return (
    <header className="sticky top-3 z-50 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 sm:py-3 shadow-xs flex items-center justify-between transition-all">
        {/* Left: Brand & Version */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#16A34A] text-white flex items-center justify-center font-bold text-base shadow-xs">
              <span>₹</span>
            </div>
            <span className="font-bold text-lg sm:text-xl text-slate-900 tracking-tight">
              SplitBill
            </span>
          </div>

          <div className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold">
            {APP_VERSION}
          </div>
        </div>

        {/* Center: Stepper (desktop) */}
        <ProgressStepper className="mx-2" />

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Need Help Link */}
          <button
            type="button"
            onClick={handleHelpClick}
            className="hidden md:flex items-center gap-1.5 text-xs sm:text-[13px] font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer px-1 py-1"
          >
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>Need Help?</span>
          </button>

          {/* Currency Pill */}
          <button
            type="button"
            onClick={() => toast.info("Currency locked to INR (₹) for Indian dining bills.")}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200/70 border border-slate-200/60 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
          >
            <span>INR (₹)</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {/* Green Add Button */}
          <button
            type="button"
            onClick={handlePlusClick}
            title="Add Receipt"
            className="w-8 h-8 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white flex items-center justify-center shadow-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* User Avatar */}
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="User profile"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Stepper Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-lg flex flex-col gap-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Workflow Steps
            </span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {APP_VERSION}
            </span>
          </div>
          <div className="flex flex-col gap-1 pt-1">
            {STEPPER_ITEMS.map((step) => {
              const isActive = currentStep === step.stepNumber;
              return (
                <button
                  key={step.id}
                  onClick={() => {
                    setStep(step.stepNumber);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left",
                    isActive
                      ? "bg-[#16A34A] text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <span>
                    {step.stepNumber}. {step.label}
                  </span>
                  {isActive && (
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 px-1.5 py-0.5 rounded-md">
                      Current
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
