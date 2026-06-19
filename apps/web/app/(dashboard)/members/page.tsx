"use client";

import React, { useState } from "react";
import { useAuthStore } from "@utsav/stores";
import {
  useFetchMembers,
  useUpdateMemberRole,
  useRemoveMember,
  useGenerateInvite,
} from "@utsav/api-client";
import {
  Search,
  UserPlus,
  Mail,
  Phone,
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
  const { role: currentRole, tenantSlug } = useAuthStore();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showInviteDrawer, setShowInviteDrawer] = useState(false);
  const [selectedRole, setSelectedRole] = useState("member");
  const [expiresIn, setExpiresIn] = useState(7);
  const [inviteeName, setInviteeName] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // Queries & Mutations
  const { data: members, isLoading, refetch } = useFetchMembers({
    search: search.trim() || undefined,
    role: roleFilter || undefined,
  });

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

  return (
    <div className="space-y-8 relative min-h-screen pb-16">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-serif text-neutral-100">Members Directory</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Search, filter, assign admin roles, and invite volunteers to coordinate festival efforts.
          </p>
        </div>
        {isEditor && (
          <button
            onClick={() => {
              setGeneratedLink("");
              setInviteeName("");
              setShowInviteDrawer(true);
            }}
            className="px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-neutral-950 font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg"
          >
            <UserPlus className="w-5 h-5" />
            Invite Member
          </button>
        )}
      </div>

      {/* Directory Search Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search member directory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-850 rounded-xl pl-12 pr-4 py-3.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-all"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2 items-center">
          {[
            { id: "", label: "All Roles" },
            { id: "owner", label: "Owner" },
            { id: "admin", label: "Admin" },
            { id: "treasurer", label: "Treasurer" },
            { id: "volunteer", label: "Volunteer" },
            { id: "member", label: "Member" },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setRoleFilter(chip.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                roleFilter === chip.id
                  ? "bg-neutral-850 border-orange-500 text-orange-500"
                  : "bg-neutral-900 border-neutral-850 hover:bg-neutral-800 text-neutral-400"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Members List */}
      {isLoading ? (
        <div className="text-neutral-500">Loading directory...</div>
      ) : members && members.length > 0 ? (
        <div className="bg-neutral-900 border border-neutral-850 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-neutral-300">
              <thead className="bg-neutral-950 border-b border-neutral-850 text-neutral-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Name / ID</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4">Status</th>
                  {isEditor && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-neutral-855/50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center font-bold text-orange-500 font-serif">
                        {member.full_name?.charAt(0).toUpperCase() || "M"}
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-100">{member.full_name}</div>
                        <div className="text-xs text-neutral-500 font-mono mt-0.5">{member.user_id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isEditor && member.role !== "owner" && member.user_id !== useAuthStore.getState().userId ? (
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                          className="bg-neutral-950 border border-neutral-805 text-xs font-semibold rounded-lg px-2 py-1.5 focus:outline-none focus:border-orange-500"
                        >
                          <option value="member">Member</option>
                          <option value="volunteer">Volunteer</option>
                          <option value="treasurer">Treasurer</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`inline-flex px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${
                          member.role === "owner"
                            ? "bg-amber-500/10 border border-amber-500/20 text-amber-500"
                            : member.role === "admin"
                            ? "bg-red-500/10 border border-red-500/20 text-red-400"
                            : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                        }`}>
                          {member.role.toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-neutral-400">
                      {new Date(member.joined_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-green-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        {member.status}
                      </span>
                    </td>
                    {isEditor && (
                      <td className="px-6 py-4 text-right">
                        {member.role !== "owner" && member.user_id !== useAuthStore.getState().userId ? (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 transition-all"
                            title="Remove Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-xs text-neutral-500">-</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-850 rounded-2xl p-12 text-center text-neutral-500 flex flex-col items-center justify-center gap-3">
          <Users className="w-10 h-10 text-neutral-600" />
          <span>No members match your active search or filters.</span>
        </div>
      )}

      {/* Slide-out Invitation Panel */}
      {showInviteDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-neutral-900 border-l border-neutral-850 h-full p-6 md:p-8 flex flex-col justify-between shadow-2xl relative">
            <button
              onClick={() => setShowInviteDrawer(false)}
              className="absolute top-6 right-6 p-2 bg-neutral-950 border border-neutral-850 hover:bg-neutral-800 rounded-lg text-neutral-400 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-serif text-neutral-100 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-orange-500" /> Generate Invitation
                </h2>
                <p className="text-neutral-400 text-xs mt-1">
                  Create single-use secure tokens for members. Expiry checks are enforced database side.
                </p>
              </div>

              {!generatedLink ? (
                <form onSubmit={handleGenerateInvite} className="space-y-4 pt-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                      Invitee Full Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={inviteeName}
                      onChange={(e) => setInviteeName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full bg-neutral-950 border border-neutral-805 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
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
                          className={`py-3 rounded-xl border text-xs font-semibold transition-all ${
                            selectedRole === roleOpt.id
                              ? "bg-neutral-850 border-orange-500 text-orange-500"
                              : "bg-neutral-950 border-neutral-850 hover:bg-neutral-800 text-neutral-400"
                          }`}
                        >
                          {roleOpt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                      Token Expiration
                    </label>
                    <select
                      value={expiresIn}
                      onChange={(e) => setExpiresIn(parseInt(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-805 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none"
                    >
                      <option value={1}>24 Hours</option>
                      <option value={7}>7 Days (Default)</option>
                      <option value={30}>30 Days</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={generateInviteMutation.isPending}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-neutral-950 font-bold py-4 rounded-xl shadow-lg mt-4"
                  >
                    {generateInviteMutation.isPending ? "Generating..." : "Generate Invite Token"}
                  </button>
                </form>
              ) : (
                <div className="space-y-6 pt-4">
                  {/* Successfully generated screen */}
                  <div className="bg-neutral-950 border border-neutral-855 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-3">
                    <QrCode className="w-16 h-16 text-orange-500" />
                    <span className="text-xs text-neutral-400 font-semibold font-mono">
                      Invited as: {selectedRole.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-neutral-600 block">
                      Expires in {expiresIn} days. Enforced server-side.
                    </span>
                  </div>

                  {/* Invite Link copy bar */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Invitation Join Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={generatedLink}
                        className="flex-1 bg-neutral-950 border border-neutral-805 rounded-xl px-4 py-3 text-xs text-amber-500 font-mono focus:outline-none"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="p-3 bg-neutral-950 border border-neutral-805 hover:bg-neutral-800 rounded-xl text-neutral-300 transition-all flex items-center justify-center"
                        title="Copy Link"
                      >
                        {isCopied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
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
                      className="py-3 bg-green-650 hover:bg-green-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all border border-green-600/30"
                    >
                      <ExternalLink className="w-4 h-4" />
                      WhatsApp Share
                    </a>
                    <button
                      onClick={() => setShowInviteDrawer(false)}
                      className="py-3 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 font-semibold text-sm rounded-xl transition-all border border-neutral-850"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-neutral-950 border border-neutral-850 p-4 rounded-xl flex gap-3 text-neutral-400 text-xs">
              <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
              <span>
                These tokens must not be shared publicly. Anyone possessing this link can register as a member of your organization.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
