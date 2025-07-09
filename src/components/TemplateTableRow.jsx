import React from "react";
import PropTypes from "prop-types";

export default function TemplateTableRow({ template, isDark, t, navigate }) {
  return (
    <tr
      className={`border-t transition-all duration-200 ${
        isDark ? "border-gray-700 hover:bg-gray-800" : "border-gray-200 hover:bg-gray-50"
      }`}
    >
      <td className={`p-3 ${isDark ? "text-gray-100" : "text-gray-900"}`}>{template.title}</td>
      <td className={`p-3 ${isDark ? "text-gray-100" : "text-gray-900"}`}>{template.topic}</td>
      <td className={`p-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}>{(template.tags || []).join(", ")}</td>
      <td className="p-3 flex gap-2">
        <button
          onClick={() => navigate(`/template/${template.$id}`)}
          className={`font-medium px-2 py-1 rounded transition-colors ${
            isDark
              ? "text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
              : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          }`}
        >
          {t("details")}
        </button>
        <button
          onClick={() => navigate(`/template/${template.$id}/fill`)}
          className={`font-medium px-2 py-1 rounded transition-colors ${
            isDark
              ? "text-green-400 hover:text-green-300 hover:bg-green-900/20"
              : "text-green-600 hover:text-green-800 hover:bg-green-50"
          }`}
        >
          {t("fill")}
        </button>
      </td>
    </tr>
  );
}

TemplateTableRow.propTypes = {
  template: PropTypes.object.isRequired,
  isDark: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
}; 