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
      console.error("User not found:", userId);
      return false;
    }

    users[userIndex].status = "approved";
    users[userIndex].approvedAt = Date.now();

    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    const updated = await getUsers();
    const approvedUser = updated.find((u) => u.id === userId);
    console.log("User approved successfully:", approvedUser?.username);

    return true;
  } catch (error) {
    console.error("Failed to approve user:", error);
    return false;
  }
};

export const rejectUser = async (userId: string): Promise<boolean> => {
  try {
    const users = await getUsers();
    const filtered = users.filter((u) => u.id !== userId);
    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filtered));
    console.log("User rejected successfully");
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
    const user = users.find((u) => u.username === username && u.password === password);
    if (user) {
      console.log("User login successful:", username);
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
      console.log("Default admin initialized");
    }
  } catch (error) {
    console.error("Failed to initialize default admin:", error);
  }
};
