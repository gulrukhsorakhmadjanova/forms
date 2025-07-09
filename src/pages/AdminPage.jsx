import React, { useEffect, useState } from "react";
import { Databases, ID, Query } from "appwrite";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Link } from "react-router-dom";
import { databases } from "../lib/appwrite"; 
import PropTypes from "prop-types";
import Toast from "../components/toast";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import UserDetailsPanel from "../components/UserDetailsPanel";

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
                          <td className="px-4 py-2"><input name="name" value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={`border rounded px-2 py-1 w-full transition-colors duration-300 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`} /></td>
                          <td className="px-4 py-2"><input name="email" value={editForm.email || ""} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className={`border rounded px-2 py-1 w-full transition-colors duration-300 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`} /></td>
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
                      <tr><td colSpan={5}><UserDetailsPanel user={u} dbId={dbId} isAdmin={true} /></td></tr>
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
