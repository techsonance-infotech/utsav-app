import React from "react";
import type { VolunteerDuty } from "@utsav/types";

interface VolunteerDutyCardProps {
  duty: VolunteerDuty;
  onSignUp?: (dutyId: string) => void;
  onCheckIn?: (dutyId: string) => void;
}

export function VolunteerDutyCard({ duty, onSignUp, onCheckIn }: VolunteerDutyCardProps) {
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const dutyTypeIcons: Record<string, string> = {
    entry_management: "🚪",
    crowd_control: "🛡️",
    prasad_distribution: "🙏",
    decoration: "🎨",
    parking: "🅿️",
    first_aid: "🏥",
    registration_desk: "📝",
    photo_video: "📷",
    other: "📋",
  };

  const statusBadgeStyles: Record<string, string> = {
    open: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    assigned: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    completed: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
  };

  return (
    <div className="bg-neutral-900 border border-neutral-850 rounded-2xl p-5 hover:border-orange-500/20 transition-all space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neutral-950 border border-neutral-850 rounded-xl flex items-center justify-center text-xl">
            {dutyTypeIcons[duty.duty_type] || "📋"}
          </div>
          <div className="space-y-0.5">
            <h4 className="font-bold text-neutral-100 text-sm">{duty.title}</h4>
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
              {duty.duty_type.replace(/_/g, " ")}
            </span>
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${statusBadgeStyles[duty.status] || statusBadgeStyles.open}`}>
          {duty.status}
        </span>
      </div>

      {duty.description && (
        <p className="text-xs text-neutral-400 leading-relaxed">{duty.description}</p>
      )}

      <div className="text-xs text-neutral-400 flex flex-wrap gap-x-4 gap-y-1">
        <span className="flex items-center gap-1">
          <span>📅</span>
          <span>{formatDate(duty.start_at)}</span>
        </span>
        <span className="flex items-center gap-1">
          <span>🕒</span>
          <span>
            {formatTime(duty.start_at)}
            {duty.end_at ? ` - ${formatTime(duty.end_at)}` : ""}
          </span>
        </span>
        {duty.location && (
          <span className="flex items-center gap-1">
            <span>📍</span>
            <span>{duty.location}</span>
          </span>
        )}
        <span className="flex items-center gap-1">
          <span>👥</span>
          <span>Max {duty.max_volunteers} volunteer{duty.max_volunteers > 1 ? "s" : ""}</span>
        </span>
      </div>

      {/* Actions */}
      {duty.status === "open" && onSignUp && (
        <div className="pt-2 border-t border-neutral-855">
          <button
            onClick={() => onSignUp(duty.id)}
            className="w-full py-2 text-center bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-neutral-950 font-bold rounded-xl text-xs transition-all"
          >
            Sign Up for Duty
          </button>
        </div>
      )}

      {duty.status === "assigned" && onCheckIn && (
        <div className="pt-2 border-t border-neutral-855">
          <button
            onClick={() => onCheckIn(duty.id)}
            className="w-full py-2 text-center bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 text-neutral-950 font-bold rounded-xl text-xs transition-all"
          >
            ✓ Check In
          </button>
        </div>
      )}
    </div>
  );
}
