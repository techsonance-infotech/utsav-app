"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@utsav/stores";
import { useFetchCampaigns, useCreateRazorpayOrder } from "@utsav/api-client";
import { Flame, IndianRupee, Heart, CheckCircle2, AlertTriangle, FileText, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function DonateGateway() {
  const { tenantId, tenantName } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const campaignIdParam = searchParams.get("campaign_id") || "";

  const { data: campaigns } = useFetchCampaigns();
  const createOrderMutation = useCreateRazorpayOrder();

  // Form states
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(campaignIdParam);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Payment states
  const [isProcessing, setIsProcessing] = useState(false);
  const [mockOrderData, setMockOrderData] = useState<any>(null);
  const [confirmedDonation, setConfirmedDonation] = useState<any>(null);

  // Sync selected campaign if URL changes
  useEffect(() => {
    if (campaignIdParam) {
      setSelectedCampaign(campaignIdParam);
    }
  }, [campaignIdParam]);

  const quickAmounts = [501, 1100, 2100, 5100, 11000];

  const handleQuickAmount = (val: number) => {
    setAmount(val.toString());
  };

  const handleDonateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsProcessing(true);

    if (!donorName) {
      setIsProcessing(false);
      return setErrorMsg("Please provide your name.");
    }
    if (!amount || parseFloat(amount) <= 0) {
      setIsProcessing(false);
      return setErrorMsg("Please specify a positive donation amount.");
    }

    try {
      // Create Razorpay Order or Mock Token
      const order = await createOrderMutation.mutateAsync({
        donor_name: donorName,
        donor_phone: donorPhone || undefined,
        donor_email: donorEmail || undefined,
        amount: parseFloat(amount),
        campaign_id: selectedCampaign || undefined,
        is_anonymous: isAnonymous,
        note: note || undefined,
      });

      if (order.is_mock) {
        // Show simulated sandbox checkout modal
        setMockOrderData(order);
      } else {
        // Trigger real Razorpay checkout
        triggerRealRazorpay(order);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initiate transaction.");
      setIsProcessing(false);
    }
  };

  const triggerRealRazorpay = (order: any) => {
    // Dynamically load Razorpay SDK
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Utsav Mandal",
        description: "Devotional Contribution",
        order_id: order.id,
        handler: async function (response: any) {
          // Confirm signature via webhook simulation or verification endpoint
          await handlePaymentSuccess(order.id, response.razorpay_payment_id, response.razorpay_signature);
        },
        prefill: {
          name: donorName,
          email: donorEmail || "",
          contact: donorPhone || "",
        },
        theme: {
          color: "#FF9500",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
      setIsProcessing(false);
    };
    script.onerror = () => {
      setErrorMsg("Failed to load Razorpay payment SDK.");
      setIsProcessing(false);
    };
    document.body.appendChild(script);
  };

  const handleSimulateMockPayment = async () => {
    if (!mockOrderData) return;
    setIsProcessing(true);

    try {
      const mockPaymentId = `pay_mock_${Math.random().toString(36).substring(2, 12)}`;
      await handlePaymentSuccess(mockOrderData.id, mockPaymentId, "sandbox_bypass_signature");
    } catch (err: any) {
      setErrorMsg("Failed to complete sandbox payment simulation.");
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (orderId: string, paymentId: string, signature: string) => {
    // Fire webhook simulator
    const res = await fetch("/api/v1/webhooks/razorpay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-razorpay-signature": signature,
      },
      body: JSON.stringify({
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: paymentId,
              order_id: orderId,
              amount: parseFloat(amount) * 100,
              status: "captured",
            },
          },
        },
      }),
    });

    if (res.ok) {
      setConfirmedDonation({
        receipt_number: `RCPT-${Math.floor(Math.random() * 90000) + 10000}`,
        donor_name: donorName,
        amount: parseFloat(amount),
        payment_id: paymentId,
      });
      setMockOrderData(null);
    } else {
      setErrorMsg("Webhook payment capture verification failed.");
    }
    setIsProcessing(false);
  };

  const formatRupee = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-orange-500 selection:text-neutral-950">
      {/* Header */}
      <header className="max-w-4xl w-full mx-auto px-6 py-6 flex justify-between items-center border-b border-neutral-900">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-400 hover:text-neutral-200 transition-all text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Portal
        </button>
        <span className="font-serif font-extrabold text-lg tracking-wide bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
          UTSAV DONATE
        </span>
      </header>

      {/* Main Container */}
      <div className="max-w-2xl w-full mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        {confirmedDonation ? (
          /* SUCCESS SCREEN */
          <div className="bg-neutral-900 border border-neutral-850 rounded-3xl p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
            {/* Spinning Glowing Diya Visual */}
            <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-orange-500 to-amber-400 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.3)] animate-bounce">
              <Flame className="w-12 h-12 text-neutral-950 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold font-serif text-neutral-100">
                Aarti / Donation Successful!
              </h2>
              <p className="text-sm text-neutral-400 max-w-sm mx-auto">
                Thank you for your generous contribution. May the blessings of the deities bring prosperity to your family.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-neutral-950 border border-neutral-805 p-6 rounded-2xl text-left space-y-3 font-mono text-xs text-neutral-400">
              <div className="flex justify-between">
                <span>Receipt Number:</span>
                <span className="font-bold text-neutral-200">{confirmedDonation.receipt_number}</span>
              </div>
              <div className="flex justify-between">
                <span>Donor Name:</span>
                <span className="font-bold text-neutral-200">{confirmedDonation.donor_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Contributed:</span>
                <span className="font-bold text-orange-400 text-sm">{formatRupee(confirmedDonation.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Transaction Reference:</span>
                <span className="font-bold text-neutral-200 truncate max-w-[180px]">{confirmedDonation.payment_id}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3.5 bg-neutral-950 border border-neutral-805 hover:bg-neutral-800 text-neutral-300 font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all"
              >
                <FileText className="w-4 h-4" /> Print Receipt
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-neutral-950 font-bold rounded-xl text-sm transition-all shadow-lg"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* FORM SCREEN */
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight font-serif text-neutral-100">
                Support {tenantName || "Mandal festival"}
              </h1>
              <p className="text-neutral-400 text-sm max-w-sm mx-auto">
                Secure online payment verified by Razorpay. Enter details below to obtain a digital receipt.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleDonateSubmit} className="bg-neutral-900 border border-neutral-850 rounded-3xl p-6 md:p-8 space-y-6">
              {/* Preset Amounts */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Select Donation Amount
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                  {quickAmounts.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickAmount(val)}
                      className={`py-3 rounded-xl font-bold font-mono text-xs border transition-all ${
                        amount === val.toString()
                          ? "bg-orange-500 border-orange-500 text-neutral-950 shadow-lg shadow-orange-500/10"
                          : "bg-neutral-950 border-neutral-805 text-neutral-400 hover:text-neutral-200"
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div className="relative">
                <IndianRupee className="w-5 h-5 text-neutral-500 absolute left-4 top-3.5" />
                <input
                  type="number"
                  placeholder="Enter custom amount..."
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-805 rounded-xl pl-12 pr-4 py-3.5 text-neutral-200 font-mono focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Donor Name */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Donor Full Name
                </label>
                <input
                  type="text"
                  placeholder="Rajesh Kumar"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-805 rounded-xl px-4 py-3.5 text-neutral-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Phone and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-805 rounded-xl px-4 py-3.5 text-neutral-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="rajesh@gmail.com"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-805 rounded-xl px-4 py-3.5 text-neutral-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Campaign Dropdown */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Designated Campaign / Project
                </label>
                <select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-4 py-3.5 text-neutral-300 focus:outline-none"
                >
                  <option value="">General Fund (No campaign restriction)</option>
                  {campaigns?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Note / Message */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Devotional message / Note (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Wishing for good health of my parents."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-805 rounded-xl px-4 py-3.5 text-neutral-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Anonymous Check */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="donate-anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-805 bg-neutral-950 text-orange-500 accent-orange-500"
                />
                <label htmlFor="donate-anonymous" className="text-xs font-semibold text-neutral-400 cursor-pointer">
                  Donate Anonymously (Hide identity on public board)
                </label>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-neutral-950 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transition-all font-serif text-base"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing order...
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5 fill-neutral-950" /> Initiate Secure Payment
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Sandbox Simulator Modal */}
      {mockOrderData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-amber-500/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-500 mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-neutral-100 font-serif">Sandbox Payment Gateway</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                This Mandal is running in local developer mode. Click below to simulate Razorpay payment success and webhook delivery.
              </p>
            </div>

            <div className="bg-neutral-950 border border-neutral-805 p-4 rounded-xl text-left font-mono text-[10px] text-neutral-500 space-y-1.5">
              <div>ORDER ID: {mockOrderData.id}</div>
              <div>AMOUNT: {formatRupee(mockOrderData.amount / 100)}</div>
              <div>KEY ID: {mockOrderData.key_id}</div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setMockOrderData(null);
                  setIsProcessing(false);
                }}
                className="flex-1 py-3 bg-neutral-950 border border-neutral-850 hover:bg-neutral-800 text-neutral-400 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSimulateMockPayment}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-neutral-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-neutral-905 bg-neutral-950 py-8 px-6 text-center text-xs text-neutral-600">
        © 2026 Utsav Technologies Pvt. Ltd. All rights reserved.
      </footer>
    </main>
  );
}

export default function DonateGatewayPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    }>
      <DonateGateway />
    </React.Suspense>
  );
}
