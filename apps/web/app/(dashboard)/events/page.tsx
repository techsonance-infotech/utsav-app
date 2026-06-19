"use client";

import React, { useState } from "react";
import { useEvents, useCreateEvent, useRSVP } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import { EventCard, RSVPButton } from "@utsav/ui";

export default function WebEventsPage() {
  const { role } = useAuthStore();
  const { data: events = [], isLoading: loadingEvents } = useEvents() as any;

  const createMutation = useCreateEvent();
  const rsvpMutation = useRSVP();

  // Dialog & Submission States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<
    "puja" | "cultural" | "sports" | "aarti" | "prasad_vitran" | "volunteer_duty" | "meeting" | "visarjan" | "general"
  >("general");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationMapsUrl, setLocationMapsUrl] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [rsvpRequired, setRsvpRequired] = useState(false);
  const [rsvpDeadline, setRsvpDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const hasAdminAccess = ["owner", "admin", "committee_member"].includes(role || "");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title || !startAt) {
      setErrorMsg("Title and Start date/time are required.");
      return;
    }

    if (new Date(startAt) < new Date()) {
      setErrorMsg("Cannot schedule an event in the past.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({
        title,
        description: description || undefined,
        category,
        start_at: new Date(startAt).toISOString(),
        end_at: endAt ? new Date(endAt).toISOString() : undefined,
        location_name: locationName || undefined,
        location_maps_url: locationMapsUrl || undefined,
        banner_image_url: bannerImageUrl || undefined,
        max_capacity: maxCapacity ? Number(maxCapacity) : undefined,
        rsvp_required: rsvpRequired,
        rsvp_deadline: rsvpDeadline ? new Date(rsvpDeadline).toISOString() : undefined,
        tags: [],
      });

      // Clear form
      setTitle("");
      setDescription("");
      setCategory("general");
      setStartAt("");
      setEndAt("");
      setLocationName("");
      setLocationMapsUrl("");
      setBannerImageUrl("");
      setMaxCapacity("");
      setRsvpRequired(false);
      setRsvpDeadline("");
      setShowCreateModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRSVP = async (eventId: string, status: "attending" | "maybe" | "not_attending") => {
    try {
      await rsvpMutation.mutateAsync({ eventId, status });
    } catch (err) {
      console.error("RSVP mutation error:", err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-8 py-6 text-neutral-100 min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-100">Calendar & Events</h1>
          <p className="text-sm text-neutral-400 mt-1">Schedule cultural rituals, meetings, and coordinate festival invitations.</p>
        </div>

        {hasAdminAccess && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-neutral-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-orange-500/10"
          >
            🗓️ Schedule Event
          </button>
        )}
      </div>

      {/* Events Grid */}
      {loadingEvents ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-neutral-900 border border-neutral-850 rounded-2xl animate-pulse" />
          <div className="h-64 bg-neutral-900 border border-neutral-850 rounded-2xl animate-pulse" />
          <div className="h-64 bg-neutral-900 border border-neutral-850 rounded-2xl animate-pulse" />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-neutral-900/50 border border-neutral-850 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
          <span className="text-5xl block">📅</span>
          <h3 className="text-lg font-bold">No Events Scheduled</h3>
          <p className="text-xs text-neutral-400">There are no upcoming cultural programs or meetings currently published.</p>
          {hasAdminAccess && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 border border-neutral-805 text-orange-400 text-xs font-bold rounded-xl hover:bg-neutral-800 transition-colors"
            >
              Schedule First Event
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event: any) => (
            <EventCard key={event.id} event={event}>
              <RSVPButton
                currentStatus={event.user_rsvp || null}
                onSelect={(status) => handleRSVP(event.id, status)}
                disabled={event.rsvp_deadline ? new Date(event.rsvp_deadline) < new Date() : false}
              />
            </EventCard>
          ))}
        </div>
      )}

      {/* SCHEDULE NEW EVENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-850 rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-neutral-855">
              <h3 className="text-xl font-bold text-neutral-100">Schedule New Event</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-neutral-500 hover:text-neutral-300">
                ✕
              </button>
            </div>

            {errorMsg && (
              <p className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl text-center">
                ⚠️ {errorMsg}
              </p>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Mahaprasad Feast"
                    className="w-full bg-neutral-950 border border-neutral-805 rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-805 rounded-xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-orange-500"
                  >
                    <option value="general">General</option>
                    <option value="puja">Puja / Ritual</option>
                    <option value="cultural">Cultural Program</option>
                    <option value="sports">Sports</option>
                    <option value="aarti">Aarti Session</option>
                    <option value="prasad_vitran">Prasad Distribution</option>
                    <option value="volunteer_duty">Volunteer Briefing</option>
                    <option value="meeting">Mandal Meeting</option>
                    <option value="visarjan">Visarjan Ceremony</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-805 rounded-xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-805 rounded-xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase">Location / Venue</label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="e.g. Community Ground Main Hall"
                    className="w-full bg-neutral-950 border border-neutral-805 rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase">Banner Image URL</label>
                  <input
                    type="url"
                    value={bannerImageUrl}
                    onChange={(e) => setBannerImageUrl(e.target.value)}
                    placeholder="https://example.com/banner.jpg"
                    className="w-full bg-neutral-950 border border-neutral-805 rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 flex flex-col justify-center">
                  <label className="flex items-center gap-2 cursor-pointer mt-4">
                    <input
                      type="checkbox"
                      checked={rsvpRequired}
                      onChange={(e) => setRsvpRequired(e.target.checked)}
                      className="rounded border-neutral-805 text-orange-500 focus:ring-0 focus:ring-offset-0 bg-neutral-950"
                    />
                    <span className="text-xs text-neutral-300">RSVP Confirmation Required</span>
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase">RSVP Deadline</label>
                  <input
                    type="datetime-local"
                    disabled={!rsvpRequired}
                    value={rsvpDeadline}
                    onChange={(e) => setRsvpDeadline(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-805 rounded-xl p-3 text-xs text-neutral-200 disabled:opacity-40 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-500 uppercase">Description / Details</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline program schedule, dress codes, guidelines, etc..."
                  className="w-full h-24 bg-neutral-950 border border-neutral-805 rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-neutral-950 font-bold rounded-xl text-sm transition-all font-bold"
              >
                {isSubmitting ? "Publishing Event..." : "Publish Event Details"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
