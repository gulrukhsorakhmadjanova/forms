import React, { useEffect, useState } from "react";
import { databases } from "../lib/appwrite";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth, useTheme, useLanguage } from "../App";
import { Query } from "appwrite";

export default function UserProfilePage() {
  const { userId } = useParams();
  const { authUser } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();
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

  
      try {
        const userQueryRes = await databases.listDocuments(dbId, usersCol, [
          Query.equal("authUserId", viewingUserId),
        ]);
        if (userQueryRes.documents.length > 0) {
          const userDoc = userQueryRes.documents[0];
          setIsAdmin(userDoc.role === "admin");
        } else {
          console.warn("User document not found for:", viewingUserId);
        }
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
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"}`}>
      <div className={`max-w-4xl mx-auto mt-0 rounded-xl shadow-lg p-6 transition-colors duration-300 ${
        isDark ? "bg-gray-900 text-gray-100 border border-gray-700" : "bg-white text-gray-900 border border-gray-200"
      }`}>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            {userId && authUser?.userId !== userId ? t("userProfile") : t("myProfile")}
          </h2>
          {authUser && (
            <button
              onClick={() => navigate("/filled-forms")}
              className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
            >
              {t("viewFilledForms")}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTab("templates")}
            className={`px-4 py-2 rounded font-semibold transition-colors duration-300 ${
              tab === "templates"
                ? "bg-blue-600 text-white"
                : isDark
                ? "bg-gray-900 text-gray-100"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            {t("templates")}
          </button>
          <button
            onClick={() => setTab("forms")}
            className={`px-4 py-2 rounded font-semibold transition-colors duration-300 ${
              tab === "forms"
                ? "bg-blue-600 text-white"
                : isDark
                ? "bg-gray-900 text-gray-100"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            {t("forms")}
          </button>
        </div>

        {/* Main Content */}
        {tab === "templates" ? (
          templates.length === 0 ? (
            <p className={isDark ? "text-gray-300" : "text-gray-700"}>{t("noTemplatesFound")}</p>
          ) : (
            templates.map((template) => (
              <div
                key={template.$id}
                className={`mb-6 p-4 border rounded transition-colors duration-300 ${
                  isDark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"
                }`}
              >
                <h3 className="text-xl font-bold">{template.title}</h3>
                <p className={isDark ? "text-gray-300" : "text-gray-700"}>{template.description}</p>
                <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  {t("visibility")}: <b>{template.isPublic ? t("public") : t("private")}</b>
                </p>

                <div className="mt-2">
                  <p className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>{t("likes")}:</p>
                  <ul className={`list-disc ml-5 text-sm ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                    {(likesMap[template.$id] || []).map((like) => (
                      <li key={like.$id}>{usersMap[like.userId] || like.userId}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-2">
                  <p className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>{t("comments")}:</p>
                  <ul className={`list-disc ml-5 text-sm ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                    {(commentsMap[template.$id] || []).map((comment) => (
                      <li key={comment.$id}>{usersMap[comment.userId] || comment.userId}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          )
        ) : forms.length === 0 ? (
          <p className={isDark ? "text-gray-300" : "text-gray-700"}>{t("noFormsFound")}</p>
        ) : (
          forms.map((form) => (
            <div
              key={form.$id}
              className={`mb-6 p-4 border rounded transition-colors duration-300 ${
                isDark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"
              }`}
            >
              <p className={`text-sm mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                {t("filledBy")}: {usersMap[form.createdBy] || form.createdBy}
              </p>
              <div className="mt-2">
                <p className={`font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>{t("answers")}:</p>
                <ul className={`list-disc ml-6 text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  {(form.answers || []).map((ans, i) => (
                    <li key={i}>{ans}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
