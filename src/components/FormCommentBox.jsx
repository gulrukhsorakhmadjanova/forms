import React from "react";
import PropTypes from "prop-types";

export default function FormCommentBox({ value, onChange, isDark, t }) {
  return (
    <div className="mb-4">
      <label className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{t('yourAnswer')}</label>
      <textarea
        className={`border p-2 rounded w-full transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-900 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`}
        rows={4}
        value={value}
        onChange={onChange}
        placeholder={t('typeYourAnswerHere')}
      />
    </div>
  );
}

FormCommentBox.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  isDark: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
}; 