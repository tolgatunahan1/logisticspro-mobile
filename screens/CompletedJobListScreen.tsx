import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable, FlatList, Alert, TextInput, Modal, ScrollView, Platform, Share } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { getCompletedJobs, getCompanies, deleteCompletedJob, CompletedJob, Company, searchCompletedJobs, getCarriers, Carrier } from "@/utils/storage";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CompletedJobListScreen() {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const [jobs, setJobs] = useState<CompletedJob[]>([]);
  const [companies, setCompanies] = useState<{ [key: string]: Company }>({});
  const [carriers, setCarriers] = useState<{ [key: string]: Carrier }>({});
  const [filteredJobs, setFilteredJobs] = useState<CompletedJob[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<CompletedJob | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<CompletedJob | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const colors = isDark ? Colors.dark : Colors.light;

  const loadData = useCallback(async () => {
    const allJobs = await getCompletedJobs();
    const allCompanies = await getCompanies();
    const allCarriers = await getCarriers();
    
    const companiesMap = allCompanies.reduce((acc, company) => {
      acc[company.id] = company;
      return acc;
    }, {} as { [key: string]: Company });

    const carriersMap = allCarriers.reduce((acc, carrier) => {
      acc[carrier.id] = carrier;
      return acc;
    }, {} as { [key: string]: Carrier });

    setJobs(allJobs);
    setCompanies(companiesMap);
    setCarriers(carriersMap);
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
      setFilteredJobs(searchCompletedJobs(jobs, query));
    }
  }, [jobs]);

  const handleDeletePress = (job: CompletedJob) => {
    setJobToDelete(job);
    setShowDeleteConfirm(true);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("tr-TR");
  };

  const handleAddPress = () => {
    navigation.navigate("CompletedJobForm", { mode: "add" });
  };

  const handleJobPress = (job: CompletedJob) => {
    const updatedJob = jobs.find(j => j.id === job.id) || job;
    setSelectedJob(updatedJob);
    setShowDetailModal(true);
  };

  const handleEditJob = (job: CompletedJob) => {
    setShowDetailModal(false);
    navigation.navigate("CompletedJobForm", { job, mode: "edit" });
  };

  const handleShareJob = async (job: CompletedJob) => {
    let message = "*Gerçekleşen Sefer*\n\n";
    message += `*Yükleme Yeri:* ${job.loadingLocation || "-"}\n`;
    message += `*Teslimat Yeri:* ${job.deliveryLocation || "-"}\n`;
    message += `*Yük Cinsi:* ${job.cargoType || "-"}\n`;
    message += `*Yük Tonajı:* ${job.tonnage ? `${job.tonnage}` : "-"}\n`;
    message += `*Yük Ebatı:* ${job.dimensions || "-"}\n`;
    message += `*Tamamlanma Tarihi:* ${formatDate(job.completionDate)}\n`;
    message += `*Notlar:* ${job.notes || "-"}`;
    
    try {
      await Share.share({
        message,
        title: "İşi Paylaş",
      });
    } catch (error) {
      console.error("Share hatası:", error);
      Alert.alert("Hata", "Paylaşma işlemi başarısız oldu");
    }
  };

  const renderJobItem = ({ item: job }: { item: CompletedJob }) => {
    const company = companies[job.companyId];
    return (
      <View
        style={[
          styles.jobCard,
          {
            backgroundColor: colors.backgroundDefault,
          },
        ]}
      >
        <Pressable
          onPress={() => handleJobPress(job)}
          style={{ flex: 1 }}
        >
          <View style={styles.jobCardHeader}>
            <View style={{ flex: 1 }}>
              <ThemedText type="h4" numberOfLines={1}>
                {company?.name || "Bilinmeyen Firma"}
              </ThemedText>
            </View>
            <View style={{ flexDirection: "row", gap: Spacing.md, alignItems: "center" }}>
              <Pressable
                onPress={() => handleEditJob(job)}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <Feather name="edit" size={18} color={theme.link} />
              </Pressable>
            </View>
          </View>
        </Pressable>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="inbox" size={48} color={colors.textSecondary} />
      <ThemedText type="h4" style={{ marginTop: Spacing.lg }}>
        Henüz gerçekleşen iş yok
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
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="İş ara..."
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
              <ThemedText type="h3">İş Detayları</ThemedText>
              <Pressable onPress={() => setShowDetailModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            {/* Modal Body */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {selectedJob && (
                <View style={{ gap: Spacing.lg }}>
                  {/* Company Information Section */}
                  <View style={{
                    backgroundColor: colors.backgroundDefault,
                    padding: Spacing.lg,
                    borderRadius: BorderRadius.md,
                    gap: Spacing.md,
                    marginBottom: Spacing.md,
                  }}>
                    <ThemedText type="h4" style={{ fontWeight: "700" }}>
                      Gönderen Firma
                    </ThemedText>
                    <View style={styles.detailSection}>
                      <ThemedText type="small" style={{ color: colors.textSecondary }}>
                        Firma Adı
                      </ThemedText>
                      <ThemedText type="h4">
                        {companies[selectedJob.companyId]?.name || "Bilinmeyen Firma"}
                      </ThemedText>
                    </View>
                    <View style={styles.detailSection}>
                      <ThemedText type="small" style={{ color: colors.textSecondary }}>
                        Telefon
                      </ThemedText>
                      <ThemedText type="body">
                        {companies[selectedJob.companyId]?.phone || "-"}
                      </ThemedText>
                    </View>
                    <View style={styles.detailSection}>
                      <ThemedText type="small" style={{ color: colors.textSecondary }}>
                        İletişim Kişisi
                      </ThemedText>
                      <ThemedText type="body">
                        {companies[selectedJob.companyId]?.contactPerson || "-"}
                      </ThemedText>
                    </View>
                    <View style={styles.detailSection}>
                      <ThemedText type="small" style={{ color: colors.textSecondary }}>
                        Adres
                      </ThemedText>
                      <ThemedText type="body">
                        {companies[selectedJob.companyId]?.address || "-"}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Carrier Information Section */}
                  <View style={{
                    backgroundColor: colors.backgroundDefault,
                    padding: Spacing.lg,
                    borderRadius: BorderRadius.md,
                    gap: Spacing.md,
                    marginBottom: Spacing.md,
                  }}>
                    <ThemedText type="h4" style={{ fontWeight: "700" }}>
                      Nakliyeci Bilgileri
                    </ThemedText>
                    <View style={styles.detailSection}>
                      <ThemedText type="small" style={{ color: colors.textSecondary }}>
                        Nakliyeci Adı
                      </ThemedText>
                      <ThemedText type="h4">
                        {carriers[selectedJob.carrierId]?.name || "Bilinmeyen Nakliyeci"}
                      </ThemedText>
                    </View>
                    <View style={styles.detailSection}>
                      <ThemedText type="small" style={{ color: colors.textSecondary }}>
                        Telefon
                      </ThemedText>
                      <ThemedText type="body">
                        {carriers[selectedJob.carrierId]?.phone || "-"}
                      </ThemedText>
                    </View>
                    <View style={styles.detailSection}>
                      <ThemedText type="small" style={{ color: colors.textSecondary }}>
                        Araç Plakası
                      </ThemedText>
                      <ThemedText type="body">
                        {carriers[selectedJob.carrierId]?.plate || "-"}
                      </ThemedText>
                    </View>
                    <View style={styles.detailSection}>
                      <ThemedText type="small" style={{ color: colors.textSecondary }}>
                        Araç Tipi
                      </ThemedText>
                      <ThemedText type="body">
                        {carriers[selectedJob.carrierId]?.vehicleType || "-"}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Cargo Information Section */}
                  <View style={{
                    gap: Spacing.md,
                    marginTop: Spacing.md,
                  }}>
                    <ThemedText type="h4" style={{ fontWeight: "700" }}>
                      Yük Bilgileri
                    </ThemedText>
                    <View style={styles.detailSection}>
                      <ThemedText type="small" style={{ color: colors.textSecondary }}>
                        Yükün Cinsi
                      </ThemedText>
                      <ThemedText type="h4">
                        {selectedJob.cargoType || "-"}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <ThemedText type="small" style={{ color: colors.textSecondary }}>
                      Tonaj
                    </ThemedText>
                    <ThemedText type="h4">
                      {selectedJob.tonnage || "-"}
                    </ThemedText>
                  </View>

                  <View style={styles.detailSection}>
                    <ThemedText type="small" style={{ color: colors.textSecondary }}>
                      Ebat
                    </ThemedText>
                    <ThemedText type="h4">
                      {selectedJob.dimensions || "-"}
                    </ThemedText>
                  </View>

                  <View style={styles.detailSection}>
                    <ThemedText type="small" style={{ color: colors.textSecondary }}>
                      Yükleme Yeri
                    </ThemedText>
                    <ThemedText type="h4">
                      {selectedJob.loadingLocation || "-"}
                    </ThemedText>
                  </View>

                  <View style={styles.detailSection}>
                    <ThemedText type="small" style={{ color: colors.textSecondary }}>
                      Teslimat Yeri
                    </ThemedText>
                    <ThemedText type="h4">
                      {selectedJob.deliveryLocation || "-"}
                    </ThemedText>
                  </View>

                  <View style={styles.detailSection}>
                    <ThemedText type="small" style={{ color: colors.textSecondary }}>
                      Yükleme Tarihi
                    </ThemedText>
                    <ThemedText type="h4">
                      {formatDate(selectedJob.loadingDate)}
                    </ThemedText>
                  </View>

                  <View style={styles.detailSection}>
                    <ThemedText type="small" style={{ color: colors.textSecondary }}>
                      Teslimat Tarihi
                    </ThemedText>
                    <ThemedText type="h4">
                      {formatDate(selectedJob.deliveryDate)}
                    </ThemedText>
                  </View>

                  <View style={styles.detailSection}>
                    <ThemedText type="small" style={{ color: colors.textSecondary }}>
                      Tamamlanma Tarihi
                    </ThemedText>
                    <ThemedText type="h4">
                      {formatDate(selectedJob.completionDate)}
                    </ThemedText>
                  </View>

                  <View style={styles.detailSection}>
                    <ThemedText type="small" style={{ color: colors.textSecondary }}>
                      Nakliye Bedeli
                    </ThemedText>
                    <ThemedText type="h4">
                      {selectedJob.transportationCost ? `${selectedJob.transportationCost} ₺` : "-"}
                    </ThemedText>
                  </View>

                  <View style={styles.detailSection}>
                    <ThemedText type="small" style={{ color: colors.textSecondary }}>
                      Komisyon Bedeli
                    </ThemedText>
                    <ThemedText type="h4">
                      {selectedJob.commissionCost ? `${selectedJob.commissionCost} ₺` : "-"}
                    </ThemedText>
                  </View>

                  <View style={styles.detailSection}>
                    <ThemedText type="small" style={{ color: colors.textSecondary }}>
                      Notlar
                    </ThemedText>
                    <ThemedText type="body">
                      {selectedJob.notes || "-"}
                    </ThemedText>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Modal Footer - Share and Delete Buttons */}
            {selectedJob && (
              <View style={{ flexDirection: "row", gap: Spacing.md }}>
                <Pressable
                  onPress={() => handleShareJob(selectedJob)}
                  style={({ pressed }) => [
                    styles.shareButton,
                    {
                      backgroundColor: theme.link,
                      opacity: pressed ? 0.9 : 1,
                      flex: 1,
                    },
                  ]}
                >
                  <Feather name="share-2" size={20} color="#FFFFFF" />
                  <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                    Paylaş
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => handleDeletePress(selectedJob)}
                  style={({ pressed }) => [
                    styles.shareButton,
                    {
                      backgroundColor: colors.destructive,
                      opacity: pressed ? 0.9 : 1,
                      flex: 1,
                    },
                  ]}
                >
                  <Feather name="trash-2" size={20} color="#FFFFFF" />
                  <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                    Sil
                  </ThemedText>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* Delete Confirmation Modal (inside Detail Modal) */}
        {showDeleteConfirm && (
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center", zIndex: 1000, paddingHorizontal: Spacing.lg }}>
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
                <ThemedText type="h3" style={{ marginBottom: Spacing.md, fontWeight: "700" }}>İşi Sil</ThemedText>
                <ThemedText type="body" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                  "{companies[jobToDelete?.companyId || ""]?.name || "İş"}" - "{jobToDelete?.cargoType}" işini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                </ThemedText>
              </View>
              <View style={{ flexDirection: "row", gap: Spacing.md, marginTop: Spacing.lg }}>
                <Pressable
                  onPress={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  style={({ pressed }) => [
                    { 
                      flex: 1, 
                      paddingVertical: Spacing.md,
                      paddingHorizontal: Spacing.lg,
                      borderRadius: BorderRadius.sm,
                      backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                      opacity: pressed || isDeleting ? 0.5 : 1,
                    },
                  ]}
                >
                  <ThemedText type="body" style={{ color: theme.link, textAlign: "center", fontWeight: "600" }}>İptal</ThemedText>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    if (!jobToDelete) return;
                    setIsDeleting(true);
                    try {
                      await deleteCompletedJob(jobToDelete.id);
                      setShowDeleteConfirm(false);
                      setShowDetailModal(false);
                      await loadData();
                    } catch (error) {
                      console.error("Delete error:", error);
                    } finally {
                      setIsDeleting(false);
                    }
                  }}
                  disabled={isDeleting}
                  style={({ pressed }) => [
                    { 
                      flex: 1, 
                      paddingVertical: Spacing.md,
                      paddingHorizontal: Spacing.lg,
                      borderRadius: BorderRadius.sm,
                      backgroundColor: colors.destructive,
                      opacity: pressed || isDeleting ? 0.7 : 1,
                    },
                  ]}
                >
                  <ThemedText type="body" style={{ color: "#FFFFFF", textAlign: "center", fontWeight: "600" }}>Sil</ThemedText>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </Modal>

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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    maxHeight: "80%",
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalBody: {
    maxHeight: "60%",
    marginBottom: Spacing.lg,
  },
  detailSection: {
    gap: Spacing.sm,
  },
  shareButton: {
    flexDirection: "row",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
});
