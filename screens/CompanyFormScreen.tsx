import React, { useState, useLayoutEffect } from "react";
import { StyleSheet, View, TextInput, Pressable, Alert, ActivityIndicator, ScrollView, Platform } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Contacts from "expo-contacts";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { addCompany, updateCompany, deleteCompany } from "@/utils/storage";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "CompanyForm">;
type ScreenRouteProp = RouteProp<RootStackParamList, "CompanyForm">;

export default function CompanyFormScreen() {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const insets = useSafeAreaInsets();
  
  const { company, mode } = route.params;
  const isEdit = mode === "edit";

  const [name, setName] = useState(company?.name || "");
  const [phone, setPhone] = useState(company?.phone || "");
  const [address, setAddress] = useState(company?.address || "");
  const [contactPerson, setContactPerson] = useState(company?.contactPerson || "");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const colors = isDark ? Colors.dark : Colors.light;

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = "Firma adı gerekli";
    }
    if (!phone.trim()) {
      newErrors.phone = "Telefon numarası gerekli";
    }
    if (!contactPerson.trim()) {
      newErrors.contactPerson = "Yetkili kişi gerekli";
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
        address: address.trim(),
        contactPerson: contactPerson.trim(),
      };

      if (isEdit && company) {
        await updateCompany(company.id, data);
      } else {
        await addCompany(data);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert("Hata", "Kayıt sırasında bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!company) return;

    Alert.alert(
      "Firmayı Sil",
      `"${company.name}" adlı firmayı silmek istediğinizden emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            await deleteCompany(company.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleSelectContact = async (fieldType: "name" | "phone" | "contactPerson") => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("İzin Gerekli", "Rehbere erişim izni verilmesi gereklidir");
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.FirstName, Contacts.Fields.LastName],
      });

      if (data.length === 0) {
        Alert.alert("Rehber Boş", "Rehberde kişi bulunmuyor");
        return;
      }

      const contactOptions = data.map((contact) => ({
        text: `${contact.firstName || ""} ${contact.lastName || ""}`.trim() || "İsimsiz",
        onPress: () => {
          if (fieldType === "name") {
            setName(`${contact.firstName || ""} ${contact.lastName || ""}`.trim());
          } else if (fieldType === "contactPerson") {
            setContactPerson(`${contact.firstName || ""} ${contact.lastName || ""}`.trim());
          } else if (fieldType === "phone" && contact.phoneNumbers && contact.phoneNumbers.length > 0) {
            setPhone(contact.phoneNumbers[0].number);
          }
        },
      }));

      contactOptions.push({ text: "İptal", onPress: () => {} });

      Alert.alert("Rehberden Seç", "Bir kişi seçin", contactOptions);
    } catch (error) {
      console.error("Rehber hatası:", error);
      Alert.alert("Hata", "Rehbere erişilirken bir hata oluştu");
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
  }, [navigation, theme, isLoading, name, phone, address, contactPerson]);

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
      showContactButton?: boolean;
      contactFieldType?: "name" | "phone" | "contactPerson";
    }
  ) => (
    <View style={styles.inputContainer}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <ThemedText type="small" style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </ThemedText>
        {options?.showContactButton && (
          <Pressable
            onPress={() => handleSelectContact(options.contactFieldType || "name")}
            disabled={isLoading}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Feather name="users" size={18} color={theme.link} />
          </Pressable>
        )}
      </View>
      <TextInput
        style={[
          styles.input,
          options?.multiline && styles.multilineInput,
          {
            backgroundColor: colors.inputBackground,
            borderColor: errors[errorKey] ? colors.destructive : colors.border,
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
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderInput("Firma Adı", name, setName, "name", { placeholder: "Firma adı", autoCapitalize: "words", showContactButton: Platform.OS !== "web", contactFieldType: "name" })}
        {renderInput("Telefon Numarası", phone, setPhone, "phone", { placeholder: "05XX XXX XXXX", keyboardType: "phone-pad", showContactButton: Platform.OS !== "web", contactFieldType: "phone" })}
        {renderInput("Yetkili Kişi", contactPerson, setContactPerson, "contactPerson", { placeholder: "Yetkili adı", autoCapitalize: "words", showContactButton: Platform.OS !== "web", contactFieldType: "contactPerson" })}
        {renderInput("Adres", address, setAddress, "address", { placeholder: "Firma adresi (opsiyonel)", multiline: true })}

        {isEdit ? (
          <Pressable
            onPress={handleDelete}
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
              Firmayı Sil
            </ThemedText>
          </Pressable>
        ) : null}
      </ScrollView>
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
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
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
});
