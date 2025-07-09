import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { databases } from "../lib/appwrite";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { ID } from "appwrite";
import TemplateHeader from "../components/TemplateHeader";
import TemplateLikeSection from "../components/TemplateLikeSection";
import TemplateLikedBy from "../components/TemplateLikedBy";
import TemplateQuestionsList from "../components/TemplateQuestionsList";
import TemplateCommentsList from "../components/TemplateCommentsList";

export default function TemplateViewPage() {
  const { id } = useParams();
  const { authUser } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const [template, setTemplate] = useState(null);
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [hasLiked, setHasLiked] = useState(false);
  const [likeDocId, setLikeDocId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dbId = import.meta.env.VITE_APPWRITE_DB_ID;
  const templatesCol = import.meta.env.VITE_APPWRITE_TEMPLATES_COLLECTION_ID;
  const likesCol = import.meta.env.VITE_APPWRITE_LIKES_COLLECTION_ID;
  const commentsCol = import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID;
  const questionsCol = import.meta.env.VITE_APPWRITE_QUESTIONS_COLLECTION_ID;
  const usersCol = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;

  useEffect(() => {
    async function fetchData() {
      try {
        const tempRes = await databases.getDocument(dbId, templatesCol, id);
        setTemplate(tempRes);

        const [likesRes, commentsRes, questionsRes, usersRes] = await Promise.all([
          databases.listDocuments(dbId, likesCol),
          databases.listDocuments(dbId, commentsCol),
          databases.listDocuments(dbId, questionsCol),
          databases.listDocuments(dbId, usersCol),
        ]);

        const templateLikes = likesRes.documents.filter((l) => l.templateId === id);
        const templateComments = commentsRes.documents.filter((c) => c.templateId === id);
        const templateQuestions = questionsRes.documents
          .filter((q) => q.templateId === id)
          .sort((a, b) => a.order - b.order);

        const userMap = {};
        usersRes.documents.forEach((u) => {
          userMap[u.authUserId] = u.name;
        });

        setLikes(templateLikes);
        setComments(templateComments);
        setQuestions(templateQuestions);
        setUsersMap(userMap);

        if (authUser) {
          const like = templateLikes.find((l) => l.userId === authUser.userId);
          if (like) {
            setHasLiked(true);
            setLikeDocId(like.$id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch template details:", err);
        setError("Failed to load template details");
      }
    }

    fetchData();
  }, [id, authUser]);

  const handleLike = async () => {
    if (!authUser) {
      alert("Please log in to like templates.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (hasLiked) {
        // Unlike: Delete the like document
        await databases.deleteDocument(dbId, likesCol, likeDocId);
        setLikes((prev) => prev.filter((l) => l.$id !== likeDocId));
        setHasLiked(false);
        setLikeDocId(null);
      } else {
        // Like: Create a new like document
        const newLike = await databases.createDocument(
          dbId, 
          likesCol, 
          ID.unique(), 
          {
            templateId: id,
            userId: authUser.userId,
          }
        );
        setLikes((prev) => [...prev, newLike]);
        setHasLiked(true);
        setLikeDocId(newLike.$id);
      }
    } catch (err) {
      console.error("Like/Unlike error:", err);
      setError(err.message || "Failed to update like status");
    } finally {
      setLoading(false);
    }
  };

  if (!template) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
        <div className={`p-6 text-center ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`max-w-4xl mx-auto p-8 rounded-xl shadow-lg mt-0 space-y-8 transition-colors duration-300 ${
        isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
      }`}>
        <TemplateHeader template={template} isDark={isDark} t={t} />

        {/* Error Message */}
        {error && (
          <div className={`px-4 py-3 rounded transition-colors duration-300 ${
            isDark ? 'bg-red-900 text-red-200 border border-red-700' : 'bg-red-100 text-red-700 border border-red-400'
          }`}>
            {error}
          </div>
        )}

        <TemplateLikeSection
          authUser={authUser}
          handleLike={handleLike}
          hasLiked={hasLiked}
          loading={loading}
          likes={likes}
          isDark={isDark}
          t={t}
        />

        <TemplateLikedBy likes={likes} usersMap={usersMap} isDark={isDark} t={t} />

        <TemplateQuestionsList questions={questions} isDark={isDark} t={t} />

        <TemplateCommentsList comments={comments} usersMap={usersMap} isDark={isDark} t={t} />
      </div>
    </div>
  );
}