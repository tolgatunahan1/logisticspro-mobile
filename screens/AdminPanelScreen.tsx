import React, { useState, useCallback } from "react";
import { View, StyleSheet, Pressable, Alert, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getPendingUsers, getApprovedUsers, approveUser, rejectUser, AppUser } from "@/utils/userManagement";

export default function AdminPanelScreen() {
  const { theme, isDark } = useTheme();
  const { logout } = useAuth();
  const colors = isDark ? Colors.dark : Colors.light;

  const [pendingUsers, setPendingUsers] = useState<AppUser[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      console.log("Loading users...");
      const pending = await getPendingUsers();
      const approved = await getApprovedUsers();
      console.log("Users loaded:", { pending: pending.length, approved: approved.length });
      setPendingUsers(pending);
      setApprovedUsers(approved);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers])
  );

  const handleApprove = (user: AppUser) => {
    Alert.alert(
      "Kullanıcı Onayla",
      `${user.username} kullanıcısını onaylamak istiyor musunuz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Onayla",
          onPress: async () => {
            setLoading(true);
            try {
              console.log("Approving user:", user.username);
              const success = await approveUser(user.id);
              console.log("Approve result:", success);
              if (success) {
                Alert.alert("Başarılı", `${user.username} onaylandı ve giriş yapabilir`);
                // Delay and reload
                await new Promise(resolve => setTimeout(resolve, 500));
                await loadUsers();
              } else {
                Alert.alert("Hata", "Onaylama başarısız oldu");
              }
            } catch (error) {
              console.error("Approve error:", error);
              Alert.alert("Hata", "Onaylama sırasında hata");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleReject = (user: AppUser) => {
    Alert.alert(
      "Kullanıcı Reddet",
      `${user.username} kullanıcısını reddetmek istiyor musunuz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Reddet",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              console.log("Rejecting user:", user.username);
              const success = await rejectUser(user.id);
              console.log("Reject result:", success);
              if (success) {
                Alert.alert("Başarılı", `${user.username} reddedildi`);
                // Delay and reload
                await new Promise(resolve => setTimeout(resolve, 500));
                await loadUsers();
              } else {
                Alert.alert("Hata", "Reddetme başarısız");
              }
            } catch (error) {
              console.error("Reject error:", error);
              Alert.alert("Hata", "Reddetme sırasında hata");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* İstatistikler */}
        <View style={[styles.header, { backgroundColor: colors.backgroundDefault }]}>
          <ThemedText type="h3">Admin Paneli</ThemedText>
          <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: Spacing.sm }}>
            Toplam: {pendingUsers.length + approvedUsers.length} | Bekleyen: {pendingUsers.length} | Onaylanmış: {approvedUsers.length}
          </ThemedText>
        </View>

        {/* Onay Bekleyen Kullanıcılar */}
        <View>
          <ThemedText type="h4" style={{ marginBottom: Spacing.md, color: colors.textSecondary }}>
            ⏳ Onay Bekleyen ({pendingUsers.length})
          </ThemedText>

          {pendingUsers.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.backgroundDefault }]}>
              <Feather name="inbox" size={32} color={colors.textSecondary} />
              <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: Spacing.sm }}>
                Bekleyen kullanıcı yok
              </ThemedText>
            </View>
          ) : (
            <View style={{ gap: Spacing.md }}>
              {pendingUsers.map((user) => (
                <View key={user.id} style={[styles.userCard, { backgroundColor: colors.backgroundDefault }]}>
                  <View style={styles.userInfo}>
                    <ThemedText type="h4">{user.username}</ThemedText>
                    <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: Spacing.xs }}>
                      Başvuru: {formatDate(user.createdAt)}
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
                      <Feather name="check" size={16} color="#FFFFFF" />
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
                      <Feather name="x" size={16} color="#FFFFFF" />
                      <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                        Reddet
                      </ThemedText>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Onaylanmış Kullanıcılar */}
        <View style={{ marginTop: Spacing["2xl"] }}>
          <ThemedText type="h4" style={{ marginBottom: Spacing.md, color: colors.textSecondary }}>
            ✓ Onaylanmış ({approvedUsers.length})
          </ThemedText>

          {approvedUsers.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.backgroundDefault }]}>
              <Feather name="smile" size={32} color={colors.textSecondary} />
              <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: Spacing.sm }}>
                Henüz onaylanmış kullanıcı yok
              </ThemedText>
            </View>
          ) : (
            <View style={{ gap: Spacing.md }}>
              {approvedUsers.map((user) => (
                <View key={user.id} style={[styles.approvedCard, { backgroundColor: colors.backgroundDefault, borderColor: colors.success }]}>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="h4">{user.username}</ThemedText>
                    <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: Spacing.xs }}>
                      Başvuru: {formatDate(user.createdAt)}
                    </ThemedText>
                    {user.approvedAt && (
                      <ThemedText type="small" style={{ color: colors.success, marginTop: Spacing.xs }}>
                        Onay: {formatDate(user.approvedAt)}
                      </ThemedText>
                    )}
                  </View>
                  <Feather name="check-circle" size={20} color={colors.success} />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Çıkış Butonu */}
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
  },
  emptyCard: {
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.sm,
  },
  userCard: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  approvedCard: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 2,
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
    marginTop: Spacing["2xl"],
    marginBottom: Spacing["2xl"],
  },
});
