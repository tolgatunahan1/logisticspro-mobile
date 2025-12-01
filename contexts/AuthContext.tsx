import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth, db } from "../utils/firebaseAuth"; // db eklendi
import { ref, get } from "firebase/database";

// Kullanıcı Veri Tipi
export interface UserData {
  uid: string;
  email: string;
  name: string;
  phone: string;
  role: 'admin' | 'user';
  status: 'pending' | 'approved' | 'rejected';
}

interface AuthContextType {
  firebaseUser: User | null;
  userData: UserData | null; // Veritabanındaki detaylı veri
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>; // Veriyi elle yenilemek için
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Kullanıcı verisini veritabanından çekme fonksiyonu
  const fetchUserData = async (uid: string) => {
    try {
      const userRef = ref(db, `users/${uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        setUserData(snapshot.val() as UserData);
      } else {
        console.log("Kullanıcı verisi veritabanında bulunamadı.");
        setUserData(null);
      }
    } catch (error) {
      console.error("Kullanıcı verisi çekilemedi:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        await fetchUserData(user.uid);
      } else {
        setFirebaseUser(null);
        setUserData(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
    setFirebaseUser(null);
    setUserData(null);
  };

  const refreshUserData = async () => {
    if (firebaseUser) {
      await fetchUserData(firebaseUser.uid);
    }
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, userData, isLoading, logout, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};