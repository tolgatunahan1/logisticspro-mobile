import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable, FlatList, Alert, ActivityIndicator } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../contexts/AuthContext";
import { Spacing, BorderRadius, Colors } from "../constants/theme";
import { getPendingUsers, approveUser, rejectUser } from "../utils/userManagement";

export default function AdminDashboard() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { logout } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const colors = isDark ? Colors.dark : Colors.light;

  const loadPendingUsers = useCallback(async () => {
    setLoading(true);
    try {
      const users = await getPendingUsers();
      setPendingUsers(users);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPendingUsers();
    }, [loadPendingUsers])
  );

  const handleApprove = async (userId: string) => {
    Alert.alert("Onayla", "Kullanıcı onaylanacak mı?", [
      { text: "İptal" },
      {
        text: "Onayla",
        onPress: async () => {
          await approveUser(userId);
          await loadPendingUsers();
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
          await loadPendingUsers();
        },
        style: "destructive",
      },
    ]);
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
        <View style={styles.centerContainer}>
          <ThemedText type="body" style={{ color: colors.textSecondary }}>
            Beklemede kullanıcı yok
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={pendingUsers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: Spacing.xl, gap: Spacing.md }}
          renderItem={({ item }) => (
            <View
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
          )}
        />
      )}
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
  section: {
    paddingVertical: Spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
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
