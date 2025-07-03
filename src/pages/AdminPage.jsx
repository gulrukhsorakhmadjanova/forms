import React, { useEffect, useState } from "react";
import { databases } from "../lib/appwrite"; // adjust path as needed
import { useAuth } from "../App"; // to reuse auth context
import { ID } from "appwrite";

function AdminPage() {
  const { authUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const dbId = import.meta.env.VITE_APPWRITE_DB_ID;
  const usersCol = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await databases.listDocuments(dbId, usersCol, []);
        setUsers(res.documents);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>👨‍💼 Admin Panel</h1>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>isAdmin</th>
              <th>isApproved</th>
              <th>isBlocked</th>
              <th>Language</th>
              <th>Theme</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.$id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.isAdmin ? "✅" : "❌"}</td>
                <td>{u.isApproved ? "✅" : "❌"}</td>
                <td>{u.isBlocked ? "🚫" : "✅"}</td>
                <td>{u.language || "—"}</td>
                <td>{u.theme || "—"}</td>
                <td>
                  {/* Optional: buttons for update/delete */}
                  {/* <button>Block</button> <button>Approve</button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminPage;
