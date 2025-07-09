import React from "react";
import PropTypes from "prop-types";
import ReactMarkdown from "react-markdown";
import ReactTagInput from "@pathofdev/react-tag-input";

const topics = ["Education", "Quiz", "Other"];

export default function TemplateFormFields({ form, handleChange, tags, setTags, isDark, t }) {
  return (
    <>
      <input name="title" placeholder={t('title')} value={form.title || ''} onChange={handleChange} required className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-900 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`} />
      <textarea name="description" placeholder={t('descriptionMarkdown')} value={form.description || ''} onChange={handleChange} required className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-900 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`} />
      <div className={`my-2 p-3 rounded transition-colors duration-300 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
        <b className={isDark ? 'text-gray-200' : 'text-gray-800'}>{t('preview')}:</b>
        <div className={`border p-2 rounded min-h-[40px] transition-colors duration-300 ${isDark ? 'border-gray-700 bg-gray-900 text-gray-100' : 'border-gray-200 bg-white text-gray-900'}`}>
          <ReactMarkdown>{form.description}</ReactMarkdown>
        </div>
      </div>
      <select name="topic" onChange={handleChange} value={form.topic || ''} className={`border rounded px-3 py-2 transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-900 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`}>
        {topics.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <label className={isDark ? 'text-gray-200' : 'text-gray-800'}>{t('tags')}:</label>
      {isDark && (
        <style>{`.react-tag-input { background: #1a202c !important; color: #f3f4f6 !important; border-color: #374151 !important; } .react-tag-input__input { color: #f3f4f6 !important; } .react-tag-input__tag { background: #374151 !important; color: #f3f4f6 !important; } .react-tag-input__tag__remove { background: #4b5563 !important; }`}</style>
      )}
      <div className={`rounded transition-colors duration-300 mb-2 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
        <ReactTagInput
          tags={tags}
          onChange={setTags}
          placeholder={t('typeAndPressEnter')}
        />
      </div>
      <input name="imageUrl" placeholder={t('imageUrlOptional')} value={form.imageUrl || ''} onChange={handleChange} className={`border rounded px-3 py-2 transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-900 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`} />
      <label className={`flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
        <input type="checkbox" name="isPublic" checked={!!form.isPublic} onChange={handleChange} /> {t('makePublic')}
      </label>
    </>
  );
}

TemplateFormFields.propTypes = {
  form: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  tags: PropTypes.array.isRequired,
  setTags: PropTypes.func.isRequired,
  isDark: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
}; 