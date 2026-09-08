import React from "react";
import { cn } from "@/lib/utils";

interface ParticipantAvatarProps {
  initials: string;
  color?: string;
  size?: "xs" | "sm" | "md" | "lg";
  isActive?: boolean;
  className?: string;
}

export function ParticipantAvatar({
  initials,
  color = "#16A34A",
  size = "md",
  isActive = true,
  className,
}: ParticipantAvatarProps) {
  const sizeClasses = {
    xs: "w-5 h-5 text-[9px]",
    sm: "w-6 h-6 text-[10px]",
    md: "w-7 h-7 text-xs",
    lg: "w-9 h-9 text-sm",
  };

  return (
    <div
      style={{
        backgroundColor: isActive ? color : "#E2E8F0",
        color: isActive ? "#FFFFFF" : "#64748B",
      }}
      className={cn(
        "rounded-full flex items-center justify-center font-bold tracking-tight select-none shrink-0 transition-all duration-200",
        sizeClasses[size],
        isActive ? "shadow-2xs" : "opacity-50",
        className
      )}
    >
      <span>{initials}</span>
    </div>
  );
}
