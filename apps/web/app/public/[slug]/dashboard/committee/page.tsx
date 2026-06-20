"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@utsav/stores";
import { useFetchMembers, apiClient } from "@utsav/api-client";
import { useParams } from "next/navigation";
import { Shield, Plus, Trash2, Check, UserPlus, HelpCircle } from "lucide-react";

const DEFAULT_POSITIONS = [
  "President",
  "Vice-President",
  "Secretary",
  "Joint Secretary",
  "Treasurer",
  "Joint Treasurer",
  "Decoration Head",
  "Cultural Program Lead",
  "Procurement Lead",
];

export default function WebCommitteePage() {
  const { role: userRole } = useAuthStore();
  const queryClient = useQueryClient();
  const params = useParams();
  const slug = params?.slug as string | undefined;

  // Local State
  const [selectedCommitteeId, setSelectedCommitteeId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCommitteeName, setNewCommitteeName] = useState("");
  const [newCommitteeYear, setNewCommitteeYear] = useState(new Date().getFullYear().toString());

  const [customPositionName, setCustomPositionName] = useState("");

  // Fetch Members list
  const { data: members = [], isLoading: loadingMembers } = useFetchMembers() as any;

  // Fetch Committees list
  const { data: committees = [], isLoading: loadingCommittees } = useQuery({
    queryKey: ["committees"],
    queryFn: () => apiClient<any[]>("/committees"),
  }) as any;

  // Create Committee Mutation
  const createCommitteeMutation = useMutation({
    mutationFn: (data: any) => apiClient("/committees", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["committees"] });
      setSelectedCommitteeId(data.id);
      setIsCreateModalOpen(false);
      setNewCommitteeName("");
    },
  });

  // Update Committee Positions Mutation
  const updateCommitteeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient(`/committees/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["committees"] });
    },
  });

  // Delete Committee Mutation
  const deleteCommitteeMutation = useMutation({
    mutationFn: (id: string) => apiClient(`/committees/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["committees"] });
      setSelectedCommitteeId(null);
    },
  });

  const activeCommittee = committees.find((c: any) => c.id === selectedCommitteeId) || committees[0];

  // Auto select first committee if none is selected
  React.useEffect(() => {
    if (committees.length > 0 && !selectedCommitteeId) {
      setSelectedCommitteeId(committees[0].id);
    }
  }, [committees, selectedCommitteeId]);

  const handleCreateCommittee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommitteeName.trim()) return;
    createCommitteeMutation.mutate({
      name: newCommitteeName,
      year: newCommitteeYear,
      is_active: committees.length === 0,
    });
  };

  // Assign member to a position
  const handleAssignPosition = (positionName: string, memberId: string | null) => {
    if (!activeCommittee) return;

    // Get current positions list, modify target position
    let positionsList = [...(activeCommittee.committee_positions || [])];

    // Remove existing entry for this specific position name
    positionsList = positionsList.filter((p: any) => p.position !== positionName);

    // If assigning (not clearing)
    if (memberId) {
      positionsList.push({
        position: positionName,
        member_id: memberId,
      });
    }

    // Call update mutation
    updateCommitteeMutation.mutate({
      id: activeCommittee.id,
      data: {
        positions: positionsList,
      },
    });
  };

  const handleAddCustomPosition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPositionName.trim() || !activeCommittee) return;

    // Let's just trigger assignment with null member
    handleAssignPosition(customPositionName.trim(), null);
    setCustomPositionName("");
  };

  const handleDeleteCommittee = (id: string) => {
    if (confirm("Are you sure you want to delete this committee configuration?")) {
      deleteCommitteeMutation.mutate(id);
    }
  };

  const isMutating =
    createCommitteeMutation.isPending ||
    updateCommitteeMutation.isPending ||
    deleteCommitteeMutation.isPending;

  // Active positions list (combines DEFAULT + any custom positions in active committee)
  const committeePositions = activeCommittee?.committee_positions || [];
  const currentPositionsList = Array.from(
    new Set([
      ...DEFAULT_POSITIONS,
      ...committeePositions.map((p: any) => p.position),
    ])
  );

  return (
    <div className="p-margin-desktop space-y-lg w-full font-sans text-on-surface">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display-md text-display-md font-bold text-primary">
            Committee Organizer
          </h2>
          <p className="text-on-surface-variant font-body-medium">
            Form annual managing boards, delegate positions, and audit team structure.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary text-white hover:bg-primary-hover shadow-sm active:scale-95 duration-100 transition-all font-semibold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 self-start sm:self-center"
        >
          <Plus className="w-5 h-5" /> Initialize Year Committee
        </button>
      </div>

      {loadingCommittees || loadingMembers ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <span className="text-sm font-sans tracking-wide text-on-surface-variant">
            Loading committee profiles...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-lg">
          {/* Left Column: Committees list */}
          <div className="lg:col-span-1 space-y-md">
            <div className="bg-cream border border-sandstone rounded-2xl p-lg space-y-md">
              <h3 className="font-title-md text-title-md font-bold text-primary">
                Annual Boards
              </h3>
              {committees.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic">
                  No committee years setup yet.
                </p>
              ) : (
                <div className="space-y-sm">
                  {committees.map((c: any) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCommitteeId(c.id)}
                      className={`p-md rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedCommitteeId === c.id || (!selectedCommitteeId && activeCommittee?.id === c.id)
                          ? "bg-primary-container/10 border-primary text-primary font-bold shadow-xs"
                          : "bg-white border-sandstone/70 hover:bg-[#F4F1EB]"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm leading-snug">{c.name}</span>
                        <span className="text-[10px] text-on-surface-variant font-medium uppercase mt-0.5 tracking-wider">
                          Year: {c.year}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCommittee(c.id);
                        }}
                        className="text-on-surface-variant hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Visual organogram board */}
          <div className="lg:col-span-3 space-y-md relative">
            {isMutating && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-xs flex items-center justify-center z-10 rounded-2xl">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!activeCommittee ? (
              <div className="bg-cream border border-sandstone rounded-2xl p-20 flex flex-col items-center justify-center text-center space-y-3">
                <Shield className="w-12 h-12 text-on-surface-variant/40" />
                <h4 className="font-bold text-on-surface-variant">No Committee Active</h4>
                <p className="text-sm text-on-surface-variant/80 max-w-sm">
                  Initialize a new committee year configuration to assign positions and team roles.
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-primary text-white hover:bg-primary-hover shadow-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 text-sm"
                >
                  <Plus className="w-4 h-4" /> Set Up Committee Now
                </button>
              </div>
            ) : (
              <div className="bg-cream border border-sandstone rounded-2xl p-lg space-y-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-sandstone pb-4 gap-2">
                  <div>
                    <h3 className="font-title-lg text-title-lg font-bold text-primary flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      {activeCommittee.name} Organizational Tree
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Assign registered members to default structural portfolios or insert custom roles.
                    </p>
                  </div>

                  {/* Custom role insert inline */}
                  <form onSubmit={handleAddCustomPosition} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add custom position..."
                      value={customPositionName}
                      onChange={(e) => setCustomPositionName(e.target.value)}
                      className="bg-white border border-sandstone/70 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-primary max-w-[180px]"
                    />
                    <button
                      type="submit"
                      disabled={!customPositionName.trim()}
                      className="bg-primary text-white hover:bg-primary-hover disabled:bg-sandstone disabled:cursor-not-allowed font-semibold p-1.5 rounded-xl shadow-sm active:scale-95 duration-100 transition-all flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </form>
                </div>

                {/* Positions Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
                  {currentPositionsList.map((posName) => {
                    // Find assignment
                    const assignment = committeePositions.find((p: any) => p.position === posName);
                    const assignedMember = assignment
                      ? members.find((m: any) => m.id === assignment.member_id)
                      : null;

                    return (
                      <div
                        key={posName}
                        className="bg-white border border-sandstone/70 rounded-xl p-md flex flex-col justify-between space-y-3 hover:shadow-xs transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-primary uppercase tracking-wide">
                              {posName}
                            </h4>
                            {assignedMember ? (
                              <p className="font-bold text-sm text-on-surface">
                                {assignedMember.full_name}
                              </p>
                            ) : (
                              <p className="text-xs text-on-surface-variant/70 font-semibold italic flex items-center gap-1">
                                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                                Unassigned
                              </p>
                            )}
                          </div>

                          {assignedMember && (
                            <img
                              src={
                                assignedMember.avatar_url ||
                                "https://lh3.googleusercontent.com/aida-public/AB6AXuCb2RcCu63CpVfuVCJqdvQPl3hrYM4daILS6dDMSbGePzBwoYZtotnn-Eejag28XcCBalxXUCcGznMzznNlLl1JTBCLbgXYf_ONZUP_m14t7Vvrszu5gaC8QdNETogsH25rEQCPJZx3ofBjxUWPeeiwJ37_jUSdlGYbsnIxN1CfuJLqnu1p2mHqBdBz0Mb2nuhvuWJwe0PkNBcp1y7bhttSPW8AB28RZpUhW0M0o11Vs5wGh-4X5jeC"
                              }
                              alt={assignedMember.full_name}
                              className="w-9 h-9 rounded-full object-cover border border-sandstone"
                            />
                          )}
                        </div>

                        {/* Assignment dropdown */}
                        <div className="flex gap-2 items-center">
                          <select
                            value={assignedMember?.id || ""}
                            onChange={(e) =>
                              handleAssignPosition(posName, e.target.value || null)
                            }
                            className="bg-[#F4F1EB]/50 hover:bg-[#F4F1EB] border border-sandstone/50 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer w-full"
                          >
                            <option value="">Choose officer...</option>
                            {members.map((m: any) => (
                              <option key={m.id} value={m.id}>
                                {m.full_name} ({m.role})
                              </option>
                            ))}
                          </select>
                          {assignedMember && (
                            <button
                              onClick={() => handleAssignPosition(posName, null)}
                              className="text-on-surface-variant hover:text-red-700 p-1.5 border border-sandstone rounded-xl hover:bg-red-50 text-xs font-bold"
                              title="Clear Assignment"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Initialize Committee Modal Dialog */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-zinc-950/20 backdrop-blur-sm"
            onClick={() => setIsCreateModalOpen(false)}
          />

          {/* Modal Container */}
          <form
            onSubmit={handleCreateCommittee}
            className="bg-white rounded-3xl w-full max-w-[400px] flex flex-col shadow-xl border border-sandstone z-10 p-lg space-y-md relative overflow-hidden"
          >
            <h3 className="font-title-lg text-title-lg font-bold text-primary flex items-center gap-1.5">
              <UserPlus className="w-5 h-5" /> Initialize Year Committee
            </h3>
            <p className="text-xs text-on-surface-variant">
              Generate an annual managing committee portfolio container to map your executives.
            </p>

            <div className="space-y-sm">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Committee Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Managing Committee 2025"
                  value={newCommitteeName}
                  onChange={(e) => setNewCommitteeName(e.target.value)}
                  className="bg-white border border-sandstone/70 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Year of Operation
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2025"
                  value={newCommitteeYear}
                  onChange={(e) => setNewCommitteeYear(e.target.value)}
                  className="bg-white border border-sandstone/70 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 border border-sandstone rounded-xl hover:bg-[#F4F1EB] active:scale-95 duration-100 transition-all text-xs font-bold"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={!newCommitteeName.trim() || createCommitteeMutation.isPending}
                className="bg-primary text-white hover:bg-primary-hover disabled:bg-sandstone disabled:cursor-not-allowed font-semibold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-sm active:scale-95 duration-100 transition-all"
              >
                {createCommitteeMutation.isPending ? "Creating..." : "Initialize Board"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
