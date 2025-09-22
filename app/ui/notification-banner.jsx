import React from "react";

export function NotificationBanner({ text }) {
  return (
    <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
      <p className="text-sm font-semibold">{text}</p>
    </div>
  );
}
