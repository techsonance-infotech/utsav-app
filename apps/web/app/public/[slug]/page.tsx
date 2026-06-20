import React from "react";
import { createServiceRoleClient } from "../../api/v1/utils";
import Link from "next/link";
import {
  Flame,
  Calendar as CalendarIcon,
  MapPin,
  Heart,
  TrendingUp,
  Clock,
  ExternalLink,
  BookOpen,
  Users,
  Compass,
  ShieldCheck,
  HeartHandshake,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Award,
  Phone,
  Mail,
  Globe,
} from "lucide-react";
import Countdown from "../../components/Countdown";
import PublicHeader from "../../components/PublicHeader";

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
        <div className="text-center p-8 bg-white shadow-xl rounded-2xl max-w-md border border-gray-150">
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

  // Fetch latest blog posts
  const { data: blogPosts } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(3);

  // Fetch donation statistics (sum confirmed payments)
  const { data: donations } = await supabase
    .from("donations")
    .select("amount, donor_name, is_anonymous")
    .eq("tenant_id", tenant.id)
    .eq("status", "confirmed");

  const totalRaised = donations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
  const donorCount = donations?.length || 0;

  const primaryColor = tenant.primary_color || "#8c5000";

  // Use the first upcoming event as countdown target, or default to 10 days from now
  const nextEventDate = events && events.length > 0 ? events[0].start_at : new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
  const nextEventTitle = events && events.length > 0 ? events[0].title : "Ganesha Utsav Celebration";

  // Target Goal Calculation
  const firstCampaignGoal = campaigns && campaigns[0]?.target_amount ? Number(campaigns[0].target_amount) : 1200000;
  const targetPercent = Math.min(100, Math.round((totalRaised / firstCampaignGoal) * 100));

  const heroBannerUrl = tenant.banner_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuBVZZt4iSi3fvyIFQ_NmTscZLu3uopBcwlhP4ds7bBst43jQjhV-Ej8Erf8ZLnuuLprpYklRh4BNuig_QYfhDWyHJWNYBDtkLZGbB_88xLnz58d62ClLM4Va83iDgcDgL2MgKv4WSig957vNMTl1l6gooy18WupixTRATyQS89xiTz5blwNUSZLJAhhWzePRxi8fYExSPZiQtwT9H_F-eXH74c9Sqjg9BETwX3oKi55URxmHlx6V1J8";

  // Gallery Showcase Mock Data (High Quality Devotional Images)
  const galleryItems = [
    {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2qD57JRgDD3hbS5r_mIAwXxp4iCayw1uPF56yMr3hBJrbmCXUIklOdpAoY5N8xI3jagGv-s0-zCP6ESC1RdXHzI6Y0EvxWViTxAYEdzGMqRfqcWf9lqT3Os5Bo7ilEQ3MIevo8z9D4W8WPbhPqgcjVZuoR1uhoh0TPWUmBIROpdRJA14SRm6ZRUJ5f5HNHHtRvjK4YyvXG8ixnTek157eZc8uHFoYGFFyuYGwCBPodlgrMLxaREg9",
      caption: "Grand Welcoming Aarti"
    },
    {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFXWc1RplQp8Bv6fC_JqL-aKxHlA7J6qJszNq3vK6Xz4P4hKj7e9xY8=s600",
      caption: "Floral Mandala Decoration"
    },
    {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDblUUQ1VHaJlc4tTNf-mXX3Grx1-3_hxvrR_sWYfez9PQv7fkqqmOr1gFJuHl8Au47_GT9KGXKPtW0v4uOcMwZgZqYQFTjg39p5aQqxJPmniZ4tqbVoIR1c7UG7OfOBXbXY5focFaVTo5U2PeTJ6CdTw-nXZrkj3urH2F8r9llw7PQQYq4CGu7fja1mdFCW7RrV-cZXB8UqkLiaviTwA1-wkm1V21_U02YtDdejk3hl0lHiyC-Nuqn",
      caption: "Devotees Offering Modaks"
    },
    {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAT58zneVXyqcTn-aBZswuJPUITnrSepi8vsxg-1oaFZiG-WRn_eUn5jVdULT9p-VZMC4mu5hwL5iwL9TZXXQlcHdY98ULenaT3AYiCPXO2BVztCW1SVyHgULd8ybRVApkYiR0wis6rKvy3PzhkV9iqjPz_BjPYUFH9vGihKBG0oXGUDFvBaVdAGWGWVgAV4uHl0oQlo1ZpQe3fkX7cZBqvWgWPmH8oNG9AdQ3DXIIzs5FhUXTPbl0H",
      caption: "Visarjan Shobhayatra"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1e1b18] flex flex-col font-sans selection:bg-[#ff9500]/20 selection:text-[#2d1600]">
      {/* Navigation Header */}
      <PublicHeader tenant={tenant} currentSlug={params.slug} />

      <main className="flex-grow">
        
        {/* 1. Hero Banner with Ganesha cover & countdown */}
        <section className="relative min-h-[660px] flex items-center overflow-hidden py-16">
          <div className="absolute inset-0 z-0">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url('${heroBannerUrl}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#3A3530]/95 via-[#3A3530]/65 to-transparent" />
          </div>
          <div className="relative z-10 px-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Heading and info */}
            <div className="lg:col-span-7 text-white space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#ff9500]/20 backdrop-blur-md rounded-full border border-[#ff9500]/30">
                <span className="material-symbols-outlined text-[#ff9500] text-sm animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
                  celebration
                </span>
                <span className="text-xs uppercase tracking-widest text-[#ffdcbf] font-black">
                  {tenant.vertical?.toUpperCase() || "GANESH"} UTSAV 2026
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight uppercase font-headline-lg">
                {tenant.name}
              </h1>
              <p className="text-xs md:text-sm text-gray-200 max-w-lg leading-relaxed font-medium">
                {tenant.description || "Welcome to our digital home. Check timings, read devotional news bulletins, monitor fund progression, and join volunteer rosters."}
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href={`/${params.slug}/donate`}
                  className="px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider text-[#2d1600] flex items-center gap-2 hover:scale-[1.02] active:scale-98 transition-all shadow-md shadow-orange-500/10"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="material-symbols-outlined text-sm">volunteer_activism</span>
                  Donate Now
                </Link>
                <Link
                  href={`/${params.slug}/events`}
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  View Events
                </Link>
              </div>
            </div>

            {/* Right Column: Countdown Bento Card */}
            <div className="lg:col-span-5 bg-white/95 backdrop-blur-md border border-[#E8E2D6]/40 p-6 md:p-8 rounded-3xl shadow-xl flex flex-col justify-between saffron-glow">
              <div>
                <h3 className="font-extrabold text-[#8c5000] text-sm mb-6 text-center uppercase tracking-wider">
                  Next Celebration: <span className="text-[#ff9500] block mt-1 normal-case font-black text-base">{nextEventTitle}</span>
                </h3>
                <Countdown targetDate={nextEventDate} />
              </div>
              
              <div className="mt-8 p-4 bg-[#8c5000]/5 rounded-2xl border border-[#8c5000]/10 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-[#8c5000]/10 flex items-center justify-center text-[#8c5000] shrink-0">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#8c5000] uppercase">Mandal Location</p>
                  <p className="text-[11px] text-[#554334] font-medium truncate">{tenant.city || "Mumbai"}, {tenant.state || "MH"}</p>
                </div>
              </div>
            </div>

          </div>
      </section>

      {/* 2. About Section with core stats bento */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full" id="about">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-6">
            <span className="text-[#8c5000] text-xs font-black uppercase tracking-widest block">
              About the Mandal
            </span>
            <h2 className="text-3xl font-black text-[#3A3530] uppercase tracking-tight leading-tight">
              Preserving culture, building community
            </h2>
            <p className="text-xs text-[#554334] leading-relaxed font-semibold">
              Established with the goal of bringing devotees together under one sacred canopy, our committee hosts annual festivities, charity drives, and spiritual learning programs.
            </p>
            <div className="space-y-4 pt-2">
              <div className="flex gap-4">
                <span className="w-10 h-10 rounded-xl bg-[#8c5000]/10 text-[#8c5000] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-base">verified</span>
                </span>
                <div>
                  <h4 className="text-xs font-black text-[#3A3530] uppercase">Govt. Registered Trust</h4>
                  <p className="text-[10px] text-[#554334] font-semibold mt-1">Operating with complete transparency, regular audits, and public financial logs.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="w-10 h-10 rounded-xl bg-[#ff9500]/10 text-[#ff9500] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-base">favorite</span>
                </span>
                <div>
                  <h4 className="text-xs font-black text-[#3A3530] uppercase">Social Welfare Drives</h4>
                  <p className="text-[10px] text-[#554334] font-semibold mt-1">Funding medical clinics, children education, and disaster relief campaigns.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 gap-6 w-full">
            <div className="bg-[#F4F1EB] border border-[#E8E2D6] rounded-3xl p-6 space-y-2">
              <span className="material-symbols-outlined text-[#8c5000] text-3xl">hourglass_empty</span>
              <p className="text-2xl font-black text-[#3A3530]">{tenant.founded_year || "2018"}</p>
              <p className="text-[10px] text-[#554334] font-bold uppercase tracking-wider">Year Established</p>
            </div>
            
            <div className="bg-[#3A3530] text-white rounded-3xl p-6 space-y-2">
              <span className="material-symbols-outlined text-[#ff9500] text-3xl">groups</span>
              <p className="text-2xl font-black">45 Members</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Committee Staff</p>
            </div>

            <div className="bg-white border border-[#E8E2D6] rounded-3xl p-6 space-y-2 shadow-xxs">
              <span className="material-symbols-outlined text-[#ff9500] text-3xl">volunteer_activism</span>
              <p className="text-2xl font-black text-[#3A3530]">350+ Volunteers</p>
              <p className="text-[10px] text-[#554334] font-bold uppercase tracking-wider">Active Devotees</p>
            </div>

            <div className="bg-[#F4F1EB] border border-[#E8E2D6] rounded-3xl p-6 space-y-2">
              <span className="material-symbols-outlined text-[#8c5000] text-3xl">local_activity</span>
              <p className="text-2xl font-black text-[#3A3530]">25k+ Engaged</p>
              <p className="text-[10px] text-[#554334] font-bold uppercase tracking-wider">Annual Visitors</p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Donation progress section */}
      <section className="py-12 bg-[#F4F1EB]/30 border-y border-[#E8E2D6]/40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xs border border-[#E8E2D6] flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="md:w-1/3 space-y-4">
              <h2 className="text-2xl font-black text-[#8c5000] uppercase tracking-tight leading-none">Utsav Campaign Target</h2>
              <p className="text-xs text-[#554334] leading-relaxed font-semibold">Support operations, security, Prasad distribution, and pandal structures.</p>
              <div className="flex items-center gap-2 pt-2">
                <div className="flex -space-x-3">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-[#F4F1EB] flex items-center justify-center text-[9px] font-black text-[#8c5000]">RK</div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-[#E8E2D6] flex items-center justify-center text-[9px] font-black text-[#8c5000]">GS</div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-orange-100 flex items-center justify-center text-[9px] font-black text-[#8c5000]">AM</div>
                </div>
                <span className="text-[9px] font-black text-[#554334] uppercase tracking-wider">{donorCount} Devotees Contributed</span>
              </div>
            </div>
            
            <div className="flex-1 w-full space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[9px] font-black text-[#554334] uppercase tracking-widest block">Funds Gathered</span>
                  <span className="text-2xl font-black text-[#8c5000]">₹{totalRaised.toLocaleString("en-IN")} <span className="text-xs text-[#554334] font-bold uppercase">/ ₹{firstCampaignGoal.toLocaleString("en-IN")}</span></span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-[#22C55E] block">{targetPercent}%</span>
                  <span className="text-[9px] text-[#554334] font-bold uppercase tracking-wider block">Completed</span>
                </div>
              </div>
              
              <div className="w-full h-3.5 bg-[#E8E2D6] rounded-full overflow-hidden">
                <div className="h-full bg-[#ff9500] rounded-full relative overflow-hidden transition-all duration-500" style={{ width: `${targetPercent}%` }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2.5s_infinite_linear]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Events Timeline Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full" id="events">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[#8c5000] text-xs font-black uppercase tracking-widest">
            Utsav Schedule
          </span>
          <h2 className="text-3xl font-black text-[#3A3530] uppercase tracking-tight mt-1 font-headline-lg">
            Upcoming Festival Events
          </h2>
          <p className="text-xs text-[#554334] font-semibold mt-1">
            Join the rituals, dynamic processions, and special cultural programs planned this season.
          </p>
        </div>

        <div className="relative border-l-2 border-[#E8E2D6] pl-6 md:pl-10 space-y-12 max-w-3xl mx-auto">
          {events && events.length > 0 ? (
            events.map((e, index) => {
              const evDate = new Date(e.start_at);
              const formattedTime = evDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
              const formattedDay = evDate.toLocaleDateString("en-IN", { day: "numeric", month: "long" });

              return (
                <div key={e.id} className="relative group">
                  {/* Timeline indicator Diya */}
                  <span className="absolute -left-[35px] md:-left-[51px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-[#8c5000] text-[#8c5000] text-[10px] font-bold shadow-xs">
                    🪔
                  </span>
                  
                  <div className="bg-white border border-[#E8E2D6] p-6 rounded-2xl shadow-xxs hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                      <span className="text-[#8c5000] text-[10px] font-black uppercase tracking-widest">
                        {formattedDay} &bull; {formattedTime}
                      </span>
                      <span className="w-fit px-2.5 py-0.5 rounded-lg bg-[#F4F1EB] text-[#554334] text-[8px] font-black uppercase tracking-wider">
                        {e.location_name || "Mandal Pandal"}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-[#3A3530] mt-2 group-hover:text-[#8c5000] transition-colors uppercase">
                      {e.title}
                    </h3>
                    <p className="text-xs text-[#554334] leading-relaxed mt-2 font-medium">
                      {e.description || "Devotees are requested to join on time for the distribution of holy Prasad."}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white border border-dashed border-[#E8E2D6]/85 p-12 rounded-3xl text-center text-gray-500 text-xs font-semibold">
              No upcoming events registered at this time.
            </div>
          )}
        </div>
      </section>

      {/* 5. Bulletins/News Section */}
      <section className="py-20 bg-[#F4F1EB]/30 border-y border-[#E8E2D6]/40 px-6" id="news">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <span className="text-[#8c5000] text-xs font-black uppercase tracking-widest block">
                Announcements
              </span>
              <h2 className="text-3xl font-black text-[#3A3530] uppercase tracking-tight mt-1 font-headline-lg">
                Mandal Bulletins
              </h2>
            </div>
            <Link
              href={`/${params.slug}/news`}
              className="text-xs font-black text-[#8c5000] border-b border-[#8c5000]/25 pb-0.5 uppercase tracking-widest hover:border-[#8c5000] transition-all"
            >
              All Bulletins &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {news && news.length > 0 ? (
              news.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-3xl border border-[#E8E2D6] p-5 flex flex-col justify-between hover:shadow-md transition-all group overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="h-44 w-full rounded-2xl overflow-hidden relative bg-zinc-50 border border-gray-100">
                      <img
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        alt={item.title}
                        src={item.banner_image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuAT58zneVXyqcTn-aBZswuJPUITnrSepi8vsxg-1oaFZiG-WRn_eUn5jVdULT9p-VZMC4mu5hwL5iwL9TZXXQlcHdY98ULenaT3AYiCPXO2BVztCW1SVyHgULd8ybRVApkYiR0wis6rKvy3PzhkV9iqjPz_BjPYUFH9vGihKBG0oXGUDFvBaVdAGWGWVgAV4uHl0oQlo1ZpQe3fkX7cZBqvWgWPmH8oNG9AdQ3DXIIzs5FhUXTPbl0H"}
                      />
                      <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs text-[#8c5000] px-2.5 py-1 rounded-lg font-bold text-[9px] uppercase tracking-wider border border-[#8c5000]/10 shadow-xs">
                        {item.category || "General"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-extrabold text-base text-[#3A3530] group-hover:text-[#8c5000] transition-colors leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#554334] line-clamp-3 leading-relaxed">
                        {item.summary || "Read the latest update from our Mandal."}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 mt-6 flex items-center justify-between text-[10px] font-bold text-gray-400">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">calendar_month</span>
                      {new Date(item.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <Link href={`/${params.slug}/news`} className="text-[#8c5000] flex items-center gap-1 hover:underline uppercase tracking-wider">
                      Read More
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="col-span-3 bg-white border border-dashed border-[#E8E2D6]/80 p-12 rounded-3xl text-center text-gray-500 text-xs">
                No recent announcements published.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. Blog Highlights Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full" id="blog">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <span className="text-[#8c5000] text-xs font-black uppercase tracking-widest block">
              Spiritual Read
            </span>
            <h2 className="text-3xl font-black text-[#3A3530] uppercase tracking-tight mt-1 font-headline-lg">
              Spiritual Stories & Logs
            </h2>
          </div>
          <Link
            href={`/${params.slug}/blog`}
            className="text-xs font-black text-[#8c5000] border-b border-[#8c5000]/25 pb-0.5 uppercase tracking-widest hover:border-[#8c5000] transition-all"
          >
            All Articles &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts && blogPosts.length > 0 ? (
            blogPosts.map((post) => {
              const pubDate = post.published_at ? new Date(post.published_at) : new Date(post.created_at);
              return (
                <Link key={post.id} href={`/${params.slug}/blog/${post.slug}`} className="group block h-full">
                  <article className="bg-white rounded-3xl border border-[#E8E2D6] p-5 h-full flex flex-col justify-between hover:shadow-md transition-all overflow-hidden">
                    <div className="space-y-4">
                      <div className="h-44 w-full rounded-2xl overflow-hidden relative bg-zinc-50 border border-gray-100">
                        <img
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                          alt={post.title}
                          src={post.cover_image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDFXWc1RplQp8Bv6fC_JqL-aKxHlA7J6qJszNq3vK6Xz4P4hKj7e9xY8=s600"}
                        />
                        <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs text-[#8c5000] px-2.5 py-1 rounded-lg font-bold text-[9px] uppercase tracking-wider border border-[#8c5000]/10 shadow-xs">
                          {post.category || "Devotional"}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-extrabold text-base text-[#3A3530] group-hover:text-[#8c5000] transition-colors leading-snug line-clamp-2 uppercase">
                          {post.title}
                        </h3>
                        <p className="text-xs text-[#554334] line-clamp-3 leading-relaxed font-semibold">
                          {post.excerpt || "Read full spiritual updates and cultural significance explanations."}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 mt-6 flex items-center justify-between text-[10px] font-bold text-gray-400">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">calendar_month</span>
                        {pubDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      {post.estimated_read_mins && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">schedule</span>
                          {post.estimated_read_mins} min read
                        </span>
                      )}
                    </div>
                  </article>
                </Link>
              );
            })
          ) : (
            <div className="col-span-3 bg-white border border-dashed border-[#E8E2D6]/80 p-12 rounded-3xl text-center text-gray-500 text-xs">
              No recent blog posts published.
            </div>
          )}
        </div>
      </section>

      {/* 7. Gallery Showcase Section */}
      <section className="py-20 bg-[#F4F1EB]/30 border-y border-[#E8E2D6]/40 px-6" id="gallery">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[#8c5000] text-xs font-black uppercase tracking-widest">
              Visual Archives
            </span>
            <h2 className="text-3xl font-black text-[#3A3530] uppercase tracking-tight mt-1 font-headline-lg">
              Mandal Gallery Showcase
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {galleryItems.map((item) => (
              <div
                key={item.caption}
                className="group relative overflow-hidden rounded-3xl border border-[#E8E2D6] aspect-square bg-white shadow-xxs cursor-pointer"
              >
                <img
                  className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-104"
                  alt={item.caption}
                  src={item.url}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5" />
                <div className="absolute bottom-5 left-5 right-5 text-white translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#ff9500]">Utsav Gallery</p>
                  <p className="text-xs font-bold mt-1 line-clamp-1">{item.caption}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href={`/${params.slug}/gallery`}
              className="inline-flex items-center gap-1.5 px-6 py-3.5 bg-white border border-[#E8E2D6] text-[#3A3530] rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#F4F1EB] transition-colors"
            >
              View Full Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Call To Action (Sacred Offering invitation) */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto bg-[#8c5000] rounded-[36px] p-8 md:p-12 text-center text-white relative overflow-hidden shadow-md">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_3s_infinite_linear]" />
          
          <div className="relative z-10 space-y-6 max-w-xl mx-auto">
            <h2 className="text-3xl font-black uppercase tracking-tight leading-none">
              Become a Pillar of the Trust
            </h2>
            <p className="text-xs text-gray-200 font-semibold leading-relaxed">
              Support the running overheads of our holy celebrations. Connect with our committee to register as an active volunteer for duty deployments.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
              <Link
                href={`/${params.slug}/donate`}
                className="h-14 px-8 bg-[#ff9500] hover:bg-orange-655 text-[#2d1600] hover:text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-base">volunteer_activism</span>
                Sacred Offering
              </Link>
              <Link
                href={`/${params.slug}/contact`}
                className="h-14 px-8 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center transition-all"
              >
                Volunteer Signup
              </Link>
            </div>
          </div>
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
              <span className="font-sans font-black text-sm tracking-tight text-[#8c5000] uppercase">
                {tenant.name}
              </span>
            </div>
            <p className="text-[10px] text-[#554334] leading-relaxed font-semibold">
              Operating with devotion, organizing cultural events, and distributing Prasad to thousands of devotees annually.
            </p>
            <p className="text-[9px] text-[#8c5000] font-black uppercase tracking-wider">
              Year Established: {tenant.founded_year || "2018"}
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#3A3530]">Mandal Links</h4>
            <ul className="space-y-2 text-[10px] text-[#554334] font-bold uppercase tracking-wider">
              <li><Link href={`/${params.slug}`} className="hover:text-[#8c5000] transition-all">Home Base</Link></li>
              <li><Link href={`/${params.slug}/about`} className="hover:text-[#8c5000] transition-all">Mandal Profile</Link></li>
              <li><Link href={`/${params.slug}/events`} className="hover:text-[#8c5000] transition-all">Schedules</Link></li>
              <li><Link href={`/${params.slug}/gallery`} className="hover:text-[#8c5000] transition-all">Gallery Archives</Link></li>
              <li><Link href={`/${params.slug}/donate`} className="hover:text-[#8c5000] transition-all">Support Online</Link></li>
            </ul>
          </div>

          {/* Col 3: Sacred Hours Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#3A3530]">Sacred Hours</h4>
            <div className="space-y-2 text-[10px] text-[#554334] font-semibold leading-relaxed">
              <p><strong className="text-[#3A3530] font-black uppercase tracking-wider block">Daily Darshan:</strong> 6:00 AM &ndash; 10:00 PM</p>
              <p><strong className="text-[#3A3530] font-black uppercase tracking-wider block">Prasad Distribution:</strong> 12:30 PM &ndash; 2:30 PM</p>
              <p><strong className="text-[#3A3530] font-black uppercase tracking-wider block">Evening Aarti:</strong> 7:30 PM Daily</p>
            </div>
          </div>

          {/* Col 4: Contact Support details */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#3A3530]">Mandal Office</h4>
            <div className="space-y-2 text-[10px] text-[#554334] font-semibold leading-relaxed">
              <p className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-[#8c5000]">location_on</span>
                {tenant.city || "Mumbai"}, {tenant.state || "MH"}
              </p>
              <p className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-[#8c5000]">mail</span>
                office@{params.slug}.in
              </p>
              <p className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-[#8c5000]">forum</span>
                WhatsApp Group Support
              </p>
            </div>
            
            <p className="text-[9px] text-[#554334] pt-2 border-t border-[#dbc2ad]">
              Powered by <strong className="text-[#8c5000] uppercase tracking-wider font-black">UtsavManager</strong> &copy; {new Date().getFullYear()}
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
