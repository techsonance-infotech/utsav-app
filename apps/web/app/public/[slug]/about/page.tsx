import React from "react";
import { createServiceRoleClient } from "../../../api/v1/utils";
import Link from "next/link";
import {
  Flame,
  Globe,
  MapPin,
  Calendar,
  Layers,
  Heart,
  Phone,
  Shield,
  Sparkles,
  Users,
  Award,
  ArrowRight,
  Clock
} from "lucide-react";
import PublicHeader from "../../../components/PublicHeader";

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

  const primaryColor = tenant.primary_color || "#ff9500";

  // Mandal leadership/committee
  const committee = [
    {
      name: "Rajesh K. Salvi",
      role: "Mandal President & Chief Trustee",
      initials: "RS",
      desc: "Liaisons with local municipal bodies and governs security coordination during high-volume Darshan timings.",
      tenure: "9 Years"
    },
    {
      name: "Girish S. Deshmukh",
      role: "Secretary & Events Lead",
      initials: "GD",
      desc: "Manages pandal curation, cultural scheduling, vendor negotiations, and developer-outreach projects.",
      tenure: "7 Years"
    },
    {
      name: "Amit M. Rane",
      role: "Treasurer & Accounts Head",
      initials: "AR",
      desc: "Oversees audit compliance, financial bookkeeping, online collection systems, and donation disclosures.",
      tenure: "11 Years"
    },
    {
      name: "Sneha P. Joshi",
      role: "Volunteer Coordinator",
      initials: "SJ",
      desc: "Commands the 250+ volunteer task force across prasad, queue direction, and emergency response teams.",
      tenure: "4 Years"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1e1b18] flex flex-col font-sans selection:bg-[#ff9500]/25 selection:text-[#2d1600]">
      {/* Navigation Header */}
      <PublicHeader tenant={tenant} currentSlug={params.slug} />

      <main className="flex-grow">
        {/* 1. Premium Hero Section with Glows */}
        <section className="relative min-h-[440px] flex items-center overflow-hidden py-20 bg-gradient-to-br from-[#2d1b0d] via-[#1e140a] to-[#140d06] text-white">
          {/* Subtle grid pattern & color glows */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none z-0 opacity-40"
            style={{ backgroundColor: primaryColor }} />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none z-0" />

          <div className="relative z-10 px-6 max-w-7xl mx-auto w-full text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
              <span className="material-symbols-outlined text-sm text-[#ff9500] animate-pulse">temple_hindu</span>
              <span className="text-[10px] uppercase tracking-widest text-[#ffdcbf] font-black">Spiritual Legacy</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight uppercase leading-tight font-headline-lg max-w-4xl mx-auto">
              Our Journey of <span style={{ color: primaryColor }}>Devotion & Service</span>
            </h1>
            <p className="text-xs md:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
              Serving the community for over a decade. Discover the core values, organizational structure, and societal welfare projects backing {tenant.name}.
            </p>
          </div>
        </section>

        {/* 2. Impact & Metrics Section (Dark theme bento cards) */}
        <section className="relative py-20 px-6 bg-[#2d2722] text-white border-y border-[#3A3530]">
          <div className="max-w-7xl mx-auto w-full">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-[#ff9500] text-xs font-black uppercase tracking-widest">Mandal Vitality</span>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-1">Community Impact Metrics</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { count: tenant.founded_year || "2012", label: "Year Established", icon: <Calendar className="w-5 h-5 text-[#ff9500]" /> },
                { count: "250+", label: "Active Volunteers", icon: <Users className="w-5 h-5 text-[#ff9500]" /> },
                { count: "10,000+", label: "Devotees Served Daily", icon: <Sparkles className="w-5 h-5 text-[#ff9500]" /> },
                { count: "12+", label: "Charity Operations", icon: <Heart className="w-5 h-5 text-[#ff9500]" /> }
              ].map((stat, idx) => (
                <div key={stat.label} className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xs flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/[0.04] flex items-center justify-center">
                    {stat.icon}
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-white font-mono tracking-tight">{stat.count}</div>
                  <div className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Narrative & Mission Section */}
        <section className="py-20 px-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[#8c5000] text-xs font-black uppercase tracking-widest block">Mandal Profile</span>
              <h3 className="text-3xl font-extrabold text-[#3A3530] uppercase tracking-tight font-headline-lg">
                About the {tenant.name}
              </h3>
              <div className="h-1 w-20 rounded-full" style={{ backgroundColor: primaryColor }} />
              
              <p className="text-xs md:text-sm text-[#554334] leading-relaxed font-semibold">
                {tenant.description || "Welcome to our Utsav Mandal portal. Here we publish our festival timelines, secure donations, and manage volunteer activities."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold pt-4">
                <div className="flex items-center gap-2 text-[#554334]">
                  <Flame className="w-4 h-4 text-[#ff9500]" />
                  <span>Daily Pooja & Aarti Curation</span>
                </div>
                <div className="flex items-center gap-2 text-[#554334]">
                  <Shield className="w-4 h-4 text-[#ff9500]" />
                  <span>ISO Audit Verified Queue Systems</span>
                </div>
                <div className="flex items-center gap-2 text-[#554334]">
                  <Award className="w-4 h-4 text-[#ff9500]" />
                  <span>Cultural Classical Seminars</span>
                </div>
                <div className="flex items-center gap-2 text-[#554334]">
                  <Globe className="w-4 h-4 text-[#ff9500]" />
                  <span>Global Devotee Broadcasts</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#F4F1EB] rounded-[36px] p-8 border border-[#E8E2D6]/80 space-y-6">
              <h4 className="text-sm font-black uppercase text-[#8c5000] tracking-wider">Social Responsibility Programs</h4>
              
              <div className="space-y-4">
                {[
                  {
                    title: "Vidya Prasadam (Educational Aid)",
                    desc: "Every year we sponsor textbooks, notebooks, and digital accessories for up to 300+ students from low-income households in our local municipal schools."
                  },
                  {
                    title: "Arogya Seva (Free Diagnostics)",
                    desc: "Collaborating with leading civic hospitals to host open dental, vision, and diabetes checkups during the 10 days of Ganeshotsav celebration."
                  },
                  {
                    title: "Jal & Bhojan Prasadam (Devotee Meals)",
                    desc: "Daily hot meals served to every devotee visiting the pandal, prepared under strict hygiene supervision inside our centralized community kitchen."
                  }
                ].map((item) => (
                  <div key={item.title} className="p-4 bg-white rounded-2xl border border-[#E8E2D6]/60 flex gap-4">
                    <div className="h-8 w-8 rounded-full bg-[#ff9500]/10 flex items-center justify-center shrink-0 text-[#ff9500]">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-[#3A3530] uppercase">{item.title}</h5>
                      <p className="text-[11px] text-[#554334] font-medium leading-relaxed mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Leadership / Committee Section */}
        <section className="py-20 bg-[#F4F1EB]/30 border-t border-[#E8E2D6]/40 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-[#8c5000] text-xs font-black uppercase tracking-widest">Mandal Trust</span>
              <h2 className="text-3xl font-black text-[#3A3530] uppercase tracking-tight mt-1 font-headline-lg">
                Committee & Office Bearers
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {committee.map((c) => (
                <div key={c.name} className="bg-white border border-[#E8E2D6]/80 p-6 rounded-3xl shadow-xxs hover:shadow-md hover:border-[#ff9500]/30 transition-all flex flex-col justify-between group">
                  <div className="space-y-4">
                    {/* Circle initials mockup */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#8c5000] to-[#ff9500] text-white flex items-center justify-center font-black text-lg shadow-inner shadow-black/10 group-hover:scale-105 transition-transform">
                      {c.initials}
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-black text-[#3A3530] uppercase tracking-tight">{c.name}</h4>
                      <p className="text-[10px] font-bold text-[#8c5000] uppercase mt-0.5">{c.role}</p>
                    </div>
                    
                    <p className="text-[11px] text-[#554334] font-medium leading-relaxed">{c.desc}</p>
                  </div>
                  
                  <div className="border-t border-[#E8E2D6]/50 pt-4 mt-6 flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-[#554334]">
                    <span>Tenure</span>
                    <span className="text-[#ff9500]">{c.tenure}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Address & Location Coordinates */}
        <section className="py-20 px-6 max-w-7xl mx-auto w-full">
          <div className="bg-white border border-[#E8E2D6] rounded-[36px] p-8 md:p-12 shadow-xxs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[#8c5000] text-xs font-black uppercase tracking-widest block">Find Us</span>
              <h3 className="text-3xl font-extrabold text-[#3A3530] uppercase tracking-tight font-headline-lg">
                Mandal Premises Location
              </h3>
              
              <div className="space-y-4 text-xs">
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-[#8c5000]/10 flex items-center justify-center text-[#8c5000] shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-black text-[#3A3530] uppercase">Mandal Address</h5>
                    <p className="text-gray-500 font-medium leading-relaxed mt-0.5">{tenant.address || "N/A"}</p>
                    <p className="text-gray-500 font-bold">{tenant.city}, {tenant.state}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-[#8c5000]/10 flex items-center justify-center text-[#8c5000] shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-black text-[#3A3530] uppercase">Darshan Timing Guidelines</h5>
                    <p className="text-gray-500 font-medium leading-relaxed mt-0.5">premises open daily during festivity from 06:00 AM - 10:00 PM.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <Link href={`/${params.slug}/contact`} className="h-11 px-6 bg-[#8c5000] hover:bg-[#8c5000]/90 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all">
                  Contact Committee
                  <ArrowRight className="w-4 h-4" />
                </Link>
                {tenant.whatsapp_group_url && (
                  <a href={tenant.whatsapp_group_url} target="_blank" rel="noopener noreferrer" className="h-11 px-6 border border-[#E8E2D6] hover:bg-[#F4F1EB] text-[#3A3530] rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all">
                    WhatsApp Group
                  </a>
                )}
              </div>
            </div>

            <div className="lg:col-span-6 h-64 md:h-80 w-full bg-[#F4F1EB] rounded-3xl border border-[#E8E2D6]/80 flex flex-col items-center justify-center text-center p-6 gap-4">
              <span className="text-3xl">🗺️</span>
              <div>
                <h4 className="font-black text-sm text-[#3A3530] uppercase">Interactive Pandal Map</h4>
                <p className="text-xxs text-[#554334] font-semibold mt-1 max-w-xs leading-relaxed">Map representation of visitor paths, prasadam counters, and VIP queues.</p>
              </div>
              <span className="text-[10px] font-mono text-[#8c5000]/80 uppercase tracking-widest bg-[#8c5000]/5 px-3 py-1 rounded-full border border-[#8c5000]/10">
                Lat: 19.0760° N | Lon: 72.8777° E
              </span>
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
