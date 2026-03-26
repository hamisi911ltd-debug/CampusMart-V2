import React, { createContext, useContext, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetCurrentUser } from "@workspace/api-client-react";

type AuthContextType = {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => 
    localStorage.getItem("campusmart_token")
  );
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: user, isError } = useGetCurrentUser({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("campusmart_token", newToken);
    } else {
      localStorage.removeItem("campusmart_token");
    }
    setTokenState(newToken);
    if (!newToken) {
      queryClient.clear();
    }
  };

  const logout = () => {
    setToken(null);
  };

  useEffect(() => {
    if (isError) {
      setToken(null);
    }
  }, [isError]);

  return (
    <AuthContext.Provider value={{
      token,
      setToken,
      isAuthModalOpen,
      openAuthModal: () => setIsAuthModalOpen(true),
      closeAuthModal: () => setIsAuthModalOpen(false),
      logout,
      isAuthenticated: !!user && !!token,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
