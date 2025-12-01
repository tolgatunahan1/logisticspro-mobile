import React, { useState, useCallback, useEffect } from "react";
import { StyleSheet, View, Pressable, Alert, ActivityIndicator, ScrollView, useWindowDimensions } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../contexts/AuthContext";
import { Spacing, BorderRadius, Colors, APP_CONSTANTS } from "../constants/theme";
import { firebaseAuthService } from "../utils/firebaseAuth";
import { RootStackParamList } from "../navigation/RootNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "AdminDashboard">;

// Alert Helper for Admin Actions
const showConfirmAlert = (
  title: string,
  message: string,
  actionText: string,
  onConfirm: () => void,
  isDestructive = false
) => {
  Alert.alert(title, message, [
    { text: APP_CONSTANTS.ALERT_MESSAGES.CANCEL_TEXT },
    {
      text: actionText,
      onPress: onConfirm,
      style: isDestructive ? "destructive" : "default",
    },
  ]);
};

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
  const { logout, user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<ApprovedUser[]>([]);
  const [loading, setLoading] = useState(false);

  const colors = isDark ? Colors.dark : Colors.light;

  const loadUsers = useCallback(async () => {
    try {
      const pending = await firebaseAuthService.getPendingUsers();
      const approved = await firebaseAuthService.getApprovedUsers();
      setPendingUsers(pending);
      setApprovedUsers(approved);
    } catch (error: any) {
      console.error("Hata:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
      const interval = setInterval(loadUsers, 5000);
      return () => clearInterval(interval);
    }, [loadUsers])
  );

  const handleApprove = useCallback(
    (uid: string, email: string) => {
      const onConfirm = async () => {
        setLoading(true);
        try {
          console.log("✅ User onaylanıyor:", email);
          await firebaseAuthService.approveUser(uid);
          await loadUsers();
          Alert.alert(
            "Başarılı",
            "Kullanıcı onaylandı"
          );
        } catch (error: any) {
          console.error("❌ Onay hatası:", error?.message);
          Alert.alert("Hata", error?.message || "Onaylama başarısız");
        } finally {
          setLoading(false);
        }
      };
      
      showConfirmAlert(
        "Onayla",
        `${email} kullanıcısını onaylamak istiyor musunuz?`,
        "Onayla",
        onConfirm
      );
    },
    [loadUsers]
  );

  const handleReject = useCallback(
    (uid: string, email: string) => {
      const onConfirm = async () => {
        setLoading(true);
        try {
          console.log("❌ User reddediliyor:", email);
          await firebaseAuthService.rejectUser(uid);
          await loadUsers();
          Alert.alert(
            "Başarılı",
            "Kullanıcı reddedildi"
          );
        } catch (error: any) {
          console.error("❌ Reddetme hatası:", error?.message);
          Alert.alert("Hata", error?.message || "Reddetme başarısız");
        } finally {
          setLoading(false);
        }
      };
      
      showConfirmAlert(
        "Reddet",
        `${email} kullanıcısını reddetmek istiyor musunuz?`,
        "Reddet",
        onConfirm,
        true
      );
    },
    [loadUsers]
  );

  const handleRevoke = useCallback(
    (uid: string, email: string) => {
      const onConfirm = async () => {
        setLoading(true);
        try {
          console.log("🔄 Onay kaldırılıyor:", email);
          await firebaseAuthService.unapproveUser(uid);
          await loadUsers();
          Alert.alert(
            "Başarılı",
            "Onay kaldırıldı"
          );
        } catch (error: any) {
          console.error("❌ Onay kaldırma hatası:", error?.message);
          Alert.alert("Hata", error?.message || "Onay kaldırma başarısız");
        } finally {
          setLoading(false);
        }
      };
      
      showConfirmAlert(
        "Onay Kaldır",
        `${email} kullanıcısının onayını kaldırmak istiyor musunuz?`,
        "Kaldır",
        onConfirm,
        true
      );
    },
    [loadUsers]
  );


  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString(APP_CONSTANTS.LOCALE, APP_CONSTANTS.DATE_FORMAT_OPTIONS);
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing.xl }]}>
      <View style={[styles.header, { paddingHorizontal: isTablet ? Spacing["2xl"] : Spacing.xl, paddingVertical: Spacing.lg }]}>
        <ThemedText type="h2">Admin Panel</ThemedText>
        <View style={{ flexDirection: "row", gap: Spacing.md }}>
          <Pressable
            onPress={async () => {
              try {
                await logout();
              } catch (error: any) {
                Alert.alert("Hata", error?.message || "Çıkış yapılırken hata oluştu");
              }
            }}
            disabled={loading}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, hitSlop: 8 })}
          >
            <Feather name="log-out" size={24} color={theme.text} />
          </Pressable>
        </View>
      </View>

      <View style={[styles.statsContainer, { paddingHorizontal: isTablet ? Spacing["2xl"] : Spacing.xl }]}>
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
          <ThemedText type="h3" style={{ fontWeight: "700", color: APP_CONSTANTS.STATUS_PENDING_COLOR }}>
            {pendingUsers.length}
          </ThemedText>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={[
          { flexGrow: 1 },
          { paddingHorizontal: isTablet ? Spacing["2xl"] : Spacing.xl }
        ]}
        showsVerticalScrollIndicator={false}
      >
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
