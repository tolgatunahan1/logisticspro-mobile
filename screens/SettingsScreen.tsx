import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable, Alert, ScrollView, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as Notifications from "expo-notifications";

import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../contexts/AuthContext";
import { Spacing, BorderRadius, Colors } from "../constants/theme";
import { getIBANs, addIBAN, deleteIBAN, IBAN } from "../utils/storage";
import { IBANListModal } from "../components/IBANListModal";

export default function SettingsScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { logout } = useAuth();
  const colors = isDark ? Colors.dark : Colors.light;

  const [ibans, setIbans] = useState<IBAN[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [ibanInput, setIbanInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ibanToDelete, setIbanToDelete] = useState<IBAN | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = async () => {
    Alert.alert("Çıkış", "Hesaptan çıkış yapmak istiyor musunuz?", [
      { text: "İptal", onPress: () => {} },
      {
        text: "Çıkış Yap",
        onPress: async () => {
          await logout();
        },
        style: "destructive",
      },
    ]);
  };

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

  const handleDeleteIBAN = (iban: IBAN) => {
    console.log("🗑️ handleDeleteIBAN called for:", iban.id);
    setIbanToDelete(iban);
    setShowDeleteConfirm(true);
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
                  <Pressable onPress={() => handleDeleteIBAN(iban)} hitSlop={8}>
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

      {/* Delete IBAN Modal */}
      <Modal visible={showDeleteConfirm} animationType="fade" transparent onRequestClose={() => setShowDeleteConfirm(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", paddingHorizontal: Spacing.lg }}>
          <View style={{ backgroundColor: theme.backgroundRoot, borderRadius: BorderRadius.lg, padding: Spacing.xl, width: "100%", maxWidth: 300 }}>
            <ThemedText type="h4" style={{ marginBottom: Spacing.md, fontWeight: "700" }}>IBAN Sil</ThemedText>
            <ThemedText type="body" style={{ marginBottom: Spacing.lg, color: colors.textSecondary }}>
              "{ibanToDelete?.nameSurname}" adlı IBAN kaydını silmek istediğinizden emin misiniz?
            </ThemedText>
            <View style={{ flexDirection: "row", gap: Spacing.md }}>
              <Pressable
                onPress={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                style={{ flex: 1, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.sm, backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }}
              >
                <ThemedText type="body" style={{ color: theme.link, textAlign: "center", fontWeight: "600" }}>İptal</ThemedText>
              </Pressable>
              <Pressable
                onPress={async () => {
                  if (!ibanToDelete) return;
                  console.log("🔥 DELETE CONFIRMED FOR IBAN:", ibanToDelete.id);
                  setIsDeleting(true);
                  const beforeDelete = ibans.filter(i => i.id !== ibanToDelete.id);
                  setIbans(beforeDelete);
                  try {
                    await deleteIBAN(ibanToDelete.id);
                    console.log("✅ deleteIBAN completed");
                    for (let i = 0; i < 3; i++) {
                      await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
                      const fresh = await getIBANs();
                      if (!fresh.some(ib => ib.id === ibanToDelete.id)) {
                        setIbans(fresh);
                        break;
                      }
                    }
                    setShowDeleteConfirm(false);
                  } catch (error) {
                    console.error("❌ Delete error:", error);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                disabled={isDeleting}
                style={{ flex: 1, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.sm, backgroundColor: colors.destructive }}
              >
                <ThemedText type="body" style={{ color: "#FFFFFF", textAlign: "center", fontWeight: "600" }}>Sil</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20, marginBottom: Spacing.md }}>
                  LogisticsPRO, tüm kişisel verilerinizi cihazınızda yerel olarak saklar. Hiçbir veri sunucuya, buluta veya üçüncü taraf hizmetlerine gönderilmez.
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  Veriler yalnızca sizin tarafından erişilir. Geliştirici veya başka hiç kimse verilerinize erişemez.
                </ThemedText>
              </View>

              <View style={styles.section}>
                <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
                  GDPR ve KVKK Uyumluluğu
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20, marginBottom: Spacing.md }}>
                  Uygulama Avrupa Birliği Genel Veri Koruma Yönetmeliği (GDPR) ve Türk Kişisel Verileri Koruma Kanunu (KVKK) tamamen uyumludur.
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20, fontWeight: "600", marginBottom: Spacing.sm }}>
                  Kullanıcı Hakları:
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • Erişim - Tüm verilerinizi görüntüleme hakkı
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • Taşınabilirlik - Verilerinizi JSON formatında export etme hakkı
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • Silinme - Tüm verilerinizi kalıcı olarak silme hakkı
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • Düzeltme - Verilerinizi istediğiniz zaman güncelleme hakkı
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • Kısıtlama - Veri işlemesinin sınırlandırılmasını talep etme hakkı
                </ThemedText>
              </View>

              <View style={styles.section}>
                <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
                  Güvenlik Teknolojileri
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20, marginBottom: Spacing.sm }}>
                  Hassas veriler (şifreler, IBAN) aşağıdaki güvenlik katmanları ile korunmaktadır:
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • iOS Keychain - Apple'ın işletim sistemi düzeyinde güvenli depolama
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • Android Keystore - Donanım tarafından desteklenen kriptografik anahtar yönetimi
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • Veri Şifreleme - Hassas bilgiler cihazda şifrelenip saklanır
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • Yerel Depolama - Tüm veriler cihazın yerel dosya sisteminde tutulur
                </ThemedText>
              </View>

              <View style={styles.section}>
                <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
                  Verileriniz Hakkında Bilgi
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20, marginBottom: Spacing.sm }}>
                  Uygulama aşağıdaki kategorilerde veriler saklayabilir:
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • Taşıyıcı bilgileri (ad, telefon, araç tipi)
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • Firma ve müşteri bilgileri
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • İş ve proje detayları
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • IBAN ve banka bilgileri (Keychain'de şifrelenmiş)
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • Ödeme ve komisyon kayıtları
                </ThemedText>
              </View>

              <View style={styles.section}>
                <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
                  Sızıntı Olmayan Mimarı
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  LogisticsPRO tamamen offline çalışır ve hiçbir ağ bağlantısı gerektirmez. İnternet olup olmadığı uygulamanın çalışmasını etkilemez.
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
                Sürüm 1.0.1 (Security Edition)
              </ThemedText>

              <View style={styles.divider} />

              <View style={styles.section}>
                <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
                  Hakkında
                </ThemedText>
                <ThemedText type="body" style={{ color: colors.textSecondary, lineHeight: 22, marginBottom: Spacing.md }}>
                  LogisticsPRO, nakliye ve lojistik firmaları için profesyonel taşıyıcı yönetim uygulamasıdır. Taşıyıcı kayıt, iş planlama, takip ve ödeme yönetimini basit ve hızlı hale getirmek için tasarlanmıştır.
                </ThemedText>
                <ThemedText type="body" style={{ color: colors.textSecondary, lineHeight: 22 }}>
                  Uygulama, taşıyıcıların bulunabilirliğini, işlerin takip edilmesini ve WhatsApp entegrasyonu ile hızlı bilgi paylaşımını destekler. Cüzdan sistemi ile gelirlerinizi ve komisyonlarınızı kolayca yönetin.
                </ThemedText>
              </View>

              <View style={styles.section}>
                <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
                  Temel Özellikler
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • Taşıyıcı yönetimi ve kayıt
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • Firma ve müşteri yönetimi
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • Planlanan ve gerçekleşen işler
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • WhatsApp ile hızlı iletişim
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • IBAN ve ödeme yönetimi
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • Cüzdan ve komisyon takibi
                </ThemedText>
              </View>

              <View style={styles.section}>
                <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
                  Geliştirici
                </ThemedText>
                <ThemedText type="body" style={{ color: colors.textSecondary, marginBottom: Spacing.md, fontWeight: "600" }}>
                  Tolga Tunahan
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  Tasarım, geliştirme ve proje yönetimi
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
                <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
                  İletişim ve Destek
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20, marginBottom: Spacing.md }}>
                  Herhangi bir sorun, soru veya geri bildiriminiz için iletişime geçin.
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20, fontWeight: "600" }}>
                  E-posta:
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.link, lineHeight: 20, marginBottom: Spacing.md }}>
                  tolgatunahan@icloud.com
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, lineHeight: 20, fontWeight: "600" }}>
                  Telefon:
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.link, lineHeight: 20 }}>
                  +90 542 382 2832
                </ThemedText>
              </View>

              <View style={styles.section}>
                <ThemedText type="small" style={{ color: colors.textSecondary, textAlign: "center", lineHeight: 20 }}>
                  © 2025 Tolga Tunahan. Tüm hakları saklıdır.
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary, textAlign: "center", lineHeight: 20, marginTop: Spacing.md }}>
                  Güncelleme: 26 Kasım 2025
                </ThemedText>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            {
              backgroundColor: colors.destructive,
              opacity: pressed ? 0.8 : 1,
              marginHorizontal: Spacing.xl,
              marginBottom: insets.bottom + Spacing.xl,
            },
          ]}
        >
          <Feather name="log-out" size={20} color="white" />
          <ThemedText type="body" style={[styles.logoutText, { color: "white" }]}>
            Çıkış Yap
          </ThemedText>
        </Pressable>
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
