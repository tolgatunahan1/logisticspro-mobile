import React, { useState, useCallback } from "react";
import { StyleSheet, View, TextInput, Pressable, FlatList, Alert, RefreshControl, Linking, Modal, ScrollView, Platform } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { Company, getCompanies, searchCompanies, deleteCompany } from "@/utils/storage";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

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
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [deletingCompanyId, setDeletingCompanyId] = useState<string | null>(null);

  const colors = isDark ? Colors.dark : Colors.light;

  const loadCompanies = useCallback(async () => {
    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch (error) {
      console.error("Failed to load companies:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

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
    Alert.alert(
      "Firmayı Sil",
      `"${company.name}" adlı firmayı silmek istediğinizden emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCompany(company.id);
              await loadCompanies();
              setShowDetailModal(false);
            } catch (error) {
              console.error("Silme hatası:", error);
              Alert.alert("Hata", "Firma silinirken hata oluştu");
            }
          },
        },
      ]
    );
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
      await Linking.openURL(webUrl);
    } catch (error) {
      Alert.alert("Hata", "WhatsApp açılamadı. Lütfen daha sonra tekrar deneyin.");
    }
  };

  const filteredCompanies = searchCompanies(companies, searchQuery);

  const handleSwipeDelete = (company: Company) => {
    Alert.alert(
      "Firmayı Sil",
      `"${company.name}" adlı firmayı silmek istediğinizden emin misiniz?`,
      [
        { text: "İptal", style: "cancel", onPress: () => setDeletingCompanyId(null) },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCompany(company.id);
              await loadCompanies();
              setDeletingCompanyId(null);
            } catch (error) {
              console.error("Silme hatası:", error);
              Alert.alert("Hata", "Firma silinirken hata oluştu");
              setDeletingCompanyId(null);
            }
          },
        },
      ]
    );
  };

  const renderCompanyItem = ({ item }: { item: Company }) => {
    const isDeleting = deletingCompanyId === item.id;
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDeleting ? colors.destructive : colors.backgroundDefault,
            flexDirection: "row",
          },
        ]}
      >
        <Pressable
          onPress={() => {
            setSelectedCompany(item);
            setShowDetailModal(true);
          }}
          onLongPress={() => setDeletingCompanyId(item.id)}
          style={{ flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
        >
          <View style={{ flex: 1 }}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <ThemedText type="h4" numberOfLines={1} style={{ color: isDeleting ? colors.buttonText : theme.text }}>
                  {item.name}
                </ThemedText>
              </View>
              {!isDeleting && (
                <View style={{ flexDirection: "row", gap: Spacing.md, alignItems: "center" }}>
                  <Pressable
                    onPress={() => handleEditPress(item)}
                    style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                  >
                    <Feather name="edit" size={18} color={theme.link} />
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </Pressable>

        {isDeleting && (
          <Pressable
            onPress={() => handleSwipeDelete(item)}
            style={[styles.deleteAction, { backgroundColor: colors.destructive }]}
          >
            <Feather name="trash-2" size={20} color={colors.buttonText} />
          </Pressable>
        )}
      </View>
    );
  };

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

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.searchContainer, { paddingTop: headerHeight + Spacing.lg }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.backgroundDefault }]}>
          <Feather name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Ara..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery("")}>
              <Feather name="x" size={18} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <FlatList
        data={filteredCompanies}
        keyExtractor={(item) => item.id}
        renderItem={renderCompanyItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing.fabSize + Spacing["3xl"] },
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
      />

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundRoot }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <ThemedText type="h3">Firma Detayları</ThemedText>
              <Pressable onPress={() => setShowDetailModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            {/* Modal Body */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {selectedCompany && (
                <View style={{ gap: Spacing.lg }}>
                  <View style={styles.detailSection}>
                    <ThemedText type="small" style={{ color: colors.textSecondary }}>
                      Firma Adı
                    </ThemedText>
                    <ThemedText type="h4">{selectedCompany.name}</ThemedText>
                  </View>

                  <View style={styles.detailSection}>
                    <ThemedText type="small" style={{ color: colors.textSecondary }}>
                      Telefon
                    </ThemedText>
                    <ThemedText type="h4">{selectedCompany.phone}</ThemedText>
                  </View>

                  <View style={styles.detailSection}>
                    <ThemedText type="small" style={{ color: colors.textSecondary }}>
                      Yetkili Kişi
                    </ThemedText>
                    <ThemedText type="h4">{selectedCompany.contactPerson}</ThemedText>
                  </View>

                  <View style={styles.detailSection}>
                    <ThemedText type="small" style={{ color: colors.textSecondary }}>
                      Adres
                    </ThemedText>
                    <ThemedText type="h4">{selectedCompany.address || "-"}</ThemedText>
                  </View>

                  {/* Action Buttons */}
                  <View style={{ flexDirection: "row", gap: Spacing.lg, marginTop: Spacing.lg, justifyContent: "center" }}>
                    <Pressable
                      onPress={() => {
                        setShowDetailModal(false);
                        handleCallPress(selectedCompany.phone);
                      }}
                      style={({ pressed }) => [
                        styles.actionButtonRound,
                        { backgroundColor: colors.success, opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.92 : 1 }] },
                      ]}
                    >
                      <Feather name="phone" size={24} color="#FFFFFF" />
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setShowDetailModal(false);
                        handleWhatsAppPress(selectedCompany.phone, selectedCompany.name);
                      }}
                      style={({ pressed }) => [
                        styles.actionButtonRound,
                        { backgroundColor: "#25D366", opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.92 : 1 }] },
                      ]}
                    >
                      <Feather name="message-circle" size={24} color="#FFFFFF" />
                    </Pressable>
                  </View>
                </View>
              )}
            </ScrollView>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    paddingBottom: Spacing["3xl"],
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
  },
  modalBody: {
    padding: Spacing.lg,
  },
  detailSection: {
    gap: Spacing.xs,
  },
  actionButtonRound: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xs,
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xs,
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing["5xl"],
    gap: Spacing.md,
  },
  emptyTitle: {
    marginTop: Spacing.lg,
  },
  emptyText: {
    textAlign: "center",
    paddingHorizontal: Spacing["3xl"],
  },
  fab: {
    position: "absolute",
    right: Spacing.lg,
    width: Spacing.fabSize,
    height: Spacing.fabSize,
    borderRadius: Spacing.fabSize / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
