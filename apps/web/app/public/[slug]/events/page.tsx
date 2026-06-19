import React from "react";
import { createServiceRoleClient } from "../../../api/v1/utils";
import Link from "next/link";

interface PublicEventsPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PublicEventsPageProps) {
  const supabase = createServiceRoleClient();
  const { data: tenant } = await supabase
    .from("tenants")
    .select("name")
    .eq("slug", params.slug)
    .single();

  return {
    title: tenant?.name ? `${tenant.name} | Events 🪔` : "Mandal Events",
  };
}

export default async function PublicEventsPage({ params }: PublicEventsPageProps) {
  const supabase = createServiceRoleClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name")
    .eq("slug", params.slug)
    .single();

  if (!tenant) {
    return <div className="p-8 text-center text-gray-500 text-sm">Tenant not found</div>;
  }

  // Fetch all events
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("start_at", { ascending: true });

  return (
    <div className="min-h-screen bg-[#faf8f5] text-gray-800 flex flex-col">
      {/* Header */}
      <div className="w-full py-16 bg-gradient-to-r from-orange-500 to-amber-600 text-center text-white">
        <h1 className="text-3xl md:text-4xl font-black">Events Calendar</h1>
        <p className="text-sm opacity-90 mt-2">Explore mandal programs, volunteer options, and schedules</p>
      </div>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 shadow-sm z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-extrabold text-orange-600 tracking-wide text-lg">🪔 UTSAV</span>
          <div className="flex items-center gap-6 text-sm font-semibold text-gray-600">
            <Link href={`/public/${params.slug}`} className="hover:text-orange-600">Home</Link>
            <Link href={`/public/${params.slug}/about`} className="hover:text-orange-600">About</Link>
            <Link href={`/public/${params.slug}/events`} className="text-orange-600">Events</Link>
            <Link href={`/public/${params.slug}/news`} className="hover:text-orange-600">News</Link>
            <Link href={`/public/${params.slug}/gallery`} className="hover:text-orange-600">Gallery</Link>
          </div>
          <Link
            href={`/public/${params.slug}/donate`}
            className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-full text-sm font-bold shadow-md transition-colors"
          >
            Donate
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 flex-1 w-full">
        <div className="flex flex-col gap-6">
          {events && events.length > 0 ? (
            events.map((e) => {
              const startDate = new Date(e.start_at);
              const formattedDate = startDate.toLocaleDateString([], {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              });
              const formattedTime = startDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div key={e.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row gap-6 items-start justify-between">
                  <div className="flex-1">
                    <span className="text-xxs font-black text-orange-600 uppercase tracking-widest">{e.category || "General"}</span>
                    <h3 className="text-xl font-bold text-gray-900 mt-1">{e.title}</h3>
                    <p className="text-sm text-gray-500 mt-2">{e.description || "Join us for this Mandal activity."}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-xs text-gray-600 border-t border-gray-50 pt-4">
                      <div>
                        <span className="text-gray-400 block mb-0.5">Date & Time</span>
                        <span className="font-semibold">{formattedDate} at {formattedTime}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block mb-0.5">Venue Location</span>
                        <span className="font-semibold">{e.location || "Mandal Premises"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 py-12">No scheduled events found at this time.</p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-xs mt-12 border-t border-gray-800">
        <p>© {new Date().getFullYear()} {tenant.name}. All rights reserved.</p>
      </footer>
    </div>
  );
}
