import React from "react";
import PropTypes from "prop-types";

export default function FilledFormCard({ form, template, questions, parsedAnswers, isDark, t }) {
  return (
    <div className={`border p-4 rounded mb-4 transition-colors duration-300 ${isDark ? 'border-gray-700 bg-gray-900 text-gray-100' : 'border-gray-200 bg-gray-50 text-gray-900'}`}>
      <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
        {t('template')}: {template?.title || t('unknownTemplate')}
      </h3>
      <div className="space-y-2">
        {parsedAnswers.map((answerObj, i) => (
          <div key={i}>
            <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{i + 1}. {answerObj.question}</p>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t('answer')}: {answerObj.answer || t('noAnswerProvided')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

FilledFormCard.propTypes = {
  form: PropTypes.object.isRequired,
  template: PropTypes.object,
  questions: PropTypes.array,
  parsedAnswers: PropTypes.array.isRequired,
  isDark: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
}; 