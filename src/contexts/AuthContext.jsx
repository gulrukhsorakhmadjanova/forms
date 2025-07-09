import React, { createContext, useContext, useEffect, useState } from "react";
import { account, databases } from "../lib/appwrite";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const user = await account.get();
        const userId = user.$id;

        const dbId = import.meta.env.VITE_APPWRITE_DB_ID;
        const usersCol = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;
        const res = await databases.listDocuments(dbId, usersCol);
        const dbUser = res.documents.find((u) => u.authUserId === userId);

        if (dbUser) {
          setAuthUser({
            userId,
            name: dbUser.name,
            email: dbUser.email,
            isAdmin: dbUser.isAdmin,
            isBlocked: dbUser.isBlocked,
          });
        } else {
          setAuthUser(null);
        }
      } catch (err) {
        setAuthUser(null);
      }
      setLoading(false);
    }

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
