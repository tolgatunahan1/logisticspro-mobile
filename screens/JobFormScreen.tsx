import React, { useState, useLayoutEffect, useEffect, useRef, useCallback } from "react";
import { StyleSheet, View, TextInput, Pressable, Alert, ActivityIndicator, ScrollView, Modal, FlatList, Platform } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";

import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../hooks/useTheme";
import { RootStackParamList } from "../navigation/RootNavigator";
import { addJob, updateJob, getCompanies, PlannedJob, Company } from "../utils/storage";
import { Spacing, BorderRadius, Colors } from "../constants/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "JobForm">;
type ScreenRouteProp = RouteProp<RootStackParamList, "JobForm">;

export default function JobFormScreen() {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const insets = useSafeAreaInsets();

  const { job, mode } = route.params || { mode: "add" };
  const isEdit = mode === "edit";

  const [companyId, setCompanyId] = useState(job?.companyId || "");
  const [cargoType, setCargoType] = useState(job?.cargoType || "");
  const [tonnage, setTonnage] = useState(job?.tonnage || "");
  const [dimensions, setDimensions] = useState(job?.dimensions || "");
  const [loadingLocation, setLoadingLocation] = useState(job?.loadingLocation || "");
  const [deliveryLocation, setDeliveryLocation] = useState(job?.deliveryLocation || "");
  const [loadingDate, setLoadingDate] = useState(job?.loadingDate || Date.now());
  const [deliveryDate, setDeliveryDate] = useState(job?.deliveryDate || Date.now());
  const [transportationCost, setTransportationCost] = useState(job?.transportationCost || "");
  const [commissionCost, setCommissionCost] = useState(job?.commissionCost || "");
  const [notes, setNotes] = useState(job?.notes || "");

  // Log state values for debugging
  useEffect(() => {
    console.log("JobFormScreen - Current State Values:");
    console.log({ companyId, cargoType, tonnage, loadingLocation, deliveryLocation });
  }, [companyId, cargoType, tonnage, loadingLocation, deliveryLocation]);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [showCompanyPicker, setShowCompanyPicker] = useState(false);
  const [showLoadingDatePicker, setShowLoadingDatePicker] = useState(false);
  const [showDeliveryDatePicker, setShowDeliveryDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Refs for web input elements
  const cargoTypeRef = useRef<any>(null);
  const tonnageRef = useRef<any>(null);
  const dimensionsRef = useRef<any>(null);
  const loadingLocationRef = useRef<any>(null);
  const deliveryLocationRef = useRef<any>(null);
  const transportationCostRef = useRef<any>(null);
  const commissionCostRef = useRef<any>(null);
  const notesRef = useRef<any>(null);
  const companyIdRef = useRef<any>(null);
  const loadingDateRef = useRef<any>(null);
  const deliveryDateRef = useRef<any>(null);

  const colors = isDark ? Colors.dark : Colors.light;

  useEffect(() => {
    const loadCompanies = async () => {
      const allCompanies = await getCompanies();
      setCompanies(allCompanies);
    };
    loadCompanies();
  }, []);

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      // Web'de refs'ten values oku, native'de state'ten oku
      let finalCargoType = cargoType;
      let finalTonnage = tonnage;
      let finalDimensions = dimensions;
      let finalLoadingLocation = loadingLocation;
      let finalDeliveryLocation = deliveryLocation;
      let finalTransportationCost = transportationCost;
      let finalCommissionCost = commissionCost;
      let finalNotes = notes;
      let finalCompanyId = companyId;
      let finalLoadingDate = loadingDate;
      let finalDeliveryDate = deliveryDate;

      if (Platform.OS === "web") {
        finalCompanyId = companyId;
        finalCargoType = cargoTypeRef.current?.value || "";
        finalTonnage = tonnageRef.current?.value || "";
        finalDimensions = dimensionsRef.current?.value || "";
        finalLoadingLocation = loadingLocationRef.current?.value || "";
        finalDeliveryLocation = deliveryLocationRef.current?.value || "";
        finalTransportationCost = transportationCostRef.current?.value || "";
        finalCommissionCost = commissionCostRef.current?.value || "";
        finalNotes = notesRef.current?.value || "";
        if (loadingDateRef.current?.value) {
          finalLoadingDate = new Date(loadingDateRef.current.value).getTime();
        }
        if (deliveryDateRef.current?.value) {
          finalDeliveryDate = new Date(deliveryDateRef.current.value).getTime();
        }
      }

      console.log("=== SAVE BAŞLADI ===");
      console.log("Firma:", finalCompanyId);
      console.log("Yükün Cinsi:", finalCargoType);
      console.log("Tonaj:", finalTonnage);

      const data = {
        companyId: finalCompanyId,
        cargoType: finalCargoType.toString().trim(),
        tonnage: finalTonnage.toString().trim(),
        dimensions: finalDimensions.toString().trim(),
        loadingLocation: finalLoadingLocation.toString().trim(),
        deliveryLocation: finalDeliveryLocation.toString().trim(),
        loadingDate: finalLoadingDate,
        deliveryDate: finalDeliveryDate,
        transportationCost: finalTransportationCost.toString().trim(),
        commissionCost: finalCommissionCost.toString().trim(),
        notes: finalNotes.toString().trim(),
      };

      console.log("İş verileri kaydediliyor:", data);

      if (isEdit && job) {
        const result = await updateJob(job.id, data);
        console.log("İş güncelleme sonucu:", result);
      } else {
        const result = await addJob(data);
        console.log("İş ekleme sonucu:", result);
      }
      navigation.goBack();
    } catch (error) {
      console.error("Save hatası:", error);
      Alert.alert("Hata", "İş kaydı sırasında bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  }, [cargoType, tonnage, dimensions, loadingLocation, deliveryLocation, companyId, loadingDate, deliveryDate, transportationCost, commissionCost, notes, isEdit, job, navigation]);

  const handleCancel = () => {
    navigation.goBack();
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("tr-TR");
  };

  const handleLoadingDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowLoadingDatePicker(false);
    }
    if (selectedDate) {
      setLoadingDate(selectedDate.getTime());
    }
  };

  const handleDeliveryDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDeliveryDatePicker(false);
    }
    if (selectedDate) {
      setDeliveryDate(selectedDate.getTime());
    }
  };

  const selectedCompany = companies.find((c) => c.id === companyId);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={handleCancel}
          style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.6 : 1 }]}
        >
          <ThemedText type="body" style={{ color: theme.link }}>
            İptal
          </ThemedText>
        </Pressable>
      ),
      headerRight: () => (
        <Pressable
          onPress={handleSave}
          disabled={isLoading}
          style={({ pressed }) => [styles.headerButton, { opacity: pressed || isLoading ? 0.6 : 1 }]}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.link} />
          ) : (
            <ThemedText type="body" style={{ color: theme.link }}>
              Kaydet
            </ThemedText>
          )}
        </Pressable>
      ),
    });
  }, [navigation, isLoading, handleSave]);

  const inputStyle = [
    styles.input,
    {
      borderColor: (theme as any).glassBorder || colors.border,
      backgroundColor: (theme as any).inputBackground || colors.inputBackground,
      color: theme.text,
    },
  ];

  return (
    <>
      <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{ paddingTop: 100, paddingBottom: insets.bottom + Spacing.xl + 300 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
        {/* Company Selector */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.label}>
            İş Veren
          </ThemedText>
          {Platform.OS === "web" ? (
            <select
              ref={companyIdRef}
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              style={{ padding: `${Spacing.md}px`, fontSize: 16, borderWidth: 1, borderColor: colors.borderDefault, borderRadius: 8, backgroundColor: colors.backgroundDefault, color: colors.textDefault } as any}
            >
              <option value="">Firma Seçin</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          ) : (
            <Pressable
              onPress={() => setShowCompanyPicker(true)}
              style={({ pressed }) => [
                inputStyle,
                {
                  backgroundColor: colors.backgroundDefault,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <ThemedText type="body">
                  {selectedCompany?.name || "Firma Seçin"}
                </ThemedText>
                <Feather name="chevron-down" size={20} color={colors.textSecondary} />
              </View>
            </Pressable>
          )}
        </View>

        {/* Cargo Type */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.label}>
            Yükün Cinsi
          </ThemedText>
          {Platform.OS === "web" ? (
            <input
              ref={cargoTypeRef}
              type="text"
              defaultValue={cargoType}
              placeholder="Örn: Beton, Gıda, İnşaat Malzemesi"
              style={{ padding: `${Spacing.md}px`, fontSize: 16, borderWidth: 1, borderColor: colors.borderDefault, borderRadius: 8, backgroundColor: colors.backgroundDefault, color: colors.textDefault } as any}
            />
          ) : (
            <TextInput
              style={[inputStyle, { backgroundColor: colors.backgroundDefault }]}
              placeholder="Örn: Beton, Gıda, İnşaat Malzemesi"
              value={cargoType}
              onChangeText={setCargoType}
            />
          )}
        </View>

        {/* Tonnage */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.label}>
            Yükün Tonajı
          </ThemedText>
          {Platform.OS === "web" ? (
            <input
              ref={tonnageRef}
              type="text"
              defaultValue={tonnage}
              placeholder="Örn: 20 ton, 5000 kg"
              style={{ padding: `${Spacing.md}px`, fontSize: 16, borderWidth: 1, borderColor: colors.borderDefault, borderRadius: 8, backgroundColor: colors.backgroundDefault, color: colors.textDefault } as any}
            />
          ) : (
            <TextInput
              style={[inputStyle, { backgroundColor: colors.backgroundDefault }]}
              placeholder="Örn: 20 ton, 5000 kg"
              keyboardType="default"
              value={tonnage}
              onChangeText={setTonnage}
            />
          )}
        </View>

        {/* Dimensions */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.label}>
            Yükün Ebatı
          </ThemedText>
          {Platform.OS === "web" ? (
            <input
              ref={dimensionsRef}
              type="text"
              defaultValue={dimensions}
              placeholder="Örn: 3m x 2m x 1.5m"
              style={{ padding: `${Spacing.md}px`, fontSize: 16, borderWidth: 1, borderColor: colors.borderDefault, borderRadius: 8, backgroundColor: colors.backgroundDefault, color: colors.textDefault } as any}
            />
          ) : (
            <TextInput
              style={[inputStyle, { backgroundColor: colors.backgroundDefault }]}
              placeholder="Örn: 3m x 2m x 1.5m"
              value={dimensions}
              onChangeText={setDimensions}
            />
          )}
        </View>

        {/* Loading Location */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.label}>
            Nereden Yüklenicek
          </ThemedText>
          {Platform.OS === "web" ? (
            <input
              ref={loadingLocationRef}
              type="text"
              defaultValue={loadingLocation}
              placeholder="Şehir veya Adres"
              style={{ padding: `${Spacing.md}px`, fontSize: 16, borderWidth: 1, borderColor: colors.borderDefault, borderRadius: 8, backgroundColor: colors.backgroundDefault, color: colors.textDefault } as any}
            />
          ) : (
            <TextInput
              style={[inputStyle, { backgroundColor: colors.backgroundDefault }]}
              placeholder="Şehir veya Adres"
              value={loadingLocation}
              onChangeText={setLoadingLocation}
            />
          )}
        </View>

        {/* Delivery Location */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.label}>
            Nereye Teslim Edilicek
          </ThemedText>
          {Platform.OS === "web" ? (
            <input
              ref={deliveryLocationRef}
              type="text"
              defaultValue={deliveryLocation}
              placeholder="Şehir veya Adres"
              style={{ padding: `${Spacing.md}px`, fontSize: 16, borderWidth: 1, borderColor: colors.borderDefault, borderRadius: 8, backgroundColor: colors.backgroundDefault, color: colors.textDefault } as any}
            />
          ) : (
            <TextInput
              style={[inputStyle, { backgroundColor: colors.backgroundDefault }]}
              placeholder="Şehir veya Adres"
              value={deliveryLocation}
              onChangeText={setDeliveryLocation}
            />
          )}
        </View>

        {/* Loading Date */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.label}>
            Yükleme Tarihi
          </ThemedText>
          {Platform.OS === "web" ? (
            <input
              ref={loadingDateRef}
              type="date"
              defaultValue={new Date(loadingDate).toISOString().split('T')[0]}
              style={{
                padding: `${Spacing.md}px`,
                fontSize: 16,
                borderWidth: 1,
                borderColor: colors.borderDefault,
                borderRadius: 8,
                backgroundColor: colors.backgroundDefault,
                color: colors.textDefault,
              } as any}
            />
          ) : (
            <Pressable
              onPress={() => setShowLoadingDatePicker(true)}
              style={[
                inputStyle,
                {
                  backgroundColor: colors.backgroundDefault,
                },
              ]}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <ThemedText type="body">{formatDate(loadingDate)}</ThemedText>
                <Feather name="calendar" size={20} color={colors.textSecondary} />
              </View>
            </Pressable>
          )}
        </View>

        {/* Delivery Date */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.label}>
            Teslim Tarihi
          </ThemedText>
          {Platform.OS === "web" ? (
            <input
              ref={deliveryDateRef}
              type="date"
              defaultValue={new Date(deliveryDate).toISOString().split('T')[0]}
              style={{
                padding: `${Spacing.md}px`,
                fontSize: 16,
                borderWidth: 1,
                borderColor: colors.borderDefault,
                borderRadius: 8,
                backgroundColor: colors.backgroundDefault,
                color: colors.textDefault,
              } as any}
            />
          ) : (
            <Pressable
              onPress={() => setShowDeliveryDatePicker(true)}
              style={[
                inputStyle,
                {
                  backgroundColor: colors.backgroundDefault,
                },
              ]}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <ThemedText type="body">{formatDate(deliveryDate)}</ThemedText>
                <Feather name="calendar" size={20} color={colors.textSecondary} />
              </View>
            </Pressable>
          )}
        </View>

        {/* Transportation Cost */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.label}>
            Nakliye Bedeli
          </ThemedText>
          {Platform.OS === "web" ? (
            <input
              ref={transportationCostRef}
              type="number"
              defaultValue={transportationCost}
              placeholder="Örn: 5000"
              style={{ padding: `${Spacing.md}px`, fontSize: 16, borderWidth: 1, borderColor: colors.borderDefault, borderRadius: 8, backgroundColor: colors.backgroundDefault, color: colors.textDefault } as any}
            />
          ) : (
            <TextInput
              style={[inputStyle, { backgroundColor: colors.backgroundDefault }]}
              placeholder="Örn: 5000"
              keyboardType="decimal-pad"
              value={transportationCost}
              onChangeText={setTransportationCost}
            />
          )}
        </View>

        {/* Commission Cost */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.label}>
            Komisyon Bedeli
          </ThemedText>
          {Platform.OS === "web" ? (
            <input
              ref={commissionCostRef}
              type="number"
              defaultValue={commissionCost}
              placeholder="Örn: 250"
              style={{ padding: `${Spacing.md}px`, fontSize: 16, borderWidth: 1, borderColor: colors.borderDefault, borderRadius: 8, backgroundColor: colors.backgroundDefault, color: colors.textDefault } as any}
            />
          ) : (
            <TextInput
              style={[inputStyle, { backgroundColor: colors.backgroundDefault }]}
              placeholder="Örn: 250"
              keyboardType="decimal-pad"
              value={commissionCost}
              onChangeText={setCommissionCost}
            />
          )}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.label}>
            Notlar
          </ThemedText>
          {Platform.OS === "web" ? (
            <textarea
              ref={notesRef}
              defaultValue={notes}
              placeholder="İş hakkında ek notlar ekleyin..."
              style={{ padding: `${Spacing.md}px`, fontSize: 16, borderWidth: 1, borderColor: colors.borderDefault, borderRadius: 8, backgroundColor: colors.backgroundDefault, color: colors.textDefault, minHeight: 100, fontFamily: "system-ui" } as any}
            />
          ) : (
            <TextInput
              style={[inputStyle, { backgroundColor: colors.backgroundDefault, height: 100, textAlignVertical: "top" }]}
              placeholder="İş hakkında ek notlar ekleyin..."
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
            />
          )}
        </View>
      </View>

      {/* Company Picker Modal */}
      <Modal
        visible={showCompanyPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCompanyPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundRoot }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">Firma Seçin</ThemedText>
              <Pressable onPress={() => setShowCompanyPicker(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>
            <FlatList
              data={companies}
              keyExtractor={(item) => item.id}
              renderItem={({ item: company }) => (
                <Pressable
                  onPress={() => {
                    setCompanyId(company.id);
                    setShowCompanyPicker(false);
                  }}
                  style={({ pressed }) => [
                    styles.companyOption,
                    {
                      backgroundColor: companyId === company.id ? theme.link + "20" : "transparent",
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <View>
                    <ThemedText type="body" style={{ fontWeight: "600" }}>
                      {company.name}
                    </ThemedText>
                    <ThemedText type="small" style={{ color: colors.textSecondary }}>
                      {company.phone}
                    </ThemedText>
                  </View>
                  {companyId === company.id && (
                    <Feather name="check" size={20} color={theme.link} />
                  )}
                </Pressable>
              )}
              scrollEnabled
            />
          </View>
        </View>
      </Modal>
    </ScrollView>

    {/* Loading Date Picker - Outside ScrollView for Expo Go */}
    {showLoadingDatePicker && Platform.OS !== "web" && (
      <DateTimePicker
        value={new Date(loadingDate)}
        mode="date"
        display={Platform.OS === "ios" ? "spinner" : "default"}
        onChange={handleLoadingDateChange}
        onTouchCancel={() => setShowLoadingDatePicker(false)}
      />
    )}

    {/* Delivery Date Picker - Outside ScrollView for Expo Go */}
    {showDeliveryDatePicker && Platform.OS !== "web" && (
      <DateTimePicker
        value={new Date(deliveryDate)}
        mode="date"
        display={Platform.OS === "ios" ? "spinner" : "default"}
        onChange={handleDeliveryDateChange}
        onTouchCancel={() => setShowDeliveryDatePicker(false)}
      />
    )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  section: {
    gap: Spacing.sm,
  },
  label: {
    fontWeight: "600",
  },
  input: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: 16,
  },
  headerButton: {
    padding: Spacing.sm,
  },
  headerRightContainer: {
    flexDirection: "row",
    gap: Spacing.md,
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
    maxHeight: "80%",
    paddingBottom: Spacing.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
  },
  companyOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.1)",
  },
});
