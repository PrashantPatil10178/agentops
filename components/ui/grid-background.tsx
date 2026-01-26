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
        "h-screen w-full bg-[#0a0f1e] bg-grid-white/[0.02] relative flex items-center justify-center",
        className
      )}
    >
      {/* Radial gradient for the container to give a faded look */}
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-[#0a0f1e] mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      {children}
    </div>
  );
}
