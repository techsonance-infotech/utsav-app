"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";
    
    if (!form.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (form.phone.trim() && !/^\d{10}$/.test(form.phone.trim())) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    if (!form.message.trim()) {
      newErrors.message = "Message cannot be empty";
    } else if (form.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("submitting");

    // Simulate submission
    setTimeout(() => {
      setStatus("success");
      setForm({ name: "", email: "", phone: "", message: "" });
    }, 1200);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === "success" && (
        <div className="p-4 bg-green-50 border border-green-200/50 rounded-xl text-green-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <div>
            <p className="font-bold">Message sent successfully!</p>
            <p className="mt-0.5">We will get back to you as soon as possible.</p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="p-4 bg-red-50 border border-red-200/50 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="font-bold">Failed to send message. Please try again.</p>
        </div>
      )}

      <div>
        <label className="block text-xxs font-black text-gray-400 uppercase tracking-wider mb-1">
          Full Name
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Rajesh Kumar"
          className={`w-full px-4 py-3 border ${
            errors.name ? "border-red-500" : "border-gray-200"
          } rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white`}
        />
        {errors.name && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xxs font-black text-gray-400 uppercase tracking-wider mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="e.g. rajesh@example.com"
            className={`w-full px-4 py-3 border ${
              errors.email ? "border-red-500" : "border-gray-200"
            } rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white`}
          />
          {errors.email && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-xxs font-black text-gray-400 uppercase tracking-wider mb-1">
            Mobile Number (Optional)
          </label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="e.g. 9876543210"
            className={`w-full px-4 py-3 border ${
              errors.phone ? "border-red-500" : "border-gray-200"
            } rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white`}
          />
          {errors.phone && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xxs font-black text-gray-400 uppercase tracking-wider mb-1">
          Your Message
        </label>
        <textarea
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Write your message or inquiry here..."
          className={`w-full px-4 py-3 border ${
            errors.message ? "border-red-500" : "border-gray-200"
          } rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white`}
        />
        {errors.message && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.message}</p>}
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-xl text-sm font-bold shadow-md shadow-orange-500/15 transition-all flex items-center justify-center gap-2"
      >
        {status === "submitting" ? (
          "Sending message..."
        ) : (
          <>
            Send Message <Send className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
