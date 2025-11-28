import AsyncStorage from "@react-native-async-storage/async-storage";
import { firebaseDatabase } from "@/constants/firebase";
import { ref, get, set, update, remove } from "firebase/database";

export interface AppUser {
  id: string;
  username: string;
  password: string;
  createdAt: number;
  approvedAt?: number;
  status: "approved" | "pending" | "rejected";
}

export interface AdminUser {
  username: string;
  password: string;
  createdAt: number;
}

const USERS_STORAGE_KEY = "@logistics_users";
const ADMIN_STORAGE_KEY = "@logistics_admin_user";

// DEBUG FUNCTION
export const debugStorage = async (): Promise<void> => {
  try {
    const users = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    const parsed = users ? JSON.parse(users) : [];
    console.log("📊 STORAGE DEBUG:", {
      total: parsed.length,
      pending: parsed.filter((u: AppUser) => u.status === "pending").length,
      approved: parsed.filter((u: AppUser) => u.status === "approved").length,
      users: parsed.map((u: AppUser) => ({ id: u.id, username: u.username, status: u.status }))
    });
  } catch (error) {
    console.error("Debug error:", error);
  }
};

export const getAdmin = async (): Promise<AdminUser | null> => {
  try {
    console.log("🔍 getAdmin - fetching from key:", ADMIN_STORAGE_KEY);
    const admin = await AsyncStorage.getItem(ADMIN_STORAGE_KEY);
    console.log("📦 getAdmin result:", admin ? "✅ Found" : "❌ Not found", admin ? JSON.parse(admin).username : "");
    return admin ? JSON.parse(admin) : null;
  } catch (error) {
    console.error("❌ Failed to get admin:", error);
    return null;
  }
};

export const createAdmin = async (username: string, password: string): Promise<boolean> => {
  try {
    const admin: AdminUser = { username, password, createdAt: Date.now() };
    await AsyncStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin));
    console.log("✅ Admin created:", username);
    return true;
  } catch (error) {
    console.error("❌ Failed to create admin:", error);
    return false;
  }
};

export const getUsers = async (): Promise<AppUser[]> => {
  try {
    const users = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error("Failed to get users:", error);
    return [];
  }
};

export const getApprovedUsers = async (): Promise<AppUser[]> => {
  const users = await getUsers();
  return users.filter((u) => u.status === "approved");
};

export const getPendingUsers = async (): Promise<AppUser[]> => {
  const users = await getUsers();
  return users.filter((u) => u.status === "pending");
};

export const requestSignup = async (username: string, password: string): Promise<boolean> => {
  try {
    const users = await getUsers();

    if (users.some((u) => u.username === username)) {
      return false;
    }

    const newUser: AppUser = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      username,
      password,
      createdAt: Date.now(),
      status: "pending",
    };

    users.push(newUser);
    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return true;
  } catch (error) {
    console.error("Failed to request signup:", error);
    return false;
  }
};

export const approveUser = async (userId: string): Promise<boolean> => {
  try {
    const users = await getUsers();

    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      return false;
    }

    users[userIndex].status = "approved";
    users[userIndex].approvedAt = Date.now();

    const jsonData = JSON.stringify(users);
    await AsyncStorage.setItem(USERS_STORAGE_KEY, jsonData);

    const verified = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    const verifiedParsed = verified ? JSON.parse(verified) : [];
    const verifiedUser = verifiedParsed.find((u: AppUser) => u.id === userId);

    if (verifiedUser?.status !== "approved") {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to approve user:", error);
    return false;
  }
};

export const unapproveUser = async (userId: string): Promise<boolean> => {
  try {
    const users = await getUsers();
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      return false;
    }

    users[userIndex].status = "pending";
    users[userIndex].approvedAt = undefined;

    const jsonData = JSON.stringify(users);
    await AsyncStorage.setItem(USERS_STORAGE_KEY, jsonData);

    const verified = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    const verifiedParsed = verified ? JSON.parse(verified) : [];
    const verifiedUser = verifiedParsed.find((u: AppUser) => u.id === userId);

    if (verifiedUser?.status !== "pending") {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to unapprove user:", error);
    return false;
  }
};

