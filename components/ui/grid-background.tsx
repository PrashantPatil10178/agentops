"use client";
import React from "react";
import { cn } from "@/lib/utils";

export function GridBackground({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-screen w-full bg-[var(--background)] relative flex items-center justify-center bg-grid-dark dark:bg-grid-dark",
        className,
      )}
      style={{
        backgroundImage:
          "linear-gradient(to right, var(--border-strong) 1px, transparent 1px), linear-gradient(to bottom, var(--border-strong) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}
    >
      {/* Radial fade mask */}
      <div
        className="absolute pointer-events-none inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, var(--background) 80%)",
        }}
      />
      {children}
    </div>
  );
}
