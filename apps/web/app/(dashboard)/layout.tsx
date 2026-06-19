"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@utsav/stores";
import { useFetchTenant, useLogout } from "@utsav/api-client";
import { useRouter, usePathname } from "next/navigation";
import { Flame, Users, Settings, LogOut, LayoutDashboard, Calendar, FileText, Newspaper, MessageSquare, Store, Image } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { tenantId, tenantName, role, userId } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const logoutMutation = useLogout();

  // Redirect if no session exists or if tenant hasn't been set up
  useEffect(() => {
    if (!userId) {
      router.push("/onboarding");
    } else if (!tenantId && pathname !== "/onboarding") {
      router.push("/onboarding");
    }
  }, [userId, tenantId, pathname, router]);

  const { data: tenant } = useFetchTenant(tenantId);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    router.push("/onboarding");
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Members", href: "/members", icon: Users },
    { name: "Events", href: "/events", icon: Calendar },
    { name: "News", href: "/news", icon: Newspaper },
    { name: "Donations", href: "/donations", icon: FileText },
    { name: "Expenses", href: "/expenses", icon: FileText },
    { name: "Chat", href: "/chat", icon: MessageSquare },
    { name: "Vendors", href: "/vendors", icon: Store },
    { name: "Gallery", href: "/gallery", icon: Image },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  if (!userId || (!tenantId && pathname !== "/onboarding")) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400">
        Loading portal session...
      </div>
    );
  }

  const activeColor = tenant?.primary_color || "#FF9500";

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 border-r border-neutral-850 flex flex-col justify-between sticky top-0 h-screen">
        <div>
          {/* Logo & Tenant Context */}
          <div className="p-6 border-b border-neutral-850">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-neutral-100 text-sm truncate max-w-[150px]">
                  {tenantName || tenant?.name || "Utsav Mandal"}
                </h2>
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold block mt-0.5">
                  Role: {role || "Member"}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item: any) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.name}
                  href={item.disabled ? "#" : item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    item.disabled
                      ? "opacity-30 cursor-not-allowed text-neutral-600"
                      : isActive
                      ? "bg-neutral-850 text-white"
                      : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
                  }`}
                  style={isActive ? { borderLeft: `3px solid ${activeColor}` } : {}}
                >
                  <Icon className="w-5 h-5" style={isActive ? { color: activeColor } : {}} />
                  {item.name}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout */}
        <div className="p-4 border-t border-neutral-850">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="h-16 border-b border-neutral-850 px-8 flex items-center justify-end bg-neutral-950/40 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-850 px-3 py-1.5 rounded-xl text-xs font-mono text-neutral-400">
            <span>Subdomain:</span>
            <span className="text-amber-500 font-semibold">{tenant?.slug || "sai"}.utsav.app</span>
          </div>
        </header>

        <main className="p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
