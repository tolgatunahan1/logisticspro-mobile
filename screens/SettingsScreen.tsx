import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable, Alert, TextInput, Modal, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getIBANs, addIBAN, deleteIBAN, IBAN, getCompanyWallet, getUnpaidCommissions, markCommissionAsPaid, CompanyWallet, CompletedJob } from "@/utils/storage";

export default function SettingsScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const colors = isDark ? Colors.dark : Colors.light;

  const [ibans, setIbans] = useState<IBAN[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [ibanInput, setIbanInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [wallet, setWallet] = useState<CompanyWallet | null>(null);
  const [unpaidCommissions, setUnpaidCommissions] = useState<CompletedJob[]>([]);
  const [isMarkingPaid, setIsMarkingPaid] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const ibanData = await getIBANs();
    setIbans(ibanData);
    const walletData = await getCompanyWallet();
    setWallet(walletData);
    const unpaidData = await getUnpaidCommissions();
    setUnpaidCommissions(unpaidData);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
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
      await loadData();
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
          await loadData();
        },
      },
    ]);
  };

  const handleMarkAsPaid = async (jobId: string) => {
    setIsMarkingPaid(jobId);
    const result = await markCommissionAsPaid(jobId);
    if (result) {
      await loadData();
      Alert.alert("Başarılı", "Komisyon ödendi olarak işaretlendi ve cüzdana eklendi");
    } else {
      Alert.alert("Hata", "İşlem başarısız oldu");
    }
    setIsMarkingPaid(null);
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
          onPress: logout,
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}>
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
          <View style={styles.sectionHeader}>
            <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
              Şirket Cüzdanı
            </ThemedText>
          </View>
          {wallet && (
            <View style={{ gap: Spacing.md, marginBottom: Spacing.lg }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <ThemedText type="small" style={{ color: colors.textSecondary }}>
                  Cüzdan Bakiyesi
                </ThemedText>
                <ThemedText type="h3" style={{ color: theme.link, fontWeight: "700" }}>
                  {wallet.totalBalance.toFixed(2)} ₺
                </ThemedText>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <ThemedText type="small" style={{ color: colors.textSecondary }}>
                  Toplam Kazanç
                </ThemedText>
                <ThemedText type="body" style={{ color: theme.success || "#4CAF50", fontWeight: "600" }}>
                  {wallet.totalEarned.toFixed(2)} ₺
                </ThemedText>
              </View>
            </View>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: colors.backgroundDefault }]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
              Ödeme Bekleyen İşler ({unpaidCommissions.length})
            </ThemedText>
          </View>
          {unpaidCommissions.length > 0 ? (
            <View style={{ gap: Spacing.md }}>
              {unpaidCommissions.map((job) => (
                <View
                  key={job.id}
                  style={[
                    styles.ibanCard,
                    { backgroundColor: isDark ? "rgba(255, 193, 7, 0.1)" : "rgba(255, 193, 7, 0.05)" },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <ThemedText type="small" style={{ fontWeight: "600" }}>
                      {job.cargoType}
                    </ThemedText>
                    <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: Spacing.xs }}>
                      {job.loadingLocation} → {job.deliveryLocation}
                    </ThemedText>
                    <ThemedText type="h4" style={{ color: theme.link, fontWeight: "700", marginTop: Spacing.sm }}>
                      {parseFloat(job.commissionCost).toFixed(2)} ₺
                    </ThemedText>
                  </View>
                  <Pressable
                    onPress={() => handleMarkAsPaid(job.id)}
                    disabled={isMarkingPaid === job.id}
                    style={({ pressed }) => [
                      {
                        paddingVertical: Spacing.sm,
                        paddingHorizontal: Spacing.md,
                        borderRadius: BorderRadius.sm,
                        backgroundColor: theme.link,
                        opacity: pressed || isMarkingPaid === job.id ? 0.7 : 1,
                      },
                    ]}
                  >
                    <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                      {isMarkingPaid === job.id ? "İşleniyor..." : "Ödendi"}
                    </ThemedText>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : (
            <ThemedText type="small" style={{ color: colors.textSecondary, marginBottom: Spacing.md }}>
              Tüm ödemeler tamamlanmıştır
            </ThemedText>
          )}
        </View>

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
