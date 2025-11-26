import React, { useState, useLayoutEffect } from "react";
import { StyleSheet, View, TextInput, Pressable, Alert, ActivityIndicator, ScrollView, Platform, Modal } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { addCarrier, updateCarrier, deleteCarrier, VEHICLE_TYPES, getVehicleTypeLabel } from "@/utils/storage";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "CarrierForm">;
type ScreenRouteProp = RouteProp<RootStackParamList, "CarrierForm">;

export default function CarrierFormScreen() {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const insets = useSafeAreaInsets();
  
  const carrier = route.params?.carrier;
  const mode = route.params?.mode || "add";
  const isEdit = mode === "edit" && !!carrier;

  const [name, setName] = useState(carrier?.name || "");
  const [phone, setPhone] = useState(carrier?.phone || "");
  const [plate, setPlate] = useState(carrier?.plate || "");
  const [vehicleType, setVehicleType] = useState(carrier?.vehicleType || "kamyon");
  const [isLoading, setIsLoading] = useState(false);
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const colors = isDark ? Colors.dark : Colors.light;

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = "Ad Soyad gerekli";
    }
    if (!phone.trim()) {
      newErrors.phone = "Telefon numarası gerekli";
    }
    if (!plate.trim()) {
      newErrors.plate = "Plaka gerekli";
    }
    if (!vehicleType) {
      newErrors.vehicleType = "Araç tipi seçin";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const data = {
        name: name.trim(),
        phone: phone.trim(),
        plate: plate.trim().toUpperCase(),
        vehicleType,
      };

      if (isEdit && carrier) {
        await updateCarrier(carrier.id, data);
      } else {
        await addCarrier(data);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert("Hata", "Kayıt sırasında bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!carrier) {
      Alert.alert("Hata", "Nakliyeci verisi bulunamadı");
      return;
    }

    const carrierId = carrier.id;
    const carrierName = carrier.name;

    Alert.alert(
      "Nakliyeciyi Sil",
      `"${carrierName}" adlı nakliyeciyi silmek istediğinizden emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            console.log("Silme başladı, ID:", carrierId);
            setIsLoading(true);
            try {
              const result = await deleteCarrier(carrierId);
              console.log("Silme sonucu:", result);
              if (result) {
                navigation.goBack();
              } else {
                Alert.alert("Hata", "Nakliyeci silinemedi");
                setIsLoading(false);
              }
            } catch (error) {
              console.error("Silme hatası:", error);
              Alert.alert("Hata", "Nakliyeci silinirken hata oluştu");
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    navigation.goBack();
  };

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
            <ThemedText type="body" style={{ color: theme.link, fontWeight: "600" }}>
              Kaydet
            </ThemedText>
          )}
        </Pressable>
      ),
    });
  }, [navigation, theme, isLoading, name, phone, plate, vehicleType]);

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    errorKey: string,
    options?: {
      placeholder?: string;
      keyboardType?: "default" | "phone-pad";
      autoCapitalize?: "none" | "sentences" | "words" | "characters";
    }
  ) => (
    <View style={styles.inputContainer}>
      <ThemedText type="small" style={[styles.label, { color: colors.textSecondary }]}>
        {label}
      </ThemedText>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: (theme as any).inputBackground || colors.inputBackground,
            borderColor: errors[errorKey] ? colors.destructive : ((theme as any).glassBorder || colors.border),
            color: theme.text,
          },
        ]}
        placeholder={options?.placeholder || label}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={(text) => {
          onChangeText(text);
          if (errors[errorKey]) {
            setErrors((prev) => ({ ...prev, [errorKey]: "" }));
          }
        }}
        keyboardType={options?.keyboardType || "default"}
        autoCapitalize={options?.autoCapitalize || "sentences"}
        editable={!isLoading}
      />
      {errors[errorKey] ? (
        <ThemedText type="small" style={[styles.errorText, { color: colors.destructive }]}>
          {errors[errorKey]}
        </ThemedText>
      ) : null}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: 100, paddingBottom: insets.bottom + Spacing.xl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderInput("Ad Soyad", name, setName, "name", { placeholder: "Nakliyeci adı", autoCapitalize: "words" })}
        {renderInput("Telefon Numarası", phone, setPhone, "phone", { placeholder: "05XX XXX XXXX", keyboardType: "phone-pad" })}
        {renderInput("Plaka", plate, (text) => setPlate(text.toUpperCase()), "plate", { placeholder: "34 ABC 123", autoCapitalize: "characters" })}
        
        <View style={styles.inputContainer}>
          <ThemedText type="small" style={[styles.label, { color: colors.textSecondary }]}>
            Araç Tipi
          </ThemedText>
          <Pressable
            onPress={() => setShowVehiclePicker(true)}
            style={[
              styles.input,
              styles.picker,
              {
                backgroundColor: colors.inputBackground,
                borderColor: errors.vehicleType ? colors.destructive : colors.border,
              },
            ]}
          >
            <ThemedText type="body">{getVehicleTypeLabel(vehicleType)}</ThemedText>
            <Feather name="chevron-down" size={20} color={colors.textSecondary} />
          </Pressable>
          {errors.vehicleType ? (
            <ThemedText type="small" style={[styles.errorText, { color: colors.destructive }]}>
              {errors.vehicleType}
            </ThemedText>
          ) : null}
        </View>

        {carrier && mode === "edit" ? (
          <Pressable
            onPress={() => {
              console.log("Sil tuşuna basıldı");
              handleDelete();
            }}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.deleteButton,
              {
                backgroundColor: colors.destructive,
                opacity: pressed || isLoading ? 0.8 : 1,
              },
            ]}
          >
            <Feather name="trash-2" size={18} color={colors.buttonText} />
            <ThemedText type="body" style={[styles.deleteButtonText, { color: colors.buttonText }]}>
              Nakliyeciyi Sil
            </ThemedText>
          </Pressable>
        ) : null}
      </ScrollView>

      <Modal
        visible={showVehiclePicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowVehiclePicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowVehiclePicker(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundRoot }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h4">Araç Tipi Seçin</ThemedText>
              <Pressable onPress={() => setShowVehiclePicker(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>
            {VEHICLE_TYPES.map((type) => (
              <Pressable
                key={type.value}
                onPress={() => {
                  setVehicleType(type.value);
                  setShowVehiclePicker(false);
                  if (errors.vehicleType) {
                    setErrors((prev) => ({ ...prev, vehicleType: "" }));
                  }
                }}
                style={({ pressed }) => [
                  styles.modalItem,
                  {
                    backgroundColor: vehicleType === type.value ? colors.backgroundDefault : "transparent",
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <ThemedText type="body">{type.label}</ThemedText>
                {vehicleType === type.value ? (
                  <Feather name="check" size={20} color={theme.link} />
                ) : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  inputContainer: {
    gap: Spacing.xs,
  },
  label: {
    marginLeft: Spacing.xs,
  },
  input: {
    height: Spacing.inputHeight,
    borderWidth: 1.5,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  picker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorText: {
    marginLeft: Spacing.xs,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xs,
    gap: Spacing.sm,
    marginTop: Spacing["3xl"],
  },
  deleteButtonText: {
    fontWeight: "600",
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
    paddingBottom: Spacing["3xl"],
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.xs,
  },
});
