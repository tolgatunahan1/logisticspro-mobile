import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable, Alert, Modal, TextInput, ActivityIndicator, Linking, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import * as Notifications from "expo-notifications";

import { ThemedText } from "../components/ThemedText";
import { ScreenContainer } from "../components/ScreenContainer";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../contexts/AuthContext";
import { Spacing, BorderRadius, Colors } from "../constants/theme";
import { getIBANs, addIBAN, deleteIBAN, IBAN, getCompletedJobs } from "../utils/storage";
import { IBANListModal } from "../components/IBANListModal";
import { firebaseAuthService } from "../utils/firebaseAuth";

// --- Hakkımızda Modalı ---
const AboutModal = ({ isVisible, onClose, colors }) => {
  return (
    <Modal visible={isVisible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={[styles.modalOverlay, { backgroundColor: "rgba(0, 0, 0, 0.5)" }]}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View style={[styles.modalContent, { backgroundColor: colors.backgroundDefault, width: '90%' }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">Hakkımızda</ThemedText>
              <Pressable onPress={onClose}>
                <Feather name="x" size={24} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <ThemedText style={{ marginBottom: Spacing.md }}>
                LogisticsPRO v1.0.0
              </ThemedText>
              <Pressable onPress={() => Linking.openURL('mailto:support@logisticspro.com')}>
                <ThemedText type="link">Destek: support@logisticspro.com</ThemedText>
              </Pressable>
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default function SettingsScreen() {
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const navigation = useNavigation();
  const { logout, firebaseUser } = useAuth();
  
  // --- KENDİ KONTROLÜMÜZ (Hook'tan bağımsız) ---
  // Silme modalını ve şifresini artık burada, güvenli şekilde yönetiyoruz
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [ibanList, setIbanList] = useState<IBAN[]>([]);
  const [ibanModalVisible, setIbanModalVisible] = useState(false);
  const [ibanInput, setIbanInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [completedJobsCount, setCompletedJobsCount] = useState(0);

  const loadCompletedJobsCount = useCallback(async () => {
    if (!firebaseUser) return;
    try {
      const jobs = await getCompletedJobs(firebaseUser.uid);
      setCompletedJobsCount(jobs.length);
    } catch (error) { console.error(error); }
  }, [firebaseUser]);

  const loadIBANs = useCallback(async () => {
    if (!firebaseUser) return;
    try {
      const ibans = await getIBANs(firebaseUser.uid);
      setIbanList(ibans);
    } catch (error) { console.error(error); }
  }, [firebaseUser]);

  const closeIBANModal = () => {
    setIbanModalVisible(false);
    setIbanInput("");
    setNameInput("");
  };

  const handleAddIBAN = async () => {
    if (!nameInput.trim() || !ibanInput.trim()) { Alert.alert("Hata", "Eksik bilgi."); return; }
    setIsAdding(true);
    await addIBAN(firebaseUser.uid, { name: nameInput.trim(), iban: ibanInput.trim() });
    await loadIBANs();
    closeIBANModal();
    setIsAdding(false);
  };

  const handleDeleteIBAN = async (ibanToDelete: IBAN) => {
     await deleteIBAN(firebaseUser.uid, ibanToDelete.iban);
     await loadIBANs();
  };

  // --- HESAP SİLME İŞLEMLERİ (Local) ---
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
      loadCompletedJobsCount();
    }, [loadIBANs, loadCompletedJobsCount])
  );

  return (
    <ScreenContainer scrollable style={{ paddingTop: 0 }}>
      
      <View style={[styles.section, { borderColor: colors.border }]}>
        <ThemedText type="h4" style={styles.sectionTitle}>Ödeme ve Hesap</ThemedText>
        
        <Pressable style={styles.listItem} onPress={() => setIbanModalVisible(true)}>
          <ThemedText type="subtitle">IBAN Yönetimi ({ibanList.length})</ThemedText>
          <Feather name="chevron-right" size={24} color={colors.textSecondary} />
        </Pressable>

        <Pressable style={styles.listItem} onPress={() => setAboutModalVisible(true)}>
          <ThemedText type="subtitle">Hakkımızda</ThemedText>
          <Feather name="chevron-right" size={24} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={[styles.section, { borderColor: colors.border }]}>
        <ThemedText type="h4" style={styles.sectionTitle}>Veri Yönetimi</ThemedText>
        
        <Pressable style={styles.listItem} onPress={() => navigation.navigate('CompletedJobList' as never)}>
          <ThemedText type="subtitle">Tamamlanan İşler ({completedJobsCount})</ThemedText>
          <Feather name="chevron-right" size={24} color={colors.textSecondary} />
        </Pressable>
        
        {/* HESAP SİLME BUTONU - Artık güvenli lokal fonksiyona bağlı */}
        <Pressable 
          style={styles.listItem} 
          onPress={openDeleteModal} 
        >
          <ThemedText type="subtitle" style={{ color: colors.destructive }}>
            Hesabımı Sil
          </ThemedText>
          <Feather name="trash-2" size={24} color={colors.destructive} />
        </Pressable>
      </View>

      <Pressable onPress={logout} style={({ pressed }) => [styles.logoutButton, { backgroundColor: isDark ? colors.border : colors.backgroundRoot, opacity: pressed ? 0.8 : 1 }]}>
        <Feather name="log-out" size={20} color={colors.text} />
        <ThemedText type="body" style={styles.logoutText}>Çıkış Yap</ThemedText>
      </Pressable>
      
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
      
      {/* HESAP SİLME ONAY MODALI (DÜZELTİLDİ) */}
      <Modal 
        visible={isDeleteModalVisible} 
        transparent 
        animationType="fade" 
        onRequestClose={closeDeleteModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeDeleteModal}>
          <Pressable onPress={(e) => e.stopPropagation()} style={[styles.deleteModalContent, { backgroundColor: colors.backgroundDefault }]}>
            <ThemedText type="h3" style={{ marginBottom: Spacing.md }}>Hesabınızı Silin</ThemedText>
            <ThemedText style={{ marginBottom: Spacing.md }}>Onaylamak için şifrenizi girin.</ThemedText>
            
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.backgroundRoot }]}
              placeholder="Şifreniz"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              value={deletePassword}
              onChangeText={setDeletePassword}
            />

            <View style={styles.modalButtons}>
              <Pressable onPress={closeDeleteModal} style={{ flex: 1, padding: 10 }}>
                <ThemedText type="body">İptal</ThemedText>
              </Pressable>
              
              <Pressable
                onPress={performDeleteAccount}
                disabled={!deletePassword.trim() || isDeleting}
                style={{ flex: 1, padding: 10, backgroundColor: colors.destructive, borderRadius: 8 }}
              >
                 {isDeleting ? <ActivityIndicator color="#FFF"/> : <ThemedText style={{color:'#FFF', textAlign:'center', fontWeight:'600'}}>Sil</ThemedText>}
              </Pressable>
            </View>
            
            {deleteError ? <ThemedText style={{ color: colors.destructive, textAlign: 'center', marginTop: 10 }}>{deleteError}</ThemedText> : null}

          </Pressable>
        </Pressable>
      </Modal>

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: { paddingTop: Spacing.lg, paddingBottom: Spacing.md, marginBottom: Spacing.lg, borderBottomWidth: 1 },
  sectionTitle: { marginBottom: Spacing.lg, fontWeight: "600" },
  listItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm },
  input: { height: 40, borderWidth: 1, borderRadius: BorderRadius.xs, paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
  logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: Spacing.buttonHeight, borderRadius: BorderRadius.xs, gap: Spacing.sm, marginTop: Spacing.xl },
  logoutText: { fontWeight: "600" },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modalContent: { width: '90%', maxHeight: "90%", borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg },
  deleteModalContent: { width: '80%', padding: Spacing.xl, borderRadius: BorderRadius.xs, elevation: 5 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: Spacing.lg, alignItems: 'center' },
  modalButtons: { flexDirection: "row", gap: Spacing.md, marginTop: Spacing.md },
});