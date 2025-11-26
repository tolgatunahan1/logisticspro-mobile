import React, { useState, useCallback } from "react";
import { View, StyleSheet, Pressable, Alert, ScrollView, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getPendingUsers, approveUser, rejectUser, AppUser } from "@/utils/userManagement";

export default function AdminPanelScreen() {
  const { theme, isDark } = useTheme();
  const { logout } = useAuth();
  const colors = isDark ? Colors.dark : Colors.light;

  const [pendingUsers, setPendingUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPendingUsers = useCallback(async () => {
    try {
      const users = await getPendingUsers();
      setPendingUsers(users);
    } catch (error) {
      console.error("Failed to load pending users:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPendingUsers();
    }, [loadPendingUsers])
  );

  const handleApprove = (user: AppUser) => {
    Alert.alert("Kullanıcı Onayla", `${user.username} kullanıcısını onaylamak istiyor musunuz?`, [
      { text: "İptal", style: "cancel" },
      {
        text: "Onayla",
        onPress: async () => {
          setLoading(true);
          const success = await approveUser(user.id);
          if (success) {
            Alert.alert("Başarılı", `${user.username} onaylandı`);
            await loadPendingUsers();
          }
          setLoading(false);
        },
      },
    ]);
  };

  const handleReject = (user: AppUser) => {
    Alert.alert("Kullanıcı Reddet", `${user.username} kullanıcısını reddetmek istiyor musunuz?`, [
      { text: "İptal", style: "cancel" },
      {
        text: "Reddet",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          const success = await rejectUser(user.id);
          if (success) {
            Alert.alert("Başarılı", `${user.username} reddedildi`);
            await loadPendingUsers();
          }
          setLoading(false);
        },
      },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.header, { backgroundColor: colors.backgroundDefault }]}>
          <ThemedText type="h3">Admin Paneli</ThemedText>
          <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: Spacing.sm }}>
            Onay Bekleyen Kullanıcılar: {pendingUsers.length}
          </ThemedText>
        </View>

        {pendingUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="check-circle" size={48} color={colors.success} />
            <ThemedText type="h4" style={{ marginTop: Spacing.lg, marginBottom: Spacing.md }}>
              Tüm Başvurular İşlendi
            </ThemedText>
            <ThemedText type="small" style={{ color: colors.textSecondary, textAlign: "center" }}>
              Şu anda onay bekleyen kullanıcı yok
            </ThemedText>
          </View>
        ) : (
          <View style={{ gap: Spacing.md }}>
            {pendingUsers.map((user) => (
              <View key={user.id} style={[styles.userCard, { backgroundColor: colors.backgroundDefault }]}>
                <View style={styles.userInfo}>
                  <ThemedText type="h4">{user.username}</ThemedText>
                  <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: Spacing.xs }}>
                    Başvuru: {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                  </ThemedText>
                </View>

                <View style={styles.userActions}>
                  <Pressable
                    onPress={() => handleApprove(user)}
                    disabled={loading}
                    style={({ pressed }) => [
                      styles.actionButton,
                      {
                        backgroundColor: colors.success,
                        opacity: pressed || loading ? 0.6 : 1,
                      },
                    ]}
                  >
                    <Feather name="check" size={18} color="#FFFFFF" />
                    <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                      Onayla
                    </ThemedText>
                  </Pressable>

                  <Pressable
                    onPress={() => handleReject(user)}
                    disabled={loading}
                    style={({ pressed }) => [
                      styles.actionButton,
                      {
                        backgroundColor: colors.destructive,
                        opacity: pressed || loading ? 0.6 : 1,
                      },
                    ]}
                  >
                    <Feather name="x" size={18} color="#FFFFFF" />
                    <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                      Reddet
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        <Pressable
          onPress={logout}
          style={({ pressed }) => [
            styles.logoutButton,
            {
              backgroundColor: colors.destructive,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Feather name="log-out" size={18} color="#FFFFFF" />
          <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
            Çıkış Yap
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  header: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
  },
  userCard: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  userInfo: {
    gap: Spacing.xs,
  },
  userActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
});
