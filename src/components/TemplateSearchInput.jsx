import React from "react";
import PropTypes from "prop-types";

export default function TemplateSearchInput({ search, setSearch, isDark, t }) {
  return (
    <input
      type="text"
      placeholder={t("searchPlaceholder")}
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className={`mb-6 w-full max-w-md px-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
        isDark
          ? "bg-gray-900 text-gray-100 border-gray-600 focus:ring-blue-400"
          : "bg-white text-gray-900 border-gray-300 focus:ring-blue-500"
      }`}
    />
  );
}

TemplateSearchInput.propTypes = {
  search: PropTypes.string.isRequired,
  setSearch: PropTypes.func.isRequired,
  isDark: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
}; 