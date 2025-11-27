import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser as loginAppUser, getAdmin, AppUser } from "../utils/userManagement";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { firebaseAuthService } from "../utils/firebaseAuth";
import { createHybridAdapter, setStorageAdapter } from "../utils/firebaseStorage";

interface User {
  id?: string;
  username: string;
  type: "admin" | "user";
  firebaseUid?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  loginUser: (username: string, password: string) => Promise<boolean>;
  loginAdmin: (username: string, password: string) => Promise<boolean>;
  loginWithFirebase: (email: string, password: string) => Promise<boolean>;
  registerWithFirebase: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "@logistics_current_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuthService.getAuth(), (authUser) => {
      setFirebaseUser(authUser);
      if (!authUser) {
        loadStoredAuth();
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth);
        setUser(parsed);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to load auth:", error);
      setUser(null);
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
      return false;
    }

    try {
      const admin = await getAdmin();

      if (!admin) {
        return false;
      }

      if (admin.username !== trimmedUsername || admin.password !== trimmedPassword) {
        return false;
      }

      const userData: User = { username: admin.username, type: "admin" };
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (error) {
      console.error("Admin login error:", error);
      return false;
    }
  };

  const loginWithFirebase = async (email: string, password: string): Promise<boolean> => {
    try {
      const fbUser = await firebaseAuthService.login(email, password);
      if (fbUser) {
        setFirebaseUser(fbUser);
        // Set hybrid storage adapter with Firebase + local fallback
        const hybridAdapter = createHybridAdapter(fbUser.uid);
        setStorageAdapter(hybridAdapter);
        console.log("✅ Firebase user logged in:", fbUser.email, "- Cloud sync enabled");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Firebase login error:", error);
      return false;
    }
  };

  const registerWithFirebase = async (email: string, password: string): Promise<boolean> => {
    try {
      const fbUser = await firebaseAuthService.register(email, password);
      if (fbUser) {
        setFirebaseUser(fbUser);
        // Set hybrid storage adapter with Firebase + local fallback
        const hybridAdapter = createHybridAdapter(fbUser.uid);
        setStorageAdapter(hybridAdapter);
        console.log("✅ Firebase user registered:", fbUser.email, "- Cloud sync enabled");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Firebase register error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      await firebaseAuthService.logout();
      setUser(null);
      setFirebaseUser(null);
      // Reset to local-only storage
      const hybridAdapter = createHybridAdapter(null);
      setStorageAdapter(hybridAdapter);
    } catch (error) {
      setUser(null);
      setFirebaseUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        loginUser,
        loginAdmin,
        loginWithFirebase,
        registerWithFirebase,
        logout,
      }}
    >
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
