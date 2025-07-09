import React from "react";
import PropTypes from "prop-types";

export default function DontHaveAccount({ isDark, t, navigate }) {
  return (
    <div className={`border-t mt-8 pt-4 text-center transition-colors duration-300 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{t('dontHaveAccount')}</span>
      <button
        type="button"
        onClick={() => navigate("/register")}
        className="ml-2 text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm bg-transparent border-none cursor-pointer transition-colors duration-300"
      >
        {t('register')}
      </button>
    </div>
  );
}

DontHaveAccount.propTypes = {
  isDark: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
}; 