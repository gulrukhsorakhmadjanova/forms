import React from "react";
import PropTypes from "prop-types";

export default function FormQuestionList({ questions, answers, handleChange, isDark, t }) {
  return (
    <>
      {questions.map((q) => (
        <div key={q.$id} className="mb-2">
          <label className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{q.title}</label>
          <p className={`mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{q.description}</p>
          {q.type === "string-line" && (
            <input
              type="text"
              className={`border p-2 rounded w-full transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-900 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`}
              value={answers[q.$id] || ""}
              onChange={(e) => handleChange(q.$id, e.target.value)}
            />
          )}
          {q.type === "multi-line" && (
            <textarea
              className={`border p-2 rounded w-full transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-900 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`}
              rows={4}
              value={answers[q.$id] || ""}
              onChange={(e) => handleChange(q.$id, e.target.value)}
            />
          )}
          {q.type === "integer" && (
            <input
              type="number"
              className={`border p-2 rounded w-full transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-900 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`}
              value={answers[q.$id] || ""}
              onChange={(e) => handleChange(q.$id, e.target.value)}
            />
          )}
          {q.type === "checkbox" && ((Array.isArray(q.options) ? q.options : typeof q.options === 'string' ? q.options.split(',').map(o => o.trim()) : []).length > 0) ? (
            <div className="flex flex-col gap-1">
              {(Array.isArray(q.options) ? q.options : typeof q.options === 'string' ? q.options.split(',').map(o => o.trim()) : []).map((opt, idx) => (
                <label key={idx} className={`flex items-center gap-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  <input
                    type="checkbox"
                    checked={Array.isArray(answers[q.$id]) ? answers[q.$id].includes(opt) : false}
                    onChange={e => {
                      let prev = Array.isArray(answers[q.$id]) ? answers[q.$id] : [];
                      if (e.target.checked) {
                        prev = [...prev, opt];
                      } else {
                        prev = prev.filter(o => o !== opt);
                      }
                      handleChange(q.$id, prev);
                    }}
                    className="accent-blue-600"
                  />
                  {opt}
                </label>
              ))}
            </div>
          ) : q.type === "checkbox" && (!q.options || (Array.isArray(q.options) && q.options.length === 0) || (typeof q.options === 'string' && q.options.trim() === '')) ? (
            <input
              type="checkbox"
              checked={answers[q.$id] || false}
              onChange={e => handleChange(q.$id, e.target.checked)}
              className="accent-blue-600"
            />
          ) : null}
          {q.type === "drop-down" && (
            <select
              className={`border p-2 rounded w-full transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-900 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`}
              value={answers[q.$id] || ""}
              onChange={(e) => handleChange(q.$id, e.target.value)}
            >
              <option value="">{t('select')}</option>
              {q.options?.map((opt, idx) => (
                <option key={idx} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
    </>
  );
}

FormQuestionList.propTypes = {
  questions: PropTypes.array.isRequired,
  answers: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  isDark: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
}; 