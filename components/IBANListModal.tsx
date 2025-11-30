import React from "react";
import { Modal, View, Pressable, TextInput, StyleSheet, ScrollView } from "react-native";
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

  return (
    <Modal 
      visible={visible} 
      transparent={true} 
      animationType="slide"
      onRequestClose={onClose} 
    >
      <Pressable 
        style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()} style={{ width: '100%', height: '100%' }}> 
          <View style={[styles.modalContent, { backgroundColor: colors.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">İBAN Yönetimi</ThemedText>
              <Pressable onPress={onClose}>
                <Feather name="x" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView 
              scrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: '70%' }}
            >
              {/* KAYıTLı IBAN'LAR */}
              {ibanList.length > 0 && (
                <View style={{ marginBottom: Spacing.lg }}>
                  <ThemedText type="subtitle" style={{ fontWeight: "600", marginBottom: Spacing.md }}>
                    Kayıtlı IBAN'lar ({ibanList.length})
                  </ThemedText>
                  {ibanList.map((item) => (
                    <View 
                      key={item.id} 
                      style={[
                        styles.ibanItem, 
                        { 
                          borderColor: colors.border, 
                          backgroundColor: colors.backgroundRoot 
                        }
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <ThemedText type="subtitle" style={{ fontWeight: "600" }}>
                          {item.nameSurname || "İsimsiz"}
                        </ThemedText>
                        <ThemedText type="caption" style={{ color: colors.textSecondary, marginTop: 4 }}>
                          {item.ibanNumber}
                        </ThemedText>
                      </View>
                      <Pressable 
                        onPress={() => onDeleteIBAN(item)}
                        style={{ padding: Spacing.sm }}
                      >
                        <Feather name="trash-2" size={20} color={colors.destructive} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}

              {/* YENİ IBAN EKLEME FORMU */}
              <View style={{ borderTopWidth: ibanList.length > 0 ? 1 : 0, borderTopColor: colors.border, paddingTop: ibanList.length > 0 ? Spacing.lg : 0 }}>
                <ThemedText type="subtitle" style={{ fontWeight: "600", marginBottom: Spacing.md }}>
                  Yeni IBAN Ekle
                </ThemedText>
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
              </View>
            </ScrollView>

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
                  {isAdding ? "Kaydediliyor..." : "Ekle"}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </Pressable> 
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    width: '100%',
    height: '85%',
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.lg,
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ibanItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
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
