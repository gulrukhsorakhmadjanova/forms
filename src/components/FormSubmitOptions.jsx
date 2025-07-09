import React from "react";
import PropTypes from "prop-types";

export default function FormSubmitOptions({ emailCopy, setEmailCopy, comment, setComment, isDark, t }) {
  return (
    <>
      <label className={`flex items-center gap-2 mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
        <input
          type="checkbox"
          checked={emailCopy}
          onChange={(e) => setEmailCopy(e.target.checked)}
          className="accent-blue-600"
        />
        {t('sendMeCopy')}
      </label>

      <div className="mb-4">
        <label className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{t('yourComment')}</label>
        <textarea
          className={`border p-2 rounded w-full transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-900 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`}
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('leaveYourFeedback')}
        />
      </div>
    </>
  );
}

FormSubmitOptions.propTypes = {
  emailCopy: PropTypes.bool.isRequired,
  setEmailCopy: PropTypes.func.isRequired,
  comment: PropTypes.string.isRequired,
  setComment: PropTypes.func.isRequired,
  isDark: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
}; 