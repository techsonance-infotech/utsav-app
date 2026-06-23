import React from "react";

export interface ChatBubbleProps {
  text?: string | null;
  senderName: string;
  senderAvatarUrl?: string | null;
  isSelf: boolean;
  mediaUrl?: string | null;
  mediaType?: "image" | "video" | "document" | null;
  timestamp: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  text,
  senderName,
  senderAvatarUrl,
  isSelf,
  mediaUrl,
  mediaType,
  timestamp,
}) => {
  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex w-full my-2 ${isSelf ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[75%] items-start gap-2.5 ${isSelf ? "flex-row-reverse" : "flex-row"}`}>
        {senderAvatarUrl ? (
          <img
            className="w-8 h-8 rounded-full object-cover shadow-sm"
            src={senderAvatarUrl}
            alt={senderName}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-700 text-sm shadow-sm">
            {senderName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="flex flex-col gap-1 w-full">
          <div className={`flex items-center space-x-2 rtl:space-x-reverse ${isSelf ? "justify-end" : "justify-start"}`}>
            <span className="text-xs font-semibold text-gray-900">{senderName}</span>
            <span className="text-xxs text-gray-500">{formattedTime}</span>
          </div>

          <div
            className={`flex flex-col leading-1.5 p-3.5 border-gray-200 rounded-r-xl rounded-bl-xl ${
              isSelf
                ? "bg-orange-600 text-white rounded-l-xl rounded-tr-none"
                : "bg-gray-100 text-gray-900 rounded-r-xl rounded-tl-none"
            }`}
          >
            {mediaUrl && mediaType === "image" && (
              <img
                src={mediaUrl}
                alt="Shared media"
                className="max-w-full rounded-lg mb-2 object-cover max-h-60 shadow-sm"
              />
            )}

            {mediaUrl && mediaType !== "image" && (
              <a
                href={mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs underline flex items-center gap-1 mb-2 ${
                  isSelf ? "text-orange-100 hover:text-white" : "text-orange-600 hover:text-orange-700"
                }`}
              >
                📎 View attachment
              </a>
            )}

            {text && <p className="text-sm font-normal whitespace-pre-wrap">{text}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
