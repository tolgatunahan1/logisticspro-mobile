import React, { useState, useLayoutEffect } from "react";
import { StyleSheet, View, TextInput, Pressable, Alert, ActivityIndicator, Platform, Modal } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import { ScreenKeyboardAwareScrollView } from "../components/ScreenKeyboardAwareScrollView";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../contexts/AuthContext";
import { RootStackParamList } from "../navigation/RootNavigator";
import { addCarrier, updateCarrier, VEHICLE_TYPES, getVehicleTypeLabel } from "../utils/storage";
import { Spacing, BorderRadius, Colors } from "../constants/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "CarrierForm">;
type ScreenRouteProp = RouteProp<RootStackParamList, "CarrierForm">;

export default function CarrierFormScreen() {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const insets = useSafeAreaInsets();
  const { firebaseUser } = useAuth();
  
  const carrier = route.params?.carrier;
  const mode = route.params?.mode || "add";
  const initialData = route.params?.initialData;
  const isEdit = mode === "edit" && !!carrier;

  const [name, setName] = useState(carrier?.name || initialData?.name || "");
  const [phone, setPhone] = useState(carrier?.phone || initialData?.phone || "");
  const [nationalId, setNationalId] = useState(carrier?.nationalId || "");
  const [plate, setPlate] = useState(carrier?.plate || "");
  const [dorsePlate, setDorsePlate] = useState(carrier?.dorsePlate || "");
  const [vehicleType, setVehicleType] = useState(carrier?.vehicleType || initialData?.vehicleType || "kamyon");
  const [isLoading, setIsLoading] = useState(false);
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Check if form has been modified
  const isDirty = !isEdit && (
    name !== "" || 
    phone !== "" || 
    nationalId !== "" || 
    plate !== "" || 
    dorsePlate !== ""
  );

  const colors = isDark ? Colors.dark : Colors.light;

  const formatPhoneNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    let withZero = cleaned;
    if (!cleaned.startsWith('0')) {
      withZero = '0' + cleaned;
    }
    return withZero.slice(0, 11);
  };

  const formatLicensePlate = (value: string): string => {
    // Remove spaces and convert to uppercase
    const cleaned = value.replace(/\s/g, '').toUpperCase();
    
    // Extract numbers and letters
    const numbers = cleaned.match(/\d/g) || [];
    const letters = cleaned.match(/[A-Z]/g) || [];
    
    if (numbers.length === 0 && letters.length === 0) return '';
    
    // Format: DD LLL DDD (2 digits, 3 letters, 3 digits)
    const firstDigits = numbers.slice(0, 2).join('');
    const lettersPart = letters.slice(0, 3).join('');
    const lastDigits = numbers.slice(2, 5).join('');
    
    let result = firstDigits;
    if (lettersPart) {
      result += (result ? ' ' : '') + lettersPart;
    }
    if (lastDigits) {
      result += (result ? ' ' : '') + lastDigits;
    }
    
    return result;
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = "Ad Soyad gerekli";
    }
    if (!phone.trim()) {
      newErrors.phone = "Telefon numarası gerekli";
    }
    if (!nationalId.trim()) {
      newErrors.nationalId = "TC Kimlik numarası gerekli";
    }
    if (nationalId.trim() && !/^\d{11}$/.test(nationalId.trim())) {
      newErrors.nationalId = "TC Kimlik numarası 11 hane olmalı";
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
    if (!firebaseUser?.uid) return;

    setIsLoading(true);
    try {
      const data = {
        name: name.trim(),
        phone: phone.trim(),
        nationalId: nationalId.trim(),
        plate: plate.trim().toUpperCase(),
        vehicleType,
        ...(dorsePlate.trim() && { dorsePlate: dorsePlate.trim() }),
      };

      let success = false;
      if (isEdit && carrier) {
        success = await updateCarrier(firebaseUser.uid, carrier.id, data);
      } else {
        const result = await addCarrier(firebaseUser.uid, data);
        success = !!result;
      }
      
      if (!success) {
        Alert.alert("Hata", "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.");
        setIsLoading(false);
        return;
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert("Hata", "Kayıt sırasında bir hata oluştu");
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      Alert.alert(
        "Kaydedilmemiş Değişiklikler",
        "Değişiklikleri kaydetmeden çıkmak istediğinize emin misiniz?",
        [
          { text: "İptal", onPress: () => {}, style: "cancel" },
          {
            text: "Çık",
            onPress: () => {
              navigation.goBack();
            },
            style: "destructive",
          },
        ]
      );
    } else {
      navigation.goBack();
    }
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
  }, [navigation, theme, isLoading, name, phone, nationalId, plate, dorsePlate, vehicleType]);

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
      <ScreenKeyboardAwareScrollView
        contentContainerStyle={[styles.content, { paddingTop: 100, paddingBottom: insets.bottom + Spacing.xl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderInput("Ad Soyad", name, (text) => setName(text.toUpperCase()), "name", { placeholder: "Nakliyeci adı" })}
        {renderInput("Telefon Numarası", phone, (text) => setPhone(formatPhoneNumber(text)), "phone", { placeholder: "05XX XXX XXXX", keyboardType: "phone-pad" })}
        {renderInput("TC Kimlik Numarası", nationalId, (text) => setNationalId(text.toUpperCase()), "nationalId", { placeholder: "11 haneli kimlik numarası", keyboardType: "phone-pad" })}
        {renderInput("Plaka", plate, (text) => setPlate(formatLicensePlate(text)), "plate", { placeholder: "34 ABC 123" })}
        {renderInput("Dorse Plakası (İsteğe Bağlı)", dorsePlate, (text) => setDorsePlate(formatLicensePlate(text)), "dorsePlate", { placeholder: "34 ABC 123" })}
        
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

      </ScreenKeyboardAwareScrollView>

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
