import React, { useState } from "react";

export interface MessageInputProps {
  onSend: (text: string) => void;
  onAttach?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  onAttach,
  placeholder = "Type a message...",
  disabled = false,
}) => {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-gray-100 p-3 bg-white">
      {onAttach && (
        <button
          type="button"
          onClick={onAttach}
          disabled={disabled}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-colors"
        >
          📎
        </button>
      )}
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-full text-sm font-semibold transition-colors disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
};
