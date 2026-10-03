import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    // If the token changes, store it. In a real app we might fetch user details via `/api/user/me`.
    // Since we only have a generic JWT, we rely on the token.
    if (token) {
      localStorage.setItem("token", token);
      // Rough user decode locally (just assuming we have a logged in state)
      setUser({ authenticated: true });
    } else {
      localStorage.removeItem("token");
      setUser(null);
    }
  }, [token]);

  const login = (jwtToken, initUser) => {
    setToken(jwtToken);
    if(initUser) setUser(initUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
