import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { getSession } from "../services/auth";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await getSession();

        console.log("SESSION DATA:", data);

        if (data.success && data.data?.user) {
          setUser(data.data.user); // logged in
        } else {
          setUser(null); // not logged in
        }
      } catch (error) {
        console.error("Auth error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const navigate = useNavigate();

  const logout = async () => {
    try {
      await fetch("/api/auth/logout.php", {
        method: "POST",
        credentials: "include",
      });

      setUser(null);
      navigate("/");
    } catch (err) {
      console.error("Logout error: ", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
