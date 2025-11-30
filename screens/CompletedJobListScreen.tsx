import React, { useState, useCallback, useLayoutEffect, useMemo } from "react";
import { StyleSheet, View, Pressable, FlatList, Alert, TextInput, Modal, ScrollView, Platform, Share, Keyboard, useWindowDimensions } from "react-native";
import Checkbox from "expo-checkbox";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Linking from "expo-linking";

import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../contexts/AuthContext";
import { RootStackParamList } from "../navigation/RootNavigator";
import { getCompletedJobs, getCompanies, deleteCompletedJob, CompletedJob, Company, searchCompletedJobs, getCarriers, Carrier, getVehicleTypeLabel, getIBANs, IBAN, markCommissionAsPaid, CommissionShare, saveCommissionShares } from "../utils/storage";
import { Spacing, BorderRadius, Colors, APP_CONSTANTS } from "../constants/theme";
import { useDeleteOperation } from "../hooks/useDeleteOperation";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const formatCurrency = (amount: number): string => {
  const num = Math.floor(amount);
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

interface GroupedJobs {
  date: string;
  timestamp: number;
  jobs: CompletedJob[];
}

export default function CompletedJobListScreen() {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { firebaseUser } = useAuth();

  const [jobs, setJobs] = useState<CompletedJob[]>([]);
  const [companies, setCompanies] = useState<{ [key: string]: Company }>({});
  const [carriers, setCarriers] = useState<{ [key: string]: Carrier }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<CompletedJob | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [ibans, setIbans] = useState<IBAN[]>([]);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [commissionShares, setCommissionShares] = useState<CommissionShare[]>([]);
  const [personName, setPersonName] = useState("");
  const [shareAmount, setShareAmount] = useState("");
  const { deleteState, openDeleteConfirm, closeDeleteConfirm, confirmDelete } = useDeleteOperation<CompletedJob>("CompletedJob");

  const colors = isDark ? Colors.dark : Colors.light;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitle: "",
    });
  }, [navigation]);

  // Load completed jobs
  const loadData = useCallback(async () => {
    if (!firebaseUser?.uid) return;
    const allJobs = await getCompletedJobs(firebaseUser.uid);
    const allCompanies = await getCompanies(firebaseUser.uid);
    const allCarriers = await getCarriers(firebaseUser.uid);
    const allIbans = await getIBANs(firebaseUser.uid);
    
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
    setIbans(allIbans);
  }, [firebaseUser?.uid]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Helper function to send carrier info to company via WhatsApp
  const shareCarrierInfoWithCompany = useCallback(async () => {
    if (!selectedJob) return;

    const company = companies[selectedJob.companyId];
    const carrier = carriers[selectedJob.carrierId];

    if (!company?.phone || !carrier) {
      Alert.alert("Hata", "Firma veya Nakliyeci bilgileri eksik");
      return;
    }

    let message = `Nakliyeci Bilgileri:\n\nAdı: ${carrier.name}\nTelefon: ${carrier.phone}`;
    
    if (carrier.plate && carrier.plate.trim()) {
      message += `\nPlaka: ${carrier.plate}`;
    }
    
    if (carrier.nationalId && carrier.nationalId.trim()) {
      message += `\nTC Kimlik: ${carrier.nationalId}`;
    }
    
    if (carrier.dorsePlate && carrier.dorsePlate.trim()) {
      message += `\nDorse Plakası: ${carrier.dorsePlate}`;
    }
    
    const vehicleLabel = getVehicleTypeLabel(carrier.vehicleType);
    if (vehicleLabel && vehicleLabel !== "-") {
      message += `\nAraç Tipi: ${vehicleLabel}`;
    }

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
      if (!selectedJob || !selectedJob.carrierId) {
        Alert.alert("Hata", "İş veya nakliyeci bilgileri eksik");
        return;
      }

      const carrier = carriers[selectedJob.carrierId];

      if (!carrier || !carrier.phone || !carrier.phone.trim()) {
        Alert.alert("Hata", "Nakliyeci telefon numarası eksik");
        return;
      }

      if (!selectedIBAN || !selectedIBAN.nameSurname || !selectedIBAN.ibanNumber) {
        Alert.alert("Hata", "IBAN bilgileri eksik");
        return;
      }

      let message = `Ödeme Bilgileri:\n\nAd Soyad: ${selectedIBAN.nameSurname}\nİBAN: ${selectedIBAN.ibanNumber}`;

      let phoneNumber = carrier.phone.replace(/\D/g, "");
      if (phoneNumber.startsWith("0")) {
        phoneNumber = "90" + phoneNumber.substring(1);
      } else if (!phoneNumber.startsWith("90")) {
        phoneNumber = "90" + phoneNumber;
      }

      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

      try {
        const canOpen = await Linking.canOpenURL(whatsappUrl);
        
        if (!canOpen) {
          Alert.alert("Hata", "WhatsApp uygulaması yüklü değil veya bağlantı açılamıyor");
          return;
        }

        await Linking.openURL(whatsappUrl);
      } catch (error) {
        Alert.alert("Hata", `WhatsApp açılamadı: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [selectedJob, carriers]
  );

  const handleOpenIBANList = useCallback(async () => {
    if (!firebaseUser?.uid) {
      Alert.alert("Hata", "Kullanıcı bilgisi eksik");
      return;
    }

    if (!selectedJob || !carriers[selectedJob.carrierId]) {
      Alert.alert("Hata", "Nakliyeci bilgileri eksik");
      return;
    }

    try {
      const allIbans = await getIBANs(firebaseUser.uid);
      
      if (!allIbans || allIbans.length === 0) {
        Alert.alert("Bilgi", "Kayıtlı IBAN bulunamadı. Lütfen Ayarlardan IBAN ekleyin.");
        return;
      }

      // Create options for ActionSheetIOS-style selection
      const ibanOptions = allIbans.map(iban => iban.nameSurname + " - " + iban.ibanNumber);
      
      Alert.alert(
        "IBAN Seç",
        "Hangi IBAN'ı nakliyeciye göndermek istiyorsunuz?",
        [
          ...allIbans.map((iban, index) => ({
            text: iban.nameSurname + " - " + iban.ibanNumber.substring(iban.ibanNumber.length - 4),
            onPress: () => shareIBANWithCarrier(iban),
          })),
          { text: "İptal", onPress: () => {}, style: "cancel" },
        ]
      );
    } catch (error) {
      Alert.alert("Hata", "IBAN'lar yüklenirken bir hata oluştu");
    }
  }, [firebaseUser?.uid, selectedJob, carriers, shareIBANWithCarrier]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredJobs = useMemo(() => {
    if (searchQuery.trim() === "") return jobs;
    return searchCompletedJobs(jobs, searchQuery);
  }, [jobs, searchQuery]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(APP_CONSTANTS.LOCALE, APP_CONSTANTS.DATE_FORMAT_OPTIONS);
  };

  const formatDateLong = (timestamp: number) => {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    };
    return date.toLocaleDateString("tr-TR", options);
  };

  // Group jobs by loading date
  const groupedJobs = useMemo(() => {
    const groups: { [key: string]: { date: string; timestamp: number; jobs: CompletedJob[] } } = {};
    
    filteredJobs.forEach((job) => {
      const dateStr = formatDate(job.loadingDate);
      if (!groups[dateStr]) {
        groups[dateStr] = {
          date: dateStr,
          timestamp: job.loadingDate,
          jobs: [],
        };
      }
      groups[dateStr].jobs.push(job);
    });

    // Sort by date descending (newest first)
    return Object.values(groups).sort((a, b) => b.timestamp - a.timestamp);
  }, [filteredJobs, formatDate]);

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
    if (Platform.OS === "web") {
      Alert.alert("Bilgi", "Bu özellik mobil cihazlarda kullanılabilir. Expo Go uygulamasında açın.");
      return;
    }
    
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
            marginHorizontal: Spacing.lg,
            marginVertical: Spacing.sm,
          },
        ]}
      >
        <Pressable
          onPress={() => handleJobPress(job)}
          style={{ flex: 1 }}
        >
          <View style={styles.jobCardHeader}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.md, flexWrap: "wrap" }}>
                <ThemedText type="h4" numberOfLines={1} style={{ flex: 1 }}>
                  {company?.name || "Bilinmeyen Firma"}
                </ThemedText>
                {job.commissionPaid ? (
                  <View style={{ backgroundColor: colors.success, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm }}>
                    <ThemedText type="small" style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "600" }}>
                      Ödendi
                    </ThemedText>
                  </View>
                ) : (
                  <View style={{ backgroundColor: colors.warning, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm }}>
                    <ThemedText type="small" style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "600" }}>
                      Ödenmedi
                    </ThemedText>
                  </View>
                )}
              </View>
              <View style={{ marginTop: Spacing.sm, gap: Spacing.xs }}>
                <ThemedText type="small" style={{ color: colors.textSecondary }}>
                  {job.loadingLocation || "-"} → {job.deliveryLocation || "-"}
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.textSecondary }}>
                  {job.cargoType || "-"} • {job.tonnage ? job.tonnage : "-"}
                </ThemedText>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: Spacing.md, alignItems: "center" }}>
              <Pressable
                onPress={() => handleEditJob(job)}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <Feather name="edit" size={18} color={theme.link} />
              </Pressable>
              <Pressable
                onPress={() => openDeleteConfirm(job)}
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

  const renderDateGroup = ({ item: group }: { item: GroupedJobs }) => (
    <View>
      {/* Date Header */}
      <View style={[styles.dateHeader, { backgroundColor: colors.backgroundDefault, marginTop: Spacing.lg }]}>
        <Feather name="calendar" size={18} color={theme.link} />
        <ThemedText type="h4" style={{ fontWeight: "700" }}>
          {formatDateLong(group.timestamp)}
        </ThemedText>
        <ThemedText type="small" style={{ color: colors.textSecondary, marginLeft: "auto" }}>
          {group.jobs.length} sefer
        </ThemedText>
      </View>
      
      {/* Jobs for this date */}
      {group.jobs.map((job) => (
        <React.Fragment key={job.id}>
          {renderJobItem({ item: job })}
        </React.Fragment>
      ))}
    </View>
  );

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
          placeholder="İş ara..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
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
      <FlatList
        style={{ flex: 1 }}
        data={groupedJobs}
        renderItem={renderDateGroup}
        keyExtractor={(item) => item.date}
        contentContainerStyle={[styles.listContent, { paddingTop: headerHeight + Spacing.xl + 140 }]}
        ListEmptyComponent={renderEmptyState}
        scrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={true}
      />
      <View style={{ position: 'absolute', top: insets.top + headerHeight + Spacing.md, left: 0, right: 0, zIndex: 100 }}>
        {renderSearchHeader()}
      </View>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent
        onRequestClose={async () => {
          setShowDetailModal(false);
          await loadData();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundRoot }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <ThemedText type="h3">İş Detayları</ThemedText>
              <Pressable onPress={async () => {
                setShowDetailModal(false);
                await loadData();
              }}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            {/* Modal Body */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
                      🏢 Gönderen Firma
                    </ThemedText>
                    
                    {/* Primary Info */}
                    <View style={styles.detailSection}>
                      <ThemedText type="small" style={{ color: colors.textSecondary, fontWeight: "600" }}>
                        Firma Adı
                      </ThemedText>
                      <ThemedText type="h4" style={{ fontWeight: "700" }}>
                        {companies[selectedJob.companyId]?.name || "Bilinmeyen Firma"}
                      </ThemedText>
                    </View>

                    {/* Divider */}
                    <View style={{ height: 1, backgroundColor: colors.border }} />

                    {/* Contact Info Grid */}
                    <View style={{ flexDirection: "row", gap: Spacing.lg }}>
                      <View style={{ flex: 1, ...styles.detailSection }}>
                        <ThemedText type="small" style={{ color: colors.textSecondary, fontWeight: "600" }}>
                          Telefon
                        </ThemedText>
                        <ThemedText type="body" style={{ fontWeight: "500" }}>
                          {companies[selectedJob.companyId]?.phone || "-"}
                        </ThemedText>
                      </View>
                      <View style={{ flex: 1, ...styles.detailSection }}>
                        <ThemedText type="small" style={{ color: colors.textSecondary, fontWeight: "600" }}>
                          İletişim Kişisi
                        </ThemedText>
                        <ThemedText type="body" style={{ fontWeight: "500" }}>
                          {companies[selectedJob.companyId]?.contactPerson || "-"}
                        </ThemedText>
                      </View>
                    </View>

                    {/* Address */}
                    <View style={styles.detailSection}>
                      <ThemedText type="small" style={{ color: colors.textSecondary, fontWeight: "600" }}>
                        Adres
                      </ThemedText>
                      <ThemedText type="body" numberOfLines={2} style={{ fontWeight: "500" }}>
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
                          marginTop: Spacing.sm,
                          paddingVertical: Spacing.md,
                          paddingHorizontal: Spacing.lg,
                          borderRadius: BorderRadius.md,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: Spacing.md,
                          minHeight: 44,
                        },
                      ]}
                    >
                      <Feather name="message-circle" size={16} color="#FFFFFF" />
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
                      🚚 Nakliyeci Bilgileri
                    </ThemedText>
                    
                    {/* Primary Info */}
                    <View style={styles.detailSection}>
                      <ThemedText type="small" style={{ color: colors.textSecondary, fontWeight: "600" }}>
                        Nakliyeci Adı
                      </ThemedText>
                      <ThemedText type="h4" style={{ fontWeight: "700" }}>
                        {carriers[selectedJob.carrierId]?.name || "Bilinmeyen Nakliyeci"}
                      </ThemedText>
                    </View>

                    {/* Divider */}
                    <View style={{ height: 1, backgroundColor: colors.border }} />

                    {/* Contact and Plate */}
                    <View style={{ flexDirection: "row", gap: Spacing.lg }}>
                      <View style={{ flex: 1, ...styles.detailSection }}>
                        <ThemedText type="small" style={{ color: colors.textSecondary, fontWeight: "600" }}>
                          Telefon
                        </ThemedText>
                        <ThemedText type="body" style={{ fontWeight: "500" }}>
                          {carriers[selectedJob.carrierId]?.phone || "-"}
                        </ThemedText>
                      </View>
                      <View style={{ flex: 1, ...styles.detailSection }}>
                        <ThemedText type="small" style={{ color: colors.textSecondary, fontWeight: "600" }}>
                          Araç Plakası
                        </ThemedText>
                        <ThemedText type="body" style={{ fontWeight: "500", color: theme.link }} numberOfLines={1}>
                          {carriers[selectedJob.carrierId]?.plate || "-"}
                        </ThemedText>
                      </View>
                    </View>

                    {/* Vehicle Type */}
                    <View style={styles.detailSection}>
                      <ThemedText type="small" style={{ color: colors.textSecondary, fontWeight: "600" }}>
                        Araç Tipi
                      </ThemedText>
                      <ThemedText type="body" style={{ fontWeight: "500" }}>
                        {carriers[selectedJob.carrierId]?.vehicleType ? getVehicleTypeLabel(carriers[selectedJob.carrierId].vehicleType) : "-"}
                      </ThemedText>
                    </View>

                    {/* Action Buttons */}
                    <View style={{ gap: Spacing.md, marginTop: Spacing.sm }}>
                      <Pressable
                        onPress={shareCompanyInfoWithCarrier}
                        style={({ pressed }) => [
                          {
                            backgroundColor: "#25D366",
                            opacity: pressed ? 0.9 : 1,
                            paddingVertical: Spacing.md,
                            paddingHorizontal: Spacing.lg,
                            borderRadius: BorderRadius.md,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: Spacing.md,
                            minHeight: 44,
                          },
                        ]}
                      >
                        <Feather name="message-circle" size={16} color="#FFFFFF" />
                        <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                          Firma Bilgilerini Paylaş
                        </ThemedText>
                      </Pressable>

                      {/* Share IBAN Button */}
                      <Pressable
                        onPress={handleOpenIBANList}
                        style={({ pressed }) => [
                          {
                            backgroundColor: theme.link,
                            opacity: pressed ? 0.9 : 1,
                            paddingVertical: Spacing.md,
                            paddingHorizontal: Spacing.lg,
                            borderRadius: BorderRadius.md,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: Spacing.md,
                            minHeight: 44,
                          },
                        ]}
                      >
                        <Feather name="credit-card" size={16} color="#FFFFFF" />
                        <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                          Kayıtlı İBANı Paylaş
                        </ThemedText>
                      </Pressable>
                    </View>
                  </View>


                  {/* Cargo Information Section */}
                  <View style={{
                    backgroundColor: colors.backgroundDefault,
                    padding: Spacing.lg,
                    borderRadius: BorderRadius.md,
                    gap: Spacing.md,
                    marginBottom: Spacing.md,
                  }}>
                    <ThemedText type="h4" style={{ fontWeight: "700" }}>
                      📦 Yük Bilgileri
                    </ThemedText>
                    <View style={styles.detailSection}>
                      <ThemedText type="small" style={{ color: colors.textSecondary, fontWeight: "600" }}>
                        Yükün Cinsi
                      </ThemedText>
                      <ThemedText type="h4">
                        {selectedJob.cargoType || "-"}
                      </ThemedText>
                    </View>

                    <View style={styles.detailSection}>
                      <ThemedText type="small" style={{ color: colors.textSecondary, fontWeight: "600" }}>
                        Tonaj
                      </ThemedText>
                      <ThemedText type="h4">
                        {selectedJob.tonnage || "-"}
                      </ThemedText>
                    </View>

                    <View style={styles.detailSection}>
                      <ThemedText type="small" style={{ color: colors.textSecondary, fontWeight: "600" }}>
                        Ebat
                      </ThemedText>
                      <ThemedText type="h4">
                        {selectedJob.dimensions || "-"}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Route Information Section */}
                  <View style={{
                    backgroundColor: colors.backgroundDefault,
                    padding: Spacing.lg,
                    borderRadius: BorderRadius.md,
                    gap: Spacing.md,
                    marginBottom: Spacing.md,
                  }}>
                    <ThemedText type="h4" style={{ fontWeight: "700" }}>
                      🗺️ Rota Bilgileri
                    </ThemedText>
                    <View style={styles.detailSection}>
                      <ThemedText type="small" style={{ color: colors.textSecondary, fontWeight: "600" }}>
                        Yükleme Yeri
                      </ThemedText>
                      <ThemedText type="h4">
                        {selectedJob.loadingLocation || "-"}
                      </ThemedText>
                    </View>

                    <View style={styles.detailSection}>
                      <ThemedText type="small" style={{ color: colors.textSecondary, fontWeight: "600" }}>
                        Teslimat Yeri
                      </ThemedText>
                      <ThemedText type="h4">
                        {selectedJob.deliveryLocation || "-"}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Dates and Notes Section */}
                  <View style={{
                    backgroundColor: colors.backgroundDefault,
                    padding: Spacing.lg,
                    borderRadius: BorderRadius.md,
                    gap: Spacing.md,
                    marginBottom: Spacing.md,
                  }}>
                    <ThemedText type="h4" style={{ fontWeight: "700" }}>
                      📅 Tarihler
                    </ThemedText>
                    <View style={{ flexDirection: "row", gap: Spacing.lg }}>
                      <View style={{ flex: 1, ...styles.detailSection }}>
                        <ThemedText type="small" style={{ color: colors.textSecondary, fontWeight: "600" }}>
                          Yükleme
                        </ThemedText>
                        <ThemedText type="h4">
                          {formatDate(selectedJob.loadingDate)}
                        </ThemedText>
                      </View>
                      <View style={{ flex: 1, ...styles.detailSection }}>
                        <ThemedText type="small" style={{ color: colors.textSecondary, fontWeight: "600" }}>
                          Teslimat
                        </ThemedText>
                        <ThemedText type="h4">
                          {formatDate(selectedJob.completionDate)}
                        </ThemedText>
                      </View>
                    </View>

                    {selectedJob.notes && (
                      <>
                        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: Spacing.sm }} />
                        <View style={styles.detailSection}>
                          <ThemedText type="small" style={{ color: colors.textSecondary, fontWeight: "600" }}>
                            Notlar
                          </ThemedText>
                          <ThemedText type="body">
                            {selectedJob.notes}
                          </ThemedText>
                        </View>
                      </>
                    )}
                  </View>

                  {/* Commission Share Section */}
                  {selectedJob.commissionPaid && (
                    <View style={{
                      backgroundColor: colors.backgroundDefault,
                      padding: Spacing.lg,
                      borderRadius: BorderRadius.md,
                      gap: Spacing.md,
                      marginBottom: Spacing.md,
                    }}>
                      <ThemedText type="h4" style={{ fontWeight: "700" }}>
                        💰 Komisyonu Paylaş
                      </ThemedText>
                      <ThemedText type="small" style={{ color: colors.textSecondary }}>
                        Komisyonunuzu paylaştığınız kişileri kaydedin
                      </ThemedText>
                      <Pressable
                        onPress={() => {
                          setCommissionShares([]);
                          setPersonName("");
                          setShareAmount("");
                          setShowCommissionModal(true);
                        }}
                        style={({ pressed }) => [{
                          backgroundColor: theme.link,
                          opacity: pressed ? 0.9 : 1,
                          paddingVertical: Spacing.md,
                          paddingHorizontal: Spacing.lg,
                          borderRadius: BorderRadius.md,
                          alignItems: "center",
                          minHeight: 44,
                        }]}
                      >
                        <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                          Komisyon Paylaş
                        </ThemedText>
                      </Pressable>
                    </View>
                  )}

                  <View style={{ marginBottom: Spacing.xl }} />
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Commission Share Modal */}
      <Modal
        visible={showCommissionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCommissionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundRoot }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">Komisyon Paylaş</ThemedText>
              <Pressable onPress={() => setShowCommissionModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={{ gap: Spacing.lg }}>
                <View>
                  <ThemedText type="small" style={{ color: colors.textSecondary, marginBottom: Spacing.sm }}>
                    Kişi Adı
                  </ThemedText>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: colors.border,
                      padding: Spacing.md,
                      borderRadius: BorderRadius.sm,
                      color: colors.text,
                      backgroundColor: colors.backgroundDefault,
                    }}
                    placeholder="Adı soyadı"
                    placeholderTextColor={colors.textSecondary}
                    value={personName}
                    onChangeText={setPersonName}
                  />
                </View>

                <View>
                  <ThemedText type="small" style={{ color: colors.textSecondary, marginBottom: Spacing.sm }}>
                    Paylaş Tutarı (₺)
                  </ThemedText>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: colors.border,
                      padding: Spacing.md,
                      borderRadius: BorderRadius.sm,
                      color: colors.text,
                      backgroundColor: colors.backgroundDefault,
                    }}
                    placeholder="0"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="decimal-pad"
                    value={shareAmount}
                    onChangeText={setShareAmount}
                  />
                </View>

                <Pressable
                  onPress={() => {
                    if (personName.trim() && shareAmount.trim()) {
                      const newShare: CommissionShare = {
                        personName: personName.trim(),
                        amount: parseFloat(shareAmount),
                        completedJobId: selectedJob?.id || "",
                      };
                      setCommissionShares([...commissionShares, newShare]);
                      setPersonName("");
                      setShareAmount("");
                    }
                  }}
                  style={({ pressed }) => [{
                    backgroundColor: theme.link,
                    opacity: pressed ? 0.9 : 1,
                    paddingVertical: Spacing.md,
                    borderRadius: BorderRadius.sm,
                    alignItems: "center",
                  }]}
                >
                  <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                    Kişi Ekle
                  </ThemedText>
                </Pressable>

                {commissionShares.length > 0 && (
                  <>
                    <ThemedText type="small" style={{ color: colors.textSecondary }}>
                      Eklenen Kişiler ({commissionShares.length})
                    </ThemedText>
                    {commissionShares.map((share, index) => (
                      <View key={index} style={{ backgroundColor: colors.backgroundDefault, padding: Spacing.md, borderRadius: BorderRadius.sm, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <View>
                          <ThemedText type="small" style={{ fontWeight: "600" }}>{share.personName}</ThemedText>
                          <ThemedText type="small" style={{ color: colors.textSecondary }}>₺{formatCurrency(share.amount)}</ThemedText>
                        </View>
                        <Pressable onPress={() => setCommissionShares(commissionShares.filter((_, i) => i !== index))}>
                          <Feather name="x" size={18} color={colors.destructive} />
                        </Pressable>
                      </View>
                    ))}
                  </>
                )}

                <Pressable
                  onPress={async () => {
                    if (firebaseUser && selectedJob && commissionShares.length > 0) {
                      await saveCommissionShares(firebaseUser.uid, selectedJob.id, commissionShares);
                      setShowCommissionModal(false);
                      await loadData();
                      Alert.alert("Başarılı", "Komisyon paylaşımları kaydedildi");
                    }
                  }}
                  style={({ pressed }) => [{
                    backgroundColor: colors.success,
                    opacity: pressed ? 0.9 : 1,
                    paddingVertical: Spacing.md,
                    borderRadius: BorderRadius.sm,
                    alignItems: "center",
                  }]}
                >
                  <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                    Kaydet
                  </ThemedText>
                </Pressable>
              </View>
            </ScrollView>
          </View>
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
                    const success = await deleteCompletedJob(firebaseUser!.uid, job.id);
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  jobCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
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
    paddingHorizontal: Spacing.lg,
    minHeight: 400,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    maxHeight: "95%",
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  modalBody: {
    marginBottom: Spacing.md,
  },
  detailSection: {
    gap: Spacing.sm,
  },
  ibanItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
});
