import { createContext, useContext, useState } from "react";
import api from "../lib/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("name");
    const id = localStorage.getItem("userId");
    const email = localStorage.getItem("email");
    const className = localStorage.getItem("className");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    return token && role ? { token, role, name, id, email, className } : null;
  });

  // -------------------------
  // LOGIN
  // -------------------------
  const login = async (email, password) => {
    try {
      // POST to /auth/authenticate
      const response = await api.post("/auth/authenticate", { email, password });
      console.log("Backend response:", response.data);

      // The backend uses @JsonProperty("access_token") and "token". We strictly use "token".
      const accessToken = response.data.token || response.data.access_token || response.data.accessToken;
      const { role, name, id, email: returnedEmail, className } = response.data;

      // Save to localStorage
      localStorage.setItem("token", accessToken);
      localStorage.setItem("role", role);
      localStorage.setItem("name", name);
      localStorage.setItem("userId", id);
      const finalEmail = returnedEmail || email;
      localStorage.setItem("email", finalEmail);
      localStorage.setItem("className", className || "");
      setUser({ token: accessToken, role, name, id, email: finalEmail, className: className || "" });

      // Set Axios default Authorization header for future requests
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      return { success: true, role };
    } catch (error) {
      console.error("Login failed", error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || "Login failed" };
    }
  };

  // -------------------------
  // LOGOUT
  // -------------------------
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("className");
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
    window.location.href = "/login";
  };

  return <AuthContext.Provider value={{ user, token: user?.token, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
