import React from "react";
import { Modal, View, Pressable, TextInput, StyleSheet, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { useTheme } from "../hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "../constants/theme";

interface IBANListModalProps {
  visible: boolean;
  onClose: () => void;
  nameInput: string;
  setNameInput: (value: string) => void;
  ibanInput: string;
  setIbanInput: (value: string) => void;
  isAdding: boolean;
  onSave: () => void;
}

export function IBANListModal({
  visible,
  onClose,
  nameInput,
  setNameInput,
  ibanInput,
  setIbanInput,
  isAdding,
  onSave,
}: IBANListModalProps) {
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.backgroundDefault }]}>
          <View style={styles.modalHeader}>
            <ThemedText type="h3">İBAN Ekle</ThemedText>
            <Pressable onPress={onClose}>
              <Feather name="x" size={24} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.modalInputs}>
            <View>
              <ThemedText type="small" style={{ fontWeight: "600", marginBottom: Spacing.sm }}>
                Ad Soyad
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
                placeholder="Adınız Soyadınız"
                placeholderTextColor={colors.textSecondary}
                value={nameInput}
                onChangeText={setNameInput}
              />
            </View>

            <View>
              <ThemedText type="small" style={{ fontWeight: "600", marginBottom: Spacing.sm }}>
                IBAN Numarası
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
                placeholder="TR00 0000 0000..."
                placeholderTextColor={colors.textSecondary}
                value={ibanInput}
                onChangeText={setIbanInput}
              />
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
              disabled={isAdding}
              style={({ pressed }) => [
                {
                  flex: 1,
                  paddingVertical: Spacing.md,
                  borderRadius: BorderRadius.sm,
                  backgroundColor: theme.link,
                  opacity: pressed || isAdding ? 0.8 : 1,
                },
              ]}
            >
              <ThemedText type="body" style={{ textAlign: "center", fontWeight: "600", color: "#FFFFFF" }}>
                Kaydet
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
