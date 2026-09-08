import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSplitStore } from "@/store/useSplitStore";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Upload Receipt", path: "/" },
  { id: 2, label: "Review Bill", path: "/review" },
  { id: 3, label: "Add People", path: "/people" },
  { id: 4, label: "Assign Items", path: "/assign" },
  { id: 5, label: "Split Result", path: "/split" },
];

export function VerticalStepper({ className }: { className?: string }) {
  const currentStep = useSplitStore((state) => state.currentStep);
  const setStep = useSplitStore((state) => state.setStep);
  const isUploaded = useSplitStore((state) => state.isUploaded);
  const navigate = useNavigate();

  const handleStepClick = (stepId: number, path: string) => {
    // Only allow clicking to steps that are completed or active, or if receipt is uploaded
    if (stepId <= currentStep || (stepId === 2 && isUploaded)) {
      setStep(stepId);
      navigate(path);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 py-4", className)}>
      {STEPS.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isActive = currentStep === step.id;
        const isClickable = step.id <= currentStep || (step.id === 2 && isUploaded);

        return (
          <div key={step.id} className="relative flex items-start group">
            {/* Connecting Vertical Line */}
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "absolute left-4 top-8 w-[2px] h-8 -ml-[1px] transition-colors duration-300",
                  isCompleted ? "bg-[#16A34A]" : "bg-slate-200"
                )}
              />
            )}

            {/* Step Row Button */}
            <button
              type="button"
              onClick={() => handleStepClick(step.id, step.path)}
              disabled={!isClickable}
              className={cn(
                "flex items-center gap-3.5 text-left w-full transition-all duration-200 select-none",
                isClickable ? "cursor-pointer" : "cursor-default opacity-60"
              )}
            >
              {/* Step Circle Indicator */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shrink-0",
                  isCompleted
                    ? "bg-[#16A34A] text-white shadow-xs"
                    : isActive
                    ? "bg-[#16A34A] text-white shadow-glow-green ring-4 ring-emerald-100"
                    : "bg-slate-100 text-slate-400 border border-slate-200"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>

              {/* Step Label */}
              <div className="flex flex-col">
                <span
                  className={cn(
                    "text-sm font-semibold tracking-tight transition-colors",
                    isActive
                      ? "text-slate-900 font-bold"
                      : isCompleted
                      ? "text-emerald-800"
                      : "text-slate-400"
                  )}
                >
                  {step.label}
                </span>
                {isActive && (
                  <span className="text-[11px] font-medium text-[#16A34A]">
                    In Progress
                  </span>
                )}
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
