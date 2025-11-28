import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  Auth,
  updatePassword,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { firebaseAuth, firebaseDatabase } from "@/constants/firebase";
import { ref, set, get, update, remove } from "firebase/database";

export interface PendingUser {
  uid: string;
  email: string;
  createdAt: number;
}

export interface ApprovedUser {
  uid: string;
  email: string;
  approvedAt: number;
}

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
      return false;
    }
    const apiKey = firebaseAuth.app.options.apiKey;
    const isValid = apiKey.startsWith("AIzaSy") && apiKey.length > 30;
    return isValid;
  } catch (error) {
    return false;
  }
};

export const firebaseAuthService = {
  // Get database reference
  getDatabase: () => firebaseDatabase,

  // Check if Firebase is properly configured
  isConfigured: (): boolean => {
    try {
      const apiKey = firebaseAuth.app?.options?.apiKey || "";
      // Valid API keys start with AIzaSy and are longer than 30 chars
      const isValid = apiKey.startsWith("AIzaSy") && apiKey.length > 30;
      return isValid;
    } catch (error) {
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
      throw error;
    }
  },

  // Get user profile
  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    try {
      const snapshot = await get(ref(firebaseDatabase, `users/${uid}/profile`));
      return snapshot.val();
    } catch (error) {
      return null;
    }
  },

  // Check if user is approved
  isUserApproved: async (uid: string): Promise<boolean> => {
    try {
      const profile = await firebaseAuthService.getUserProfile(uid);
      return profile?.status === "approved";
    } catch (error) {
      return false;
    }
  },

  // Update user profile
  updateUserProfile: async (uid: string, updates: Partial<UserProfile>): Promise<boolean> => {
    try {
      await update(ref(firebaseDatabase, `users/${uid}/profile`), updates);
      return true;
    } catch (error) {
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

  // Delete user completely from system
  deleteUserByUid: async (uid: string): Promise<boolean> => {
    try {
      // Delete from users table
      await remove(ref(firebaseDatabase, `users/${uid}`));
      // Delete any associated data
      await remove(ref(firebaseDatabase, `data/${uid}`));
      return true;
    } catch (error) {
      return false;
    }
  },

  // Clean up all users from database - COMPLETE WIPE
  cleanupDatabase: async (): Promise<boolean> => {
    try {
      await remove(ref(firebaseDatabase, "users"));
      await remove(ref(firebaseDatabase, "admins"));
      return true;
    } catch (error) {
      return false;
    }
  },

  // HARD RESET - Sil HERYŞEY
  hardReset: async (): Promise<boolean> => {
    try {
      // Firebase'den sil
      await remove(ref(firebaseDatabase, "users"));
      await remove(ref(firebaseDatabase, "admins"));
      await remove(ref(firebaseDatabase, "data"));
      return true;
    } catch (error) {
      return false;
    }
  },

  // Check if user is admin
  isUserAdmin: async (uid: string): Promise<boolean> => {
    try {
      const snapshot = await get(ref(firebaseDatabase, `admins/${uid}`));
      return snapshot.exists() && snapshot.val()?.isAdmin === true;
    } catch (error) {
      return false;
    }
  },

  // Get all pending users
  getPendingUsers: async (): Promise<PendingUser[]> => {
    try {
      const snapshot = await get(ref(firebaseDatabase, "users"));
      const users: PendingUser[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const profile = child.val()?.profile;
          if (profile && profile.status === "pending") {
            users.push({
              uid: profile.uid,
              email: profile.email,
              createdAt: profile.createdAt,
            });
          }
        });
      }
      return users;
    } catch (error) {
      return [];
    }
  },

  // Get all approved users
  getApprovedUsers: async (): Promise<ApprovedUser[]> => {
    try {
      const snapshot = await get(ref(firebaseDatabase, "users"));
      const users: ApprovedUser[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const profile = child.val()?.profile;
          if (profile && profile.status === "approved") {
            users.push({
              uid: profile.uid,
              email: profile.email,
              approvedAt: profile.approvedAt || Date.now(),
            });
          }
        });
      }
      return users;
    } catch (error) {
      return [];
    }
  },

  // Approve user
  approveUser: async (uid: string): Promise<boolean> => {
    try {
      await update(ref(firebaseDatabase, `users/${uid}/profile`), {
        status: "approved",
        approvedAt: Date.now(),
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  // Reject user - removes from system completely so they can re-register
  rejectUser: async (uid: string): Promise<boolean> => {
    try {
      // Delete from database completely
      await remove(ref(firebaseDatabase, `users/${uid}`));
      return true;
    } catch (error) {
      return false;
    }
  },

  // Unapprove user
  unapproveUser: async (uid: string): Promise<boolean> => {
    try {
      await update(ref(firebaseDatabase, `users/${uid}/profile`), {
        status: "pending",
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const user = firebaseAuth.currentUser;
      if (!user || !user.email) {
        throw new Error("Kullanıcı oturumu açmamış");
      }

      // Reauthenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      return true;
    } catch (error: any) {
      if (error?.message?.includes("wrong-password")) {
        throw new Error("Mevcut şifre yanlış");
      }
      throw error;
    }
  },

  // Change email
  changeEmail: async (currentPassword: string, newEmail: string): Promise<boolean> => {
    try {
      const user = firebaseAuth.currentUser;
      if (!user || !user.email) {
        throw new Error("Kullanıcı oturumu açmamış");
      }

      // Reauthenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update email
      await updateEmail(user, newEmail);
      
      // Also update email in database
      if (user.uid) {
        await update(ref(firebaseDatabase, `users/${user.uid}/profile`), {
          email: newEmail,
        });
      }

      return true;
    } catch (error: any) {
      if (error?.message?.includes("wrong-password")) {
        throw new Error("Mevcut şifre yanlış");
      }
      if (error?.message?.includes("email-already-in-use")) {
        throw new Error("Bu email zaten kullanılıyor");
      }
      throw error;
    }
  },

  // Initialize admin user (Firebase) - ADMIN ONLY
  initializeAdmin: async (email: string, password: string): Promise<boolean> => {
    try {
      // Try to login with the email - this will either succeed or throw
      try {
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        const user = userCredential.user;
        
        // Mark existing user as admin
        await set(ref(firebaseDatabase, `admins/${user.uid}`), {
          uid: user.uid,
          email: email,
          isAdmin: true,
          createdAt: Date.now(),
        });
        await signOut(firebaseAuth); // Sign out after setup
        return true;
      } catch (signInError: any) {
        // If email already in use, throw clear error
        if (signInError?.message?.includes("email-already-in-use")) {
          const error = new Error(
            "Bu email Firebase'de zaten kullanılıyor. Farklı bir email deneyin. (Ör: admin@yeni.com)"
          );
          throw error;
        }
        // If user doesn't exist, create NEW ADMIN ONLY
        if (signInError?.message?.includes("user-not-found") || signInError?.message?.includes("invalid-credential")) {
          const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
          const newAdmin = userCredential.user;

          // Create ONLY admin profile - NO user profile
          await set(ref(firebaseDatabase, `admins/${newAdmin.uid}`), {
            uid: newAdmin.uid,
            email: newAdmin.email || "",
            isAdmin: true,
            createdAt: Date.now(),
          });
          await signOut(firebaseAuth); // Sign out after setup
          return true;
        }
        throw signInError;
      }
    } catch (error: any) {
      throw error;
    }
  },
};
