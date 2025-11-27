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

export const initializeDefaultAdmin = async (): Promise<void> => {
  try {
    console.log("🔧 Initializing default admin...");
    const admin = await getAdmin();
    if (!admin) {
      const defaultAdmin: AdminUser = {
        username: "tolgatunahan",
        password: "1Liraversene",
        createdAt: Date.now(),
      };
      await AsyncStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(defaultAdmin));
      console.log("✅ Default admin initialized - tolgatunahan");
    } else {
      console.log("✅ Admin already exists:", admin.username);
    }
  } catch (error) {
    console.error("❌ Failed to initialize default admin:", error);
  }
};
