import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../contexts/AuthContext";
import { Spacing, BorderRadius, Colors } from "../constants/theme";
import { firebaseAuthService } from "../utils/firebaseAuth";

interface PendingUser {
  uid: string;
  email: string;
  createdAt: number;
}

interface ApprovedUser {
  uid: string;
  email: string;
  approvedAt: number;
}

export default function AdminDashboard() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<ApprovedUser[]>([]);
  const [loading, setLoading] = useState(false);

  const colors = isDark ? Colors.dark : Colors.light;

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const pending = await firebaseAuthService.getPendingUsers();
      const approved = await firebaseAuthService.getApprovedUsers();
      setPendingUsers(pending);
      setApprovedUsers(approved);
    } catch (error: any) {
      Alert.alert("Hata", "Verileri yüklemede hata: " + (error?.message || "Bilinmeyen hata"));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers])
  );

  const handleApprove = async (uid: string, email: string) => {
    Alert.alert("Onayla", `${email} kullanıcısını onaylamak istiyor musunuz?`, [
      { text: "İptal" },
      {
        text: "Onayla",
        onPress: async () => {
          setLoading(true);
          try {
            await firebaseAuthService.approveUser(uid);
            await loadUsers();
            Alert.alert("Başarılı", "Kullanıcı onaylandı.");
          } catch (error: any) {
            Alert.alert("Hata", error?.message || "Onaylama başarısız");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleReject = async (uid: string, email: string) => {
    Alert.alert("Reddet", `${email} kullanıcısını reddetmek istiyor musunuz?`, [
      { text: "İptal" },
      {
        text: "Reddet",
        onPress: async () => {
          setLoading(true);
          try {
            await firebaseAuthService.rejectUser(uid);
            await loadUsers();
            Alert.alert("Başarılı", "Kullanıcı reddedildi.");
          } catch (error: any) {
            Alert.alert("Hata", error?.message || "Reddetme başarısız");
          } finally {
            setLoading(false);
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleRevoke = async (uid: string, email: string) => {
    Alert.alert("Onayı Kaldır", `${email} kullanıcısının onayını kaldırmak istiyor musunuz?`, [
      { text: "İptal" },
      {
        text: "Kaldır",
        onPress: async () => {
          setLoading(true);
          try {
            await firebaseAuthService.unapproveUser(uid);
            await loadUsers();
            Alert.alert("Başarılı", "Kullanıcı onayı kaldırıldı.");
          } catch (error: any) {
            Alert.alert("Hata", error?.message || "Onay kaldırma başarısız");
          } finally {
            setLoading(false);
          }
        },
        style: "destructive",
      },
    ]);
  };


  const formatDate = (timestamp: number): string => {
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
        <View style={{ flexDirection: "row", gap: Spacing.md }}>
          <Pressable
            onPress={() => {
              Alert.alert("Çıkış", "Çıkış yapmak istiyor musunuz?", [
                { text: "İptal" },
                {
                  text: "Çıkış",
                  onPress: logout,
                  style: "destructive",
                },
              ]);
            }}
            disabled={loading}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Feather name="log-out" size={24} color={theme.text} />
          </Pressable>
        </View>
      </View>

      <View style={[styles.statsContainer, { paddingHorizontal: Spacing.xl }]}>
        <View style={[styles.statCard, { backgroundColor: colors.backgroundDefault, borderColor: colors.border }]}>
          <ThemedText type="small" style={{ color: colors.textSecondary }}>
            Aktif
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
        {/* Beklemede */}
        <View style={styles.section}>
          <ThemedText type="h4" style={{ paddingHorizontal: Spacing.xl }}>
            Beklemede ({pendingUsers.length})
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
            {pendingUsers.map((user) => (
              <View
                key={user.uid}
                style={[
                  styles.card,
                  { backgroundColor: colors.backgroundDefault, borderColor: colors.border },
                ]}
              >
                <View style={styles.userInfo}>
                  <ThemedText type="body" style={{ fontWeight: "600" }}>
                    {user.email}
                  </ThemedText>
                </View>
                <View style={styles.actions}>
                  <Pressable
                    onPress={() => handleApprove(user.uid, user.email)}
                    disabled={loading}
                    style={[styles.button, { backgroundColor: "#10b981" }]}
                  >
                    <Feather name="check" size={20} color="white" />
                  </Pressable>
                  <Pressable
                    onPress={() => handleReject(user.uid, user.email)}
                    disabled={loading}
                    style={[styles.button, { backgroundColor: colors.destructive }]}
                  >
                    <Feather name="x" size={20} color="white" />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Onaylanmış */}
        <View style={styles.section}>
          <ThemedText type="h4" style={{ paddingHorizontal: Spacing.xl }}>
            Onaylanmış ({approvedUsers.length})
          </ThemedText>
        </View>

        {approvedUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText type="body" style={{ color: colors.textSecondary }}>
              Onaylanmış kullanıcı yok
            </ThemedText>
          </View>
        ) : (
          <View style={{ paddingHorizontal: Spacing.xl, gap: Spacing.md, paddingBottom: Spacing.xl }}>
            {approvedUsers.map((user) => (
              <View
                key={user.uid}
                style={[
                  styles.card,
                  { backgroundColor: colors.backgroundDefault, borderColor: colors.border },
                ]}
              >
                <View style={styles.userInfo}>
                  <ThemedText type="body" style={{ fontWeight: "600" }}>
                    {user.email}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: Spacing.xs }}>
                    Onay: {formatDate(user.approvedAt)}
                  </ThemedText>
                </View>
                <View style={styles.actions}>
                  <Pressable
                    onPress={() => handleRevoke(user.uid, user.email)}
                    disabled={loading}
                    style={[styles.button, { backgroundColor: "#f59e0b" }]}
                  >
                    <Feather name="slash" size={20} color="white" />
                  </Pressable>
                </View>
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
