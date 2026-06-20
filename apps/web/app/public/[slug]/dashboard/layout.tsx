"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@utsav/stores";
import { useFetchTenant, useLogout, useFetchMembers } from "@utsav/api-client";
import { useRouter, usePathname, useParams } from "next/navigation";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { tenantId, tenantName, role, userId, tenantSlug } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const logoutMutation = useLogout();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const slug = params?.slug as string | undefined;

  const getDashboardHref = (path: string) => {
    if (slug) {
      return `/${slug}/dashboard${path}`;
    }
    return `/dashboard${path}`;
  };

  // Dynamic Page Title for top header
  const getPageTitle = () => {
    if (pathname.endsWith("/members")) return "Member Directory";
    if (pathname.endsWith("/events")) return "Manage Events";
    if (pathname.endsWith("/news")) return "News Updates";
    if (pathname.endsWith("/blog")) return "Blog Articles";
    if (pathname.endsWith("/donations")) return "Donations Ledger";
    if (pathname.endsWith("/expenses")) return "Expenses Management";
    if (pathname.endsWith("/committee")) return "Committee Organizer";
    if (pathname.endsWith("/vendors")) return "Vendor Directory";
    if (pathname.endsWith("/reports")) return "Financial & Community Reports";
    if (pathname.endsWith("/gallery")) return "Media Gallery";
    if (pathname.endsWith("/audit")) return "System Audit Logs";
    if (pathname.endsWith("/settings")) return "Portal Settings";
    return "Dashboard";
  };

  // Redirect if no session exists or if tenant hasn't been set up
  useEffect(() => {
    if (!userId) {
      router.push("/onboarding");
    } else if (!tenantId && pathname !== "/onboarding") {
      router.push("/onboarding");
    }
  }, [userId, tenantId, pathname, router]);

  const { data: tenant } = useFetchTenant(tenantId);
  const { data: members } = useFetchMembers();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    router.push("/onboarding");
  };

  const navItems = [
    { name: "Dashboard", href: getDashboardHref(""), icon: "dashboard", roles: ["owner", "admin", "treasurer", "committee_member"] },
    { name: "Members", href: getDashboardHref("/members"), icon: "groups", roles: ["owner", "admin", "treasurer"] },
    { name: "Committee", href: getDashboardHref("/committee"), icon: "badge", roles: ["owner", "admin"] },
    { name: "Events", href: getDashboardHref("/events"), icon: "calendar_today", roles: ["owner", "admin", "committee_member"] },
    { name: "News", href: getDashboardHref("/news"), icon: "newspaper", roles: ["owner", "admin", "committee_member"] },
    { name: "Blog", href: getDashboardHref("/blog"), icon: "book", roles: ["owner", "admin", "committee_member"] },
    { name: "Donations", href: getDashboardHref("/donations"), icon: "volunteer_activism", roles: ["owner", "admin", "treasurer"] },
    { name: "Expenses", href: getDashboardHref("/expenses"), icon: "payments", roles: ["owner", "admin", "treasurer", "committee_member"] },
    { name: "Vendors", href: getDashboardHref("/vendors"), icon: "storefront", roles: ["owner", "admin", "treasurer"] },
    { name: "Reports", href: getDashboardHref("/reports"), icon: "assessment", roles: ["owner", "admin", "treasurer"] },
    { name: "Gallery", href: getDashboardHref("/gallery"), icon: "photo_library", roles: ["owner", "admin", "committee_member"] },
    { name: "Chat", href: getDashboardHref("/chat"), icon: "chat", roles: ["owner", "admin", "treasurer", "committee_member"] },
    { name: "Audit Log", href: getDashboardHref("/audit"), icon: "history", roles: ["owner"] },
    { name: "Settings", href: getDashboardHref("/settings"), icon: "settings", roles: ["owner"] },
  ];

  if (!userId || (!tenantId && pathname !== "/onboarding")) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-zinc-505 font-medium">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-amber-600 border-t-transparent animate-spin" />
          <span className="text-sm font-sans tracking-wide">Loading portal session...</span>
        </div>
      </div>
    );
  }

  // Resolve current user member information
  const currentUserMember = members?.find((m: any) => m.user_id === userId);
  const currentUserAvatar = currentUserMember?.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuCb2RcCu63CpVfuVCJqdvQPl3hrYM4daILS6dDMSbGePzBwoYZtotnn-Eejag28XcCBalxXUCcGznMzznNlLl1JTBCLbgXYf_ONZUP_m14t7Vvrszu5gaC8QdNETogsH25rEQCPJZx3ofBjxUWPeeiwJ37_jUSdlGYbsnIxN1CfuJLqnu1p2mHqBdBz0Mb2nuhvuWJwe0PkNBcp1y7bhttSPW8AB28RZpUhW0M0o11Vs5wGh-4X5jeC";

  return (
    <div className="min-h-screen bg-puja-white text-[#1e1b18] flex font-sans antialiased">
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-zinc-950/20 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SideNavBar - exact HTML match */}
      <aside
        className={`fixed h-screen left-0 top-0 w-64 border-r border-outline-variant bg-cream flex flex-col justify-between z-50 transform md:translate-x-0 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0 py-xl px-md space-y-sm">
          {/* Brand Header */}
          <div className="flex items-center px-sm mb-xl">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center mr-3 shadow-sm">
              <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                temple_hindu
              </span>
            </div>
            <div>
              <h1 className="font-headline-sm text-[16px] leading-[22px] font-bold text-primary">
                {tenantName || tenant?.name || "Utsav Admin"}
              </h1>
              <p className="font-label-sm text-[11px] text-on-surface-variant font-medium">
                Mandal Management
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1">
            {navItems
              .filter((item) => !item.roles || item.roles.includes(role || ""))
              .map((item) => {
                const isActive = pathname === item.href || (item.href !== getDashboardHref("") && pathname.startsWith(item.href + "/"));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={
                      isActive
                        ? "flex items-center space-x-3 px-sm py-md rounded-xl text-primary bg-primary-container/10 border-r-4 border-primary font-bold translate-x-1 transition-transform duration-150"
                        : "flex items-center space-x-3 px-sm py-md rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all duration-200"
                    }
                  >
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: isActive ? "'FILL' 1" : undefined }}
                    >
                      {item.icon}
                    </span>
                    <span className="font-label-md text-label-md">{item.name}</span>
                  </Link>
                );
              })}
          </nav>

          {/* Sidebar Footer Controls */}
          <div className="pt-md border-t border-outline-variant space-y-1">
            <button
              onClick={() => {
                setIsSidebarOpen(false);
                router.push(getDashboardHref("/donations?record=true"));
              }}
              className="w-full mb-4 py-3 px-4 bg-primary-container text-on-primary-container font-headline-sm text-[15px] rounded-xl font-semibold shadow-sm saffron-glow active:scale-95 transition-transform duration-100 flex items-center justify-center space-x-2"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>Record Donation</span>
            </button>

            <Link
              href="/help-center"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center space-x-3 px-sm py-md rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all duration-200"
            >
              <span className="material-symbols-outlined">help</span>
              <span className="font-label-md text-label-md">Help Center</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-sm py-md rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all duration-200 text-left"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="font-label-md text-label-md">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen relative bg-puja-white">
        {/* TopNavBar Component - copy pasted from reference HTML */}
        <header className="flex justify-between items-center w-full px-margin-desktop py-md sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant shadow-sm">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="font-headline-md text-headline-md font-bold text-primary">
              {getPageTitle()}
            </h2>
          </div>
          <div className="flex items-center space-x-md">
            <div className="relative hidden sm:block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant">search</span>
              <input
                className="pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded-full text-body-md focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none w-64"
                placeholder="Global search..."
                type="text"
              />
            </div>
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="w-10 h-10 rounded-full border-2 border-primary-container overflow-hidden shrink-0">
              <img
                alt="Profile"
                className="w-full h-full object-cover"
                src={currentUserAvatar}
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
