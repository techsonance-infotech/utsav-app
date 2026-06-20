import React from "react";
import { createServiceRoleClient } from "../../../api/v1/utils";
import Link from "next/link";
import {
  Flame,
  Award,
  Heart,
  Clock,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import DonationForm from "../../../components/DonationForm";
import PublicHeader from "../../../components/PublicHeader";

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
    title: tenant?.name ? `${tenant.name} | Sacred Donations 🪔` : "Secure Donation Online",
    description: `Support the social, religious & cultural work of ${tenant?.name || "Mandal"}`,
  };
}

export default async function PublicDonatePage({ params }: PublicDonatePageProps) {
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

  // Fetch active donation campaigns
  const { data: campaigns } = await supabase
    .from("donation_campaigns")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("is_active", true);

  // Fetch confirmed donations for sum calculations and leaderboard
  const { data: donations } = await supabase
    .from("donations")
    .select("amount, donor_name, is_anonymous, created_at")
    .eq("tenant_id", tenant.id)
    .eq("status", "confirmed")
    .order("amount", { ascending: false });

  // Get recent list for sidebar feed
  const { data: recentDonations } = await supabase
    .from("donations")
    .select("amount, donor_name, is_anonymous, created_at")
    .eq("tenant_id", tenant.id)
    .eq("status", "confirmed")
    .order("created_at", { ascending: false })
    .limit(2);

  const totalRaised = donations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
  const donorCount = donations?.length || 0;

  // Leaderboard lists
  const leaderboard = donations?.slice(0, 3) || [];

  const primaryColor = tenant.primary_color || "#8c5000";

  // Target Goal Calculation
  const firstCampaignGoal = campaigns && campaigns[0]?.target_amount ? Number(campaigns[0].target_amount) : 1200000;
  const targetPercent = Math.min(100, Math.round((totalRaised / firstCampaignGoal) * 100));

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1e1b18] flex flex-col font-sans selection:bg-[#ff9500]/20 selection:text-[#2d1600]">
      {/* Navigation Header */}
      <PublicHeader tenant={tenant} currentSlug={params.slug} />

      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Donation Form & Header */}
          <div className="lg:col-span-7 space-y-8">
            <header className="space-y-3">
              <div className="flex items-center gap-1.5 text-[#8c5000] text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">church</span>
                <span>Seva & Contributions</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#3A3530] uppercase tracking-tight font-headline-lg">
                Support the Grand {tenant.name} Celebrations
              </h1>
              <p className="text-xs md:text-sm text-[#554334] max-w-2xl leading-relaxed">
                Your contribution helps us maintain our sacred traditions, support local artisans, and organize community feasts (Bhandara) for thousands of devotees.
              </p>
            </header>

            {/* Donation Form Card */}
            <div className="bg-white border border-[#E8E2D6] rounded-3xl p-6 md:p-8 shadow-sm saffron-glow">
              <DonationForm tenantId={tenant.id} campaigns={campaigns || []} primaryColor={primaryColor} />
            </div>

            {/* Trust Markers */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-4 bg-[#F4F1EB] rounded-2xl border border-[#E8E2D6] text-center">
                <span className="material-symbols-outlined text-[#8c5000] mb-1.5">security</span>
                <span className="text-[10px] font-bold text-[#554334] uppercase tracking-wider">SSL Secure</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-[#F4F1EB] rounded-2xl border border-[#E8E2D6] text-center">
                <span className="material-symbols-outlined text-[#8c5000] mb-1.5">verified</span>
                <span className="text-[10px] font-bold text-[#554334] uppercase tracking-wider">80G Certified</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-[#F4F1EB] rounded-2xl border border-[#E8E2D6] text-center">
                <span className="material-symbols-outlined text-[#8c5000] mb-1.5">receipt_long</span>
                <span className="text-[10px] font-bold text-[#554334] uppercase tracking-wider">Instant Receipt</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-[#F4F1EB] rounded-2xl border border-[#E8E2D6] text-center">
                <span className="material-symbols-outlined text-[#8c5000] mb-1.5">account_balance</span>
                <span className="text-[10px] font-bold text-[#554334] uppercase tracking-wider">Audited Trust</span>
              </div>
            </div>
          </div>

          {/* Right Column: Contributor Leaderboard & Goals */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Live Leaderboard */}
            <aside className="bg-white border border-[#E8E2D6] rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-[#E8E2D6] bg-[#F4F1EB]/50 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-[#3A3530] text-sm uppercase tracking-wider">Top Contributors</h3>
                  <p className="text-[9px] font-bold text-[#554334] uppercase tracking-widest mt-0.5">Live updates</p>
                </div>
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D92B2B] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D92B2B]"></span>
                </span>
              </div>

              <div className="divide-y divide-[#E8E2D6]/70">
                {leaderboard.length > 0 ? (
                  leaderboard.map((d, index) => {
                    const donorName = d.is_anonymous ? "Anonymous Donor" : d.donor_name;
                    const dateStr = new Date(d.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    });

                    return (
                      <div key={index} className="p-5 flex items-center justify-between hover:bg-[#FAFAF8] transition-colors">
                        <div className="flex items-center gap-3">
                          {index === 0 ? (
                            <div className="w-9 h-9 rounded-full bg-[#C9921A]/20 flex items-center justify-center text-[#C9921A] shrink-0">
                              <span className="material-symbols-outlined text-sm font-bold">workspace_premium</span>
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#E8E2D6]/50 flex items-center justify-center text-xs font-bold text-[#554334] shrink-0">
                              {index + 1}
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-extrabold text-gray-950 leading-snug">{donorName}</p>
                            <p className="text-[9px] font-extrabold text-gray-400 uppercase mt-0.5">{dateStr}</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-[#8c5000]">₹{Number(d.amount).toLocaleString("en-IN")}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-gray-400 text-xs font-semibold">
                    No confirmed contributions yet. Be the first!
                  </div>
                )}

                {/* Recent Contributions feed */}
                {recentDonations && recentDonations.length > 0 && (
                  <div className="p-5 space-y-3 bg-[#FAFAF8]">
                    <span className="text-[9px] font-extrabold text-[#554334] uppercase tracking-wider block">Recent Activity</span>
                    {recentDonations.map((d, i) => (
                      <div key={i} className="flex justify-between items-center text-xxs font-extrabold text-gray-500 uppercase">
                        <span>{d.is_anonymous ? "Anonymous" : d.donor_name}</span>
                        <span>₹{Number(d.amount).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Goal Widget */}
              <div className="p-6 bg-[#ff9500]/5 border-t border-[#E8E2D6]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold text-[#3A3530] uppercase tracking-wider">Fundraising Goal</span>
                  <span className="text-xs font-black text-[#8c5000]">{targetPercent}%</span>
                </div>
                <div className="w-full bg-[#E8E2D6] rounded-full h-2">
                  <div className="bg-[#ff9500] h-2 rounded-full transition-all duration-300" style={{ width: `${targetPercent}%` }}></div>
                </div>
                <p className="mt-2 text-[10px] font-semibold text-[#554334]">
                  ₹{totalRaised.toLocaleString("en-IN")} raised of ₹{firstCampaignGoal.toLocaleString("en-IN")} target
                </p>
              </div>
            </aside>

            {/* Impact Welfare Card */}
            <div className="relative rounded-3xl overflow-hidden aspect-video group shadow-sm">
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDWVwSSlTnqJe0FrQ-vVc1QPcJWQEdqHNT21nNk8ulmQA4eUxGtjO0s0xXG84CtVnXd7pmRGaQ5P0MIfRpPTIG6juc4CqOgwd_2kp77KuhraxOurvkTG18NxQ1ZME7HPkua3RR6lp7W8R1ZsKP1F9pnMx2KYzgQDi2Jx0H5BgfSSq1LyUJbEL5TTvdGaooZ0wfGg-hv72B7V5Ba3PSCzyxF61guhNzPOWoP0bvq6p90iK0oX5JbwcS0')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3A3530] to-transparent opacity-85" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <h3 className="text-sm font-extrabold uppercase tracking-wide">Where your money goes</h3>
                <p className="text-xxs text-gray-200 leading-relaxed font-medium">
                  Every single rupee directly feeds underprivileged families during community bhandaras and supports traditional local murti artisans.
                </p>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* 9. Specialized Public Slug Footer */}
      <footer className="w-full py-16 bg-[#e9e1dc] border-t border-[#dbc2ad] relative z-10 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-6 max-w-7xl mx-auto text-left">
          
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
