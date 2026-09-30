import { useState } from "react";
import { AuthContext } from "./useAuth";

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(() => {
    try {
      const savedData = JSON.parse(localStorage.getItem("authData") || "null");
      return savedData?.user && savedData?.token
        ? savedData
        : { user: null, token: null };
    } catch {
      return { user: null, token: null };
    }
  });

  const login = (data) => {
    setAuthData(data);
    localStorage.setItem("authData", JSON.stringify(data));
  };

  const logout = () => {
    setAuthData({ user: null, token: null });
    localStorage.removeItem("authData");
  };

  return (
    <AuthContext.Provider value={{ ...authData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
