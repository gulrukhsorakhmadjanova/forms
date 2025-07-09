import React from "react";

export default function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-gray-400">
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path d="M8 12h8M8 16h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      <span className="mt-2">{message}</span>
    </div>
  );
}