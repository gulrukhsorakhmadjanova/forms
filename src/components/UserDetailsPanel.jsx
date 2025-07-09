import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ID, Query } from "appwrite";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { databases } from "../lib/appwrite";
import TemplateFormFields from "./TemplateFormFields";
import TemplateQuestionsList from "./TemplateQuestionsList";
import AddQuestionButton from "./AddQuestionButton";

function UserDetailsPanel({ user, dbId, isAdmin }) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [allTemplates, setAllTemplates] = useState([]);
  const [forms, setForms] = useState([]);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [likedTemplatesMap, setLikedTemplatesMap] = useState({});
  const [templateEdit, setTemplateEdit] = useState({});
  const [questionsEdit, setQuestionsEdit] = useState([]);
  const [tagsEdit, setTagsEdit] = useState([]);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [editingFormId, setEditingFormId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [formEdit, setFormEdit] = useState({});
  const [commentEdit, setCommentEdit] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [questionsMap, setQuestionsMap] = useState({});

  const templates = allTemplates.filter(t => t.createdBy === user.authUserId);

  useEffect(() => {
    let mounted = true;
    async function fetchDetails() {
      setLoading(true);
      try {
        const [allTplRes, formRes, commentRes, likesRes] = await Promise.all([
          databases.listDocuments(dbId, import.meta.env.VITE_APPWRITE_TEMPLATES_COLLECTION_ID, []),
          databases.listDocuments(dbId, import.meta.env.VITE_APPWRITE_FORMS_COLLECTION_ID, [
            Query.equal("createdBy", user.authUserId),
          ]),
          databases.listDocuments(dbId, import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID, [
            Query.equal("userId", user.authUserId),
          ]),
          databases.listDocuments(dbId, import.meta.env.VITE_APPWRITE_LIKES_COLLECTION_ID, [
            Query.equal("userId", user.authUserId),
          ]),
        ]);
        let likedTemplatesMap = {};
        if (likesRes.documents.length > 0) {
          likesRes.documents.forEach(like => {
            likedTemplatesMap[like.templateId] = like;
          });
        }
        const questionsCol = import.meta.env.VITE_APPWRITE_QUESTIONS_COLLECTION_ID;
        const questionsRes = await databases.listDocuments(dbId, questionsCol);
        const qMap = {};
        questionsRes.documents.forEach(q => {
          if (!qMap[q.templateId]) qMap[q.templateId] = [];
          qMap[q.templateId].push(q);
        });
        setQuestionsMap(qMap);
        if (mounted) {
          setAllTemplates(allTplRes.documents);
          setForms(formRes.documents);
          setComments(commentRes.documents);
          setLikes(likesRes.documents);
          setLikedTemplatesMap(likedTemplatesMap);
        }
      } catch (err) {
        if (mounted) {
          setAllTemplates([]);
          setForms([]);
          setComments([]);
          setLikes([]);
          setLikedTemplatesMap({});
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchDetails();
    return () => { mounted = false; };
  }, [user, dbId]);

  async function refreshDetails() {
    setLoading(true);
    setError("");
    try {
      const [allTplRes, formRes, commentRes, likesRes] = await Promise.all([
        databases.listDocuments(dbId, import.meta.env.VITE_APPWRITE_TEMPLATES_COLLECTION_ID, []),
        databases.listDocuments(dbId, import.meta.env.VITE_APPWRITE_FORMS_COLLECTION_ID, [
          Query.equal("createdBy", user.authUserId),
        ]),
        databases.listDocuments(dbId, import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID, [
          Query.equal("userId", user.authUserId),
        ]),
        databases.listDocuments(dbId, import.meta.env.VITE_APPWRITE_LIKES_COLLECTION_ID, [
          Query.equal("userId", user.authUserId),
        ]),
      ]);
      let likedTemplatesMap = {};
      if (likesRes.documents.length > 0) {
        likesRes.documents.forEach(like => {
          likedTemplatesMap[like.templateId] = like;
        });
      }
      const questionsCol = import.meta.env.VITE_APPWRITE_QUESTIONS_COLLECTION_ID;
      const questionsRes = await databases.listDocuments(dbId, questionsCol);
      const qMap = {};
      questionsRes.documents.forEach(q => {
        if (!qMap[q.templateId]) qMap[q.templateId] = [];
        qMap[q.templateId].push(q);
      });
      setQuestionsMap(qMap);
      setAllTemplates(allTplRes.documents);
      setForms(formRes.documents);
      setComments(commentRes.documents);
      setLikes(likesRes.documents);
      setLikedTemplatesMap(likedTemplatesMap);
    } catch (err) {
      setError(t('failedToRefreshDetails') + ": " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLike(templateId) {
    setSaving(true);
    setError("");
    try {
      await databases.createDocument(dbId, import.meta.env.VITE_APPWRITE_LIKES_COLLECTION_ID, ID.unique(), {
        userId: user.authUserId,
        templateId,
      });
      await refreshDetails();
    } catch (err) {
      setError(t('failedToLikeTemplate') + ": " + (err.message || err.toString()));
    } finally {
      setSaving(false);
    }
  }
  async function handleUnlike(templateId) {
    setSaving(true);
    setError("");
    try {
      // Find the like document for this user/template
      const likeDoc = likes.find(l => l.templateId === templateId);
      if (likeDoc) {
        await databases.deleteDocument(dbId, import.meta.env.VITE_APPWRITE_LIKES_COLLECTION_ID, likeDoc.$id);
      }
      await refreshDetails();
    } catch (err) {
      setError(t('failedToUnlikeTemplate') + ": " + (err.message || err.toString()));
    } finally {
      setSaving(false);
    }
  }

  // Template edit handlers
  function handleTemplateEdit(t) {
    if (isAdmin) {
      setTemplateEdit({ ...t });
      setTagsEdit(t.tags || []);
      setQuestionsEdit((questionsMap[t.$id] || []).map(q => ({ ...q })));
      setEditingTemplateId(t.$id);
    } else {
      setEditingTemplateId(t.$id);
      setTemplateEdit({ title: t.title, description: t.description });
    }
  }
  function handleTemplateEditChange(e) {
    setTemplateEdit(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }
  async function handleTemplateSave(t) {
    setSaving(true);
    setError("");
    try {
      await databases.updateDocument(dbId, import.meta.env.VITE_APPWRITE_TEMPLATES_COLLECTION_ID, t.$id, {
        title: templateEdit.title,
        description: templateEdit.description
      });
      setEditingTemplateId(null);
      setTemplateEdit({});
      await refreshDetails();
    } catch (err) {
      setError(t('failedToSaveTemplate') + ": " + (err.message || err.toString()));
    } finally {
      setSaving(false);
    }
  }
  function handleTemplateCancel() {
    setEditingTemplateId(null);
    setTemplateEdit({});
  }

  // Form edit handlers
  function handleFormEdit(f) {
    setEditingFormId(f.$id);
    setFormEdit({ answers: Array.isArray(f.answers) ? f.answers.join('\n') : '' });
  }
  function handleFormEditChange(e) {
    setFormEdit({ answers: e.target.value });
  }
  async function handleFormSave(f) {
    setSaving(true);
    setError("");
    try {
      await databases.updateDocument(dbId, import.meta.env.VITE_APPWRITE_FORMS_COLLECTION_ID, f.$id, {
        answers: formEdit.answers.split('\n').map(a => a.trim()).filter(Boolean)
      });
      setEditingFormId(null);
      setFormEdit({});
      await refreshDetails();
    } catch (err) {
      setError(t('failedToSaveForm') + ": " + (err.message || err.toString()));
    } finally {
      setSaving(false);
    }
  }
  function handleFormCancel() {
    setEditingFormId(null);
    setFormEdit({});
  }

  // Comment edit handlers
  function handleCommentEdit(c) {
    setEditingCommentId(c.$id);
    setCommentEdit({ content: c.content });
  }
  function handleCommentEditChange(e) {
    setCommentEdit({ content: e.target.value });
  }
  async function handleCommentSave(c) {
    setSaving(true);
    setError("");
    try {
      await databases.updateDocument(dbId, import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID, c.$id, {
        content: commentEdit.content
      });
      setEditingCommentId(null);
      setCommentEdit({});
      await refreshDetails();
    } catch (err) {
      setError(t('failedToSaveComment') + ": " + (err.message || err.toString()));
    } finally {
      setSaving(false);
    }
  }
  function handleCommentCancel() {
    setEditingCommentId(null);
    setCommentEdit({});
  }

  // Admin template handlers
  function handleAdminTemplateFieldChange(e) {
    setTemplateEdit(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }
  function handleAdminQuestionChange(index, field, value) {
    setQuestionsEdit(prev => {
      const newQuestions = [...prev];
      newQuestions[index] = { ...newQuestions[index], [field]: value };
      return newQuestions;
    });
  }
  function handleAdminAddQuestion() {
    setQuestionsEdit(prev => [...prev, { question: "", type: "text", options: [] }]);
  }
  function handleAdminRemoveQuestion(index) {
    setQuestionsEdit(prev => prev.filter((_, i) => i !== index));
  }
  async function handleAdminTemplateSave(e, template) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      // 1. Update the template document (without questions)
      await databases.updateDocument(dbId, import.meta.env.VITE_APPWRITE_TEMPLATES_COLLECTION_ID, template.$id, {
        title: templateEdit.title,
        description: templateEdit.description,
        tags: tagsEdit,
      });

      // 2. Update questions in the questions collection
      const questionsCol = import.meta.env.VITE_APPWRITE_QUESTIONS_COLLECTION_ID;
      const existingQuestions = questionsMap[template.$id] || [];
      const existingIds = existingQuestions.map(q => q.$id);
      const newIds = questionsEdit.filter(q => q.$id).map(q => q.$id);

      // a) Delete removed questions
      for (const q of existingQuestions) {
        if (!questionsEdit.find(qq => qq.$id === q.$id)) {
          await databases.deleteDocument(dbId, questionsCol, q.$id);
        }
      }

      // b) Update or create questions
      for (const q of questionsEdit) {
        if (q.$id) {
          // Update existing question
          await databases.updateDocument(dbId, questionsCol, q.$id, {
            title: q.title,
            description: q.description,
            type: q.type,
            options: Array.isArray(q.options) ? q.options : (typeof q.options === 'string' ? q.options.split(',').map(o => o.trim()) : []),
            order: q.order,
            showInTable: q.showInTable,
            templateId: template.$id,
          });
        } else {
          // Create new question
          await databases.createDocument(dbId, questionsCol, ID.unique(), {
            title: q.title,
            description: q.description,
            type: q.type,
            options: Array.isArray(q.options) ? q.options : (typeof q.options === 'string' ? q.options.split(',').map(o => o.trim()) : []),
            order: q.order,
            showInTable: q.showInTable,
            templateId: template.$id,
          });
        }
      }

      setEditingTemplateId(null);
      setTemplateEdit({});
      setQuestionsEdit([]);
      setTagsEdit([]);
      await refreshDetails();
    } catch (err) {
      setError(t('failedToSaveTemplate') + ": " + (err.message || err.toString()));
    } finally {
      setSaving(false);
    }
  }
  function handleAdminTemplateCancel() {
    setEditingTemplateId(null);
    setTemplateEdit({});
    setQuestionsEdit([]);
    setTagsEdit([]);
  }

  if (loading) return <div className={`p-4 rounded-xl shadow bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-300`}>{t('loadingUserDetails')}</div>;

  return (
    <div className={`p-6 rounded-xl shadow transition-colors duration-300 border border-gray-200 dark:border-gray-700 mt-2 ${isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
      {error && <div className="mb-2 text-red-600 dark:text-red-400">{error}</div>}
      <div className="mb-4">
        <b className="block mb-1">{t('templatesCreated')}:</b>
        {templates.length === 0 ? (
          <span className="ml-2 text-gray-400">{t('none')}</span>
        ) : (
          <ul className="list-disc ml-6">
            {templates.map(template => (
              <li key={template.$id} className="mb-1">
                {isAdmin && editingTemplateId === template.$id ? (
                  <form onSubmit={e => handleAdminTemplateSave(e, template)} className="mb-4">
                    <TemplateFormFields
                      form={templateEdit}
                      handleChange={handleAdminTemplateFieldChange}
                      tags={tagsEdit}
                      setTags={setTagsEdit}
                      isDark={isDark}
                      t={t}
                    />
                    <h4 className="font-semibold mt-4 mb-2">{t('questions')}</h4>
                    <TemplateQuestionsList
                      questions={questionsEdit}
                      handleQuestionChange={handleAdminQuestionChange}
                      removeQuestion={handleAdminRemoveQuestion}
                      isDark={isDark}
                      t={t}
                    />
                    <AddQuestionButton onClick={handleAdminAddQuestion} t={t} />
                    <div className="flex gap-2 mt-2">
                      <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">{t('save')}</button>
                      <button type="button" onClick={handleAdminTemplateCancel} className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded">{t('cancel')}</button>
                    </div>
                  </form>
                ) : (
                  <div className="mb-4">
                    <div><b>{t('title')}:</b> {template.title}</div>
                    <div><b>{t('description')}:</b> {template.description}</div>
                    <div><b>{t('topic')}:</b> {template.topic}</div>
                    <div><b>{t('tags')}:</b> {(template.tags || []).join(', ')}</div>
                    <div><b>{t('public')}:</b> {template.isPublic ? t('public') : t('private')}</div>
                    <div><b>{t('questions')}:</b></div>
                    <ul className="ml-6">
                      {(questionsMap[template.$id] || []).map(q => (
                        <li key={q.$id} className="mb-1">
                          <div><b>{t('title')}:</b> {q.title}</div>
                          <div><b>{t('description')}:</b> {q.description}</div>
                          <div><b>{t('type')}:</b> {q.type}</div>
                          <div><b>{t('options')}:</b> {Array.isArray(q.options) ? q.options.join(', ') : q.options}</div>
                          <div><b>{t('order')}:</b> {q.order}</div>
                          <div><b>{t('showInTable')}:</b> {q.showInTable ? t('yes') : t('no')}</div>
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => handleTemplateEdit(template)} className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded">{t('edit')}</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mb-4">
        <b className="block mb-1">{t('allTemplates')}:</b>
        {allTemplates.length === 0 ? (
          <span className="ml-2 text-gray-400">{t('none')}</span>
        ) : (
          <ul className="list-disc ml-6">
            {allTemplates.map(template => (
              <li key={template.$id} className="mb-1">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">{template.title}</span>
                {likedTemplatesMap[template.$id] ? (
                  <button onClick={() => handleUnlike(template.$id)} disabled={saving} className="ml-2 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded">{t('unlike')}</button>
                ) : (
                  <button onClick={() => handleLike(template.$id)} disabled={saving} className="ml-2 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded">{t('like')}</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mb-4">
        <b className="block mb-1">{t('formsFilled')}:</b>
        {forms.length === 0 ? (
          <span className="ml-2 text-gray-400">{t('none')}</span>
        ) : (
          <ul className="list-disc ml-6">
            {forms.map(form => (
              <li key={form.$id} className="mb-1">
                <span className={`${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Form ID: {form.$id}</span>
                {editingFormId === form.$id ? (
                  <>
                    <textarea value={formEdit.answers} onChange={handleFormEditChange} className={`border rounded px-2 py-1 w-full mt-1 transition-colors duration-300 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`} rows={3} />
                    <button onClick={() => handleFormSave(form)} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded mr-1 mt-1">{t('save')}</button>
                    <button onClick={handleFormCancel} className="bg-gray-400 hover:bg-gray-500 text-white px-2 py-1 rounded mt-1">{t('cancel')}</button>
                  </>
                ) : (
                  <>
                    {Array.isArray(form.answers) && form.answers.length > 0 && (
                      <ul className={`list-decimal ml-6 mt-1 text-sm ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                        {form.answers.map((ans, idx) => (
                          <li key={idx}>{ans}</li>
                        ))}
                      </ul>
                    )}
                    <button onClick={() => handleFormEdit(form)} className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded">{t('edit')}</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mb-4">
        <b className="block mb-1">{t('commentsLeft')}:</b>
        {comments.length === 0 ? (
          <span className="ml-2 text-gray-400">{t('none')}</span>
        ) : (
          <ul className="list-disc ml-6">
            {comments.map(comment => (
              <li key={comment.$id} className="mb-1">
                {editingCommentId === comment.$id ? (
                  <>
                    <input value={commentEdit.content} onChange={handleCommentEditChange} className={`border rounded px-2 py-1 mr-2 transition-colors duration-300 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`} />
                    <button onClick={() => handleCommentSave(comment)} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded mr-1">{t('save')}</button>
                    <button onClick={handleCommentCancel} className="bg-gray-400 hover:bg-gray-500 text-white px-2 py-1 rounded">{t('cancel')}</button>
                  </>
                ) : (
                  <>
                    <span className={`${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{comment.content}</span>
                    <button onClick={() => handleCommentEdit(comment)} className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded">{t('edit')}</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mb-2">
        <b className="block mb-1">{t('likes')}:</b>
        {likes.length === 0 ? (
          <span className="ml-2 text-gray-400">{t('none')}</span>
        ) : (
          <ul className="list-disc ml-6">
            {likes.map(like => {
              // Find the template for this like
              const template = allTemplates.find(tpl => tpl.$id === like.templateId);
              return (
                <li key={like.$id} className="mb-1">
                  <span className={`${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                    {template ? template.title : t('unknownTemplate')}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

UserDetailsPanel.propTypes = {
  user: PropTypes.object.isRequired,
  dbId: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool,
};

export default UserDetailsPanel; 