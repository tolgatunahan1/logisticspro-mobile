import React, { useState, useCallback } from "react";
import { StyleSheet, View, TextInput, Pressable, FlatList, Alert, RefreshControl } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { Carrier, getCarriers, searchCarriers, deleteCarrier, getVehicleTypeLabel } from "@/utils/storage";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CarrierListScreen() {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const colors = isDark ? Colors.dark : Colors.light;

  const loadCarriers = useCallback(async () => {
    try {
      const data = await getCarriers();
      setCarriers(data);
    } catch (error) {
      console.error("Failed to load carriers:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCarriers();
    }, [loadCarriers])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadCarriers();
  };

  const handleAddPress = () => {
    navigation.navigate("CarrierForm", { mode: "add" });
  };

  const handleEditPress = (carrier: Carrier) => {
    navigation.navigate("CarrierForm", { carrier, mode: "edit" });
  };

  const handleDeletePress = (carrier: Carrier) => {
    Alert.alert(
      "Nakliyeciyi Sil",
      `"${carrier.name}" adlı nakliyeciyi silmek istediğinizden emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            await deleteCarrier(carrier.id);
            loadCarriers();
          },
        },
      ]
    );
  };

  const handleSettingsPress = () => {
    navigation.navigate("Settings");
  };

  const handleCallPress = (phone: string) => {
    Alert.alert("Arama", `${phone} numarasını arayın`);
  };

  const filteredCarriers = searchCarriers(carriers, searchQuery);

  const renderCarrierItem = ({ item }: { item: Carrier }) => (
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
          <View style={styles.cardRow}>
            <Pressable
              onPress={() => handleCallPress(item.phone)}
              style={styles.phoneButton}
            >
              <Feather name="phone" size={14} color={theme.link} />
              <ThemedText type="small" style={{ color: theme.link, marginLeft: Spacing.xs }}>
                {item.phone}
              </ThemedText>
            </Pressable>
          </View>
          <View style={styles.cardDetails}>
            <View style={styles.detailItem}>
              <Feather name="truck" size={14} color={colors.textSecondary} />
              <ThemedText type="small" style={{ color: colors.textSecondary, marginLeft: Spacing.xs }}>
                {item.plate}
              </ThemedText>
            </View>
            <View style={styles.detailItem}>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                {getVehicleTypeLabel(item.vehicleType)}
              </ThemedText>
            </View>
          </View>
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
      <Feather name="truck" size={64} color={colors.textSecondary} />
      <ThemedText type="h4" style={[styles.emptyTitle, { color: colors.textSecondary }]}>
        Henüz nakliyeci yok
      </ThemedText>
      <ThemedText type="body" style={[styles.emptyText, { color: colors.textSecondary }]}>
        {searchQuery ? "Arama sonucu bulunamadı" : "Yeni bir nakliyeci eklemek için + butonuna dokunun"}
      </ThemedText>
    </View>
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={handleSettingsPress}
          style={({ pressed }) => [
            styles.headerButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Feather name="settings" size={22} color={theme.text} />
        </Pressable>
      ),
    });
  }, [navigation, theme]);

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
        data={filteredCarriers}
        keyExtractor={(item) => item.id}
        renderItem={renderCarrierItem}
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
    gap: Spacing.xs,
  },
  cardName: {
    marginBottom: Spacing.xs,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  phoneButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    marginTop: Spacing.xs,
  },
  detailItem: {
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
  headerButton: {
    padding: Spacing.sm,
  },
});
