import React from "react";
import { cn } from "@/lib/utils";

interface ParticipantAvatarProps {
  initials: string;
  color?: string;
  avatarColor?: string;
  size?: "xs" | "sm" | "md" | "lg";
  isActive?: boolean;
  className?: string;
}

export function ParticipantAvatar({
  initials,
  color,
  avatarColor,
  size = "md",
  className,
}: ParticipantAvatarProps) {
  const bg = avatarColor || color || "#16A34A";

  const sizeClasses = {
    xs: "w-5 h-5 text-[9px]",
    sm: "w-6 h-6 text-[10px]",
    md: "w-7 h-7 text-xs",
    lg: "w-9 h-9 text-sm",
  };

  return (
    <div
      style={{
        backgroundColor: bg,
        color: "#FFFFFF",
      }}
      className={cn(
        "rounded-full flex items-center justify-center font-bold tracking-tight select-none shrink-0 shadow-2xs transition-all duration-200",
        sizeClasses[size],
        className
      )}
    >
      <span>{initials}</span>
    </div>
  );
}
