import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "../constants/firebase";
import { firebaseAuthService } from "../utils/firebaseAuth";

interface User {
  id?: string;
  email: string;
  type: "admin" | "user";
  firebaseUid: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  loginWithFirebase: (email: string, password: string) => Promise<boolean>;
  registerWithFirebase: (email: string, password: string) => Promise<boolean>;
  loginAdmin: (email: string, password: string) => Promise<boolean>;
  createAdmin: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Firebase Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (authUser) => {
      if (authUser) {
        // Kullanıcı Firebase'de giriş yapmış
        // Eğer admin ise admin dashboard'a, user ise user dashboard'a git
        const isAdmin = await firebaseAuthService.isUserAdmin(authUser.uid);
        const userData: User = {
          email: authUser.email || "",
          type: isAdmin ? "admin" : "user",
          firebaseUid: authUser.uid,
        };
        setFirebaseUser(authUser);
        setUser(userData);
      } else {
        // Kullanıcı Firebase'de giriş yapmamış
        setFirebaseUser(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithFirebase = async (email: string, password: string): Promise<boolean> => {
    try {
      const fbUser = await firebaseAuthService.login(email, password);
      if (fbUser) {
        // Kullanıcı onaylanmış mı kontrol et
        const isApproved = await firebaseAuthService.isUserApproved(fbUser.uid);
        if (!isApproved) {
          await firebaseAuthService.logout();
          throw new Error("Admin onayı bekleniyor. Lütfen kısa bir süre sonra tekrar deneyin.");
        }
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  };

  const registerWithFirebase = async (email: string, password: string): Promise<boolean> => {
    try {
      const fbUser = await firebaseAuthService.register(email, password);
      if (fbUser) {
        // Kullanıcı kaydedildi, admin onayını bekliyor
        await firebaseAuthService.logout();
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  };

  const loginAdmin = async (email: string, password: string): Promise<boolean> => {
    try {
      const fbUser = await firebaseAuthService.login(email, password);
      if (fbUser) {
        // Admin hesabı kontrol et
        const isAdmin = await firebaseAuthService.isUserAdmin(fbUser.uid);
        if (isAdmin) {
          return true;
        } else {
          await firebaseAuthService.logout();
          throw new Error("Admin hesabı değil");
        }
      }
      return false;
    } catch (error) {
      console.error("Admin login error:", error);
      throw error;
    }
  };

  const createAdmin = async (email: string, password: string): Promise<boolean> => {
    try {
      const success = await firebaseAuthService.initializeAdmin(email, password);
      return success;
    } catch (error) {
      console.error("Create admin error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseAuthService.logout();
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error("Logout error:", error);
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
        loginWithFirebase,
        registerWithFirebase,
        loginAdmin,
        createAdmin,
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
