import React from "react";
import PropTypes from "prop-types";

export default function TemplateLikeSection({ authUser, handleLike, hasLiked, loading, likes, isDark, t }) {
  return (
    <div className="flex items-center justify-between">
      {authUser && (
        <button
          onClick={handleLike}
          disabled={loading}
          className={`px-5 py-2 rounded-lg font-semibold transition-colors duration-300 ${
            hasLiked
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? t('loading') : hasLiked ? "❤️ " + t('unlike') : "🤍 " + t('like')}
        </button>
      )}
      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('likes')}: {likes.length}</p>
    </div>
  );
}

TemplateLikeSection.propTypes = {
  authUser: PropTypes.object,
  handleLike: PropTypes.func.isRequired,
  hasLiked: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  likes: PropTypes.array.isRequired,
  isDark: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
}; 