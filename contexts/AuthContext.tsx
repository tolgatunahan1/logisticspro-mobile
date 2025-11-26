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

export const getAdmin = async (): Promise<AdminUser | null> => {
  try {
    const admin = await AsyncStorage.getItem(ADMIN_STORAGE_KEY);
    if (admin) {
      const parsed = JSON.parse(admin);
      console.log("Admin found:", { username: parsed.username });
      return parsed;
    }
    return null;
  } catch (error) {
    console.error("Failed to get admin:", error);
    return null;
  }
};

export const createAdmin = async (username: string, password: string): Promise<boolean> => {
  try {
    const admin: AdminUser = { username: username.trim(), password: password.trim(), createdAt: Date.now() };
    await AsyncStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin));
    console.log("Admin created:", admin.username);
    return true;
  } catch (error) {
    console.error("Failed to create admin:", error);
    return false;
  }
};

export const getUsers = async (): Promise<AppUser[]> => {
  try {
    const users = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    const result = users ? JSON.parse(users) : [];
    console.log("Users fetched count:", result.length);
    return result;
  } catch (error) {
    console.error("Failed to get users:", error);
    return [];
  }
};

export const getApprovedUsers = async (): Promise<AppUser[]> => {
  const users = await getUsers();
  const approved = users.filter((u) => u.status === "approved");
  console.log("Approved users:", approved.length);
  return approved;
};

export const getPendingUsers = async (): Promise<AppUser[]> => {
  const users = await getUsers();
  const pending = users.filter((u) => u.status === "pending");
  console.log("Pending users:", pending.length);
  return pending;
};

export const requestSignup = async (username: string, password: string): Promise<boolean> => {
  try {
    const users = await getUsers();

    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      console.log("Username already exists:", username);
      return false;
    }

    const newUser: AppUser = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      username: username.trim(),
      password: password.trim(),
      createdAt: Date.now(),
      status: "pending",
    };

    users.push(newUser);
    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    console.log("User signup requested:", username);
    return true;
  } catch (error) {
    console.error("Failed to request signup:", error);
    return false;
  }
};

export const approveUser = async (userId: string): Promise<boolean> => {
  try {
    console.log("Approving user ID:", userId);
    const users = await getUsers();
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      console.error("User not found for approval:", userId);
      return false;
    }

    const oldStatus = users[userIndex].status;
    users[userIndex].status = "approved";
    users[userIndex].approvedAt = Date.now();

    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    console.log("User approved:", { username: users[userIndex].username, oldStatus, newStatus: "approved" });

    // Verify write
    const verify = await getUsers();
    const verifyUser = verify.find((u) => u.id === userId);
    console.log("Verification after approve:", verifyUser?.status);

    return true;
  } catch (error) {
    console.error("Failed to approve user:", error);
    return false;
  }
};

export const rejectUser = async (userId: string): Promise<boolean> => {
  try {
    console.log("Rejecting user ID:", userId);
    const users = await getUsers();
    const userToReject = users.find((u) => u.id === userId);
    const filtered = users.filter((u) => u.id !== userId);
    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filtered));
    console.log("User rejected:", userToReject?.username);
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
    const users = await getApprovedUsers();
    const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password.trim());
    if (user) {
      console.log("User login successful:", username);
    } else {
      console.log("User login failed:", username);
    }
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
    const admin = await getAdmin();
    if (!admin) {
      const defaultAdmin: AdminUser = {
        username: "tolgatunahan",
        password: "1Liraversene",
        createdAt: Date.now(),
      };
      await AsyncStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(defaultAdmin));
      console.log("✅ Default admin initialized");
    } else {
      console.log("✅ Admin already exists:", admin.username);
    }
  } catch (error) {
    console.error("Failed to initialize default admin:", error);
  }
};
