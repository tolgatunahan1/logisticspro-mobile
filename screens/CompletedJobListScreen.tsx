import React, { useState, useCallback, useLayoutEffect } from "react";
import { StyleSheet, View, Pressable, FlatList, Alert, TextInput, Modal, ScrollView, Platform, Share } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Linking from "expo-linking";

import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../hooks/useTheme";
import { RootStackParamList } from "../navigation/RootNavigator";
import { getCompletedJobs, getCompanies, deleteCompletedJob, CompletedJob, Company, searchCompletedJobs, getCarriers, Carrier, getVehicleTypeLabel, getIBANs, IBAN } from "../utils/storage";
import { Spacing, BorderRadius, Colors } from "../constants/theme";

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
  const [ibans, setIbans] = useState<IBAN[]>([]);
  const [showIBANModal, setShowIBANModal] = useState(false);

  const colors = isDark ? Colors.dark : Colors.light;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitle: "",
    });
  }, [navigation]);

  // Helper function to send carrier info to company via WhatsApp
  const shareCarrierInfoWithCompany = useCallback(async () => {
    if (!selectedJob) return;

    const company = companies[selectedJob.companyId];
    const carrier = carriers[selectedJob.carrierId];

    if (!company?.phone || !carrier) {
      Alert.alert("Hata", "Firma veya Nakliyeci bilgileri eksik");
      return;
    }

    const message = `Nakliyeci Bilgileri:\n\nAdı: ${carrier.name || "-"}\nTelefon: ${carrier.phone || "-"}\nAraç Plakası: ${carrier.plate || "-"}\nAraç Tipi: ${carrier.vehicleType ? getVehicleTypeLabel(carrier.vehicleType) : "-"}`;

    let phoneNumber = company.phone.replace(/\D/g, "");
    if (!phoneNumber.startsWith("90")) {
      phoneNumber = "90" + phoneNumber;
    }
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    try {
      await Linking.openURL(whatsappUrl);
    } catch (error) {
      Alert.alert("Hata", "WhatsApp açılamadı. Lütfen WhatsApp uygulamasının yüklü olduğundan emin olun.");
    }
  }, [selectedJob, companies, carriers]);

  // Helper function to send company info to carrier via WhatsApp
  const shareCompanyInfoWithCarrier = useCallback(async () => {
    if (!selectedJob) return;

    const company = companies[selectedJob.companyId];
    const carrier = carriers[selectedJob.carrierId];

    if (!carrier?.phone || !company) {
      Alert.alert("Hata", "Firma veya Nakliyeci bilgileri eksik");
      return;
    }

    const message = `Firma Bilgileri:\n\nAdı: ${company.name || "-"}\nTelefon: ${company.phone || "-"}\nİletişim Kişisi: ${company.contactPerson || "-"}\nAdres: ${company.address || "-"}`;

    let phoneNumber = carrier.phone.replace(/\D/g, "");
    if (!phoneNumber.startsWith("90")) {
      phoneNumber = "90" + phoneNumber;
    }
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    try {
      await Linking.openURL(whatsappUrl);
    } catch (error) {
      Alert.alert("Hata", "WhatsApp açılamadı. Lütfen WhatsApp uygulamasının yüklü olduğundan emin olun.");
    }
  }, [selectedJob, companies, carriers]);

  // Helper function to share IBAN with carrier via WhatsApp
  const shareIBANWithCarrier = useCallback(
    async (selectedIBAN: IBAN) => {
      if (!selectedJob) return;

      const carrier = carriers[selectedJob.carrierId];

      if (!carrier?.phone) {
        Alert.alert("Hata", "Nakliyeci telefon numarası eksik");
        return;
      }

      const message = `Ödeme Bilgileri:\n\nAd Soyad: ${selectedIBAN.nameSurname}\nİBAN: ${selectedIBAN.ibanNumber}`;

      let phoneNumber = carrier.phone.replace(/\D/g, "");
      if (!phoneNumber.startsWith("90")) {
        phoneNumber = "90" + phoneNumber;
      }

      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

      try {
        await Linking.openURL(whatsappUrl);
        setShowIBANModal(false);
      } catch (error) {
        Alert.alert("Hata", "WhatsApp açılamadı. Lütfen WhatsApp uygulamasının yüklü olduğundan emin olun.");
      }
    },
    [selectedJob, carriers]
  );

  const loadData = useCallback(async () => {
    const allJobs = await getCompletedJobs();
    const allCompanies = await getCompanies();
    const allCarriers = await getCarriers();
    const allIbans = await getIBANs();
    
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
    setIbans(allIbans);
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

                    {/* Share Carrier Info Button */}
                    <Pressable
                      onPress={shareCarrierInfoWithCompany}
                      style={({ pressed }) => [
                        {
                          backgroundColor: "#25D366",
                          opacity: pressed ? 0.9 : 1,
                          marginTop: Spacing.md,
                          paddingVertical: Spacing.md,
                          paddingHorizontal: Spacing.lg,
                          borderRadius: BorderRadius.sm,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: Spacing.md,
                          minHeight: 48,
                        },
                      ]}
                    >
                      <Feather name="message-circle" size={18} color="#FFFFFF" />
                      <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                        Nakliyeci Bilgilerini Paylaş
                      </ThemedText>
                    </Pressable>
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
                        {carriers[selectedJob.carrierId]?.vehicleType ? getVehicleTypeLabel(carriers[selectedJob.carrierId].vehicleType) : "-"}
                      </ThemedText>
                    </View>

                    {/* Share Company Info Button */}
                    <Pressable
                      onPress={shareCompanyInfoWithCarrier}
                      style={({ pressed }) => [
                        {
                          backgroundColor: "#25D366",
                          opacity: pressed ? 0.9 : 1,
                          marginTop: Spacing.md,
                          paddingVertical: Spacing.md,
                          paddingHorizontal: Spacing.lg,
                          borderRadius: BorderRadius.sm,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: Spacing.md,
                          minHeight: 48,
                        },
                      ]}
                    >
                      <Feather name="message-circle" size={18} color="#FFFFFF" />
                      <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                        Firma Bilgilerini Paylaş
                      </ThemedText>
                    </Pressable>

                    {/* Share IBAN Button */}
                    <Pressable
                      onPress={() => setShowIBANModal(true)}
                      style={({ pressed }) => [
                        {
                          backgroundColor: theme.link,
                          opacity: pressed ? 0.9 : 1,
                          marginTop: Spacing.md,
                          paddingVertical: Spacing.md,
                          paddingHorizontal: Spacing.lg,
                          borderRadius: BorderRadius.sm,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: Spacing.md,
                          minHeight: 48,
                        },
                      ]}
                    >
                      <Feather name="credit-card" size={18} color="#FFFFFF" />
                      <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                        Kayıtlı İBANı Paylaş
                      </ThemedText>
                    </Pressable>
                  </View>

                  {/* Delete Button */}
                  {selectedJob && (
                    <Pressable
                      onPress={async () => {
                        const beforeDelete = jobs.filter(j => j.id !== selectedJob.id);
                        setJobs(beforeDelete);
                        setShowDetailModal(false);
                        try {
                          await deleteCompletedJob(selectedJob.id);
                          await loadData();
                        } catch (error) {
                          console.error("Delete error:", error);
                          await loadData();
                        }
                      }}
                      style={({ pressed }) => [
                        {
                          backgroundColor: Colors.dark.destructive,
                          opacity: pressed ? 0.9 : 1,
                          marginTop: Spacing.md,
                          paddingVertical: Spacing.md,
                          paddingHorizontal: Spacing.lg,
                          borderRadius: BorderRadius.sm,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: Spacing.md,
                          minHeight: 48,
                        },
                      ]}
                    >
                      <Feather name="trash-2" size={18} color="#FFFFFF" />
                      <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                        Seferi Sil
                      </ThemedText>
                    </Pressable>
                  )}

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
                  <Feather name="share-2" size={16} color="#FFFFFF" />
                  <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                    Paylaş
                  </ThemedText>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* IBAN Selection Modal */}
      <Modal visible={showIBANModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: Spacing.lg }}>
          <View style={{ backgroundColor: colors.backgroundDefault, borderRadius: BorderRadius.lg, maxHeight: "70%", width: "100%" }}>
            <View style={{ padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <ThemedText type="h3" style={{ fontWeight: "700" }}>
                İBAN Seç
              </ThemedText>
            </View>

            <ScrollView style={{ maxHeight: "100%" }}>
              {ibans.length > 0 ? (
                <View style={{ padding: Spacing.lg, gap: Spacing.md }}>
                  {ibans.map((iban) => (
                    <Pressable
                      key={iban.id}
                      onPress={() => shareIBANWithCarrier(iban)}
                      style={({ pressed }) => [
                        {
                          backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                          padding: Spacing.md,
                          borderRadius: BorderRadius.sm,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <ThemedText type="small" style={{ fontWeight: "600" }}>
                        {iban.nameSurname}
                      </ThemedText>
                      <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: Spacing.xs }}>
                        {iban.ibanNumber}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <View style={{ padding: Spacing.lg, alignItems: "center" }}>
                  <ThemedText type="body" style={{ color: colors.textSecondary, textAlign: "center" }}>
                    Kayıtlı İBAN bulunamadı. Lütfen Ayarlar'dan İBAN ekleyin.
                  </ThemedText>
                </View>
              )}
            </ScrollView>

            <View style={{ padding: Spacing.lg, borderTopWidth: 1, borderTopColor: colors.border }}>
              <Pressable
                onPress={() => setShowIBANModal(false)}
                style={({ pressed }) => [
                  {
                    paddingVertical: Spacing.md,
                    borderRadius: BorderRadius.sm,
                    backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <ThemedText type="body" style={{ textAlign: "center", fontWeight: "600" }}>
                  İptal
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
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
});
