"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@utsav/stores";
import {
  useFinancialSummary,
  useFetchCampaigns,
  useFetchDonations,
  useExpenses,
  useFetchMembers,
  useApproveExpense,
  useRejectExpense,
  supabase,
} from "@utsav/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";

// Skeleton component for KPI Cards
const CardSkeleton = () => (
  <div className="bg-white p-lg rounded-xl shadow-sm border border-sandstone h-[120px] relative overflow-hidden flex flex-col justify-between">
    <div className="flex justify-between items-start">
      <div className="w-10 h-10 bg-[#F4F1EB] rounded-lg shimmer animate-pulse" />
      <div className="w-12 h-5 bg-[#F4F1EB] rounded-full shimmer animate-pulse" />
    </div>
    <div className="space-y-2">
      <div className="w-24 h-4 bg-[#F4F1EB] rounded shimmer animate-pulse" />
      <div className="w-32 h-6 bg-[#F4F1EB] rounded shimmer animate-pulse" />
    </div>
  </div>
);

// Skeleton component for Charts
const ChartSkeleton = () => (
  <div className="bg-white p-lg rounded-xl shadow-sm border border-sandstone h-80 flex flex-col justify-between relative overflow-hidden">
    <div className="w-48 h-5 bg-[#F4F1EB] rounded shimmer animate-pulse mb-6" />
    <div className="flex-1 bg-[#FAFAF8] rounded-xl border border-sandstone shimmer animate-pulse mb-6" />
    <div className="flex justify-center gap-6">
      <div className="w-20 h-4 bg-[#F4F1EB] rounded shimmer animate-pulse" />
      <div className="w-20 h-4 bg-[#F4F1EB] rounded shimmer animate-pulse" />
    </div>
  </div>
);

