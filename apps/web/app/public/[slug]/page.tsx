import React from "react";
import { createServiceRoleClient } from "../../api/v1/utils";
import Link from "next/link";
import { KPICard } from "@utsav/ui";

interface PublicHomePageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PublicHomePageProps) {
  const supabase = createServiceRoleClient();
  const { data: tenant } = await supabase
    .from("tenants")
    .select("name, description")
    .eq("slug", params.slug)
    .single();

  return {
    title: tenant?.name ? `${tenant.name} | Home 🪔` : "Utsav Mandal",
    description: tenant?.description || "Utsav public Mandal home page",
  };
}

export default async function PublicHomePage({ params }: PublicHomePageProps) {
  const supabase = createServiceRoleClient();

  // Fetch tenant info
  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!tenant) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white shadow-xl rounded-2xl max-w-md">
          <span className="text-5xl">⚠️</span>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Organization Not Found</h2>
          <p className="text-gray-500 mt-2">The requested Mandal organization does not exist on Utsav.</p>
        </div>
      </div>
    );
  }

  // Fetch active campaigns
  const { data: campaigns } = await supabase
    .from("donation_campaigns")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("is_active", true)
    .limit(3);

  // Fetch upcoming events
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("tenant_id", tenant.id)
    .gte("start_at", new Date().toISOString())
    .order("start_at", { ascending: true })
    .limit(3);

  // Fetch latest news
  const { data: news } = await supabase
    .from("news")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(3);

  const primaryColor = tenant.primary_color || "#FF9500";

  return (
    <div className="min-h-screen bg-[#faf8f5] text-gray-800 flex flex-col">
      {/* Banner */}
      <div
        className="w-full h-80 bg-cover bg-center relative flex items-center justify-center"
        style={{
          backgroundImage: tenant.banner_url
            ? `url(${tenant.banner_url})`
            : "linear-gradient(135deg, #FF9500 0%, #FF5E36 100%)",
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-xs" />
        <div className="relative text-center text-white px-6">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">{tenant.name}</h1>
          <p className="text-lg opacity-90 mt-2 max-w-xl mx-auto">{tenant.description || "Welcome to our Utsav Mandal portal!"}</p>
        </div>
      </div>

      {/* Navigation Header */}
      <nav className="sticky top-0 bg-white border-b border-gray-100 shadow-sm z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-extrabold text-orange-600 tracking-wide text-lg flex items-center gap-1.5">
            🪔 UTSAV
          </span>
          <div className="flex items-center gap-6 text-sm font-semibold text-gray-600">
            <Link href={`/public/${params.slug}`} className="text-orange-600">Home</Link>
            <Link href={`/public/${params.slug}/about`} className="hover:text-orange-600">About</Link>
            <Link href={`/public/${params.slug}/events`} className="hover:text-orange-600">Events</Link>
            <Link href={`/public/${params.slug}/news`} className="hover:text-orange-600">News</Link>
            <Link href={`/public/${params.slug}/gallery`} className="hover:text-orange-600">Gallery</Link>
          </div>
          <Link
            href={`/public/${params.slug}/donate`}
            className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-full text-sm font-bold shadow-md transition-colors"
          >
            Donate Online
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Campaigns and News */}
        <div className="lg:col-span-2 flex flex-col gap-10">
          {/* Active Campaigns */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 border-l-4 border-orange-500 pl-3 mb-6">
              Active Campaigns
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {campaigns && campaigns.length > 0 ? (
                campaigns.map((c) => (
                  <div key={c.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{c.name}</h3>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-3">{c.description || "Support this collection drive."}</p>
                    </div>
                    {c.target_amount && (
                      <div className="mt-4">
                        <span className="text-xs text-gray-400 block mb-1">Target Amount</span>
                        <span className="font-extrabold text-orange-600 text-lg">₹{c.target_amount.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No active donation campaigns at this time.</p>
              )}
            </div>
          </section>

          {/* Latest News */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 border-l-4 border-orange-500 pl-3 mb-6">
              Latest Announcements
            </h2>
            <div className="flex flex-col gap-6">
              {news && news.length > 0 ? (
                news.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs">
                    <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">Published on {new Date(item.created_at).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600 mt-3 line-clamp-3">{item.summary || "No summary available."}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No news updates available.</p>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Events & Info */}
        <div className="flex flex-col gap-10">
          {/* Upcoming Events */}
          <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-black text-gray-950 mb-6">Upcoming Events</h2>
            <div className="flex flex-col gap-5">
              {events && events.length > 0 ? (
                events.map((e) => (
                  <div key={e.id} className="flex gap-4 items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="bg-orange-50 text-orange-600 p-2.5 rounded-xl font-black text-center min-w-[50px]">
                      <span className="block text-xs uppercase">
                        {new Date(e.start_at).toLocaleDateString([], { month: "short" })}
                      </span>
                      <span className="block text-lg">
                        {new Date(e.start_at).toLocaleDateString([], { day: "2-digit" })}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-950 text-sm">{e.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{e.location || "Mandal Premises"}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No upcoming events scheduled.</p>
              )}
            </div>
          </section>

          {/* Mandal Quick Info */}
          <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-xs flex flex-col gap-4 text-gray-600">
            <h3 className="font-black text-gray-950 text-sm mb-2">Mandal Directory</h3>
            <div>
              <span className="block text-gray-400">Founded Year</span>
              <span className="font-bold text-gray-800">{tenant.founded_year || "N/A"}</span>
            </div>
            <div>
              <span className="block text-gray-400">Location</span>
              <span className="font-bold text-gray-800">
                {tenant.city ? `${tenant.city}, ${tenant.state || ""}` : "N/A"}
              </span>
            </div>
            {tenant.whatsapp_group_url && (
              <a
                href={tenant.whatsapp_group_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-center py-2.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl font-bold transition-colors block text-xs"
              >
                💬 Join WhatsApp Group
              </a>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-xs mt-12 border-t border-gray-800">
        <p className="mb-2">Powered by 🪔 Utsav App — Digitizing Mandal communities</p>
        <p>© {new Date().getFullYear()} {tenant.name}. All rights reserved.</p>
      </footer>
    </div>
  );
}