export const rejectUser = async (userId: string): Promise<boolean> => {
  try {
    const users = await getUsers();
    
    const filtered = users.filter((u) => u.id !== userId);
    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filtered));
    
    const verified = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    const verifiedParsed = verified ? JSON.parse(verified) : [];
    const stillExists = verifiedParsed.find((u: AppUser) => u.id === userId);
    
    if (stillExists) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Failed to reject user:", error);
    return false;
  }
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    const users = await getUsers();
    const filtered = users.filter((u) => u.id !== userId);
    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Failed to delete user:", error);
    return false;
  }
};

export const loginUser = async (username: string, password: string): Promise<AppUser | null> => {
  try {
    const users = await getUsers();
    
    const user = users.find(
      (u) => u.username === username && u.password === password && u.status === "approved"
    );
    
    return user || null;
  } catch (error) {
    console.error("Failed to login user:", error);
    return null;
  }
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
};

// Firebase-based Firebase users functions
export const getPendingFirebaseUsers = async (): Promise<any[]> => {
  try {
    const snapshot = await get(ref(firebaseDatabase, "users"));
    if (!snapshot.exists()) return [];
    const users = snapshot.val();
    return Object.entries(users)
      .filter(([_, user]: any) => user.profile?.status === "pending")
      .map(([uid, user]: any) => ({
        id: uid,
        email: user.profile?.email || "",
        createdAt: user.profile?.createdAt || 0,
        status: "pending",
      }));
  } catch (error) {
    console.error("Get pending Firebase users error:", error);
    return [];
  }
};

export const getApprovedFirebaseUsers = async (): Promise<any[]> => {
  try {
    const snapshot = await get(ref(firebaseDatabase, "users"));
    if (!snapshot.exists()) return [];
    const users = snapshot.val();
    return Object.entries(users)
      .filter(([_, user]: any) => user.profile?.status === "approved")
      .map(([uid, user]: any) => ({
        id: uid,
        email: user.profile?.email || "",
        approvedAt: user.profile?.approvedAt || 0,
        status: "approved",
      }));
  } catch (error) {
    console.error("Get approved Firebase users error:", error);
    return [];
  }
};

export const approveFirebaseUser = async (userId: string): Promise<boolean> => {
  try {
    await update(ref(firebaseDatabase, `users/${userId}/profile`), {
      status: "approved",
      approvedAt: Date.now(),
    });
    return true;
  } catch (error) {
    console.error("Approve Firebase user error:", error);
    return false;
  }
};

export const rejectFirebaseUser = async (userId: string): Promise<boolean> => {
  try {
    await update(ref(firebaseDatabase, `users/${userId}/profile`), {
      status: "rejected",
    });
    return true;
  } catch (error) {
    console.error("Reject Firebase user error:", error);
    return false;
  }
};

export const unapproveFirebaseUser = async (userId: string): Promise<boolean> => {
  try {
    await update(ref(firebaseDatabase, `users/${userId}/profile`), {
      status: "pending",
      approvedAt: undefined,
    });
    return true;
  } catch (error) {
    console.error("Unapprove Firebase user error:", error);
    return false;
  }
};

export const deleteFirebaseUser = async (userId: string): Promise<boolean> => {
  try {
    // Remove user profile from database
    await remove(ref(firebaseDatabase, `users/${userId}`));
    console.log("✅ User deleted:", userId);
    return true;
  } catch (error) {
    console.error("Delete Firebase user error:", error);
    return false;
  }
};

export const initializeDefaultAdmin = async (): Promise<void> => {
  try {
    console.log("🔧 Initializing default admin...");
    // Admin now uses Firebase, no need for local initialization
    console.log("✅ Admin system using Firebase");
  } catch (error) {
    console.error("❌ Failed to initialize default admin:", error);
  }
};
