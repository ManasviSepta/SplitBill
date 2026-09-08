import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "success" | "gemini";
  size?: "sm" | "md";
  children: React.ReactNode;
}

export function Badge({
  variant = "default",
  size = "md",
  className,
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center gap-1.5 font-medium transition-colors select-none";

  const sizeStyles = {
    sm: "text-xs px-2.5 py-0.5 rounded-full",
    md: "text-xs md:text-sm px-3.5 py-1.5 rounded-full",
  };

  const variantStyles = {
    default:
      "bg-slate-100 text-slate-700 border border-slate-200/80 shadow-xs",
    outline:
      "border border-slate-200 text-slate-600 bg-white/70 backdrop-blur-xs",
    success:
      "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
    gemini:
      "bg-[#F0FDF4] text-slate-700 border border-emerald-200/70 shadow-xs text-xs md:text-sm font-medium",
  };

  return (
    <div
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}
