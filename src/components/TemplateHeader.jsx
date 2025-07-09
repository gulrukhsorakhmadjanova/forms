import React from "react";
import PropTypes from "prop-types";

export default function TemplateHeader({ template, isDark, t }) {
  return (
    <div>
      <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{template.title}</h2>
      <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{template.description}</p>
      <p className={`text-sm mt-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('topic')}: <span className="font-medium">{template.topic}</span></p>
      {template.imageUrl && (
        <img
          src={template.imageUrl}
          alt="template"
          className="my-4 rounded-lg shadow-md max-h-72 w-full object-cover"
        />
      )}
      <div className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {t('tags')}: <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{template.tags?.join(", ") || t('none')}</span>
      </div>
    </div>
  );
}

TemplateHeader.propTypes = {
  template: PropTypes.object.isRequired,
  isDark: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
}; 