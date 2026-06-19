"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@utsav/stores";
import {
  useFinancialSummary,
  useFetchCampaigns,
  useFetchDonations,
  useExpenses,
  useEvents,
  useNewsArticles,
  supabase,
} from "@utsav/api-client";
import { useQueryClient } from "@tanstack/react-query";
import {
  Flame, IndianRupee, Landmark, TrendingUp, HeartHandshake,
  AlertCircle, Calendar, Newspaper, Users, FileText,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { tenantId, tenantName, role } = useAuthStore();
  const { data: summary, isLoading: isSummaryLoading } = useFinancialSummary(tenantId);
  const { data: campaigns, isLoading: isCampaignsLoading } = useFetchCampaigns();
  const { data: donations = [] } = useFetchDonations() as any;
  const { data: expenses = [] } = useExpenses() as any;
  const { data: events = [] } = useEvents() as any;
  const { data: newsArticles = [] } = useNewsArticles(true) as any;
  const queryClient = useQueryClient();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["financial-summary"] });
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    }, 30_000);
    return () => clearInterval(interval);
  }, [queryClient]);

  // Realtime subscription listener for donations updates
  useEffect(() => {
    if (!tenantId) return;

    const channel = supabase
      .channel("donations-realtime-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "donations",
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["financial-summary"] });
          queryClient.invalidateQueries({ queryKey: ["donations"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, queryClient]);

  const hasFinanceAccess = ["owner", "admin", "treasurer", "committee_member"].includes(role || "");

  const formatRupee = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // ---- Chart data computations ----

  // Donation trend: group by date (last 14 days)
  const donationTrendData = (() => {
    const map: Record<string, number> = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      map[d.toISOString().split("T")[0]] = 0;
    }
    (donations as any[]).forEach((d: any) => {
      if (d.status === "confirmed") {
        const date = (d.created_at || "").split("T")[0];
        if (map[date] !== undefined) {
          map[date] += Number(d.amount) || 0;
        }
      }
    });
    return Object.entries(map).map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      amount,
    }));
  })();

  // Find max value for donation chart scaling
  const maxDonation = Math.max(...donationTrendData.map((d) => d.amount), 1);

  // Expense category donut
  const expenseCategoryData = (() => {
    const map: Record<string, number> = {};
    (expenses as any[]).forEach((e: any) => {
      if (e.status === "approved" || e.status === "paid") {
        const cat = e.category?.name || "Uncategorized";
        map[cat] = (map[cat] || 0) + Number(e.amount || 0);
      }
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  })();

  const totalExpenseDonut = expenseCategoryData.reduce((s, e) => s + e.value, 0) || 1;
  const donutColors = ["#FF9500", "#D97706", "#22C55E", "#3B82F6", "#A855F7", "#EC4899"];

  // Pending approval expenses
  const pendingExpenses = (expenses as any[]).filter((e: any) => e.status === "pending_approval");

  // Upcoming events (next 5)
  const upcomingEvents = (events as any[])
    .filter((e: any) => new Date(e.start_at) > new Date())
    .slice(0, 5);

  // Latest news drafts
  const newsDrafts = (newsArticles as any[])
    .filter((n: any) => n.status === "draft")
    .slice(0, 5);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-850 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 animate-pulse" />
            Live Mandal Dashboard
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-100 font-serif">
            Namaste, Utsav Member!
          </h1>
          <p className="text-neutral-400 max-w-xl text-sm leading-relaxed">
            Welcome to the digital portal for <span className="text-neutral-200 font-semibold">{tenantName || "your Mandal"}</span>. Track collections, events, and community updates in real-time.
          </p>
        </div>
        <div className="flex gap-3 relative z-10 w-full md:w-auto">
          <Link
            href="/donate"
            className="flex-1 md:flex-none text-center px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-neutral-950 font-bold rounded-xl transition-all shadow-lg shadow-orange-500/10 text-sm"
          >
            Donate Online
          </Link>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      </div>

      {/* Financial KPI Cards */}
      {hasFinanceAccess ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-neutral-200 font-serif">Financial Telemetry</h2>
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold bg-neutral-900 px-3 py-1 rounded-full border border-neutral-850">
              Auto-refresh 30s
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Total Donations */}
            <div className="bg-neutral-900 border border-neutral-850 rounded-2xl p-5 relative overflow-hidden group hover:border-orange-500/30 transition-all">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Total Donations</span>
                  <div className="text-2xl font-extrabold text-neutral-100 font-mono">
                    {isSummaryLoading ? "..." : formatRupee(summary?.total_donations || 0)}
                  </div>
                </div>
                <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-500">
                  <IndianRupee className="w-5 h-5" />
                </div>
              </div>
              <div className="text-[10px] text-neutral-500 mt-3 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span>{summary?.donation_count || 0} receipts</span>
              </div>
            </div>

            {/* Total Expenses */}
            <div className="bg-neutral-900 border border-neutral-850 rounded-2xl p-5 relative overflow-hidden group hover:border-red-500/30 transition-all">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Total Expenses</span>
                  <div className="text-2xl font-extrabold text-neutral-100 font-mono">
                    {isSummaryLoading ? "..." : formatRupee(summary?.total_expenses || 0)}
                  </div>
                </div>
                <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center text-red-500">
                  <Landmark className="w-5 h-5" />
                </div>
              </div>
              <div className="text-[10px] text-neutral-500 mt-3 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-yellow-500" />
                <span>{summary?.pending_approvals || 0} pending</span>
              </div>
            </div>

            {/* Net Balance */}
            <div className="bg-neutral-900 border border-neutral-850 rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Net Surplus</span>
                  <div className="text-2xl font-extrabold text-neutral-100 font-mono">
                    {isSummaryLoading ? "..." : formatRupee(summary?.net_balance || 0)}
                  </div>
                </div>
                <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                  <Flame className="w-5 h-5" />
                </div>
              </div>
              <div className="text-[10px] text-neutral-500 mt-3">Available for festival setup</div>
            </div>

            {/* Campaigns */}
            <div className="bg-neutral-900 border border-neutral-850 rounded-2xl p-5 relative overflow-hidden group hover:border-orange-500/30 transition-all">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Active Campaigns</span>
                  <div className="text-2xl font-extrabold text-neutral-100 font-mono">
                    {isCampaignsLoading ? "..." : campaigns?.length || 0}
                  </div>
                </div>
                <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center text-orange-400">
                  <HeartHandshake className="w-5 h-5" />
                </div>
              </div>
              <div className="text-[10px] text-neutral-500 mt-3">Running collection drives</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-neutral-900/40 border border-neutral-850 p-6 rounded-2xl flex items-center gap-4 text-neutral-400 text-sm">
          <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
          <span>Financial summaries are only visible to Committee members.</span>
        </div>
      )}

      {/* Charts Row */}
      {hasFinanceAccess && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donation Trend Bar Chart (CSS-only) */}
          <div className="bg-neutral-900 border border-neutral-850 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-neutral-200 text-sm">Donation Trend (14 Days)</h3>
              <IndianRupee className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-end gap-1 h-36">
              {donationTrendData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div
                    className="w-full bg-gradient-to-t from-orange-500/80 to-amber-400/60 rounded-t-md transition-all group-hover:from-orange-500 group-hover:to-amber-400 relative"
                    style={{ height: `${Math.max((d.amount / maxDonation) * 100, 2)}%`, minHeight: "2px" }}
                    title={`${d.date}: ${formatRupee(d.amount)}`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[8px] text-neutral-600 font-mono">
              <span>{donationTrendData[0]?.date}</span>
              <span>{donationTrendData[donationTrendData.length - 1]?.date}</span>
            </div>
          </div>

          {/* Expense Category Donut (CSS-only) */}
          <div className="bg-neutral-900 border border-neutral-850 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-neutral-200 text-sm">Expense Breakdown</h3>
              <FileText className="w-4 h-4 text-rose-400" />
            </div>
            {expenseCategoryData.length > 0 ? (
              <div className="space-y-3">
                {expenseCategoryData.map((cat, i) => {
                  const percent = Math.round((cat.value / totalExpenseDonut) * 100);
                  return (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-300 font-medium">{cat.name}</span>
                        <span className="text-neutral-500 font-mono">{formatRupee(cat.value)} ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden border border-neutral-850">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%`, backgroundColor: donutColors[i % donutColors.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-neutral-500 text-xs py-8">No expense data yet.</div>
            )}
          </div>
        </div>
      )}

      {/* Expense Approval Table + Upcoming Events + News Drafts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Expense Approvals Table */}
        {hasFinanceAccess && (
          <div className="lg:col-span-2 bg-neutral-900 border border-neutral-850 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-850">
              <h3 className="font-bold text-neutral-200 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Pending Expense Approvals
              </h3>
              <Link href="/expenses" className="text-[10px] text-orange-400 font-bold uppercase tracking-wider hover:text-orange-300">
                View All →
              </Link>
            </div>
            {pendingExpenses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-neutral-500 uppercase text-[10px] tracking-wider border-b border-neutral-850">
                      <th className="text-left px-6 py-3 font-semibold">Title</th>
                      <th className="text-left px-4 py-3 font-semibold">Category</th>
                      <th className="text-right px-4 py-3 font-semibold">Amount</th>
                      <th className="text-left px-4 py-3 font-semibold">Date</th>
                      <th className="text-left px-6 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingExpenses.slice(0, 10).map((exp: any) => (
                      <tr key={exp.id} className="border-b border-neutral-900 hover:bg-neutral-950/50 transition-colors">
                        <td className="px-6 py-3 text-neutral-200 font-medium">{exp.title}</td>
                        <td className="px-4 py-3 text-neutral-400">{exp.category?.name || "—"}</td>
                        <td className="px-4 py-3 text-neutral-200 font-mono text-right">{formatRupee(exp.amount)}</td>
                        <td className="px-4 py-3 text-neutral-400">{exp.expense_date}</td>
                        <td className="px-6 py-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                            Pending
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-10 text-center text-neutral-500 text-xs">All expenses are processed. No pending approvals.</div>
            )}
          </div>
        )}

        {/* Upcoming Events Widget */}
        <div className="bg-neutral-900 border border-neutral-850 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-850">
            <h3 className="font-bold text-neutral-200 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              Upcoming Events
            </h3>
            <Link href="/events" className="text-[10px] text-orange-400 font-bold uppercase tracking-wider hover:text-orange-300">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-neutral-850">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((evt: any) => (
                <div key={evt.id} className="px-6 py-3 hover:bg-neutral-950/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs text-neutral-200 font-medium line-clamp-1">{evt.title}</p>
                      <p className="text-[10px] text-neutral-500">
                        {new Date(evt.start_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        {" · "}
                        {new Date(evt.start_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                      {evt.category}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-neutral-500 text-xs">No upcoming events.</div>
            )}
          </div>
        </div>
      </div>

      {/* News Drafts Section */}
      {hasFinanceAccess && newsDrafts.length > 0 && (
        <div className="bg-neutral-900 border border-neutral-850 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-850">
            <h3 className="font-bold text-neutral-200 text-sm flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-orange-400" />
              Unpublished News Drafts
            </h3>
            <Link href="/news" className="text-[10px] text-orange-400 font-bold uppercase tracking-wider hover:text-orange-300">
              Manage →
            </Link>
          </div>
          <div className="divide-y divide-neutral-850">
            {newsDrafts.map((article: any) => (
              <div key={article.id} className="px-6 py-3 flex items-center justify-between hover:bg-neutral-950/50 transition-colors">
                <div className="space-y-0.5">
                  <p className="text-xs text-neutral-200 font-medium line-clamp-1">{article.title}</p>
                  <p className="text-[10px] text-neutral-500">
                    {new Date(article.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}{article.category}
                  </p>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700 uppercase">
                  Draft
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campaigns Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-neutral-200 font-serif">Active Donation Campaigns</h2>
        {isCampaignsLoading ? (
          <div className="text-neutral-500">Loading campaigns...</div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map((camp) => {
              const collected = camp.target_amount ? Math.min(summary?.total_donations || 0, camp.target_amount) : 0;
              const percent = camp.target_amount ? Math.round((collected / camp.target_amount) * 100) : 0;

              return (
                <div key={camp.id} className="bg-neutral-900 border border-neutral-850 rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-neutral-100 text-lg">{camp.name}</h3>
                      <p className="text-xs text-neutral-400">{camp.description || "Help support this community campaign."}</p>
                    </div>
                    <HeartHandshake className="w-6 h-6 text-orange-500 shrink-0" />
                  </div>

                  {camp.target_amount && (
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-neutral-400">Target: {formatRupee(camp.target_amount)}</span>
                        <span className="text-orange-400">{percent}% raised</span>
                      </div>
                      <div className="w-full bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-neutral-805">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Link
                      href={`/donate?campaign_id=${camp.id}`}
                      className="px-4 py-2 bg-neutral-950 border border-neutral-805 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold rounded-lg transition-all"
                    >
                      Contribute Now
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-neutral-900 border border-neutral-850 p-8 rounded-2xl text-center text-neutral-500 text-sm">
            No active donation campaigns at this time.
          </div>
        )}
      </div>
    </div>
  );
}
