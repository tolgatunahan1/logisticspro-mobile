import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser as loginAppUser, getAdmin, AppUser } from "../utils/userManagement";

interface User {
  id?: string;
  username: string;
  type: "admin" | "user";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginUser: (username: string, password: string) => Promise<boolean>;
  loginAdmin: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "@logistics_current_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth);
        setUser(parsed);
      } else {
        const defaultUser: User = { username: "LogisticsPRO", type: "user" };
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultUser));
        setUser(defaultUser);
      }
    } catch (error) {
      console.error("Failed to load auth:", error);
      const defaultUser: User = { username: "LogisticsPRO", type: "user" };
      setUser(defaultUser);
    } finally {
      setIsLoading(false);
    }
  };

  const loginUser = async (username: string, password: string): Promise<boolean> => {
    if (!username.trim() || !password.trim()) return false;

    try {
      const appUser = await loginAppUser(username, password);
      if (appUser) {
        const userData: User = { id: appUser.id, username: appUser.username, type: "user" };
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to login user:", error);
      return false;
    }
  };

  const loginAdmin = async (username: string, password: string): Promise<boolean> => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      console.error("Admin login: Empty username or password");
      return false;
    }

    try {
      const admin = await getAdmin();

      if (!admin) {
        return false;
      }

      if (admin.username !== trimmedUsername) {
        return false;
      }

      if (admin.password !== trimmedPassword) {
        return false;
      }

      const userData: User = { username: admin.username, type: "admin" };
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
    } catch (error) {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginUser, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
