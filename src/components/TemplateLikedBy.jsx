import React from "react";
import PropTypes from "prop-types";

export default function TemplateLikedBy({ likes, usersMap, isDark, t }) {
  return (
    <div>
      <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{t('likedBy')}</h3>
      {likes.length === 0 ? (
        <p className={`italic ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('noOneLikedYet')}</p>
      ) : (
        <ul className={`list-disc ml-6 space-y-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
          {likes.map((like) => (
            <li key={like.$id}>{usersMap[like.userId] || t('unknownUser')}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

TemplateLikedBy.propTypes = {
  likes: PropTypes.array.isRequired,
  usersMap: PropTypes.object.isRequired,
  isDark: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
}; 