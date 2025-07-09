import React from "react";
import PropTypes from "prop-types";

export default function ProfileTemplatesList({ templates, likesMap, commentsMap, usersMap, isDark, t }) {
  if (!templates || templates.length === 0) {
    return <p className={isDark ? "text-gray-300" : "text-gray-700"}>{t("noTemplatesFound")}</p>;
  }
  return (
    <>
      {templates.map((template) => (
        <div
          key={template.$id}
          className={`mb-6 p-4 border rounded transition-colors duration-300 ${
            isDark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"
          }`}
        >
          <h3 className="text-xl font-bold">{template.title}</h3>
          <p className={isDark ? "text-gray-300" : "text-gray-700"}>{template.description}</p>
          <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {t("visibility")}: <b>{template.isPublic ? t("public") : t("private")}</b>
          </p>

          <div className="mt-2">
            <p className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>{t("likes")}:</p>
            <ul className={`list-disc ml-5 text-sm ${isDark ? "text-blue-400" : "text-blue-600"}`}>
              {(likesMap[template.$id] || []).map((like) => (
                <li key={like.$id}>{usersMap[like.userId] || like.userId}</li>
              ))}
            </ul>
          </div>

          <div className="mt-2">
            <p className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>{t("comments")}:</p>
            <ul className={`list-disc ml-5 text-sm ${isDark ? "text-gray-200" : "text-gray-800"}`}>
              {(commentsMap[template.$id] || []).map((comment) => (
                <li key={comment.$id}>{usersMap[comment.userId] || comment.userId}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </>
  );
}

ProfileTemplatesList.propTypes = {
  templates: PropTypes.array.isRequired,
  likesMap: PropTypes.object.isRequired,
  commentsMap: PropTypes.object.isRequired,
  usersMap: PropTypes.object.isRequired,
  isDark: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
}; 