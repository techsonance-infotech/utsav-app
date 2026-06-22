"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@utsav/stores";
import { apiClient } from "@utsav/api-client";
import { useParams } from "next/navigation";
import { History, Search, ArrowRight, UserCheck, Settings, ShieldAlert, Code } from "lucide-react";

export default function WebAuditLogPage() {
  const { role } = useAuthStore();
  const params = useParams();
  const slug = params?.slug as string | undefined;

  const allowedRoles = ["owner", "admin"];
  const isAllowed = allowedRoles.includes(role || "");

  // Local state for pagination and search filters
  const [limit, setLimit] = useState(25);
  const [cursorList, setCursorList] = useState<(string | null)[]>([null]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Track expanded log IDs for the JSON diff view
  const [expandedLogIds, setExpandedLogIds] = useState<Record<string, boolean>>({});

  // Fetch current page of logs
  const activeCursor = cursorList[currentPageIndex];
  const { data = { data: [], nextCursor: null, hasMore: false }, isLoading } = useQuery({
    queryKey: ["audit-logs", activeCursor, limit],
    queryFn: () =>
      apiClient<any>("/audit-logs", {
        params: {
          limit: String(limit),
          ...(activeCursor && { cursor: activeCursor }),
        },
      }),
    enabled: isAllowed,
  }) as any;

  const handleNextPage = () => {
    if (data.nextCursor && currentPageIndex === cursorList.length - 1) {
      setCursorList([...cursorList, data.nextCursor]);
    }
    setCurrentPageIndex(currentPageIndex + 1);
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const toggleExpandLog = (id: string) => {
    setExpandedLogIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getActionIcon = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes("member") || act.includes("role")) {
      return <UserCheck className="w-4 h-4 text-[#2e7d32]" />;
    }
    if (act.includes("settings") || act.includes("branding") || act.includes("tenant")) {
      return <Settings className="w-4 h-4 text-primary" />;
    }
    return <History className="w-4 h-4 text-amber-600" />;
  };

  const getActionTagColor = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes("delete") || act.includes("reject")) {
      return "bg-red-50 text-red-700 border-red-200";
    }
    if (act.includes("create") || act.includes("approve")) {
      return "bg-green-50 text-[#2e7d32] border-green-200";
    }
    return "bg-amber-50 text-amber-800 border-amber-200";
  };

  const filteredLogs = (data.data || []).filter((log: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.action?.toLowerCase().includes(q) ||
      log.actor_role?.toLowerCase().includes(q) ||
      JSON.stringify(log.before_data || {}).toLowerCase().includes(q) ||
      JSON.stringify(log.after_data || {}).toLowerCase().includes(q)
    );
  });

  if (!isAllowed) {
    return (
      <div className="p-margin-desktop text-center bg-white rounded-xl border border-sandstone max-w-xl mx-auto mt-20 p-12 shadow-sm font-sans text-on-surface">
        <span className="material-symbols-outlined text-kumkum-red text-[48px] mb-4">gpp_bad</span>
        <h2 className="font-headline-md text-headline-sm font-bold text-on-surface">Access Denied</h2>
        <p className="font-body-md text-on-surface-variant mt-2">
          You are not authorized to view the System Audit Logs. Only the organization Owner or Admin can access these records.
        </p>
      </div>
    );
  }

  return (
    <div className="p-margin-desktop space-y-lg w-full font-sans text-on-surface">
      {/* Header */}
      <div>
        <h2 className="font-display-md text-display-md font-bold text-primary">
          System Audit Logs
        </h2>
        <p className="text-on-surface-variant font-body-medium">
          Append-only cryptographic timeline recording administrative operations.
        </p>
      </div>

      {/* Filters bar */}
      <div className="bg-cream border border-sandstone p-lg rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search action deltas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-sandstone/70 rounded-xl pl-10 pr-4 py-2 text-sm font-semibold focus:outline-none focus:border-primary"
          />
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-on-surface-variant" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-on-surface-variant font-bold uppercase">Entries per page</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setCursorList([null]);
              setCurrentPageIndex(0);
            }}
            className="bg-white border border-sandstone/70 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-primary appearance-none cursor-pointer"
          >
            <option value={10}>10 Logs</option>
            <option value={25}>25 Logs</option>
            <option value={50}>50 Logs</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <span className="text-sm font-sans tracking-wide text-on-surface-variant">
            Decrypting ledger blocks...
          </span>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-cream border border-sandstone rounded-2xl p-20 flex flex-col items-center justify-center text-center space-y-3">
          <ShieldAlert className="w-12 h-12 text-on-surface-variant/40" />
          <h4 className="font-bold text-on-surface-variant">No Audit Logs Found</h4>
          <p className="text-sm text-on-surface-variant/80 max-w-sm">
            Any settings configurations, expense authorizations, or role assignments will register here.
          </p>
        </div>
      ) : (
        <div className="space-y-md">
          {/* Timeline Roster */}
          <div className="bg-cream border border-sandstone rounded-2xl p-lg space-y-sm">
            <div className="flow-root">
              <ul className="-mb-8">
                {filteredLogs.map((log: any, logIdx: number) => {
                  const isExpanded = expandedLogIds[log.id];
                  const hasDeltas = log.before_data || log.after_data;

                  return (
                    <li key={log.id}>
                      <div className="relative pb-8">
                        {logIdx !== filteredLogs.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-sandstone/50"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-white border border-sandstone/80 flex items-center justify-center ring-8 ring-cream">
                              {getActionIcon(log.action)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                            <div className="space-y-sm w-full">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getActionTagColor(log.action)}`}>
                                  {log.action}
                                </span>
                                <span className="text-xs text-on-surface-variant font-bold">
                                  by Role: {log.actor_role?.toUpperCase()}
                                </span>
                                <span className="text-[10px] text-on-surface-variant font-semibold">
                                  ({new Date(log.created_at).toLocaleString()})
                                </span>
                              </div>

                              <p className="text-sm text-on-surface font-semibold max-w-2xl">
                                Record: Entity ID {log.entity_id || "System Workspace"} update registered.
                              </p>

                              {hasDeltas && (
                                <div className="pt-1">
                                  <button
                                    onClick={() => toggleExpandLog(log.id)}
                                    className="text-xs text-primary font-bold hover:underline flex items-center gap-1 focus:outline-none"
                                  >
                                    <Code className="w-3.5 h-3.5" />
                                    {isExpanded ? "Collapse delta changes" : "View schema deltas"}
                                  </button>

                                  {isExpanded && (
                                    <div className="mt-3 bg-white p-4 rounded-xl border border-sandstone/80 text-xs font-mono overflow-x-auto space-y-3 max-w-full">
                                      {log.before_data && (
                                        <div className="space-y-1">
                                          <p className="text-[10px] text-red-700 font-bold uppercase tracking-wider">
                                            - Before State:
                                          </p>
                                          <pre className="text-zinc-600 bg-red-50/50 p-2 rounded-lg border border-red-100 max-h-[150px] overflow-y-auto custom-scrollbar">
                                            {JSON.stringify(log.before_data, null, 2)}
                                          </pre>
                                        </div>
                                      )}
                                      {log.after_data && (
                                        <div className="space-y-1">
                                          <p className="text-[10px] text-[#2e7d32] font-bold uppercase tracking-wider">
                                            + After State:
                                          </p>
                                          <pre className="text-zinc-800 bg-green-50/50 p-2 rounded-lg border border-green-100 max-h-[150px] overflow-y-auto custom-scrollbar">
                                            {JSON.stringify(log.after_data, null, 2)}
                                          </pre>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Pagination controls */}
          <div className="flex justify-between items-center bg-cream border border-sandstone rounded-2xl p-md">
            <button
              onClick={handlePrevPage}
              disabled={currentPageIndex === 0}
              className="px-4 py-2 border border-sandstone bg-white rounded-xl text-xs font-bold disabled:bg-sandstone/30 disabled:cursor-not-allowed hover:bg-white/70 active:scale-95 duration-100 transition-all"
            >
              Previous Page
            </button>
            <span className="text-xs text-on-surface-variant font-bold">
              Page {currentPageIndex + 1}
            </span>
            <button
              onClick={handleNextPage}
              disabled={!data.hasMore}
              className="px-4 py-2 border border-sandstone bg-white rounded-xl text-xs font-bold disabled:bg-sandstone/30 disabled:cursor-not-allowed hover:bg-white/70 active:scale-95 duration-100 transition-all flex items-center gap-1"
            >
              Next Page <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
