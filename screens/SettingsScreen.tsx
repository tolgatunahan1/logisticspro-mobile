import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable, Alert, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import * as Notifications from "expo-notifications";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getIBANs, addIBAN, deleteIBAN, IBAN } from "@/utils/storage";
import { IBANListModal } from "@/components/IBANListModal";

export default function SettingsScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const colors = isDark ? Colors.dark : Colors.light;

  const [ibans, setIbans] = useState<IBAN[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [ibanInput, setIbanInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

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


  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={{ paddingTop: Spacing.xl * 2, paddingBottom: insets.bottom + Spacing.xl }}>
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

        <Pressable onPress={() => setShowAboutModal(true)}>
          <View style={[styles.section, { backgroundColor: colors.backgroundDefault }]}>
            <View style={styles.infoRow}>
              <Feather name="info" size={20} color={colors.textSecondary} />
              <View style={styles.infoText}>
                <ThemedText type="body">Hakkında</ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary }}>
                  LogisticsPRO v1.0.0
                </ThemedText>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textSecondary} />
            </View>
          </View>
        </Pressable>

        <Pressable onPress={() => setShowPrivacyModal(true)}>
          <View style={[styles.section, { backgroundColor: colors.backgroundDefault }]}>
            <View style={styles.infoRow}>
              <Feather name="shield" size={20} color={colors.textSecondary} />
              <View style={styles.infoText}>
                <ThemedText type="body">Gizlilik Politikası</ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary }}>
                  GDPR ve KVKK uyumluluğu
                </ThemedText>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textSecondary} />
            </View>
          </View>
        </Pressable>


      </ScrollView>

      <IBANListModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        nameInput={nameInput}
        setNameInput={setNameInput}
        ibanInput={ibanInput}
        setIbanInput={setIbanInput}
        isAdding={isAdding}
        onSave={handleAddIBAN}
      />

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundRoot }]}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setShowPrivacyModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.aboutContent} showsVerticalScrollIndicator={false}>
              <ThemedText type="h4" style={styles.appName}>
                Gizlilik Politikası
              </ThemedText>

              <View style={styles.divider} />

              <View style={styles.section}>
                <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
                  Veri Toplama ve Kullanım
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  LogisticsPRO, kişisel verilerinizi cihazınızda yerel olarak saklar. Hiçbir veri sunucuya gönderilmez. Verilerin kontrolü tamamen sizde kalır.
                </ThemedText>
              </View>

              <View style={styles.section}>
                <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
                  GDPR Uyumluluğu
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20, marginBottom: Spacing.md }}>
                  LogisticsPRO, GDPR (Avrupa Genel Veri Koruma Yönetmeliği) ve KVKK (Kişisel Verileri Koruma Kanunu) uyumludur. Aşağıdaki hakları tanırız:
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • Erişim Hakkı - Verilerinizi istediğiniz zaman görüntüleyin
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • Portabilite Hakkı - Verilerinizi indirin (JSON formatında)
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • Silinme Hakkı - Tüm verilerinizi tamamen silin
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • Düzeltme Hakkı - Verilerinizi istediğiniz zaman değiştirin
                </ThemedText>
              </View>

              <View style={styles.section}>
                <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
                  Güvenlik Önlemleri
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  Hassas veriler (IBAN, şifreler) iOS Keychain ve Android Keystore tarafından korunan güvenli depolamada tutulur. Tüm veriler cihazda şifrelenir.
                </ThemedText>
              </View>

              <View style={styles.section}>
                <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
                  Veri Yönetimi Araçları
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  Ayarlar sayfasında "Veri Yönetimi" bölümünde:
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • Verileri İndir - Tüm verilerinizi JSON dosyası olarak export edin
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • Verileri Sil - Tüm kişisel verilerinizi kalıcı olarak silin
                </ThemedText>
              </View>

              <View style={styles.section}>
                <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
                  Üçüncü Taraf Uygulamalar
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  LogisticsPRO üçüncü taraf hizmetlerine veri göndermez. Uygulama tamamen bağımsız çalışır.
                </ThemedText>
              </View>

              <View style={styles.section}>
                <ThemedText type="small" style={{ color: colors.textSecondary, textAlign: "center", lineHeight: 20 }}>
                  Gizlilik Politikası - © 2025 Tolga Tunahan
                </ThemedText>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* About Modal */}
      {showAboutModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundRoot }]}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setShowAboutModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.aboutContent} showsVerticalScrollIndicator={false}>
              <ThemedText type="h4" style={styles.appName}>
                LogisticsPRO
              </ThemedText>
              <ThemedText type="body" style={[styles.version, { color: colors.textSecondary }]}>
                Sürüm 1.0.0
              </ThemedText>

              <View style={styles.divider} />

              <View style={styles.section}>
                <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
                  Hakkında
                </ThemedText>
                <ThemedText type="body" style={{ color: colors.textSecondary, lineHeight: 22 }}>
                  LogisticsPRO, nakliye ve lojistik firmaları için taşıyıcı yönetim uygulamasıdır. Taşıyıcıları kolayca kaydetmek, işleri planlayıp takip etmek ve ödeme bilgilerini yönetmek için tasarlanmıştır.
                </ThemedText>
              </View>

              <View style={styles.section}>
                <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
                  Tasarım ve Geliştirme
                </ThemedText>
                <ThemedText type="body" style={{ color: colors.textSecondary, marginBottom: Spacing.md, fontWeight: "600" }}>
                  Tolga Tunahan
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  Kodlayan ve tasarlayan: Tolga Tunahan
                </ThemedText>
              </View>

              <View style={styles.section}>
                <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
                  Kişisel Bilgi Güvenliği
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20, marginBottom: Spacing.md }}>
                  Hassas bilgileriniz (IBAN, şifreler, iletişim verileri) aşağıdaki güvenlik teknolojileri ile korunmaktadır:
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • iOS Keychain - Apple'ın güvenli depolama sistemi
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • Android Keystore - Android cihazlarda kriptografik anahtar depolaması
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • expo-secure-store - Expo framework'ün güvenli depolama kütüphanesi
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • Veri Şifreleme - Hassas veriler cihazda şifrelenip saklanır
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: Spacing.md, lineHeight: 20 }}>
                  Tüm veriler cihazda yerel olarak saklanır. Sunucuya hiçbir kişisel bilgi gönderilmez.
                </ThemedText>
              </View>

              <View style={styles.section}>
                <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
                  Lisanslama
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  LogisticsPRO tescilli yazılımdır. Telif hakkı © 2025 Tolga Tunahan. Tüm hakları saklıdır.
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: Spacing.md, lineHeight: 20 }}>
                  Bu uygulama Expo, React Native, React Navigation ve açık kaynak topluluğu tarafından geliştirilen teknolojiler kullanarak oluşturulmuştur.
                </ThemedText>
              </View>

              <View style={styles.section}>
                <ThemedText type="small" style={{ color: colors.textSecondary, textAlign: "center", lineHeight: 20 }}>
                  © 2025 Tolga Tunahan. Tüm hakları saklıdır.
                </ThemedText>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  modalContent: {
    maxHeight: "90%",
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: Spacing.lg,
  },
  aboutContent: {
    paddingBottom: Spacing.xl,
  },
  appName: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  version: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    marginBottom: Spacing.xl,
  },
});
