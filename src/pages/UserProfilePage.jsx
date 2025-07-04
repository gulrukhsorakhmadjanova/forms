import React, { useEffect, useState } from "react";
import { databases } from "../lib/appwrite";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { Query } from "appwrite";

export default function UserProfilePage() {
  const { userId } = useParams();
  const { authUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("templates");

  const [templates, setTemplates] = useState([]);
  const [forms, setForms] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [commentsMap, setCommentsMap] = useState({});
  const [likesMap, setLikesMap] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);

  const dbId = import.meta.env.VITE_APPWRITE_DB_ID;
  const templatesCol = import.meta.env.VITE_APPWRITE_TEMPLATES_COLLECTION_ID;
  const formsCol = import.meta.env.VITE_APPWRITE_FORMS_COLLECTION_ID;
  const commentsCol = import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID;
  const likesCol = import.meta.env.VITE_APPWRITE_LIKES_COLLECTION_ID;
  const usersCol = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;

  useEffect(() => {
    if (!authUser && !userId) return;

    const fetchData = async () => {
      const viewingUserId = userId || authUser?.userId;

      // 🔍 Check if current user is admin
      try {
        const userDoc = await databases.getDocument(dbId, usersCol, viewingUserId);
        setIsAdmin(userDoc.role === "admin");
      } catch (err) {
        console.warn("Could not fetch user role:", err);
      }

      const templatesRes = await databases.listDocuments(dbId, templatesCol, [
        Query.equal("createdBy", viewingUserId),
      ]);
      setTemplates(templatesRes.documents);

      const myTemplateIds = templatesRes.documents.map((t) => t.$id);

      const formsRes = await databases.listDocuments(dbId, formsCol, [
        Query.equal("templateId", myTemplateIds),
      ]);
      setForms(formsRes.documents);

      const [likesRes, commentsRes, usersRes] = await Promise.all([
        databases.listDocuments(dbId, likesCol, [
          Query.equal("templateId", myTemplateIds),
        ]),
        databases.listDocuments(dbId, commentsCol, [
          Query.equal("templateId", myTemplateIds),
        ]),
        databases.listDocuments(dbId, usersCol),
      ]);

      const uMap = {};
      usersRes.documents.forEach((u) => {
        uMap[u.authUserId] = u.name;
      });
      setUsersMap(uMap);

      const lMap = {};
      likesRes.documents.forEach((like) => {
        if (!lMap[like.templateId]) lMap[like.templateId] = [];
        lMap[like.templateId].push(like);
      });
      setLikesMap(lMap);

      const cMap = {};
      commentsRes.documents.forEach((comment) => {
        if (!cMap[comment.templateId]) cMap[comment.templateId] = [];
        cMap[comment.templateId].push(comment);
      });
      setCommentsMap(cMap);
    };

    fetchData();
  }, [authUser, userId]);

  return (
    <div className="card max-w-4xl mx-auto mt-8 bg-white dark:bg-[#23232a] rounded-xl shadow-lg transition-colors duration-300 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {userId && authUser?.userId !== userId ? `User Profile` : `My Profile`}
        </h2>

        <div className="flex gap-2">
          {authUser && (
            <button
              onClick={() => navigate("/filled-forms")}
              className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
            >
              View Filled Forms
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => navigate("/admin")}
              className="px-4 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
            >
              Admin Panel
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTab("templates")}
          className={`px-4 py-2 rounded font-semibold transition-colors ${
            tab === "templates"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-[#18181b] text-gray-900 dark:text-gray-100"
          }`}
        >
          Templates
        </button>
        <button
          onClick={() => setTab("forms")}
          className={`px-4 py-2 rounded font-semibold transition-colors ${
            tab === "forms"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-[#18181b] text-gray-900 dark:text-gray-100"
          }`}
        >
          Forms
        </button>
      </div>

      {tab === "templates" ? (
        templates.length === 0 ? (
          <p className="text-gray-700 dark:text-gray-300">No templates found.</p>
        ) : (
          templates.map((t) => (
            <div key={t.$id} className="mb-6 p-4 border rounded bg-white dark:bg-[#1f1f24]">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t.title}</h3>
              <p className="text-gray-700 dark:text-gray-300">{t.description}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Visibility: <b>{t.isPublic ? "Public" : "Private"}</b>
              </p>

              <div className="mt-2">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Likes:</p>
                <ul className="list-disc ml-5 text-sm text-blue-600 dark:text-blue-400">
                  {(likesMap[t.$id] || []).map((like) => (
                    <li key={like.$id}>{usersMap[like.userId] || like.userId}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-2">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Comments:</p>
                <ul className="list-disc ml-5 text-sm text-gray-800 dark:text-gray-200">
                  {(commentsMap[t.$id] || []).map((c) => (
                    <li key={c.$id}>{usersMap[c.userId] || c.userId}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        )
      ) : (
        forms.length === 0 ? (
          <p className="text-gray-700 dark:text-gray-300">No forms found.</p>
        ) : (
          forms.map((f) => (
            <div key={f.$id} className="mb-6 p-4 border rounded bg-white dark:bg-[#1f1f24]">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                Filled by: {usersMap[f.createdBy] || f.createdBy}
              </p>
              <div className="mt-2">
                <p className="font-semibold text-gray-800 dark:text-gray-200">Answers:</p>
                <ul className="list-disc ml-6 text-sm text-gray-700 dark:text-gray-300">
                  {(f.answers || []).map((ans, i) => (
                    <li key={i}>{ans}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        )
      )}
    </div>
  );
}
