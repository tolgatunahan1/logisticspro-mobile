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
  Animated,
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

const AboutSection = ({ title, content, isExpanded, onToggle, colors, isDark }) => {
  const [animationHeight] = useState(new Animated.Value(isExpanded ? 1 : 0));

  React.useEffect(() => {
    Animated.timing(animationHeight, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isExpanded]);

  const heightInterpolation = animationHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={[styles.aboutSection, { backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }]}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [
          styles.aboutSectionHeader,
          {
            backgroundColor: pressed ? (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)") : "transparent",
            borderBottomWidth: isExpanded ? 1 : 0,
            borderBottomColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
          },
        ]}
      >
        <ThemedText type="body" style={{ fontWeight: "700", flex: 1 }}>
          {title}
        </ThemedText>
        <Animated.View
          style={{
            transform: [
              {
                rotate: animationHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "180deg"],
                }),
              },
            ],
          }}
        >
          <Feather name="chevron-down" size={20} color={colors.text} />
        </Animated.View>
      </Pressable>

      {isExpanded && (
        <View style={[styles.aboutSectionContent, { paddingLeft: Spacing.lg }]}>
          {typeof content === "string" ? (
            <ThemedText style={{ color: colors.textSecondary, lineHeight: 22 }}>
              {content}
            </ThemedText>
          ) : (
            content
          )}
        </View>
      )}

      {/* Diagonal accent element */}
      <View style={[styles.diagonalAccent, { borderLeftColor: isDark ? "rgba(59, 130, 246, 0.3)" : "rgba(59, 130, 246, 0.2)" }]} />
    </View>
  );
};

const AboutModal = ({ isVisible, onClose, colors, isDark }) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const modalWidth = isTablet ? Math.min(width * 0.85, 600) : "90%";
  const maxHeight = isTablet ? "75%" : "85%";

  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    about: true,
    features: false,
    contact: false,
    security: false,
    storage: false,
    infrastructure: false,
    privacy: false,
    updates: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const sections = [
    {
      key: "about",
      title: "📱 LogisticsPRO v1.0.0",
      content: "Profesyonel Nakliye ve Lojistik Yönetim Platformu\n\nLogisticsPRO, Türkiye'de faaliyet gösteren nakliye ve lojistik şirketleri için geliştirilmiş, kurumsal düzeyde bir yönetim platformudur.",
    },
    {
      key: "features",
      title: "⚡ Temel İşlevler",
      content: (
        <View>
          <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
            • Nakliyeci Yönetimi
          </ThemedText>
          <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
            • Şirket Yönetimi
          </ThemedText>
          <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
            • Sevkiyat Planlama
          </ThemedText>
          <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
            • Tamamlanan İşler
          </ThemedText>
          <ThemedText style={{ color: colors.textSecondary }}>
            • IBAN Yönetimi
          </ThemedText>
        </View>
      ),
    },
    {
      key: "contact",
      title: "👤 Yetkili Kişi",
      content: (
        <View>
          <ThemedText style={{ fontWeight: "600", marginBottom: Spacing.xs }}>Tolga Tunahan</ThemedText>
          <ThemedText style={{ color: colors.textSecondary, marginBottom: Spacing.xs }}>Uygulama Yöneticisi</ThemedText>
          <ThemedText style={{ color: colors.textSecondary, marginBottom: Spacing.xs }}>📱 05423822832</ThemedText>
          <Pressable
            onPress={() => Linking.openURL("mailto:tolgatunahan@icloud.com")}
          >
            <ThemedText type="link" style={{ fontSize: 13 }}>
              📧 tolgatunahan@icloud.com
            </ThemedText>
          </Pressable>
        </View>
      ),
    },
    {
      key: "security",
      title: "🔒 Güvenlik",
      content: (
        <View>
          <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
            • Firebase Authentication
          </ThemedText>
          <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
            • End-to-End Encryption
          </ThemedText>
          <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
            • SSL/TLS Protokolü
          </ThemedText>
          <ThemedText style={{ color: colors.textSecondary }}>
            • Role-Based Access Control
          </ThemedText>
        </View>
      ),
    },
    {
      key: "storage",
      title: "💾 Veri Saklama",
      content: (
        <View>
          <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
            • Kişisel Bilgiler şifreli saklanır
          </ThemedText>
          <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
            • İşlem Verileri uzun dönem arşivlenir
          </ThemedText>
          <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
            • Otomatik Yedekleme
          </ThemedText>
          <ThemedText style={{ color: colors.textSecondary }}>
            • GDPR Uyumluluğu
          </ThemedText>
        </View>
      ),
    },
    {
      key: "infrastructure",
      title: "🏗️ Altyapı",
      content: (
        <View>
          <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
            • Frontend: React Native + Expo
          </ThemedText>
          <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
            • Backend: Google Firebase
          </ThemedText>
          <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
            • Hosting: Replit
          </ThemedText>
          <ThemedText style={{ color: colors.textSecondary }}>
            • Protokol: REST API
          </ThemedText>
        </View>
      ),
    },
    {
      key: "privacy",
      title: "🛡️ Gizlilik",
      content: (
        <View>
          <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
            • Veriler sadece belirtilen amaçlar için kullanılır
          </ThemedText>
          <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
            • Üçüncü taraflara paylaşılmaz
          </ThemedText>
          <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
            • Hesap silindiğinde tüm veriler kalıcı olarak silinir
          </ThemedText>
        </View>
      ),
    },
    {
      key: "updates",
      title: "🔄 Güncellemeler",
      content: "Uygulama, sürekli olarak iyileştirme ve güvenlik güncellemeleri alır. Yeni özellikler ve düzeltmeler düzenli olarak yayınlanır.",
    },
  ];

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={[styles.modalOverlay, { backgroundColor: "rgba(0, 0, 0, 0.5)" }]}
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
            <ThemedText type="h3" style={{ fontWeight: "700" }}>Hakkımızda</ThemedText>
            <Pressable onPress={onClose} hitSlop={8}>
              <Feather name="x" size={24} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={true} scrollEventThrottle={16} style={{ flex: 1 }}>
            <View style={{ paddingRight: Spacing.lg, paddingBottom: Spacing.lg }}>
              {sections.map((section) => (
                <AboutSection
                  key={section.key}
                  title={section.title}
                  content={section.content}
                  isExpanded={expandedSections[section.key]}
                  onToggle={() => toggleSection(section.key)}
                  colors={colors}
                  isDark={isDark}
                />
              ))}

              <ThemedText
                type="caption"
                style={{
                  color: colors.textSecondary,
                  textAlign: "center",
                  marginTop: Spacing.xl,
                  lineHeight: 20,
                }}
              >
                © 2024 LogisticsPRO. Tüm hakları saklıdır.
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
      Alert.alert("Hata", "Kullanıcı kimliği bulunamadı. Lütfen tekrar giriş yapın.");
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
        isDark={isDark}
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
  aboutSection: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  aboutSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  aboutSectionContent: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingRight: Spacing.lg,
  },
  diagonalAccent: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    borderLeftWidth: 3,
    borderTopWidth: 3,
    opacity: 0.3,
    transform: [{ rotate: "45deg" }],
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
