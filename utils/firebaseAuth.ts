import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  Auth,
} from "firebase/auth";
import { firebaseAuth, firebaseDatabase } from "@/constants/firebase";
import { ref, set, get, update, remove } from "firebase/database";

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

  // Update user profile
  updateUserProfile: async (uid: string, updates: Partial<UserProfile>): Promise<boolean> => {
    try {
      await update(ref(firebaseDatabase, `users/${uid}/profile`), updates);
      return true;
    } catch (error) {
      console.error("Update user profile error:", error);
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

  // Clean up all users from database
  cleanupDatabase: async (): Promise<boolean> => {
    try {
      await remove(ref(firebaseDatabase, "users"));
      console.log("✅ Database cleaned up - all users removed");
      return true;
    } catch (error) {
      console.error("Database cleanup error:", error);
      return false;
    }
  },

  // Initialize admin user (Firebase)
  initializeAdmin: async (email: string, password: string): Promise<boolean> => {
    try {
      // Try to login with the email - this will either succeed or throw
      try {
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        const user = userCredential.user;
        
        // Mark existing user as admin
        await update(ref(firebaseDatabase, `users/${user.uid}/profile`), {
          isAdmin: true,
          status: "approved",
        });
        console.log("✅ User marked as admin:", email);
        await signOut(firebaseAuth); // Sign out after setup
        return true;
      } catch (signInError: any) {
        // If user doesn't exist, create as admin
        if (signInError?.message?.includes("user-not-found") || signInError?.message?.includes("invalid-credential")) {
          const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
          const newAdmin = userCredential.user;

          const adminProfile: UserProfile = {
            uid: newAdmin.uid,
            email: newAdmin.email || "",
            createdAt: Date.now(),
            status: "approved",
            isAdmin: true,
          };

          await set(ref(firebaseDatabase, `users/${newAdmin.uid}/profile`), adminProfile);
          console.log("✅ New admin created:", email);
          await signOut(firebaseAuth); // Sign out after setup
          return true;
        }
        throw signInError;
      }
    } catch (error) {
      console.error("Admin initialization error:", error);
      return false;
    }
  },
};
