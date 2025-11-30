import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable, Alert, Modal, TextInput, ActivityIndicator, Linking } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import * as Notifications from "expo-notifications";

import { ThemedText } from "../components/ThemedText";
import { ScreenContainer } from "../components/ScreenContainer"; // Yeni Güvenlik Bileşeni
import { useTheme } from "../hooks/useTheme";
import { useDeleteOperation } from "../hooks/useDeleteOperation";
import { useAuth } from "../contexts/AuthContext";
import { Spacing, BorderRadius, Colors } from "../constants/theme";
import { getIBANs, addIBAN, deleteIBAN, IBAN, getCompletedJobs, CompletedJob } from "../utils/storage";
import { IBANListModal } from "../components/IBANListModal";
import { firebaseAuthService } from "../utils/firebaseAuth";

const AboutModal = ({ isVisible, onClose }) => {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.backgroundDefault }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={onClose}>
              <Feather name="x" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>
          <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>Hakkımızda</ThemedText>
          <ThemedText style={styles.aboutContent}>
            LogisticsPRO, lojistik süreçlerinizi kolaylaştırmak için tasarlanmış modern bir uygulamadır.
          </ThemedText>
        </View>
      </Pressable>
    </Modal>
  );
};


export default function SettingsScreen() {
  const { theme, isDark } = useTheme();
  // const insets = useSafeAreaInsets(); // ScreenContainer artık bunu hallediyor, kaldırıldı
  const colors = isDark ? Colors.dark : Colors.light;
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const { logout, firebaseUser } = useAuth();
  const { deleteState, openDeleteConfirm, closeDeleteConfirm, handleDeleteAccount } = useDeleteOperation();

  const [ibanList, setIbanList] = useState<IBAN[]>([]);
  const [ibanModalVisible, setIbanModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [newIban, setNewIban] = useState('');
  const [loading, setLoading] = useState(false);
  const [completedJobs, setCompletedJobs] = useState<CompletedJob[]>([]);

  // Not: Bildirim kodları daha önce geri açıldığı için burada bırakıldı.

  const handleLogout = async () => {
    try {
      Alert.alert(
        "Çıkış Yap",
        "Hesabınızdan çıkış yapmak istediğinizden emin misiniz?",
        [
          { text: "İptal", style: "cancel" },
          { text: "Evet", onPress: () => firebaseAuthService.signOut(logout) },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error("Çıkış yaparken hata oluştu:", error);
      Alert.alert("Hata", "Çıkış işlemi başarısız oldu.");
    }
  };

  const handleOpenPrivacy = () => {
    Linking.openURL("https://www.google.com/policies/privacy/");
  };

  const handleOpenTerms = () => {
    Linking.openURL("https://www.google.com/policies/terms/");
  };

  const fetchCompletedJobs = useCallback(async () => {
    setLoading(true);
    const jobs = await getCompletedJobs();
    setCompletedJobs(jobs);
    setLoading(false);
  }, []);

  const fetchIBANs = useCallback(async () => {
    setLoading(true);
    const ibans = await getIBANs();
    setIbanList(ibans);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => {
    fetchIBANs();
    fetchCompletedJobs();
  }, [fetchIBANs, fetchCompletedJobs]));

  const handleAddIBAN = async () => {
    if (!newIban) {
      Alert.alert("Hata", "Lütfen geçerli bir IBAN girin.");
      return;
    }
    setLoading(true);
    await addIBAN(newIban);
    setNewIban('');
    await fetchIBANs();
    setLoading(false);
  };

  const handleDeleteIBAN = async (ibanId: string) => {
    setLoading(true);
    await deleteIBAN(ibanId);
    await fetchIBANs();
    setLoading(false);
  };

  return (
    // DÜZELTİLMİŞ KORUMALI YAPI: ScreenContainer hem SafeAreaView hem de ScrollView içerir
    <ScreenContainer style={[styles.container, { paddingTop: headerHeight + Spacing.xl }]}>
      
      {/* Hata: headerHeight dolgusu ScrollView içinde olmalıydı. 
          ScreenContainer içindeki ScrollView'in tepeden boşluk alması için
          tüm içeriği saran bir View'a paddingTop verdik. */}
      
      {/* Hesap Ayarları Section */}
      <View style={[styles.section, { backgroundColor: colors.backgroundDefault }]}>
        <View style={styles.sectionHeader}>
          <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
            Hesap Ayarları
          </ThemedText>
        </View>

        {/* E-posta */}
        <View style={styles.listItem}>
          <ThemedText type="subtitle">E-posta</ThemedText>
          <ThemedText style={{ flexShrink: 1, color: colors.textSecondary }}>{firebaseUser?.email}</ThemedText>
        </View>

        {/* Şifre Değiştir */}
        <Pressable style={styles.listItem} onPress={() => Alert.alert("Bilgi", "Bu özellik şu an devre dışıdır.")}>
          <ThemedText type="subtitle">Şifre Değiştir</ThemedText>
          <Feather name="chevron-right" size={24} color={colors.textSecondary} />
        </Pressable>

        {/* IBAN Yönetimi */}
        <Pressable style={styles.listItem} onPress={() => setIbanModalVisible(true)}>
          <ThemedText type="subtitle">IBAN Yönetimi ({ibanList.length})</ThemedText>
          <Feather name="chevron-right" size={24} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Raporlar ve Bilgiler Section */}
      <View style={[styles.section, { backgroundColor: colors.backgroundDefault }]}>
        <View style={styles.sectionHeader}>
          <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
            Uygulama Bilgileri
          </ThemedText>
        </View>
        
        {/* Tamamlanan Seferler */}
        <Pressable style={styles.listItem} onPress={() => navigation.navigate("CompletedJobList")}>
          <ThemedText type="subtitle">Tamamlanan Seferler ({completedJobs.length})</ThemedText>
          <Feather name="chevron-right" size={24} color={colors.textSecondary} />
        </Pressable>

        {/* Hakkımızda */}
        <Pressable style={styles.listItem} onPress={() => setAboutModalVisible(true)}>
          <ThemedText type="subtitle">Hakkımızda</ThemedText>
          <Feather name="chevron-right" size={24} color={colors.textSecondary} />
        </Pressable>

        {/* Gizlilik Politikası */}
        <Pressable style={styles.listItem} onPress={handleOpenPrivacy}>
          <ThemedText type="subtitle">Gizlilik Politikası</ThemedText>
          <Feather name="external-link" size={20} color={colors.textSecondary} />
        </Pressable>

        {/* Kullanım Şartları */}
        <Pressable style={styles.listItem} onPress={handleOpenTerms}>
          <ThemedText type="subtitle">Kullanım Şartları</ThemedText>
          <Feather name="external-link" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Hesabı Sil */}
      <Pressable onPress={openDeleteConfirm} style={({ pressed }) => [
        styles.deleteAccountButton,
        {
          opacity: pressed ? 0.8 : 1,
          marginHorizontal: Spacing.xl,
          marginTop: Spacing.xl,
          marginBottom: Spacing.lg,
        },
      ]}>
        <ThemedText style={styles.deleteAccountText}>Hesabımı Sil</ThemedText>
      </Pressable>


      {/* Çıkış Yap Butonu - Ekranın en altına itilir */}
      <Pressable onPress={handleLogout} style={({ pressed }) => [
        styles.logoutButton,
        {
          backgroundColor: colors.destructive,
          opacity: pressed ? 0.8 : 1,
          marginHorizontal: Spacing.xl,
          marginBottom: Spacing.xl, // insets kaldırıldığı için alt boşluk fix olarak ayarlandı
        },
      ]}>
        <Feather name="log-out" size={20} color={colors.backgroundDefault} />
        <ThemedText style={[styles.logoutText, { color: colors.backgroundDefault }]}>Çıkış Yap</ThemedText>
      </Pressable>


      {/* MODAL KISIMLARI - ScreenContainer'ın dışında, return içinde olmalı */}
      <IBANListModal
        isVisible={ibanModalVisible}
        onClose={() => setIbanModalVisible(false)}
        ibanList={ibanList}
        onDeleteIBAN={handleDeleteIBAN}
        onAddIBAN={handleAddIBAN}
        newIban={newIban}
        setNewIban={setNewIban}
        loading={loading}
      />
      
      <AboutModal
        isVisible={aboutModalVisible}
        onClose={() => setAboutModalVisible(false)}
      />

      {/* Hesap Silme Onayı Modalı */}
      <Modal
        visible={deleteState.isConfirmVisible}
        transparent={true}
        animationType="fade"
      >
        <Pressable style={styles.modalOverlay} onPress={closeDeleteConfirm}>
          <View style={[styles.deleteModalContent, { backgroundColor: colors.backgroundDefault }]}>
            <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>Hesabınızı Silin</ThemedText>
            <ThemedText style={{ marginBottom: Spacing.lg, color: colors.textSecondary }}>
              Hesabınızı silmek geri alınamaz. Devam etmek istediğinizden emin misiniz?
            </ThemedText>
            
            <TextInput
              placeholder="Şifrenizi Girin"
              secureTextEntry
              value={deleteState.password}
              onChangeText={deleteState.setPassword}
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholderTextColor={colors.textSecondary}
            />
            
            <View style={styles.modalFooter}>
              <Pressable onPress={closeDeleteConfirm} style={styles.modalFooterButton}>
                <ThemedText style={{ color: colors.link }}>İptal</ThemedText>
              </Pressable>
              <Pressable 
                onPress={handleDeleteAccount} 
                style={[styles.modalFooterButton, { backgroundColor: colors.destructive, borderRadius: BorderRadius.xs, paddingHorizontal: 15, paddingVertical: 8 }]}
                disabled={deleteState.isDeleting}
              >
                {deleteState.isDeleting ? (
                  <ActivityIndicator size="small" color={colors.backgroundDefault} />
                ) : (
                  <ThemedText style={{ color: colors.backgroundDefault, fontWeight: "600" }}>Sil</ThemedText>
                )}
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

    </ScreenContainer> // Kapanış burada!
  );
}

const styles = StyleSheet.create({
  container: {
    // ScrollView kaldırıldığı için flex: 1 ScreenContainer'a devredildi
  },
  section: {
    padding: Spacing.md,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.lg,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  sectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.md,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  deleteAccountButton: {
    alignItems: "center",
  },
  deleteAccountText: {
    color: Colors.light.destructive,
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xs,
    gap: Spacing.sm,
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
  modalContent: {
    width: '90%',
    maxHeight: "90%",
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  deleteModalContent: {
    width: '80%',
    padding: Spacing.xl,
    borderRadius: BorderRadius.xs,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: Spacing.lg,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.md,
  },
  modalFooterButton: {
    marginLeft: Spacing.md,
    alignSelf: 'center',
  },
  aboutContent: {
    lineHeight: 24,
    textAlign: 'justify',
  },
  // Eski stiller...
  content: {
    // Bu stil artık kullanılmıyor
  },
});