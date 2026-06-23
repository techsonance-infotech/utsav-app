"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@utsav/stores";
import { useLogout } from "@utsav/api-client";
import { useRouter, usePathname } from "next/navigation";
import { Flame, Menu, X, LogOut, LayoutDashboard, Heart } from "lucide-react";

interface PublicHeaderProps {
  tenant: {
    id: string;
    name: string;
    slug: string;
    primary_color?: string;
  };
  currentSlug: string;
}

export default function PublicHeader({ tenant, currentSlug }: PublicHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { userId, role } = useAuthStore();
  const logoutMutation = useLogout();

  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push(`/${currentSlug}`);
      setIsMobileMenuOpen(false);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const primaryColor = tenant.primary_color || "#FF9500";
  const showDashboard = userId && (role === "owner" || role === "admin");

  // Navigation items helper
  const navItems = [
    { label: "Home", href: `/${currentSlug}` },
    { label: "About", href: `/${currentSlug}/about` },
    { label: "Events", href: `/${currentSlug}/events` },
    { label: "News", href: `/${currentSlug}/news` },
    { label: "Gallery", href: `/${currentSlug}/gallery` },
    { label: "Blog", href: `/${currentSlug}/blog` },
    { label: "Contact", href: `/${currentSlug}/contact` },
  ];

  const isLinkActive = (href: string) => {
    if (href === `/${currentSlug}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#E8E2D6]/40 shadow-sm z-50 transition-all">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <Link href={`/${currentSlug}`} className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 border border-orange-500/30 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Flame className="w-5.5 h-5.5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-orange-950 tracking-tight text-base uppercase leading-none">
              {tenant.name}
            </span>
            <span className="text-[9px] text-gray-400 font-extrabold tracking-wider uppercase mt-1">UTSAV PLATFORM</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-gray-500">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`transition-colors duration-250 ${
                isLinkActive(item.href) ? "text-orange-600" : "hover:text-orange-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Action Group (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Donate Online Button */}
          <Link
            href={`/${currentSlug}/donate`}
            className="px-5 py-2.5 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-md shadow-orange-500/10 hover:scale-[1.02] active:scale-98 transition-all flex items-center gap-1.5"
            style={{ backgroundColor: primaryColor }}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            Donate
          </Link>

          {isMounted && userId ? (
            <>
              {/* Dashboard */}
              {showDashboard && (
                <Link
                  href={`/${currentSlug}/dashboard`}
                  className="px-4 py-2.5 text-[#5e4b3c] border border-[#E8E2D6] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-all flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
              )}
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-4 py-2.5 text-gray-500 hover:text-rose-600 border border-transparent hover:border-rose-100 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-rose-50 transition-all flex items-center gap-1.5"
                disabled={logoutMutation.isPending}
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              {/* Sign In */}
              <Link
                href={`/login?tenantId=${tenant.id}&redirect=/${currentSlug}`}
                className="px-4 py-2.5 text-[#5e4b3c] border border-[#E8E2D6] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-all"
              >
                Sign In
              </Link>
              
              {/* Register */}
              <Link
                href={`/register?tenantId=${tenant.id}&redirect=/${currentSlug}`}
                className="px-4 py-2.5 text-white rounded-xl text-xs font-bold uppercase tracking-wider bg-orange-950 hover:bg-orange-900 transition-all"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburguer Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-orange-950 hover:bg-orange-50 rounded-xl transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

      </div>

      {/* Mobile Drawer Overlay Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E8E2D6]/40 px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-250">
          
          {/* Navigation Links */}
          <div className="flex flex-col gap-3 font-bold uppercase text-xs tracking-wider text-gray-500">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-2 transition-colors ${
                  isLinkActive(item.href) ? "text-orange-600" : "hover:text-orange-600"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
            {isMounted && userId ? (
              <>
                {showDashboard && (
                  <Link
                    href={`/${currentSlug}/dashboard`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-3 text-[#5e4b3c] border border-[#E8E2D6] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-center py-3 text-rose-600 border border-rose-100 rounded-xl text-xs font-bold uppercase tracking-wider bg-rose-50 hover:bg-rose-100 transition-all flex items-center justify-center gap-1.5"
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href={`/login?tenantId=${tenant.id}&redirect=/${currentSlug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-3 text-[#5e4b3c] border border-[#E8E2D6] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href={`/register?tenantId=${tenant.id}&redirect=/${currentSlug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-3 text-white rounded-xl text-xs font-bold uppercase tracking-wider bg-orange-950 hover:bg-orange-900 transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            <Link
              href={`/${currentSlug}/donate`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center py-3 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-md shadow-orange-500/10 transition-all flex items-center justify-center gap-1.5"
              style={{ backgroundColor: primaryColor }}
            >
              <Heart className="w-4 h-4 fill-current" />
              Donate Online
            </Link>
          </div>

        </div>
      )}

    </nav>
  );
}
