import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { databases } from "../lib/appwrite";
import { useAuth, useTheme, useLanguage } from "../App";

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

          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`mb-6 w-full max-w-md px-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
              isDark
                ? "bg-gray-900 text-gray-100 border-gray-600 focus:ring-blue-400"
                : "bg-white text-gray-900 border-gray-300 focus:ring-blue-500"
            }`}
          />

          {/* Template Results */}
          {loading ? (
            <p className={isDark ? "text-gray-300" : "text-gray-600"}>{t("loading")}</p>
          ) : filtered.length === 0 ? (
            <p className={isDark ? "text-gray-400" : "text-gray-500"}>{t("noTemplatesFound")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className={`w-full border-collapse rounded-xl shadow-2xl border transition-colors duration-300 ${
                isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
              }`}>
                <thead>
                  <tr className={isDark ? "bg-gray-800" : "bg-gray-50"}>
                    <th className={`text-left p-3 font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>{t("title")}</th>
                    <th className={`text-left p-3 font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>{t("topic")}</th>
                    <th > </th>
                    <th className={`text-left p-3 font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((template) => (
                    <tr
                      key={template.$id}
                      className={`border-t transition-all duration-200 ${
                        isDark ? "border-gray-700 hover:bg-gray-800" : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <td className={`p-3 ${isDark ? "text-gray-100" : "text-gray-900"}`}>{template.title}</td>
                      <td className={`p-3 ${isDark ? "text-gray-100" : "text-gray-900"}`}>{template.topic}</td>
                      <td className={`p-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}>{(template.tags || []).join(", ")}</td>
                      <td className="p-3 flex gap-2">
                        <button
                          onClick={() => navigate(`/template/${template.$id}`)}
                          className={`font-medium px-2 py-1 rounded transition-colors ${
                            isDark
                              ? "text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                              : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          }`}
                        >
                          {t("details")}
                        </button>
                        <button
                          onClick={() => navigate(`/template/${template.$id}/fill`)}
                          className={`font-medium px-2 py-1 rounded transition-colors ${
                            isDark
                              ? "text-green-400 hover:text-green-300 hover:bg-green-900/20"
                              : "text-green-600 hover:text-green-800 hover:bg-green-50"
                          }`}
                        >
                          {t("fill")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
