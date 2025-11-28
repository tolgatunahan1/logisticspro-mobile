import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser as loginAppUser, getAdmin, AppUser } from "../utils/userManagement";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "../constants/firebase";
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
    const unsubscribe = onAuthStateChanged(firebaseAuth, (authUser) => {
      setFirebaseUser(authUser);
      if (authUser) {
        // Firebase kullanıcısı giriş yapmış - user state'i güncelle
        const userData: User = {
          username: authUser.email || "Firebase User",
          type: "user",
          firebaseUid: authUser.uid,
          email: authUser.email || "",
        };
        setUser(userData);
      } else {
        // Firebase kullanıcısı çıkmış - local storage'dan yükle
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

  const loginAdmin = async (email: string, password: string): Promise<boolean> => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      return false;
    }

    try {
      // Admin also uses Firebase now
      const fbUser = await firebaseAuthService.login(trimmedEmail, trimmedPassword);
      if (fbUser) {
        // Check if this user is an admin (stored in Firebase)
        const adminProfile = await firebaseAuthService.getUserProfile(fbUser.uid);
        if (adminProfile?.isAdmin) {
          setFirebaseUser(fbUser);
          const userData: User = { username: fbUser.email || "Admin", type: "admin", firebaseUid: fbUser.uid };
          await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
          setUser(userData);
          // Set hybrid storage adapter
          const hybridAdapter = createHybridAdapter(fbUser.uid);
          setStorageAdapter(hybridAdapter);
          console.log("✅ Admin logged in via Firebase:", fbUser.email);
          return true;
        } else {
          console.log("❌ User is not admin");
        }
      }
      return false;
    } catch (error) {
      console.error("Admin login error:", error);
      return false;
    }
  };

  const loginWithFirebase = async (email: string, password: string): Promise<boolean> => {
    try {
      const fbUser = await firebaseAuthService.login(email, password);
      if (fbUser) {
        // Check if user is approved
        const isApproved = await firebaseAuthService.isUserApproved(fbUser.uid);
        if (!isApproved) {
          console.log("❌ User not approved yet. Waiting for admin approval.");
          // Logout user if not approved
          await firebaseAuthService.logout();
          throw new Error("Kullanıcı henüz onaylanmamıştır. Admin onayı bekleniyor.");
        }

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
      throw error;
    }
  };

  const registerWithFirebase = async (email: string, password: string): Promise<boolean> => {
    try {
      const fbUser = await firebaseAuthService.register(email, password);
      if (fbUser) {
        // User is registered with pending status - don't auto-login
        console.log("✅ Firebase user registered:", fbUser.email, "- Pending admin approval");
        // Logout immediately since user needs approval
        await firebaseAuthService.logout();
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
