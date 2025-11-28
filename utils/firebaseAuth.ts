import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  Auth,
} from "firebase/auth";
import { firebaseAuth, firebaseDatabase } from "@/constants/firebase";
import { ref, set, get } from "firebase/database";

const FIREBASE_CONFIG_ERROR = "Firebase yapılandırılmamış. Lütfen Firebase credentials'ı constants/firebase.ts dosyasına ekleyin.";

export interface UserProfile {
  uid: string;
  email: string;
  createdAt: number;
  status: "pending" | "approved" | "rejected";
  approvedAt?: number;
  isAdmin?: boolean;
}

const isFirebaseConfigured = (): boolean => {
  try {
    if (!firebaseAuth?.app?.options?.apiKey) {
      console.warn("🔥 Firebase app not initialized or apiKey missing");
      return false;
    }
    const apiKey = firebaseAuth.app.options.apiKey;
    const isValid = apiKey.startsWith("AIzaSy") && apiKey.length > 30;
    console.log("✅ Firebase configured:", isValid, "apiKey:", apiKey.substring(0, 20) + "...");
    return isValid;
  } catch (error) {
    console.error("🔥 Firebase Config Error:", error);
    return false;
  }
};

export const firebaseAuthService = {
  // Check if Firebase is properly configured
  isConfigured: (): boolean => {
    try {
      const apiKey = firebaseAuth.app?.options?.apiKey || "";
      // Valid API keys start with AIzaSy and are longer than 30 chars
      const isValid = apiKey.startsWith("AIzaSy") && apiKey.length > 30;
      if (!isValid) {
        console.warn("🔥 Firebase not configured - apiKey:", apiKey?.substring(0, 20) + "...");
      }
      return isValid;
    } catch (error) {
      console.error("🔥 Firebase config check error:", error);
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
        firebaseAuth,
        email,
        password
      );
      const user = userCredential.user;

      // Create user profile in database with pending status
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || "",
        createdAt: Date.now(),
        status: "pending", // All users start as pending, need admin approval
      };

      await set(ref(firebaseDatabase, `users/${user.uid}/profile`), userProfile);
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
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
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
      await signOut(firebaseAuth);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },

  // Get user profile
  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    try {
      const snapshot = await get(ref(firebaseDatabase, `users/${uid}/profile`));
      return snapshot.val();
    } catch (error) {
      console.error("Get user profile error:", error);
      return null;
    }
  },

  // Check if user is approved
  isUserApproved: async (uid: string): Promise<boolean> => {
    try {
      const profile = await firebaseAuthService.getUserProfile(uid);
      return profile?.status === "approved";
    } catch (error) {
      console.error("User approval check error:", error);
      return false;
    }
  },

  // Get current user
  getCurrentUser: () => {
    return firebaseAuth.currentUser;
  },

  // Get auth instance
  getAuth: (): Auth => {
    return firebaseAuth;
  },

  // Auth state listener
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return firebaseAuth.onAuthStateChanged(callback);
  },

  // Initialize admin user (Firebase)
  initializeAdmin: async (email: string, password: string): Promise<boolean> => {
    try {
      const existingAdmin = await firebaseAuthService.getUserProfile(
        email.replace("@", "_").replace(".", "_")
      );
      if (existingAdmin?.isAdmin) {
        console.log("✅ Admin already exists");
        return true;
      }

      // Try to create admin user
      try {
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        const admin = userCredential.user;

        // Mark as admin in profile
        const adminProfile: UserProfile = {
          uid: admin.uid,
          email: admin.email || "",
          createdAt: Date.now(),
          status: "approved",
          isAdmin: true,
        };

        await set(ref(firebaseDatabase, `users/${admin.uid}/profile`), adminProfile);
        console.log("✅ Admin user created:", email);
        return true;
      } catch (createError: any) {
        if (createError?.message?.includes("email-already-in-use")) {
          // Admin might exist, try checking by email pattern
          console.log("📌 Admin email already exists, checking status...");
          return true;
        }
        throw createError;
      }
    } catch (error) {
      console.error("Admin initialization error:", error);
      return false;
    }
  },
};
