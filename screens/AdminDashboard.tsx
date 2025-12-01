import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, Alert, ActivityIndicator, Pressable, RefreshControl } from "react-native";
import { ref, get, update } from "firebase/database";
import { db } from "../utils/firebaseAuth";
import { Feather } from "@expo/vector-icons";

import { ScreenContainer } from "../components/ScreenContainer";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext"; // Çıkış için

// Kullanıcı Tipi
interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  role: 'admin' | 'user';
  createdAt: string;
}

export default function AdminDashboard() {
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const { logout } = useAuth(); // Çıkış fonksiyonu

  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null); // Hangi kullanıcı işlem görüyor

  const fetchPendingUsers = useCallback(async () => {
    setLoading(true);
    try {
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const allUsers = snapshot.val();
        const pendingList: UserProfile[] = [];
        
        Object.values(allUsers).forEach((user: any) => {
          if (user.status === 'pending') {
            pendingList.push(user);
          }
        });
        setPendingUsers(pendingList);
      } else {
        setPendingUsers([]);
      }
    } catch (error) {
      Alert.alert("Hata", "Kullanıcılar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  const updateUserStatus = async (uid: string, newStatus: 'approved' | 'rejected') => {
    setProcessing(uid);
    try {
      await update(ref(db, `users/${uid}`), {
        status: newStatus
      });
      // Listeyi güncelle (lokal olarak çıkar)
      setPendingUsers(prev => prev.filter(u => u.uid !== uid));
      Alert.alert("Başarılı", `Kullanıcı ${newStatus === 'approved' ? 'onaylandı' : 'reddedildi'}.`);
    } catch (error) {
      Alert.alert("Hata", "İşlem başarısız.");
    } finally {
      setProcessing(null);
    }
  };

  const renderItem = ({ item }: { item: UserProfile }) => (
    <View style={[styles.card, { backgroundColor: colors.backgroundDefault, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <ThemedText type="h4">{item.name}</ThemedText>
        <View style={styles.badge}>
          <ThemedText type="small" style={{ color: '#854d0e' }}>Bekliyor</ThemedText>
        </View>
      </View>
      
      <View style={styles.infoRow}>
        <Feather name="mail" size={14} color={colors.textSecondary} />
        <ThemedText style={{ color: colors.textSecondary }}>{item.email}</ThemedText>
      </View>
      <View style={styles.infoRow}>
        <Feather name="phone" size={14} color={colors.textSecondary} />
        <ThemedText style={{ color: colors.textSecondary }}>{item.phone}</ThemedText>
      </View>

      <View style={styles.actionButtons}>
        <Pressable 
          style={[styles.btn, { backgroundColor: colors.destructive, opacity: processing === item.uid ? 0.5 : 1 }]}
          onPress={() => updateUserStatus(item.uid, 'rejected')}
          disabled={processing === item.uid}
        >
          <Feather name="x" size={18} color="#FFF" />
          <ThemedText style={{ color: '#FFF', fontWeight: '600' }}>Reddet</ThemedText>
        </Pressable>

        <Pressable 
          style={[styles.btn, { backgroundColor: colors.success, opacity: processing === item.uid ? 0.5 : 1 }]}
          onPress={() => updateUserStatus(item.uid, 'approved')}
          disabled={processing === item.uid}
        >
          <Feather name="check" size={18} color="#FFF" />
          <ThemedText style={{ color: '#FFF', fontWeight: '600' }}>Onayla</ThemedText>
        </Pressable>
      </View>
    </View>
  );

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg, paddingHorizontal: Spacing.md }}>
        <ThemedText type="h2">Yönetici Paneli</ThemedText>
        <Pressable onPress={logout} style={{ padding: 8 }}>
            <Feather name="log-out" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ThemedText type="subtitle" style={{ marginBottom: Spacing.md, paddingHorizontal: Spacing.md }}>
        Onay Bekleyen Kullanıcılar ({pendingUsers.length})
      </ThemedText>

      {loading ? (
        <ActivityIndicator size="large" color={theme.link} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={pendingUsers}
          renderItem={renderItem}
          keyExtractor={item => item.uid}
          contentContainerStyle={{ paddingBottom: Spacing.xl }}
          scrollEnabled={false} // ScreenContainer zaten scroll ediyor
          ListEmptyComponent={
            <ThemedText style={{ textAlign: 'center', marginTop: 20, color: colors.textSecondary }}>
              Bekleyen başvuru yok.
            </ThemedText>
          }
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  badge: {
    backgroundColor: '#fef9c3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
    gap: 6,
  },
});