import React from "react";

export interface VendorCardProps {
  name: string;
  category?: string | null;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  gstNumber?: string | null;
  paymentTerms?: string | null;
  status: "active" | "inactive";
  onEdit?: () => void;
}

export const VendorCard: React.FC<VendorCardProps> = ({
  name,
  category,
  contactPerson,
  phone,
  email,
  gstNumber,
  paymentTerms,
  status,
  onEdit,
}) => {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-base font-semibold text-gray-900">{name}</h4>
          {category && <span className="text-xs text-orange-600 font-medium">{category}</span>}
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-xxs font-medium ${
            status === "active" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs border-t border-gray-50 pt-4">
        {contactPerson && (
          <div>
            <span className="text-gray-400 block mb-0.5">Contact</span>
            <span className="text-gray-700 font-medium">{contactPerson}</span>
          </div>
        )}
        {phone && (
          <div>
            <span className="text-gray-400 block mb-0.5">Phone</span>
            <span className="text-gray-700 font-medium">{phone}</span>
          </div>
        )}
        {email && (
          <div className="col-span-2">
            <span className="text-gray-400 block mb-0.5">Email</span>
            <span className="text-gray-700 font-medium break-all">{email}</span>
          </div>
        )}
        {gstNumber && (
          <div>
            <span className="text-gray-400 block mb-0.5">GST Number</span>
            <span className="text-gray-700 font-medium">{gstNumber}</span>
          </div>
        )}
        {paymentTerms && (
          <div>
            <span className="text-gray-400 block mb-0.5">Payment Terms</span>
            <span className="text-gray-700 font-medium">{paymentTerms}</span>
          </div>
        )}
      </div>

      {onEdit && (
        <button
          onClick={onEdit}
          className="mt-2 w-full text-center py-2 border border-gray-200 hover:border-orange-500 hover:text-orange-600 text-xs font-semibold rounded-lg text-gray-600 transition-colors"
        >
          Edit Profile
        </button>
      )}
    </div>
  );
};
