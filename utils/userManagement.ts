import AsyncStorage from "@react-native-async-storage/async-storage";

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
const ADMIN_STORAGE_KEY = "@logistics_admin";

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
    const admin = await AsyncStorage.getItem(ADMIN_STORAGE_KEY);
    return admin ? JSON.parse(admin) : null;
  } catch (error) {
    console.error("Failed to get admin:", error);
    return null;
  }
};

export const createAdmin = async (username: string, password: string): Promise<boolean> => {
  try {
    const admin: AdminUser = { username, password, createdAt: Date.now() };
    await AsyncStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin));
    return true;
  } catch (error) {
    console.error("Failed to create admin:", error);
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
    console.log("✅ User signup requested:", username);
    return true;
  } catch (error) {
    console.error("Failed to request signup:", error);
    return false;
  }
};

export const approveUser = async (userId: string): Promise<boolean> => {
  try {
    console.log("🔄 STARTING APPROVE PROCESS FOR USER ID:", userId);
    
    const users = await getUsers();
    console.log("📋 Current users in storage:", users.length);

    const userIndex = users.findIndex((u) => u.id === userId);
    console.log("🔍 User found at index:", userIndex);

    if (userIndex === -1) {
      console.error("❌ User not found:", userId);
      return false;
    }

    const oldUser = { ...users[userIndex] };
    console.log("📌 Old state:", oldUser);

    users[userIndex].status = "approved";
    users[userIndex].approvedAt = Date.now();

    const jsonData = JSON.stringify(users);
    await AsyncStorage.setItem(USERS_STORAGE_KEY, jsonData);
    console.log("💾 Saved to storage, data length:", jsonData.length);

    const verified = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    const verifiedParsed = verified ? JSON.parse(verified) : [];
    const verifiedUser = verifiedParsed.find((u: AppUser) => u.id === userId);
    
    console.log("✅ VERIFICATION - New state:", {
      id: verifiedUser?.id,
      username: verifiedUser?.username,
      status: verifiedUser?.status,
      approvedAt: verifiedUser?.approvedAt
    });

    if (verifiedUser?.status !== "approved") {
      console.error("❌ VERIFICATION FAILED - Status not updated!");
      return false;
    }

    console.log("🎉 USER APPROVED SUCCESSFULLY:", oldUser.username);
    return true;
  } catch (error) {
    console.error("❌ Failed to approve user:", error);
    return false;
  }
};

export const unapproveUser = async (userId: string): Promise<boolean> => {
  try {
    console.log("🔄 STARTING UNAPPROVE PROCESS FOR USER ID:", userId);
    
    const users = await getUsers();
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      console.error("❌ User not found:", userId);
      return false;
    }

    const oldUser = { ...users[userIndex] };
    console.log("📌 Old state:", oldUser);

    users[userIndex].status = "pending";
    users[userIndex].approvedAt = undefined;

    const jsonData = JSON.stringify(users);
    await AsyncStorage.setItem(USERS_STORAGE_KEY, jsonData);
    console.log("💾 Saved to storage");

    const verified = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    const verifiedParsed = verified ? JSON.parse(verified) : [];
    const verifiedUser = verifiedParsed.find((u: AppUser) => u.id === userId);
    
    console.log("✅ VERIFICATION - New state:", {
      id: verifiedUser?.id,
      username: verifiedUser?.username,
      status: verifiedUser?.status,
      approvedAt: verifiedUser?.approvedAt
    });

    if (verifiedUser?.status !== "pending") {
      console.error("❌ VERIFICATION FAILED - Status not reverted!");
      return false;
    }

    console.log("🎉 USER APPROVAL REMOVED SUCCESSFULLY:", oldUser.username);
    return true;
  } catch (error) {
    console.error("❌ Failed to unapprove user:", error);
    return false;
  }
};

export const rejectUser = async (userId: string): Promise<boolean> => {
  try {
    console.log("🔄 STARTING REJECT PROCESS FOR USER ID:", userId);
    
    const users = await getUsers();
    const userToReject = users.find((u) => u.id === userId);
    
    console.log("🎯 Rejecting user:", userToReject?.username);
    
    const filtered = users.filter((u) => u.id !== userId);
    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filtered));
    
    const verified = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    const verifiedParsed = verified ? JSON.parse(verified) : [];
    const stillExists = verifiedParsed.find((u: AppUser) => u.id === userId);
    
    if (stillExists) {
      console.error("❌ VERIFICATION FAILED - User still exists!");
      return false;
    }
    
    console.log("🎉 USER REJECTED SUCCESSFULLY:", userToReject?.username);
    return true;
  } catch (error) {
    console.error("❌ Failed to reject user:", error);
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
    console.log("🔐 User login attempt:", username);
    
    const users = await getUsers();
    console.log("📋 Checking", users.length, "users");
    
    const user = users.find(
      (u) => u.username === username && u.password === password && u.status === "approved"
    );
    
    if (user) {
      console.log("✅ LOGIN SUCCESS:", username, "Status:", user.status);
      return user;
    } else {
      console.log("❌ LOGIN FAILED for:", username);
      const userExists = users.find((u) => u.username === username);
      if (userExists) {
        console.log("   - User found but status is:", userExists.status);
        console.log("   - Password match:", userExists.password === password);
      } else {
        console.log("   - User not found");
      }
    }
    
    return null;
  } catch (error) {
    console.error("Failed to login user:", error);
    return null;
  }
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
};

export const initializeDefaultAdmin = async (): Promise<void> => {
  try {
    const admin = await getAdmin();
    if (!admin) {
      const defaultAdmin: AdminUser = {
        username: "tolgatunahan",
        password: "1Liraversene",
        createdAt: Date.now(),
      };
      await AsyncStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(defaultAdmin));
      console.log("✅ Default admin initialized");
    }
  } catch (error) {
    console.error("Failed to initialize default admin:", error);
  }
};
