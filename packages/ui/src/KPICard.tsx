import React from "react";

interface KPICardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  variant?: "default" | "highlight" | "danger" | "success";
  isLoading?: boolean;
}

export function KPICard({
  label,
  value,
  subtext,
  icon,
  variant = "default",
  isLoading = false,
}: KPICardProps) {
  const borderColors = {
    default: "border-neutral-850 hover:border-orange-500/20",
    highlight: "border-orange-500/30 bg-orange-500/5 hover:border-orange-500/40",
    danger: "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/40",
    success: "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/40",
  };

  const textColors = {
    default: "text-neutral-100",
    highlight: "text-orange-400",
    danger: "text-rose-400",
    success: "text-emerald-400",
  };

  return (
    <div className={`bg-neutral-900 border rounded-2xl p-6 relative overflow-hidden group transition-all ${borderColors[variant]}`}>
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            {label}
          </span>
          <div className={`text-3xl font-extrabold mt-1 font-mono tracking-tight ${textColors[variant]}`}>
            {isLoading ? (
              <span className="inline-block w-24 h-7 bg-neutral-800 animate-pulse rounded-md" />
            ) : (
              value
            )}
          </div>
        </div>
        {icon && (
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-neutral-950 border border-neutral-805 text-neutral-400 group-hover:text-orange-400 transition-colors">
            {icon}
          </div>
        )}
      </div>

      {subtext && (
        <div className="text-xs text-neutral-500 mt-4 flex items-center gap-1.5">
          {subtext}
        </div>
      )}
    </div>
  );
}
