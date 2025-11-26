import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable, Alert, FlatList, Modal, TextInput, ScrollView, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
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

export default function AvailabilityScreen() {
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

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
  const [deletedItem, setDeletedItem] = useState<CarrierAvailability | null>(null);

  const loadData = useCallback(async () => {
    try {
      const data = await getCarrierAvailabilities();
      setAvailabilities(data || []);
      const list = await getCarriers();
      setCarriers(list || []);
    } catch (e) {
      console.error("Load error:", e);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadData();
  }, [loadData]));

  const handleDelete = (item: CarrierAvailability) => {
    const backup = [...availabilities];
    
    // Hemen state'ten sil
    setAvailabilities(prev => prev.filter(a => a.id !== item.id));
    setDeletedItem(item);
    
    // Storage'dan sil
    deleteCarrierAvailability(item.id).then(success => {
      if (!success) {
        // Hata varsa geri yükle
        setAvailabilities(backup);
        setDeletedItem(null);
        Alert.alert("Hata", "Silinemiyor");
      }
    }).catch(error => {
      // Hata varsa geri yükle
      console.error("Delete error:", error);
      setAvailabilities(backup);
      setDeletedItem(null);
      Alert.alert("Hata", "Silinemiyor");
    });
  };

  const handleSave = async () => {
    try {
      if (isRegistered && !selectedCarrier) {
        Alert.alert("Hata", "Nakliyeci seçiniz");
        return;
      }
      if (!isRegistered && !carrierName.trim()) {
        Alert.alert("Hata", "Adı giriniz");
        return;
      }
      if (!currentLocation.trim()) {
        Alert.alert("Hata", "Bulunduğu yeri giriniz");
        return;
      }
      if (!destinationLocation.trim()) {
        Alert.alert("Hata", "Gideceği yeri giriniz");
        return;
      }
      if (!notes.trim()) {
        Alert.alert("Hata", "Durumu yazınız");
        return;
      }

      const expiresAt = Date.now() + 12 * 60 * 60 * 1000;
      const result = await addCarrierAvailability({
        carrierId: isRegistered ? selectedCarrier!.id : undefined,
        carrierName: isRegistered ? selectedCarrier!.name : carrierName.trim(),
        carrierPhone: isRegistered ? selectedCarrier!.phone : carrierPhone.trim() || undefined,
        currentLocation: currentLocation.trim(),
        destinationLocation: destinationLocation.trim(),
        notes: notes.trim(),
        capacity: "boş",
        loadType: isRegistered ? selectedCarrier!.vehicleType : vehicleType.trim() || undefined,
        expiresAt,
      });

      if (result) {
        setCarrierName("");
        setCarrierPhone("");
        setVehicleType("");
        setCurrentLocation("");
        setDestinationLocation("");
        setNotes("");
        setSelectedCarrier(null);
        setIsRegistered(true);
        setModalVisible(false);
        await loadData();
      }
    } catch (e) {
      console.error("Save error:", e);
    }
  };

  const renderItem = ({ item }: { item: CarrierAvailability }) => (
    <View style={[s.card, { backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.01)" }]}>
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <ThemedText type="small" style={{ fontWeight: "600" }}>
            {item.carrierName}
          </ThemedText>
          {item.carrierPhone && (
            <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
              {item.carrierPhone}
            </ThemedText>
          )}
        </View>
        <Pressable 
          onPress={() => handleDelete(item)}
          style={s.deleteBtn}
        >
          <Feather name="trash-2" size={14} color="#EF4444" />
        </Pressable>
      </View>
      <View style={[s.divider, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }]} />
      <View style={{ gap: 4 }}>
        <ThemedText type="small" style={{ fontSize: 11, color: colors.textSecondary }}>
          📍 {item.currentLocation} → {item.destinationLocation}
        </ThemedText>
        <ThemedText type="small" style={{ fontSize: 11, color: colors.textSecondary }}>
          {item.notes}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <ScreenScrollView>
      <View style={[s.container, { paddingHorizontal: 12, paddingTop: 12 }]}>
        <View style={s.titleBar}>
          <View>
            <ThemedText type="h3">Nakliyeci Bildirimleri</ThemedText>
            <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 11 }}>
              {availabilities.length} bildiri
            </ThemedText>
          </View>
          <Pressable onPress={() => setModalVisible(true)} style={[s.addBtn, { backgroundColor: theme.link }]}>
            <Feather name="plus" size={18} color="white" />
          </Pressable>
        </View>

        {availabilities.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Bildiri yok
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={availabilities}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={{ gap: 6 }}
          />
        )}
      </View>

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={[s.modalWrapper, { backgroundColor: colors.backgroundDefault }]}>
          <ScrollView bounces={false} showsVerticalScrollIndicator={false} scrollEnabled={false} pinchGestureEnabled={false}>
            <View style={[s.modal, { paddingHorizontal: 12, paddingTop: 12 }]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <ThemedText type="h3">Yeni Bildiri</ThemedText>
                <Pressable onPress={() => setModalVisible(false)}>
                  <Feather name="x" size={24} color={colors.text} />
                </Pressable>
              </View>

              <View style={{ marginBottom: 12 }}>
                <ThemedText type="small" style={{ fontWeight: "600", marginBottom: 8 }}>
                  Tip
                </ThemedText>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Pressable
                    onPress={() => {
                      setIsRegistered(true);
                      setSelectedCarrier(null);
                    }}
                    style={[s.toggleBtn, { backgroundColor: isRegistered ? theme.link : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }]}
                  >
                    <ThemedText type="small" style={{ color: isRegistered ? "white" : colors.text, fontWeight: "600", fontSize: 12 }}>
                      Kayıtlı
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setIsRegistered(false);
                      setSelectedCarrier(null);
                    }}
                    style={[s.toggleBtn, { backgroundColor: !isRegistered ? theme.link : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }]}
                  >
                    <ThemedText type="small" style={{ color: !isRegistered ? "white" : colors.text, fontWeight: "600", fontSize: 12 }}>
                      Kayıtsız
                    </ThemedText>
                  </Pressable>
                </View>
              </View>

              {isRegistered ? (
                <View style={{ marginBottom: 12 }}>
                  <ThemedText type="small" style={{ fontWeight: "600", marginBottom: 8 }}>
                    Seç
                  </ThemedText>
                  <View style={[s.list, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)" }]}>
                    {carriers.length === 0 ? (
                      <ThemedText type="small" style={{ color: colors.textSecondary, padding: 8 }}>
                        Kayıtlı yok
                      </ThemedText>
                    ) : (
                      carriers.map((c) => (
                        <Pressable
                          key={c.id}
                          onPress={() => setSelectedCarrier(c)}
                          style={[s.listItem, selectedCarrier?.id === c.id && { backgroundColor: isDark ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.08)" }]}
                        >
                          <View>
                            <ThemedText type="small">{c.name}</ThemedText>
                            <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 11 }}>
                              {c.phone}
                            </ThemedText>
                          </View>
                          {selectedCarrier?.id === c.id && <Feather name="check" size={16} color={theme.link} />}
                        </Pressable>
                      ))
                    )}
                  </View>
                </View>
              ) : (
                <>
                  <View style={{ marginBottom: 12 }}>
                    <ThemedText type="small" style={{ fontWeight: "600", marginBottom: 4 }}>
                      Ad
                    </ThemedText>
                    <TextInput
                      placeholder="Adı Soyadı"
                      value={carrierName}
                      onChangeText={setCarrierName}
                      placeholderTextColor={colors.textSecondary}
                      onFocus={(e) => {
                        if (Platform.OS === 'web') {
                          e.target.blur();
                          setTimeout(() => e.target.focus(), 100);
                        }
                      }}
                      style={[s.input, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", color: colors.text }]}
                    />
                  </View>
                  <View style={{ marginBottom: 12 }}>
                    <ThemedText type="small" style={{ fontWeight: "600", marginBottom: 4 }}>
                      Tel
                    </ThemedText>
                    <TextInput
                      placeholder="Phone"
                      value={carrierPhone}
                      onChangeText={setCarrierPhone}
                      keyboardType="phone-pad"
                      placeholderTextColor={colors.textSecondary}
                      onFocus={(e) => {
                        if (Platform.OS === 'web') {
                          e.target.blur();
                          setTimeout(() => e.target.focus(), 100);
                        }
                      }}
                      style={[s.input, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", color: colors.text }]}
                    />
                  </View>
                  <View style={{ marginBottom: 12 }}>
                    <ThemedText type="small" style={{ fontWeight: "600", marginBottom: 4 }}>
                      Araç
                    </ThemedText>
                    <TextInput
                      placeholder="Kamyon, Pickup, vb"
                      value={vehicleType}
                      onChangeText={setVehicleType}
                      placeholderTextColor={colors.textSecondary}
                      onFocus={(e) => {
                        if (Platform.OS === 'web') {
                          e.target.blur();
                          setTimeout(() => e.target.focus(), 100);
                        }
                      }}
                      style={[s.input, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", color: colors.text }]}
                    />
                  </View>
                </>
              )}

              <View style={{ marginBottom: 12 }}>
                <ThemedText type="small" style={{ fontWeight: "600", marginBottom: 4 }}>
                  Bulunduğu Yer
                </ThemedText>
                <TextInput
                  placeholder="İstanbul, Ankara, vb"
                  value={currentLocation}
                  onChangeText={setCurrentLocation}
                  placeholderTextColor={colors.textSecondary}
                  onFocus={(e) => {
                    if (Platform.OS === 'web') {
                      e.target.blur();
                      setTimeout(() => e.target.focus(), 100);
                    }
                  }}
                  style={[s.input, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", color: colors.text }]}
                />
              </View>

              <View style={{ marginBottom: 12 }}>
                <ThemedText type="small" style={{ fontWeight: "600", marginBottom: 4 }}>
                  Gideceği Yer
                </ThemedText>
                <TextInput
                  placeholder="İzmir, Bursa, vb"
                  value={destinationLocation}
                  onChangeText={setDestinationLocation}
                  placeholderTextColor={colors.textSecondary}
                  onFocus={(e) => {
                    if (Platform.OS === 'web') {
                      e.target.blur();
                      setTimeout(() => e.target.focus(), 100);
                    }
                  }}
                  style={[s.input, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", color: colors.text }]}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <ThemedText type="small" style={{ fontWeight: "600", marginBottom: 4 }}>
                  Durum
                </ThemedText>
                <TextInput
                  placeholder="Parça yük, tam yük, vb"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={2}
                  placeholderTextColor={colors.textSecondary}
                  onFocus={(e) => {
                    if (Platform.OS === 'web') {
                      e.target.blur();
                      setTimeout(() => e.target.focus(), 100);
                    }
                  }}
                  style={[s.input, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", color: colors.text, minHeight: 60 }]}
                />
              </View>

              <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
                <Pressable
                  onPress={() => setModalVisible(false)}
                  style={[s.actionBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }]}
                >
                  <ThemedText type="small" style={{ fontWeight: "600" }}>
                    İptal
                  </ThemedText>
                </Pressable>
                <Pressable onPress={handleSave} style={[s.actionBtn, { backgroundColor: theme.link }]}>
                  <ThemedText type="small" style={{ fontWeight: "600", color: "white" }}>
                    Kaydet
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScreenScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  titleBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  addBtn: { width: 36, height: 36, borderRadius: BorderRadius.sm, justifyContent: "center", alignItems: "center" },
  card: { borderRadius: BorderRadius.sm, padding: 10, borderWidth: 1, borderColor: "rgba(0,0,0,0.03)" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 },
  deleteBtn: { padding: 4 },
  divider: { height: 1, marginBottom: 6 },
  modalWrapper: { flex: 1 },
  modal: { paddingBottom: 20 },
  toggleBtn: { flex: 1, paddingVertical: 8, borderRadius: BorderRadius.sm, alignItems: "center" },
  list: { borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: "rgba(0,0,0,0.05)", maxHeight: 180 },
  listItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.03)" },
  input: { borderWidth: 1, borderRadius: BorderRadius.sm, borderColor: "rgba(0,0,0,0.05)", paddingHorizontal: 10, paddingVertical: 8, fontSize: 14 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: BorderRadius.sm, alignItems: "center" },
});
