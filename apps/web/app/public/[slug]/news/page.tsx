import React from "react";
import { createServiceRoleClient } from "../../../api/v1/utils";
import Link from "next/link";

interface PublicNewsPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PublicNewsPageProps) {
  const supabase = createServiceRoleClient();
  const { data: tenant } = await supabase
    .from("tenants")
    .select("name")
    .eq("slug", params.slug)
    .single();

  return {
    title: tenant?.name ? `${tenant.name} | News 🪔` : "Mandal News",
  };
}

export default async function PublicNewsPage({ params }: PublicNewsPageProps) {
  const supabase = createServiceRoleClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name")
    .eq("slug", params.slug)
    .single();

  if (!tenant) {
    return <div className="p-8 text-center text-gray-500 text-sm">Tenant not found</div>;
  }

  // Fetch all published news
  const { data: news } = await supabase
    .from("news")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#faf8f5] text-gray-800 flex flex-col">
      {/* Header */}
      <div className="w-full py-16 bg-gradient-to-r from-orange-500 to-amber-600 text-center text-white">
        <h1 className="text-3xl md:text-4xl font-black">Mandal News & Feed</h1>
        <p className="text-sm opacity-90 mt-2">Latest press releases, statements, and community announcements</p>
      </div>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 shadow-sm z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-extrabold text-orange-600 tracking-wide text-lg">🪔 UTSAV</span>
          <div className="flex items-center gap-6 text-sm font-semibold text-gray-600">
            <Link href={`/public/${params.slug}`} className="hover:text-orange-600">Home</Link>
            <Link href={`/public/${params.slug}/about`} className="hover:text-orange-600">About</Link>
            <Link href={`/public/${params.slug}/events`} className="hover:text-orange-600">Events</Link>
            <Link href={`/public/${params.slug}/news`} className="text-orange-600">News</Link>
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
        <div className="flex flex-col gap-8">
          {news && news.length > 0 ? (
            news.map((item) => (
              <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-xs">
                <span className="text-xxs font-black text-orange-600 uppercase tracking-widest">{item.language || "English"}</span>
                <h2 className="text-2xl font-bold text-gray-900 mt-1">{item.title}</h2>
                <p className="text-xs text-gray-400 mt-2">Published on {new Date(item.created_at).toLocaleDateString()}</p>
                {item.summary && <p className="text-sm font-medium text-gray-700 bg-gray-50 p-4 rounded-xl mt-4 border border-gray-100">{item.summary}</p>}
                {item.content && (
                  <div
                    className="text-sm text-gray-600 leading-relaxed mt-6 prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-12">No announcements found at this time.</p>
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
