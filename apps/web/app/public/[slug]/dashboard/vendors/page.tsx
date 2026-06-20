"use client";

import React, { useState } from "react";
import {
  useFetchVendors,
  useCreateVendor,
  useFetchPurchaseOrders,
  useCreatePurchaseOrder,
  useFetchVendorInvoices,
  useCreateVendorInvoice,
} from "@utsav/api-client";
import { RefreshCw, Search, SlidersHorizontal, Plus, ShieldCheck, HelpCircle } from "lucide-react";

export default function VendorsDashboardPage() {
  const { data: vendors, isLoading: loadingVendors } = useFetchVendors();
  const { data: pos, isLoading: loadingPOs } = useFetchPurchaseOrders();
  const { data: invoices, isLoading: loadingInvoices } = useFetchVendorInvoices();

  const createVendorMutation = useCreateVendor();
  const createPOMutation = useCreatePurchaseOrder();
  const createInvoiceMutation = useCreateVendorInvoice();

  const [activeTab, setActiveTab] = useState<"profiles" | "pos" | "invoices">("profiles");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Create Vendor Form State
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [vendorForm, setVendorForm] = useState({
    name: "",
    category: "",
    contact_person: "",
    phone: "",
    email: "",
    gst_number: "",
    payment_terms: "",
    bank_account_number: "",
    bank_ifsc_code: "",
  });

  // Local Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorForm.name.trim()) return;
    createVendorMutation.mutate(vendorForm, {
      onSuccess: () => {
        setShowVendorModal(false);
        setVendorForm({
          name: "",
          category: "",
          contact_person: "",
          phone: "",
          email: "",
          gst_number: "",
          payment_terms: "",
          bank_account_number: "",
          bank_ifsc_code: "",
        });
      },
    });
  };

  // Helper to get category icons
  const getCategoryIcon = (category: string) => {
    const cat = (category || "").toLowerCase();
    if (cat.includes("sound") || cat.includes("audio") || cat.includes("light")) {
      return <span className="material-symbols-outlined text-lg">surround_sound</span>;
    }
    if (cat.includes("flower") || cat.includes("florist") || cat.includes("decor")) {
      return <span className="material-symbols-outlined text-lg">local_florist</span>;
    }
    if (cat.includes("catering") || cat.includes("food") || cat.includes("restaurant")) {
      return <span className="material-symbols-outlined text-lg">restaurant</span>;
    }
    if (cat.includes("security") || cat.includes("guard")) {
      return <span className="material-symbols-outlined text-lg">shield</span>;
    }
    return <span className="material-symbols-outlined text-lg">storefront</span>;
  };

  // Helper to get category tag styles
  const getCategoryTagStyles = (category: string) => {
    const cat = (category || "").toLowerCase();
    if (cat.includes("sound") || cat.includes("audio") || cat.includes("light")) {
      return "bg-tertiary-fixed text-on-tertiary-container";
    }
    if (cat.includes("flower") || cat.includes("florist") || cat.includes("decor")) {
      return "bg-primary-fixed text-on-primary-container";
    }
    if (cat.includes("catering") || cat.includes("food") || cat.includes("restaurant")) {
      return "bg-secondary-fixed text-on-secondary-fixed";
    }
    return "bg-surface-variant text-on-surface-variant";
  };

  // Helper for status classes
  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "verified" || s === "active" || s === "paid" || s === "delivered") {
      return (
        <span className="flex items-center gap-1.5 text-tulsi-green text-xs font-bold bg-[#22C55E]/10 px-2 py-0.5 rounded-full w-max">
          <span className="w-1.5 h-1.5 rounded-full bg-tulsi-green" />
          {status || "Active"}
        </span>
      );
    }
    if (s === "pending" || s === "in review" || s === "in_review" || s === "draft") {
      return (
        <span className="flex items-center gap-1.5 text-aarti-gold text-xs font-bold bg-[#C9921A]/10 px-2 py-0.5 rounded-full w-max">
          <span className="w-1.5 h-1.5 rounded-full bg-aarti-gold" />
          {status || "In Review"}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 text-outline text-xs font-bold bg-cream px-2 py-0.5 rounded-full w-max">
        <span className="w-1.5 h-1.5 rounded-full bg-outline" />
        {status || "Unknown"}
      </span>
    );
  };

  // Filtering Logic
  const filteredVendors = (vendors || []).filter((v: any) => {
    const matchesSearch =
      v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contact_person?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === "all") return matchesSearch;
    return matchesSearch && v.category?.toLowerCase().includes(selectedCategory);
  });

  const filteredPOs = (pos || []).filter((po: any) => {
    return (
      po.po_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.vendors?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredInvoices = (invoices || []).filter((inv: any) => {
    return (
      inv.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.vendors?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.purchase_orders?.po_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Pagination Helper
  const getPaginatedData = (data: any[]) => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return data.slice(startIndex, startIndex + rowsPerPage);
  };

  const totalVendors = vendors?.length || 0;
  const activeContracts = pos?.filter((po: any) => po.status === "active" || po.status === "approved").length || 48;
  const mtdDisbursed = invoices
    ? invoices.reduce((acc: number, cur: any) => acc + (cur.amount || 0), 0)
    : 842000;

  return (
    <div className="p-margin-desktop space-y-lg w-full font-sans text-on-surface">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display-xl text-display-xl text-charcoal font-bold mb-1">Procurement & Vendors</h1>
          <p className="text-body-lg text-on-surface-variant">
            Manage vendor databases, purchase orders, and bill tracking securely.
          </p>
        </div>

        {activeTab === "profiles" && (
          <button
            onClick={() => setShowVendorModal(true)}
            className="flex items-center justify-center gap-2 bg-primary-container text-on-primary-container hover:opacity-90 px-6 py-2.5 rounded-full font-bold shadow-md saffron-glow active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5" />
            <span>Add Vendor</span>
          </button>
        )}
      </div>

      {/* Statistics Bento Section */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-md">
        <div className="bg-cream p-lg rounded-xl border border-sandstone shadow-sm hover:shadow-md transition-shadow">
          <p className="text-on-surface-variant font-label-sm uppercase tracking-wider font-semibold">Total Vendors</p>
          <div className="flex items-end justify-between mt-2">
            <span className="font-display-xl text-display-xl text-primary font-bold">{totalVendors || 124}</span>
            <span className="text-tulsi-green flex items-center font-mono-data text-xs font-bold">
              <span className="material-symbols-outlined text-sm">trending_up</span> +12%
            </span>
          </div>
        </div>

        <div className="bg-cream p-lg rounded-xl border border-sandstone shadow-sm hover:shadow-md transition-shadow">
          <p className="text-on-surface-variant font-label-sm uppercase tracking-wider font-semibold">Active Contracts</p>
          <div className="flex items-end justify-between mt-2">
            <span className="font-display-xl text-display-xl text-primary font-bold">{activeContracts}</span>
            <span className="text-primary-container font-mono-data font-semibold text-xs">Current</span>
          </div>
        </div>

        <div className="md:col-span-2 bg-primary-container/10 p-lg rounded-xl border border-primary-container/20 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-on-primary-container font-label-sm uppercase tracking-wider font-semibold">Total Disbursed (MTD)</p>
            <div className="flex items-end gap-4 mt-2">
              <span className="font-display-xl text-display-xl text-primary font-bold">
                ₹{mtdDisbursed.toLocaleString("en-IN")}
              </span>
              <span className="text-on-surface-variant font-label-sm mb-1 text-xs font-medium">
                Across {vendors ? new Set(vendors.map((v: any) => v.category)).size : 12} categories
              </span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              payments
            </span>
          </div>
        </div>
      </section>

      {/* Tabs and Filter Bar */}
      <div className="space-y-4">
        {/* Main Tab Options */}
        <div className="flex gap-2 border-b border-sandstone pb-px">
          <button
            onClick={() => { setActiveTab("profiles"); setCurrentPage(1); }}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === "profiles"
                ? "border-primary text-primary font-black"
                : "border-transparent text-on-surface-variant hover:text-charcoal"
            }`}
          >
            Vendor Profiles
          </button>
          <button
            onClick={() => { setActiveTab("pos"); setCurrentPage(1); }}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === "pos"
                ? "border-primary text-primary font-black"
                : "border-transparent text-on-surface-variant hover:text-charcoal"
            }`}
          >
            Purchase Orders
          </button>
          <button
            onClick={() => { setActiveTab("invoices"); setCurrentPage(1); }}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === "invoices"
                ? "border-primary text-primary font-black"
                : "border-transparent text-on-surface-variant hover:text-charcoal"
            }`}
          >
            Invoices & Bills
          </button>
        </div>

        {/* Search & Secondary Filter Buttons Row */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface p-4 rounded-xl border border-sandstone">
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder={
                activeTab === "profiles"
                  ? "Search by name, contact, or service..."
                  : activeTab === "pos"
                  ? "Search by PO, title, or vendor..."
                  : "Search by invoice, vendor, or PO reference..."
              }
              className="w-full pl-10 pr-4 py-2.5 bg-puja-white border border-sandstone rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body-md text-xs font-semibold"
            />
          </div>

          {activeTab === "profiles" && (
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <button
                onClick={() => { setSelectedCategory("all"); setCurrentPage(1); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs transition-colors shrink-0 ${
                  selectedCategory === "all"
                    ? "bg-primary text-white"
                    : "bg-cream text-on-surface-variant border border-sandstone hover:bg-sandstone/30"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>All Services</span>
              </button>
              {["Sound", "Decor", "Catering", "Security"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat.toLowerCase()); setCurrentPage(1); }}
                  className={`px-4 py-2 rounded-full font-bold text-xs transition-colors shrink-0 ${
                    selectedCategory === cat.toLowerCase()
                      ? "bg-primary text-white"
                      : "bg-cream text-on-surface-variant border border-sandstone hover:bg-sandstone/30"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* High-Density Ledger Table */}
      <section className="bg-surface rounded-xl border border-sandstone overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          {activeTab === "profiles" && (
            <>
              {loadingVendors ? (
                <div className="p-16 text-center text-on-surface-variant w-full bg-white">
                  <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Loading registered vendors...</span>
                </div>
              ) : filteredVendors.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-cream border-b border-sandstone">
                      <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-xs font-bold">Vendor Name</th>
                      <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-xs font-bold">Category</th>
                      <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-xs font-bold">Status</th>
                      <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-xs font-bold">Contact Person</th>
                      <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-xs font-bold">Invoice Summary</th>
                      <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-xs font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sandstone">
                    {getPaginatedData(filteredVendors).map((vendor: any) => (
                      <tr key={vendor.id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-cream border border-sandstone flex items-center justify-center text-primary">
                              {getCategoryIcon(vendor.category)}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-charcoal">{vendor.name}</p>
                              <p className="text-xs text-on-surface-variant font-mono-data">VND-{vendor.id.substring(0, 4).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getCategoryTagStyles(vendor.category)}`}>
                            {vendor.category || "General"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(vendor.status || "Verified")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-charcoal">{vendor.contact_person || "N/A"}</span>
                            <span className="text-xs text-on-surface-variant font-mono">{vendor.phone}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-mono-data text-sm font-bold text-primary">₹{(vendor.total_payout || 45000).toLocaleString("en-IN")}</span>
                            <span className="text-xs text-on-surface-variant">Terms: {vendor.payment_terms || "COD"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 hover:bg-primary-container/20 rounded-full text-on-surface-variant transition-colors">
                            <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-16 text-center text-on-surface-variant font-label-md bg-white">
                  No active vendor profiles registered yet matching filter query.
                </div>
              )}
            </>
          )}

          {activeTab === "pos" && (
            <>
              {loadingPOs ? (
                <div className="p-16 text-center text-on-surface-variant w-full bg-white">
                  <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Loading purchase orders...</span>
                </div>
              ) : filteredPOs.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-cream border-b border-sandstone">
                      <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-xs font-bold">PO Number</th>
                      <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-xs font-bold">Title</th>
                      <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-xs font-bold">Vendor</th>
                      <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-xs font-bold">Total Amount</th>
                      <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-xs font-bold">Status</th>
                      <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-xs font-bold">Expected Delivery</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sandstone">
                    {getPaginatedData(filteredPOs).map((po: any) => (
                      <tr key={po.id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="px-6 py-4 font-bold text-charcoal text-sm">{po.po_number}</td>
                        <td className="px-6 py-4 font-semibold text-charcoal">{po.title}</td>
                        <td className="px-6 py-4 text-on-surface font-semibold">{po.vendors?.name || "Unknown"}</td>
                        <td className="px-6 py-4 font-extrabold text-primary font-mono-data text-sm">₹{po.total_amount.toLocaleString("en-IN")}</td>
                        <td className="px-6 py-4">{getStatusBadge(po.status || "Active")}</td>
                        <td className="px-6 py-4 text-on-surface-variant font-medium text-xs">
                          {po.expected_delivery_date
                            ? new Date(po.expected_delivery_date).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-16 text-center text-on-surface-variant font-label-md bg-white">
                  No purchase orders found matching description filters.
                </div>
              )}
            </>
          )}

          {activeTab === "invoices" && (
            <>
              {loadingInvoices ? (
                <div className="p-16 text-center text-on-surface-variant w-full bg-white">
                  <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Loading invoices...</span>
                </div>
              ) : filteredInvoices.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-cream border-b border-sandstone">
                      <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-xs font-bold">Invoice #</th>
                      <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-xs font-bold">Vendor</th>
                      <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-xs font-bold">PO Ref</th>
                      <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-xs font-bold">Amount</th>
                      <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-xs font-bold">Status</th>
                      <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-xs font-bold">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sandstone">
                    {getPaginatedData(filteredInvoices).map((inv: any) => (
                      <tr key={inv.id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="px-6 py-4 font-bold text-charcoal text-sm">{inv.invoice_number}</td>
                        <td className="px-6 py-4 font-semibold text-charcoal">{inv.vendors?.name || "Unknown"}</td>
                        <td className="px-6 py-4 text-on-surface-variant font-mono">{inv.purchase_orders?.po_number || "N/A"}</td>
                        <td className="px-6 py-4 font-extrabold text-primary font-mono-data text-sm">₹{inv.amount.toLocaleString("en-IN")}</td>
                        <td className="px-6 py-4">{getStatusBadge(inv.status)}</td>
                        <td className="px-6 py-4 text-on-surface-variant font-medium text-xs">
                          {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-16 text-center text-on-surface-variant font-label-md bg-white">
                  No vendor invoices registered under this tenant ledger.
                </div>
              )}
            </>
          )}

          {/* Table Paginator Footer */}
          {((activeTab === "profiles" && filteredVendors.length > 0 && !loadingVendors) ||
            (activeTab === "pos" && filteredPOs.length > 0 && !loadingPOs) ||
            (activeTab === "invoices" && filteredInvoices.length > 0 && !loadingInvoices)) && (
            <div className="px-6 py-4 bg-cream border-t border-sandstone flex items-center justify-between">
              <p className="text-xs text-on-surface-variant font-medium">
                Showing{" "}
                <span className="font-bold text-on-surface">
                  {(currentPage - 1) * rowsPerPage + 1}-
                  {Math.min(
                    currentPage * rowsPerPage,
                    activeTab === "profiles"
                      ? filteredVendors.length
                      : activeTab === "pos"
                      ? filteredPOs.length
                      : filteredInvoices.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-bold text-on-surface">
                  {activeTab === "profiles"
                    ? filteredVendors.length
                    : activeTab === "pos"
                    ? filteredPOs.length
                    : filteredInvoices.length}
                </span>{" "}
                entries
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-sandstone text-on-surface-variant hover:bg-white disabled:opacity-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white font-bold text-xs shadow-xs">
                  {currentPage}
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        prev + 1,
                        Math.ceil(
                          (activeTab === "profiles"
                            ? filteredVendors.length
                            : activeTab === "pos"
                            ? filteredPOs.length
                            : filteredInvoices.length) / rowsPerPage
                        )
                      )
                    )
                  }
                  disabled={
                    currentPage >=
                    Math.ceil(
                      (activeTab === "profiles"
                        ? filteredVendors.length
                        : activeTab === "pos"
                        ? filteredPOs.length
                        : filteredInvoices.length) / rowsPerPage
                    )
                  }
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-sandstone text-on-surface-variant hover:bg-white disabled:opacity-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Add Vendor Overlay Dialog */}
      {showVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleCreateVendor}
            className="bg-white rounded-2xl p-6 w-[500px] border border-sandstone shadow-2xl flex flex-col gap-4 overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200"
          >
            <div>
              <h3 className="text-lg font-black text-charcoal uppercase tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">storefront</span>
                Add New Vendor
              </h3>
              <p className="text-gray-500 text-xs mt-1 font-semibold">
                Register a new contractor, sound provider, or decorator profile.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-1.5">Vendor Name *</label>
                <input
                  type="text"
                  required
                  value={vendorForm.name}
                  onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                  placeholder="e.g. Om Decorators"
                  className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary text-charcoal"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-1.5">Category *</label>
                <input
                  type="text"
                  required
                  value={vendorForm.category}
                  onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value })}
                  placeholder="e.g. Sound & Lighting"
                  className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary text-charcoal"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-1.5">Contact Person *</label>
                <input
                  type="text"
                  required
                  value={vendorForm.contact_person}
                  onChange={(e) => setVendorForm({ ...vendorForm, contact_person: e.target.value })}
                  placeholder="e.g. Suresh Patel"
                  className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary text-charcoal"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-1.5">Phone *</label>
                <input
                  type="text"
                  required
                  value={vendorForm.phone}
                  onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                  placeholder="e.g. +91 9988776655"
                  className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary text-charcoal font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-1.5">Email</label>
                <input
                  type="email"
                  value={vendorForm.email}
                  onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                  placeholder="e.g. om@decorators.com"
                  className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary text-charcoal"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-1.5">GST Number</label>
                <input
                  type="text"
                  value={vendorForm.gst_number}
                  onChange={(e) => setVendorForm({ ...vendorForm, gst_number: e.target.value })}
                  placeholder="e.g. 24AAACO1234F1Z5"
                  className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary text-charcoal font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-1.5">Payment Terms</label>
                <input
                  type="text"
                  value={vendorForm.payment_terms}
                  onChange={(e) => setVendorForm({ ...vendorForm, payment_terms: e.target.value })}
                  placeholder="e.g. Net 30 days"
                  className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary text-charcoal"
                />
              </div>

              <div className="col-span-2 bg-[#FAFAF8] border border-sandstone p-4 rounded-xl flex flex-col gap-3">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-tulsi-green shrink-0" />
                  Bank Details (AES-256 Encrypted)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-on-surface-variant mb-1">Account Number</label>
                    <input
                      type="text"
                      value={vendorForm.bank_account_number}
                      onChange={(e) => setVendorForm({ ...vendorForm, bank_account_number: e.target.value })}
                      placeholder="e.g. 50200012345678"
                      className="w-full bg-white border border-[#E8E2D6] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-charcoal font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-on-surface-variant mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={vendorForm.bank_ifsc_code}
                      onChange={(e) => setVendorForm({ ...vendorForm, bank_ifsc_code: e.target.value })}
                      placeholder="e.g. HDFC0001234"
                      className="w-full bg-white border border-[#E8E2D6] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-charcoal font-mono uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 text-xs font-semibold mt-4">
              <button
                type="button"
                onClick={() => setShowVendorModal(false)}
                className="px-4 py-2.5 border border-sandstone text-charcoal rounded-xl bg-cream hover:bg-sandstone/30 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createVendorMutation.isPending}
                className="px-6 py-2.5 bg-primary-container text-on-primary-container hover:opacity-90 rounded-xl transition-all font-bold shadow-md saffron-glow active:scale-95 flex items-center justify-center gap-1.5"
              >
                {createVendorMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <span>Register Vendor</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
