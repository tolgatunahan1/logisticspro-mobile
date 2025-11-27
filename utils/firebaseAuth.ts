import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  Auth,
  getAuth,
} from "firebase/auth";
import { auth, database } from "@/constants/firebase";
import { ref, set, get } from "firebase/database";

const FIREBASE_CONFIG_ERROR = "Firebase yapılandırılmamış. Lütfen Firebase credentials'ı constants/firebase.ts dosyasına ekleyin.";

export interface UserProfile {
  uid: string;
  email: string;
  createdAt: number;
}

const isFirebaseConfigured = (): boolean => {
  const apiKey = auth.app.options.apiKey;
  return !apiKey?.includes("AIzaSy") || !apiKey?.includes("X");
};

export const firebaseAuthService = {
  // Check if Firebase is properly configured
  isConfigured: (): boolean => {
    try {
      const apiKey = auth.app.options.apiKey || "";
      // Test keys have placeholder values
      return !apiKey.includes("X") && apiKey.length > 20;
    } catch {
      return false;
    }
  },

  // Register
  register: async (email: string, password: string): Promise<User | null> => {
    try {
      if (!firebaseAuthService.isConfigured()) {
        throw new Error(FIREBASE_CONFIG_ERROR);
      }
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Create user profile in database
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || "",
        createdAt: Date.now(),
      };

      await set(ref(database, `users/${user.uid}/profile`), userProfile);
      return user;
    } catch (error: any) {
      console.error("Firebase register error:", error?.message);
      if (error?.message?.includes("api-key-not-valid")) {
        throw new Error(FIREBASE_CONFIG_ERROR);
      }
      throw error;
    }
  },

  // Login
  login: async (email: string, password: string): Promise<User | null> => {
    try {
      if (!firebaseAuthService.isConfigured()) {
        throw new Error(FIREBASE_CONFIG_ERROR);
      }
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      console.error("Firebase login error:", error?.message);
      if (error?.message?.includes("api-key-not-valid")) {
        throw new Error(FIREBASE_CONFIG_ERROR);
      }
      throw error;
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },

  // Get user profile
  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    try {
      const snapshot = await get(ref(database, `users/${uid}/profile`));
      return snapshot.val();
    } catch (error) {
      console.error("Get user profile error:", error);
      return null;
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Get auth instance
  getAuth: (): Auth => {
    return auth;
  },

  // Auth state listener
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return auth.onAuthStateChanged(callback);
  },
};
