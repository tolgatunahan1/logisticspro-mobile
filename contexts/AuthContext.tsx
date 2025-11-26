import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser as loginAppUser, getAdmin, AppUser } from "@/utils/userManagement";

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
      }
    } catch (error) {
      console.error("Failed to load auth:", error);
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
      console.log("Admin data:", admin ? "Found" : "Not found");

      if (!admin) {
        console.error("No admin found in storage");
        return false;
      }

      console.log("Comparing credentials:", {
        inputUsername: trimmedUsername,
        storedUsername: admin.username,
        match: admin.username === trimmedUsername,
      });

      if (admin.username !== trimmedUsername) {
        console.error("Admin username mismatch");
        return false;
      }

      console.log("Comparing passwords:", {
        inputLength: trimmedPassword.length,
        storedLength: admin.password.length,
        match: admin.password === trimmedPassword,
      });

      if (admin.password !== trimmedPassword) {
        console.error("Admin password mismatch");
        return false;
      }

      const userData: User = { username: admin.username, type: "admin" };
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
      console.log("✅ Admin login successful");
      return true;
    } catch (error) {
      console.error("Failed to login admin:", error);
      return false;
    }
  };

  const logout = async () => {
    console.log("🚪 LOGOUT STARTED");
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      console.log("💾 Storage cleared");
      setUser(null);
      console.log("✅ LOGOUT COMPLETE");
    } catch (error) {
      console.error("❌ Logout error:", error);
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
