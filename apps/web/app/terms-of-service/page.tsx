"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Gavel,
  Download,
  Shield,
  Star,
  Users,
  User,
  CheckCircle
} from "lucide-react";

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState("acceptance");
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
      "acceptance",
      "roles",
      "payments",
      "liability",
      "termination",
      "contact",
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
    { id: "acceptance", label: "Acceptance of Terms" },
    { id: "roles", label: "User Roles & Access" },
    { id: "payments", label: "Payment Processing" },
    { id: "liability", label: "Limitation of Liability" },
    { id: "termination", label: "Termination" },
    { id: "contact", label: "Contact Support" },
  ];

  return (
    <div className="bg-puja-white font-body-lg text-on-surface min-h-screen selection:bg-primary-fixed selection:text-on-primary-fixed">
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
        <nav className="hidden md:flex items-center gap-xl">
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
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
            href="/help-center"
          >
            Help
          </Link>
        </nav>
        <div className="flex items-center gap-md">
          <Link
            href="/login"
            className="hidden sm:block font-label-md text-label-md text-primary font-semibold hover:bg-primary/5 px-4 py-2 rounded-lg transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="bg-primary text-on-primary font-label-md text-label-md font-bold px-6 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            Sign Up
          </Link>
        </div>
      </header>

      <main className="pt-32 pb-24 px-margin-mobile md:px-0 max-w-[1000px] mx-auto">
        {/* Hero Section */}
        <div className="mb-16 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-container/10 border border-primary-container/20 rounded-full mb-6">
            <Gavel className="h-[18px] w-[18px] text-primary" />
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">
              Legal Document
            </span>
          </div>
          <h1 className="font-display-2xl text-display-2xl text-on-surface mb-4">
            Terms of Service
          </h1>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-lg">
            <p className="font-body-lg text-on-surface-variant max-w-2xl">
              Please read these terms carefully before using the Utsav platform. These terms govern your access to and use of our services, including our web application, payment integrations, and administrative tools.
            </p>
            <div className="flex flex-col items-end gap-xs">
              <span className="font-label-sm text-label-sm text-outline uppercase">
                Last Updated
              </span>
              <span className="font-mono-data text-mono-data text-on-surface font-semibold">
                October 24, 2024
              </span>
            </div>
          </div>
        </div>

        {/* Quick Navigation Bento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-16">
          <div className="col-span-1 md:col-span-2 p-xl bg-cream border border-sandstone rounded-2xl flex flex-col justify-between hover:translate-y-[-4px] hover:shadow-[0_12px_24px_-10px_rgba(140,80,0,0.15)] transition-all duration-300">
            <div>
              <h2 className="font-headline-md text-headline-md text-primary mb-4">
                Agreement Overview
              </h2>
              <p className="font-body-md text-on-surface-variant mb-6">
                This document constitutes a legally binding agreement between you (the "User") and Utsav Digital Platforms regarding your use of the service. By clicking "I Accept" or by accessing the platform, you acknowledge that you have read, understood, and agree to be bound by these terms.
              </p>
            </div>
            <div className="flex gap-md">
              <button
                className="flex items-center gap-2 bg-charcoal text-puja-white px-5 py-2.5 rounded-xl hover:bg-on-surface transition-colors"
                onClick={() => window.print()}
              >
                <Download className="h-5 w-5" />
                <span className="font-label-md text-label-md font-semibold">
                  Print / Save as PDF
                </span>
              </button>
            </div>
          </div>
          <div className="p-xl bg-surface-container-high border border-sandstone rounded-2xl flex flex-col justify-center items-center text-center hover:translate-y-[-4px] hover:shadow-[0_12px_24px_-10px_rgba(140,80,0,0.15)] transition-all duration-300">
            <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">
              Safe & Secure
            </h3>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Your data is protected with enterprise-grade encryption and compliant with Indian Digital Personal Data Protection laws.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-3xl">
          {/* Table of Contents (Sticky) */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-24">
              <h4 className="font-label-sm text-label-sm text-outline uppercase tracking-widest mb-6">
                Sections
              </h4>
              <ul className="space-y-4">
                {sectionsList.map((sec) => (
                  <li key={sec.id}>
                    <a
                      className={`font-label-md text-label-md transition-all flex items-center gap-2 ${
                        activeSection === sec.id
                          ? "text-primary font-semibold"
                          : "text-on-surface-variant hover:text-primary"
                      }`}
                      href={`#${sec.id}`}
                    >
                      {activeSection === sec.id && (
                        <div className="w-1 h-4 bg-primary rounded-full"></div>
                      )}
                      {sec.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Legal Clauses */}
          <article className="overflow-y-auto max-h-[800px] pr-4 custom-scrollbar">
            <section className="mb-12 scroll-mt-24" id="acceptance">
              <h2 className="font-headline-lg text-headline-lg text-on-surface border-b border-sandstone pb-4 mb-6">
                1. Acceptance of Terms
              </h2>
              <div className="font-body-md text-on-surface-variant space-y-md">
                <p>
                  By using Utsav (the "Platform"), you signify your agreement to these Terms of Service. Utsav Digital Platforms reserves the right to update or modify these terms at any time without prior notice. Your continued use of the Platform following any changes constitutes your acceptance of such changes.
                </p>
                <p>
                  The Service is intended for users who are at least 18 years of age. Users under the age of 18 must have the consent of a parent or legal guardian to use the platform for any financial transactions or donations.
                </p>
              </div>
            </section>

            <section className="mb-12 scroll-mt-24" id="roles">
              <h2 className="font-headline-lg text-headline-lg text-on-surface border-b border-sandstone pb-4 mb-6">
                2. User Roles & Account Responsibility
              </h2>
              <div className="font-body-md text-on-surface-variant space-y-md">
                <p>
                  To ensure proper organizational management, Utsav defines the following user hierarchy and permissions:
                </p>
                <div className="grid grid-cols-1 gap-md my-8">
                  <div className="p-lg bg-surface-container rounded-xl border border-sandstone">
                    <div className="flex items-center gap-3 mb-3">
                      <Star className="h-5 w-5 text-primary" />
                      <h4 className="font-label-md text-label-md font-bold text-on-surface">
                        Organization Owner
                      </h4>
                    </div>
                    <p className="font-body-md text-on-surface-variant mb-0">
                      Full administrative control, including legal responsibility for the Mandal's account, payment gateway settlement settings, and user management.
                    </p>
                  </div>
                  <div className="p-lg bg-surface-container rounded-xl border border-sandstone">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="h-5 w-5 text-aarti-gold" />
                      <h4 className="font-label-md text-label-md font-bold text-on-surface">
                        Committee Admin
                      </h4>
                    </div>
                    <p className="font-body-md text-on-surface-variant mb-0">
                      Can manage events, create donation links, and view reports. Limited access to financial settlement configuration.
                    </p>
                  </div>
                  <div className="p-lg bg-surface-container rounded-xl border border-sandstone">
                    <div className="flex items-center gap-3 mb-3">
                      <User className="h-5 w-5 text-outline" />
                      <h4 className="font-label-md text-label-md font-bold text-on-surface">
                        General Member
                      </h4>
                    </div>
                    <p className="font-body-md text-on-surface-variant mb-0">
                      Can view committee updates, participate in events, and make donations. No administrative access.
                    </p>
                  </div>
                </div>
                <p>
                  You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.
                </p>
              </div>
            </section>

            <section className="mb-12 scroll-mt-24" id="payments">
              <h2 className="font-headline-lg text-headline-lg text-on-surface border-b border-sandstone pb-4 mb-6">
                3. Payment Processing & Razorpay
              </h2>
              <div className="font-body-md text-on-surface-variant space-y-md">
                <p>
                  All financial transactions, including donations, ticketing, and member fees, are processed through our third-party payment partner, <strong>Razorpay Software Private Limited</strong>.
                </p>
                <div className="my-6 p-xl bg-white border-2 border-primary/10 rounded-2xl shadow-sm space-y-4">
                  <div className="flex gap-4">
                    <CheckCircle className="h-5 w-5 text-tulsi-green shrink-0 mt-0.5" />
                    <span className="font-body-md text-on-surface-variant">
                      <strong>Transaction Fees:</strong> Platform fees and Razorpay processing fees are deducted at the source before settlement.
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <CheckCircle className="h-5 w-5 text-tulsi-green shrink-0 mt-0.5" />
                    <span className="font-body-md text-on-surface-variant">
                      <strong>Settlement:</strong> Funds are typically settled to the Organization's bank account within T+2 business days.
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <CheckCircle className="h-5 w-5 text-tulsi-green shrink-0 mt-0.5" />
                    <span className="font-body-md text-on-surface-variant">
                      <strong>Refunds:</strong> All donations are final. Event ticket refunds are subject to the specific event organizer's policy.
                    </span>
                  </div>
                </div>
                <p>
                  Utsav does not store full credit card numbers or banking passwords. By using our payment features, you also agree to Razorpay's Terms of Service and Privacy Policy.
                </p>
              </div>
            </section>

            <section className="mb-12 scroll-mt-24" id="liability">
              <h2 className="font-headline-lg text-headline-lg text-on-surface border-b border-sandstone pb-4 mb-6">
                4. Limitation of Liability
              </h2>
              <div className="font-body-md text-on-surface-variant space-y-md">
                <p>
                  To the maximum extent permitted by applicable law, Utsav Digital Platforms shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from:
                </p>
                <div className="bg-charcoal text-cream/90 p-lg rounded-xl font-mono-data text-label-sm leading-relaxed uppercase">
                  (I) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES; (II) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICES; (III) ANY CONTENT OBTAINED FROM THE SERVICES; AND (IV) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.
                </div>
              </div>
            </section>

            <section className="mb-12 scroll-mt-24" id="termination">
              <h2 className="font-headline-lg text-headline-lg text-on-surface border-b border-sandstone pb-4 mb-6">
                5. Termination
              </h2>
              <div className="font-body-md text-on-surface-variant space-y-md">
                <p>
                  We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                </p>
              </div>
            </section>

            <section className="mb-12 scroll-mt-24" id="contact">
              <h2 className="font-headline-lg text-headline-lg text-on-surface border-b border-sandstone pb-4 mb-6">
                6. Contact Support
              </h2>
              <div className="font-body-md text-on-surface-variant space-y-md">
                <p>
                  If you have any questions or feedback regarding these Terms of Service, please contact our support team at:
                </p>
                <div className="bg-surface-container p-lg rounded-xl border border-sandstone inline-block">
                  <p className="font-mono-data text-primary font-bold">
                    support@utsav.digital
                  </p>
                  <p className="font-label-sm text-on-surface-variant">
                    Attn: Legal Compliance & Support
                  </p>
                </div>
              </div>
            </section>
          </article>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="w-full py-xl px-margin-mobile md:px-margin-desktop bg-surface-container-low border-t border-sandstone">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-lg">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="font-headline-sm text-headline-sm text-primary">
              Utsav
            </span>
            <p className="font-body-md text-on-surface-variant">
              © {new Date().getFullYear()} Utsav Digital Platforms. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-md">
            <Link
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline"
              href="/privacy-policy"
            >
              Privacy Policy
            </Link>
            <Link
              className="font-label-md text-label-md text-primary transition-colors underline-offset-4 hover:underline"
              href="/terms-of-service"
            >
              Terms of Service
            </Link>
            <Link
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline"
              href="/help-center"
            >
              Help Center
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
