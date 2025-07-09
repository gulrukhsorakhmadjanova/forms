import React, { useEffect, useState } from "react";
import { databases } from "../lib/appwrite";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Query } from "appwrite";
import ProfileTemplatesList from "../components/ProfileTemplatesList";
import ProfileFormsList from "../components/ProfileFormsList";

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
        }
      } catch (err) {}
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
        {tab === "templates" ? (
          <ProfileTemplatesList
            templates={templates}
            likesMap={likesMap}
            commentsMap={commentsMap}
            usersMap={usersMap}
            isDark={isDark}
            t={t}
          />
        ) : (
          <ProfileFormsList
            forms={forms}
            usersMap={usersMap}
            isDark={isDark}
            t={t}
          />
        )}
      </div>
    </div>
  );
}