import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { account, databases } from "../lib/appwrite";

export default function HomePage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // 🔐 Fetch current user (if logged in)
  useEffect(() => {
    account.get()
      .then((u) => setUser(u))
      .catch(() => setUser(null)); // Not logged in
  }, []);

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

  // 🔒 Try to access filled forms page
  const handleViewFilledForms = () => {
    if (!user) {
      alert("⚠️ You must be registered and logged in to view your filled forms.");
      return;
    }
    navigate("/filled-forms");
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#fafafb] py-12">
      <div className="card" style={{ maxWidth: 900, width: "100%", marginBottom: 32 }}>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold text-center md:text-left mb-2 md:mb-0">
            Welcome to the Form Builder
          </h2>
          <div className="flex gap-2 justify-center md:justify-end">
            {!user ? (
              <>
                <button
                  className="px-4 py-1 rounded border bg-white text-sm font-medium"
                  onClick={() => navigate("/register")}
                >
                  Register
                </button>
                <button
                  className="px-4 py-1 rounded border bg-white text-sm font-medium"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
              </>
            ) : (
              <>
                <button
                  className="px-4 py-1 rounded border bg-white text-sm font-medium"
                  onClick={() => navigate("/dashboard")}
                >
                  Dashboard
                </button>
                <button
                  className="px-4 py-1 rounded border bg-white text-sm font-medium"
                  onClick={handleViewFilledForms}
                >
                  Filled Forms
                </button>
              </>
            )}
          </div>
        </div>

        <p className="text-center md:text-left mb-8 text-[#888]">
          Create, share, and analyze custom forms and surveys.
        </p>

        <hr className="my-8" />

        <h3 className="text-lg font-semibold mb-4">Browse Templates</h3>
        <input
          placeholder="Search by title or tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 w-full max-w-md px-3 py-2 border rounded"
        />

        {loading ? (
          <p>Loading...</p>
        ) : filtered.length === 0 ? (
          <p>No templates found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Title</th>
                  <th className="text-left p-2 font-medium">Topic</th>
                  <th className="text-left p-2 font-medium">Tags</th>
                  <th className="p-2 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.$id} className="border-t">
                    <td className="p-2">{t.title}</td>
                    <td className="p-2">{t.topic}</td>
                    <td className="p-2">{(t.tags || []).join(", ")}</td>
                    <td className="p-2 flex gap-2">
                      <button
                        className="text-[#2563eb] font-medium bg-none border-none cursor-pointer"
                        onClick={() => navigate(`/template/${t.$id}`)}
                      >
                        Details
                      </button>
                      <button
                        className="text-[#10b981] font-medium bg-none border-none cursor-pointer"
                        onClick={() => navigate(`/template/${t.$id}/fill`)}
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
  );
}
