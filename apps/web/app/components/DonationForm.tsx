"use client";

import React, { useState, useEffect } from "react";
import { useCreateRazorpayOrder, useCreateDonation } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import { Heart, CheckCircle2, AlertCircle, Loader2, Sparkles, Lock, X } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
}

interface DonationFormProps {
  tenantId: string;
  campaigns: Campaign[];
  primaryColor: string;
  razorpayKeyId?: string | null;
  logoUrl?: string | null;
}

export default function DonationForm({
  tenantId,
  campaigns,
  primaryColor,
  razorpayKeyId,
  logoUrl,
}: DonationFormProps) {
  const createOrderMutation = useCreateRazorpayOrder();
  const recordDonationMutation = useCreateDonation();

  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState("");

  // Payment states
  const [isProcessing, setIsProcessing] = useState(false);
  const [mockOrderData, setMockOrderData] = useState<any>(null);
  const [confirmedDonation, setConfirmedDonation] = useState<any>(null);

  const { role } = useAuthStore();
  const allowedOffline = ["owner", "admin", "treasurer", "committee_member"].includes(role || "");

  const hasRazorpay = !!razorpayKeyId;
  const hasQRCode = !!logoUrl;

  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "upi_qr" | "cash">(
    hasRazorpay ? "razorpay" : hasQRCode ? "upi_qr" : "cash"
  );
  const [paymentStatus, setPaymentStatus] = useState<"confirmed" | "pending">("confirmed");

  useEffect(() => {
    if (!allowedOffline) {
      if (paymentMethod === "upi_qr") {
        setPaymentStatus("pending");
      } else {
        setPaymentStatus("confirmed");
      }
    }
  }, [paymentMethod, allowedOffline]);

  const amounts = [501, 1001, 2100, 5100];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!donorName.trim()) {
      newErrors.donorName = "Donor name is required";
    }

    if (!amount || Number(amount) <= 0) {
      newErrors.amount = "Contribution amount must be greater than 0";
    }

    if (donorEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail)) {
      newErrors.donorEmail = "Please enter a valid email address";
    }

    if (donorPhone.trim() && !/^\d{10}$/.test(donorPhone.trim())) {
      newErrors.donorPhone = "Phone number must be exactly 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setErrorMsg("");
    setIsProcessing(true);

    if (paymentMethod === "upi_qr" || paymentMethod === "cash") {
      try {
        const res = await recordDonationMutation.mutateAsync({
          donor_name: donorName,
          donor_phone: donorPhone || undefined,
          donor_email: donorEmail || undefined,
          amount: Number(amount),
          mode: paymentMethod === "cash" ? "cash" : "online",
          campaign_id: campaignId || undefined,
          is_anonymous: isAnonymous,
          note: note || undefined,
          status: paymentStatus,
        });

        setConfirmedDonation({
          receipt_number: res.receipt_number || `RCPT-${Math.floor(Math.random() * 90000) + 10000}`,
          donor_name: res.donor_name,
          amount: res.amount,
          payment_id: paymentMethod === "cash" ? "CASH_COLLECTED" : "UPI_QR_MANUAL",
        });
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to record donation.");
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    try {
      const order = await createOrderMutation.mutateAsync({
        donor_name: donorName,
        donor_phone: donorPhone || undefined,
        donor_email: donorEmail || undefined,
        amount: Number(amount),
        campaign_id: campaignId || undefined,
        is_anonymous: isAnonymous,
        note: note || undefined,
      });

      if (order.is_mock) {
        setMockOrderData(order);
      } else {
        triggerRealRazorpay(order);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initiate transaction.");
      setIsProcessing(false);
    }
  };

  const triggerRealRazorpay = (order: any) => {
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
          await handlePaymentSuccess(order.id, response.razorpay_payment_id, response.razorpay_signature);
        },
        prefill: {
          name: donorName,
          email: donorEmail || "",
          contact: donorPhone || "",
        },
        theme: {
          color: primaryColor,
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
    try {
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
                amount: Number(amount) * 100,
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
          amount: Number(amount),
          payment_id: paymentId,
        });
        setMockOrderData(null);
      } else {
        setErrorMsg("Webhook payment capture verification failed.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to confirm payment.");
    }
    setIsProcessing(false);
  };

  if (confirmedDonation) {
    return (
      <div className="text-center py-10 px-4 bg-green-50/50 border border-green-200/50 rounded-2xl flex flex-col items-center gap-6">
        <div className="w-16 h-16 bg-green-600/10 rounded-full flex items-center justify-center border border-green-500/20 text-green-600 animate-bounce">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-black text-green-800">Donation Successful!</h3>
          <p className="text-xs text-green-700 mt-2 max-w-sm">
            Thank you for your generous contribution. Seek blessings of the deity. Your contribution receipt has been generated.
          </p>
        </div>

        {/* Receipt details */}
        <div className="w-full bg-white border border-gray-150 p-6 rounded-2xl text-left space-y-3 font-mono text-xs text-zinc-600 shadow-sm">
          <div className="flex justify-between border-b border-zinc-100 pb-2">
            <span>Receipt Number:</span>
            <span className="font-bold text-zinc-900">{confirmedDonation.receipt_number}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-100 pb-2">
            <span>Donor Name:</span>
            <span className="font-bold text-zinc-900">{confirmedDonation.donor_name}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-100 pb-2">
            <span>Amount Contributed:</span>
            <span className="font-bold text-green-600 text-sm">₹{confirmedDonation.amount.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between pb-2">
            <span>Transaction ID:</span>
            <span className="font-bold text-zinc-900 truncate max-w-[150px]">{confirmedDonation.payment_id}</span>
          </div>
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
          >
            Print Receipt
          </button>
          <button
            onClick={() => {
              setConfirmedDonation(null);
              setDonorName("");
              setDonorPhone("");
              setDonorEmail("");
              setAmount("");
              setNote("");
              setIsAnonymous(false);
            }}
            className="flex-1 py-3 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
            style={{ backgroundColor: primaryColor }}
          >
            Donate Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {(createOrderMutation.isError || errorMsg) && (
          <div className="p-4 bg-red-50 border border-red-200/50 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="font-bold">{errorMsg || "An error occurred while placing donation. Please try again."}</p>
          </div>
        )}

        {/* Paid / Due Status Banner for Admins/Owners */}
        {allowedOffline && (
          <div className="bg-[#FAFAF8]/50 border border-[#E8E2D6] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#FF9500]/10 rounded-xl">
                <span className="material-symbols-outlined text-[#8c5000]">
                  {paymentMethod === "cash" ? "payments" : "qr_code_scanner"}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment Mode</p>
                <p className="text-xs font-black text-gray-900 uppercase">
                  {paymentMethod === "cash" ? "Cash Payment" : paymentMethod === "upi_qr" ? "Online Checkout (UPI QR)" : "Online (Razorpay)"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentStatus("confirmed")}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                  paymentStatus === "confirmed"
                    ? "bg-[#22C55E]/10 border-2 border-[#22C55E] text-[#22C55E]"
                    : "bg-white border border-[#E8E2D6] text-gray-500 hover:bg-gray-50"
                }`}
              >
                PAID
              </button>
              <button
                type="button"
                onClick={() => setPaymentStatus("pending")}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                  paymentStatus === "pending"
                    ? "bg-[#EAB308]/10 border-2 border-[#EAB308] text-[#EAB308]"
                    : "bg-white border border-[#E8E2D6] text-gray-500 hover:bg-gray-50"
                }`}
              >
                DUE
              </button>
            </div>
          </div>
        )}

        {/* Predefined Amounts Selection */}
        <div className="space-y-3">
          <label className="block text-[10px] font-extrabold text-[#554334] uppercase tracking-widest">
            Select Donation Amount
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {amounts.map((amt) => {
              const isSelected = amount === String(amt);
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(String(amt))}
                  className={`py-3 border rounded-xl font-bold text-xs uppercase tracking-wide transition-all ${
                    isSelected
                      ? "text-white shadow-sm"
                      : "bg-[#FAFAF8] border-[#E8E2D6] text-gray-700 hover:border-[#8c5000] hover:bg-[#F4F1EB]"
                  }`}
                  style={{
                    backgroundColor: isSelected ? primaryColor : undefined,
                    borderColor: isSelected ? primaryColor : undefined,
                  }}
                >
                  ₹{amt}
                </button>
              );
            })}
          </div>
          
          <div className="relative mt-3">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#554334] font-bold text-sm">₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter custom amount"
              className={`w-full pl-8 pr-4 py-3 bg-[#F4F1EB] border ${
                errors.amount ? "border-red-500" : "border-[#E8E2D6]"
              } rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#8c5000]`}
            />
          </div>
          {errors.amount && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.amount}</p>}
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-3">
          <label className="block text-[10px] font-extrabold text-[#554334] uppercase tracking-widest">
            Select Payment Method
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {hasRazorpay && (
              <button
                type="button"
                onClick={() => setPaymentMethod("razorpay")}
                className={`p-4 border rounded-2xl font-bold text-xs transition-all flex items-center justify-between ${
                  paymentMethod === "razorpay"
                    ? "bg-[#FAFAF8] text-[#8c5000]"
                    : "bg-[#FAFAF8] border-[#E8E2D6] text-gray-700 hover:border-[#8c5000]"
                }`}
                style={{
                  borderColor: paymentMethod === "razorpay" ? primaryColor : undefined,
                  borderWidth: paymentMethod === "razorpay" ? "2px" : "1px",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined" style={{ color: primaryColor }}>credit_card</span>
                  <div className="text-left">
                    <p className="font-extrabold">Online Checkout (Razorpay)</p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Cards, Netbanking, Wallet</p>
                  </div>
                </div>
                {paymentMethod === "razorpay" && (
                  <CheckCircle2 className="w-5 h-5" style={{ color: primaryColor }} />
                )}
              </button>
            )}

            {hasQRCode && (
              <button
                type="button"
                onClick={() => setPaymentMethod("upi_qr")}
                className={`p-4 border rounded-2xl font-bold text-xs transition-all flex items-center justify-between ${
                  paymentMethod === "upi_qr"
                    ? "bg-[#FAFAF8] text-[#8c5000]"
                    : "bg-[#FAFAF8] border-[#E8E2D6] text-gray-700 hover:border-[#8c5000]"
                }`}
                style={{
                  borderColor: paymentMethod === "upi_qr" ? primaryColor : undefined,
                  borderWidth: paymentMethod === "upi_qr" ? "2px" : "1px",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined" style={{ color: primaryColor }}>qr_code_scanner</span>
                  <div className="text-left">
                    <p className="font-extrabold">Online Checkout (UPI QR)</p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Scan & Pay using any UPI app</p>
                  </div>
                </div>
                {paymentMethod === "upi_qr" && (
                  <CheckCircle2 className="w-5 h-5" style={{ color: primaryColor }} />
                )}
              </button>
            )}

            {allowedOffline && (
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`p-4 border rounded-2xl font-bold text-xs transition-all flex items-center justify-between ${
                  paymentMethod === "cash"
                    ? "bg-[#FAFAF8] text-[#8c5000]"
                    : "bg-[#FAFAF8] border-[#E8E2D6] text-gray-700 hover:border-[#8c5000]"
                }`}
                style={{
                  borderColor: paymentMethod === "cash" ? primaryColor : undefined,
                  borderWidth: paymentMethod === "cash" ? "2px" : "1px",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined" style={{ color: primaryColor }}>payments</span>
                  <div className="text-left">
                    <p className="font-extrabold">Offline Cash</p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Record offline desk payment</p>
                  </div>
                </div>
                {paymentMethod === "cash" && (
                  <CheckCircle2 className="w-5 h-5" style={{ color: primaryColor }} />
                )}
              </button>
            )}
          </div>
        </div>

        {/* UPI QR Code Scanner display card */}
        {paymentMethod === "upi_qr" && logoUrl && (
          <div className="space-y-3">
            <label className="block text-[10px] font-extrabold text-[#554334] uppercase tracking-widest">
              Scan & Pay using UPI
            </label>
            <div className="bg-white border border-[#E8E2D6] rounded-2xl p-6 flex flex-col items-center gap-4 shadow-sm text-center">
              <div className="p-3 border-2 border-dashed rounded-2xl bg-white" style={{ borderColor: primaryColor }}>
                <img
                  src={logoUrl}
                  alt="UPI QR Code"
                  className="w-48 h-48 object-contain rounded-lg"
                />
              </div>
              <p className="text-xs font-semibold text-gray-700 max-w-xs leading-relaxed">
                Scan this QR code using GPay, PhonePe, Paytm, or any UPI app to complete payment.
              </p>
              <div className="flex gap-2 items-center justify-center py-2 px-4 bg-[#FAFAF8] rounded-full border border-[#E8E2D6]/60">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Accepted Apps</span>
                <span className="text-gray-300">•</span>
                <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">BHIM</span>
                <span className="text-gray-300">•</span>
                <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">GPAY</span>
                <span className="text-gray-300">•</span>
                <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">PHONEPE</span>
              </div>
            </div>
          </div>
        )}

        {/* Campaign Selector */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-extrabold text-[#554334] uppercase tracking-widest">
            Select Campaign (Optional)
          </label>
          <select
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            className="w-full px-4 py-3 bg-[#F4F1EB] border border-[#E8E2D6] rounded-xl text-xs font-bold text-[#554334] focus:outline-none focus:ring-1 focus:ring-[#8c5000]"
          >
            <option value="">General Donation</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Donor Details */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold text-[#554334] uppercase tracking-widest">
              Donor Full Name
            </label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="e.g. Rajesh Kumar"
              className={`w-full px-4 py-3 bg-[#F4F1EB] border ${
                errors.donorName ? "border-red-500" : "border-[#E8E2D6]"
              } rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#8c5000]`}
            />
            {errors.donorName && (
              <p className="text-[10px] text-red-500 font-bold mt-1">{errors.donorName}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-[#554334] uppercase tracking-widest">
                Mobile Number (Optional)
              </label>
              <input
                type="text"
                value={donorPhone}
                onChange={(e) => setDonorPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className={`w-full px-4 py-3 bg-[#F4F1EB] border ${
                  errors.donorPhone ? "border-red-500" : "border-[#E8E2D6]"
                } rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#8c5000]`}
              />
              {errors.donorPhone && (
                <p className="text-[10px] text-red-500 font-bold mt-1">{errors.donorPhone}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-[#554334] uppercase tracking-widest">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                placeholder="e.g. rajesh@example.com"
                className={`w-full px-4 py-3 bg-[#F4F1EB] border ${
                  errors.donorEmail ? "border-red-500" : "border-[#E8E2D6]"
                } rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#8c5000]`}
              />
              {errors.donorEmail && (
                <p className="text-[10px] text-red-500 font-bold mt-1">{errors.donorEmail}</p>
              )}
            </div>
          </div>
        </div>

        {/* Special Note */}
        <div className="space-y-1">
          <label className="block text-[10px] font-extrabold text-[#554334] uppercase tracking-widest">
            Special Note or Instructions
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. In memory of... / Family name / specific puja slot"
            rows={2}
            className="w-full px-4 py-3 bg-[#F4F1EB] border border-[#E8E2D6] rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#8c5000]"
          />
        </div>

        {/* Anonymous Checkbox */}
        <div className="flex items-center justify-between p-4 bg-[#F4F1EB]/50 rounded-xl border border-[#E8E2D6]/40">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#8c5000] text-xl">visibility_off</span>
            <div>
              <p className="text-xs font-bold text-gray-950 leading-none">Donate Anonymously</p>
              <p className="text-[10px] text-gray-400 font-semibold mt-1">Hide your name from the public leaderboard</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="isAnonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#E8E2D6] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8c5000]"></div>
          </label>
        </div>

        {/* Razorpay Trust block */}
        <div className="p-4 rounded-xl border border-[#E8E2D6] flex items-center justify-between bg-white shadow-xs">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#22C55E] text-sm">verified_user</span>
            <span className="text-[10px] font-bold text-[#554334] uppercase tracking-wider">Secured by Razorpay</span>
          </div>
          <div className="flex gap-2 opacity-60 grayscale shrink-0">
            <img
              className="h-3.5"
              alt="Visa"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYhXEWDXq4nzrQg1eMckEdQfSH3mMBdvWodOo0VtGJiIWeGKIx24LlBts4qR6oTu5v3LZjIgwfm9EbEvfL3uFVYZp6Nzw_fCJ-I_1LxFy9mXUbzaBDP6OxF82oLH7La-KrolOUxioIjBVil9qH0e8JA2PgYONm92FuZufvvf2BL-7VZJyFTRRUGoPQYXqZKxZgv0TUiFbMiHxmae8cRV8xTm_WzWmuKcxhAp4hz7E8Z5wVvT4vAPPw"
            />
            <img
              className="h-3.5"
              alt="Mastercard"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-DwIMH8rHHbvk3lpOAoiriSKHBQIrQpV9rkuvxey1CHQzQn_MsKJN4DQA2GRzitDZqDM7v1tzYaLCUlicFgZT2cEbticAvMPM9kOrhRE72bJpQhjDAi4vjhgZJkG__R3494bVknB4zJmcOY6Raibu19-4OXUy7t47Jeq3MEQJmC83bD_rw4YYGg4QAu6YcLiPJae0vNdeaogHqJDiFmVukbUh2rk0x4AyfMkZVB_D6gOBXoNN8gFg"
            />
            <img
              className="h-3.5"
              alt="UPI"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQ07ml-9fZ-65N_BjzsY3Qei9nSwjTSzBuydbQEPi82jrncr6BcIHcYe_vxlXybxWp7pOubBLLVG1zVfsFvr1T9xcsqNxhvwwTpxhkUH4G34FoxGXns5UH_et4bYepPhcVZB_yOvMTWSzgmzW_vyrd9wNAY1bX-tEGjOxiu4SLzwmzVmxdDE_YON6ERqRwsdvaQrIVe4hVGDXuK98CQ_7zhmlYkgzvWyX0yaNwW2ItGNwvi_OPvU_4"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full text-white py-4 rounded-xl text-xs font-black uppercase tracking-wider hover:opacity-95 transition-all flex items-center justify-center gap-2 saffron-glow"
          style={{
            backgroundColor: primaryColor,
          }}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Initiating Transaction...</span>
            </>
          ) : (
            <>
              <Heart className="w-4 h-4 fill-white" />
              <span>Proceed to Secure Payment</span>
            </>
          )}
        </button>

        <p className="text-center text-[10px] text-[#554334] font-semibold leading-relaxed">
          By clicking, you agree to our{" "}
          <a className="underline hover:text-[#8c5000]" href="#">Terms of Service</a> and{" "}
          <a className="underline hover:text-[#8c5000]" href="#">Tax Exemption Policy (80G)</a>.
        </p>
      </form>

      {/* Sandbox Simulator Modal */}
      {mockOrderData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-amber-500/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-500 mx-auto animate-pulse">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-900 font-serif">Sandbox Payment Gateway</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                This Mandal is running in local developer mode. Click below to simulate Razorpay payment success and webhook delivery.
              </p>
            </div>

            <div className="bg-neutral-50 border border-gray-200 p-4 rounded-xl text-left font-mono text-[10px] text-gray-600 space-y-1.5">
              <div>ORDER ID: {mockOrderData.id}</div>
              <div>AMOUNT: ₹{(mockOrderData.amount / 100).toLocaleString("en-IN")}</div>
              <div>KEY ID: {mockOrderData.key_id}</div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setMockOrderData(null);
                  setIsProcessing(false);
                }}
                className="flex-1 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold rounded-xl text-xs transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSimulateMockPayment}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
