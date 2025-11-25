import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable, FlatList, Alert } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { getJobs, getCompanies, deleteJob, PlannedJob, Company, searchJobs } from "@/utils/storage";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function JobListScreen() {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const [jobs, setJobs] = useState<PlannedJob[]>([]);
  const [companies, setCompanies] = useState<{ [key: string]: Company }>({});
  const [filteredJobs, setFilteredJobs] = useState<PlannedJob[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const colors = isDark ? Colors.dark : Colors.light;

  const loadData = useCallback(async () => {
    const allJobs = await getJobs();
    const allCompanies = await getCompanies();
    
    const companiesMap = allCompanies.reduce((acc, company) => {
      acc[company.id] = company;
      return acc;
    }, {} as { [key: string]: Company });

    setJobs(allJobs);
    setCompanies(companiesMap);
    setFilteredJobs(allJobs);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredJobs(jobs);
    } else {
      setFilteredJobs(searchJobs(jobs, query));
    }
  }, [jobs]);

  const handleDelete = (job: PlannedJob) => {
    const company = companies[job.companyId];
    Alert.alert(
      "İşi Sil",
      `"${company?.name}" - ${job.cargoType}" iş kaydını silmek istediğinizden emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            await deleteJob(job.id);
            await loadData();
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("tr-TR");
  };

  const handleAddPress = () => {
    navigation.navigate("JobForm", { mode: "add" });
  };

  const handleJobPress = (job: PlannedJob) => {
    navigation.navigate("JobForm", { job, mode: "edit" });
  };

  const renderJobItem = ({ item: job }: { item: PlannedJob }) => {
    const company = companies[job.companyId];
    return (
      <Pressable
        onPress={() => handleJobPress(job)}
        style={({ pressed }) => [
          styles.jobCard,
          {
            backgroundColor: colors.backgroundDefault,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <View style={styles.jobCardHeader}>
          <View style={{ flex: 1 }}>
            <ThemedText type="h4" numberOfLines={1}>
              {company?.name || "Bilinmeyen Firma"}
            </ThemedText>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              {job.cargoType}
            </ThemedText>
          </View>
          <Pressable
            onPress={() => handleDelete(job)}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Feather name="trash-2" size={18} color={Colors.light.error} />
          </Pressable>
        </View>

        <View style={styles.jobCardDetails}>
          <View style={styles.detailRow}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Yükleme:
            </ThemedText>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              {job.loadingLocation}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Teslimat:
            </ThemedText>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              {job.deliveryLocation}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Tarih:
            </ThemedText>
            <ThemedText type="body">
              {formatDate(job.loadingDate)} - {formatDate(job.deliveryDate)}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Tonaj:
            </ThemedText>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              {job.tonnage} T
            </ThemedText>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="inbox" size={48} color={colors.textSecondary} />
      <ThemedText type="h4" style={{ marginTop: Spacing.lg }}>
        Henüz iş yok
      </ThemedText>
      <ThemedText type="body" style={{ color: colors.textSecondary, marginTop: Spacing.sm }}>
        Yeni bir iş eklemek için + düğmesini kullanın
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.searchContainer, { paddingTop: Spacing.lg, paddingBottom: Spacing.md }]}>
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: colors.backgroundDefault,
              borderColor: colors.border,
            },
          ]}
        >
          <Feather name="search" size={18} color={colors.textSecondary} />
          <input
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="İş ara..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      <FlatList
        data={filteredJobs}
        renderItem={renderJobItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        scrollEnabled={true}
      />

      <Pressable
        onPress={handleAddPress}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: theme.link,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }],
            bottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.lg,
  },
  jobCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  jobCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  jobCardDetails: {
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.xl * 2,
  },
  fab: {
    position: "absolute",
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
