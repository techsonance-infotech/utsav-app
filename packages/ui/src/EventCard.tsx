import React from "react";
import type { Event } from "@utsav/types";

interface EventCardProps {
  event: Event & {
    user_rsvp?: string | null;
    rsvp_summary?: { attending: number; maybe: number; not_attending: number } | null;
  };
  children?: React.ReactNode;
}

export function EventCard({ event, children }: EventCardProps) {
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

  const attendingCount = event.rsvp_summary?.attending || 0;
  const maybeCount = event.rsvp_summary?.maybe || 0;

  return (
    <div className="bg-neutral-900 border border-neutral-850 rounded-2xl overflow-hidden hover:border-orange-500/20 transition-all flex flex-col">
      {/* Banner/Image Area */}
      <div className="h-40 bg-neutral-950 relative overflow-hidden flex items-center justify-center border-b border-neutral-855">
        {event.banner_image_url ? (
          <img
            src={event.banner_image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center space-y-1">
            <span className="text-4xl block">🪔</span>
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Utsav Event</span>
          </div>
        )}
        <span className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-sm border border-neutral-805 text-orange-400 text-[10px] font-bold px-2 py-1 rounded-lg uppercase">
          {event.category}
        </span>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-neutral-100 text-lg leading-snug">{event.title}</h3>
          </div>

          <div className="text-xs text-neutral-400 flex flex-wrap gap-y-1 gap-x-4">
            <span className="flex items-center gap-1">
              <span>📅</span>
              <span>{formatDate(event.start_at)}</span>
            </span>
            <span className="flex items-center gap-1">
              <span>🕒</span>
              <span>
                {formatTime(event.start_at)}
                {event.end_at ? ` - ${formatTime(event.end_at)}` : ""}
              </span>
            </span>
            {event.location_name && (
              <span className="flex items-center gap-1">
                <span>📍</span>
                <span>{event.location_name}</span>
              </span>
            )}
          </div>

          {event.description && (
            <p className="text-xs text-neutral-400 line-clamp-2 pt-1">{event.description}</p>
          )}
        </div>

        {/* RSVP Status / Actions area */}
        <div className="space-y-3 pt-3 border-t border-neutral-855">
          <div className="flex justify-between items-center text-[10px] text-neutral-500">
            <span>
              RSVP Summary: <span className="font-bold text-neutral-300">{attendingCount} attending</span>
              {maybeCount > 0 && <span>, {maybeCount} maybe</span>}
            </span>
            {event.user_rsvp && (
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <span>✓</span>
                <span className="capitalize">You: {event.user_rsvp}</span>
              </span>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
