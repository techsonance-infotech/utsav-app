"use client";

import React, { useState } from "react";
import { useAuthStore } from "@utsav/stores";
import {
  useFetchMembers,
  useUpdateMemberRole,
  useRemoveMember,
  useGenerateInvite,
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
} from "lucide-react";

export default function MembersPage() {
  const { role: currentRole, userId } = useAuthStore();
  const params = useParams();
  const slug = params?.slug as string | undefined;

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showInviteDrawer, setShowInviteDrawer] = useState(false);
  const [selectedRole, setSelectedRole] = useState("member");
  const [expiresIn, setExpiresIn] = useState(7);
  const [inviteeName, setInviteeName] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [editingRole, setEditingRole] = useState("");
  const [activeMenuMemberId, setActiveMenuMemberId] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Queries & Mutations
  const { data: members = [], isLoading, refetch } = useFetchMembers({
    search: search.trim() || undefined,
    role: roleFilter || undefined,
  }) as any;

  const updateRoleMutation = useUpdateMemberRole();
  const removeMemberMutation = useRemoveMember();
  const generateInviteMutation = useGenerateInvite();

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      await updateRoleMutation.mutateAsync({ id: memberId, role: newRole });
      refetch();
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
      refetch();
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
        expires_in_days: expiresIn,
      });
      setGeneratedLink(data.link);
    } catch (err: any) {
      alert(err.message || "Failed to generate invite token");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const isEditor = currentRole === "owner" || currentRole === "admin";

  // Filter members client-side by status
  const filteredMembers = (members || []).filter((m: any) => {
    if (statusFilter && m.status !== statusFilter) return false;
    return true;
  });

  // Pagination calculations
  const totalRows = filteredMembers.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + rowsPerPage);

  // Stats calculators
  const volunteersCount = members?.filter((m: any) => m.role === "volunteer").length || 0;
  
  // Calculate new joined members in the last 30 days
  const joinedThisMonth = members?.filter((m: any) => {
    const joinDate = new Date(m.joined_at || m.created_at || new Date());
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    return joinDate >= oneMonthAgo;
  }).length || 0;

  return (
    <div className="p-margin-desktop space-y-xl w-full">
      {/* Page Hero / Action Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-tulsi-green animate-pulse"></span>
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Live Directory</p>
          </div>
          <h1 className="font-display-xl text-display-xl text-charcoal">Community Members</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Manage and track {members?.length || 0} active community members and volunteers.
          </p>
        </div>
        {isEditor && (
          <button
            onClick={() => {
              setGeneratedLink("");
              setInviteeName("");
              setShowInviteDrawer(true);
            }}
            className="h-[56px] px-xl bg-primary-container text-on-primary-container font-headline-sm text-headline-sm rounded-xl font-bold shadow-sm saffron-glow flex items-center justify-center space-x-3 active:scale-95 transition-all uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              person_add
            </span>
            <span>Invite Member</span>
          </button>
        )}
      </div>

      {/* Bento Grid Filter Interface */}
      <div className="bg-white p-lg rounded-xl border border-sandstone shadow-sm grid grid-cols-1 md:grid-cols-12 gap-lg items-center">
        <div className="md:col-span-4 relative">
          <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2 ml-1">Search Directory</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-puja-white border border-sandstone rounded-xl text-body-md focus:border-primary-container focus:ring-0 transition-all outline-none"
              placeholder="Name, email, or phone..."
            />
          </div>
        </div>
        <div className="md:col-span-3">
          <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2 ml-1">Member Role</label>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-3 bg-puja-white border border-sandstone rounded-xl text-body-md focus:border-primary-container focus:ring-0 transition-all outline-none"
          >
            <option value="">All Roles</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="treasurer">Treasurer</option>
            <option value="volunteer">Volunteer</option>
            <option value="member">Member</option>
          </select>
        </div>
        <div className="md:col-span-3">
          <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2 ml-1">Account Status</label>
          <div className="flex bg-puja-white p-1 border border-sandstone rounded-xl">
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
                className={`flex-1 py-2 px-3 rounded-lg text-label-md transition-all ${
                  statusFilter === tab.id
                    ? "bg-white shadow-sm border border-sandstone font-semibold text-primary"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="md:col-span-2 flex items-end justify-end h-full">
          <button className="w-full py-3 px-4 border border-sandstone text-on-surface-variant font-label-md rounded-xl hover:bg-surface-container-low transition-all flex items-center justify-center space-x-2">
            <span className="material-symbols-outlined">filter_list</span>
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Data Table Section */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-sandstone shadow-sm overflow-hidden p-16 text-center">
          <div className="w-8 h-8 rounded-full border-4 border-primary-container border-t-transparent animate-spin mx-auto mb-4" />
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Loading Directory...</span>
        </div>
      ) : paginatedMembers.length > 0 ? (
        <div className="bg-white rounded-xl border border-sandstone shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream border-b border-outline-variant">
                  <th className="px-lg py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-tight">Member</th>
                  <th className="px-lg py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-tight">Role</th>
                  <th className="px-lg py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-tight">Phone Number</th>
                  <th className="px-lg py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-tight">Joined Date</th>
                  <th className="px-lg py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-tight">Status</th>
                  {isEditor && <th className="px-lg py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-tight text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-sandstone">
                {paginatedMembers.map((member: any) => (
                  <tr key={member.id} className="hover:bg-surface-container-low transition-colors relative">
                    <td className="px-lg py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary overflow-hidden border border-primary-container/20 shrink-0">
                          {member.avatar_url ? (
                            <img src={member.avatar_url} className="w-full h-full object-cover" alt={member.full_name} />
                          ) : (
                            member.full_name?.charAt(0).toUpperCase() || "M"
                          )}
                        </div>
                        <div>
                          <div className="font-label-md text-on-surface font-semibold">{member.full_name}</div>
                          <div className="font-body-md text-on-surface-variant text-[12px]">{member.email || `${member.full_name.toLowerCase().replace(/\s+/g, ".")}@utsavmail.com`}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-lg py-4">
                      <span className={`px-3 py-1 rounded-full text-label-sm font-medium border uppercase tracking-wider text-[11px] font-bold ${
                        member.role === "owner"
                          ? "bg-primary-container/20 text-primary border border-primary/20"
                          : member.role === "admin"
                          ? "bg-tertiary-container/20 text-tertiary border border-tertiary/20"
                          : member.role === "treasurer"
                          ? "bg-aarti-gold/20 text-aarti-gold border border-aarti-gold/20"
                          : member.role === "volunteer"
                          ? "bg-surface-variant text-on-surface-variant border border-outline-variant"
                          : "bg-surface-container text-on-surface-variant border border-outline-variant"
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-lg py-4 font-mono-data text-on-surface">
                      {member.phone || "+91 —"}
                    </td>
                    <td className="px-lg py-4 font-mono-data text-on-surface">
                      {new Date(member.joined_at || member.created_at).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-lg py-4">
                      <div className={`flex items-center space-x-1.5 ${member.status === "active" ? "text-tulsi-green" : "text-on-surface-variant"}`}>
                        <span className={`w-2 h-2 rounded-full ${member.status === "active" ? "bg-tulsi-green" : "bg-outline"}`}></span>
                        <span className="text-label-md font-semibold capitalize">{member.status}</span>
                      </div>
                    </td>
                    <td className="px-lg py-4 text-right relative">
                      <div className="flex items-center justify-end space-x-2">
                        {isEditor && member.role !== "owner" && member.user_id !== userId ? (
                          <>
                            <button
                              onClick={() => {
                                setEditingMember(member);
                                setEditingRole(member.role);
                              }}
                              className="p-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container rounded-lg"
                              title="Edit Member Role"
                            >
                              <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                            <div className="relative inline-block text-left">
                              <button
                                onClick={() => setActiveMenuMemberId(activeMenuMemberId === member.id ? null : member.id)}
                                className="p-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container rounded-lg"
                                title="More Actions"
                              >
                                <span className="material-symbols-outlined text-[20px]">more_vert</span>
                              </button>
                              
                              {activeMenuMemberId === member.id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setActiveMenuMemberId(null)}
                                  />
                                  <div className="absolute right-0 mt-2 w-48 bg-white border border-sandstone rounded-xl shadow-lg z-20 py-1 origin-top-right">
                                    <button
                                      onClick={() => {
                                        setActiveMenuMemberId(null);
                                        handleRemoveMember(member.id);
                                      }}
                                      className="w-full text-left px-4 py-2 text-xs font-bold text-kumkum-red hover:bg-red-50 flex items-center gap-2"
                                    >
                                      <span className="material-symbols-outlined text-sm">delete</span>
                                      Remove Member
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </>
                        ) : (
                          <span className="text-outline/40 font-mono-data text-[12px] pr-4">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-lg py-4 bg-cream border-t border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-md">
            <div className="flex items-center space-x-4">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-transparent border-none text-label-sm font-semibold focus:ring-0 cursor-pointer outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="font-label-sm text-label-sm text-on-surface-variant border-l border-outline-variant pl-4">
                Showing {startIndex + 1}-{Math.min(startIndex + rowsPerPage, totalRows)} of {totalRows} members
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-all ${
                  currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-bold text-label-md flex items-center justify-center transition-colors ${
                    currentPage === page
                      ? "bg-primary-container text-on-primary-container shadow-sm font-bold"
                      : "hover:bg-surface-container-high text-on-surface-variant font-medium"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`p-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-all ${
                  currentPage === totalPages || totalPages === 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-sandstone shadow-sm overflow-hidden p-16 text-center text-on-surface-variant font-label-md">
          No community members matched your search filters.
        </div>
      )}

      {/* Footer Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg pb-xl">
        <div className="bg-white p-lg rounded-xl border border-sandstone shadow-sm flex items-center justify-between">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">Volunteers</p>
            <h3 className="font-headline-md text-headline-md text-charcoal">{volunteersCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-surface-variant flex items-center justify-center text-outline">
            <span className="material-symbols-outlined text-[24px]">volunteer_activism</span>
          </div>
        </div>
        <div className="bg-white p-lg rounded-xl border border-sandstone shadow-sm flex items-center justify-between">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">New this month</p>
            <h3 className="font-headline-md text-headline-md text-charcoal">+{joinedThisMonth}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">trending_up</span>
          </div>
        </div>
        <div className="bg-white p-lg rounded-xl border border-sandstone shadow-sm flex items-center justify-between">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">Total Collections</p>
            <h3 className="font-headline-md text-headline-md text-charcoal font-sans">₹ 4.8L</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-tertiary-container/10 flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined text-[24px]">savings</span>
          </div>
        </div>
      </div>

      {/* Slide-out Invitation Panel */}
      {showInviteDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border-l border-sandstone h-full p-6 md:p-8 flex flex-col justify-between shadow-2xl relative animate-in slide-in-from-right duration-300">
            
            {/* Close Button */}
            <button
              onClick={() => setShowInviteDrawer(false)}
              className="absolute top-6 right-6 p-2 bg-[#FAFAF8] border border-[#E8E2D6] hover:bg-[#F4F1EB] rounded-lg text-gray-500 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-[#3A3530] uppercase tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-[#ff9500]" /> Generate Invitation
                </h2>
                <p className="text-gray-500 text-xs mt-1 font-semibold leading-relaxed">
                  Create single-use secure tokens for members. Expiry checks are enforced database side.
                </p>
              </div>

              {!generatedLink ? (
                <form onSubmit={handleGenerateInvite} className="space-y-4 pt-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-2">
                      Invitee Full Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={inviteeName}
                      onChange={(e) => setInviteeName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-[#ff9500]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-2">
                      Assigned Role
                    </label>
                    <div className="grid grid-cols-2 gap-3">
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
                          className={`py-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                            selectedRole === roleOpt.id
                              ? "bg-[#ff9500]/10 border-[#ff9500] text-[#ff9500]"
                              : "bg-[#FAFAF8] border-[#E8E2D6] hover:bg-[#F4F1EB] text-gray-500"
                          }`}
                        >
                          {roleOpt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-2">
                      Token Expiration
                    </label>
                    <select
                      value={expiresIn}
                      onChange={(e) => setExpiresIn(parseInt(e.target.value))}
                      className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-[#ff9500]"
                    >
                      <option value={1}>24 Hours</option>
                      <option value={7}>7 Days (Default)</option>
                      <option value={30}>30 Days</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={generateInviteMutation.isPending}
                    className="w-full bg-[#ff9500] hover:bg-[#e68600] text-white font-extrabold py-4 rounded-xl shadow-lg mt-4 uppercase text-xs tracking-wider transition-all"
                  >
                    {generateInviteMutation.isPending ? "Generating..." : "Generate Invite Token"}
                  </button>
                </form>
              ) : (
                <div className="space-y-6 pt-4">
                  {/* Successfully generated screen */}
                  <div className="bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3">
                    <QrCode className="w-16 h-16 text-[#ff9500]" />
                    <span className="text-xs text-[#3A3530] font-black uppercase tracking-wider">
                      Invited as: {selectedRole.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Expires in {expiresIn} days. Enforced server-side.
                    </span>
                  </div>

                  {/* Invite Link copy bar */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider">
                      Invitation Join Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={generatedLink}
                        className="flex-1 bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs text-[#8c5000] font-mono focus:outline-none"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="p-3 bg-[#FAFAF8] border border-[#E8E2D6] hover:bg-[#F4F1EB] rounded-xl text-gray-500 transition-all flex items-center justify-center"
                        title="Copy Link"
                      >
                        {isCopied ? <Check className="w-5 h-5 text-[#22C55E]" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Share buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `You are invited to join our Utsav Mandal as a ${selectedRole}! Click here to register: ${generatedLink}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      WhatsApp Share
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

            <div className="bg-[#FAFAF8] border border-sandstone p-4 rounded-xl flex gap-3 text-gray-500 text-[11px] font-semibold leading-relaxed">
              <AlertTriangle className="w-5 h-5 text-[#ff9500] shrink-0" />
              <span>
                These tokens must not be shared publicly. Anyone possessing this link can register as a member of your organization.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-sandstone rounded-2xl w-full max-w-md p-6 relative shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-charcoal">Manage Member Role</h3>
            <div>
              <p className="text-xs font-semibold text-on-surface-variant">Member Name: <span className="font-bold text-charcoal">{editingMember.full_name}</span></p>
              <p className="text-xs font-semibold text-on-surface-variant">Email Address: <span className="font-bold text-charcoal">{editingMember.email}</span></p>
            </div>
            
            <div>
              <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-2">
                Assigned Portal Role
              </label>
              <select
                value={editingRole}
                onChange={(e) => setEditingRole(e.target.value)}
                className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary"
              >
                <option value="member">Member</option>
                <option value="volunteer">Volunteer</option>
                <option value="treasurer">Treasurer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingMember(null)}
                className="px-4 py-2 border border-[#E8E2D6] rounded-lg text-xs font-semibold text-charcoal hover:bg-cream"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleUpdateRole(editingMember.id, editingRole);
                  setEditingMember(null);
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:opacity-90"
              >
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
