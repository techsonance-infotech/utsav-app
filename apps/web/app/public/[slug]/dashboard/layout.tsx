"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@utsav/stores";
import {
  useFetchTenant,
  useLogout,
  useFetchMembers,
  useFetchDonations,
  useExpenses,
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationRead
} from "@utsav/api-client";
import { useRouter, usePathname, useParams } from "next/navigation";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { tenantId, tenantName, role, userId, tenantSlug } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const logoutMutation = useLogout();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Header interaction states
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
    if (pathname.endsWith("/chat")) return "Mandal Chatroom";
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

  // Search queries
  const { data: allDonations } = useFetchDonations();
  const { data: allExpenses } = useExpenses();

  // Notification hooks
  const unreadCount = useUnreadNotificationsCount();
  const { data: notifications } = useNotifications();
  const markReadMutation = useMarkNotificationRead();

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
    { name: "Audit Log", href: getDashboardHref("/audit"), icon: "history", roles: ["owner", "admin"] },
    { name: "Settings", href: getDashboardHref("/settings"), icon: "settings", roles: ["owner", "admin"] },
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

  const getSearchMatches = () => {
    if (!searchQuery.trim()) return { members: [], donations: [], expenses: [] };
    const q = searchQuery.toLowerCase();

    const matchedMembers = (members || []).filter((m: any) =>
      m.first_name?.toLowerCase().includes(q) ||
      m.last_name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q)
    ).slice(0, 3);

    const matchedDonations = (allDonations || []).filter((d: any) =>
      d.donor_name?.toLowerCase().includes(q) ||
      d.receipt_number?.toLowerCase().includes(q) ||
      d.amount?.toString().includes(q)
    ).slice(0, 3);

    const matchedExpenses = (allExpenses || []).filter((e: any) =>
      e.merchant_name?.toLowerCase().includes(q) ||
      e.description?.toLowerCase().includes(q) ||
      e.amount?.toString().includes(q)
    ).slice(0, 3);

    return {
      members: matchedMembers,
      donations: matchedDonations,
      expenses: matchedExpenses,
    };
  };

  const matches = getSearchMatches();
  const hasMatches = matches.members.length > 0 || matches.donations.length > 0 || matches.expenses.length > 0;

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
          <div className="flex items-center space-x-md relative">
            {/* Global Search Input with Float results */}
            <div className="relative hidden sm:block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant">search</span>
              <input
                className="pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded-full text-body-md focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none w-64 text-sm font-semibold"
                placeholder="Global search..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
              />
              {isSearchFocused && searchQuery.trim() !== "" && (
                <div className="absolute right-0 mt-3 w-96 bg-white border border-sandstone rounded-2xl shadow-xl z-50 p-4 max-h-[400px] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                  {!hasMatches ? (
                    <p className="text-center text-xs text-on-surface-variant/60 py-4 font-medium">No results matching "{searchQuery}"</p>
                  ) : (
                    <div className="space-y-4">
                      {matches.members.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1.5 border-b border-sandstone pb-1">Members</p>
                          <div className="space-y-1">
                            {matches.members.map((m: any) => (
                              <Link
                                key={m.id}
                                href={getDashboardHref("/members")}
                                className="block p-1.5 hover:bg-cream/50 rounded-lg text-xs transition-colors"
                              >
                                <p className="font-bold text-charcoal">{m.first_name} {m.last_name}</p>
                                <p className="text-[10px] text-on-surface-variant">{m.email} · {m.role}</p>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {matches.donations.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1.5 border-b border-sandstone pb-1">Donations</p>
                          <div className="space-y-1">
                            {matches.donations.map((d: any) => (
                              <Link
                                key={d.id}
                                href={getDashboardHref("/donations")}
                                className="block p-1.5 hover:bg-cream/50 rounded-lg text-xs transition-colors"
                              >
                                <p className="font-bold text-charcoal">₹{d.amount} from {d.donor_name}</p>
                                <p className="text-[10px] text-on-surface-variant">Receipt: {d.receipt_number || "Draft"} · {d.payment_status}</p>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {matches.expenses.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1.5 border-b border-sandstone pb-1">Expenses</p>
                          <div className="space-y-1">
                            {matches.expenses.map((e: any) => (
                              <Link
                                key={e.id}
                                href={getDashboardHref("/expenses")}
                                className="block p-1.5 hover:bg-cream/50 rounded-lg text-xs transition-colors"
                              >
                                <p className="font-bold text-charcoal">₹{e.amount} - {e.merchant_name}</p>
                                <p className="text-[10px] text-on-surface-variant">{e.description || "No description"} · {e.status}</p>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notification Bell with Badge & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 text-on-surface-variant hover:text-primary transition-colors relative flex items-center"
              >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-kumkum-red text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-sandstone rounded-2xl shadow-xl z-50 p-4 font-sans text-on-surface animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                  <div className="flex items-center justify-between border-b border-sandstone pb-2 mb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-primary">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={async () => {
                          await markReadMutation.mutateAsync({ all: true });
                        }}
                        className="text-[10px] font-bold text-primary hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
                    {notifications && notifications.length > 0 ? (
                      notifications.slice(0, 5).map((notif: any) => (
                        <div
                          key={notif.id}
                          onClick={async () => {
                            if (!notif.is_read) {
                              await markReadMutation.mutateAsync({ id: notif.id });
                            }
                          }}
                          className={`p-2 rounded-xl text-xs cursor-pointer border transition-colors ${
                            notif.is_read
                              ? "bg-puja-white border-sandstone/30 text-on-surface-variant/70"
                              : "bg-cream border-primary/20 text-on-surface font-semibold hover:bg-cream/80"
                          }`}
                        >
                          <p className="font-bold text-charcoal">{notif.title}</p>
                          <p className="mt-0.5 text-[11px] leading-snug">{notif.body}</p>
                          <span className="text-[9px] text-on-surface-variant/50 mt-1 block">
                            {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-xs text-on-surface-variant/60 py-4 font-medium">
                        No new notifications
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Gated Settings Icon Link */}
            {(role === "owner" || role === "admin") && (
              <Link
                href={getDashboardHref("/settings")}
                className="p-2 text-on-surface-variant hover:text-primary transition-colors flex items-center"
              >
                <span className="material-symbols-outlined">settings</span>
              </Link>
            )}

            {/* User Profile Avatar */}
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
