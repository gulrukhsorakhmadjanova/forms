import React from "react";
import PropTypes from "prop-types";

export default function TemplateCommentsList({ comments, usersMap, isDark, t }) {
  return (
    <div>
      <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{t('comments')}</h3>
      {comments.length === 0 ? (
        <p className={`italic ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('noCommentsYet')}</p>
      ) : (
        <ul className="space-y-3 list-disc ml-6">
          {comments.map((c) => (
            <li key={c.$id} className={`${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              <strong>{usersMap[c.userId] || "Anonymous"}:</strong> {c.content}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

TemplateCommentsList.propTypes = {
  comments: PropTypes.array.isRequired,
  usersMap: PropTypes.object.isRequired,
  isDark: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
}; 