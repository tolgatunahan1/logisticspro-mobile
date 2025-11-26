import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable, Alert, FlatList, Modal, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { ThemedText } from "@/components/ThemedText";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import {
  getCarrierAvailabilities,
  addCarrierAvailability,
  deleteCarrierAvailability,
  getCarriers,
  CarrierAvailability,
  Carrier,
} from "@/utils/storage";

export default function AvailabilityScreen() {
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const [availabilities, setAvailabilities] = useState<CarrierAvailability[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isRegistered, setIsRegistered] = useState(true);

  // Form fields
  const [carrierName, setCarrierName] = useState("");
  const [carrierPhone, setCarrierPhone] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [notes, setNotes] = useState("");

  const loadData = useCallback(async () => {
    const data = await getCarrierAvailabilities();
    setAvailabilities(data);
    const carriersList = await getCarriers();
    setCarriers(carriersList);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleAddAvailability = async () => {
    if (!carrierName.trim() || !currentLocation.trim() || !destinationLocation.trim() || !notes.trim()) {
      Alert.alert("Uyarı", "Lütfen tüm alanları doldurunuz");
      return;
    }

    // 12 saat sonrası expire
    const expiresAt = Date.now() + 12 * 60 * 60 * 1000;

    const result = await addCarrierAvailability({
      carrierName: carrierName.trim(),
      carrierPhone: carrierPhone.trim() || undefined,
      currentLocation: currentLocation.trim(),
      destinationLocation: destinationLocation.trim(),
      notes: notes.trim(),
      capacity: "boş",
      expiresAt,
    });

    if (result) {
      Alert.alert("Başarılı", "Nakliyeci uygunluğu kaydedildi");
      setCarrierName("");
      setCarrierPhone("");
      setCurrentLocation("");
      setDestinationLocation("");
      setNotes("");
      setModalVisible(false);
      await loadData();
    } else {
      Alert.alert("Hata", "Kaydedilemedi");
    }
  };

  const handleDeleteAvailability = (id: string) => {
    Alert.alert("Sil", "Bu uygunluğu silmek istediğinize emin misiniz?", [
      { text: "İptal", onPress: () => {} },
      {
        text: "Sil",
        onPress: async () => {
          await deleteCarrierAvailability(id);
          await loadData();
        },
      },
    ]);
  };

  const renderAvailabilityItem = ({ item }: { item: CarrierAvailability }) => (
    <View
      style={[
        styles.availabilityCard,
        { backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)" },
      ]}
    >
      <View style={styles.availabilityHeader}>
        <View style={{ flex: 1 }}>
          <ThemedText type="h3" style={{ marginBottom: Spacing.xs }}>
            {item.carrierName}
          </ThemedText>
          {item.carrierPhone && (
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              {item.carrierPhone}
            </ThemedText>
          )}
        </View>
        <Pressable onPress={() => handleDeleteAvailability(item.id)} style={styles.deleteButton}>
          <Feather name="trash-2" size={18} color="#EF4444" />
        </Pressable>
      </View>

      <View style={[styles.divider, { borderColor: colors.borderColor }]} />

      <View style={styles.availabilityDetails}>
        <View style={styles.detailRow}>
          <Feather name="map-pin" size={16} color={colors.textSecondary} />
          <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Bulunduğu Yer
            </ThemedText>
            <ThemedText type="body">{item.currentLocation}</ThemedText>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Feather name="navigation" size={16} color={colors.textSecondary} />
          <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Gideceği Yer
            </ThemedText>
            <ThemedText type="body">{item.destinationLocation}</ThemedText>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Feather name="message-square" size={16} color={colors.textSecondary} />
          <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Not
            </ThemedText>
            <ThemedText type="body">{item.notes}</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <ScreenKeyboardAwareScrollView>
      <View style={[styles.container, { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg }]}>
        <View style={styles.headerSection}>
          <View>
            <ThemedText type="h2">Nakliyeci Bildirimleri</ThemedText>
            <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: Spacing.xs }}>
              {availabilities.length} aktif bildiri
            </ThemedText>
          </View>
          <Pressable
            onPress={() => {
              setCarrierName("");
              setCarrierPhone("");
              setCurrentLocation("");
              setDestinationLocation("");
              setNotes("");
              setModalVisible(true);
            }}
            style={[styles.addButton, { backgroundColor: theme.link }]}
          >
            <Feather name="plus" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        {availabilities.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)" }]}>
            <Feather name="inbox" size={32} color={colors.textSecondary} />
            <ThemedText type="body" style={{ color: colors.textSecondary, marginTop: Spacing.md }}>
              Henüz nakliyeci bildirimi yok
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={availabilities}
            renderItem={renderAvailabilityItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={{ gap: Spacing.md, marginBottom: Spacing.xl }}
          />
        )}
      </View>

      {/* Add Modal */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <ScreenKeyboardAwareScrollView>
          <View style={[styles.modalContent, { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h2">Yeni Bildiri Ekle</ThemedText>
              <Pressable onPress={() => setModalVisible(false)}>
                <Feather name="x" size={28} color={colors.text} />
              </Pressable>
            </View>

            {/* Registered/Unregistered Toggle */}
            <View style={styles.formSection}>
              <ThemedText type="h3" style={{ marginBottom: Spacing.md }}>
                Nakliyeci Türü
              </ThemedText>
              <View style={styles.toggleGroup}>
                <Pressable
                  onPress={() => setIsRegistered(true)}
                  style={[
                    styles.toggleButton,
                    {
                      backgroundColor: isRegistered ? theme.link : isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
                    },
                  ]}
                >
                  <ThemedText
                    type="body"
                    style={{ color: isRegistered ? "#FFFFFF" : colors.text, fontWeight: "600" }}
                  >
                    Kayıtlı
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => setIsRegistered(false)}
                  style={[
                    styles.toggleButton,
                    {
                      backgroundColor: !isRegistered ? theme.link : isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
                    },
                  ]}
                >
                  <ThemedText
                    type="body"
                    style={{ color: !isRegistered ? "#FFFFFF" : colors.text, fontWeight: "600" }}
                  >
                    Kayıtsız
                  </ThemedText>
                </Pressable>
              </View>
            </View>

            {/* Carrier Name */}
            <View style={styles.formSection}>
              <ThemedText type="h3" style={{ marginBottom: Spacing.sm }}>
                Nakliyeci Adı
              </ThemedText>
              <TextInput
                placeholder="Adı Soyadı"
                placeholderTextColor={colors.textSecondary}
                value={carrierName}
                onChangeText={setCarrierName}
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
                    color: colors.text,
                    borderColor: colors.borderColor,
                  },
                ]}
              />
            </View>

            {/* Phone */}
            <View style={styles.formSection}>
              <ThemedText type="h3" style={{ marginBottom: Spacing.sm }}>
                Telefon (İsteğe bağlı)
              </ThemedText>
              <TextInput
                placeholder="0123456789"
                placeholderTextColor={colors.textSecondary}
                value={carrierPhone}
                onChangeText={setCarrierPhone}
                keyboardType="phone-pad"
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
                    color: colors.text,
                    borderColor: colors.borderColor,
                  },
                ]}
              />
            </View>

            {/* Current Location */}
            <View style={styles.formSection}>
              <ThemedText type="h3" style={{ marginBottom: Spacing.sm }}>
                Bulunduğu Yer
              </ThemedText>
              <TextInput
                placeholder="İstanbul, Aydın, vb..."
                placeholderTextColor={colors.textSecondary}
                value={currentLocation}
                onChangeText={setCurrentLocation}
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
                    color: colors.text,
                    borderColor: colors.borderColor,
                  },
                ]}
              />
            </View>

            {/* Destination Location */}
            <View style={styles.formSection}>
              <ThemedText type="h3" style={{ marginBottom: Spacing.sm }}>
                Gideceği Yer
              </ThemedText>
              <TextInput
                placeholder="İzmir, Ankara, vb..."
                placeholderTextColor={colors.textSecondary}
                value={destinationLocation}
                onChangeText={setDestinationLocation}
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
                    color: colors.text,
                    borderColor: colors.borderColor,
                  },
                ]}
              />
            </View>

            {/* Notes */}
            <View style={styles.formSection}>
              <ThemedText type="h3" style={{ marginBottom: Spacing.sm }}>
                Not (Uygunluk Durumu)
              </ThemedText>
              <TextInput
                placeholder="Parça yük için boş yer var, tam yük arıyor, vb..."
                placeholderTextColor={colors.textSecondary}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
                    color: colors.text,
                    borderColor: colors.borderColor,
                  },
                ]}
              />
            </View>

            {/* Buttons */}
            <View style={styles.buttonGroup}>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={[
                  styles.button,
                  { backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)" },
                ]}
              >
                <ThemedText type="h3">İptal</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleAddAvailability}
                style={[styles.button, { backgroundColor: theme.link }]}
              >
                <ThemedText type="h3" style={{ color: "#FFFFFF" }}>
                  Kaydet
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </ScreenKeyboardAwareScrollView>
      </Modal>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xl * 2,
    borderRadius: BorderRadius.md,
  },
  availabilityCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  availabilityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deleteButton: {
    padding: Spacing.sm,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
    borderWidth: 1,
  },
  availabilityDetails: {
    gap: Spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  formSection: {
    marginBottom: Spacing.lg,
  },
  toggleGroup: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
  },
  textArea: {
    textAlignVertical: "top",
    paddingTop: Spacing.md,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
