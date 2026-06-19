import React from "react";

interface RSVPButtonProps {
  currentStatus: string | null;
  onSelect: (status: "attending" | "maybe" | "not_attending") => void;
  disabled?: boolean;
}

export function RSVPButton({ currentStatus, onSelect, disabled = false }: RSVPButtonProps) {
  const options = [
    { id: "attending", label: "Going", activeStyle: "bg-emerald-500 text-neutral-950 border-emerald-500" },
    { id: "maybe", label: "Maybe", activeStyle: "bg-amber-500 text-neutral-950 border-amber-500" },
    { id: "not_attending", label: "No", activeStyle: "bg-rose-500 text-neutral-950 border-rose-500" },
  ] as const;

  return (
    <div className="flex gap-1.5 w-full">
      {options.map((opt) => {
        const isActive = currentStatus === opt.id;
        return (
          <button
            key={opt.id}
            disabled={disabled}
            onClick={() => onSelect(opt.id)}
            className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg border transition-all ${
              isActive
                ? opt.activeStyle
                : "bg-neutral-950 border-neutral-805 text-neutral-400 hover:text-neutral-200"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
