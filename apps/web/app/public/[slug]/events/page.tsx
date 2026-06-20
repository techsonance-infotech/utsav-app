import React from "react";
import { createServiceRoleClient } from "../../../api/v1/utils";
import Link from "next/link";
import {
  Flame,
  Calendar,
  MapPin,
  Clock,
  Tag,
  CheckCircle,
  Sparkles,
  Map
} from "lucide-react";
import PublicHeader from "../../../components/PublicHeader";

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
    .select("id, name, slug, primary_color, description, city, state, address, whatsapp_group_url")
    .eq("slug", params.slug)
    .single();

  if (!tenant) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white shadow-xl rounded-2xl max-w-md border border-gray-150">
          <span className="text-5xl">⚠️</span>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Organization Not Found</h2>
        </div>
      </div>
    );
  }

  // Fetch all events from the public API
  let events: any[] = [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/v1/public/events?slug=${params.slug}`,
      { cache: "no-store" }
    );
    if (res.ok) {
      events = await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch public events from API:", err);
  }

  const primaryColor = tenant.primary_color || "#ff9500";

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1e1b18] flex flex-col font-sans selection:bg-[#ff9500]/25 selection:text-[#2d1600]">
      {/* Navigation Header */}
      <PublicHeader tenant={tenant} currentSlug={params.slug} />

      <main className="flex-grow">
        {/* 1. Hero Section with custom brand glows */}
        <section className="relative min-h-[380px] flex items-center overflow-hidden py-16 bg-gradient-to-br from-[#2d1b0d] via-[#1e140a] to-[#140d06] text-white">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none z-0 opacity-30"
            style={{ backgroundColor: primaryColor }} />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none z-0" />

          <div className="relative z-10 px-6 max-w-7xl mx-auto w-full text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
              <span className="material-symbols-outlined text-sm text-[#ff9500] animate-pulse">calendar_month</span>
              <span className="text-[10px] uppercase tracking-widest text-[#ffdcbf] font-black">Timeline</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight uppercase leading-tight font-headline-lg max-w-3xl mx-auto">
              Events & <span style={{ color: primaryColor }}>Celebrations</span>
            </h1>
            <p className="text-xs md:text-sm text-gray-300 max-w-lg mx-auto leading-relaxed">
              Plan your visits, view darshan slots, register volunteer requirements, and join cultural programs scheduled at {tenant.name}.
            </p>
          </div>
        </section>

        {/* 2. Events Timeline Grid */}
        <section className="py-16 px-6 max-w-4xl mx-auto w-full">
          <div className="space-y-8">
            {events && events.length > 0 ? (
              events.map((e) => {
                const startDate = new Date(e.start_at);
                const formattedDate = startDate.toLocaleDateString("en-IN", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                });
                const formattedTime = startDate.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={e.id}
                    className="bg-white border border-[#E8E2D6] rounded-3xl p-6 md:p-8 shadow-xxs hover:shadow-md hover:border-[#ff9500]/30 transition-all flex flex-col md:flex-row gap-6 items-start justify-between group"
                  >
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-[#ff9500] bg-[#ff9500]/5 px-2.5 py-1.5 rounded-xl border border-[#ff9500]/10 uppercase tracking-wider">
                          <Tag className="w-3 h-3" />
                          {e.category || "General"}
                        </span>
                        {e.rsvp_required && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-100 uppercase tracking-wider">
                            RSVP Required
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-black text-[#3A3530] uppercase tracking-tight group-hover:text-[#ff9500] transition-colors">
                        {e.title}
                      </h3>
                      
                      <p className="text-xs text-[#554334] font-medium leading-relaxed">
                        {e.description || "Join us for this Mandal activity and seek blessings."}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-xs text-[#554334] border-t border-[#E8E2D6]/40 pt-4 font-semibold">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-[#ff9500]/10 flex items-center justify-center text-[#ff9500] shrink-0">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[9px] tracking-wider uppercase font-black">Date & Time</span>
                            <span className="text-[#3A3530]">{formattedDate} at {formattedTime}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-[#ff9500]/10 flex items-center justify-center text-[#ff9500] shrink-0">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[9px] tracking-wider uppercase font-black">Venue Location</span>
                            <span className="text-[#3A3530]">{e.location_name || "Mandal Premises"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {e.location_maps_url && (
                      <a
                        href={e.location_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full md:w-auto h-11 px-6 bg-gradient-to-r from-[#8c5000] to-[#ff9500] hover:from-[#ff9500] hover:to-[#8c5000] text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xxs transition-all shrink-0 self-end md:self-center"
                      >
                        <Map className="w-4 h-4" />
                        Get Directions
                      </a>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-white border border-dashed border-[#E8E2D6] p-16 rounded-[32px] text-center max-w-md mx-auto space-y-4">
                <span className="text-5xl block">📅</span>
                <h4 className="font-black text-sm text-[#3A3530] uppercase">No Scheduled Events</h4>
                <p className="text-xxs text-gray-500 font-semibold leading-relaxed">
                  There are no scheduled events or celebrations published at this time. Check back later for updates.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 9. Specialized Public Slug Footer */}
      <footer className="w-full py-16 bg-[#e9e1dc] border-t border-[#dbc2ad] relative z-10 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-6 max-w-7xl mx-auto">
          
          {/* Col 1: Mandal Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#8c5000] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                temple_hindu
              </span>
              <span className="font-black text-sm uppercase tracking-wider text-[#3A3530]">{tenant.name}</span>
            </div>
            <p className="text-gray-500 leading-relaxed font-medium line-clamp-4">
              {tenant.description || "Preserving traditional heritage and promoting community welfare projects under the spiritual direction of our trust."}
            </p>
            <p className="text-[10px] text-[#8c5000] font-bold uppercase tracking-wider">
              {tenant.city || "Mumbai"}, {tenant.state || "Maharashtra"}
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-4">
            <h4 className="font-black text-xs uppercase text-[#8c5000] tracking-wider">Useful Navigations</h4>
            <ul className="space-y-2.5 font-bold text-[#554334]">
              <li><Link href={`/${params.slug}`} className="hover:text-[#ff9500] transition-colors">Home Page</Link></li>
              <li><Link href={`/${params.slug}/events`} className="hover:text-[#ff9500] transition-colors">Utsav Timeline</Link></li>
              <li><Link href={`/${params.slug}/news`} className="hover:text-[#ff9500] transition-colors">Announcements</Link></li>
              <li><Link href={`/${params.slug}/blog`} className="hover:text-[#ff9500] transition-colors">Devotional Blogs</Link></li>
              <li><Link href={`/${params.slug}/donate`} className="hover:text-[#ff9500] transition-colors">Donate Now</Link></li>
            </ul>
          </div>

          {/* Col 3: Seva Schedules */}
          <div className="space-y-4">
            <h4 className="font-black text-xs uppercase text-[#8c5000] tracking-wider">Darshan Timings</h4>
            <div className="space-y-3 text-gray-500 font-medium">
              <div>
                <p className="font-bold text-[#3A3530] uppercase text-[10px]">Morning Pooja</p>
                <p className="mt-0.5">07:30 AM — 08:30 AM</p>
              </div>
              <div>
                <p className="font-bold text-[#3A3530] uppercase text-[10px]">Evening Aarti</p>
                <p className="mt-0.5">08:00 PM — 09:00 PM</p>
              </div>
              <p className="text-[10px] text-[#ff9500] font-black uppercase">Admission is free for all devotees.</p>
            </div>
          </div>

          {/* Col 4: Reach Committee */}
          <div className="space-y-4">
            <h4 className="font-black text-xs uppercase text-[#8c5000] tracking-wider">Devotee Desk</h4>
            <div className="space-y-2.5 text-gray-500 font-medium">
              <p className="leading-relaxed">
                <strong className="text-[#3A3530] block uppercase text-[10px] mb-0.5">Office Address:</strong>
                {tenant.address || "Pandal Premises, Main Road"}
              </p>
              <p>
                <strong className="text-[#3A3530] block uppercase text-[10px] mb-0.5">Support Desk:</strong>
                support@utsavapp.in
              </p>
            </div>
            
            {tenant.whatsapp_group_url && (
              <a
                href={tenant.whatsapp_group_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/25 text-[#128C7E] rounded-lg font-bold transition-all text-[10px] uppercase tracking-wider"
              >
                <span>💬 Join Devotee WhatsApp</span>
              </a>
            )}
            
            <p className="text-[9px] text-[#554334] pt-2 border-t border-[#dbc2ad]">
              Powered by <strong className="text-[#8c5000] uppercase tracking-wider font-black">UtsavManager</strong> &copy; {new Date().getFullYear()}
            </p>
          </div>

        </div>
      </footer>
    </div>
  );
}
