import React from "react";
import PropTypes from "prop-types";

export default function ProfileFormsList({ forms, usersMap, isDark, t }) {
  if (!forms || forms.length === 0) {
    return <p className={isDark ? "text-gray-300" : "text-gray-700"}>{t("noFormsFound")}</p>;
  }
  return (
    <>
      {forms.map((form) => (
        <div
          key={form.$id}
          className={`mb-6 p-4 border rounded transition-colors duration-300 ${
            isDark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"
          }`}
        >
          <p className={`text-sm mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            {t("filledBy")}: {usersMap[form.createdBy] || form.createdBy}
          </p>
          <div className="mt-2">
            <p className={`font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>{t("answers")}:</p>
            <ul className={`list-disc ml-6 text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              {(form.answers || []).map((ans, i) => (
                <li key={i}>{ans}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </>
  );
}

ProfileFormsList.propTypes = {
  forms: PropTypes.array.isRequired,
  usersMap: PropTypes.object.isRequired,
  isDark: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
}; 