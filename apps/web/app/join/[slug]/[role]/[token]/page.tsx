"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFetchInvite, useAcceptInvite } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import { Flame, CheckCircle, AlertCircle, ArrowRight, UserPlus, Key } from "lucide-react";

export default function JoinMandalPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const { data: invite, isLoading, error } = useFetchInvite(token);
  const acceptInviteMutation = useAcceptInvite();

  // Auth checks
  const { userId, setAuth } = useAuthStore();
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPassword, setGuestPassword] = useState("");
  const [mockUserId, setMockUserId] = useState("");
  const [mockToken, setMockToken] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleJoin = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await acceptInviteMutation.mutateAsync(token);
      setSuccessMsg("Success! You've joined the organization.");

      // Refresh JWT / session role in authStore
      setAuth({
        ...useAuthStore.getState(),
        tenantId: res.tenantId,
        role: res.role,
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/members");
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to accept invitation");
    }
  };

  const handleGuestLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockUserId.trim() || !mockToken.trim()) {
      setErrorMsg("User ID and Access Token are required for mock verification.");
      return;
    }
    setAuth({
      accessToken: mockToken.trim(),
      userId: mockUserId.trim(),
      tenantId: null,
      tenantName: null,
      tenantSlug: null,
      role: null,
    });
    setErrorMsg("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-400 flex items-center justify-center">
        Resolving invitation token...
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-850 rounded-3xl p-8 shadow-xl">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-100 font-serif">Invalid Invitation</h2>
          <p className="text-neutral-400 text-sm mt-2">
            This invitation link is invalid, expired, or has already been used. Please request a new invite link from your Mandal administrator.
          </p>
          <a
            href="/"
            className="mt-6 inline-flex bg-neutral-950 border border-neutral-805 hover:bg-neutral-800 text-neutral-300 font-semibold px-6 py-2.5 rounded-xl text-sm transition-all"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    owner: "Founder / Owner",
    admin: "Administrator",
    treasurer: "Treasurer / Accountant",
    volunteer: "Event Volunteer",
    member: "Mandal Member",
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-850 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Saffron background blur */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-orange-500/10 blur-3xl pointer-events-none" />

        {/* Brand Icon */}
        <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-center justify-center mb-6">
          <Flame className="w-7 h-7 text-orange-500" />
        </div>

        {/* Invited Label */}
        <span className="text-[10px] uppercase font-bold tracking-widest text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-md border border-orange-500/20">
          Invitation Offer
        </span>

        {/* Mandal details */}
        <h1 className="text-2xl font-bold font-serif text-neutral-100 mt-3">{invite.tenant.name}</h1>
        <p className="text-xs text-neutral-500 font-mono mt-0.5">{invite.tenant.city}, {invite.tenant.state}</p>

        <div className="border-t border-neutral-855 pt-6 mt-6 space-y-4">
          <p className="text-sm text-neutral-450 leading-relaxed">
            You have been invited to join the organization as:
            <strong className="block text-amber-500 text-base mt-1 font-semibold">
              {roleLabels[invite.role] || invite.role.toUpperCase()}
            </strong>
          </p>

          {successMsg && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {errorMsg}
            </div>
          )}

          {userId ? (
            /* Logged in acceptance card */
            <div className="space-y-4 pt-2">
              <p className="text-xs text-neutral-500">
                You are currently verified under User ID: <code className="text-amber-500 font-mono">{userId.substring(0, 8)}...</code>. Your profile will be added to this Mandal.
              </p>
              <button
                onClick={handleJoin}
                disabled={acceptInviteMutation.isPending}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-neutral-950 font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                {acceptInviteMutation.isPending ? "Joining..." : "Accept & Join Mandal"} <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            /* Guest verification card */
            <form onSubmit={handleGuestLogin} className="space-y-4 pt-2">
              <div className="bg-neutral-950 border border-neutral-850 p-4 rounded-xl text-xs space-y-1 text-neutral-400">
                <span className="font-semibold text-neutral-300 block">Verification Session Required</span>
                Enter your Auth credentials below to verify your identity.
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide mb-1">
                  User ID (UUID)
                </label>
                <input
                  type="text"
                  value={mockUserId}
                  onChange={(e) => setMockUserId(e.target.value)}
                  placeholder="u0000001-..."
                  className="w-full bg-neutral-950 border border-neutral-805 rounded-xl px-4 py-2.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide mb-1">
                  Access Token (JWT)
                </label>
                <input
                  type="password"
                  value={mockToken}
                  onChange={(e) => setMockToken(e.target.value)}
                  placeholder="Bearer token"
                  className="w-full bg-neutral-950 border border-neutral-805 rounded-xl px-4 py-2.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4" />
                Authenticate & Verify Link
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
