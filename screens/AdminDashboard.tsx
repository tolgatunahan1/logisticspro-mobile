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
import { getPendingUsers, getApprovedUsers, approveUser, rejectUser, unapproveUser, getPendingFirebaseUsers, getApprovedFirebaseUsers, approveFirebaseUser, rejectFirebaseUser, unapproveFirebaseUser, deleteFirebaseUser, deleteUser as deleteLocalUser } from "../utils/userManagement";
import { firebaseAuthService } from "../utils/firebaseAuth";

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
    setPendingUsers([]);
    setApprovedUsers([]);
    setLoading(true);
    try {
      // Get both local and Firebase users
      const [localPending, localApproved, fbPending, fbApproved] = await Promise.all([
        getPendingUsers(),
        getApprovedUsers(),
        getPendingFirebaseUsers(),
        getApprovedFirebaseUsers(),
      ]);
      // Merge all pending and approved users
      setPendingUsers([...localPending, ...fbPending]);
      setApprovedUsers([...localApproved, ...fbApproved]);
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
          // Try Firebase first, then local
          let approved = await approveFirebaseUser(userId);
          if (!approved) {
            approved = await approveUser(userId);
          }
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
          // Try Firebase first, then local
          let rejected = await rejectFirebaseUser(userId);
          if (!rejected) {
            rejected = await rejectUser(userId);
          }
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
          // Try Firebase first, then local
          let revoked = await unapproveFirebaseUser(userId);
          if (!revoked) {
            revoked = await unapproveUser(userId);
          }
          await loadUsers();
        },
        style: "destructive",
      },
    ]);
  };

  const handleDelete = async (userId: string, username: string) => {
    Alert.alert("Kullanıcıyı Tamamen Sil", `${username} kullanıcısı sistemden TAMAMen silinecek. Tüm verileri sıfırlanacak. Geri alınamaz!`, [
      { text: "İptal" },
      {
        text: "Sil",
        onPress: async () => {
          setLoading(true);
          try {
            // Delete from Firebase completely
            const deleted = await firebaseAuthService.deleteUserByUid(userId);
            if (deleted) {
              Alert.alert("Başarılı", "Kullanıcı tamamen silindi.");
              await loadUsers();
            } else {
              Alert.alert("Hata", "Silme işlemi başarısız.");
            }
          } catch (error: any) {
            Alert.alert("Hata", error?.message || "Silme sırasında hata oluştu");
          } finally {
            setLoading(false);
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleEmergencyCleanup = async () => {
    Alert.alert(
      "🚨 ACİL TEMIZLIK",
      "Tüm verileri kalıcı olarak sil? Admin hariç TÜM KULLANICILAR ve tüm veriler SILINECEK. Geri ALINAMAZ!",
      [
        { text: "İptal" },
        {
          text: "Evet, Sil",
          onPress: async () => {
            setLoading(true);
            try {
              const cleaned = await firebaseAuthService.cleanupDatabase();
              if (cleaned) {
                Alert.alert("✅ Temizlik Tamamlandı", "Tüm veriler silindi.");
                setPendingUsers([]);
                setApprovedUsers([]);
              } else {
                Alert.alert("Hata", "Temizlik başarısız.");
              }
            } catch (error: any) {
              Alert.alert("Hata", error?.message || "Temizlik sırasında hata oluştu");
            } finally {
              setLoading(false);
            }
          },
          style: "destructive",
        },
      ]
    );
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
        <View style={{ flexDirection: "row", gap: Spacing.md }}>
          <Pressable
            onPress={handleEmergencyCleanup}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Feather name="trash" size={24} color="#ef4444" />
          </Pressable>
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
                    {item.username || item.email}
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
                    {item.username || item.email}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: Spacing.xs }}>
                    Onaylandı: {formatDate(item.approvedAt)}
                  </ThemedText>
                </View>
                <View style={styles.actions}>
                  <Pressable
                    onPress={() => handleRevoke(item.id, item.username || item.email)}
                    style={[styles.button, { backgroundColor: "#f59e0b" }]}
                  >
                    <Feather name="slash" size={20} color="white" />
                  </Pressable>
                  <Pressable
                    onPress={() => handleDelete(item.id, item.username || item.email)}
                    style={[styles.button, { backgroundColor: "#ef4444" }]}
                  >
                    <Feather name="trash-2" size={20} color="white" />
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

