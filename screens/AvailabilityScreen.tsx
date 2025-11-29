import React, { useState, useCallback, useMemo } from "react";
import { StyleSheet, View, Pressable, Alert, FlatList, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { ThemedText } from "../components/ThemedText";
import { ScreenScrollView } from "../components/ScreenScrollView";
import { useTheme } from "../hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "../constants/theme";
import {
  getCarrierAvailabilities,
  addCarrierAvailability,
  deleteCarrierAvailability,
  CarrierAvailability,
} from "../utils/storage";

export default function AvailabilityScreen() {
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const [availabilities, setAvailabilities] = useState<CarrierAvailability[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await getCarrierAvailabilities();
      setAvailabilities(data || []);
    } catch (e) {
      console.error("Load error:", e);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadData();
  }, [loadData]));

  const filteredAvailabilities = useMemo(() => {
    if (searchQuery.trim() === "") return availabilities;
    const lowerQuery = searchQuery.toLowerCase().trim();
    return availabilities.filter((a) =>
      a.carrierName.toLowerCase().includes(lowerQuery) ||
      a.currentLocation.toLowerCase().includes(lowerQuery) ||
      a.destinationLocation.toLowerCase().includes(lowerQuery)
    );
  }, [availabilities, searchQuery]);

  const handleDelete = async (item: CarrierAvailability) => {
    const backup = [...availabilities];
    setAvailabilities(prev => prev.filter(a => a.id !== item.id));
    
    const success = await deleteCarrierAvailability(item.id);
    if (!success) {
      setAvailabilities(backup);
      Alert.alert("Hata", "Bildiri silinemedi");
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const expiresAt = Date.now() + 12 * 60 * 60 * 1000;
      const result = await addCarrierAvailability({
        carrierName: name.trim() || "Adı belirtilmedi",
        carrierPhone: phone.trim() || undefined,
        currentLocation: currentLocation.trim() || "Yer belirtilmedi",
        destinationLocation: destinationLocation.trim() || "Yer belirtilmedi",
        notes: notes.trim() || "Bilgi yok",
        capacity: "boş",
        loadType: vehicleType.trim() || undefined,
        expiresAt,
      });

      if (result) {
        setName("");
        setPhone("");
        setVehicleType("");
        setCurrentLocation("");
        setDestinationLocation("");
        setNotes("");
        setModalVisible(false);
        await loadData();
        Alert.alert("Başarılı", "Bildiri kaydedildi");
      } else {
        Alert.alert("Hata", "Bildiri kaydedilemedi");
      }
    } catch (e) {
      console.error("Save error:", e);
      Alert.alert("Hata", "Bir hata oluştu");
    } finally {
      setIsSaving(false);
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
        <Pressable onPress={() => handleDelete(item)} style={s.deleteBtn}>
          <Feather name="trash-2" size={16} color={colors.destructive} />
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
        {item.loadType && (
          <ThemedText type="small" style={{ fontSize: 11, color: colors.textSecondary }}>
            🚚 {item.loadType}
          </ThemedText>
        )}
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

        <View style={[s.searchBar, { backgroundColor: colors.backgroundSecondary, marginBottom: 12 }]}>
          <Feather name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={[s.searchInput, { color: theme.text }]}
            placeholder="Bildiri ara..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            blurOnSubmit={false}
            underlineColorAndroid="transparent"
            textContentType="none"
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery("")}>
              <Feather name="x" size={18} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>

        {filteredAvailabilities.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              {searchQuery ? "Arama sonucu bulunamadı" : "Bildiri yok"}
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={filteredAvailabilities}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={{ gap: 6 }}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={true}
          />
        )}
      </View>

      <Modal visible={modalVisible} animationType="fade" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ width: "85%", maxWidth: 380, borderRadius: BorderRadius.md, backgroundColor: colors.backgroundDefault, paddingHorizontal: 12, paddingVertical: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <ThemedText type="h3">Yeni Bildiri</ThemedText>
              <Pressable onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color={colors.text} />
              </Pressable>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ maxHeight: "80%", borderRadius: BorderRadius.md }}>
              <ScrollView bounces={false} showsVerticalScrollIndicator={false} pinchGestureEnabled={false} keyboardShouldPersistTaps="handled">
                <View style={{ marginBottom: 10 }}>
                  <ThemedText type="small" style={{ fontWeight: "600", marginBottom: 4, fontSize: 12 }}>
                    Ad
                  </ThemedText>
                  <TextInput
                    placeholder="Adı Soyadı"
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor={colors.textSecondary}
                    editable={!isSaving}
                    autoCorrect={false}
                    autoCapitalize="none"
                    style={[s.input, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", color: colors.text }]}
                  />
                </View>

                <View style={{ marginBottom: 10 }}>
                  <ThemedText type="small" style={{ fontWeight: "600", marginBottom: 4, fontSize: 12 }}>
                    Tel
                  </ThemedText>
                  <TextInput
                    placeholder="555-555-5555"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholderTextColor={colors.textSecondary}
                    editable={!isSaving}
                    autoCorrect={false}
                    autoCapitalize="none"
                    style={[s.input, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", color: colors.text, height: 40 }]}
                  />
                </View>

                <View style={{ marginBottom: 10 }}>
                  <ThemedText type="small" style={{ fontWeight: "600", marginBottom: 4, fontSize: 12 }}>
                    Araç
                  </ThemedText>
                  <TextInput
                    placeholder="Kamyon, Pickup, vb"
                    value={vehicleType}
                    onChangeText={setVehicleType}
                    placeholderTextColor={colors.textSecondary}
                    editable={!isSaving}
                    autoCorrect={false}
                    autoCapitalize="none"
                    style={[s.input, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", color: colors.text, height: 40 }]}
                  />
                </View>

                <View style={{ marginBottom: 10 }}>
                  <ThemedText type="small" style={{ fontWeight: "600", marginBottom: 4, fontSize: 12 }}>
                    Bulunduğu Yer
                  </ThemedText>
                  <TextInput
                    placeholder="İstanbul, Ankara, vb"
                    value={currentLocation}
                    onChangeText={setCurrentLocation}
                    placeholderTextColor={colors.textSecondary}
                    editable={!isSaving}
                    autoCorrect={false}
                    autoCapitalize="none"
                    style={[s.input, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", color: colors.text, height: 40 }]}
                  />
                </View>

                <View style={{ marginBottom: 10 }}>
                  <ThemedText type="small" style={{ fontWeight: "600", marginBottom: 4, fontSize: 12 }}>
                    Gideceği Yer
                  </ThemedText>
                  <TextInput
                    placeholder="İzmir, Bursa, vb"
                    value={destinationLocation}
                    onChangeText={setDestinationLocation}
                    placeholderTextColor={colors.textSecondary}
                    editable={!isSaving}
                    autoCorrect={false}
                    autoCapitalize="none"
                    style={[s.input, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", color: colors.text, height: 40 }]}
                  />
                </View>

                <View style={{ marginBottom: 12 }}>
                  <ThemedText type="small" style={{ fontWeight: "600", marginBottom: 4, fontSize: 12 }}>
                    Durum
                  </ThemedText>
                  <TextInput
                    placeholder="Parça yük, tam yük, vb"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={2}
                    placeholderTextColor={colors.textSecondary}
                    editable={!isSaving}
                    autoCorrect={false}
                    autoCapitalize="none"
                    style={[s.input, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", color: colors.text, minHeight: 45 }]}
                  />
                </View>

                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Pressable
                    onPress={() => setModalVisible(false)}
                    disabled={isSaving}
                    style={[s.actionBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", opacity: isSaving ? 0.5 : 1, paddingVertical: 10 }]}
                  >
                    <ThemedText type="small" style={{ fontWeight: "600", fontSize: 12 }}>
                      İptal
                    </ThemedText>
                  </Pressable>
                  <Pressable 
                    onPress={handleSave} 
                    disabled={isSaving}
                    style={[s.actionBtn, { backgroundColor: theme.link, opacity: isSaving ? 0.5 : 1, paddingVertical: 10 }]}
                  >
                    <ThemedText type="small" style={{ fontWeight: "600", color: "white", fontSize: 12 }}>
                      {isSaving ? "Kaydediliyor..." : "Kaydet"}
                    </ThemedText>
                  </Pressable>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </ScreenScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  titleBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  addBtn: { width: 40, height: 40, borderRadius: BorderRadius.sm, justifyContent: "center", alignItems: "center" },
  card: { borderRadius: BorderRadius.sm, padding: 12, borderWidth: 1, borderColor: "rgba(0,0,0,0.03)" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  deleteBtn: { padding: 6 },
  divider: { height: 1, marginBottom: 8 },
  modalWrapper: { flex: 1 },
  modal: { paddingBottom: 100 },
  input: { borderWidth: 1, borderRadius: BorderRadius.sm, borderColor: "rgba(0,0,0,0.05)", paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, minHeight: 44 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: BorderRadius.sm, alignItems: "center", minHeight: 44 },
});
