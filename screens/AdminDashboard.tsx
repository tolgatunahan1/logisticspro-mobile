import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator, Pressable, RefreshControl } from "react-native";
import { ref, get, update } from "firebase/database";
import { firebaseDatabase } from "../constants/firebase";
import { Feather } from "@expo/vector-icons";

import { ScreenContainer } from "../components/ScreenContainer";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'suspended';
  role: 'admin' | 'user';
  createdAt: string;
}

export default function AdminDashboard() {
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const { logout } = useAuth();

  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [activeUsers, setActiveUsers] = useState<UserProfile[]>([]);
  const [suspendedUsers, setSuspendedUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllUsers = useCallback(async () => {
    setLoading(true);
    try {
      const usersRef = ref(firebaseDatabase, 'users');
      const snapshot = await get(usersRef);
      
      const pending: UserProfile[] = [];
      const active: UserProfile[] = [];
      const suspended: UserProfile[] = [];

      if (snapshot.exists()) {
        const allUsers = snapshot.val();
        Object.values(allUsers).forEach((user: any) => {
          // Admin hesaplarını filtrele - sadece normal kullanıcıları göster
          if (user.role === 'admin') {
            return; // Admin hesaplarını atla
          }

          if (user.status === 'pending') {
            pending.push(user);
          } else if (user.status === 'approved') {
            active.push(user);
          } else if (user.status === 'suspended') {
            suspended.push(user);
          }
        });
      }

      setPendingUsers(pending);
      setActiveUsers(active);
      setSuspendedUsers(suspended);
    } catch (error) {
      console.error("Kullanıcılar yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAllUsers().then(() => setRefreshing(false));
  }, [fetchAllUsers]);

  const updateUserStatus = async (uid: string, newStatus: 'approved' | 'suspended' | 'rejected') => {
    setProcessing(uid);
    try {
      if (newStatus === 'rejected') {
        // Delete user completely
        await update(ref(firebaseDatabase, `users/${uid}`), { _deleted: true });
        // Remove from list
        setPendingUsers(prev => prev.filter(u => u.uid !== uid));
      } else {
        await update(ref(firebaseDatabase, `users/${uid}`), { status: newStatus });
        // Refresh lists
        await fetchAllUsers();
      }
    } catch (error) {
      console.error("İşlem başarısız:", error);
    } finally {
      setProcessing(null);
    }
  };

  const renderUserCard = (item: UserProfile, canDelete?: boolean) => (
    <View style={[styles.card, { backgroundColor: colors.backgroundDefault, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View>
          <ThemedText type="h4">{item.name}</ThemedText>
          <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: 2 }}>
            {item.email}
          </ThemedText>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Feather name="phone" size={14} color={colors.textSecondary} />
        <ThemedText style={{ color: colors.textSecondary }}>{item.phone}</ThemedText>
      </View>

      <View style={styles.infoRow}>
        <Feather name="calendar" size={14} color={colors.textSecondary} />
        <ThemedText style={{ color: colors.textSecondary }}>
          {new Date(item.createdAt).toLocaleDateString('tr-TR')}
        </ThemedText>
      </View>

      {item.status === 'pending' && (
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.btn, { backgroundColor: colors.destructive, opacity: processing === item.uid ? 0.5 : 1 }]}
            onPress={() => updateUserStatus(item.uid, 'rejected')}
            disabled={processing === item.uid}
          >
            <Feather name="x" size={16} color="#FFF" />
            <ThemedText style={{ color: '#FFF', fontWeight: '600', fontSize: 13 }}>Reddet</ThemedText>
          </Pressable>

          <Pressable
            style={[styles.btn, { backgroundColor: colors.success, opacity: processing === item.uid ? 0.5 : 1 }]}
            onPress={() => updateUserStatus(item.uid, 'approved')}
            disabled={processing === item.uid}
          >
            <Feather name="check" size={16} color="#FFF" />
            <ThemedText style={{ color: '#FFF', fontWeight: '600', fontSize: 13 }}>Onayla</ThemedText>
          </Pressable>
        </View>
      )}

      {item.status === 'approved' && (
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.btn, { backgroundColor: colors.warning, opacity: processing === item.uid ? 0.5 : 1 }]}
            onPress={() => updateUserStatus(item.uid, 'suspended')}
            disabled={processing === item.uid}
          >
            <Feather name="pause-circle" size={16} color="#000" />
            <ThemedText style={{ color: '#000', fontWeight: '600', fontSize: 13 }}>Dondur</ThemedText>
          </Pressable>
        </View>
      )}

      {item.status === 'suspended' && (
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.btn, { backgroundColor: colors.success, opacity: processing === item.uid ? 0.5 : 1 }]}
            onPress={() => updateUserStatus(item.uid, 'approved')}
            disabled={processing === item.uid}
          >
            <Feather name="play-circle" size={16} color="#FFF" />
            <ThemedText style={{ color: '#FFF', fontWeight: '600', fontSize: 13 }}>Aktif Et</ThemedText>
          </Pressable>
        </View>
      )}
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

      {loading ? (
        <ActivityIndicator size="large" color={theme.link} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={[
            { title: 'Onay Bekleyenler', icon: 'clock', users: pendingUsers, count: pendingUsers.length },
            { title: 'Aktif Kullanıcılar', icon: 'check-circle', users: activeUsers, count: activeUsers.length },
            { title: 'Askıya Alınanlar', icon: 'pause-circle', users: suspendedUsers, count: suspendedUsers.length },
          ]}
          renderItem={({ item }) => (
            <View style={{ marginBottom: Spacing.xl }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: Spacing.md, marginBottom: Spacing.md }}>
                <Feather name={item.icon as any} size={20} color={theme.link} />
                <ThemedText type="subtitle" style={{ fontWeight: '700' }}>
                  {item.title} ({item.count})
                </ThemedText>
              </View>

              {item.users.length > 0 ? (
                item.users.map((user) => (
                  <View key={user.uid} style={{ paddingHorizontal: Spacing.md, marginBottom: Spacing.md }}>
                    {renderUserCard(user)}
                  </View>
                ))
              ) : (
                <ThemedText style={{ textAlign: 'center', marginBottom: Spacing.md, color: colors.textSecondary, paddingHorizontal: Spacing.md }}>
                  Kayıt yok
                </ThemedText>
              )}
            </View>
          )}
          keyExtractor={(item, idx) => `${item.title}-${idx}`}
          scrollEnabled={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: Spacing.xl }}
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
  },
  cardHeader: {
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
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
