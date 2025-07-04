import React from "react";

export default function BlockedPage() {
  return (
    <div className="card max-w-md mx-auto mt-16 bg-white dark:bg-[#23232a] rounded-xl shadow-lg transition-colors duration-300 text-center">
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">Account Blocked</h2>
      <p className="text-gray-700 dark:text-gray-300">Your account has been blocked by an administrator. If you believe this is a mistake, please contact support.</p>
    </div>
  );
} 