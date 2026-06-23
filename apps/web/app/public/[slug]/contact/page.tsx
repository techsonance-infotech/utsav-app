import React from "react";
import { createServiceRoleClient } from "../../../api/v1/utils";
import Link from "next/link";
import {
  Flame,
  MapPin,
  Mail,
  Phone,
  MessageSquare,
  Globe,
  Clock,
  Compass,
  ArrowRight,
  Sparkles
} from "lucide-react";
import ContactForm from "../../../components/ContactForm";
import PublicHeader from "../../../components/PublicHeader";

interface PublicContactPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PublicContactPageProps) {
  const supabase = createServiceRoleClient();
  const { data: tenant } = await supabase
    .from("tenants")
    .select("name")
    .eq("slug", params.slug)
    .single();

  return {
    title: tenant?.name ? `${tenant.name} | Contact Us 🪔` : "Contact Mandal",
  };
}

export default async function PublicContactPage({ params }: PublicContactPageProps) {
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

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1e1b18] flex flex-col font-sans selection:bg-[#ff9500]/25 selection:text-[#2d1600]">
      {/* Navigation Header */}
      <PublicHeader tenant={tenant} currentSlug={params.slug} />

      <main className="flex-grow">
        {/* 1. Hero Banner Section with Glows */}
        <section className="relative min-h-[380px] flex items-center overflow-hidden py-16 bg-gradient-to-br from-[#2d1b0d] via-[#1e140a] to-[#140d06] text-white">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none z-0 opacity-30"
            style={{ backgroundColor: primaryColor }} />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none z-0" />

          <div className="relative z-10 px-6 max-w-7xl mx-auto w-full text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
              <span className="material-symbols-outlined text-sm text-[#ff9500] animate-pulse">contact_support</span>
              <span className="text-[10px] uppercase tracking-widest text-[#ffdcbf] font-black">Support Desk</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight uppercase leading-tight font-headline-lg max-w-3xl mx-auto">
              Get in Touch with <span style={{ color: primaryColor }}>Our Committee</span>
            </h1>
            <p className="text-xs md:text-sm text-gray-300 max-w-lg mx-auto leading-relaxed">
              We welcome devotee feedback, volunteering applications, and festival sponsorship proposals. Send us a message or find our official coordinates below.
            </p>
          </div>
        </section>

        {/* 2. Main Content Grid (Contact Form + Bento Coordinate Sidebar) */}
        <section className="py-16 px-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Contact Form Container Card */}
            <div className="lg:col-span-7 bg-white border border-[#E8E2D6] rounded-[32px] p-6 md:p-10 shadow-xxs">
              <div className="space-y-2 mb-8">
                <span className="text-[#8c5000] text-xs font-black uppercase tracking-widest">Devotee Desk</span>
                <h2 className="text-2xl font-black text-[#3A3530] uppercase tracking-tight">Send Us a Message</h2>
                <div className="h-1 w-16 rounded-full" style={{ backgroundColor: primaryColor }} />
              </div>
              
              <ContactForm />
            </div>

            {/* Right Column: Bento Sidebar Coordinates */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Card 1: Official Coordinates */}
              <div className="bg-white border border-[#E8E2D6] rounded-3xl p-6 md:p-8 shadow-xxs space-y-6">
                <h3 className="font-black text-xs text-[#8c5000] uppercase tracking-wider border-b border-[#E8E2D6]/60 pb-3">Official Coordinates</h3>
                
                <div className="space-y-5 text-xs">
                  {/* Address */}
                  <div className="flex gap-4 items-start">
                    <div className="p-2.5 bg-[#8c5000]/5 rounded-2xl text-[#8c5000] border border-[#8c5000]/10 shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Office Address</span>
                      <span className="text-xs font-bold text-[#3A3530] leading-relaxed block">{tenant.address || "Pandal Premises, Mumbai"}</span>
                      <span className="text-[10px] text-gray-500 font-semibold block">{tenant.city}, {tenant.state}</span>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex gap-4 items-start">
                    <div className="p-2.5 bg-[#8c5000]/5 rounded-2xl text-[#8c5000] border border-[#8c5000]/10 shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Email Address</span>
                      <span className="text-xs font-bold text-[#3A3530] block">support@utsavapp.in</span>
                      <span className="text-[10px] text-gray-500 font-semibold block">Expect a reply within 24 hours</span>
                    </div>
                  </div>

                  {/* Website */}
                  {tenant.website_url && (
                    <div className="flex gap-4 items-start">
                      <div className="p-2.5 bg-[#8c5000]/5 rounded-2xl text-[#8c5000] border border-[#8c5000]/10 shrink-0">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Official Website</span>
                        <a
                          href={tenant.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-black text-[#ff9500] hover:underline block"
                        >
                          {tenant.website_url.replace("https://", "").replace("http://", "")}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Darshan Schedules */}
              <div className="bg-[#F4F1EB]/50 border border-[#E8E2D6] rounded-3xl p-6 md:p-8 shadow-xxs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-[#E8E2D6]/80 flex items-center justify-center text-[#ff9500] shadow-xxs">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-[#3A3530] uppercase">Darshan schedules</h4>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Regular festive timings</p>
                  </div>
                </div>
                
                <p className="text-xs text-[#554334] leading-relaxed font-semibold">
                  Mandal premises are open daily during festive seasons from 6:00 AM to 10:00 PM. Morning Pooja begins at 7:30 AM and Evening Aarti starts at 8:00 PM. All devotees are welcome.
                </p>
              </div>

              {/* Card 3: WhatsApp Group Invitation */}
              {tenant.whatsapp_group_url && (
                <a
                  href={tenant.whatsapp_group_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full py-4 px-6 bg-white border border-[#E8E2D6] hover:border-[#25D366] rounded-3xl font-black transition-all flex items-center justify-between text-xs text-[#3A3530] shadow-xxs hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💬</span>
                    <div className="text-left">
                      <span className="block font-black uppercase text-[#128C7E]">Join WhatsApp Group</span>
                      <span className="block text-[10px] text-gray-400 font-semibold normal-case mt-0.5">Stay updated with daily aarti broadcasts & announcements</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#25D366] group-hover:translate-x-1 transition-all" />
                </a>
              )}

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
