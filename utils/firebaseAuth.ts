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
  deleteUser,
} from "firebase/auth";
import { firebaseAuth, firebaseDatabase } from "@/constants/firebase";
import { ref, set, get, update, remove } from "firebase/database";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone: string;
  role: 'admin' | 'user';
  status: 'pending' | 'approved' | 'suspended';
  createdAt: string;
}

const firebaseAuthService = {
  // Get database reference
  getDatabase: () => firebaseDatabase,

  // Check if Firebase is properly configured
  isConfigured: (): boolean => {
    try {
      const apiKey = firebaseAuth.app?.options?.apiKey || "";
      const isValid = apiKey.startsWith("AIzaSy") && apiKey.length > 30;
      return isValid;
    } catch (error) {
      return false;
    }
  },

  // Register - flat structure
  register: async (email: string, password: string, name: string, phone: string): Promise<User | null> => {
    try {
      if (!firebaseAuthService.isConfigured()) {
        throw new Error("Firebase yapılandırılmamış");
      }

      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;

      // Create user profile in database - FLAT STRUCTURE
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || "",
        name,
        phone,
        role: 'user',
        status: 'pending', // All users start as pending
        createdAt: new Date().toISOString(),
      };

      try {
        console.log("📝 Database'ye profil yazılıyor:", user.uid);
        await set(ref(firebaseDatabase, `users/${user.uid}`), userProfile);
        console.log("✅ Profil başarıyla yazıldı");
        return user;
      } catch (dbError: any) {
        console.error("❌ Database yazma hatası:", dbError?.message || dbError);
        await deleteUser(user);
        throw new Error("Profil oluştururken veritabanı hatası");
      }
    } catch (error: any) {
      throw error;
    }
  },

  // Login
  login: async (email: string, password: string): Promise<User | null> => {
    try {
      if (!firebaseAuthService.isConfigured()) {
        throw new Error("Firebase yapılandırılmamış");
      }
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      return userCredential.user;
    } catch (error: any) {
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
      const snapshot = await get(ref(firebaseDatabase, `users/${uid}`));
      return snapshot.val();
    } catch (error) {
      return null;
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

  // Get all users with specific status
  getUsersByStatus: async (status: 'pending' | 'approved' | 'suspended'): Promise<UserProfile[]> => {
    try {
      const usersRef = ref(firebaseDatabase, 'users');
      const snapshot = await get(usersRef);
      const users: UserProfile[] = [];

      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const userData = child.val();
          if (userData && userData.status === status) {
            users.push(userData);
          }
        });
      }
      return users;
    } catch (error) {
      console.error("❌ Error getting users by status:", error);
      return [];
    }
  },

  // Update user status (admin only)
  updateUserStatus: async (uid: string, newStatus: 'pending' | 'approved' | 'suspended'): Promise<boolean> => {
    try {
      await update(ref(firebaseDatabase, `users/${uid}`), {
        status: newStatus,
      });
      return true;
    } catch (error) {
      console.error("❌ Error updating user status:", error);
      return false;
    }
  },

  // Reject user - delete completely
  rejectUser: async (uid: string): Promise<boolean> => {
    try {
      await remove(ref(firebaseDatabase, `users/${uid}`));
      return true;
    } catch (error) {
      console.error("❌ Error rejecting user:", error);
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

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      return true;
    } catch (error: any) {
      if (error?.message?.includes("wrong-password")) {
        throw new Error("Mevcut şifre yanlış");
      }
      throw error;
    }
  },

  // Reauthenticate user with password
  reauthenticate: async (password: string): Promise<boolean> => {
    try {
      const user = firebaseAuth.currentUser;
      if (!user || !user.email) {
        throw new Error("Kullanıcı oturumu açmamış");
      }

      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      console.log("✅ Reauthentication başarılı");
      return true;
    } catch (error: any) {
      console.error("❌ Reauthentication hatası:", error?.message || error);
      if (error?.message?.includes("wrong-password") || error?.code === "auth/wrong-password" || error?.code === "auth/invalid-credential") {
        throw new Error("Şifre yanlış");
      }
      throw error;
    }
  },

  // Delete account completely
  deleteAccount: async (): Promise<boolean> => {
    try {
      const user = firebaseAuth.currentUser;
      if (!user) {
        throw new Error("Kullanıcı oturumu açmamış");
      }

      const uid = user.uid;
      console.log("🗑️ Hesap silme başladı, UID:", uid);

      // Delete Firebase auth user
      console.log("📍 Firebase hesabı siliniyor...");
      await deleteUser(user);
      console.log("✅ Firebase hesabı silindi");

      // Delete user data from database
      console.log("📍 Veritabanı verileri siliniyor...");
      await remove(ref(firebaseDatabase, `users/${uid}`));
      console.log("✅ Veritabanı verileri silindi");

      console.log("✅ Hesap tamamen silindi");
      return true;
    } catch (error: any) {
      console.error("❌ Hesap silme hatası:", error?.message || error?.code || error);
      if (error?.code === "auth/requires-recent-login") {
        throw new Error("Lütfen şifrenizi kontrol edin ve tekrar deneyin");
      }
      throw error;
    }
  },
};

export { firebaseAuthService };
export const db = firebaseDatabase;
