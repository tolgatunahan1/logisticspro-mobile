import React from "react";
import {
  Modal,
  View,
  Pressable,
  TextInput,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { useTheme } from "../hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "../constants/theme";
import { IBAN } from "../utils/storage";

interface IBANListModalProps {
  visible: boolean;
  onClose: () => void;
  nameInput: string;
  setNameInput: (value: string) => void;
  ibanInput: string;
  setIbanInput: (value: string) => void;
  isAdding: boolean;
  onSave: () => void;
  ibanList: IBAN[];
  onDeleteIBAN: (iban: IBAN) => void;
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
  ibanList,
  onDeleteIBAN,
}: IBANListModalProps) {
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const modalHeight = isTablet ? Math.min(height * 0.9, 700) : "90%";

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Pressable
          style={[
            styles.modalOverlay,
            { backgroundColor: "rgba(0,0,0,0.5)" },
          ]}
          onPress={onClose}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.backgroundDefault,
                height: modalHeight,
                maxWidth: isTablet ? 600 : "100%",
              },
            ]}
          >
            {/* HEADER */}
            <View style={styles.modalHeader}>
              <ThemedText type="h3">İBAN Yönetimi</ThemedText>
              <Pressable onPress={onClose} hitSlop={10}>
                <Feather name="x" size={24} color={colors.text} />
              </Pressable>
            </View>

            {/* CONTENT SCROLL */}
            <ScrollView
              scrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              style={{ flex: 1 }}
            >
              <View style={{ paddingHorizontal: Spacing.lg }}>
                {/* KAYıTLi IBAN'LAR */}
                {ibanList.length > 0 && (
                  <View style={{ marginBottom: Spacing.lg }}>
                    <ThemedText
                      type="subtitle"
                      style={{
                        fontWeight: "600",
                        marginBottom: Spacing.md,
                      }}
                    >
                      Kayıtlı IBAN'lar ({ibanList.length})
                    </ThemedText>
                    {ibanList.map((item) => (
                      <View
                        key={item.id}
                        style={[
                          styles.ibanItem,
                          {
                            borderColor: colors.border,
                            backgroundColor: colors.backgroundRoot,
                          },
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <ThemedText
                            type="subtitle"
                            style={{ fontWeight: "600" }}
                          >
                            {item.nameSurname || "İsimsiz"}
                          </ThemedText>
                          <ThemedText
                            type="caption"
                            style={{
                              color: colors.textSecondary,
                              marginTop: 4,
                            }}
                          >
                            {item.ibanNumber}
                          </ThemedText>
                        </View>
                        <Pressable
                          onPress={() => onDeleteIBAN(item)}
                          style={{ padding: Spacing.sm }}
                          hitSlop={8}
                        >
                          <Feather
                            name="trash-2"
                            size={20}
                            color={colors.destructive}
                          />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}

                {/* YENİ IBAN EKLEME FORMU */}
                <View
                  style={{
                    borderTopWidth: ibanList.length > 0 ? 1 : 0,
                    borderTopColor: colors.border,
                    paddingTop:
                      ibanList.length > 0 ? Spacing.lg : 0,
                  }}
                >
                  <ThemedText
                    type="subtitle"
                    style={{
                      fontWeight: "600",
                      marginBottom: Spacing.md,
                    }}
                  >
                    Yeni IBAN Ekle
                  </ThemedText>
                  <View style={styles.modalInputs}>
                    <View>
                      <ThemedText
                        type="small"
                        style={{
                          fontWeight: "600",
                          marginBottom: Spacing.sm,
                        }}
                      >
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
                        editable={!isAdding}
                      />
                    </View>

                    <View>
                      <ThemedText
                        type="small"
                        style={{
                          fontWeight: "600",
                          marginBottom: Spacing.sm,
                        }}
                      >
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
                        editable={!isAdding}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* FOOTER BUTTONS */}
            <View
              style={[
                styles.modalButtons,
                {
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  paddingHorizontal: Spacing.lg,
                  paddingVertical: Spacing.lg,
                },
              ]}
            >
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.modalButton,
                  {
                    backgroundColor: pressed
                      ? colors.backgroundSecondary
                      : colors.backgroundRoot,
                    borderWidth: 1,
                    borderColor: colors.border,
                  },
                ]}
                disabled={isAdding}
              >
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  İptal
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={onSave}
                disabled={isAdding}
                style={({ pressed }) => [
                  styles.modalButton,
                  {
                    backgroundColor: theme.link,
                    opacity: isAdding || pressed ? 0.8 : 1,
                  },
                ]}
              >
                <ThemedText
                  type="body"
                  style={{
                    textAlign: "center",
                    fontWeight: "600",
                    color: "#FFFFFF",
                  }}
                >
                  {isAdding ? "Kaydediliyor..." : "Ekle"}
                </ThemedText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    width: "100%",
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    flexDirection: "column",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  ibanItem: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  modalInputs: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  input: {
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
});
