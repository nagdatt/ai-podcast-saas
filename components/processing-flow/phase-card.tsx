"use client";

import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PhaseStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PhaseCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  status: PhaseStatus;
  isActive: boolean;
  progress?: number;
  timeEstimate?: string;
  children?: React.ReactNode;
}

export function PhaseCard({
  icon: Icon,
  title,
  description,
  status,
  isActive,
  progress,
  timeEstimate,
  children,
}: PhaseCardProps) {
  const isRunning = status === "running";
  const isCompleted = status === "completed";

  return (
    <div
      className={cn(
        "glass-card rounded-2xl transition-all p-8",
        isActive && "ring-2 ring-purple-400 shadow-2xl hover-glow",
        isCompleted && "ring-2 ring-purple-500 shadow-purple-200 shadow-lg",
        !isCompleted && !isActive && "opacity-60",
      )}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div
              className={cn(
                "rounded-2xl p-4 transition-all",
                isActive && "gradient-purple animate-pulse-purple shadow-lg",
                isCompleted && "gradient-purple shadow-lg",
                !isActive && !isCompleted && "bg-purple-100",
              )}
            >
              <Icon
                className={cn(
                  "h-8 w-8",
                  isActive || isCompleted ? "text-white" : "text-purple-600",
                )}
              />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-gray-900">{title}</h3>
              <p className="text-base text-gray-600 mt-1">{description}</p>
            </div>
          </div>

          <div>
            {isRunning && (
              <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
            )}
            {isCompleted && (
              <CheckCircle2 className="h-10 w-10 text-purple-600" />
            )}
          </div>
        </div>

        {isRunning && progress !== undefined && (
          <div className="space-y-3">
            <div className="relative h-3 bg-purple-100 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 progress-purple rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm font-medium">
              {timeEstimate && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-5 w-5" />
                  <span>Estimated: {timeEstimate}</span>
                </div>
              )}
              <span className="text-purple-600 font-bold">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        )}

        {!isRunning && timeEstimate && (
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <Clock className="h-5 w-5" />
            <span>Estimated: {timeEstimate}</span>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
