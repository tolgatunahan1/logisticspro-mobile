import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable, Alert, TextInput, Modal, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getIBANs, addIBAN, deleteIBAN, IBAN } from "@/utils/storage";

export default function SettingsScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, logout, updateProfile } = useAuth();
  const colors = isDark ? Colors.dark : Colors.light;

  const [ibans, setIbans] = useState<IBAN[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [ibanInput, setIbanInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editUsername, setEditUsername] = useState(user?.username || "");
  const [editPassword, setEditPassword] = useState(user?.password || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const loadIBANs = useCallback(async () => {
    const data = await getIBANs();
    setIbans(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadIBANs();
    }, [loadIBANs])
  );

  const handleAddIBAN = async () => {
    if (!ibanInput.trim() || !nameInput.trim()) {
      Alert.alert("Hata", "Lütfen IBAN ve Ad Soyad bilgisini girin");
      return;
    }

    setIsAdding(true);
    const newIBAN = await addIBAN({
      ibanNumber: ibanInput.trim(),
      nameSurname: nameInput.trim(),
    });

    if (newIBAN) {
      setIbanInput("");
      setNameInput("");
      setShowAddModal(false);
      await loadIBANs();
    } else {
      Alert.alert("Hata", "IBAN kaydedilemedi");
    }
    setIsAdding(false);
  };

  const handleDeleteIBAN = (id: string) => {
    Alert.alert("İbanı Sil", "Bu İBANı silmek istediğinizden emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          await deleteIBAN(id);
          await loadIBANs();
        },
      },
    ]);
  };

  const handleUpdateProfile = async () => {
    if (!editUsername.trim() || !editPassword.trim()) {
      Alert.alert("Hata", "Kullanıcı adı ve şifre boş olamaz");
      return;
    }

    setIsUpdating(true);
    const success = await updateProfile(editUsername.trim(), editPassword.trim());
    setIsUpdating(false);

    if (success) {
      Alert.alert("Başarılı", "Hesap bilgileri güncellendi");
      setShowAccountModal(false);
      
      // Bildirim gönder (Expo Go'da çalışır)
      try {
        await Notifications.presentNotificationAsync({
          title: "Hesap Bilgileri Güncellendi",
          body: `Kullanıcı adı: ${editUsername}`,
          data: { type: "account_update" },
          sound: true,
        });
      } catch (error) {
        console.log("Bildirim: Cihazda Expo Go'da test et");
      }
    } else {
      Alert.alert("Hata", "Hesap bilgileri güncellenemedi");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Çıkış Yap",
      "Çıkış yapmak istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Çıkış Yap",
          style: "destructive",
          onPress: () => {
            console.log("Logout button pressed");
            logout();
            console.log("Logout called");
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={{ paddingTop: Spacing.xl * 2, paddingBottom: insets.bottom + Spacing.xl }}>
        <Pressable onPress={() => setShowAccountModal(true)}>
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
              <Feather name="edit-2" size={18} color={theme.link} />
            </View>
          </View>
        </Pressable>

        <View style={[styles.section, { backgroundColor: colors.backgroundDefault }]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
              İBAN Yönetimi
            </ThemedText>
          </View>

          {ibans.length > 0 ? (
            <View style={{ gap: Spacing.sm }}>
              {ibans.map((iban) => (
                <View
                  key={iban.id}
                  style={[
                    styles.ibanCard,
                    { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)" },
                  ]}
                >
                  <View style={styles.ibanInfo}>
                    <ThemedText type="small" style={{ fontWeight: "600" }}>
                      {iban.nameSurname}
                    </ThemedText>
                    <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: Spacing.xs }}>
                      {iban.ibanNumber}
                    </ThemedText>
                  </View>
                  <Pressable onPress={() => handleDeleteIBAN(iban.id)}>
                    <Feather name="trash-2" size={18} color={colors.destructive} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : (
            <ThemedText type="small" style={{ color: colors.textSecondary, marginBottom: Spacing.md }}>
              Henüz bir IBAN kaydı yok
            </ThemedText>
          )}

          <Pressable
            onPress={() => setShowAddModal(true)}
            style={({ pressed }) => [
              styles.addButton,
              {
                backgroundColor: theme.link,
                opacity: pressed ? 0.8 : 1,
                marginTop: ibans.length > 0 ? Spacing.md : 0,
              },
            ]}
          >
            <Feather name="plus" size={18} color="#FFFFFF" />
            <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
              İBAN Ekle
            </ThemedText>
          </Pressable>
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
      </ScrollView>

      <Modal visible={showAccountModal} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">Hesap Ayarları</ThemedText>
              <Pressable onPress={() => setShowAccountModal(false)}>
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
              </View>
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setShowAccountModal(false)}
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
                onPress={handleUpdateProfile}
                disabled={isUpdating}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    paddingVertical: Spacing.md,
                    borderRadius: BorderRadius.sm,
                    backgroundColor: theme.link,
                    opacity: pressed || isUpdating ? 0.8 : 1,
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

      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">İBAN Ekle</ThemedText>
              <Pressable onPress={() => setShowAddModal(false)}>
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
                onPress={() => setShowAddModal(false)}
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
                onPress={handleAddIBAN}
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
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
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
  ibanCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  ibanInfo: {
    flex: 1,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
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
