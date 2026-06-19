"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("introduction");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sections = [
      "introduction",
      "data-collection",
      "tenant-isolation",
      "dpdp-compliance",
      "data-retention",
      "security",
    ];

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const sectionsList = [
    { id: "introduction", label: "Introduction" },
    { id: "data-collection", label: "Data Collection" },
    { id: "tenant-isolation", label: "RLS & Isolation" },
    { id: "dpdp-compliance", label: "DPDP Act 2023" },
    { id: "data-retention", label: "Data Retention" },
    { id: "security", label: "Security Measures" },
  ];

  return (
    <div className="bg-puja-white text-on-surface font-body-md min-h-screen selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Top Navigation */}
      <header
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
        <nav className="hidden md:flex items-center gap-lg">
          <a
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors duration-200"
            href="#"
          >
            Features
          </a>
          <a
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors duration-200"
            href="#"
          >
            Pricing
          </a>
          <a
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors duration-200"
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
        </nav>
        <div className="flex items-center gap-md">
          <Link
            href="/login"
            className="text-on-surface-variant font-label-md px-md py-xs hover:text-primary transition-colors duration-200 scale-95 active:scale-90 transition-transform"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="bg-primary text-on-primary font-label-md px-lg py-2 rounded-full hover:bg-surface-tint transition-all scale-95 active:scale-90 transition-transform"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="pt-32 pb-3xl px-margin-mobile md:px-margin-desktop max-w-[1200px] mx-auto min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
          {/* Table of Contents Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 p-lg bg-cream/50 rounded-xl border border-sandstone">
              <h3 className="font-headline-sm text-headline-sm text-primary mb-lg">
                Contents
              </h3>
              <ul className="space-y-md">
                {sectionsList.map((sec) => (
                  <li key={sec.id}>
                    <a
                      className={`block font-label-md pl-4 border-l-2 py-1 transition-all ${
                        activeSection === sec.id
                          ? "text-primary border-primary font-semibold"
                          : "text-on-surface-variant border-transparent hover:text-primary hover:border-sandstone"
                      }`}
                      href={`#${sec.id}`}
                    >
                      {sec.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Policy Content */}
          <article className="lg:col-span-9">
            <header className="mb-xl">
              <span className="inline-block bg-primary-fixed text-on-primary-fixed px-md py-1 rounded-full font-label-sm mb-md">
                Last Updated: October 24, 2024
              </span>
              <h1 className="font-display-2xl text-display-2xl text-on-surface mb-md">
                Privacy Policy
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed max-w-3xl">
                At Utsav Digital Platforms, we take the sanctity of your community's data as seriously as the traditions you uphold. This policy outlines how we protect and manage information within our modern Mandal management ecosystem.
              </p>
            </header>

            <div className="space-y-3xl">
              {/* Introduction */}
              <section id="introduction" className="scroll-mt-24">
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-lg flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary">
                    verified_user
                  </span>
                  1. Introduction
                </h2>
                <div className="font-body-lg text-body-lg text-on-surface-variant space-y-md">
                  <p>
                    Utsav is a digital infrastructure provider for community organizations (Mandals). We operate on a SaaS (Software as a Service) model where each Mandal acts as a Data Fiduciary for its members, and Utsav acts as a Data Processor.
                  </p>
                  <p>
                    This policy applies to all users of the Utsav platform, including administrators, committee members, and donors.
                  </p>
                </div>
              </section>

              {/* Data Collection */}
              <section id="data-collection" className="scroll-mt-24">
                <div className="p-xl bg-surface-container-low rounded-xl border border-sandstone shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-lg opacity-5 pointer-events-none">
                    <span className="material-symbols-outlined text-[80px]">
                      database
                    </span>
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface mb-lg">
                    2. Data Collection
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                    <div className="bg-puja-white p-lg rounded-lg border border-sandstone">
                      <h4 className="font-headline-sm text-headline-sm text-primary mb-sm">
                        Identity Data
                      </h4>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        Full names, phone numbers, email addresses, and Aadhaar-linked identity markers for committee verification.
                      </p>
                    </div>
                    <div className="bg-puja-white p-lg rounded-lg border border-sandstone">
                      <h4 className="font-headline-sm text-headline-sm text-primary mb-sm">
                        Financial Data
                      </h4>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        Donation history, payment receipts, and settlement bank account details for Mandals.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Multi-tenant Isolation (RLS) */}
              <section id="tenant-isolation" className="scroll-mt-24">
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-lg flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary">
                    hub
                  </span>
                  3. Multi-tenant Isolation & RLS
                </h2>
                <div className="font-body-lg text-body-lg text-on-surface-variant space-y-md">
                  <p>
                    Utsav employs a rigorous multi-tenant architecture designed to prevent data leakage between different organizations. Your data is isolated at the database level using Row-Level Security (RLS) protocols.
                  </p>
                  <div className="flex flex-col md:flex-row gap-lg my-xl">
                    <div className="flex-1 border-l-4 border-primary pl-lg py-2">
                      <h4 className="font-label-md text-primary uppercase tracking-wider mb-xs">
                        Logical Separation
                      </h4>
                      <p className="font-body-md text-on-surface-variant">
                        Every database query is automatically scoped to your specific Mandal ID. No cross-tenant access is possible even at the API layer.
                      </p>
                    </div>
                    <div className="flex-1 border-l-4 border-aarti-gold pl-lg py-2">
                      <h4 className="font-label-md text-aarti-gold uppercase tracking-wider mb-xs">
                        Data Encryption
                      </h4>
                      <p className="font-body-md text-on-surface-variant">
                        All sensitive data is encrypted at rest using AES-256 and in transit via TLS 1.3, ensuring end-to-end professional-grade security.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* DPDP Act 2023 Compliance */}
              <section
                className="bg-inverse-surface text-puja-white p-2xl rounded-2xl scroll-mt-24"
                id="dpdp-compliance"
              >
                <div className="flex flex-col md:flex-row gap-xl items-start">
                  <div className="md:w-1/3">
                    <h2 className="font-headline-lg text-headline-lg mb-md text-white">
                      DPDP Act 2023 Compliance
                    </h2>
                    <p className="font-body-md opacity-80">
                      Utsav is fully aligned with India's Digital Personal Data Protection Act 2023 requirements.
                    </p>
                  </div>
                  <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-md">
                    <div className="bg-charcoal p-lg rounded-xl border border-white/10 hover:border-primary-container transition-colors">
                      <span className="material-symbols-outlined text-primary-container mb-xs">
                        check_circle
                      </span>
                      <h4 className="font-label-md font-bold mb-xs text-white">
                        Explicit Consent
                      </h4>
                      <p className="font-label-sm opacity-70">
                        Notice-and-Consent frameworks are embedded in every donor interaction.
                      </p>
                    </div>
                    <div className="bg-charcoal p-lg rounded-xl border border-white/10 hover:border-primary-container transition-colors">
                      <span className="material-symbols-outlined text-primary-container mb-xs">
                        delete_forever
                      </span>
                      <h4 className="font-label-md font-bold mb-xs text-white">
                        Right to Erasure
                      </h4>
                      <p className="font-label-sm opacity-70">
                        Users can request full deletion of their personal identifiable information.
                      </p>
                    </div>
                    <div className="bg-charcoal p-lg rounded-xl border border-white/10 hover:border-primary-container transition-colors">
                      <span className="material-symbols-outlined text-primary-container mb-xs">
                        update
                      </span>
                      <h4 className="font-label-md font-bold mb-xs text-white">
                        Data Accuracy
                      </h4>
                      <p className="font-label-sm opacity-70">
                        Self-serve portals allow Principals to correct their data at any time.
                      </p>
                    </div>
                    <div className="bg-charcoal p-lg rounded-xl border border-white/10 hover:border-primary-container transition-colors">
                      <span className="material-symbols-outlined text-primary-container mb-xs">
                        person_pin
                      </span>
                      <h4 className="font-label-md font-bold mb-xs text-white">
                        Data Protection Officer
                      </h4>
                      <p className="font-label-sm opacity-70">
                        Dedicated grievance redressal for all Mandal members.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Data Retention */}
              <section id="data-retention" className="scroll-mt-24">
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-lg flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary">
                    history
                  </span>
                  4. Data Retention
                </h2>
                <div className="font-body-lg text-body-lg text-on-surface-variant space-y-md">
                  <p>
                    We retain data only as long as necessary to provide the Utsav services or as required by financial auditing laws in India. For Mandals that terminate their subscription, we provide a 90-day grace period for data export before permanent deletion.
                  </p>
                </div>
              </section>

              {/* Security */}
              <section id="security" className="scroll-mt-24">
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-lg flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary">
                    shield_lock
                  </span>
                  5. Security Measures
                </h2>
                <div className="bg-cream rounded-xl p-lg space-y-md">
                  <div className="flex items-start gap-md">
                    <div className="p-xs bg-primary/10 rounded-full flex-shrink-0">
                      <span className="material-symbols-outlined text-primary">
                        dns
                      </span>
                    </div>
                    <div>
                      <h4 className="font-label-md font-bold text-on-surface">
                        Cloud Infrastructure
                      </h4>
                      <p className="font-body-md text-on-surface-variant">
                        Hosted on Tier-IV data centers within Indian territory to ensure data sovereignty.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-md">
                    <div className="p-xs bg-primary/10 rounded-full flex-shrink-0">
                      <span className="material-symbols-outlined text-primary">
                        fingerprint
                      </span>
                    </div>
                    <div>
                      <h4 className="font-label-md font-bold text-on-surface">
                        MFA Implementation
                      </h4>
                      <p className="font-body-md text-on-surface-variant">
                        Mandatory multi-factor authentication for all administrative actions within the committee panel.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Contact Privacy Office */}
              <div className="pt-xl border-t border-sandstone">
                <h4 className="font-headline-sm text-headline-sm text-on-surface mb-sm">
                  Contact Our Privacy Office
                </h4>
                <p className="font-body-md text-on-surface-variant mb-md">
                  If you have any questions regarding your data privacy or wish to report a grievance, please contact our Data Protection Officer:
                </p>
                <div className="bg-surface-container-high p-lg rounded-lg inline-block">
                  <p className="font-mono-data text-primary font-bold">
                    privacy@utsav.digital
                  </p>
                  <p className="font-label-sm text-on-surface-variant">
                    Attn: Grievance Redressal Officer
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-xl px-margin-desktop bg-surface-container-low border-t border-sandstone flex flex-col md:flex-row justify-between items-center gap-lg">
        <div className="flex flex-col items-center md:items-start gap-xs">
          <span className="font-headline-sm text-headline-sm text-primary font-bold">
            Utsav
          </span>
          <p className="font-body-md text-on-surface-variant">
            © {new Date().getFullYear()} Utsav Digital Platforms. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-lg">
          <Link
            className="font-body-md text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline"
            href="/privacy-policy"
          >
            Privacy Policy
          </Link>
          <Link
            className="font-body-md text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline"
            href="/terms-of-service"
          >
            Terms of Service
          </Link>
          <Link
            className="font-body-md text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline"
            href="/help-center"
          >
            Help Center
          </Link>
        </div>
        <div className="flex gap-md">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-sandstone hover:bg-primary-fixed transition-colors">
            <span className="material-symbols-outlined text-primary">
              alternate_email
            </span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-sandstone hover:bg-primary-fixed transition-colors">
            <span className="material-symbols-outlined text-primary">
              share
            </span>
          </button>
        </div>
      </footer>
    </div>
  );
}
