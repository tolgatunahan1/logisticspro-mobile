import React, { useState, useLayoutEffect, useEffect, useRef, useCallback } from "react";
import { StyleSheet, View, TextInput, Pressable, Alert, ActivityIndicator, ScrollView, Modal, FlatList, Platform } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { addCompletedJob, updateCompletedJob, getCompanies, getCarriers, CompletedJob, Company, Carrier } from "@/utils/storage";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "CompletedJobForm">;
type ScreenRouteProp = RouteProp<RootStackParamList, "CompletedJobForm">;

export default function CompletedJobFormScreen() {
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
  const [completionDate, setCompletionDate] = useState(job?.completionDate || Date.now());
  const [carrierId, setCarrierId] = useState(job?.carrierId || "");
  const [transportationCost, setTransportationCost] = useState(job?.transportationCost || "");
  const [commissionCost, setCommissionCost] = useState(job?.commissionCost || "");
  const [notes, setNotes] = useState(job?.notes || "");

  const [companies, setCompanies] = useState<Company[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [showCompanyPicker, setShowCompanyPicker] = useState(false);
  const [showCarrierPicker, setShowCarrierPicker] = useState(false);
  const [showLoadingDatePicker, setShowLoadingDatePicker] = useState(false);
  const [showDeliveryDatePicker, setShowDeliveryDatePicker] = useState(false);
  const [showCompletionDatePicker, setShowCompletionDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const colors = isDark ? Colors.dark : Colors.light;

  useEffect(() => {
    const loadData = async () => {
      const allCompanies = await getCompanies();
      const allCarriers = await getCarriers();
      setCompanies(allCompanies);
      setCarriers(allCarriers);
    };
    loadData();
  }, []);

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = {
        companyId,
        carrierId,
        plannedJobId: job?.plannedJobId || "",
        cargoType: cargoType.toString().trim(),
        tonnage: tonnage.toString().trim(),
        dimensions: dimensions.toString().trim(),
        loadingLocation: loadingLocation.toString().trim(),
        deliveryLocation: deliveryLocation.toString().trim(),
        loadingDate,
        deliveryDate,
        completionDate,
        transportationCost: transportationCost.toString().trim(),
        commissionCost: commissionCost.toString().trim(),
        notes: notes.toString().trim(),
      };

      if (isEdit && job) {
        await updateCompletedJob(job.id, data);
      } else {
        await addCompletedJob(data);
      }
      navigation.goBack();
    } catch (error) {
      console.error("Save hatası:", error);
      Alert.alert("Hata", "İş kaydı sırasında bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  }, [cargoType, tonnage, dimensions, loadingLocation, deliveryLocation, companyId, loadingDate, deliveryDate, completionDate, transportationCost, commissionCost, notes, isEdit, job, navigation]);

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

  const handleCompletionDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowCompletionDatePicker(false);
    }
    if (selectedDate) {
      setCompletionDate(selectedDate.getTime());
    }
  };

  const selectedCompany = companies.find((c) => c.id === companyId);
  const selectedCarrier = carriers.find((c) => c.id === route.params?.job?.carrierId);

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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{ paddingTop: 100, paddingBottom: insets.bottom + Spacing.xl }}
    >
      <View style={styles.content}>
        {/* Company Selector */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.label}>
            İş Veren *
          </ThemedText>
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
        </View>

        {/* Carrier Selector */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.label}>
            Nakliyeci *
          </ThemedText>
          <Pressable
            onPress={() => setShowCarrierPicker(true)}
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
                {carriers.find(c => c.id === carrierId)?.name || "Nakliyeci Seçin"}
              </ThemedText>
              <Feather name="chevron-down" size={20} color={colors.textSecondary} />
            </View>
          </Pressable>
        </View>

        {/* Cargo Type */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.label}>
            Yükün Cinsi *
          </ThemedText>
          <TextInput
            style={[inputStyle, { backgroundColor: colors.backgroundDefault }]}
            placeholder="Örn: Beton, Gıda, İnşaat Malzemesi"
            value={cargoType}
            onChangeText={setCargoType}
          />
        </View>

        {/* Tonnage */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.label}>
            Yükün Tonajı *
          </ThemedText>
          <TextInput
            style={[inputStyle, { backgroundColor: colors.backgroundDefault }]}
            placeholder="Örn: 20 ton, 5000 kg"
            keyboardType="default"
            value={tonnage}
            onChangeText={setTonnage}
          />
        </View>

        {/* Dimensions */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.label}>
            Yükün Ebatı
          </ThemedText>
          <TextInput
            style={[inputStyle, { backgroundColor: colors.backgroundDefault }]}
            placeholder="Örn: 3m x 2m x 1.5m"
            value={dimensions}
            onChangeText={setDimensions}
          />
        </View>

        {/* Loading Location */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.label}>
            Nereden Yüklenicek *
          </ThemedText>
          <TextInput
            style={[inputStyle, { backgroundColor: colors.backgroundDefault }]}
            placeholder="Şehir veya Adres"
            value={loadingLocation}
            onChangeText={setLoadingLocation}
          />
        </View>

        {/* Delivery Location */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.label}>
            Nereye Teslim Edilicek *
          </ThemedText>
          <TextInput
            style={[inputStyle, { backgroundColor: colors.backgroundDefault }]}
            placeholder="Şehir veya Adres"
            value={deliveryLocation}
            onChangeText={setDeliveryLocation}
          />
        </View>

        {/* Loading Date */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.label}>
            Yükleme Tarihi
          </ThemedText>
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
        </View>

        {/* Delivery Date */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.label}>
            Teslim Tarihi
          </ThemedText>
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
        </View>

        {/* Completion Date */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.label}>
            Tamamlanma Tarihi *
          </ThemedText>
          <Pressable
            onPress={() => setShowCompletionDatePicker(true)}
            style={[
              inputStyle,
              {
                backgroundColor: colors.backgroundDefault,
              },
            ]}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <ThemedText type="body">{formatDate(completionDate)}</ThemedText>
              <Feather name="calendar" size={20} color={colors.textSecondary} />
            </View>
          </Pressable>
        </View>

        {/* Transportation Cost */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.label}>
            Nakliye Bedeli
          </ThemedText>
          <TextInput
            style={[inputStyle, { backgroundColor: colors.backgroundDefault }]}
            placeholder="Örn: 5000"
            keyboardType="decimal-pad"
            value={transportationCost}
            onChangeText={setTransportationCost}
          />
        </View>

        {/* Commission Cost */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.label}>
            Komisyon Bedeli
          </ThemedText>
          <TextInput
            style={[inputStyle, { backgroundColor: colors.backgroundDefault }]}
            placeholder="Örn: 250"
            keyboardType="decimal-pad"
            value={commissionCost}
            onChangeText={setCommissionCost}
          />
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.label}>
            Notlar
          </ThemedText>
          <TextInput
            style={[inputStyle, { backgroundColor: colors.backgroundDefault, minHeight: 100, textAlignVertical: "top" }]}
            placeholder="Iş hakkında notlar yazınız..."
            value={notes}
            onChangeText={setNotes}
            multiline
          />
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

      {/* Carrier Picker Modal */}
      <Modal
        visible={showCarrierPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCarrierPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundRoot }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">Nakliyeci Seçin</ThemedText>
              <Pressable onPress={() => setShowCarrierPicker(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>
            <FlatList
              data={carriers}
              keyExtractor={(item) => item.id}
              renderItem={({ item: carrier }) => (
                <Pressable
                  onPress={() => {
                    setCarrierId(carrier.id);
                    setShowCarrierPicker(false);
                  }}
                  style={({ pressed }) => [
                    styles.companyOption,
                    {
                      backgroundColor: carrierId === carrier.id ? theme.link + "20" : "transparent",
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <View>
                    <ThemedText type="body" style={{ fontWeight: "600" }}>
                      {carrier.name}
                    </ThemedText>
                    <ThemedText type="small" style={{ color: colors.textSecondary }}>
                      {carrier.phone}
                    </ThemedText>
                  </View>
                  {carrierId === carrier.id && (
                    <Feather name="check" size={20} color={theme.link} />
                  )}
                </Pressable>
              )}
              scrollEnabled
            />
          </View>
        </View>
      </Modal>

      {/* Loading Date Picker */}
      {showLoadingDatePicker && Platform.OS !== "web" && (
        <DateTimePicker
          value={new Date(loadingDate)}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleLoadingDateChange}
          onTouchCancel={() => setShowLoadingDatePicker(false)}
        />
      )}

      {/* Delivery Date Picker */}
      {showDeliveryDatePicker && Platform.OS !== "web" && (
        <DateTimePicker
          value={new Date(deliveryDate)}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDeliveryDateChange}
          onTouchCancel={() => setShowDeliveryDatePicker(false)}
        />
      )}

      {/* Completion Date Picker */}
      {showCompletionDatePicker && Platform.OS !== "web" && (
        <DateTimePicker
          value={new Date(completionDate)}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleCompletionDateChange}
          onTouchCancel={() => setShowCompletionDatePicker(false)}
        />
      )}
    </ScrollView>
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
