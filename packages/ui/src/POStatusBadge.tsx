import React from "react";

export interface POStatusBadgeProps {
  status: "draft" | "sent" | "accepted" | "rejected" | "completed" | "pending" | "approved" | "paid";
}

export const POStatusBadge: React.FC<POStatusBadgeProps> = ({ status }) => {
  let classes = "bg-gray-100 text-gray-800";

  switch (status) {
    case "draft":
      classes = "bg-gray-100 text-gray-600";
      break;
    case "sent":
    case "pending":
      classes = "bg-yellow-50 text-yellow-700 border border-yellow-100";
      break;
    case "accepted":
    case "approved":
      classes = "bg-blue-50 text-blue-700 border border-blue-100";
      break;
    case "completed":
    case "paid":
      classes = "bg-green-50 text-green-700 border border-green-100";
      break;
    case "rejected":
      classes = "bg-red-50 text-red-700 border border-red-100";
      break;
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xxs font-medium ${classes}`}>
      {status.toUpperCase()}
    </span>
  );
};
