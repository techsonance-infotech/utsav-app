"use client";

import React, { useState } from "react";
import { useAuthStore } from "@utsav/stores";
import { useQuery } from "@tanstack/react-query";
import {
  useFetchMembers,
  useUpdateMemberRole,
  useRemoveMember,
  useGenerateInvite,
  useFetchInvitations,
  useBulkInvite,
  useRevokeInvite,
  apiClient,
} from "@utsav/api-client";
import { useParams } from "next/navigation";
import {
  Search,
  UserPlus,
  Trash2,
  ShieldCheck,
  Copy,
  ExternalLink,
  Users,
  Check,
  X,
  QrCode,
  AlertTriangle,
  Mail,
  Phone,
  Upload,
  FileText,
  Sparkles,
  Info,
  Calendar,
  DollarSign,
  CheckCircle2,
  Plus,
} from "lucide-react";

export default function MembersPage() {
  const { role: currentRole, userId } = useAuthStore();
  const params = useParams();
  const slug = params?.slug as string | undefined;

  const [activeTab, setActiveTab] = useState<"active" | "pending">("active");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Drawer & Modals State
  const [showInviteDrawer, setShowInviteDrawer] = useState(false);
  const [inviteChannel, setInviteChannel] = useState<"link" | "direct" | "bulk">("link");
  const [selectedRole, setSelectedRole] = useState("member");
  const [expiresIn, setExpiresIn] = useState(7);
  const [inviteeName, setInviteeName] = useState("");
  const [inviteeEmail, setInviteeEmail] = useState("");
  const [inviteePhone, setInviteePhone] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // CSV State
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [csvRawText, setCsvRawText] = useState("");
  const [csvError, setCsvError] = useState("");

  // Selected Member Profile Drawer State
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [editingRole, setEditingRole] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Queries & Mutations
  const { data: members = [], isLoading: loadingMembers, refetch: refetchMembers } = useFetchMembers({
    search: search.trim() || undefined,
    role: roleFilter || undefined,
  }) as any;

  const { data: pendingInvitations = [], isLoading: loadingInvitations, refetch: refetchInvitations } = useFetchInvitations() as any;

  const updateRoleMutation = useUpdateMemberRole();
  const removeMemberMutation = useRemoveMember();
  const generateInviteMutation = useGenerateInvite();
  const bulkInviteMutation = useBulkInvite();
  const revokeInviteMutation = useRevokeInvite();

  // Queries for donation/RSVP statistics inside selected member drawer
  const { data: allDonations = [] } = useQuery({
    queryKey: ["all-donations-lookup"],
    queryFn: () => apiClient<any[]>("/donations"),
    enabled: !!selectedMember,
  });

  const { data: allEvents = [] } = useQuery({
    queryKey: ["all-events-lookup"],
    queryFn: () => apiClient<any[]>("/events"),
    enabled: !!selectedMember,
  });

  const getMemberDonationTotal = (email?: string, phone?: string) => {
    if (!email && !phone) return 0;
    return allDonations
      .filter((d: any) => 
        (email && d.donor_email?.toLowerCase() === email.toLowerCase()) ||
        (phone && d.donor_phone === phone)
      )
      .reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
  };

  const getMemberRSVPCount = (memberUserId?: string) => {
    if (!memberUserId) return 0;
    return allEvents.filter((e: any) => e.user_rsvp === "attending").length;
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      await updateRoleMutation.mutateAsync({ id: memberId, role: newRole });
      refetchMembers();
      if (selectedMember && selectedMember.id === memberId) {
        setSelectedMember({ ...selectedMember, role: newRole });
      }
    } catch (err: any) {
      alert(err.message || "Failed to update member role");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member? They will lose access immediately.")) {
      return;
    }
    try {
      await removeMemberMutation.mutateAsync(memberId);
      refetchMembers();
      setSelectedMember(null);
    } catch (err: any) {
      alert(err.message || "Failed to remove member");
    }
  };

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await generateInviteMutation.mutateAsync({
        role: selectedRole,
        invitee_name: inviteeName || undefined,
        email: inviteChannel === "direct" && inviteeEmail ? inviteeEmail : undefined,
        phone: inviteChannel === "direct" && inviteePhone ? inviteePhone : undefined,
        expires_in_days: expiresIn,
      });
      setGeneratedLink(data.link);
      refetchInvitations();
    } catch (err: any) {
      alert(err.message || "Failed to generate invite token");
    }
  };

  const handleRevokeInvite = async (token: string) => {
    if (!confirm("Are you sure you want to revoke this invitation? This token will immediately become invalid.")) {
      return;
    }
    try {
      await revokeInviteMutation.mutateAsync(token);
      refetchInvitations();
    } catch (err: any) {
      alert(err.message || "Failed to revoke invitation");
    }
  };

  // CSV Parsing
  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvRawText(text);
      parseCsv(text);
    };
    reader.readAsText(file);
  };

  const parseCsv = (text: string) => {
    setCsvError("");
    try {
      const lines = text.split(/\r?\n/);
      if (lines.length <= 1) {
        setCsvError("CSV file is empty or missing data rows.");
        return;
      }

      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      const nameIdx = headers.indexOf("full_name");
      const emailIdx = headers.indexOf("email");
      const phoneIdx = headers.indexOf("phone");
      const roleIdx = headers.indexOf("role");

      if (nameIdx === -1 && emailIdx === -1 && phoneIdx === -1) {
        setCsvError("Missing required columns. Ensure columns: full_name, email, phone, role exist.");
        return;
      }

      const parsed: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const columns = line.split(",").map(c => c.trim());
        parsed.push({
          full_name: columns[nameIdx] || "",
          email: columns[emailIdx] || "",
          phone: columns[phoneIdx] || "",
          role: columns[roleIdx] || "member",
        });
      }

      setCsvPreview(parsed);
    } catch (err) {
      setCsvError("Failed to parse CSV file. Ensure valid format.");
    }
  };

  const handleBulkImport = async () => {
    if (csvPreview.length === 0) return;
    try {
      await bulkInviteMutation.mutateAsync({ invitees: csvPreview });
      alert(`Successfully generated invitations for ${csvPreview.length} members.`);
      setCsvPreview([]);
      setCsvRawText("");
      setShowInviteDrawer(false);
      refetchInvitations();
      setActiveTab("pending");
    } catch (err: any) {
      alert(err.message || "Bulk import failed");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const isEditor = currentRole === "owner" || currentRole === "admin";

  // Filter active directory client-side by status
  const filteredMembers = (members || []).filter((m: any) => {
    if (statusFilter && m.status !== statusFilter) return false;
    return true;
  });

  // Pagination calculations for Active Directory
  const totalRows = filteredMembers.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + rowsPerPage);

  // Stats calculators
  const volunteersCount = members?.filter((m: any) => m.role === "volunteer").length || 0;
  
  const joinedThisMonth = members?.filter((m: any) => {
    const joinDate = new Date(m.joined_at || m.created_at || new Date());
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    return joinDate >= oneMonthAgo;
  }).length || 0;

  return (
    <div className="p-margin-desktop space-y-lg w-full font-sans text-on-surface">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display-md text-display-md font-bold text-primary flex items-center gap-2">
            <Users className="w-7 h-7 text-primary" /> Community Directory
          </h2>
          <p className="text-on-surface-variant font-body-medium">
            Manage mandal committee members, volunteers, and dispatch joining tokens.
          </p>
        </div>
        {isEditor && (
          <button
            onClick={() => {
              setGeneratedLink("");
              setInviteeName("");
              setInviteeEmail("");
              setInviteePhone("");
              setCsvPreview([]);
              setShowInviteDrawer(true);
            }}
            className="bg-primary text-white hover:bg-primary-hover shadow-sm active:scale-95 duration-100 transition-all font-semibold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 self-start sm:self-center"
          >
            <Plus className="w-5 h-5" /> Dispatch Invitations
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-sandstone gap-2">
        <button
          onClick={() => {
            setActiveTab("active");
            setCurrentPage(1);
          }}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "active"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-primary"
          }`}
        >
          Active Directory ({filteredMembers.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("pending");
            setCurrentPage(1);
          }}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "pending"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-primary"
          }`}
        >
          Pending Invitations ({pendingInvitations.length})
        </button>
      </div>

      {activeTab === "active" ? (
        <>
          {/* Active Filters */}
          <div className="bg-cream border border-sandstone rounded-2xl p-lg grid grid-cols-1 md:grid-cols-12 gap-md items-center">
            <div className="md:col-span-4 relative">
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Search Members
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Name, email, or phone number..."
                  className="w-full bg-white border border-sandstone/70 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="md:col-span-4">
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Filter Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-sandstone/70 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer appearance-none"
              >
                <option value="">All Roles</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="treasurer">Treasurer</option>
                <option value="volunteer">Volunteer</option>
                <option value="member">Member</option>
              </select>
            </div>

            <div className="md:col-span-4">
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Suspension Status
              </label>
              <div className="flex bg-white border border-sandstone/70 rounded-xl p-1">
                {[
                  { id: "", label: "All" },
                  { id: "active", label: "Active" },
                  { id: "suspended", label: "Suspended" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setStatusFilter(tab.id);
                      setCurrentPage(1);
                    }}
                    className={`flex-1 py-1 px-3 rounded-lg text-xs font-bold transition-all ${
                      statusFilter === tab.id
                        ? "bg-primary text-white shadow-xs font-bold"
                        : "text-on-surface-variant hover:bg-[#F4F1EB]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Directory Table */}
          {loadingMembers ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <span className="text-sm font-sans tracking-wide text-on-surface-variant">
                Synchronizing directory registers...
              </span>
            </div>
          ) : paginatedMembers.length > 0 ? (
            <div className="bg-cream border border-sandstone rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-sandstone text-[11px] font-bold uppercase tracking-wider text-on-surface-variant bg-[#F4F1EB]/50">
                      <th className="px-lg py-3">Member Name</th>
                      <th className="px-lg py-3">Assigned Role</th>
                      <th className="px-lg py-3">Phone number</th>
                      <th className="px-lg py-3">Member since</th>
                      <th className="px-lg py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sandstone bg-white">
                    {paginatedMembers.map((member: any) => (
                      <tr
                        key={member.id}
                        onClick={() => {
                          setSelectedMember(member);
                          setEditingRole(member.role);
                        }}
                        className="hover:bg-[#F4F1EB]/30 transition-colors cursor-pointer text-xs font-semibold text-on-surface"
                      >
                        <td className="px-lg py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary-container/20 text-primary flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 border border-primary-container/10">
                              {member.avatar_url ? (
                                <img src={member.avatar_url} className="w-full h-full object-cover" alt="" />
                              ) : (
                                member.full_name?.charAt(0).toUpperCase() || "M"
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-on-surface leading-tight">
                                {member.full_name}
                              </p>
                              <p className="text-[10px] text-on-surface-variant">
                                {member.email || "No email assigned"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-lg py-4">
                          <span className={`px-2.5 py-0.5 rounded-full border text-[9px] uppercase font-bold tracking-wider ${
                            member.role === "owner"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : member.role === "admin"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : member.role === "treasurer"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : member.role === "volunteer"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-gray-100 text-gray-700 border-gray-200"
                          }`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="px-lg py-4 text-on-surface-variant font-mono">
                          {member.phone || "—"}
                        </td>
                        <td className="px-lg py-4 text-on-surface-variant font-mono">
                          {new Date(member.joined_at || member.created_at).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-lg py-4">
                          <span className={`flex items-center gap-1 text-[11px] font-bold ${
                            member.status === "active" ? "text-green-600" : "text-gray-500"
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${
                              member.status === "active" ? "bg-green-600 animate-pulse" : "bg-gray-400"
                            }`} />
                            {member.status === "active" ? "Active" : "Suspended"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Active Pagination */}
              <div className="px-lg py-3 border-t border-sandstone flex flex-col sm:flex-row justify-between items-center gap-3 bg-[#F4F1EB]/50">
                <div className="flex items-center gap-3 text-xs font-bold text-on-surface-variant">
                  <span>Show rows:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-transparent border-none cursor-pointer outline-none font-bold text-on-surface"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="border-l border-sandstone pl-3">
                    Showing {startIndex + 1}-{Math.min(startIndex + rowsPerPage, totalRows)} of {totalRows} members
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="px-2.5 py-1 border border-sandstone bg-white rounded-lg text-xs font-bold hover:bg-[#F4F1EB] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        currentPage === page
                          ? "bg-primary text-white"
                          : "bg-white border border-sandstone hover:bg-[#F4F1EB]"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="px-2.5 py-1 border border-sandstone bg-white rounded-lg text-xs font-bold hover:bg-[#F4F1EB] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-cream border border-sandstone rounded-2xl p-16 text-center text-xs font-bold text-on-surface-variant">
              No registered members found matching the selected filters.
            </div>
          )}
        </>
      ) : (
        <>
          {/* Pending Invitations View */}
          {loadingInvitations ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <span className="text-sm font-sans tracking-wide text-on-surface-variant">
                Retrieving active invitation tokens...
              </span>
            </div>
          ) : pendingInvitations.length > 0 ? (
            <div className="bg-cream border border-sandstone rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-sandstone text-[11px] font-bold uppercase tracking-wider text-on-surface-variant bg-[#F4F1EB]/50">
                      <th className="px-lg py-3">Invitee Name / Target</th>
                      <th className="px-lg py-3">Assigned Role</th>
                      <th className="px-lg py-3">Expires At</th>
                      <th className="px-lg py-3">Token Type</th>
                      <th className="px-lg py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sandstone bg-white">
                    {pendingInvitations.map((invite: any) => {
                      const expDate = new Date(invite.expires_at);
                      const isExpired = expDate < new Date();
                      return (
                        <tr key={invite.id} className="text-xs font-semibold text-on-surface">
                          <td className="px-lg py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-on-surface">
                                {invite.invitee_name || "Anonymous Token Link"}
                              </span>
                              <span className="text-[10px] text-on-surface-variant">
                                {invite.email || invite.phone || "Universal Link"}
                              </span>
                            </div>
                          </td>
                          <td className="px-lg py-4">
                            <span className="px-2 py-0.5 border border-sandstone rounded-full bg-[#F4F1EB] uppercase text-[9px] font-bold tracking-wider">
                              {invite.role}
                            </span>
                          </td>
                          <td className="px-lg py-4 font-mono text-on-surface-variant">
                            <span className={isExpired ? "text-kumkum-red" : ""}>
                              {expDate.toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                              {isExpired && " (Expired)"}
                            </span>
                          </td>
                          <td className="px-lg py-4">
                            <span className={`text-[10px] font-bold ${
                              invite.is_bulk ? "text-primary" : "text-on-surface-variant"
                            }`}>
                              {invite.is_bulk ? "Bulk Imported" : "Single invite"}
                            </span>
                          </td>
                          <td className="px-lg py-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(invite.link);
                                  alert("Invitation URL copied to clipboard!");
                                }}
                                className="px-2 py-1 border border-sandstone bg-white rounded-lg text-[10px] hover:bg-[#F4F1EB]"
                              >
                                Copy Link
                              </button>
                              <button
                                onClick={() => handleRevokeInvite(invite.token)}
                                className="p-1 text-kumkum-red hover:bg-red-50 rounded-lg"
                                title="Revoke invite token"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-cream border border-sandstone rounded-2xl p-16 text-center text-xs font-bold text-on-surface-variant">
              No pending invitations are active for this mandal.
            </div>
          )}
        </>
      )}

      {/* Footer statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg pt-4">
        <div className="bg-cream border border-sandstone p-lg rounded-2xl flex justify-between items-center">
          <div>
            <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Active Volunteers
            </p>
            <h3 className="text-3xl font-black text-primary">
              {volunteersCount}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-cream border border-sandstone p-lg rounded-2xl flex justify-between items-center">
          <div>
            <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              New Onboarded (30 Days)
            </p>
            <h3 className="text-3xl font-black text-primary">
              +{joinedThisMonth}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-cream border border-sandstone p-lg rounded-2xl flex justify-between items-center">
          <div>
            <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Total Contributions
            </p>
            <h3 className="text-3xl font-black text-primary">
              ₹ 4.8L
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#F4F1EB] text-on-surface-variant flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Slide-out Dispatch Invitation Panel */}
      {showInviteDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border-l border-sandstone h-full p-6 md:p-8 flex flex-col justify-between shadow-2xl relative animate-in slide-in-from-right duration-200 overflow-y-auto">
            
            {/* Close */}
            <button
              onClick={() => setShowInviteDrawer(false)}
              className="absolute top-6 right-6 p-2 bg-[#FAFAF8] border border-[#E8E2D6] hover:bg-[#F4F1EB] rounded-lg text-gray-500 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-6 pt-4">
              <div>
                <h2 className="text-xl font-black text-[#3A3530] uppercase tracking-tight flex items-center gap-1.5">
                  <UserPlus className="w-5 h-5 text-primary" /> Dispatch Invitation
                </h2>
                <p className="text-xs text-on-surface-variant font-semibold">
                  Send invitations or generate single-use registration link tokens.
                </p>
              </div>

              {/* Channels Selector Tabs */}
              <div className="flex bg-[#F4F1EB] p-1 border border-sandstone rounded-xl">
                {[
                  { id: "link", label: "Shareable Link", icon: QrCode },
                  { id: "direct", label: "Email / SMS", icon: Mail },
                  { id: "bulk", label: "Bulk CSV", icon: Upload },
                ].map((channel) => {
                  const Icon = channel.icon;
                  return (
                    <button
                      key={channel.id}
                      onClick={() => {
                        setInviteChannel(channel.id as any);
                        setGeneratedLink("");
                      }}
                      className={`flex-1 py-2 rounded-lg text-[10px] uppercase tracking-wider font-extrabold flex items-center justify-center gap-1 transition-all ${
                        inviteChannel === channel.id
                          ? "bg-white shadow-sm font-black text-primary border border-sandstone"
                          : "text-on-surface-variant hover:text-primary"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {channel.label}
                    </button>
                  );
                })}
              </div>

              {!generatedLink ? (
                <>
                  {inviteChannel === "link" && (
                    <form onSubmit={handleGenerateInvite} className="space-y-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">
                          Invitee Full Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={inviteeName}
                          onChange={(e) => setInviteeName(e.target.value)}
                          placeholder="e.g. Anand Sharma"
                          className="w-full bg-[#FAFAF8] border border-sandstone/70 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">
                          Assigned Member Role
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: "member", label: "Member" },
                            { id: "volunteer", label: "Volunteer" },
                            { id: "treasurer", label: "Treasurer" },
                            { id: "admin", label: "Admin" },
                          ].map((roleOpt) => (
                            <button
                              key={roleOpt.id}
                              type="button"
                              onClick={() => setSelectedRole(roleOpt.id)}
                              className={`py-2 rounded-xl border text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                                selectedRole === roleOpt.id
                                  ? "bg-primary/10 border-primary text-primary"
                                  : "bg-[#FAFAF8] border-sandstone/70 text-on-surface-variant hover:bg-[#F4F1EB]"
                              }`}
                            >
                              {roleOpt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">
                          Link Lifespan Expiry
                        </label>
                        <select
                          value={expiresIn}
                          onChange={(e) => setExpiresIn(parseInt(e.target.value))}
                          className="w-full bg-[#FAFAF8] border border-sandstone/70 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
                        >
                          <option value={1}>24 Hours</option>
                          <option value={7}>7 Days (Default)</option>
                          <option value={30}>30 Days</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={generateInviteMutation.isPending}
                        className="w-full bg-primary hover:bg-primary-hover text-white font-extrabold py-3.5 rounded-xl uppercase text-xs tracking-wider transition-all active:scale-95 duration-100 disabled:opacity-50 mt-4"
                      >
                        {generateInviteMutation.isPending ? "Generating..." : "Generate Token Link"}
                      </button>
                    </form>
                  )}

                  {inviteChannel === "direct" && (
                    <form onSubmit={handleGenerateInvite} className="space-y-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">
                          Invitee Name
                        </label>
                        <input
                          type="text"
                          value={inviteeName}
                          onChange={(e) => setInviteeName(e.target.value)}
                          placeholder="e.g. Suresh Patel"
                          className="w-full bg-[#FAFAF8] border border-sandstone/70 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">
                          Invitee Email Address
                        </label>
                        <input
                          type="email"
                          value={inviteeEmail}
                          onChange={(e) => setInviteeEmail(e.target.value)}
                          placeholder="suresh@mandal.com"
                          className="w-full bg-[#FAFAF8] border border-sandstone/70 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">
                          Invitee Phone Number
                        </label>
                        <input
                          type="tel"
                          value={inviteePhone}
                          onChange={(e) => setInviteePhone(e.target.value)}
                          placeholder="e.g. +91 9876543210"
                          className="w-full bg-[#FAFAF8] border border-sandstone/70 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">
                          Assigned Member Role
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: "member", label: "Member" },
                            { id: "volunteer", label: "Volunteer" },
                            { id: "treasurer", label: "Treasurer" },
                            { id: "admin", label: "Admin" },
                          ].map((roleOpt) => (
                            <button
                              key={roleOpt.id}
                              type="button"
                              onClick={() => setSelectedRole(roleOpt.id)}
                              className={`py-2 rounded-xl border text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                                selectedRole === roleOpt.id
                                  ? "bg-primary/10 border-primary text-primary"
                                  : "bg-[#FAFAF8] border-sandstone/70 text-on-surface-variant hover:bg-[#F4F1EB]"
                              }`}
                            >
                              {roleOpt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={generateInviteMutation.isPending}
                        className="w-full bg-primary hover:bg-primary-hover text-white font-extrabold py-3.5 rounded-xl uppercase text-xs tracking-wider transition-all active:scale-95 duration-100 disabled:opacity-50 mt-4"
                      >
                        {generateInviteMutation.isPending ? "Generating invite..." : "Register Invitation Link"}
                      </button>
                    </form>
                  )}

                  {inviteChannel === "bulk" && (
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-sandstone rounded-2xl p-6 text-center bg-[#FAFAF8] hover:bg-[#F4F1EB]/30 transition-all cursor-pointer relative">
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleCsvFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <Upload className="w-10 h-10 text-primary mx-auto mb-2" />
                        <p className="text-xs font-bold text-on-surface">
                          Click to select or drop Member CSV file
                        </p>
                        <p className="text-[10px] text-on-surface-variant mt-1">
                          CSV headers: `full_name`, `email`, `phone`, `role`
                        </p>
                      </div>

                      {csvError && (
                        <div className="bg-red-50 border border-red-200 text-kumkum-red rounded-xl p-3 text-[11px] font-bold flex gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>{csvError}</span>
                        </div>
                      )}

                      {csvPreview.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-extrabold uppercase text-on-surface-variant">
                              Ready to import: {csvPreview.length} records
                            </span>
                            <button
                              onClick={() => {
                                setCsvPreview([]);
                                setCsvRawText("");
                              }}
                              className="text-[10px] text-kumkum-red font-bold hover:underline"
                            >
                              Reset CSV
                            </button>
                          </div>

                          <div className="border border-sandstone rounded-xl max-h-48 overflow-y-auto bg-[#FAFAF8] p-2 text-[10px] font-mono divide-y divide-sandstone">
                            {csvPreview.map((item, idx) => (
                              <div key={idx} className="py-1.5 flex justify-between gap-4">
                                <span className="font-bold text-on-surface truncate">{item.full_name || "—"}</span>
                                <span className="text-on-surface-variant text-right shrink-0">{item.role}</span>
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={handleBulkImport}
                            disabled={bulkInviteMutation.isPending}
                            className="w-full bg-primary hover:bg-primary-hover text-white font-extrabold py-3.5 rounded-xl uppercase text-xs tracking-wider transition-all active:scale-95 duration-100 disabled:opacity-50 mt-2"
                          >
                            {bulkInviteMutation.isPending ? "Importing members..." : `Import ${csvPreview.length} Members`}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-6">
                  {/* Join Link Screen Output */}
                  <div className="bg-[#FAFAF8] border border-sandstone rounded-2xl p-6 flex flex-col items-center text-center gap-3">
                    <QrCode className="w-16 h-16 text-primary" />
                    <span className="text-xs text-on-surface font-extrabold uppercase tracking-wider">
                      Invited as: {selectedRole.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-bold">
                      Expires in {expiresIn} days. Database validation active.
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase text-on-surface-variant tracking-wider">
                      Invitation Join Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={generatedLink}
                        className="flex-1 bg-[#FAFAF8] border border-sandstone/70 rounded-xl px-4 py-2.5 text-xs text-primary font-mono focus:outline-none"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="p-2.5 bg-[#FAFAF8] border border-[#E8E2D6] hover:bg-[#F4F1EB] rounded-xl text-gray-500 transition-all flex items-center justify-center"
                      >
                        {isCopied ? <Check className="w-5 h-5 text-[#22C55E]" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `You are invited to join our Utsav Mandal as a ${selectedRole}! Register here: ${generatedLink}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      WhatsApp Invite
                    </a>
                    <button
                      onClick={() => setShowInviteDrawer(false)}
                      className="py-3.5 bg-[#FAFAF8] hover:bg-[#F4F1EB] text-gray-500 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all border border-[#E8E2D6]"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[#FAFAF8] border border-sandstone p-4 rounded-xl flex gap-3 text-gray-500 text-[10px] font-semibold leading-relaxed mt-6">
              <AlertTriangle className="w-5 h-5 text-[#ff9500] shrink-0" />
              <span>
                Invitation tokens must not be shared publicly. Anyone with access to the link will be able to register under the selected organizational role.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Member Profile Side-drawer */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border-l border-sandstone h-full p-6 md:p-8 flex flex-col justify-between shadow-2xl relative animate-in slide-in-from-right duration-200 overflow-y-auto">
            
            {/* Close */}
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-6 right-6 p-2 bg-[#FAFAF8] border border-[#E8E2D6] hover:bg-[#F4F1EB] rounded-lg text-gray-500 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-6 pt-4">
              {/* Profile Card Header */}
              <div className="flex flex-col items-center text-center pb-4 border-b border-sandstone">
                <div className="w-20 h-20 rounded-full bg-primary-container/20 text-primary flex items-center justify-center font-bold text-2xl overflow-hidden border-2 border-primary">
                  {selectedMember.avatar_url ? (
                    <img src={selectedMember.avatar_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    selectedMember.full_name?.charAt(0).toUpperCase() || "M"
                  )}
                </div>
                <h3 className="text-lg font-black text-on-surface mt-3">
                  {selectedMember.full_name}
                </h3>
                <span className="px-3 py-0.5 mt-1 border border-sandstone rounded-full bg-[#F4F1EB] text-[9px] uppercase font-bold tracking-wider text-on-surface-variant">
                  {selectedMember.role}
                </span>
              </div>

              {/* Stats Block */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FAFAF8] border border-sandstone rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <DollarSign className="w-6 h-6 text-primary mb-1" />
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                    Total Donated
                  </span>
                  <span className="text-lg font-black text-on-surface mt-1">
                    ₹{getMemberDonationTotal(selectedMember.email, selectedMember.phone).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="bg-[#FAFAF8] border border-sandstone rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <CheckCircle2 className="w-6 h-6 text-primary mb-1" />
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                    Events Attended
                  </span>
                  <span className="text-lg font-black text-on-surface mt-1">
                    {getMemberRSVPCount(selectedMember.user_id)} RSVPs
                  </span>
                </div>
              </div>

              {/* Profile Info Details List */}
              <div className="space-y-4 bg-cream border border-sandstone rounded-2xl p-lg text-xs font-semibold text-on-surface">
                <h4 className="text-[11px] font-black uppercase text-on-surface-variant tracking-wider border-b border-sandstone pb-2 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-primary" /> Contact Details
                </h4>

                <div className="flex justify-between py-1">
                  <span className="text-on-surface-variant">Email Address:</span>
                  <span className="font-bold">{selectedMember.email || "No email assigned"}</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-on-surface-variant">Phone Number:</span>
                  <span className="font-mono font-bold">{selectedMember.phone || "No phone assigned"}</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-on-surface-variant">Member Since:</span>
                  <span className="font-mono font-bold">
                    {new Date(selectedMember.joined_at || selectedMember.created_at).toLocaleDateString("en-IN", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Administrative Gated Actions */}
              {isEditor && selectedMember.role !== "owner" && selectedMember.user_id !== userId && (
                <div className="space-y-4 border-t border-sandstone pt-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider">
                      Modify Member Role
                    </label>
                    <select
                      value={editingRole}
                      onChange={(e) => {
                        const nextRole = e.target.value;
                        setEditingRole(nextRole);
                        handleUpdateRole(selectedMember.id, nextRole);
                      }}
                      className="w-full bg-[#FAFAF8] border border-sandstone/70 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="member">Member</option>
                      <option value="volunteer">Volunteer</option>
                      <option value="treasurer">Treasurer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions footer */}
            <div className="flex justify-between items-center pt-6 border-t border-sandstone mt-6 gap-3">
              {isEditor && selectedMember.role !== "owner" && selectedMember.user_id !== userId ? (
                <button
                  onClick={() => handleRemoveMember(selectedMember.id)}
                  className="px-4 py-2 border border-kumkum-red text-kumkum-red font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-red-50 transition-all flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" /> Remove Member
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
