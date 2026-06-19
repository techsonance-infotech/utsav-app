import React from "react";
import { createServiceRoleClient } from "../../../api/v1/utils";
import Link from "next/link";

interface PublicAboutPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PublicAboutPageProps) {
  const supabase = createServiceRoleClient();
  const { data: tenant } = await supabase
    .from("tenants")
    .select("name")
    .eq("slug", params.slug)
    .single();

  return {
    title: tenant?.name ? `${tenant.name} | About 🪔` : "About Mandal",
  };
}

export default async function PublicAboutPage({ params }: PublicAboutPageProps) {
  const supabase = createServiceRoleClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!tenant) {
    return <div className="p-8 text-center text-gray-500 text-sm">Tenant not found</div>;
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-gray-800 flex flex-col">
      {/* Header Banner */}
      <div className="w-full py-16 bg-gradient-to-r from-orange-500 to-amber-600 text-center text-white">
        <h1 className="text-3xl md:text-4xl font-black">About {tenant.name}</h1>
        <p className="text-sm opacity-90 mt-2">Mandal Profile & Operations</p>
      </div>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 shadow-sm z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-extrabold text-orange-600 tracking-wide text-lg">🪔 UTSAV</span>
          <div className="flex items-center gap-6 text-sm font-semibold text-gray-600">
            <Link href={`/public/${params.slug}`} className="hover:text-orange-600">Home</Link>
            <Link href={`/public/${params.slug}/about`} className="text-orange-600">About</Link>
            <Link href={`/public/${params.slug}/events`} className="hover:text-orange-600">Events</Link>
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

      {/* Profile details */}
      <main className="max-w-4xl mx-auto px-6 py-12 flex-1 w-full flex flex-col gap-8">
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col gap-6">
          <h2 className="text-2xl font-black text-gray-900 border-l-4 border-orange-500 pl-3">
            Mandal Profile Details
          </h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{tenant.description || "No description provided."}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-6 border-t border-gray-100 text-sm">
            <div>
              <span className="text-gray-400 block mb-0.5">Vertical Theme</span>
              <span className="font-extrabold text-gray-800 uppercase">{tenant.vertical || "General"}</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">Founded Year</span>
              <span className="font-extrabold text-gray-800">{tenant.founded_year || "N/A"}</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">State</span>
              <span className="font-extrabold text-gray-800">{tenant.state || "N/A"}</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">City</span>
              <span className="font-extrabold text-gray-800">{tenant.city || "N/A"}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-400 block mb-0.5">Address</span>
              <span className="font-extrabold text-gray-800">{tenant.address || "N/A"}</span>
            </div>
            {tenant.website_url && (
              <div className="col-span-2">
                <span className="text-gray-400 block mb-0.5">Official Website</span>
                <a
                  href={tenant.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-extrabold text-orange-600 hover:underline"
                >
                  {tenant.website_url}
                </a>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-xs mt-12 border-t border-gray-800">
        <p>© {new Date().getFullYear()} {tenant.name}. All rights reserved.</p>
      </footer>
    </div>
  );
}
