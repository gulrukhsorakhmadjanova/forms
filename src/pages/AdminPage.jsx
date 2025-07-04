import React, { useEffect, useState } from "react";
import { databases } from "../lib/appwrite"; 
import { useAuth } from "../App"; 
import { ID } from "appwrite";
import { Link, useNavigate } from "react-router-dom";
import { Query } from "appwrite";

function UserDetailsPanel({ user, dbId }) {
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

  // Add this line to fix the error:
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
      setError("Failed to refresh details: " + err.message);
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
      setError("Failed to like template: " + (err.message || err.toString()));
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
      setError("Failed to unlike template: " + (err.message || err.toString()));
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
      setError("Failed to save template: " + (err.message || err.toString()));
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
      setError("Failed to save form: " + (err.message || err.toString()));
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
      setError("Failed to save comment: " + (err.message || err.toString()));
    } finally {
      setSaving(false);
    }
  }
  function handleCommentCancel() {
    setEditingCommentId(null);
    setCommentEdit({});
  }

  if (loading) return <div className="p-4 text-gray-500">Loading user details...</div>;

  return (
    <div className="p-4 bg-gray-50 dark:bg-[#18181b] rounded border border-gray-200 dark:border-gray-700 mt-2">
      {error && <div className="mb-2 text-red-600 dark:text-red-400">{error}</div>}
      <div className="mb-2">
        <b>Templates Created:</b>
        {templates.length === 0 ? (
          <span className="ml-2 text-gray-400">None</span>
        ) : (
          <ul className="list-disc ml-6">
            {templates.map(t => (
              <li key={t.$id}>
                {editingTemplateId === t.$id ? (
                  <>
                    <input name="title" value={templateEdit.title} onChange={handleTemplateEditChange} className="border rounded px-2 py-1 mr-2" />
                    <input name="description" value={templateEdit.description} onChange={handleTemplateEditChange} className="border rounded px-2 py-1 mr-2" />
                    <button onClick={() => handleTemplateSave(t)} disabled={saving} className="bg-green-600 text-white px-2 py-1 rounded mr-1">Save</button>
                    <button onClick={handleTemplateCancel} className="bg-gray-400 text-white px-2 py-1 rounded">Cancel</button>
                  </>
                ) : (
                  <>
                    <Link to={`/template/${t.$id}`} className="text-blue-600 dark:text-blue-400 hover:underline">{t.title}</Link>
                    <span className="ml-2 text-gray-600 dark:text-gray-300">{t.description}</span>
                    <button onClick={() => handleTemplateEdit(t)} className="ml-2 bg-blue-600 text-white px-2 py-1 rounded">Edit</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mb-2">
        <b>All Templates (Like/Unlike):</b>
        {allTemplates.length === 0 ? (
          <span className="ml-2 text-gray-400">None</span>
        ) : (
          <ul className="list-disc ml-6">
            {allTemplates.map(t => (
              <li key={t.$id}>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">{t.title}</span>
                {likedTemplatesMap[t.$id] ? (
                  <button onClick={() => handleUnlike(t.$id)} disabled={saving} className="ml-2 bg-red-600 text-white px-2 py-1 rounded">Unlike</button>
                ) : (
                  <button onClick={() => handleLike(t.$id)} disabled={saving} className="ml-2 bg-green-600 text-white px-2 py-1 rounded">Like</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mb-2">
        <b>Forms Filled:</b>
        {forms.length === 0 ? (
          <span className="ml-2 text-gray-400">None</span>
        ) : (
          <ul className="list-disc ml-6">
            {forms.map(f => (
              <li key={f.$id}>
                <span className="text-gray-800 dark:text-gray-200">Form ID: {f.$id}</span>
                {editingFormId === f.$id ? (
                  <>
                    <textarea value={formEdit.answers} onChange={handleFormEditChange} className="border rounded px-2 py-1 w-full mt-1" rows={3} />
                    <button onClick={() => handleFormSave(f)} disabled={saving} className="bg-green-600 text-white px-2 py-1 rounded mr-1 mt-1">Save</button>
                    <button onClick={handleFormCancel} className="bg-gray-400 text-white px-2 py-1 rounded mt-1">Cancel</button>
                  </>
                ) : (
                  <>
                    {Array.isArray(f.answers) && f.answers.length > 0 && (
                      <ul className="list-decimal ml-6 mt-1 text-sm text-gray-700 dark:text-gray-300">
                        {f.answers.map((ans, idx) => (
                          <li key={idx}>{ans}</li>
                        ))}
                      </ul>
                    )}
                    <button onClick={() => handleFormEdit(f)} className="ml-2 bg-blue-600 text-white px-2 py-1 rounded">Edit</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mb-2">
        <b>Comments Left:</b>
        {comments.length === 0 ? (
          <span className="ml-2 text-gray-400">None</span>
        ) : (
          <ul className="list-disc ml-6">
            {comments.map(c => (
              <li key={c.$id}>
                {editingCommentId === c.$id ? (
                  <>
                    <input value={commentEdit.content} onChange={handleCommentEditChange} className="border rounded px-2 py-1 mr-2" />
                    <button onClick={() => handleCommentSave(c)} disabled={saving} className="bg-green-600 text-white px-2 py-1 rounded mr-1">Save</button>
                    <button onClick={handleCommentCancel} className="bg-gray-400 text-white px-2 py-1 rounded">Cancel</button>
                  </>
                ) : (
                  <>
                    <span className="text-gray-800 dark:text-gray-200">{c.content}</span>
                    <button onClick={() => handleCommentEdit(c)} className="ml-2 bg-blue-600 text-white px-2 py-1 rounded">Edit</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mb-2">
        <b>Likes:</b>
        {likes.length === 0 ? (
          <span className="ml-2 text-gray-400">None</span>
        ) : (
          <ul className="list-disc ml-6">
            {likes.map(like => {
              // Find the template for this like
              const template = allTemplates.find(t => t.$id === like.templateId);
              return (
                <li key={like.$id}>
                  <span className="text-gray-800 dark:text-gray-200">
                    {template ? template.title : "Unknown Template"}
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

function AdminPage() {
  const { authUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [expandedUserId, setExpandedUserId] = useState(null);

  const dbId = import.meta.env.VITE_APPWRITE_DB_ID;
  const usersCol = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await databases.listDocuments(dbId, usersCol, []);
      setUsers(res.documents);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(u) {
    setEditingId(u.$id);
    setEditForm({ ...u });
  }

  function handleCancel() {
    setEditingId(null);
    setEditForm({});
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const allowed = (({
        name, email, isAdmin, isBlocked
      }) => ({ name, email, isAdmin, isBlocked }))(editForm);
      await databases.updateDocument(dbId, usersCol, editingId, allowed);
      setEditingId(null);
      setEditForm({});
      fetchUsers();
    } catch (err) {
      alert("Failed to update user: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto mt-8 bg-white dark:bg-[#23232a] rounded-xl shadow-lg transition-colors duration-300">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">👨‍💼 Admin Panel</h1>
      {loading ? (
        <p className="text-gray-600 dark:text-gray-300">Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse bg-white dark:bg-[#18181b] rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <thead>
              <tr className="bg-gray-100 dark:bg-[#23232a]">
                <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Name</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Email</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">isAdmin</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">isBlocked</th>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <React.Fragment key={u.$id}>
                  <tr className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#23232a] transition-colors">
                    {editingId === u.$id ? (
                      <>
                        <td className="px-4 py-2"><input name="name" value={editForm.name} onChange={handleChange} className="border rounded px-2 py-1 w-full" /></td>
                        <td className="px-4 py-2"><input name="email" value={editForm.email} onChange={handleChange} className="border rounded px-2 py-1 w-full" /></td>
                        <td className="px-4 py-2"><input type="checkbox" name="isAdmin" checked={!!editForm.isAdmin} onChange={handleChange} /></td>
                        <td className="px-4 py-2"><input type="checkbox" name="isBlocked" checked={!!editForm.isBlocked} onChange={handleChange} /></td>
                        <td className="px-4 py-2 flex gap-2">
                          <button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">Save</button>
                          <button onClick={handleCancel} className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded">Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                          <Link
                            to={`/profile/${u.authUserId}`}
                            className="hover:underline text-blue-600 dark:text-blue-400 cursor-pointer"
                          >
                            {u.name}
                          </Link>
                        </td>
                        <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{u.email}</td>
                        <td className="px-4 py-2">{u.isAdmin ? "✅" : "❌"}</td>
                        <td className="px-4 py-2">{u.isBlocked === true ? "✅" : "❌"}</td>
                        <td className="px-4 py-2 flex gap-2">
                          <button onClick={() => handleEdit(u)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">Edit</button>
                          <button onClick={() => setExpandedUserId(expandedUserId === u.$id ? null : u.$id)} className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded">
                            {expandedUserId === u.$id ? "Hide" : "Details"}
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                  {expandedUserId === u.$id && (
                    <tr>
                      <td colSpan={5}>
                        <UserDetailsPanel user={u} dbId={dbId} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
