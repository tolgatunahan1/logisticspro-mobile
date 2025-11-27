import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable, FlatList, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../contexts/AuthContext";
import { Spacing, BorderRadius, Colors } from "../constants/theme";
import { getPendingUsers, getApprovedUsers, approveUser, rejectUser, unapproveUser } from "../utils/userManagement";

export default function AdminDashboard() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { logout } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const colors = isDark ? Colors.dark : Colors.light;

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const pending = await getPendingUsers();
      const approved = await getApprovedUsers();
      setPendingUsers(pending);
      setApprovedUsers(approved);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers])
  );

  const handleApprove = async (userId: string) => {
    Alert.alert("Onayla", "Kullanıcı onaylanacak mı?", [
      { text: "İptal" },
      {
        text: "Onayla",
        onPress: async () => {
          await approveUser(userId);
          await loadUsers();
        },
      },
    ]);
  };

  const handleReject = async (userId: string) => {
    Alert.alert("Reddet", "Kullanıcı reddedilecek mi?", [
      { text: "İptal" },
      {
        text: "Reddet",
        onPress: async () => {
          await rejectUser(userId);
          await loadUsers();
        },
        style: "destructive",
      },
    ]);
  };

  const handleRevoke = async (userId: string, username: string) => {
    Alert.alert("Onayı Kaldır", `${username} kullanıcısının onayını kaldırmak istiyor musunuz?`, [
      { text: "İptal" },
      {
        text: "Kaldır",
        onPress: async () => {
          await unapproveUser(userId);
          await loadUsers();
        },
        style: "destructive",
      },
    ]);
  };

  const formatDate = (timestamp?: number): string => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg }]}>
        <ThemedText type="h2">Admin Panel</ThemedText>
        <Pressable
          onPress={() => {
            Alert.alert("Çıkış", "Çıkış yapmak istiyor musunuz?", [
              { text: "İptal" },
              {
                text: "Çıkış",
                onPress: async () => {
                  await logout();
                },
                style: "destructive",
              },
            ]);
          }}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Feather name="log-out" size={24} color={theme.text} />
        </Pressable>
      </View>

      <View style={[styles.statsContainer, { paddingHorizontal: Spacing.xl }]}>
        <View style={[styles.statCard, { backgroundColor: colors.backgroundDefault, borderColor: colors.border }]}>
          <ThemedText type="small" style={{ color: colors.textSecondary }}>
            Aktif Kullanıcılar
          </ThemedText>
          <ThemedText type="h3" style={{ fontWeight: "700", color: theme.link }}>
            {approvedUsers.length}
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.backgroundDefault, borderColor: colors.border }]}>
          <ThemedText type="small" style={{ color: colors.textSecondary }}>
            Beklemede
          </ThemedText>
          <ThemedText type="h3" style={{ fontWeight: "700", color: "#f59e0b" }}>
            {pendingUsers.length}
          </ThemedText>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Beklemede Kullanıcılar */}
        <View style={styles.section}>
          <ThemedText type="h4" style={{ paddingHorizontal: Spacing.xl }}>
            Beklemede Kullanıcılar ({pendingUsers.length})
          </ThemedText>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.link} />
          </View>
        ) : pendingUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText type="body" style={{ color: colors.textSecondary }}>
              Beklemede kullanıcı yok
            </ThemedText>
          </View>
        ) : (
          <View style={{ paddingHorizontal: Spacing.xl, gap: Spacing.md, paddingBottom: Spacing.lg }}>
            {pendingUsers.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.card,
                  { backgroundColor: colors.backgroundDefault, borderColor: colors.border },
                ]}
              >
                <View style={styles.userInfo}>
                  <ThemedText type="body" style={{ fontWeight: "600" }}>
                    {item.username}
                  </ThemedText>
                </View>
                <View style={styles.actions}>
                  <Pressable
                    onPress={() => handleApprove(item.id)}
                    style={[styles.button, { backgroundColor: "#10b981" }]}
                  >
                    <Feather name="check" size={20} color="white" />
                  </Pressable>
                  <Pressable
                    onPress={() => handleReject(item.id)}
                    style={[styles.button, { backgroundColor: colors.destructive }]}
                  >
                    <Feather name="x" size={20} color="white" />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Onaylanmış Kullanıcılar */}
        <View style={styles.section}>
          <ThemedText type="h4" style={{ paddingHorizontal: Spacing.xl }}>
            Onaylanmış Kullanıcılar ({approvedUsers.length})
          </ThemedText>
        </View>

        {approvedUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText type="body" style={{ color: colors.textSecondary }}>
              Onaylanmış kullanıcı yok
            </ThemedText>
          </View>
        ) : (
          <View style={{ paddingHorizontal: Spacing.xl, gap: Spacing.md, paddingBottom: Spacing.lg }}>
            {approvedUsers.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.card,
                  { backgroundColor: colors.backgroundDefault, borderColor: colors.border },
                ]}
              >
                <View style={styles.userInfo}>
                  <ThemedText type="body" style={{ fontWeight: "600" }}>
                    {item.username}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: Spacing.xs }}>
                    Onaylandı: {formatDate(item.approvedAt)}
                  </ThemedText>
                </View>
                <Pressable
                  onPress={() => handleRevoke(item.id, item.username)}
                  style={[styles.button, { backgroundColor: colors.destructive }]}
                >
                  <Feather name="trash-2" size={20} color="white" />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
  },
  section: {
    paddingVertical: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  userInfo: {
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.xs,
    justifyContent: "center",
    alignItems: "center",
  },
});

