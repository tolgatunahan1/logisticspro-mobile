import React, { useState } from "react";
import { StyleSheet, View, TextInput, Pressable, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database"; // Veritabanı yazma için
import { auth, db } from "../utils/firebaseAuth"; // auth ve db importu

import { ThemedText } from "../components/ThemedText";
import { ScreenContainer } from "../components/ScreenContainer";
import { useTheme } from "../hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "../constants/theme";
import { RootStackParamList } from "../navigation/RootNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SignupScreen() {
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const navigation = useNavigation<NavigationProp>();

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Hata", "Şifreler eşleşmiyor.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Hata", "Şifre en az 6 karakter olmalı.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Firebase Auth ile kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Realtime Database'e kullanıcı detaylarını yaz (Onay Bekliyor statüsünde)
      await set(ref(db, `users/${user.uid}`), {
        uid: user.uid,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        role: "user",        // Varsayılan rol
        status: "pending",   // ÖNEMLİ: Onay bekliyor
        createdAt: new Date().toISOString(),
      });

      Alert.alert(
        "Kayıt Başarılı",
        "Hesabınız oluşturuldu ve yönetici onayına gönderildi. Onaylandığında giriş yapabileceksiniz.",
        [{ text: "Tamam", onPress: () => navigation.navigate("Login") }]
      );

    } catch (error: any) {
      console.error("Kayıt hatası:", error);
      let msg = "Kayıt oluşturulamadı.";
      if (error.code === "auth/email-already-in-use") msg = "Bu e-posta zaten kullanımda.";
      Alert.alert("Hata", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.headerContainer}>
          <ThemedText type="h1" style={{ textAlign: "center", marginBottom: Spacing.sm }}>Kayıt Ol</ThemedText>
          <ThemedText type="subtitle" style={{ textAlign: "center", color: colors.textSecondary }}>
            Lojistik yönetimine katılın
          </ThemedText>
        </View>

        <View style={styles.formContainer}>
          {/* Ad Soyad */}
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={{ marginBottom: Spacing.xs, fontWeight: '600' }}>Ad Soyad</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.backgroundRoot }]}
              placeholder="Adınız Soyadınız"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Telefon */}
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={{ marginBottom: Spacing.xs, fontWeight: '600' }}>Telefon</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.backgroundRoot }]}
              placeholder="0555 555 55 55"
              placeholderTextColor={colors.textSecondary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* E-posta */}
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={{ marginBottom: Spacing.xs, fontWeight: '600' }}>E-posta</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.backgroundRoot }]}
              placeholder="ornek@email.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Şifre */}
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={{ marginBottom: Spacing.xs, fontWeight: '600' }}>Şifre</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.backgroundRoot }]}
              placeholder="******"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Şifre Tekrar */}
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={{ marginBottom: Spacing.xs, fontWeight: '600' }}>Şifre Tekrar</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.backgroundRoot }]}
              placeholder="******"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <Pressable
            onPress={handleSignup}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: theme.link, opacity: pressed || isLoading ? 0.8 : 1 },
            ]}
          >
            {isLoading ? <ActivityIndicator color="#FFF" /> : <ThemedText type="body" style={{ color: "#FFF", fontWeight: "bold" }}>Kayıt Ol</ThemedText>}
          </Pressable>

          <View style={styles.loginLink}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>Zaten hesabınız var mı? </ThemedText>
            <Pressable onPress={() => navigation.navigate("Login")}>
              <ThemedText type="small" style={{ color: theme.link, fontWeight: "bold" }}>Giriş Yap</ThemedText>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerContainer: { marginTop: Spacing.xl * 2, marginBottom: Spacing.xl },
  formContainer: { gap: Spacing.md, paddingHorizontal: Spacing.lg },
  inputGroup: { gap: 4 },
  input: { height: 50, borderWidth: 1, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, fontSize: 16 },
  button: { height: 50, borderRadius: BorderRadius.md, alignItems: "center", justifyContent: "center", marginTop: Spacing.sm },
  loginLink: { flexDirection: "row", justifyContent: "center", marginTop: Spacing.md },
});