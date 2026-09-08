import React from "react";
import { cn } from "@/lib/utils";

interface SectionTitleProps {
  badge?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}

export function SectionTitle({
  badge,
  title,
  subtitle,
  align = "center",
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        "flex flex-col",
        align === "center" && "items-center text-center",
        align === "left" && "items-start text-left",
        align === "right" && "items-end text-right",
        className
      )}
    >
      {badge && <div className="mb-4">{badge}</div>}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
