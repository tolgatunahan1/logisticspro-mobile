import React from "react";
import { StyleSheet, View, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

export default function SettingsScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const colors = isDark ? Colors.dark : Colors.light;

  const handleLogout = () => {
    Alert.alert(
      "Çıkış Yap",
      "Çıkış yapmak istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Çıkış Yap",
          style: "destructive",
          onPress: logout,
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={[styles.section, { backgroundColor: colors.backgroundDefault }]}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, { backgroundColor: theme.link }]}>
              <Feather name="user" size={24} color={colors.buttonText} />
            </View>
            <View style={styles.userDetails}>
              <ThemedText type="h4">{user?.username}</ThemedText>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                Oturum açık
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.backgroundDefault }]}>
          <View style={styles.infoRow}>
            <Feather name="info" size={20} color={colors.textSecondary} />
            <View style={styles.infoText}>
              <ThemedText type="body">Uygulama Hakkında</ThemedText>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                Nakliyeci Kayıt v1.0.0
              </ThemedText>
            </View>
          </View>
        </View>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            {
              backgroundColor: colors.destructive,
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
        >
          <Feather name="log-out" size={18} color={colors.buttonText} />
          <ThemedText type="body" style={[styles.logoutText, { color: colors.buttonText }]}>
            Çıkış Yap
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  section: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  userDetails: {
    gap: Spacing.xs,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  infoText: {
    gap: Spacing.xs,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xs,
    gap: Spacing.sm,
    marginTop: "auto",
  },
  logoutText: {
    fontWeight: "600",
  },
});
