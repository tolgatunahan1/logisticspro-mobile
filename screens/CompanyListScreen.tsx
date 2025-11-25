import React, { useState, useCallback } from "react";
import { StyleSheet, View, TextInput, Pressable, FlatList, Alert, RefreshControl, Linking } from "react-native";
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
            await deleteCompany(company.id);
            loadCompanies();
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
    const message = encodeURIComponent(`Merhaba ${name}`);
    const url = `whatsapp://send?phone=${phoneNumber}&text=${message}`;
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        const webUrl = `https://wa.me/${phoneNumber}?text=${message}`;
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      Alert.alert("Hata", "WhatsApp açılamadı. WhatsApp yüklü olduğundan emin olun.");
    }
  };

  const filteredCompanies = searchCompanies(companies, searchQuery);

  const renderCompanyItem = ({ item }: { item: Company }) => (
    <Pressable
      onPress={() => handleEditPress(item)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.backgroundDefault,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardMain}>
          <ThemedText type="h4" style={styles.cardName}>
            {item.name}
          </ThemedText>
          <View style={styles.phoneRow}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              {item.phone}
            </ThemedText>
            <View style={styles.contactButtons}>
              <Pressable
                onPress={() => handleCallPress(item.phone)}
                style={({ pressed }) => [
                  styles.contactButton,
                  { backgroundColor: colors.success, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Feather name="phone" size={14} color="#FFFFFF" />
              </Pressable>
              <Pressable
                onPress={() => handleWhatsAppPress(item.phone, item.name)}
                style={({ pressed }) => [
                  styles.contactButton,
                  { backgroundColor: "#25D366", opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Feather name="message-circle" size={14} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
          <View style={styles.cardDetails}>
            <View style={styles.detailItem}>
              <Feather name="user" size={14} color={colors.textSecondary} />
              <ThemedText type="small" style={{ color: colors.textSecondary, marginLeft: Spacing.xs }}>
                {item.contactPerson}
              </ThemedText>
            </View>
          </View>
          {item.address ? (
            <View style={styles.addressRow}>
              <Feather name="map-pin" size={14} color={colors.textSecondary} />
              <ThemedText type="small" style={{ color: colors.textSecondary, marginLeft: Spacing.xs, flex: 1 }} numberOfLines={1}>
                {item.address}
              </ThemedText>
            </View>
          ) : null}
        </View>
        <View style={styles.cardActions}>
          <Pressable
            onPress={() => handleEditPress(item)}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.backgroundSecondary, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="edit-2" size={18} color={theme.link} />
          </Pressable>
          <Pressable
            onPress={() => handleDeletePress(item)}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.backgroundSecondary, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="trash-2" size={18} color={colors.destructive} />
          </Pressable>
        </View>
      </View>
    </Pressable>
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
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardMain: {
    flex: 1,
    gap: Spacing.sm,
  },
  cardName: {
    marginBottom: Spacing.xs,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: Spacing.sm,
  },
  contactButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  contactButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
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
