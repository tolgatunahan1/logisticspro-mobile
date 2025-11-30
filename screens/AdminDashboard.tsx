import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable, Alert, ActivityIndicator, ScrollView, useWindowDimensions } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../contexts/AuthContext";
import { Spacing, BorderRadius, Colors, APP_CONSTANTS } from "../constants/theme";
import { firebaseAuthService } from "../utils/firebaseAuth";

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
  const { logout } = useAuth();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
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

  const handleApprove = useCallback(
    (uid: string, email: string) => {
      showConfirmAlert(
        APP_CONSTANTS.ALERT_MESSAGES.APPROVE_TITLE,
        `${email} ${APP_CONSTANTS.ALERT_MESSAGES.APPROVE_TITLE.toLowerCase()} kullanıcısını onaylamak istiyor musunuz?`,
        APP_CONSTANTS.ALERT_MESSAGES.APPROVE_TEXT,
        async () => {
          setLoading(true);
          try {
            await firebaseAuthService.approveUser(uid);
            await loadUsers();
            Alert.alert(
              APP_CONSTANTS.ALERT_MESSAGES.SUCCESS_APPROVED,
              APP_CONSTANTS.ALERT_MESSAGES.SUCCESS_APPROVED_MSG
            );
          } catch (error: any) {
            Alert.alert(APP_CONSTANTS.ALERT_MESSAGES.ERROR_TITLE, error?.message || APP_CONSTANTS.ALERT_MESSAGES.ERROR_APPROVE_MSG);
          } finally {
            setLoading(false);
          }
        }
      );
    },
    [loadUsers]
  );

  const handleReject = useCallback(
    (uid: string, email: string) => {
      showConfirmAlert(
        APP_CONSTANTS.ALERT_MESSAGES.REJECT_TITLE,
        `${email} kullanıcısını reddetmek istiyor musunuz?`,
        APP_CONSTANTS.ALERT_MESSAGES.REJECT_TEXT,
        async () => {
          setLoading(true);
          try {
            await firebaseAuthService.rejectUser(uid);
            await loadUsers();
            Alert.alert(
              APP_CONSTANTS.ALERT_MESSAGES.SUCCESS_APPROVED,
              APP_CONSTANTS.ALERT_MESSAGES.SUCCESS_REJECTED_MSG
            );
          } catch (error: any) {
            Alert.alert(APP_CONSTANTS.ALERT_MESSAGES.ERROR_TITLE, error?.message || APP_CONSTANTS.ALERT_MESSAGES.ERROR_REJECT_MSG);
          } finally {
            setLoading(false);
          }
        },
        true
      );
    },
    [loadUsers]
  );

  const handleRevoke = useCallback(
    (uid: string, email: string) => {
      showConfirmAlert(
        APP_CONSTANTS.ALERT_MESSAGES.REVOKE_TITLE,
        `${email} kullanıcısının onayını kaldırmak istiyor musunuz?`,
        APP_CONSTANTS.ALERT_MESSAGES.REVOKE_TEXT,
        async () => {
          setLoading(true);
          try {
            await firebaseAuthService.unapproveUser(uid);
            await loadUsers();
            Alert.alert(
              APP_CONSTANTS.ALERT_MESSAGES.SUCCESS_APPROVED,
              APP_CONSTANTS.ALERT_MESSAGES.SUCCESS_REVOKED_MSG
            );
          } catch (error: any) {
            Alert.alert(APP_CONSTANTS.ALERT_MESSAGES.ERROR_TITLE, error?.message || APP_CONSTANTS.ALERT_MESSAGES.ERROR_REVOKE_MSG);
          } finally {
            setLoading(false);
          }
        },
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
            onPress={() => {
              Alert.alert(
                APP_CONSTANTS.ALERT_MESSAGES.LOGOUT_TITLE,
                APP_CONSTANTS.ALERT_MESSAGES.LOGOUT_CONFIRM_MSG,
                [
                  { text: APP_CONSTANTS.ALERT_MESSAGES.CANCEL_TEXT },
                  {
                    text: APP_CONSTANTS.ALERT_MESSAGES.LOGOUT_TEXT,
                    onPress: async () => {
                      await logout();
                    },
                    style: "destructive",
                  },
                ]
              );
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
