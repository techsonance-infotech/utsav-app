"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  CreditCard,
  ChevronRight,
  PartyPopper,
  Settings,
  ChevronDown,
  Headphones,
  Mail,
  Globe,
  Share2
} from "lucide-react";

export default function HelpCenterPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleAccordion = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const faqs = [
    {
      id: "faq-1",
      question: "How secure are the donation payments?",
      answer:
        "We use bank-grade 256-bit encryption for all transactions. All payment processing is handled by PCI-DSS compliant partners, ensuring that your financial data never touches our servers directly. We also support multi-factor authentication for mandal administrators.",
    },
    {
      id: "faq-2",
      question: "Can we manage multiple mandal committees?",
      answer:
        "Yes, Utsav Enterprise supports hierarchical committee structures. You can create sub-committees for specific events (e.g., Cultural Committee, Security Team) and assign specific permissions and budget views to each role.",
    },
    {
      id: "faq-3",
      question: "What happens after a donor makes a payment?",
      answer:
        "Immediately after a successful transaction, a digital receipt is generated and sent via WhatsApp and Email. The donor also receives a personalized 'Thank You' card with a unique QR code for physical darshan priority if enabled by your committee.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-puja-white font-body-lg text-on-surface min-h-screen selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Top Navigation */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 bg-puja-white/90 backdrop-blur-md border-b border-sandstone transition-all duration-300 ${
          scrolled ? "shadow-md" : "shadow-sm"
        }`}
      >
        <div className="flex items-center h-10">
          <Link href="/login">
            <img
              className="h-10 w-auto object-contain cursor-pointer hover:scale-102 transition-transform"
              alt="Utsav logo"
              src="/logo.png"
            />
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-xl">
          <a
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
            href="#"
          >
            Features
          </a>
          <a
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
            href="#"
          >
            Pricing
          </a>
          <a
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
            href="#"
          >
            About Us
          </a>
          <Link
            className="font-label-md text-label-md text-primary border-b-2 border-primary pb-1"
            href="/help-center"
          >
            Help
          </Link>
        </div>
        <div className="flex items-center gap-md">
          <Link
            href="/login"
            className="font-label-md text-label-md px-lg py-sm text-primary hover:bg-cream rounded-xl transition-all"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="font-label-md text-label-md px-lg py-sm bg-primary-container text-on-primary-container rounded-xl shadow-sm hover:scale-95 transition-transform"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section with Search */}
        <section className="bg-gradient-to-br from-[#FFF8F4] to-[#F4F1EB] relative py-2xl px-margin-mobile md:px-0 flex flex-col items-center justify-center overflow-hidden">
          <div className="relative z-10 max-w-3xl w-full text-center space-y-lg">
            <h1 className="font-display-2xl text-display-2xl text-primary">
              How can we help you today?
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Find resources, guides, and support for your Utsav experience.
            </p>
            <div
              className={`relative max-w-2xl mx-auto mt-xl group transition-all duration-300 ${
                focused
                  ? "scale-[1.01] shadow-[0_0_30px_rgba(255,149,0,0.3)]"
                  : "shadow-[0_0_25px_rgba(255,149,0,0.15)]"
              }`}
            >
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary h-6 w-6 pointer-events-none" />
              <input
                className="w-full h-16 pl-16 pr-6 rounded-2xl border-sandstone bg-puja-white shadow-md focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all text-body-lg"
                placeholder="Search for donations, events, technical guides..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />
            </div>
            <div className="flex flex-wrap justify-center gap-md mt-md">
              <span className="text-label-sm font-label-sm text-on-surface-variant">
                Popular:
              </span>
              <button
                onClick={() => setSearchQuery("UPI")}
                className="text-label-sm font-label-sm text-primary hover:underline"
              >
                Setting up UPI
              </button>
              <button
                onClick={() => setSearchQuery("registration")}
                className="text-label-sm font-label-sm text-primary hover:underline"
              >
                Member registration
              </button>
              <button
                onClick={() => setSearchQuery("report")}
                className="text-label-sm font-label-sm text-primary hover:underline"
              >
                PDF Reports
              </button>
            </div>
          </div>
        </section>

        {/* Category Bento Grid */}
        <section className="max-w-[1200px] mx-auto py-3xl px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            {/* Donations Category */}
            <div className="bg-white/85 backdrop-blur-md border border-sandstone/50 p-xl rounded-2xl hover:shadow-lg transition-all group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center mb-lg group-hover:scale-110 transition-transform">
                <CreditCard className="text-primary h-7 w-7" />
              </div>
              <h3 className="font-headline-md text-headline-md mb-md text-on-surface">
                Donations
              </h3>
              <ul className="space-y-sm">
                <li>
                  <a
                    className="text-body-md text-on-surface-variant hover:text-primary transition-colors flex items-center justify-between"
                    href="#"
                  >
                    Refund policy{" "}
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </li>
                <li>
                  <a
                    className="text-body-md text-on-surface-variant hover:text-primary transition-colors flex items-center justify-between"
                    href="#"
                  >
                    Receipt generation{" "}
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </li>
                <li>
                  <a
                    className="text-body-md text-on-surface-variant hover:text-primary transition-colors flex items-center justify-between"
                    href="#"
                  >
                    International payments{" "}
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Events Category */}
            <div className="bg-white/85 backdrop-blur-md border border-sandstone/50 p-xl rounded-2xl hover:shadow-lg transition-all group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-haldi-yellow/10 flex items-center justify-center mb-lg group-hover:scale-110 transition-transform">
                <PartyPopper className="text-haldi-yellow h-7 w-7" />
              </div>
              <h3 className="font-headline-md text-headline-md mb-md text-on-surface">
                Events
              </h3>
              <ul className="space-y-sm">
                <li>
                  <a
                    className="text-body-md text-on-surface-variant hover:text-primary transition-colors flex items-center justify-between"
                    href="#"
                  >
                    Creating new events{" "}
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </li>
                <li>
                  <a
                    className="text-body-md text-on-surface-variant hover:text-primary transition-colors flex items-center justify-between"
                    href="#"
                  >
                    Volunteer management{" "}
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </li>
                <li>
                  <a
                    className="text-body-md text-on-surface-variant hover:text-primary transition-colors flex items-center justify-between"
                    href="#"
                  >
                    Ticketing &amp; RSVP{" "}
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Technical Support */}
            <div className="bg-white/85 backdrop-blur-md border border-sandstone/50 p-xl rounded-2xl hover:shadow-lg transition-all group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-tulsi-green/10 flex items-center justify-center mb-lg group-hover:scale-110 transition-transform">
                <Settings className="text-tulsi-green h-7 w-7" />
              </div>
              <h3 className="font-headline-md text-headline-md mb-md text-on-surface">
                Technical Support
              </h3>
              <ul className="space-y-sm">
                <li>
                  <a
                    className="text-body-md text-on-surface-variant hover:text-primary transition-colors flex items-center justify-between"
                    href="#"
                  >
                    Data export guide{" "}
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </li>
                <li>
                  <a
                    className="text-body-md text-on-surface-variant hover:text-primary transition-colors flex items-center justify-between"
                    href="#"
                  >
                    Security &amp; Privacy{" "}
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </li>
                <li>
                  <a
                    className="text-body-md text-on-surface-variant hover:text-primary transition-colors flex items-center justify-between"
                    href="#"
                  >
                    Integrations API{" "}
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Detailed FAQ Accordion */}
        <section className="bg-surface-container-low py-3xl">
          <div className="max-w-[860px] mx-auto px-margin-mobile md:px-0">
            <div className="text-center mb-2xl">
              <h2 className="font-headline-lg text-headline-lg text-primary">
                Frequently Asked Questions
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-sm">
                Quick answers to common questions from our community.
              </p>
            </div>
            <div className="space-y-md">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-puja-white rounded-xl border border-sandstone overflow-hidden transition-all duration-300"
                  >
                    <button
                      className="w-full flex items-center justify-between p-lg text-left hover:bg-cream/50 transition-colors"
                      onClick={() => toggleAccordion(faq.id)}
                    >
                      <span className="font-headline-sm text-headline-sm text-on-surface">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className="transition-transform duration-300"
                        style={{
                          transform:
                            openFaq === faq.id ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      />
                    </button>
                    {openFaq === faq.id && (
                      <div className="p-lg pt-0 border-t border-sandstone/50 bg-puja-white animate-in fade-in duration-200">
                        <p className="font-body-md text-body-md text-on-surface-variant">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center p-xl">
                  <p className="text-outline">No FAQs match your search query.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Secondary Hero: Contact Support */}
        <section className="max-w-[1200px] mx-auto py-3xl px-margin-mobile md:px-margin-desktop">
          <div className="relative overflow-hidden rounded-3xl bg-charcoal p-2xl md:p-3xl text-puja-white flex flex-col md:flex-row items-center gap-2xl">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
              <div
                className="w-full h-full bg-cover"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCFs6qRW8iw4K4c1EMFGcpkXtjDrFo_JtMfKUdMthEU_AQ3GQne7ybF9Ygg5xMXndlcC519QPr7j-82PUAqrSTtVtt3nPYP37Cn-WMn6sXE0MXpmsZ5rRTOydSFB8HiTd1Swerssb_8JvesSodvYToV-iOAiuY9olJuS3q1OkirnBKFPsgSFta3uBWxaw_11MtT5Zo9n96lSxQOmwwrTnLdj2LhaEgaczIwrm8uwgH0NXoPk2L5brxw')",
                }}
              ></div>
            </div>
            <div className="relative z-10 flex-1 space-y-lg">
              <h2 className="font-display-xl text-display-xl text-white">
                Still need help?
              </h2>
              <p className="font-body-lg text-body-lg text-sandstone/80">
                Our dedicated support team is available from 9 AM to 9 PM IST to
                assist with your mandal management needs.
              </p>
              <div className="flex flex-wrap gap-md">
                <button className="px-xl py-lg bg-primary-container text-on-primary-container rounded-xl font-headline-sm text-headline-sm hover:scale-95 transition-transform flex items-center gap-sm">
                  <Headphones className="h-5 w-5" />
                  Live Chat Support
                </button>
                <button className="px-xl py-lg border border-sandstone/30 text-puja-white rounded-xl font-headline-sm text-headline-sm hover:bg-white/5 transition-all flex items-center gap-sm">
                  <Mail className="h-5 w-5" />
                  Email Us
                </button>
              </div>
            </div>
            <div className="relative z-10 w-full md:w-80 h-80">
              <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl rotate-3">
                <img
                  className="w-full h-full object-cover"
                  alt="Utsav customer care support team specialist"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC31c9PQBOBd2nKiFrss2nWXhAtGHNIyYp1uyoLgFktKmDKiz6F-2wB-SrHiDVwiOJQRHDOqQ1OgkDJNpjhCNKHc9Cbbk9Sp4YvaPhMBZSlYUzqNkm3pjVwP827u9iEHt5buc-1jb0qidESWKuEc_iZ9kJrYrnIKkU1uUmoZNsSTBOWnMuLEPmEIlwVQcLrOO3sqKMzVr1iVqZxrYJWBDIoqoCFlv5QpfrvWc4ToPgX7NLeEaXOlr6t"
                />
              </div>
              {/* Status Chip */}
              <div className="absolute -bottom-4 -left-4 bg-puja-white p-md rounded-xl shadow-lg border border-sandstone flex items-center gap-base">
                <div className="w-3 h-3 rounded-full bg-tulsi-green animate-pulse"></div>
                <span className="text-label-md font-label-md text-on-surface">
                  Support is Online
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-xl px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-lg bg-surface-container-low border-t border-sandstone">
        <div className="flex flex-col gap-base">
          <span className="font-headline-sm text-headline-sm text-primary">
            Utsav
          </span>
          <p className="text-body-md text-on-surface-variant">
            © {new Date().getFullYear()} Utsav Digital Platforms. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-xl">
          <Link
            className="text-body-md text-on-surface-variant hover:text-primary hover:underline underline-offset-4 transition-all"
            href="/privacy-policy"
          >
            Privacy Policy
          </Link>
          <Link
            className="text-body-md text-on-surface-variant hover:text-primary hover:underline underline-offset-4 transition-all"
            href="/terms-of-service"
          >
            Terms of Service
          </Link>
          <Link
            className="text-body-md text-on-surface-variant hover:text-primary hover:underline underline-offset-4 transition-all"
            href="/help-center"
          >
            Help Center
          </Link>
        </div>
        <div className="flex items-center gap-md">
          <a
            className="w-10 h-10 rounded-full bg-cream flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"
            href="#"
          >
            <Globe className="h-5 w-5" />
          </a>
          <a
            className="w-10 h-10 rounded-full bg-cream flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"
            href="#"
          >
            <Share2 className="h-5 w-5" />
          </a>
        </div>
      </footer>
    </div>
  );
}
