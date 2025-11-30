import React, { useState, useLayoutEffect } from "react";
import { StyleSheet, View, TextInput, Pressable, Alert, ActivityIndicator, ScrollView, useWindowDimensions, KeyboardAvoidingView, Platform } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../contexts/AuthContext";
import { RootStackParamList } from "../navigation/RootNavigator";
import { addCompany, updateCompany } from "../utils/storage";
import { Spacing, BorderRadius, Colors } from "../constants/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "CompanyForm">;
type ScreenRouteProp = RouteProp<RootStackParamList, "CompanyForm">;

export default function CompanyFormScreen() {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const insets = useSafeAreaInsets();
  const { firebaseUser } = useAuth();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  
  const company = route.params?.company;
  const mode = route.params?.mode || "add";
  const isEdit = mode === "edit" && !!company;

  const [name, setName] = useState(company?.name || "");
  const [phone, setPhone] = useState(company?.phone || "");
  const [address, setAddress] = useState(company?.address || "");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = "Firma adı gerekli";
    }

    if (!phone.trim()) {
      newErrors.phone = "Telefon numarası gerekli";
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
        address: address.trim(),
      };

      let success = false;
      if (isEdit && company) {
        success = await updateCompany(firebaseUser.uid, company.id, data);
      } else {
        const result = await addCompany(firebaseUser.uid, data);
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
  }, [navigation, theme, isLoading, name, phone, address]);

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    errorKey: string,
    options?: {
      placeholder?: string;
      keyboardType?: "default" | "phone-pad";
      autoCapitalize?: "none" | "sentences" | "words" | "characters";
      multiline?: boolean;
    }
  ) => (
    <View style={styles.inputContainer}>
      <ThemedText type="small" style={[styles.label, { color: colors.textSecondary }]}>
        {label}
      </ThemedText>
      <TextInput
        style={[
          styles.input,
          options?.multiline && styles.multilineInput,
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
        multiline={options?.multiline}
        numberOfLines={options?.multiline ? 3 : 1}
        textAlignVertical={options?.multiline ? "top" : "center"}
      />
      {errors[errorKey] ? (
        <ThemedText type="small" style={[styles.errorText, { color: colors.destructive }]}>
          {errors[errorKey]}
        </ThemedText>
      ) : null}
    </View>
  );

  return (
    <ThemedView style={[styles.container, { paddingHorizontal: isTablet ? Spacing["2xl"] : 0 }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content, 
          { 
            paddingTop: 100, 
            paddingBottom: insets.bottom + Spacing.xl,
            maxWidth: isTablet ? 800 : undefined,
            alignSelf: "center",
            width: "100%",
          }
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderInput("Firma Adı", name, (text) => setName(text.toUpperCase()), "name", { placeholder: "Firma adı", autoCapitalize: "none" })}
        {renderInput("Telefon Numarası", phone, (text) => setPhone(formatPhoneNumber(text)), "phone", { placeholder: "05XX XXX XXXX", keyboardType: "phone-pad" })}
        {renderInput("Adres", address, (text) => setAddress(text.toUpperCase()), "address", { placeholder: "Firma adresi (opsiyonel)", multiline: true, autoCapitalize: "none" })}

      </ScrollView>
      </KeyboardAvoidingView>
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
  multilineInput: {
    height: 100,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  errorText: {
    marginLeft: Spacing.xs,
  },
  headerButton: {
    padding: Spacing.sm,
  },
});
