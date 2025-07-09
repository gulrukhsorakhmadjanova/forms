import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { databases } from "../lib/appwrite";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import TemplateSearchInput from "../components/TemplateSearchInput";
import TemplateTable from "../components/TemplateTable";

export default function HomePage() {
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const { t } = useLanguage();
  const { isDark } = useTheme();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const dbId = import.meta.env.VITE_APPWRITE_DB_ID;
  const templatesCol = import.meta.env.VITE_APPWRITE_TEMPLATES_COLLECTION_ID;

  // Fetch templates on mount
  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await databases.listDocuments(dbId, templatesCol);
        setTemplates(res.documents);
      } catch (err) {
        console.error("Failed to fetch templates:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, [dbId, templatesCol]);

  // Filter templates based on search and public status
  const filtered = templates.filter(
    (t) =>
      t.isPublic &&
      (t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))))
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"}`}>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className={`rounded-xl shadow-xl p-6 border transition-colors duration-300 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-center md:text-left">{t("welcomeToFormBuilder")}</h2>
          </div>

          {/* Description */}
          <p className={`mb-6 text-center md:text-left ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            {t("formBuilderDescription")}
          </p>

          <hr className={`my-6 ${isDark ? "border-gray-700" : "border-gray-200"}`} />

          {/* Search + Templates */}
          <h3 className="text-lg font-semibold mb-4">{t("browseTemplates")}</h3>

          <TemplateSearchInput
            search={search}
            setSearch={setSearch}
            isDark={isDark}
            t={t}
          />

          {/* Template Results */}
          {loading ? (
            <p className={isDark ? "text-gray-300" : "text-gray-600"}>{t("loading")}</p>
          ) : filtered.length === 0 ? (
            <p className={isDark ? "text-gray-400" : "text-gray-500"}>{t("noTemplatesFound")}</p>
          ) : (
            <TemplateTable
              templates={filtered}
              isDark={isDark}
              t={t}
              navigate={navigate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
