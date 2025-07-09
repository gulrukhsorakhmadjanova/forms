import React, { useEffect, useState } from "react";
import { Databases, ID, Query } from "appwrite";
import { useAuth, useTheme, useLanguage } from "../App";
import { Link } from "react-router-dom";
import { databases } from "../lib/appwrite"; 
import PropTypes from "prop-types";

function Toast({ message, onClose, type = "success" }) {
  return (
    <div className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow-lg text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
         role="alert" aria-live="polite">
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white font-bold" aria-label="Close notification">×</button>
    </div>
  );
}

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}></div>;
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-gray-400">
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path d="M8 12h8M8 16h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      <span className="mt-2">{message}</span>
    </div>
  );
}

function ConfirmDialog({ open, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-xl">
        <div className="mb-4 text-gray-900 dark:text-gray-100">{message}</div>
        <div className="flex gap-4 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 text-white">Confirm</button>
        </div>
      </div>
    </div>
  );
}

function UserDetailsPanel({ user, dbId }) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [allTemplates, setAllTemplates] = useState([]);
  const [forms, setForms] = useState([]);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [likedTemplatesMap, setLikedTemplatesMap] = useState({});
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [editingFormId, setEditingFormId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [templateEdit, setTemplateEdit] = useState({});
  const [formEdit, setFormEdit] = useState({});
  const [commentEdit, setCommentEdit] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    setEditingTemplateId(t.$id);
    setTemplateEdit({ title: t.title, description: t.description });
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
                {editingTemplateId === template.$id ? (
                  <>
                    <input name="title" value={templateEdit.title} onChange={handleTemplateEditChange} className="border rounded px-2 py-1 mr-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
                    <input name="description" value={templateEdit.description} onChange={handleTemplateEditChange} className="border rounded px-2 py-1 mr-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
                    <button onClick={() => handleTemplateSave(template)} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded mr-1">{t('save')}</button>
                    <button onClick={handleTemplateCancel} className="bg-gray-400 hover:bg-gray-500 text-white px-2 py-1 rounded">{t('cancel')}</button>
                  </>
                ) : (
                  <>
                    <Link to={`/template/${template.$id}`} className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">{template.title}</Link>
                    <span className="ml-2 text-gray-600 dark:text-gray-300">{template.description}</span>
                    <button onClick={() => handleTemplateEdit(template)} className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded">{t('edit')}</button>
                  </>
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
                    <textarea value={formEdit.answers} onChange={handleFormEditChange} className="border rounded px-2 py-1 w-full mt-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" rows={3} />
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
                    <input value={commentEdit.content} onChange={handleCommentEditChange} className="border rounded px-2 py-1 mr-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
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
};

export default function AdminPage() {
  const { authUser } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [error, setError] = useState(""); // FIX 3: Add error state for user list fetch

  const dbId = import.meta.env.VITE_APPWRITE_DB_ID;
  const usersCol = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await databases.listDocuments(dbId, usersCol);
        setUsers(res.documents);
        setError("");
      } catch (err) {
        setError(t('failedToLoadUsers'));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [dbId, usersCol]);

  const handleEdit = (u) => {
    setEditingId(u.$id);
    setEditForm(u);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const allowed = (({ name, email, isAdmin, isBlocked }) => ({ name, email, isAdmin, isBlocked }))(editForm);
      await databases.updateDocument(dbId, usersCol, editingId, allowed);
      setEditingId(null);
      setEditForm({});
      const res = await databases.listDocuments(dbId, usersCol);
      setUsers(res.documents);
      setError("");
    } catch (err) {
      setError(t('failedToSaveUserChanges')); // FIX 2: Show error on save
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`p-6 max-w-4xl w-full mx-auto mt-8 rounded-xl shadow-lg transition-colors duration-300 ${isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
        <h1 className="text-2xl font-bold mb-6">👨‍💼 {t('adminPanel')}</h1>
        {loading ? <p>{t('loading')}</p> : (
          <>
            {error && <div className="mb-2 text-red-600">{error}</div>}
            <table className={`w-full border-collapse rounded-lg shadow border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <thead>
                <tr className={isDark ? 'bg-gray-900' : 'bg-gray-100'}>
                  <th className="px-4 py-2 text-left">{t('name')}</th>
                  <th className="px-4 py-2 text-left">{t('email')}</th>
                  <th className="px-4 py-2 text-left">Admin</th>
                  <th className="px-4 py-2 text-left">Blocked</th>
                  <th className="px-4 py-2 text-left">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <React.Fragment key={u.$id}>
                    <tr className={isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}>
                      {editingId === u.$id ? (
                        <>
                          <td className="px-4 py-2"><input name="name" value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="border rounded px-2 py-1 w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" /></td>
                          <td className="px-4 py-2"><input name="email" value={editForm.email || ""} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="border rounded px-2 py-1 w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" /></td>
                          <td className="px-4 py-2"><input type="checkbox" name="isAdmin" checked={!!editForm.isAdmin} onChange={(e) => setEditForm({ ...editForm, isAdmin: e.target.checked })} /></td>
                          <td className="px-4 py-2"><input type="checkbox" name="isBlocked" checked={!!editForm.isBlocked} onChange={(e) => setEditForm({ ...editForm, isBlocked: e.target.checked })} /></td>
                          <td className="px-4 py-2 flex gap-2">
                            <button onClick={handleSave} disabled={saving} className="bg-green-600 text-white px-2 py-1 rounded">{t('save')}</button>
                            <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white px-2 py-1 rounded">{t('cancel')}</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-2 text-blue-600 dark:text-blue-400"><Link to={`/profile/${u.authUserId}`}>{u.name}</Link></td>
                          <td className="px-4 py-2">{u.email}</td>
                          <td className="px-4 py-2">{u.isAdmin ? '✅' : '❌'}</td>
                          <td className="px-4 py-2">{u.isBlocked ? '✅' : '❌'}</td>
                          <td className="px-4 py-2 flex gap-2">
                            <button onClick={() => handleEdit(u)} className="bg-blue-600 text-white px-2 py-1 rounded">{t('edit')}</button>
                            <button onClick={() => setExpandedUserId(expandedUserId === u.$id ? null : u.$id)} className="bg-gray-600 text-white px-2 py-1 rounded">{expandedUserId === u.$id ? t('hide') : t('details')}</button>
                          </td>
                        </>
                      )}
                    </tr>
                    {expandedUserId === u.$id && (
                      <tr><td colSpan={5}><UserDetailsPanel user={u} dbId={dbId} /></td></tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </>
        )}
        {}
      </div>
    </div>
  );
}
