import React, { useState, useCallback, useMemo } from "react";
import { StyleSheet, View, TextInput, Pressable, FlatList, Alert, RefreshControl, Linking, Modal, ScrollView, Platform, Keyboard } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../hooks/useTheme";
import { useDeleteOperation } from "../hooks/useDeleteOperation";
import { useAuth } from "../contexts/AuthContext";
import { RootStackParamList } from "../navigation/RootNavigator";
import { Company, getCompanies, searchCompanies, deleteCompany } from "../utils/storage";
import { Spacing, BorderRadius, Colors } from "../constants/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const formatPhoneForCall = (phone: string): string => {
  return phone.replace(/\s/g, "").replace(/[^\d+]/g, "");
};

const formatPhoneForWhatsApp = (phone: string): string => {
  let cleaned = phone.replace(/\s/g, "").replace(/[^\d]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "90" + cleaned.substring(1);
  } else if (!cleaned.startsWith("90") && cleaned.length === 10) {
    cleaned = "90" + cleaned;
  }
  return cleaned;
};

export default function CompanyListScreen() {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { deleteState, openDeleteConfirm, closeDeleteConfirm, confirmDelete } = useDeleteOperation<Company>("Company");
  const { firebaseUser } = useAuth();
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const colors = isDark ? Colors.dark : Colors.light;

  const loadCompanies = useCallback(async () => {
    if (!firebaseUser?.uid) return;
    try {
      const data = await getCompanies(firebaseUser.uid);
      setCompanies(data);
    } catch (error) {
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [firebaseUser?.uid]);

  useFocusEffect(
    useCallback(() => {
      loadCompanies();
    }, [loadCompanies])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadCompanies();
  };

  const handleAddPress = () => {
    navigation.navigate("CompanyForm", { mode: "add" });
  };

  const handleEditPress = (company: Company) => {
    navigation.navigate("CompanyForm", { company, mode: "edit" });
  };

  const handleDeletePress = (company: Company) => {
    openDeleteConfirm(company);
  };

  const handleCallPress = async (phone: string) => {
    const phoneNumber = formatPhoneForCall(phone);
    const url = `tel:${phoneNumber}`;
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Hata", "Telefon araması yapılamıyor");
      }
    } catch (error) {
      Alert.alert("Hata", "Telefon araması başlatılamadı");
    }
  };

  const handleWhatsAppPress = async (phone: string, name: string) => {
    const phoneNumber = formatPhoneForWhatsApp(phone);
    
    try {
      const webUrl = `https://wa.me/${phoneNumber}`;
      const canOpen = await Linking.canOpenURL(webUrl);
      
      if (!canOpen) {
        Alert.alert("Hata", "WhatsApp uygulaması yüklü değil. Lütfen WhatsApp'ı yükleyin.");
        return;
      }
      
      await Linking.openURL(webUrl);
    } catch (error) {
      Alert.alert("Hata", "WhatsApp açılamadı. Lütfen daha sonra tekrar deneyin.");
    }
  };

  const filteredCompanies = useMemo(() => 
    searchCompanies(companies, searchQuery), 
    [companies, searchQuery]
  );

  const renderCompanyItem = ({ item }: { item: Company }) => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundDefault,
        },
      ]}
    >
      <Pressable
        onPress={() => {
          setSelectedCompany(item);
          setShowDetailModal(true);
        }}
        style={{ flex: 1 }}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <ThemedText type="h4" numberOfLines={1}>
              {item.name}
            </ThemedText>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              {item.phone}
            </ThemedText>
          </View>
          <View style={{ flexDirection: "row", gap: Spacing.md, alignItems: "center" }}>
            <Pressable
              onPress={() => handleEditPress(item)}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Feather name="edit" size={18} color={theme.link} />
            </Pressable>
            <Pressable
              onPress={() => handleDeletePress(item)}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Feather name="trash-2" size={18} color={colors.destructive} />
            </Pressable>
          </View>
        </View>
      </Pressable>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="briefcase" size={64} color={colors.textSecondary} />
      <ThemedText type="h4" style={[styles.emptyTitle, { color: colors.textSecondary }]}>
        Henüz firma yok
      </ThemedText>
      <ThemedText type="body" style={[styles.emptyText, { color: colors.textSecondary }]}>
        {searchQuery ? "Arama sonucu bulunamadı" : "Yeni bir firma eklemek için + butonuna dokunun"}
      </ThemedText>
    </View>
  );

  const renderSearchBar = () => (
    <View style={[styles.searchContainer, { width: '100%', backgroundColor: theme.backgroundRoot, paddingTop: insets.top + Spacing.lg, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl }]}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: Spacing.md,
          borderRadius: BorderRadius.md,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.backgroundDefault,
          height: 40,
        }}
      >
        <Feather name="search" size={16} color={colors.textSecondary} />
        <TextInput
          style={{
            flex: 1,
            paddingHorizontal: Spacing.md,
            color: theme.text,
            fontSize: 14,
          }}
          placeholder="Firma Ara"
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => Keyboard.dismiss()}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          blurOnSubmit={false}
          underlineColorAndroid="transparent"
          textContentType="none"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Feather name="x" size={16} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {renderSearchBar()}
      <FlatList
        data={filteredCompanies}
        keyExtractor={(item) => item.id}
        renderItem={renderCompanyItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: Spacing.lg, paddingBottom: insets.bottom + Spacing.fabSize + Spacing["3xl"] },
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.link}
          />
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={true}
      />

      {/* ID Card Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowDetailModal(false)}
      >
        <Pressable 
          style={styles.idCardOverlay}
          onPress={() => setShowDetailModal(false)}
        >
          <Pressable style={styles.idCardWrapper} onPress={(e) => e.stopPropagation()}>
            {selectedCompany && (
              <View style={[styles.idCard, { backgroundColor: colors.backgroundDefault, borderColor: colors.success }]}>
                <View style={[styles.idCardHeader, { backgroundColor: colors.success }]}>
                  <Feather name="briefcase" size={40} color="#FFFFFF" />
                </View>

                <View style={styles.idCardName}>
                  <ThemedText type="h3" style={{ fontWeight: "700", textAlign: "center", color: theme.text }}>
                    {selectedCompany.name}
                  </ThemedText>
                </View>

                <View style={styles.idCardGrid}>
                  <View style={styles.idCardGridRow}>
                    <View style={[styles.idCardGridItem, { flex: 1 }]}>
                      <ThemedText type="small" style={{ color: colors.textSecondary, marginBottom: 4, fontSize: 11 }}>TELEFON</ThemedText>
                      <ThemedText type="body" style={{ fontWeight: "700", color: theme.text }}>{selectedCompany.phone}</ThemedText>
                    </View>
                  </View>

                  {selectedCompany.address && (
                    <View style={[styles.idCardGridRow, { paddingHorizontal: 0, marginTop: Spacing.xs }]}>
                      <View style={[styles.idCardGridItem, { flex: 1 }]}>
                        <ThemedText type="small" style={{ color: colors.textSecondary, marginBottom: 4, fontSize: 11 }}>ADRES</ThemedText>
                        <ThemedText type="body" style={{ fontWeight: "700", color: theme.text }}>{selectedCompany.address}</ThemedText>
                      </View>
                    </View>
                  )}
                </View>

                <View style={styles.idCardActions}>
                  <Pressable
                    onPress={() => {
                      setShowDetailModal(false);
                      handleCallPress(selectedCompany.phone);
                    }}
                    style={({ pressed }) => [
                      styles.idCardActionBtn,
                      { backgroundColor: colors.success, opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.92 : 1 }] },
                    ]}
                  >
                    <Feather name="phone" size={16} color="#FFFFFF" />
                    <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "600" }}>Ara</ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setShowDetailModal(false);
                      handleWhatsAppPress(selectedCompany.phone, selectedCompany.name);
                    }}
                    style={({ pressed }) => [
                      styles.idCardActionBtn,
                      { backgroundColor: "#25D366", opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.92 : 1 }] },
                    ]}
                  >
                    <Feather name="message-circle" size={16} color="#FFFFFF" />
                    <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "600" }}>WhatsApp</ThemedText>
                  </Pressable>
                </View>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>

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
              <ThemedText type="h3" style={{ marginBottom: Spacing.md, fontWeight: "700" }}>Firmayı Sil</ThemedText>
              <ThemedText type="body" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                "{deleteState.item?.name}" adlı firmayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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
                  await confirmDelete(async (company) => {
                    const success = await deleteCompany(firebaseUser!.uid, company.id);
                    if (success) {
                      await loadCompanies();
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

      <Pressable
        onPress={handleAddPress}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: theme.link,
            bottom: insets.bottom + Spacing.lg,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
      >
        <Feather name="plus" size={24} color={colors.buttonText} />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  card: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
  },
  emptyTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
  idCardOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  idCardWrapper: {
    width: "100%",
    maxWidth: 340,
  },
  idCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },
  idCardHeader: {
    padding: Spacing.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  idCardName: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  idCardGrid: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  idCardGridRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  idCardGridItem: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: BorderRadius.sm,
  },
  idCardActions: {
    flexDirection: "row",
    gap: Spacing.md,
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  idCardActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  fab: {
    position: "absolute",
    right: Spacing.lg,
    width: Spacing.fabSize,
    height: Spacing.fabSize,
    borderRadius: Spacing.fabSize / 2,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});
