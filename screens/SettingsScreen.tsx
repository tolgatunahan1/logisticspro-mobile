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
import { useDeleteOperation } from "../hooks/useDeleteOperation";

const AboutSection = ({ title, icon, children, colors, isOpen, onToggle }) => (
  <View style={{ marginBottom: Spacing.md }}>
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          backgroundColor: isOpen ? colors.backgroundDefault : "transparent",
          borderRadius: BorderRadius.md,
          borderWidth: 1,
          borderColor: isOpen ? colors.border : "transparent",
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Feather name={icon} size={20} color={colors.text} style={{ marginRight: Spacing.md }} />
      <ThemedText type="h4" style={{ flex: 1, fontWeight: "700" }}>
        {title}
      </ThemedText>
      <Feather name={isOpen ? "chevron-up" : "chevron-down"} size={20} color={colors.text} />
    </Pressable>
    {isOpen && (
      <View style={{ paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg, backgroundColor: colors.backgroundDefault, marginTop: Spacing.xs, borderRadius: BorderRadius.md }}>
        {children}
      </View>
    )}
  </View>
);

const AboutModal = ({ isVisible, onClose, colors }) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const modalWidth = isTablet ? Math.min(width * 0.85, 600) : "90%";
  const maxHeight = isTablet ? "75%" : "85%";

  const [expandedSections, setExpandedSections] = useState({
    features: true,
    support: true,
    technical: false,
    security: false,
    privacy: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

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
            <View>
              <ThemedText type="h3" style={{ fontWeight: "700" }}>LogisticsPRO</ThemedText>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>v1.0.0</ThemedText>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <Feather name="x" size={24} color={colors.text} />
            </Pressable>
          </View>

          <ThemedText
            style={{
              paddingHorizontal: Spacing.lg,
              marginBottom: Spacing.lg,
              color: colors.textSecondary,
              lineHeight: 22,
              fontStyle: "italic",
            }}
          >
            Profesyonel Nakliye ve Lojistik Yönetim Platformu
          </ThemedText>

          <ScrollView
            showsVerticalScrollIndicator={true}
            scrollEventThrottle={16}
            style={{ flex: 1 }}
          >
            <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl }}>
              {/* TEMEL İŞLEVLER */}
              <AboutSection
                title="Neler Yapabilirsiniz?"
                icon="zap"
                isOpen={expandedSections.features}
                onToggle={() => toggleSection("features")}
                colors={colors}
              >
                <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary, lineHeight: 20 }}>
                  • Nakliyeci Yönetimi - Araç, operatör ve sürücü profilleri
                </ThemedText>
                <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary, lineHeight: 20 }}>
                  • Şirket Yönetimi - Müşteri ve gönderici bilgilerini saklayın
                </ThemedText>
                <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary, lineHeight: 20 }}>
                  • Sevkiyat Planlama - Rota tasarımı ve lojistik takibi
                </ThemedText>
                <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary, lineHeight: 20 }}>
                  • İş Geçmişi - Tamamlanan işler ve arşivleme
                </ThemedText>
                <ThemedText style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  • IBAN Yönetimi - Finansal işlem ve ödeme yönetimi
                </ThemedText>
              </AboutSection>

              {/* TEKNİK DETAYlar */}
              <AboutSection
                title="Teknik Mimarı"
                icon="code"
                isOpen={expandedSections.technical}
                onToggle={() => toggleSection("technical")}
                colors={colors}
              >
                <ThemedText style={{ marginBottom: Spacing.md, fontWeight: "600", color: colors.text }}>Frontend</ThemedText>
                <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
                  React Native + Expo, mobil-first geliştirme
                </ThemedText>

                <ThemedText style={{ marginBottom: Spacing.md, marginTop: Spacing.md, fontWeight: "600", color: colors.text }}>Backend & Veritabanı</ThemedText>
                <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
                  Google Firebase Cloud Services (Realtime Database, Authentication)
                </ThemedText>

                <ThemedText style={{ marginBottom: Spacing.md, marginTop: Spacing.md, fontWeight: "600", color: colors.text }}>Hosting</ThemedText>
                <ThemedText style={{ color: colors.textSecondary }}>
                  Replit üzerinde sunulan dinamik uygulama sunucusu
                </ThemedText>
              </AboutSection>

              {/* GÜVENLİK */}
              <AboutSection
                title="Güvenlik & Veri Saklama"
                icon="shield"
                isOpen={expandedSections.security}
                onToggle={() => toggleSection("security")}
                colors={colors}
              >
                <ThemedText style={{ marginBottom: Spacing.md, fontWeight: "600", color: colors.text }}>Kimlik Doğrulama</ThemedText>
                <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
                  Firebase Authentication ile güvenli giriş sistemi
                </ThemedText>

                <ThemedText style={{ marginBottom: Spacing.md, marginTop: Spacing.md, fontWeight: "600", color: colors.text }}>Veri Şifreleme</ThemedText>
                <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
                  Hassas veriler End-to-End Encryption ile korunur
                </ThemedText>

                <ThemedText style={{ marginBottom: Spacing.md, marginTop: Spacing.md, fontWeight: "600", color: colors.text }}>İletişim Güvenliği</ThemedText>
                <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
                  SSL/TLS Protokolü tüm iletişimi şifreler
                </ThemedText>

                <ThemedText style={{ marginBottom: Spacing.md, marginTop: Spacing.md, fontWeight: "600", color: colors.text }}>Rol-Tabanlı Erişim</ThemedText>
                <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
                  Her kullanıcının yetkileri rol-based olarak kontrol edilir
                </ThemedText>

                <ThemedText style={{ marginBottom: Spacing.md, marginTop: Spacing.md, fontWeight: "600", color: colors.text }}>Veri Saklama</ThemedText>
                <ThemedText style={{ color: colors.textSecondary }}>
                  Kişisel veriler Firebase Realtime Database'de şifreli olarak saklanır. Otomatik yedekleme yapılır.
                </ThemedText>
              </AboutSection>

              {/* GİZLİLİK POLİTİKASI */}
              <AboutSection
                title="Gizlilik & Veri Koruması"
                icon="lock"
                isOpen={expandedSections.privacy}
                onToggle={() => toggleSection("privacy")}
                colors={colors}
              >
                <ThemedText style={{ marginBottom: Spacing.md, fontWeight: "600", color: colors.text }}>Kişisel Bilgiler</ThemedText>
                <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
                  Verileriniz yalnızca belirtilen amaçlar için kullanılır. Hiçbir üçüncü tarafa izniniz olmadan paylaşılmaz.
                </ThemedText>

                <ThemedText style={{ marginBottom: Spacing.md, marginTop: Spacing.md, fontWeight: "600", color: colors.text }}>Şifre Güvenliği</ThemedText>
                <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
                  Şifreleriniz tek yönlü şifreleme ile korunur ve asla depolanmaz.
                </ThemedText>

                <ThemedText style={{ marginBottom: Spacing.md, marginTop: Spacing.md, fontWeight: "600", color: colors.text }}>Hesap Silme</ThemedText>
                <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
                  Hesabınızı sildiğinizde, ilgili tüm veriler kalıcı olarak silinir.
                </ThemedText>

                <ThemedText style={{ marginBottom: Spacing.md, marginTop: Spacing.md, fontWeight: "600", color: colors.text }}>GDPR Uyumluluğu</ThemedText>
                <ThemedText style={{ color: colors.textSecondary }}>
                  Uygulama GDPR düzenlemelerine uygun olarak tasarlanmıştır.
                </ThemedText>
              </AboutSection>

              {/* DESTEK VE İLETİŞİM */}
              <AboutSection
                title="Destek & İletişim"
                icon="phone"
                isOpen={expandedSections.support}
                onToggle={() => toggleSection("support")}
                colors={colors}
              >
                <ThemedText style={{ marginBottom: Spacing.md, fontWeight: "600", color: colors.text }}>Sorularınız mı var?</ThemedText>
                <ThemedText style={{ marginBottom: Spacing.lg, color: colors.textSecondary, lineHeight: 20 }}>
                  Uygulama hakkında herhangi bir sorunuz, öneriniz veya teknik destek talebiniz varsa lütfen iletişime geçiniz.
                </ThemedText>

                <ThemedText style={{ marginBottom: Spacing.xs, fontWeight: "700", color: colors.text }}>
                  Tolga Tunahan
                </ThemedText>
                <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary, fontSize: 13 }}>
                  Uygulama Yöneticisi ve Proje Sahibi
                </ThemedText>

                <View style={{ backgroundColor: colors.backgroundRoot, padding: Spacing.md, borderRadius: BorderRadius.sm, marginTop: Spacing.md }}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: Spacing.sm }}>
                    <Feather name="phone" size={16} color={colors.text} style={{ marginRight: Spacing.sm }} />
                    <ThemedText style={{ color: colors.text }}>05423822832</ThemedText>
                  </View>
                  <Pressable
                    onPress={() =>
                      Linking.openURL("mailto:tolgatunahan@icloud.com")
                    }
                    style={{ flexDirection: "row", alignItems: "center" }}
                  >
                    <Feather name="mail" size={16} color={colors.link} style={{ marginRight: Spacing.sm }} />
                    <ThemedText type="link" style={{ fontSize: 13 }}>
                      tolgatunahan@icloud.com
                    </ThemedText>
                  </Pressable>
                </View>
              </AboutSection>

              {/* TELİF HAKKI */}
              <View style={{ marginTop: Spacing.xl, marginBottom: Spacing.lg, paddingHorizontal: Spacing.sm }}>
                <ThemedText
                  type="caption"
                  style={{
                    color: colors.textSecondary,
                    textAlign: "center",
                    lineHeight: 20,
                  }}
                >
                  © 2025 LogisticsPRO
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={{
                    color: colors.textSecondary,
                    textAlign: "center",
                    marginTop: Spacing.sm,
                    lineHeight: 20,
                  }}
                >
                  Geliştirici: Tolga Tunahan
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={{
                    color: colors.textSecondary,
                    textAlign: "center",
                    marginTop: Spacing.sm,
                    lineHeight: 20,
                  }}
                >
                  Tüm telif hakları korunmaktadır. LogisticsPRO platformu, tasarımı, kodu ve özellikleri Tolga Tunahan'ın mülkiyetindedir. Bu uygulamanın herhangi bir kısmı izin almaksızın kopyalanamaz, değiştirilemez veya dağıtılamaz.
                </ThemedText>
              </View>
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
  const { deleteState, openDeleteConfirm, closeDeleteConfirm, confirmDelete } = useDeleteOperation<IBAN>("IBAN");

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
    openDeleteConfirm(ibanToDelete);
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

      {/* IBAN Delete Confirmation Modal */}
      <Modal
        visible={deleteState.isOpen}
        transparent
        animationType="fade"
        onRequestClose={closeDeleteConfirm}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center", paddingHorizontal: Spacing.lg }}>
          <View style={{
            backgroundColor: isDark ? "rgba(30, 30, 30, 0.95)" : "rgba(255, 255, 255, 0.95)",
            borderRadius: BorderRadius.lg,
            padding: Spacing.xl,
            width: "100%",
            maxWidth: 340,
            borderWidth: 1,
            borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
            overflow: "hidden",
          }}>
            <View style={{ backgroundColor: "transparent", marginBottom: Spacing.lg }}>
              <ThemedText type="h3" style={{ marginBottom: Spacing.md, fontWeight: "700" }}>IBAN'ı Sil</ThemedText>
              <ThemedText type="body" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                Bu IBAN'ı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </ThemedText>
            </View>
            <View style={{ flexDirection: "row", gap: Spacing.md, marginTop: Spacing.lg }}>
              <Pressable
                onPress={closeDeleteConfirm}
                disabled={deleteState.isDeleting}
                style={({ pressed }) => [
                  { 
                    flex: 1, 
                    paddingVertical: Spacing.md,
                    paddingHorizontal: Spacing.lg,
                    borderRadius: BorderRadius.sm,
                    backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                    opacity: pressed || deleteState.isDeleting ? 0.5 : 1,
                  },
                ]}
              >
                <ThemedText type="body" style={{ color: theme.link, textAlign: "center", fontWeight: "600" }}>İptal</ThemedText>
              </Pressable>
              <Pressable
                onPress={async () => {
                  await confirmDelete(async (iban) => {
                    const success = await deleteIBAN(firebaseUser!.uid, iban.id);
                    if (success) {
                      await loadIBANs();
                    }
                    return success;
                  });
                }}
                disabled={deleteState.isDeleting}
                style={({ pressed }) => [
                  { 
                    flex: 1, 
                    paddingVertical: Spacing.md,
                    paddingHorizontal: Spacing.lg,
                    borderRadius: BorderRadius.sm,
                    backgroundColor: colors.destructive,
                    opacity: pressed || deleteState.isDeleting ? 0.5 : 1,
                  },
                ]}
              >
                <ThemedText type="body" style={{ color: "#FFFFFF", textAlign: "center", fontWeight: "600" }}>
                  {deleteState.isDeleting ? "Siliniyor..." : "Sil"}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
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
