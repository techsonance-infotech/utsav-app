import React from "react";
import { createServiceRoleClient } from "../../../api/v1/utils";
import Link from "next/link";

interface PublicDonatePageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PublicDonatePageProps) {
  const supabase = createServiceRoleClient();
  const { data: tenant } = await supabase
    .from("tenants")
    .select("name")
    .eq("slug", params.slug)
    .single();

  return {
    title: tenant?.name ? `${tenant.name} | Donate Online 🪔` : "Donate Online",
  };
}

export default async function PublicDonatePage({ params }: PublicDonatePageProps) {
  const supabase = createServiceRoleClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name")
    .eq("slug", params.slug)
    .single();

  if (!tenant) {
    return <div className="p-8 text-center text-gray-500 text-sm">Tenant not found</div>;
  }

  // Fetch active donation campaigns
  const { data: campaigns } = await supabase
    .from("donation_campaigns")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("is_active", true);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-gray-800 flex flex-col">
      {/* Header */}
      <div className="w-full py-16 bg-gradient-to-r from-orange-500 to-amber-600 text-center text-white">
        <h1 className="text-3xl md:text-4xl font-black">Support Our Organization</h1>
        <p className="text-sm opacity-90 mt-2">Make a secure online donation to support Mandal social, religious & cultural work</p>
      </div>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 shadow-sm z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-extrabold text-orange-600 tracking-wide text-lg">🪔 UTSAV</span>
          <div className="flex items-center gap-6 text-sm font-semibold text-gray-600">
            <Link href={`/public/${params.slug}`} className="hover:text-orange-600">Home</Link>
            <Link href={`/public/${params.slug}/about`} className="hover:text-orange-600">About</Link>
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

      {/* Content */}
      <main className="max-w-xl mx-auto px-6 py-12 flex-1 w-full">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
          <h2 className="text-xl font-black text-gray-950 border-b border-gray-50 pb-4">
            Contribution Form
          </h2>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Donor Full Name</label>
              <input
                type="text"
                placeholder="e.g. Rajesh Kumar"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Mobile Number</label>
                <input
                  type="text"
                  placeholder="e.g. +91 9876543210"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. rajesh@example.com"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Select Campaign (Optional)</label>
              <select className="w-full px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-orange-500">
                <option value="">General Donation</option>
                {campaigns && campaigns.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Contribution Amount (INR)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">₹</span>
                <input
                  type="number"
                  placeholder="501"
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 font-bold text-orange-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Special note or instructions</label>
              <textarea
                placeholder="Write any message..."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <button
              type="button"
              className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors mt-2"
            >
              Proceed to Payment
            </button>
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
