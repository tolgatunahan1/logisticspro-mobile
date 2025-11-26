import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable, Alert, FlatList, Modal, TextInput, KeyboardAvoidingView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemedText } from "@/components/ThemedText";
import { ScreenScrollView } from "@/components/ScreenScrollView";
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
import { RootStackParamList } from "@/navigation/RootNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AvailabilityScreen() {
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const navigation = useNavigation<NavigationProp>();

  const [availabilities, setAvailabilities] = useState<CarrierAvailability[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isRegistered, setIsRegistered] = useState(true);
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null);

  const [carrierName, setCarrierName] = useState("");
  const [carrierPhone, setCarrierPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await getCarrierAvailabilities();
      setAvailabilities(data);
      const carriersList = await getCarriers();
      setCarriers(carriersList);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const resetForm = () => {
    setCarrierName("");
    setCarrierPhone("");
    setVehicleType("");
    setCurrentLocation("");
    setDestinationLocation("");
    setNotes("");
    setSelectedCarrier(null);
    setIsRegistered(true);
  };

  const handleAddAvailability = async () => {
    try {
      setLoading(true);

      if (isRegistered && !selectedCarrier) {
        Alert.alert("Uyarı", "Lütfen kayıtlı nakliyeci seçiniz");
        setLoading(false);
        return;
      }

      if (!isRegistered && !carrierName.trim()) {
        Alert.alert("Uyarı", "Lütfen nakliyeci adı giriniz");
        setLoading(false);
        return;
      }

      if (!currentLocation.trim()) {
        Alert.alert("Uyarı", "Lütfen bulunduğu yeri giriniz");
        setLoading(false);
        return;
      }

      if (!destinationLocation.trim()) {
        Alert.alert("Uyarı", "Lütfen gideceği yeri giriniz");
        setLoading(false);
        return;
      }

      if (!notes.trim()) {
        Alert.alert("Uyarı", "Lütfen uygunluk durumunu yazınız");
        setLoading(false);
        return;
      }

      const expiresAt = Date.now() + 12 * 60 * 60 * 1000;

      const finalCarrierName = isRegistered ? selectedCarrier!.name : carrierName.trim();
      const finalCarrierPhone = isRegistered ? selectedCarrier!.phone : carrierPhone.trim();
      const finalVehicleType = isRegistered ? selectedCarrier!.vehicleType : vehicleType.trim();

      const result = await addCarrierAvailability({
        carrierId: isRegistered ? selectedCarrier!.id : undefined,
        carrierName: finalCarrierName,
        carrierPhone: finalCarrierPhone || undefined,
        currentLocation: currentLocation.trim(),
        destinationLocation: destinationLocation.trim(),
        notes: notes.trim(),
        capacity: "boş",
        loadType: finalVehicleType || undefined,
        expiresAt,
      });

      if (result) {
        Alert.alert("Başarılı", "Uygunluk kaydedildi");
        resetForm();
        setModalVisible(false);
        await loadData();

        if (!isRegistered) {
          Alert.alert(
            "Nakliyeci Kayıt",
            `${finalCarrierName} sistemde kayıtlı değil. Kayıt etmek ister misiniz?`,
            [
              { text: "İptal", onPress: () => {} },
              {
                text: "Kayıt Et",
                onPress: () => {
                  navigation.navigate("CarrierForm", {
                    mode: "add",
                    initialData: {
                      name: finalCarrierName,
                      phone: finalCarrierPhone,
                      vehicleType: finalVehicleType || "kamyon",
                    },
                  });
                },
              },
            ]
          );
        }
      } else {
        Alert.alert("Hata", "Kaydedilemedi");
      }
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Hata", "İşlem sırasında hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAvailability = (id: string) => {
    Alert.alert("Sil", "Bu uygunluğu silmek istediğinize emin misiniz?", [
      { text: "İptal", onPress: () => {} },
      {
        text: "Sil",
        onPress: async () => {
          try {
            const success = await deleteCarrierAvailability(id);
            if (success) {
              await loadData();
              Alert.alert("Başarılı", "Uygunluk silindi");
            } else {
              Alert.alert("Hata", "Silinemiyor");
            }
          } catch (error) {
            console.error("Delete error:", error);
            Alert.alert("Hata", "Sil işlemi başarısız");
          }
        },
      },
    ]);
  };

  const openModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const renderAvailabilityItem = ({ item }: { item: CarrierAvailability }) => (
    <Pressable
      onPress={() => {
        Alert.alert(
          item.carrierName,
          `Telefon: ${item.carrierPhone || "Yok"}\nBulunduğu Yer: ${item.currentLocation}\nGideceği Yer: ${item.destinationLocation}\nDurum: ${item.notes}`,
          [{ text: "Kapat" }]
        );
      }}
      style={[styles.card, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)" }]}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <ThemedText type="body" style={{ fontWeight: "600" }}>
            {item.carrierName}
          </ThemedText>
          {item.carrierPhone && (
            <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: 4 }}>
              {item.carrierPhone}
            </ThemedText>
          )}
        </View>
        <Pressable
          onPress={() => handleDeleteAvailability(item.id)}
          style={({ pressed }) => [styles.deleteBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Feather name="trash-2" size={16} color="#EF4444" />
        </Pressable>
      </View>

      <View style={[styles.divider, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }]} />

      <View style={{ gap: 8 }}>
        <View style={styles.info}>
          <Feather name="map-pin" size={14} color={colors.textSecondary} />
          <View style={{ marginLeft: 8, flex: 1 }}>
            <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 12 }}>
              Bulunduğu Yer
            </ThemedText>
            <ThemedText type="small" style={{ fontSize: 13 }}>
              {item.currentLocation}
            </ThemedText>
          </View>
        </View>

        <View style={styles.info}>
          <Feather name="navigation" size={14} color={colors.textSecondary} />
          <View style={{ marginLeft: 8, flex: 1 }}>
            <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 12 }}>
              Gideceği Yer
            </ThemedText>
            <ThemedText type="small" style={{ fontSize: 13 }}>
              {item.destinationLocation}
            </ThemedText>
          </View>
        </View>

        <View style={styles.info}>
          <Feather name="message-circle" size={14} color={colors.textSecondary} />
          <View style={{ marginLeft: 8, flex: 1 }}>
            <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 12 }}>
              Durum
            </ThemedText>
            <ThemedText type="small" style={{ fontSize: 13 }}>
              {item.notes}
            </ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <ScreenScrollView>
      <View style={[styles.container, { paddingHorizontal: Spacing.md, paddingTop: Spacing.md }]}>
        <View style={styles.header}>
          <View>
            <ThemedText type="h2">Nakliyeci Bildirimleri</ThemedText>
            <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: 4 }}>
              {availabilities.length} aktif
            </ThemedText>
          </View>
          <Pressable onPress={openModal} style={[styles.addBtn, { backgroundColor: theme.link }]}>
            <Feather name="plus" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        {availabilities.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }]}>
            <Feather name="inbox" size={28} color={colors.textSecondary} />
            <ThemedText type="small" style={{ color: colors.textSecondary, marginTop: Spacing.md }}>
              Henüz bildiri yok
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={availabilities}
            renderItem={renderAvailabilityItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={{ gap: 10, paddingBottom: Spacing.lg }}
          />
        )}
      </View>

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <ScreenScrollView>
            <View style={[styles.modal, { paddingHorizontal: Spacing.md, paddingTop: Spacing.md }]}>
              <View style={styles.modalHeader}>
                <ThemedText type="h2">Yeni Bildiri</ThemedText>
                <Pressable onPress={() => setModalVisible(false)}>
                  <Feather name="x" size={24} color={colors.text} />
                </Pressable>
              </View>

              <View style={styles.section}>
                <ThemedText type="h3" style={{ marginBottom: 12, fontSize: 14 }}>
                  Nakliyeci Türü
                </ThemedText>
                <View style={styles.toggleGroup}>
                  <Pressable
                    onPress={() => {
                      setIsRegistered(true);
                      setSelectedCarrier(null);
                      setCarrierName("");
                      setCarrierPhone("");
                      setVehicleType("");
                    }}
                    style={[
                      styles.toggleBtn,
                      {
                        backgroundColor: isRegistered ? theme.link : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                      },
                    ]}
                  >
                    <ThemedText type="small" style={{ color: isRegistered ? "#FFFFFF" : colors.text, fontWeight: "600" }}>
                      Kayıtlı
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setIsRegistered(false);
                      setSelectedCarrier(null);
                      setCarrierName("");
                      setCarrierPhone("");
                      setVehicleType("");
                    }}
                    style={[
                      styles.toggleBtn,
                      {
                        backgroundColor: !isRegistered ? theme.link : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                      },
                    ]}
                  >
                    <ThemedText type="small" style={{ color: !isRegistered ? "#FFFFFF" : colors.text, fontWeight: "600" }}>
                      Kayıtsız
                    </ThemedText>
                  </Pressable>
                </View>
              </View>

              {isRegistered ? (
                <View style={styles.section}>
                  <ThemedText type="h3" style={{ marginBottom: 10, fontSize: 14 }}>
                    Nakliyeci Seç
                  </ThemedText>
                  <View style={[styles.selectBox, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }]}>
                    {carriers.length === 0 ? (
                      <View style={{ padding: 12 }}>
                        <ThemedText type="small" style={{ color: colors.textSecondary }}>
                          Kayıtlı nakliyeci yok
                        </ThemedText>
                      </View>
                    ) : (
                      <FlatList
                        data={carriers}
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                          <Pressable
                            onPress={() => {
                              setSelectedCarrier(item);
                              setCarrierName(item.name);
                              setCarrierPhone(item.phone);
                              setVehicleType(item.vehicleType);
                            }}
                            style={[
                              styles.carrierItem,
                              selectedCarrier?.id === item.id && {
                                backgroundColor: isDark ? "rgba(59,130,246,0.1)" : "rgba(59,130,246,0.05)",
                              },
                            ]}
                          >
                            <View>
                              <ThemedText type="small" style={{ fontWeight: selectedCarrier?.id === item.id ? "600" : "400" }}>
                                {item.name}
                              </ThemedText>
                              <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 12 }}>
                                {item.phone}
                              </ThemedText>
                            </View>
                            {selectedCarrier?.id === item.id && (
                              <Feather name="check" size={18} color={theme.link} />
                            )}
                          </Pressable>
                        )}
                        keyExtractor={(item) => item.id}
                      />
                    )}
                  </View>
                </View>
              ) : (
                <>
                  <View style={styles.section}>
                    <ThemedText type="h3" style={{ marginBottom: 8, fontSize: 14 }}>
                      Nakliyeci Adı
                    </ThemedText>
                    <TextInput
                      placeholder="Adı Soyadı"
                      placeholderTextColor={colors.textSecondary}
                      value={carrierName}
                      onChangeText={setCarrierName}
                      style={[styles.input, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", color: colors.text }]}
                    />
                  </View>

                  <View style={styles.section}>
                    <ThemedText type="h3" style={{ marginBottom: 8, fontSize: 14 }}>
                      Telefon
                    </ThemedText>
                    <TextInput
                      placeholder="0123456789"
                      placeholderTextColor={colors.textSecondary}
                      value={carrierPhone}
                      onChangeText={setCarrierPhone}
                      keyboardType="phone-pad"
                      style={[styles.input, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", color: colors.text }]}
                    />
                  </View>

                  <View style={styles.section}>
                    <ThemedText type="h3" style={{ marginBottom: 8, fontSize: 14 }}>
                      Araç Tipi
                    </ThemedText>
                    <TextInput
                      placeholder="Kamyon, Pickup, vb..."
                      placeholderTextColor={colors.textSecondary}
                      value={vehicleType}
                      onChangeText={setVehicleType}
                      style={[styles.input, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", color: colors.text }]}
                    />
                  </View>
                </>
              )}

              <View style={styles.section}>
                <ThemedText type="h3" style={{ marginBottom: 8, fontSize: 14 }}>
                  Bulunduğu Yer
                </ThemedText>
                <TextInput
                  placeholder="İstanbul, Aydın, vb..."
                  placeholderTextColor={colors.textSecondary}
                  value={currentLocation}
                  onChangeText={setCurrentLocation}
                  style={[styles.input, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", color: colors.text }]}
                />
              </View>

              <View style={styles.section}>
                <ThemedText type="h3" style={{ marginBottom: 8, fontSize: 14 }}>
                  Gideceği Yer
                </ThemedText>
                <TextInput
                  placeholder="İzmir, Ankara, vb..."
                  placeholderTextColor={colors.textSecondary}
                  value={destinationLocation}
                  onChangeText={setDestinationLocation}
                  style={[styles.input, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", color: colors.text }]}
                />
              </View>

              <View style={styles.section}>
                <ThemedText type="h3" style={{ marginBottom: 8, fontSize: 14 }}>
                  Uygunluk Durumu
                </ThemedText>
                <TextInput
                  placeholder="Parça yük için boş yer var, tam yük arıyor, vb..."
                  placeholderTextColor={colors.textSecondary}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  style={[styles.input, styles.textArea, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", color: colors.text }]}
                />
              </View>

              <View style={styles.buttons}>
                <Pressable
                  onPress={() => setModalVisible(false)}
                  disabled={loading}
                  style={[styles.btn, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", opacity: loading ? 0.5 : 1 }]}
                >
                  <ThemedText type="h3" style={{ fontSize: 14 }}>
                    İptal
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={handleAddAvailability}
                  disabled={loading}
                  style={[styles.btn, { backgroundColor: theme.link, opacity: loading ? 0.5 : 1 }]}
                >
                  <ThemedText type="h3" style={{ color: "#FFFFFF", fontSize: 14 }}>
                    {loading ? "Kaydediliyor..." : "Kaydet"}
                  </ThemedText>
                </Pressable>
              </View>

              <View style={{ height: Spacing.lg }} />
            </View>
          </ScreenScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.md },
  addBtn: { width: 40, height: 40, borderRadius: BorderRadius.md, justifyContent: "center", alignItems: "center" },
  empty: { alignItems: "center", paddingVertical: 60, borderRadius: BorderRadius.md },
  card: { borderRadius: BorderRadius.md, padding: 12, borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  deleteBtn: { padding: 6 },
  divider: { height: 1, marginVertical: 10 },
  info: { flexDirection: "row", alignItems: "flex-start" },
  modal: { flex: 1 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.md },
  section: { marginBottom: Spacing.md },
  toggleGroup: { flexDirection: "row", gap: Spacing.sm },
  toggleBtn: { flex: 1, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, alignItems: "center" },
  selectBox: { borderRadius: BorderRadius.md, borderWidth: 1, borderColor: "rgba(0,0,0,0.05)", maxHeight: 200 },
  carrierItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 10, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.05)" },
  input: { borderWidth: 1, borderRadius: BorderRadius.md, borderColor: "rgba(0,0,0,0.05)", paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  textArea: { textAlignVertical: "top", paddingTop: 10, minHeight: 80 },
  buttons: { flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.md },
  btn: { flex: 1, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, alignItems: "center" },
});
