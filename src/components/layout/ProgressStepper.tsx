import React from "react";
import { motion } from "framer-motion";
import { STEPPER_ITEMS } from "@/lib/mock-data";
import { useSplitStore } from "@/store/useSplitStore";
import { cn } from "@/lib/utils";

interface ProgressStepperProps {
  className?: string;
}

export function ProgressStepper({ className }: ProgressStepperProps) {
  const currentStep = useSplitStore((state) => state.currentStep);
  const setStep = useSplitStore((state) => state.setStep);

  return (
    <nav
      aria-label="Progress"
      className={cn("hidden lg:flex items-center gap-2", className)}
    >
      <div className="flex items-center gap-1.5">
        {STEPPER_ITEMS.map((step, index) => {
          const isActive = currentStep === step.stepNumber;
          const isCompleted = currentStep > step.stepNumber;

          return (
            <React.Fragment key={step.id}>
              {index > 0 && (
                <div
                  className={cn(
                    "w-3 sm:w-5 h-[1.5px] rounded-full transition-colors",
                    isCompleted ? "bg-[#16A34A]" : "bg-slate-200"
                  )}
                />
              )}

              <button
                type="button"
                onClick={() => setStep(step.stepNumber)}
                className={cn(
                  "relative text-xs sm:text-[13px] font-medium transition-all duration-200 cursor-pointer select-none",
                  isActive
                    ? "text-white font-semibold"
                    : isCompleted
                    ? "text-emerald-700 hover:text-emerald-800"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-stepper-pill"
                    className="absolute inset-0 -mx-3 -my-1.5 bg-[#16A34A] rounded-full shadow-xs -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="flex items-center gap-1">
                  <span>{step.stepNumber}.</span>
                  <span>{step.label}</span>
                </span>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
}
