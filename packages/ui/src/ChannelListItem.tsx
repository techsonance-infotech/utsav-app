import React from "react";

export interface ChannelListItemProps {
  name: string;
  type: "direct" | "group";
  lastMessageText?: string | null;
  lastMessageAt?: string | null;
  isActive: boolean;
  onClick: () => void;
}

export const ChannelListItem: React.FC<ChannelListItemProps> = ({
  name,
  type,
  lastMessageText,
  lastMessageAt,
  isActive,
  onClick,
}) => {
  const formattedTime = lastMessageAt
    ? new Date(lastMessageAt).toLocaleDateString([], {
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3.5 cursor-pointer rounded-lg transition-colors ${
        isActive ? "bg-orange-50 text-orange-950 font-medium" : "hover:bg-gray-50 text-gray-700"
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
        isActive ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-500"
      }`}>
        {type === "direct" ? "👤" : "👥"}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold truncate">{name}</p>
          <span className="text-xxs text-gray-400">{formattedTime}</span>
        </div>
        <p className={`text-xs truncate ${isActive ? "text-orange-800" : "text-gray-500"}`}>
          {lastMessageText || "No messages yet"}
        </p>
      </div>
    </div>
  );
};
