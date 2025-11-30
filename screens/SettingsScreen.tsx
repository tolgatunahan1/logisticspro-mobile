import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Linking,
  Platform,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { ThemedText } from "../components/ThemedText";
import { ScreenScrollView } from "../components/ScreenScrollView";
import { useTheme } from "../hooks/useTheme";
import { useScreenInsets } from "../hooks/useScreenInsets";
import { useAuth } from "../contexts/AuthContext";
import { Spacing, BorderRadius, Colors } from "../constants/theme";
import { getIBANs, addIBAN, deleteIBAN, IBAN } from "../utils/storage";
import { IBANListModal } from "../components/IBANListModal";
import { firebaseAuthService } from "../utils/firebaseAuth";

const AboutModal = ({ isVisible, onClose, colors }) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const modalWidth = isTablet ? Math.min(width * 0.85, 600) : "90%";
  const maxHeight = isTablet ? "75%" : "85%";

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={[
          styles.modalOverlay,
          { backgroundColor: "rgba(0, 0, 0, 0.5)" },
        ]}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.aboutModalContent,
            {
              backgroundColor: colors.backgroundDefault,
              width: modalWidth,
              maxHeight,
            },
          ]}
        >
          <View style={styles.aboutModalHeader}>
            <ThemedText type="h3">Hakkımızda</ThemedText>
            <Pressable onPress={onClose} hitSlop={8}>
              <Feather name="x" size={24} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={true}
            scrollEventThrottle={16}
            style={{ flex: 1 }}
          >
            <View style={{ paddingRight: Spacing.lg }}>
              {/* UYGULAMA BİLGİLERİ */}
              <ThemedText
                type="h4"
                style={{ marginBottom: Spacing.sm, fontWeight: "700" }}
              >
                LogisticsPRO v1.0.0
              </ThemedText>
              <ThemedText
                style={{
                  marginBottom: Spacing.lg,
                  color: colors.textSecondary,
                  lineHeight: 24,
                  fontStyle: "italic",
                }}
              >
                Profesyonel Nakliye ve Lojistik Yönetim Platformu
              </ThemedText>

              {/* ÜRÜN AÇIKLAMASI */}
              <ThemedText
                type="h4"
                style={{ marginTop: Spacing.xl, marginBottom: Spacing.sm, fontWeight: "700" }}
              >
                Ürün Açıklaması
              </ThemedText>
              <ThemedText
                style={{
                  marginBottom: Spacing.lg,
                  color: colors.textSecondary,
                  lineHeight: 24,
                }}
              >
                LogisticsPRO, Türkiye'de faaliyet gösteren nakliye ve lojistik
                şirketleri için geliştirilmiş, kurumsal düzeyde bir yönetim
                platformudur. Uygulama, operasyonel verimliliği artırmak, veri
                yönetimini merkezileştirmek ve iş süreçlerini dijitalleştirmek
                amacıyla tasarlanmıştır.
              </ThemedText>

              {/* TEMEL İŞLEVLER */}
              <ThemedText
                type="h4"
                style={{ marginTop: Spacing.xl, marginBottom: Spacing.sm, fontWeight: "700" }}
              >
                Temel İşlevler
              </ThemedText>
              <View style={{ marginBottom: Spacing.lg, paddingLeft: Spacing.md }}>
                <ThemedText
                  style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}
                >
                  • Nakliyeci Yönetimi - Araç, operatör ve sürücü profil yönetimi
                </ThemedText>
                <ThemedText
                  style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}
                >
                  • Şirket Yönetimi - Müşteri ve gönderici bilgisi saklama ve erişimi
                </ThemedText>
                <ThemedText
                  style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}
                >
                  • Sevkiyat Planlama - Rota tasarımı ve lojistik takibi
                </ThemedText>
                <ThemedText
                  style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}
                >
                  • Tamamlanan İşler - İş geçmişi ve arşivleme
                </ThemedText>
                <ThemedText
                  style={{
                    marginBottom: Spacing.lg,
                    color: colors.textSecondary,
                  }}
                >
                  • IBAN Yönetimi - Finansal işlem ve ödeme yönetimi
                </ThemedText>
              </View>

              {/* YETKILI KİŞİ BİLGİLERİ */}
              <ThemedText
                type="h4"
                style={{ marginTop: Spacing.xl, marginBottom: Spacing.sm, fontWeight: "700" }}
              >
                Yetkili Kişi ve İletişim
              </ThemedText>
              <View style={{ marginBottom: Spacing.lg, paddingLeft: Spacing.md }}>
                <ThemedText
                  style={{
                    marginBottom: Spacing.xs,
                    fontWeight: "600",
                    color: colors.text,
                  }}
                >
                  Tolga Tunahan
                </ThemedText>
                <ThemedText
                  style={{
                    marginBottom: Spacing.xs,
                    fontSize: 13,
                    color: colors.textSecondary,
                  }}
                >
                  Uygulama Yöneticisi ve Proje Sahibi
                </ThemedText>
                <ThemedText
                  style={{
                    marginBottom: Spacing.xs,
                    fontSize: 13,
                    color: colors.textSecondary,
                  }}
                >
                  📱 05423822832
                </ThemedText>
                <Pressable
                  onPress={() =>
                    Linking.openURL("mailto:tolgatunahan@icloud.com")
                  }
                >
                  <ThemedText type="link" style={{ fontSize: 13 }}>
                    📧 tolgatunahan@icloud.com
                  </ThemedText>
                </Pressable>
              </View>

              {/* GÜVENLİK MİMARİSİ */}
              <ThemedText
                type="h4"
                style={{ marginTop: Spacing.xl, marginBottom: Spacing.sm, fontWeight: "700" }}
              >
                Güvenlik Mimarisi
              </ThemedText>
              <View style={{ marginBottom: Spacing.lg, paddingLeft: Spacing.md }}>
                <ThemedText
                  style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}
                >
                  • Firebase Authentication - Güvenli kullanıcı kimlik
                  doğrulaması ve oturum yönetimi
                </ThemedText>
                <ThemedText
                  style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}
                >
                  • End-to-End Encryption - Hassas verilerin şifrelenmesi ve
                  korunması
                </ThemedText>
                <ThemedText
                  style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}
                >
                  • SSL/TLS Protokolü - İletişim kanallarının güvenliği
                </ThemedText>
                <ThemedText
                  style={{
                    marginBottom: Spacing.lg,
                    color: colors.textSecondary,
                  }}
                >
                  • Role-Based Access Control - Rol ve yetkilendirme yönetimi
                </ThemedText>
              </View>

              {/* VERİ SAKLAMA POLİTİKASI */}
              <ThemedText
                type="h4"
                style={{ marginTop: Spacing.xl, marginBottom: Spacing.sm, fontWeight: "700" }}
              >
                Veri Saklama Politikası
              </ThemedText>
              <View style={{ marginBottom: Spacing.lg, paddingLeft: Spacing.md }}>
                <ThemedText
                  style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}
                >
                  • Kişisel Bilgiler - Firebase Realtime Database'de şifreli
                  olarak saklanır
                </ThemedText>
                <ThemedText
                  style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}
                >
                  • İşlem Verileri - İş geçmişi ve finansal kayıtlar uzun dönem
                  için arşivlenir
                </ThemedText>
                <ThemedText
                  style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}
                >
                  • Otomatik Yedekleme - Veriler düzenli olarak yedeklenir
                </ThemedText>
                <ThemedText
                  style={{
                    marginBottom: Spacing.lg,
                    color: colors.textSecondary,
                  }}
                >
                  • GDPR Uyumluluğu - Kullanıcı gizliliği ve veri koruma
                  düzenlemeleri
                </ThemedText>
              </View>

              {/* ALT YAPIYI BILEŞENLERI */}
              <ThemedText
                type="h4"
                style={{ marginTop: Spacing.xl, marginBottom: Spacing.sm, fontWeight: "700" }}
              >
                Altyapı Bileşenleri
              </ThemedText>
              <View style={{ marginBottom: Spacing.lg, paddingLeft: Spacing.md }}>
                <ThemedText
                  style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}
                >
                  • Frontend - React Native ve Expo ile mobil-first geliştirme
                </ThemedText>
                <ThemedText
                  style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}
                >
                  • Backend - Google Firebase Cloud Services (Realtime Database,
                  Authentication)
                </ThemedText>
                <ThemedText
                  style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}
                >
                  • Hosting - Replit üzerinde sunulan dinamik uygulama sunucusu
                </ThemedText>
                <ThemedText
                  style={{
                    marginBottom: Spacing.lg,
                    color: colors.textSecondary,
                  }}
                >
                  • Protokol - REST API ve gerçek zamanlı veri senkronizasyonu
                </ThemedText>
              </View>

              {/* GİZLİLİK VE GÜVENLIK POLİTİKASI */}
              <ThemedText
                type="h4"
                style={{ marginTop: Spacing.xl, marginBottom: Spacing.sm, fontWeight: "700" }}
              >
                Gizlilik ve Güvenlik Politikası
              </ThemedText>
              <View style={{ marginBottom: Spacing.lg, paddingLeft: Spacing.md }}>
                <ThemedText
                  style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}
                >
                  • Veri Kullanımı - Kullanıcı verileri yalnızca belirtilen
                  amaçlar için kullanılır
                </ThemedText>
                <ThemedText
                  style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}
                >
                  • Üçüncü Taraf - Veriler, kullanıcı izni olmaksızın üçüncü
                  taraflara paylaşılmaz
                </ThemedText>
                <ThemedText
                  style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}
                >
                  • Hesap Silme - Hesap silindiğinde, ilgili tüm veriler
                  kalıcı olarak silinir
                </ThemedText>
                <ThemedText
                  style={{
                    marginBottom: Spacing.lg,
                    color: colors.textSecondary,
                  }}
                >
                  • Şifre Politikası - Şifreler tek yönlü şifreleme ile korunur
                  ve hiç depolanmaz
                </ThemedText>
              </View>

              {/* SÜRÜMLENDİRME VE DESTEK */}
              <ThemedText
                type="h4"
                style={{ marginTop: Spacing.xl, marginBottom: Spacing.sm, fontWeight: "700" }}
              >
                Sürüm ve Güncellemeler
              </ThemedText>
              <ThemedText
                style={{ marginBottom: Spacing.lg, color: colors.textSecondary }}
              >
                Uygulama, sürekli olarak iyileştirme ve güvenlik güncellemeleri
                alır. Yeni özellikler ve düzeltmeler düzenli olarak yayınlanır.
              </ThemedText>

              {/* TELİF HAKKI */}
              <ThemedText
                type="caption"
                style={{
                  color: colors.textSecondary,
                  textAlign: "center",
                  marginTop: Spacing.xl,
                  marginBottom: Spacing.xl,
                  lineHeight: 20,
                }}
              >
                © 2024 LogisticsPRO. Tüm hakları saklıdır.{"\n"}
                Geliştirici tarafından gizlilik, güvenlik ve yasal uyumluluğu
                dikkate alarak tasarlanmıştır.
              </ThemedText>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default function SettingsScreen() {
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useScreenInsets();
  const { logout, firebaseUser } = useAuth();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [aboutModalVisible, setAboutModalVisible] = useState(false);

  const [ibanList, setIbanList] = useState<IBAN[]>([]);
  const [ibanModalVisible, setIbanModalVisible] = useState(false);
  const [ibanInput, setIbanInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const loadIBANs = useCallback(async () => {
    if (!firebaseUser) return;
    try {
      const ibans = await getIBANs(firebaseUser.uid);
      setIbanList(ibans);
    } catch (error) {
      console.error("IBAN yükleme hatası:", error);
    }
  }, [firebaseUser]);

  const closeIBANModal = () => {
    setIbanModalVisible(false);
    setIbanInput("");
    setNameInput("");
  };

  const handleAddIBAN = async () => {
    setIsAdding(true);
    try {
      await addIBAN(firebaseUser.uid, {
        ibanNumber: ibanInput.trim(),
        nameSurname: nameInput.trim(),
      });
      await loadIBANs();
      Alert.alert("Başarılı", "IBAN başarıyla eklendi.");
      closeIBANModal();
    } catch (error) {
      console.error("IBAN ekleme hatası:", error);
      Alert.alert("Hata", "IBAN eklenirken hata oluştu.");
    }
    setIsAdding(false);
  };

  const handleDeleteIBAN = (ibanToDelete: IBAN) => {
    if (!firebaseUser?.uid) {
      Alert.alert(
        "Hata",
        "Kullanıcı kimliği bulunamadı. Lütfen tekrar giriş yapın."
      );
      return;
    }

    Alert.alert("Sil", "Bu IBAN'ı silmek istediğinizden emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            console.log("🗑️ Silme işlemi başlıyor...");
            console.log("UID:", firebaseUser.uid);
            console.log("IBAN ID:", ibanToDelete.id);
            console.log("IBAN Objesi:", ibanToDelete);

            const success = await deleteIBAN(firebaseUser.uid, ibanToDelete.id);
            console.log("✅ Silme sonucu:", success);

            if (success) {
              console.log(
                "✅ Firebase'den silindi, listesi yenileniyor..."
              );
              await loadIBANs();
              Alert.alert("Başarılı", "IBAN başarıyla silindi.");
            } else {
              console.error("❌ Firebase silme başarısız");
              Alert.alert(
                "Hata",
                "IBAN silme işlemi başarısız oldu. Tekrar deneyin."
              );
            }
          } catch (error: any) {
            console.error("❌ Silme hatası:", error);
            Alert.alert(
              "Hata",
              `Silme hatası: ${error?.message || String(error)}`
            );
          }
        },
      },
    ]);
  };

  const openDeleteModal = () => {
    setDeleteError("");
    setDeletePassword("");
    setDeleteModalVisible(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalVisible(false);
    setDeletePassword("");
  };

  const performDeleteAccount = async () => {
    if (!deletePassword.trim()) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await firebaseAuthService.reauthenticate(deletePassword);
      await firebaseAuthService.deleteAccount();
      if (logout) logout();
    } catch (error: any) {
      console.error(error);
      setDeleteError("İşlem başarısız. Şifrenizi kontrol edin.");
      setIsDeleting(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadIBANs();
    }, [loadIBANs])
  );

  return (
    <ScreenScrollView contentContainerStyle={{ paddingHorizontal: isTablet ? Spacing.xl : Spacing.lg }}>
      {/* Ödeme ve Hesap Bölümü */}
      <View
        style={[
          styles.section,
          { borderColor: colors.border },
        ]}
      >
        <ThemedText type="h4" style={styles.sectionTitle}>
          Ödeme ve Hesap
        </ThemedText>

        <Pressable
          style={({ pressed }) => [
            styles.listItem,
            {
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              backgroundColor: pressed
                ? colors.backgroundSecondary
                : colors.backgroundRoot,
            },
          ]}
          onPress={() => setIbanModalVisible(true)}
          hitSlop={8}
        >
          <View style={styles.listItemContent}>
            <ThemedText type="subtitle" style={{ fontWeight: "600" }}>
              IBAN Yönetimi
            </ThemedText>
            <ThemedText
              type="caption"
              style={{ color: colors.textSecondary, marginTop: 4 }}
            >
              {ibanList.length} kayıtlı
            </ThemedText>
          </View>
          <Feather
            name="chevron-right"
            size={24}
            color={colors.textSecondary}
          />
        </Pressable>
      </View>

      {/* Uygulama Bölümü */}
      <View
        style={[
          styles.section,
          { borderColor: colors.border },
        ]}
      >
        <ThemedText type="h4" style={styles.sectionTitle}>
          Uygulama
        </ThemedText>

        <Pressable
          style={({ pressed }) => [
            styles.listItem,
            {
              backgroundColor: pressed
                ? colors.backgroundSecondary
                : colors.backgroundRoot,
            },
          ]}
          onPress={() => setAboutModalVisible(true)}
          hitSlop={8}
        >
          <View style={styles.listItemContent}>
            <ThemedText type="subtitle" style={{ fontWeight: "600" }}>
              Hakkımızda
            </ThemedText>
            <ThemedText
              type="caption"
              style={{ color: colors.textSecondary, marginTop: 4 }}
            >
              v1.0.0
            </ThemedText>
          </View>
          <Feather
            name="chevron-right"
            size={24}
            color={colors.textSecondary}
          />
        </Pressable>
      </View>

      {/* Hesap Bölümü */}
      <View
        style={[
          styles.section,
          { borderColor: colors.border },
        ]}
      >
        <ThemedText type="h4" style={styles.sectionTitle}>
          Hesap Yönetimi
        </ThemedText>

        <Pressable
          style={({ pressed }) => [
            styles.listItem,
            {
              backgroundColor: pressed
                ? `${colors.destructive}15`
                : colors.backgroundRoot,
            },
          ]}
          onPress={openDeleteModal}
          hitSlop={8}
        >
          <ThemedText
            type="subtitle"
            style={{ color: colors.destructive, fontWeight: "600", flex: 1 }}
          >
            Hesabımı Sil
          </ThemedText>
          <Feather name="trash-2" size={24} color={colors.destructive} />
        </Pressable>
      </View>

      {/* Çıkış Butonu */}
      <Pressable
        onPress={logout}
        style={({ pressed }) => [
          styles.logoutButton,
          {
            backgroundColor: isDark
              ? colors.backgroundSecondary
              : colors.backgroundSecondary,
            opacity: pressed ? 0.8 : 1,
            marginBottom: insets.paddingBottom + Spacing.xl,
          },
        ]}
        hitSlop={8}
      >
        <Feather name="log-out" size={20} color={colors.text} />
        <ThemedText type="body" style={styles.logoutText}>
          Çıkış Yap
        </ThemedText>
      </Pressable>

      {/* IBAN Modal */}
      <IBANListModal
        visible={ibanModalVisible}
        onClose={closeIBANModal}
        nameInput={nameInput}
        setNameInput={setNameInput}
        ibanInput={ibanInput}
        setIbanInput={setIbanInput}
        isAdding={isAdding}
        onSave={handleAddIBAN}
        ibanList={ibanList}
        onDeleteIBAN={handleDeleteIBAN}
      />

      <AboutModal
        isVisible={aboutModalVisible}
        onClose={() => setAboutModalVisible(false)}
        colors={colors}
      />

      {/* HESAP SİLME ONAY MODALI */}
      <Modal
        visible={isDeleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeDeleteModal}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={closeDeleteModal}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[
              styles.deleteModalContent,
              {
                backgroundColor: colors.backgroundDefault,
                maxWidth: isTablet ? 500 : "85%",
              },
            ]}
          >
            <ThemedText type="h3" style={{ marginBottom: Spacing.md }}>
              Hesabınızı Silin
            </ThemedText>
            <ThemedText
              style={{
                marginBottom: Spacing.md,
                color: colors.textSecondary,
              }}
            >
              Onaylamak için şifrenizi girin. Bu işlem geri alınamaz.
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
              placeholder="Şifreniz"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              value={deletePassword}
              onChangeText={setDeletePassword}
            />

            <View style={styles.modalButtons}>
              <Pressable
                onPress={closeDeleteModal}
                style={[
                  styles.modalButton,
                  {
                    borderColor: colors.border,
                    borderWidth: 1,
                    backgroundColor: colors.backgroundRoot,
                  },
                ]}
              >
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  İptal
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={performDeleteAccount}
                disabled={!deletePassword.trim() || isDeleting}
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: colors.destructive,
                    opacity:
                      !deletePassword.trim() || isDeleting ? 0.5 : 1,
                  },
                ]}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <ThemedText
                    style={{
                      color: "#FFF",
                      fontWeight: "600",
                    }}
                  >
                    Sil
                  </ThemedText>
                )}
              </Pressable>
            </View>

            {deleteError ? (
              <ThemedText
                style={{
                  color: colors.destructive,
                  textAlign: "center",
                  marginTop: Spacing.md,
                  fontSize: 14,
                }}
              >
                {deleteError}
              </ThemedText>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.xl,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
    fontWeight: "600",
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginVertical: Spacing.xs,
  },
  listItemContent: {
    flex: 1,
  },
  input: {
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
    marginVertical: Spacing.xl,
  },
  logoutText: {
    fontWeight: "600",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  aboutModalContent: {
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    flexDirection: "column",
  },
  aboutModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  deleteModalContent: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
});
