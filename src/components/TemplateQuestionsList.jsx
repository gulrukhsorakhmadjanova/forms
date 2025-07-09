import React from "react";
import PropTypes from "prop-types";

const types = ["string-line", "multi-line", "integer", "checkbox", "drop-down"];

export default function TemplateQuestionsList({ questions, handleQuestionChange, removeQuestion, isDark, t }) {
  return (
    <>
      {questions.map((q, i) => (
        <div key={i} className={`mb-4 p-4 border rounded-lg transition-colors duration-300 ${isDark ? 'border-gray-700 bg-gray-900 text-gray-100' : 'border-gray-200 bg-gray-50 text-gray-900'}`}>
          <input placeholder={t('title')} value={q.title} onChange={e => handleQuestionChange(i, "title", e.target.value)} required className={`border rounded px-3 py-2 mb-2 w-full transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`} />
          <textarea placeholder={t('description')} value={q.description} onChange={e => handleQuestionChange(i, "description", e.target.value)} className={`border rounded px-3 py-2 mb-2 w-full transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`} />
          <select value={q.type} onChange={e => handleQuestionChange(i, "type", e.target.value)} className={`border rounded px-3 py-2 mb-2 w-full transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`}>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {(q.type === 'drop-down' || q.type === 'checkbox') && (
            <input placeholder={t('optionsCommaSeparated')} value={q.options} onChange={e => handleQuestionChange(i, "options", e.target.value)} className={`border rounded px-3 py-2 mb-2 w-full transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`} />
          )}
          <input type="number" placeholder={t('order')} value={q.order} onChange={e => handleQuestionChange(i, "order", parseInt(e.target.value))} className={`border rounded px-3 py-2 mb-2 w-full transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`} />
          <label className={`flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
            <input type="checkbox" checked={q.showInTable} onChange={e => handleQuestionChange(i, "showInTable", e.target.checked)} />
            {t('showInTable')}
          </label>
          <button type="button" onClick={() => removeQuestion(i)} className="mt-2 text-red-600 dark:text-red-400 hover:underline">{t('removeQuestion')}</button>
        </div>
      ))}
    </>
  );
}

TemplateQuestionsList.propTypes = {
  questions: PropTypes.array.isRequired,
  handleQuestionChange: PropTypes.func.isRequired,
  removeQuestion: PropTypes.func.isRequired,
  isDark: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
}; 