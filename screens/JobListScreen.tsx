import React, { useState, useCallback, useLayoutEffect } from "react";
import { StyleSheet, View, Pressable, FlatList, Alert, TextInput, Modal, ScrollView, Platform, Share, KeyboardAvoidingView } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../hooks/useTheme";
import { useDeleteOperation } from "../hooks/useDeleteOperation";
import { useAuth } from "../contexts/AuthContext";
import { RootStackParamList } from "../navigation/RootNavigator";
import { getJobs, getCompanies, deleteJob, PlannedJob, Company, searchJobs, getCarriers, Carrier, addCompletedJob } from "../utils/storage";
import { Spacing, BorderRadius, Colors } from "../constants/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function JobListScreen() {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { deleteState, openDeleteConfirm, closeDeleteConfirm, confirmDelete } = useDeleteOperation<PlannedJob>("Job");
  const { firebaseUser } = useAuth();

  const [jobs, setJobs] = useState<PlannedJob[]>([]);
  const [companies, setCompanies] = useState<{ [key: string]: Company }>({});
  const [filteredJobs, setFilteredJobs] = useState<PlannedJob[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<PlannedJob | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null);
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [carrierSearchQuery, setCarrierSearchQuery] = useState("");

  const colors = isDark ? Colors.dark : Colors.light;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitle: "",
    });
  }, [navigation]);

  const loadData = useCallback(async () => {
    if (!firebaseUser?.uid) return;
    const allJobs = await getJobs(firebaseUser.uid);
    const allCompanies = await getCompanies(firebaseUser.uid);
    const allCarriers = await getCarriers(firebaseUser.uid);
    
    const companiesMap = allCompanies.reduce((acc, company) => {
      acc[company.id] = company;
      return acc;
    }, {} as { [key: string]: Company });

    setJobs(allJobs);
    setCompanies(companiesMap);
    setFilteredJobs(allJobs);
    setCarriers(allCarriers);
  }, [firebaseUser?.uid]);

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

  const handleDeletePress = (job: PlannedJob) => {
    openDeleteConfirm(job);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("tr-TR");
  };

  const handleAddPress = () => {
    navigation.navigate("JobForm", { mode: "add" });
  };

  const handleJobPress = (job: PlannedJob) => {
    const updatedJob = jobs.find(j => j.id === job.id) || job;
    setSelectedJob(updatedJob);
    setShowDetailModal(true);
  };

  const handleEditJob = (job: PlannedJob) => {
    setShowDetailModal(false);
    navigation.navigate("JobForm", { job, mode: "edit" });
  };

  const getFilteredCarriers = useCallback(() => {
    if (!carrierSearchQuery.trim()) return carriers;
    const query = carrierSearchQuery.toLowerCase().trim();
    return carriers.filter((carrier) =>
      carrier.name.toLowerCase().includes(query) ||
      carrier.phone.includes(query)
    );
  }, [carriers, carrierSearchQuery]);

  const handleShareJob = async (job: PlannedJob) => {
    
    let message = "*Yeni Sefer Programı*\n\n";
    message += `*Yükleme Yeri:* ${job.loadingLocation || "-"}\n`;
    message += `*Yükleme Tarihi:* ${formatDate(job.loadingDate)}\n`;
    message += `*Teslimat Yeri:* ${job.deliveryLocation || "-"}\n`;
    message += `*Teslimat Tarihi:* ${formatDate(job.deliveryDate)}\n`;
    message += `*Yük Cinsi:* ${job.cargoType || "-"}\n`;
    message += `*Yük Tonajı:* ${job.tonnage ? `${job.tonnage}` : "-"}\n`;
    message += `*Yük Ebatı:* ${job.dimensions || "-"}`;
    
    if (job.notes && job.notes.trim() !== "") {
      message += `\n*Notlar:* ${job.notes}`;
    }
    
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

  const handleCreateTrip = async (job: PlannedJob) => {
    if (!job) {
      Alert.alert("Hata", "Seçili iş bulunamadı");
      return;
    }
    if (!selectedCarrier) {
      Alert.alert("Hata", "Lütfen nakliyeci seçiniz");
      return;
    }
    if (!firebaseUser?.uid) return;

    setIsCreatingTrip(true);
    try {
      const completedJobData = {
        companyId: job.companyId,
        carrierId: selectedCarrier.id,
        plannedJobId: job.id,
        cargoType: job.cargoType,
        tonnage: job.tonnage,
        dimensions: job.dimensions,
        loadingLocation: job.loadingLocation,
        deliveryLocation: job.deliveryLocation,
        loadingDate: job.loadingDate,
        deliveryDate: job.deliveryDate,
        transportationCost: job.transportationCost,
        commissionCost: job.commissionCost,
        completionDate: Date.now(),
        notes: "",
      };

      await addCompletedJob(firebaseUser.uid, completedJobData);
      await deleteJob(firebaseUser.uid, job.id);
      setShowDetailModal(false);
      setSelectedCarrier(null);
      setCarrierSearchQuery("");
      await loadData();
      Alert.alert("Başarılı", "Sefer başarıyla oluşturuldu");
    } catch (error) {
      console.error("Sefer oluşturma hatası:", error);
      Alert.alert("Hata", "Sefer oluşturulurken hata oluştu");
    } finally {
      setIsCreatingTrip(false);
    }
  };


  const renderJobItem = ({ item: job }: { item: PlannedJob }) => {
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
              <Pressable
                onPress={() => handleDeletePress(job)}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <Feather name="trash-2" size={18} color={colors.destructive} />
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
        Henüz iş yok
      </ThemedText>
      <ThemedText type="body" style={{ color: colors.textSecondary, marginTop: Spacing.sm }}>
        Yeni bir iş eklemek için + düğmesini kullanın
      </ThemedText>
    </View>
  );

  const renderSearchHeader = () => (
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
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={filteredJobs}
        renderItem={renderJobItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderSearchHeader}
        ListEmptyComponent={renderEmptyState}
        scrollEnabled={true}
      />

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setShowDetailModal(false);
          setCarrierSearchQuery("");
        }}
      >
        <View style={[styles.modalOverlay, { justifyContent: "flex-end" }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View style={[styles.modalContent, { backgroundColor: theme.backgroundRoot, flex: 1, maxHeight: "95%", flexDirection: "column" }]}>
              {/* Modal Header */}
              <View style={[styles.modalHeader, { paddingHorizontal: Spacing.lg }]}>
                <ThemedText type="h3">İş Detayları</ThemedText>
                <Pressable onPress={() => {
                  setShowDetailModal(false);
                  setCarrierSearchQuery("");
                }}>
                  <Feather name="x" size={24} color={theme.text} />
                </Pressable>
              </View>

              {/* Modal Body - Scrollable Job Details */}
              <ScrollView style={{ flex: 1, paddingHorizontal: Spacing.lg }} showsVerticalScrollIndicator={false}>
              {selectedJob && (
                <View style={{ gap: Spacing.lg }}>
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
                      Yükün Cinsi
                    </ThemedText>
                    <ThemedText type="h4">
                      {selectedJob.cargoType || "-"}
                    </ThemedText>
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
                </View>
              )}
              </ScrollView>

              {/* Fixed Nakliyeci Seçim Bölümü - Bottom Section */}
              {selectedJob && (
                <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: theme.backgroundRoot }}>
                <View style={{ gap: Spacing.md }}>
                  <View style={{ gap: Spacing.sm }}>
                    <ThemedText type="small" style={{ color: colors.textSecondary, fontWeight: "600" }}>
                      Nakliyeci Seçin
                    </ThemedText>
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
                        placeholder="Ara..."
                        placeholderTextColor={colors.textSecondary}
                        value={carrierSearchQuery}
                        onChangeText={setCarrierSearchQuery}
                      />
                      {carrierSearchQuery.length > 0 && (
                        <Pressable onPress={() => setCarrierSearchQuery("")}>
                          <Feather name="x" size={16} color={colors.textSecondary} />
                        </Pressable>
                      )}
                    </View>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: Spacing.md, paddingRight: Spacing.lg }}
                    style={{ maxHeight: 90 }}
                  >
                    {getFilteredCarriers().length > 0 ? (
                      getFilteredCarriers().map((carrier) => (
                        <Pressable
                          key={carrier.id}
                          onPress={() => setSelectedCarrier(carrier)}
                          style={({ pressed }) => [
                            {
                              paddingHorizontal: Spacing.md,
                              paddingVertical: Spacing.sm,
                              borderRadius: BorderRadius.md,
                              borderWidth: 2,
                              borderColor: selectedCarrier?.id === carrier.id ? theme.link : colors.border,
                              backgroundColor: selectedCarrier?.id === carrier.id ? theme.link + "15" : colors.backgroundDefault,
                              opacity: pressed ? 0.7 : 1,
                              minWidth: 130,
                              justifyContent: "center",
                            },
                          ]}
                        >
                          <ThemedText type="small" style={{ fontWeight: "600", textAlign: "center" }}>
                            {carrier.name}
                          </ThemedText>
                          <ThemedText type="small" style={{ color: colors.textSecondary, textAlign: "center", fontSize: 12 }}>
                            {carrier.phone}
                          </ThemedText>
                        </Pressable>
                      ))
                    ) : (
                      <View style={{ justifyContent: "center" }}>
                        <ThemedText type="small" style={{ color: colors.textSecondary }}>
                          {carrierSearchQuery.trim() ? "Bulunamadı" : "Yükleniyor..."}
                        </ThemedText>
                      </View>
                    )}
                  </ScrollView>
                </View>

                {/* Modal Footer Buttons */}
                {selectedJob && (
                  <View style={{ gap: Spacing.md, paddingVertical: Spacing.lg }}>
                    <View style={{ flexDirection: "row", gap: Spacing.md }}>
                      <Pressable
                        onPress={() => handleShareJob(selectedJob)}
                        style={({ pressed }) => [
                          styles.shareButton,
                          {
                            backgroundColor: theme.link,
                            opacity: pressed || isCreatingTrip ? 0.9 : 1,
                            flex: 1,
                          },
                        ]}
                        disabled={isCreatingTrip}
                      >
                        <Feather name="share-2" size={16} color="#FFFFFF" />
                        <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                          Paylaş
                        </ThemedText>
                      </Pressable>
                      <Pressable
                        onPress={() => handleCreateTrip(selectedJob)}
                        disabled={isCreatingTrip || !selectedCarrier}
                        style={({ pressed }) => [
                          styles.shareButton,
                          {
                            backgroundColor: colors.success,
                            opacity: pressed || isCreatingTrip || !selectedCarrier ? 0.7 : 1,
                            flex: 1,
                          },
                        ]}
                      >
                        <Feather name="check-circle" size={16} color="#FFFFFF" />
                        <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                          {isCreatingTrip ? "Oluşturuluyor..." : "Sefer Oluştur"}
                        </ThemedText>
                      </Pressable>
                    </View>
                  </View>
                )}
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>


      {/* Delete Confirmation Modal */}
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
              <ThemedText type="h3" style={{ marginBottom: Spacing.md, fontWeight: "700" }}>İşi Sil</ThemedText>
              <ThemedText type="body" style={{ color: colors.textSecondary, lineHeight: 20 }}>
                Bu işi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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
                  await confirmDelete(async (job) => {
                    const success = await deleteJob(firebaseUser!.uid, job.id);
                    if (success) {
                      await loadData();
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
    paddingTop: Spacing["5xl"] + Spacing["2xl"] + Spacing.xl,
    paddingBottom: Spacing.lg,
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
  carrierOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.1)",
  },
});
