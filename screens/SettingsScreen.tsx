import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable, Alert, Modal, TextInput, ActivityIndicator, ScrollView, Linking } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { ThemedText } from "../components/ThemedText";
import { ScreenScrollView } from "../components/ScreenScrollView";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../contexts/AuthContext";
import { Spacing, BorderRadius, Colors } from "../constants/theme";
import { getIBANs, addIBAN, deleteIBAN, IBAN } from "../utils/storage";
import { IBANListModal } from "../components/IBANListModal";
import { firebaseAuthService } from "../utils/firebaseAuth";

// --- Hakkımızda Modalı ---
const AboutModal = ({ isVisible, onClose, colors }) => {
  return (
    <Modal visible={isVisible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <Pressable 
        onPress={onClose} 
        style={[styles.modalOverlay, { backgroundColor: "rgba(0, 0, 0, 0.5)" }]}
      >
        <Pressable 
          onPress={(e) => e.stopPropagation()}
          style={[styles.aboutModalContent, { backgroundColor: colors.backgroundDefault }]}
        >
          <View style={styles.aboutModalHeader}>
            <ThemedText type="h3">Hakkımızda</ThemedText>
            <Pressable onPress={onClose}>
              <Feather name="x" size={24} color={colors.text} />
            </Pressable>
          </View>
          
          <ScrollView 
            showsVerticalScrollIndicator={true}
            scrollEventThrottle={16}
            style={{ flex: 1 }}
          >
            <View style={{ paddingRight: Spacing.lg }}>
              <ThemedText type="h4" style={{ marginBottom: Spacing.md, fontWeight: "600" }}>
                LogisticsPRO v1.0.0
              </ThemedText>
              
              <ThemedText style={{ marginBottom: Spacing.lg, color: colors.textSecondary, lineHeight: 24 }}>
                LogisticsPRO, Türkiye'de faaliyet gösteren nakliye ve lojistik şirketleri için geliştirilmiş, profesyonel bir yönetim platformudur.
              </ThemedText>

              <ThemedText type="h4" style={{ marginTop: Spacing.lg, marginBottom: Spacing.md, fontWeight: "600" }}>
                Temel Özellikler
              </ThemedText>

              <View style={{ marginBottom: Spacing.lg }}>
                <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
                  • Nakliyeci Yönetimi - Araç ve operatör bilgileri
                </ThemedText>
                <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
                  • Şirket Yönetimi - Müşteri ve gönderici bilgileri
                </ThemedText>
                <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
                  • Sevkiyat Planlama - Yükleme ve teslimat takibi
                </ThemedText>
                <ThemedText style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
                  • Tamamlanan İşler - İş geçmişi ve arşiv
                </ThemedText>
                <ThemedText style={{ marginBottom: Spacing.lg, color: colors.textSecondary }}>
                  • IBAN Yönetimi - Ödeme bilgileri ve finansal yönetim
                </ThemedText>
              </View>

              <ThemedText type="h4" style={{ marginTop: Spacing.lg, marginBottom: Spacing.md, fontWeight: "600" }}>
                Güvenlik
              </ThemedText>

              <ThemedText style={{ marginBottom: Spacing.lg, color: colors.textSecondary, lineHeight: 24 }}>
                Tüm verileriniz Firebase güvenlik altyapısı tarafından korunmakta ve şifreli olarak saklanmaktadır.
              </ThemedText>

              <ThemedText type="h4" style={{ marginTop: Spacing.lg, marginBottom: Spacing.md, fontWeight: "600" }}>
                Destek
              </ThemedText>

              <Pressable onPress={() => Linking.openURL('mailto:support@logisticspro.com')}>
                <ThemedText type="link" style={{ fontSize: 16, marginBottom: Spacing.xl }}>
                  📧 support@logisticspro.com
                </ThemedText>
              </Pressable>

              <ThemedText type="caption" style={{ color: colors.textSecondary, marginBottom: Spacing.xl }}>
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
  const { logout, firebaseUser } = useAuth();
  
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
    if (!nameInput.trim() || !ibanInput.trim()) { 
      Alert.alert("Hata", "Lütfen ad soyad ve IBAN numarası giriniz."); 
      return; 
    }
    setIsAdding(true);
    try {
      await addIBAN(firebaseUser.uid, { name: nameInput.trim(), iban: ibanInput.trim() });
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
    Alert.alert("Sil", "Bu IBAN'ı silmek istediğinizden emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteIBAN(firebaseUser.uid, ibanToDelete.ibanNumber);
            await loadIBANs();
            Alert.alert("Başarılı", "IBAN başarıyla silindi.");
          } catch (error) {
            console.error("IBAN silme hatası:", error);
            Alert.alert("Hata", "IBAN silinirken hata oluştu.");
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
    <ScreenScrollView>
      {/* Ödeme ve Hesap Bölümü */}
      <View style={[styles.section, { borderColor: colors.border }]}>
        <ThemedText type="h4" style={styles.sectionTitle}>Ödeme ve Hesap</ThemedText>
        
        <Pressable 
          style={[styles.listItem, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
          onPress={() => setIbanModalVisible(true)}
        >
          <View style={styles.listItemContent}>
            <ThemedText type="subtitle" style={{ fontWeight: "600" }}>IBAN Yönetimi</ThemedText>
            <ThemedText type="caption" style={{ color: colors.textSecondary, marginTop: 4 }}>
              {ibanList.length} kayıtlı
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={24} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Uygulama Bölümü */}
      <View style={[styles.section, { borderColor: colors.border }]}>
        <ThemedText type="h4" style={styles.sectionTitle}>Uygulama</ThemedText>
        
        <Pressable 
          style={styles.listItem}
          onPress={() => setAboutModalVisible(true)}
        >
          <View style={styles.listItemContent}>
            <ThemedText type="subtitle" style={{ fontWeight: "600" }}>Hakkımızda</ThemedText>
            <ThemedText type="caption" style={{ color: colors.textSecondary, marginTop: 4 }}>
              v1.0.0
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={24} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Hesap Bölümü */}
      <View style={[styles.section, { borderColor: colors.border }]}>
        <ThemedText type="h4" style={styles.sectionTitle}>Hesap Yönetimi</ThemedText>
        
        <Pressable 
          style={styles.listItem}
          onPress={openDeleteModal}
        >
          <ThemedText type="subtitle" style={{ color: colors.destructive, fontWeight: "600" }}>
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
            backgroundColor: isDark ? colors.border : colors.backgroundRoot,
            opacity: pressed ? 0.8 : 1 
          }
        ]}
      >
        <Feather name="log-out" size={20} color={colors.text} />
        <ThemedText type="body" style={styles.logoutText}>Çıkış Yap</ThemedText>
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

      <AboutModal isVisible={aboutModalVisible} onClose={() => setAboutModalVisible(false)} colors={colors} />
      
      {/* HESAP SİLME ONAY MODALI */}
      <Modal 
        visible={isDeleteModalVisible} 
        transparent 
        animationType="fade" 
        onRequestClose={closeDeleteModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeDeleteModal}>
          <Pressable 
            onPress={(e) => e.stopPropagation()} 
            style={[styles.deleteModalContent, { backgroundColor: colors.backgroundDefault }]}
          >
            <ThemedText type="h3" style={{ marginBottom: Spacing.md }}>Hesabınızı Silin</ThemedText>
            <ThemedText style={{ marginBottom: Spacing.md, color: colors.textSecondary }}>
              Onaylamak için şifrenizi girin. Bu işlem geri alınamaz.
            </ThemedText>
            
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.backgroundRoot }]}
              placeholder="Şifreniz"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              value={deletePassword}
              onChangeText={setDeletePassword}
            />

            <View style={styles.modalButtons}>
              <Pressable 
                onPress={closeDeleteModal} 
                style={[styles.modalButton, { borderColor: colors.border, borderWidth: 1 }]}
              >
                <ThemedText type="body" style={{ fontWeight: "600" }}>İptal</ThemedText>
              </Pressable>
              
              <Pressable
                onPress={performDeleteAccount}
                disabled={!deletePassword.trim() || isDeleting}
                style={[
                  styles.modalButton, 
                  { 
                    backgroundColor: colors.destructive,
                    opacity: (!deletePassword.trim() || isDeleting) ? 0.5 : 1
                  }
                ]}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <ThemedText style={{ color: '#FFF', fontWeight: '600' }}>Sil</ThemedText>
                )}
              </Pressable>
            </View>
            
            {deleteError ? (
              <ThemedText style={{ color: colors.destructive, textAlign: 'center', marginTop: Spacing.md }}>
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
    borderBottomWidth: 1 
  },
  sectionTitle: { 
    marginBottom: Spacing.lg, 
    fontWeight: "600" 
  },
  listItem: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingVertical: Spacing.lg, 
    paddingHorizontal: 0
  },
  listItemContent: {
    flex: 1
  },
  input: { 
    height: 48, 
    borderWidth: 1, 
    borderRadius: BorderRadius.sm, 
    paddingHorizontal: Spacing.md, 
    marginBottom: Spacing.lg,
    fontSize: 16
  },
  logoutButton: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    height: 52, 
    borderRadius: BorderRadius.sm, 
    gap: Spacing.sm, 
    marginVertical: Spacing.xl 
  },
  logoutText: { 
    fontWeight: "600" 
  },
  modalOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: "rgba(0, 0, 0, 0.5)", 
    justifyContent: "center", 
    alignItems: "center", 
    zIndex: 1000 
  },
  aboutModalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    flexDirection: 'column',
  },
  aboutModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  deleteModalContent: { 
    width: '85%', 
    padding: Spacing.xl, 
    borderRadius: BorderRadius.lg,
    elevation: 5 
  },
  modalButtons: { 
    flexDirection: "row", 
    gap: Spacing.md, 
    marginTop: Spacing.lg 
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
