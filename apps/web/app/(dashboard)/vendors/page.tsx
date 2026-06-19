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
import { VendorCard, POStatusBadge } from "@utsav/ui";

export default function VendorsDashboardPage() {
  const { data: vendors, isLoading: loadingVendors } = useFetchVendors();
  const { data: pos, isLoading: loadingPOs } = useFetchPurchaseOrders();
  const { data: invoices, isLoading: loadingInvoices } = useFetchVendorInvoices();

  const createVendorMutation = useCreateVendor();
  const createPOMutation = useCreatePurchaseOrder();
  const createInvoiceMutation = useCreateVendorInvoice();

  const [activeTab, setActiveTab] = useState<"profiles" | "pos" | "invoices">("profiles");

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Procurement & Vendors</h1>
          <p className="text-xs text-gray-400 mt-1">Manage vendor databases, purchase orders, and bill tracking securely.</p>
        </div>

        {activeTab === "profiles" && (
          <button
            onClick={() => setShowVendorModal(true)}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            ＋ Add Vendor
          </button>
        )}
      </div>

      {/* Tabs bar */}
      <div className="flex gap-2 border-b border-gray-100 pb-px">
        <button
          onClick={() => setActiveTab("profiles")}
          className={`pb-3 px-2 text-xs font-bold border-b-2 transition-all ${
            activeTab === "profiles"
              ? "border-orange-500 text-orange-600 font-black"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Vendor Profiles
        </button>
        <button
          onClick={() => setActiveTab("pos")}
          className={`pb-3 px-2 text-xs font-bold border-b-2 transition-all ${
            activeTab === "pos"
              ? "border-orange-500 text-orange-600 font-black"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Purchase Orders
        </button>
        <button
          onClick={() => setActiveTab("invoices")}
          className={`pb-3 px-2 text-xs font-bold border-b-2 transition-all ${
            activeTab === "invoices"
              ? "border-orange-500 text-orange-600 font-black"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Invoices & Bills
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "profiles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingVendors ? (
            <p className="text-xs text-gray-400">Loading vendors...</p>
          ) : vendors && vendors.length > 0 ? (
            vendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                name={vendor.name}
                category={vendor.category}
                contactPerson={vendor.contact_person}
                phone={vendor.phone}
                email={vendor.email}
                gstNumber={vendor.gst_number}
                paymentTerms={vendor.payment_terms}
                status={vendor.status}
              />
            ))
          ) : (
            <p className="text-xs text-gray-400 col-span-3">No active vendor profiles registered yet.</p>
          )}
        </div>
      )}

      {activeTab === "pos" && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-400 uppercase font-semibold border-b border-gray-100">
                <th className="p-4">PO Number</th>
                <th className="p-4">Title</th>
                <th className="p-4">Vendor</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Delivery Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {loadingPOs ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-400">Loading POs...</td>
                </tr>
              ) : pos && pos.length > 0 ? (
                pos.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-bold text-gray-900">{po.po_number}</td>
                    <td className="p-4">{po.title}</td>
                    <td className="p-4">{po.vendors?.name || "Unknown"}</td>
                    <td className="p-4 font-extrabold text-orange-600">₹{po.total_amount.toLocaleString("en-IN")}</td>
                    <td className="p-4">
                      <POStatusBadge status={po.status} />
                    </td>
                    <td className="p-4 text-gray-400">
                      {po.expected_delivery_date
                        ? new Date(po.expected_delivery_date).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-400">No purchase orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "invoices" && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-400 uppercase font-semibold border-b border-gray-100">
                <th className="p-4">Invoice #</th>
                <th className="p-4">Vendor</th>
                <th className="p-4">PO Ref</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {loadingInvoices ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-400">Loading invoices...</td>
                </tr>
              ) : invoices && invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-bold text-gray-900">{inv.invoice_number}</td>
                    <td className="p-4">{inv.vendors?.name || "Unknown"}</td>
                    <td className="p-4 text-gray-400">{inv.purchase_orders?.po_number || "N/A"}</td>
                    <td className="p-4 font-extrabold text-orange-600">₹{inv.amount.toLocaleString("en-IN")}</td>
                    <td className="p-4">
                      <POStatusBadge status={inv.status} />
                    </td>
                    <td className="p-4 text-gray-400">
                      {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-400">No vendor invoices registered.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Vendor Modal */}
      {showVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-xs">
          <form
            onSubmit={handleCreateVendor}
            className="bg-white rounded-2xl p-6 w-[500px] border border-gray-100 shadow-xl flex flex-col gap-4 overflow-y-auto max-h-[90vh]"
          >
            <h3 className="text-base font-bold text-gray-900">Add New Vendor</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xxs font-semibold text-gray-400 uppercase mb-1">Vendor Name</label>
                <input
                  type="text"
                  required
                  value={vendorForm.name}
                  onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                  placeholder="e.g. Om Decorators"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xxs font-semibold text-gray-400 uppercase mb-1">Category</label>
                <input
                  type="text"
                  value={vendorForm.category}
                  onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value })}
                  placeholder="e.g. Tent & Catering"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xxs font-semibold text-gray-400 uppercase mb-1">Contact Person</label>
                <input
                  type="text"
                  value={vendorForm.contact_person}
                  onChange={(e) => setVendorForm({ ...vendorForm, contact_person: e.target.value })}
                  placeholder="e.g. Suresh Patel"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xxs font-semibold text-gray-400 uppercase mb-1">Phone</label>
                <input
                  type="text"
                  value={vendorForm.phone}
                  onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                  placeholder="e.g. +91 9988776655"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xxs font-semibold text-gray-400 uppercase mb-1">Email</label>
                <input
                  type="email"
                  value={vendorForm.email}
                  onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                  placeholder="e.g. om@decorators.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xxs font-semibold text-gray-400 uppercase mb-1">GST Number</label>
                <input
                  type="text"
                  value={vendorForm.gst_number}
                  onChange={(e) => setVendorForm({ ...vendorForm, gst_number: e.target.value })}
                  placeholder="e.g. 24AAACO1234F1Z5"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xxs font-semibold text-gray-400 uppercase mb-1">Payment Terms</label>
                <input
                  type="text"
                  value={vendorForm.payment_terms}
                  onChange={(e) => setVendorForm({ ...vendorForm, payment_terms: e.target.value })}
                  placeholder="e.g. Net 30 days"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="col-span-2 bg-red-50/50 p-4 rounded-xl border border-red-100 flex flex-col gap-3">
                <span className="text-xxs font-black text-red-700 uppercase tracking-widest">🔐 Bank Details (AES-256 Encrypted)</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xxs font-semibold text-gray-400 uppercase mb-1">Account Number</label>
                    <input
                      type="text"
                      value={vendorForm.bank_account_number}
                      onChange={(e) => setVendorForm({ ...vendorForm, bank_account_number: e.target.value })}
                      placeholder="e.g. 50200012345678"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-semibold text-gray-400 uppercase mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={vendorForm.bank_ifsc_code}
                      onChange={(e) => setVendorForm({ ...vendorForm, bank_ifsc_code: e.target.value })}
                      placeholder="e.g. HDFC0001234"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-semibold mt-4">
              <button
                type="button"
                onClick={() => setShowVendorModal(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
              >
                Register Vendor
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
