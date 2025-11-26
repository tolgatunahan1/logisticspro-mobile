import React from "react";
import { Modal, View, Pressable, TextInput, StyleSheet, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

interface AccountSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  editUsername: string;
  editPassword: string;
  setEditUsername: (value: string) => void;
  setEditPassword: (value: string) => void;
  isUpdating: boolean;
  onSave: () => void;
}

export function AccountSettingsModal({
  visible,
  onClose,
  editUsername,
  editPassword,
  setEditUsername,
  setEditPassword,
  isUpdating,
  onSave,
}: AccountSettingsModalProps) {
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return { hasMinLength, hasUpperCase, hasNumber };
  };

  const passwordValidation = validatePassword(editPassword);
  const isPasswordValid = passwordValidation.hasMinLength && passwordValidation.hasUpperCase && passwordValidation.hasNumber;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.backgroundDefault }]}>
          <View style={styles.modalHeader}>
            <ThemedText type="h3">Hesap Ayarları</ThemedText>
            <Pressable onPress={onClose}>
              <Feather name="x" size={24} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.modalInputs}>
            <View>
              <ThemedText type="small" style={{ fontWeight: "600", marginBottom: Spacing.sm }}>
                Kullanıcı Adı
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.backgroundRoot,
                  },
                ]}
                placeholder="Kullanıcı Adınız"
                placeholderTextColor={colors.textSecondary}
                value={editUsername}
                onChangeText={setEditUsername}
                editable={!isUpdating}
              />
            </View>

            <View>
              <ThemedText type="small" style={{ fontWeight: "600", marginBottom: Spacing.sm }}>
                Şifre
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.backgroundRoot,
                  },
                ]}
                placeholder="Yeni Şifreniz"
                placeholderTextColor={colors.textSecondary}
                value={editPassword}
                onChangeText={setEditPassword}
                secureTextEntry
                editable={!isUpdating}
              />
              <View style={{ marginTop: Spacing.md, gap: Spacing.xs }}>
                <ThemedText type="small" style={{ color: passwordValidation.hasMinLength ? colors.success : colors.textSecondary }}>
                  {passwordValidation.hasMinLength ? "✓" : "○"} En az 8 karakter
                </ThemedText>
                <ThemedText type="small" style={{ color: passwordValidation.hasUpperCase ? colors.success : colors.textSecondary }}>
                  {passwordValidation.hasUpperCase ? "✓" : "○"} En az bir büyük harf (A-Z)
                </ThemedText>
                <ThemedText type="small" style={{ color: passwordValidation.hasNumber ? colors.success : colors.textSecondary }}>
                  {passwordValidation.hasNumber ? "✓" : "○"} En az bir rakam (0-9)
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.modalButtons}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                { flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.sm, opacity: pressed ? 0.7 : 1 },
                { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" },
              ]}
            >
              <ThemedText type="body" style={{ textAlign: "center", fontWeight: "600" }}>
                İptal
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={onSave}
              disabled={isUpdating || !isPasswordValid}
              style={({ pressed }) => [
                {
                  flex: 1,
                  paddingVertical: Spacing.md,
                  borderRadius: BorderRadius.sm,
                  backgroundColor: isPasswordValid ? theme.link : colors.textSecondary,
                  opacity: pressed || isUpdating || !isPasswordValid ? 0.6 : 1,
                },
              ]}
            >
              <ThemedText type="body" style={{ textAlign: "center", fontWeight: "600", color: "#FFFFFF" }}>
                {isUpdating ? "Güncelleniyor..." : "Kaydet"}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalInputs: {
    gap: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
});