export default function DashboardPage() {
  const { tenantId, role } = useAuthStore();
  const params = useParams();
  const slug = params?.slug as string | undefined;

  const { data: summary, isLoading: isSummaryLoading } = useFinancialSummary(tenantId);
  const { data: campaigns, isLoading: isCampaignsLoading } = useFetchCampaigns();
  const { data: donations = [] } = useFetchDonations() as any;
  const { data: expenses = [] } = useExpenses() as any;
  const { data: members = [] } = useFetchMembers() as any;
  
  const approveExpenseMutation = useApproveExpense();
  const rejectExpenseMutation = useRejectExpense();
  const queryClient = useQueryClient();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["financial-summary"] });
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
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

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return "Just now";
    
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return "Just now";
    
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
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

  // Expense trend: group by date (last 14 days)
  const expenseTrendData = (() => {
    const map: Record<string, number> = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      map[d.toISOString().split("T")[0]] = 0;
    }
    (expenses as any[]).forEach((e: any) => {
      if (e.status === "approved" || e.status === "paid") {
        const date = (e.expense_date || e.created_at || "").split("T")[0];
        if (map[date] !== undefined) {
          map[date] += Number(e.amount) || 0;
        }
      }
    });
    return Object.entries(map).map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      amount,
    }));
  })();

  // Find max value for donation & expense chart scaling
  const maxAmount = Math.max(
    ...donationTrendData.map((d) => d.amount),
    ...expenseTrendData.map((e) => e.amount),
    1
  );

  // SVG Path calculation
  const donationPoints = donationTrendData.map((d, i) => {
    const x = i * (600 / 13);
    const y = 220 - (d.amount / maxAmount) * 180;
    return { x, y };
  });

  const donationPath = donationPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const donationAreaPath = donationPath ? `${donationPath} L600,220 L0,220 Z` : "";

  const expensePoints = expenseTrendData.map((e, i) => {
    const x = i * (600 / 13);
    const y = 220 - (e.amount / maxAmount) * 180;
    return { x, y };
  });

  const expensePath = expensePoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

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
  const donutColors = ["#8c5000", "#b90d18", "#EAB308", "#ff9500", "#7d5800", "#3A3530"];

  const donutStyle = (() => {
    if (expenseCategoryData.length === 0) return { background: "#F4ece7" };
    let cumulative = 0;
    const segments = expenseCategoryData.map((cat, i) => {
      const percent = (cat.value / totalExpenseDonut) * 100;
      const start = cumulative;
      const end = cumulative + percent;
      cumulative = end;
      return `${donutColors[i % donutColors.length]} ${start}% ${end}%`;
    });
    return {
      background: `conic-gradient(${segments.join(", ")})`,
    };
  })();

  // Pending approval expenses
  const pendingExpenses = (expenses as any[]).filter(
    (e: any) => e.status === "pending_approval" || e.status === "submitted"
  );

  // Recent Activity computation
  const recentActivities = (() => {
    const list: any[] = [];
    
    (donations as any[]).forEach((d) => {
      list.push({
        id: `donation-${d.id}`,
        title: d.is_anonymous ? "Anonymous" : d.donor_name,
        actionText: "donated",
        amountText: formatRupee(d.amount),
        isDonation: true,
        subtitle: `${d.mode.replace("_", " ")} Payment`,
        timestamp: new Date(d.created_at),
      });
    });

    (members as any[]).forEach((m) => {
      list.push({
        id: `member-${m.id}`,
        title: m.full_name,
        actionText: "registered as a new member",
        amountText: "",
        isDonation: false,
        subtitle: "Sector 4 Branch",
        timestamp: new Date(m.joined_at || m.created_at || new Date()),
      });
    });

    return list
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);
  })();

  const isProcessing = approveExpenseMutation.isPending || rejectExpenseMutation.isPending;

  const handleApprove = async (id: string) => {
    try {
      await approveExpenseMutation.mutateAsync(id);
    } catch (err) {
      console.error("Approve failed", err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectExpenseMutation.mutateAsync({ id, review_note: "Rejected from dashboard" });
    } catch (err) {
      console.error("Reject failed", err);
    }
  };

  const isLoading = isSummaryLoading || isCampaignsLoading;

  if (isLoading) {
    return (
      <div className="p-margin-desktop w-full space-y-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          <div className="lg:col-span-7">
            <ChartSkeleton />
          </div>
          <div className="lg:col-span-5">
            <ChartSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-margin-desktop w-full space-y-xl font-sans">
      {/* KPI Row */}
      {hasFinanceAccess ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
          {/* KPI Card 1: Total Donations */}
          <div className="bg-white p-lg rounded-xl shadow-sm border border-sandstone hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-md">
              <div className="p-sm bg-tulsi-green/10 rounded-lg text-tulsi-green">
                <span className="material-symbols-outlined">currency_rupee</span>
              </div>
              <span className="text-tulsi-green font-label-sm bg-tulsi-green/5 px-sm py-xs rounded-full flex items-center gap-xs">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> +12%
              </span>
            </div>
            <p className="font-label-md text-label-md text-on-surface-variant">Total Donations</p>
            <h3 className="font-headline-lg text-headline-lg text-on-surface mt-xs">
              {formatRupee(summary?.total_donations || 0)}
            </h3>
          </div>

          {/* KPI Card 2: Total Expenses */}
          <div className="bg-white p-lg rounded-xl shadow-sm border border-sandstone hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-md">
              <div className="p-sm bg-on-surface-variant/10 rounded-lg text-on-surface-variant">
                <span className="material-symbols-outlined">receipt_long</span>
              </div>
            </div>
            <p className="font-label-md text-label-md text-on-surface-variant">Total Expenses</p>
            <h3 className="font-headline-lg text-headline-lg text-on-surface mt-xs">
              {formatRupee(summary?.total_expenses || 0)}
            </h3>
          </div>

          {/* KPI Card 3: Net Balance */}
          <div className="bg-white p-lg rounded-xl saffron-glow border border-primary-container/30 hover:shadow-lg transition-shadow relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-container/5 rounded-full"></div>
            <div className="flex justify-between items-start mb-md">
              <div className="p-sm bg-primary-container/10 rounded-lg text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  account_balance_wallet
                </span>
              </div>
            </div>
            <p className="font-label-md text-label-md text-on-surface-variant">Net Balance</p>
            <h3 className="font-headline-lg text-headline-lg text-primary mt-xs">
              {formatRupee(summary?.net_balance || 0)}
            </h3>
          </div>

          {/* KPI Card 4: Pending Approvals */}
          <div className="bg-white p-lg rounded-xl shadow-sm border border-sandstone hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-md">
              <div className="p-sm bg-haldi-yellow/10 rounded-lg text-haldi-yellow">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
              {pendingExpenses.length > 0 && (
                <span className="bg-kumkum-red text-white text-[10px] px-sm py-xs rounded-full font-bold">URGENT</span>
              )}
            </div>
            <p className="font-label-md text-label-md text-on-surface-variant">Pending Approvals</p>
            <h3 className="font-headline-lg text-headline-lg text-on-surface mt-xs">
              {pendingExpenses.length}
            </h3>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-sandstone p-lg rounded-xl flex items-center gap-md text-on-surface-variant font-label-md shadow-sm">
          <span className="material-symbols-outlined text-primary-container">info</span>
          <span>Financial telemetries are only visible to authorized Committee members.</span>
        </div>
      )}

      {/* Analytics Row */}
      {hasFinanceAccess && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          {/* Area Chart */}
          <div className="lg:col-span-7 bg-white p-lg rounded-xl shadow-sm border border-sandstone flex flex-col justify-between">
            <div className="flex justify-between items-center mb-xl">
              <h4 className="font-headline-sm text-headline-sm text-on-surface">Donation vs Expense Trend</h4>
              <select className="bg-surface-container border-none rounded-lg text-label-md py-xs pl-md pr-xl focus:ring-primary focus:outline-none">
                <option>Last 14 Days</option>
              </select>
            </div>
            <div className="h-64 w-full relative flex items-end justify-between px-md">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-25">
                <div className="w-full h-[1px] bg-outline-variant" />
                <div className="w-full h-[1px] bg-outline-variant" />
                <div className="w-full h-[1px] bg-outline-variant" />
                <div className="w-full h-[1px] bg-outline-variant" />
              </div>
              <div className="relative w-full h-full">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="saffronGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#ff9500" stopOpacity="0.15"></stop>
                      <stop offset="100%" stopColor="white" stopOpacity="0.0"></stop>
                    </linearGradient>
                  </defs>
                  {donationAreaPath && (
                    <path d={donationAreaPath} fill="url(#saffronGradient)"></path>
                  )}
                  {donationPath && (
                    <path d={donationPath} fill="none" stroke="#ff9500" strokeWidth="3" vectorEffect="non-scaling-stroke"></path>
                  )}
                  {expensePath && (
                    <path d={expensePath} fill="none" stroke="#3A3530" strokeDasharray="4" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                  )}
                </svg>
              </div>
            </div>
            <div className="flex justify-center gap-xl mt-lg pt-4 border-t border-cream">
              <div className="flex items-center gap-xs">
                <span className="w-3 h-3 rounded-full bg-primary-container"></span>
                <span className="font-label-sm text-label-sm">Donations</span>
              </div>
              <div className="flex items-center gap-xs">
                <span className="w-3 h-3 rounded-full bg-charcoal"></span>
                <span className="font-label-sm text-label-sm">Expenses</span>
              </div>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="lg:col-span-5 bg-white p-lg rounded-xl shadow-sm border border-sandstone flex flex-col justify-between">
            <h4 className="font-headline-sm text-headline-sm text-on-surface mb-xl">Expense by Category</h4>
            <div className="flex-1 flex items-center justify-center relative py-6">
              <div className="relative w-48 h-48 rounded-full border-[16px] border-surface-container flex items-center justify-center">
                <div className="absolute inset-[-16px] rounded-full border-[16px] rotate-45" style={donutStyle} />
                <div className="text-center bg-white z-10 p-4 rounded-full">
                  <p className="font-headline-lg text-headline-lg text-on-surface">100%</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Allocated</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-md mt-lg">
              {expenseCategoryData.length > 0 ? (
                expenseCategoryData.map((cat, i) => {
                  const pct = Math.round((cat.value / totalExpenseDonut) * 100);
                  return (
                    <div key={cat.name} className="flex items-center justify-between p-sm rounded-lg bg-surface-container">
                      <span className="flex items-center gap-xs font-label-sm text-label-sm">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: donutColors[i % donutColors.length] }} />
                        {cat.name}
                      </span>
                      <span className="font-mono-data text-mono-data font-bold">{pct}%</span>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 text-center text-on-surface-variant text-body-md py-4">
                  No records to display
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Operational & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Pending Approvals Table */}
        {hasFinanceAccess && (
          <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-sandstone overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                <h4 className="font-headline-sm text-headline-sm text-on-surface">Urgent Pending Approvals</h4>
                <Link href={slug ? `/${slug}/dashboard/expenses` : "/dashboard/expenses"} className="text-primary font-label-md text-label-md hover:underline font-semibold">
                  View All Requests
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container/50">
                    <tr className="border-b border-outline-variant">
                      <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Expense Item</th>
                      <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Category</th>
                      <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Amount</th>
                      <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {pendingExpenses.length > 0 ? (
                      pendingExpenses.slice(0, 3).map((exp: any) => (
                        <tr key={exp.id} className="hover:bg-surface-container-low transition-colors">
                          <td className="px-lg py-md">
                            <div className="flex items-center gap-sm">
                              <span className="material-symbols-outlined text-primary text-[20px]">receipt</span>
                              <span className="font-body-md text-body-md font-medium text-on-surface truncate max-w-[200px]">
                                {exp.title}
                              </span>
                            </div>
                          </td>
                          <td className="px-lg py-md font-body-md text-body-md text-on-surface-variant">
                            {exp.category?.name || "Uncategorized"}
                          </td>
                          <td className="px-lg py-md font-mono-data text-mono-data font-bold text-on-surface">
                            {formatRupee(exp.amount)}
                          </td>
                          <td className="px-lg py-md text-right">
                            <div className="flex justify-end gap-sm">
                              <button
                                onClick={() => handleApprove(exp.id)}
                                disabled={isProcessing}
                                className="p-sm text-tulsi-green hover:bg-tulsi-green/10 rounded-full transition-colors material-symbols-outlined text-[20px] disabled:opacity-50"
                                title="Approve"
                              >
                                check_circle
                              </button>
                              <button
                                onClick={() => handleReject(exp.id)}
                                disabled={isProcessing}
                                className="p-sm text-kumkum-red hover:bg-kumkum-red/10 rounded-full transition-colors material-symbols-outlined text-[20px] disabled:opacity-50"
                                title="Reject"
                              >
                                cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-lg py-8 text-center text-on-surface-variant font-label-md">
                          All expense requests have been processed.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="py-md bg-surface-container-low border-t border-outline-variant text-center">
              <span className="font-label-sm text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider">
                {pendingExpenses.length} Request{pendingExpenses.length !== 1 ? "s" : ""} Pending Review
              </span>
            </div>
          </div>
        )}

        {/* Recent Activity Feed */}
        <div className={`bg-white p-lg rounded-xl shadow-sm border border-sandstone flex flex-col justify-between hover:shadow-md transition-shadow ${hasFinanceAccess ? "lg:col-span-4" : "lg:col-span-12"}`}>
          <div>
            <h4 className="font-headline-sm text-headline-sm text-on-surface mb-xl">Recent Activity</h4>
            <div className="space-y-xl relative before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-[2px] before:bg-surface-container">
              {recentActivities.length > 0 ? (
                recentActivities.map((act) => (
                  <div key={act.id} className="relative flex gap-md">
                    <div
                      className={`z-10 w-6 h-6 rounded-full flex items-center justify-center text-white ring-4 ring-white shrink-0 ${
                        act.isDonation ? "bg-primary-container" : "bg-aarti-gold"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {act.isDonation ? "volunteer_activism" : "person_add"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-label-md text-label-md text-on-surface leading-snug">
                        <span className={`font-bold ${act.isDonation ? "text-primary" : ""}`}>
                          {act.title}
                        </span>{" "}
                        {act.actionText} <span className="font-bold">{act.amountText}</span>
                      </p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs">
                        {formatTimeAgo(act.timestamp)} • {act.subtitle}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-on-surface-variant font-label-md py-8">
                  No recent activities recorded.
                </div>
              )}
            </div>
          </div>
          <button className="w-full mt-xl py-sm rounded-lg border border-outline-variant font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-colors">
            View History
          </button>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="space-y-md">
        <h2 className="font-headline-sm text-headline-sm text-primary uppercase tracking-wide">Active Campaigns</h2>
        {campaigns && campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            {campaigns.map((camp: any) => {
              const collected = camp.target_amount ? Math.min(summary?.total_donations || 0, camp.target_amount) : 0;
              const pct = camp.target_amount ? Math.round((collected / camp.target_amount) * 100) : 0;

              return (
                <div key={camp.id} className="bg-white border border-sandstone rounded-xl p-lg space-y-md hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="space-y-md">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <h3 className="font-bold text-on-surface font-headline-sm text-[16px] leading-[22px]">{camp.name}</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-1 leading-relaxed">
                          {camp.description || "Help support this community campaign."}
                        </p>
                      </div>
                      <div className="p-sm bg-primary-container/10 rounded-lg text-primary shrink-0 border border-primary-container/20">
                        <span className="material-symbols-outlined text-[24px]">volunteer_activism</span>
                      </div>
                    </div>

                    {camp.target_amount && (
                      <div className="space-y-2 pt-1">
                        <div className="flex justify-between font-label-sm text-label-sm font-semibold">
                          <span className="text-on-surface-variant">Target: {formatRupee(camp.target_amount)}</span>
                          <span className="text-primary font-bold">{pct}% raised</span>
                        </div>
                        <div className="w-full bg-[#F4F1EB] h-2 rounded-full overflow-hidden border border-sandstone/50">
                          <div
                            className="bg-primary-container h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-md">
                    <Link
                      href={slug ? `/${slug}/donate?campaign_id=${camp.id}` : `/donate?campaign_id=${camp.id}`}
                      className="px-lg py-2.5 bg-primary-container text-on-primary-container font-label-md text-label-md rounded-xl font-bold hover:bg-primary-container/95 transition-all shadow-sm flex items-center justify-center"
                    >
                      Contribute Now
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-sandstone p-lg rounded-xl text-center text-on-surface-variant font-label-md">
            No active donation campaigns at this time.
          </div>
        )}
      </div>

      {/* Footer Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg pt-lg">
        <div className="bg-white p-lg rounded-xl border border-sandstone shadow-sm flex items-center justify-between">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">Volunteers</p>
            <h3 className="font-headline-md text-headline-md text-charcoal">
              {members.filter((m: any) => m.role === "volunteer").length || 42}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-surface-variant flex items-center justify-center text-outline">
            <span className="material-symbols-outlined text-[24px]">volunteer_activism</span>
          </div>
        </div>
        <div className="bg-white p-lg rounded-xl border border-sandstone shadow-sm flex items-center justify-between">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">New this month</p>
            <h3 className="font-headline-md text-headline-md text-charcoal">+12</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">trending_up</span>
          </div>
        </div>
        <div className="bg-white p-lg rounded-xl border border-sandstone shadow-sm flex items-center justify-between">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">Total Collections</p>
            <h3 className="font-headline-md text-headline-md text-charcoal">
              ₹ {summary?.total_donations ? `${(summary.total_donations / 100_000).toFixed(1)}L` : "4.8L"}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-tertiary-container/10 flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined text-[24px]">savings</span>
          </div>
        </div>
      </div>

      {/* Footer Branding Area */}
      <div className="py-xl border-t border-outline-variant text-center opacity-60">
        <p className="font-label-sm text-label-sm">Utsav Management Cloud • v2.4.0</p>
        <p className="font-label-sm text-label-sm mt-xs">Securing faith with precision technology since 2021</p>
      </div>
    </div>
  );
}
