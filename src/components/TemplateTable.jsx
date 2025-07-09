import React from "react";
import PropTypes from "prop-types";
import TemplateTableRow from "./TemplateTableRow";

export default function TemplateTable({ templates, isDark, t, navigate }) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full border-collapse rounded-xl shadow-2xl border transition-colors duration-300 ${
        isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
      }`}>
        <thead>
          <tr className={isDark ? "bg-gray-800" : "bg-gray-50"}>
            <th className={`text-left p-3 font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>{t("title")}</th>
            <th className={`text-left p-3 font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>{t("topic")}</th>
            <th className={`text-left p-3 font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>{t("tags")}</th>
            <th className={`text-left p-3 font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => (
            <TemplateTableRow
              key={template.$id}
              template={template}
              isDark={isDark}
              t={t}
              navigate={navigate}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

TemplateTable.propTypes = {
  templates: PropTypes.array.isRequired,
  isDark: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
}; 