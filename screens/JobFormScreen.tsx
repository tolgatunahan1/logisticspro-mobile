import React, { useState, useLayoutEffect, useEffect } from "react";
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
import { addJob, updateJob, deleteJob, getCompanies, PlannedJob, Company } from "@/utils/storage";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "JobForm">;
type ScreenRouteProp = RouteProp<RootStackParamList, "JobForm">;

export default function JobFormScreen() {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const insets = useSafeAreaInsets();

  const { job, mode } = route.params;
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

  const [companies, setCompanies] = useState<Company[]>([]);
  const [showCompanyPicker, setShowCompanyPicker] = useState(false);
  const [showLoadingDatePicker, setShowLoadingDatePicker] = useState(false);
  const [showDeliveryDatePicker, setShowDeliveryDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const colors = isDark ? Colors.dark : Colors.light;

  useEffect(() => {
    const loadCompanies = async () => {
      const allCompanies = await getCompanies();
      setCompanies(allCompanies);
    };
    loadCompanies();
  }, []);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!companyId) {
      newErrors.companyId = "İş veren seçin";
    }
    if (!cargoType.trim()) {
      newErrors.cargoType = "Yükün cinsi gerekli";
    }
    if (!tonnage.trim()) {
      newErrors.tonnage = "Tonaj gerekli";
    }
    if (!loadingLocation.trim()) {
      newErrors.loadingLocation = "Yükleme yeri gerekli";
    }
    if (!deliveryLocation.trim()) {
      newErrors.deliveryLocation = "Teslimat yeri gerekli";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const data = {
        companyId,
        cargoType: cargoType.trim(),
        tonnage: tonnage.trim(),
        dimensions: dimensions.trim(),
        loadingLocation: loadingLocation.trim(),
        deliveryLocation: deliveryLocation.trim(),
        loadingDate,
        deliveryDate,
        transportationCost: transportationCost.trim(),
        commissionCost: commissionCost.trim(),
      };

      if (isEdit && job) {
        await updateJob(job.id, data);
      } else {
        await addJob(data);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert("Hata", "İş kaydı sırasında bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!job) return;

    Alert.alert(
      "İşi Sil",
      "Bu iş kaydını silmek istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            await deleteJob(job.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

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
        <View style={styles.headerRightContainer}>
          {isEdit && (
            <Pressable
              onPress={handleDelete}
              disabled={isLoading}
              style={({ pressed }) => [styles.headerButton, { opacity: pressed || isLoading ? 0.6 : 1 }]}
            >
              <Feather name="trash-2" size={20} color={Colors.light.error} />
            </Pressable>
          )}
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
        </View>
      ),
    });
  }, [navigation, isLoading, isEdit, job]);

  const inputStyle = [
    styles.input,
    {
      borderColor: colors.border,
      color: theme.text,
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
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
          {errors.companyId && (
            <ThemedText type="small" style={{ color: Colors.light.error, marginTop: Spacing.xs }}>
              {errors.companyId}
            </ThemedText>
          )}
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
          {errors.cargoType && (
            <ThemedText type="small" style={{ color: Colors.light.error, marginTop: Spacing.xs }}>
              {errors.cargoType}
            </ThemedText>
          )}
        </View>

        {/* Tonnage */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.label}>
            Yükün Tonajı *
          </ThemedText>
          <TextInput
            style={[inputStyle, { backgroundColor: colors.backgroundDefault }]}
            placeholder="Örn: 20"
            keyboardType="decimal-pad"
            value={tonnage}
            onChangeText={setTonnage}
          />
          {errors.tonnage && (
            <ThemedText type="small" style={{ color: Colors.light.error, marginTop: Spacing.xs }}>
              {errors.tonnage}
            </ThemedText>
          )}
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
          {errors.loadingLocation && (
            <ThemedText type="small" style={{ color: Colors.light.error, marginTop: Spacing.xs }}>
              {errors.loadingLocation}
            </ThemedText>
          )}
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
          {errors.deliveryLocation && (
            <ThemedText type="small" style={{ color: Colors.light.error, marginTop: Spacing.xs }}>
              {errors.deliveryLocation}
            </ThemedText>
          )}
        </View>

        {/* Loading Date */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.label}>
            Yükleme Tarihi
          </ThemedText>
          {Platform.OS === "web" ? (
            <TextInput
              style={[inputStyle, { backgroundColor: colors.backgroundDefault }]}
              value={formatDate(loadingDate)}
              onFocus={() => setShowLoadingDatePicker(true)}
              placeholder="Tarih seçin"
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
            <TextInput
              style={[inputStyle, { backgroundColor: colors.backgroundDefault }]}
              value={formatDate(deliveryDate)}
              onFocus={() => setShowDeliveryDatePicker(true)}
              placeholder="Tarih seçin"
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

      {/* Loading Date Picker - Native Only */}
      {showLoadingDatePicker && Platform.OS !== "web" && (
        <DateTimePicker
          value={new Date(loadingDate)}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleLoadingDateChange}
          onTouchCancel={() => setShowLoadingDatePicker(false)}
        />
      )}

      {/* Delivery Date Picker - Native Only */}
      {showDeliveryDatePicker && Platform.OS !== "web" && (
        <DateTimePicker
          value={new Date(deliveryDate)}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDeliveryDateChange}
          onTouchCancel={() => setShowDeliveryDatePicker(false)}
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
