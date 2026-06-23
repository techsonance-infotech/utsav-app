"use client";

import React, { useEffect, useState } from "react";
import {
  Shield,
  Users,
  Grid,
  CheckCircle,
  AlertTriangle,
  Search,
  Settings,
  Activity,
  FileText,
} from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  vertical: string;
  plan: string;
  is_active: boolean;
  city: string;
  created_at: string;
}

interface AuditLog {
  id: string;
  actor_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
}

export default function SuperAdminPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"tenants" | "logs">("tenants");

  // Simulated access check / token injection
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Tenants
      const tenantsRes = await fetch("/api/v1/admin/tenants", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("supabase.auth.token") || ""}`,
        },
      });
      if (tenantsRes.ok) {
        const tenantsData = await tenantsRes.json();
        setTenants(tenantsData);
      }

      // Fetch Audit Logs
      const logsRes = await fetch("/api/v1/audit-logs?limit=50", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("supabase.auth.token") || ""}`,
          "x-tenant-id": "00000000-0000-0000-0000-000000000000", // Will be overridden or derived
        },
      });
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setAuditLogs(logsData.data || []);
      }
    } catch (err) {
      console.error("Failed to load super-admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (tenantId: string, currentActive: boolean) => {
    setActionLoadingId(tenantId);
    try {
      const res = await fetch(`/api/v1/admin/tenants/${tenantId}/suspend`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("supabase.auth.token") || ""}`,
        },
        body: JSON.stringify({ is_active: !currentActive }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTenants((prev) => prev.map((t) => (t.id === tenantId ? updated : t)));
        // Refresh audit logs to show the new suspend/activate log
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase()) ||
      t.vertical.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: tenants.length,
    active: tenants.filter((t) => t.is_active).length,
    suspended: tenants.filter((t) => !t.is_active).length,
    premium: tenants.filter((t) => t.plan !== "free").length,
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1F2937] font-sans">
      {/* Navbar */}
      <header className="border-b border-[#E5E7EB] bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-[#FF9500] rounded-xl flex items-center justify-center shadow-md shadow-orange-100">
              <Shield className="text-white h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Utsav Console</h1>
              <p className="text-xs text-[#FF9500] font-semibold">SUPER ADMINISTRATION</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchData}
              className="p-2 text-gray-400 hover:text-[#FF9500] hover:bg-orange-50 rounded-lg transition-all"
            >
              <Activity className="h-5 w-5" />
            </button>
            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center font-bold text-[#FF9500] text-sm">
              SA
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="h-12 w-12 bg-orange-50 rounded-xl flex items-center justify-center text-[#FF9500]">
              <Grid className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Total Mandals</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Active Mandals</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.active}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="h-12 w-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Suspended Mandals</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.suspended}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="h-12 w-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Premium tier</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.premium}</h3>
            </div>
          </div>
        </div>

        {/* Tab Controls & Search */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("tenants")}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "tenants"
                  ? "bg-[#FF9500] text-white shadow-md shadow-orange-100"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              Mandal Tenants
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "logs"
                  ? "bg-[#FF9500] text-white shadow-md shadow-orange-100"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              System Audit Logs
            </button>
          </div>

          {activeTab === "tenants" && (
            <div className="relative md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name, slug or vertical..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#FF9500] transition-colors"
              />
            </div>
          )}
        </div>

        {/* Dynamic Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="h-8 w-8 border-4 border-[#FF9500] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400 font-medium">Loading console database...</p>
          </div>
        ) : activeTab === "tenants" ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Mandal Info</th>
                    <th className="py-4 px-6">Vertical / Plan</th>
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-6">Created On</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTenants.length > 0 ? (
                    filteredTenants.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-5 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-orange-50 rounded-lg flex items-center justify-center text-[#FF9500] font-bold text-sm">
                              {t.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{t.name}</p>
                              <p className="text-xs text-gray-400 font-mono">{t.slug}.techsonance.co.in</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-50 text-[#FF9500] capitalize mr-2">
                            {t.vertical}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-600 uppercase">
                            {t.plan}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-sm text-gray-500 font-medium">
                          {t.city || "Not set"}
                        </td>
                        <td className="py-5 px-6 text-sm text-gray-500">
                          {new Date(t.created_at).toLocaleDateString("en-IN")}
                        </td>
                        <td className="py-5 px-6 text-right">
                          <button
                            onClick={() => handleToggleStatus(t.id, t.is_active)}
                            disabled={actionLoadingId === t.id}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                              t.is_active
                                ? "bg-red-50 text-red-500 hover:bg-red-100"
                                : "bg-green-50 text-green-500 hover:bg-green-100"
                            }`}
                          >
                            {actionLoadingId === t.id ? (
                              <span className="inline-block h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                            ) : null}
                            {t.is_active ? "Suspend" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-sm text-gray-400 font-medium">
                        No mandal tenants found matching search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Action / Event</th>
                    <th className="py-4 px-6">Actor Role</th>
                    <th className="py-4 px-6">Entity Target</th>
                    <th className="py-4 px-6">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{log.action}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 uppercase">
                            {log.actor_role}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-500 font-mono text-xs">
                          {log.entity_type} ({log.entity_id.substring(0, 8)}...)
                        </td>
                        <td className="py-4 px-6 text-gray-400">
                          {new Date(log.created_at).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-sm text-gray-400 font-medium">
                        No platform audit logs recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
