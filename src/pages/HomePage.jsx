import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { account, databases } from "../lib/appwrite";
import { useAuth } from "../App";

export default function HomePage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { authUser: user } = useAuth();

  // 📦 Fetch templates
  useEffect(() => {
    async function fetchTemplates() {
      setLoading(true);
      try {
        const res = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DB_ID,
          import.meta.env.VITE_APPWRITE_TEMPLATES_COLLECTION_ID,
          []
        );
        setTemplates(res.documents);
      } catch {
        setTemplates([]);
      }
      setLoading(false);
    }
    fetchTemplates();
  }, []);

  const filtered = templates.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="min-h-screen bg-[#fafafb] dark:bg-[#18181b] text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-[#23232a] rounded-xl shadow-xl p-6 transition-colors duration-300">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-center md:text-left">
              Welcome to the Form Builder
            </h2>
            <div className="flex gap-2" />
          </div>

          <p className="mb-6 text-gray-600 dark:text-gray-300 text-center md:text-left">
            Create, share, and analyze custom forms and surveys.
          </p>

          <hr className="my-6 border-gray-200 dark:border-gray-700" />

          <h3 className="text-lg font-semibold mb-4">Browse Templates</h3>

          <input
            type="text"
            placeholder="Search by title or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-6 w-full max-w-md px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-[#18181b] text-gray-900 dark:text-gray-100"
          />

          {loading ? (
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No templates found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white dark:bg-[#18181b] rounded shadow-2xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <thead>
                  <tr className="bg-gray-100 dark:bg-[#23232a]">
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-200">Title</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-200">Topic</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-200">Tags</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr
                      key={t.$id}
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#23232a] transition-colors"
                    >
                      <td className="p-3 text-gray-900 dark:text-gray-100">{t.title}</td>
                      <td className="p-3 text-gray-900 dark:text-gray-100">{t.topic}</td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">
                        {(t.tags || []).join(", ")}
                      </td>
                      <td className="p-3 flex gap-2">
                        <button
                          onClick={() => navigate(`/template/${t.$id}`)}
                          className="text-blue-600 dark:text-blue-400 font-medium"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => navigate(`/template/${t.$id}/fill`)}
                          className="text-green-600 dark:text-green-400 font-medium"
                        >
                          Fill
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
